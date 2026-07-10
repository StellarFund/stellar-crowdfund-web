import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  setAllowed,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import type { StellarNetwork } from "@/types";

export class FreighterNotInstalledError extends Error {
  constructor() {
    super("Freighter wallet extension is not installed.");
    this.name = "FreighterNotInstalledError";
  }
}

export async function isFreighterInstalled(): Promise<boolean> {
  const { isConnected: connected, error } = await isConnected();
  if (error) return false;
  return connected;
}

export async function connectFreighter(): Promise<{
  publicKey: string;
  network: StellarNetwork;
}> {
  const installed = await isFreighterInstalled();
  if (!installed) throw new FreighterNotInstalledError();

  const allowed = await setAllowed();
  if (allowed.error) throw new Error(allowed.error);

  const access = await requestAccess();
  if (access.error) throw new Error(access.error);

  const network = await getStellarNetwork();
  return { publicKey: access.address, network };
}

export async function getFreighterAddress(): Promise<string | null> {
  const { address, error } = await getAddress();
  if (error || !address) return null;
  return address;
}

export async function getStellarNetwork(): Promise<StellarNetwork> {
  const { network, error } = await getNetwork();
  if (error) throw new Error(error);
  return network.toLowerCase().includes("public") ? "public" : "testnet";
}

export async function signTransaction(
  xdr: string,
  opts: { networkPassphrase: string; address: string }
): Promise<string> {
  const { signedTxXdr, error } = await freighterSignTransaction(xdr, opts);
  if (error) throw new Error(error);
  return signedTxXdr;
}
