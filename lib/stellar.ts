import {
  Account,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  rpc,
  type xdr,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@/lib/freighter";
import type { StellarNetwork } from "@/types";

export const NETWORK: StellarNetwork =
  (process.env.NEXT_PUBLIC_STELLAR_NETWORK as StellarNetwork) || "testnet";

export const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org";

export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";

export const REGISTRY_CONTRACT_ID = process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID || "";

export function getNetworkPassphrase(): string {
  return NETWORK === "public" ? Networks.PUBLIC : Networks.TESTNET;
}

let sorobanServer: rpc.Server | null = null;

export function getSorobanServer(): rpc.Server {
  if (!sorobanServer) {
    sorobanServer = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: SOROBAN_RPC_URL.startsWith("http://") });
  }
  return sorobanServer;
}

/**
 * Simulates a read-only contract invocation and decodes the result.
 * Used for view calls (list campaigns, get campaign, platform stats, ...).
 */
export async function readContract<T>(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = []
): Promise<T> {
  const server = getSorobanServer();
  const contract = new Contract(contractId);
  // A read-only simulation doesn't submit or need a funded/existing
  // account, so a throwaway account with sequence 0 is sufficient.
  const sourceAccount = new Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0"
  );
  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  if (!sim.result) {
    throw new Error(`Simulation for "${method}" returned no result.`);
  }
  return scValToNative(sim.result.retval) as T;
}

/**
 * Builds, simulates, signs (via Freighter), submits, and polls a
 * write contract invocation to completion. Used for backing a
 * campaign, submitting milestone proof, and claiming refunds.
 */
export async function invokeContract(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  sourcePublicKey: string,
  onStage?: (stage: "building" | "signing" | "submitting") => void
): Promise<string> {
  const server = getSorobanServer();
  const contract = new Contract(contractId);

  onStage?.("building");
  const sourceAccount = await server.getAccount(sourcePublicKey);
  const built = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(60)
    .build();

  const prepared = await server.prepareTransaction(built);

  onStage?.("signing");
  const signedXdr = await signTransaction(prepared.toXDR(), {
    networkPassphrase: getNetworkPassphrase(),
    address: sourcePublicKey,
  });
  const signedTx = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase());

  onStage?.("submitting");
  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status === "ERROR") {
    throw new Error("Transaction submission failed.");
  }

  const result = await server.pollTransaction(sendResult.hash, {
    attempts: 15,
    sleepStrategy: rpc.BasicSleepStrategy,
  });
  if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`Transaction ${sendResult.hash} did not succeed (status: ${result.status}).`);
  }

  return sendResult.hash;
}

export function amountToScVal(amount: number, decimals = 7): xdr.ScVal {
  const scaled = BigInt(Math.round(amount * 10 ** decimals));
  return nativeToScVal(scaled, { type: "i128" });
}

export function addressToScVal(address: string): xdr.ScVal {
  return nativeToScVal(address, { type: "address" });
}

export function stringToScVal(value: string): xdr.ScVal {
  return nativeToScVal(value, { type: "string" });
}

export function stellarExpertTxUrl(txHash: string): string {
  const cluster = NETWORK === "public" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${cluster}/tx/${txHash}`;
}

export function stellarExpertAccountUrl(address: string): string {
  const cluster = NETWORK === "public" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${cluster}/account/${address}`;
}

export function stellarExpertContractUrl(contractId: string): string {
  const cluster = NETWORK === "public" ? "public" : "testnet";
  return `https://stellar.expert/explorer/${cluster}/contract/${contractId}`;
}
