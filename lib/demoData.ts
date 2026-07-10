import type { Campaign, Contribution, Milestone, PlatformStats, Token } from "@/types";

/**
 * Local demo dataset served by lib/contracts.ts whenever
 * NEXT_PUBLIC_REGISTRY_CONTRACT_ID is unset, i.e. no registry contract has
 * been deployed yet for the target network. Keeps every page fully
 * functional during development without depending on the contracts repo.
 */

const DAY_MS = 1000 * 60 * 60 * 24;
const now = () => Date.now();
const daysFromNow = (days: number) => new Date(now() + days * DAY_MS).toISOString();
const daysAgo = (days: number) => new Date(now() - days * DAY_MS).toISOString();

export const XLM: Token = {
  address: "native",
  symbol: "XLM",
  name: "Stellar Lumens",
  decimals: 7,
  isNative: true,
};

const USDC: Token = {
  address: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 7,
  isNative: false,
};

const DEMO_ADDRESSES = [
  "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
  "GA2HGBJIJKI6O4XCEVNBH3ANGA3ETIVK5XAI7B4W5H4SO7VNMFN2IPPI",
  "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
  "GCKFBEIYTKP6RJGVXBTGA5N5R2LVX7VN37VUQU6ELWG5JJC2TAUCHNSY",
  "GDXQB3OMMQ6MGG43PWFBZWBFKBBDUZIVSUDACZFDBIYDPWZJA4UAAETIN",
  "GAUJETIZVEP2NRYLUESJ3LS66NVCEGMON4UDLYCTHKO4KHPWYIF67HFM",
  "GB6234RRPDMLB4KFF7DHV6X5MPFTRQF3H4CIA5W22MFH7YZ4A5G7YMOO",
];

function contributionsFor(campaignId: string, count: number, token: Token): Contribution[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${campaignId}-contribution-${i}`,
    campaignId,
    backer: DEMO_ADDRESSES[i % DEMO_ADDRESSES.length],
    amount: Math.round((50 + Math.random() * 950) * (token.isNative ? 10 : 1)) / 10,
    txHash: `${campaignId}${i}`.padEnd(64, "a"),
    createdAt: daysAgo(count - i),
  }));
}

function milestonesFor(
  campaignId: string,
  goal: number,
  deadline: string,
  specs: { title: string; description: string; percentage: number; status: Milestone["status"]; proofUrl?: string }[]
): Milestone[] {
  return specs.map((spec, i) => ({
    id: `${campaignId}-milestone-${i}`,
    campaignId,
    index: i,
    title: spec.title,
    description: spec.description,
    percentage: spec.percentage,
    amount: Math.round(goal * (spec.percentage / 100)),
    deadline,
    status: spec.status,
    proofUrl: spec.proofUrl,
    proofSubmittedAt: spec.status !== "pending" ? daysAgo(10 - i * 2) : undefined,
    releasedAt: spec.status === "released" ? daysAgo(5 - i) : undefined,
  }));
}

interface CampaignSeed {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  websiteUrl?: string;
  creator: string;
  token: Token;
  goal: number;
  raised: number;
  backerCount: number;
  deadlineDays: number;
  createdDaysAgo: number;
  status: Campaign["status"];
  milestoneSpecs: { title: string; description: string; percentage: number; status: Milestone["status"]; proofUrl?: string }[];
}

const seeds: CampaignSeed[] = [
  {
    id: "orbitpay-remittance-rails",
    title: "OrbitPay: Instant Cross-Border Remittances",
    description:
      "OrbitPay is building a non-custodial remittance corridor on Stellar so migrant workers can send money home in seconds instead of days, at a fraction of traditional wire fees. Funds go toward audited Soroban payment contracts, an on/off-ramp partner integration in three corridors, and a mobile app for senders and recipients.",
    category: "DeFi",
    imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1200&q=80",
    websiteUrl: "https://orbitpay.example.com",
    creator: DEMO_ADDRESSES[0],
    token: XLM,
    goal: 45000,
    raised: 31250,
    backerCount: 214,
    deadlineDays: 18,
    createdDaysAgo: 21,
    status: "active",
    milestoneSpecs: [
      { title: "Audited payment contract", description: "Ship and get a third-party audit of the core escrow/payment contract.", percentage: 30, status: "released" },
      { title: "Corridor integration", description: "Integrate with an on/off-ramp partner for the US-Mexico corridor.", percentage: 35, status: "approved", proofUrl: "https://orbitpay.example.com/proof/corridor" },
      { title: "Mobile app beta", description: "Launch closed beta of the sender/recipient mobile app.", percentage: 35, status: "pending" },
    ],
  },
  {
    id: "verdant-carbon-registry",
    title: "Verdant: On-Chain Carbon Credit Registry",
    description:
      "A transparent, tamper-proof registry for verified carbon offset credits, tokenized on Stellar and retired on-chain to prevent double counting. This campaign funds registry smart contracts, integration with two verification bodies, and a public explorer for retired credits.",
    category: "Public Good",
    imageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200&q=80",
    websiteUrl: "https://verdant.example.org",
    creator: DEMO_ADDRESSES[1],
    token: XLM,
    goal: 60000,
    raised: 60000,
    backerCount: 389,
    deadlineDays: -2,
    createdDaysAgo: 40,
    status: "funded",
    milestoneSpecs: [
      { title: "Registry contract", description: "Deploy the credit issuance and retirement contract.", percentage: 25, status: "released" },
      { title: "Verifier integration", description: "Integrate with Verra and Gold Standard data feeds.", percentage: 40, status: "released" },
      { title: "Public explorer", description: "Ship a public explorer for retired credits.", percentage: 35, status: "submitted", proofUrl: "https://verdant.example.org/proof/explorer" },
    ],
  },
  {
    id: "lumen-league-esports",
    title: "Lumen League: Player-Owned Esports Tournaments",
    description:
      "Lumen League lets tournament organizers escrow prize pools on Stellar so players are guaranteed payout the moment a match result is confirmed on-chain. Funding covers the bracket + escrow contract, an organizer dashboard, and our first sponsored $10k tournament.",
    category: "Gaming",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
    creator: DEMO_ADDRESSES[2],
    token: XLM,
    goal: 20000,
    raised: 6400,
    backerCount: 58,
    deadlineDays: 25,
    createdDaysAgo: 5,
    status: "active",
    milestoneSpecs: [
      { title: "Escrow + bracket contract", description: "Deploy the prize escrow and bracket resolution contract.", percentage: 40, status: "pending" },
      { title: "Organizer dashboard", description: "Ship a web dashboard for tournament organizers.", percentage: 30, status: "pending" },
      { title: "Launch tournament", description: "Run the first sponsored $10k community tournament.", percentage: 30, status: "pending" },
    ],
  },
  {
    id: "openledger-microgrants",
    title: "OpenLedger Microgrants for Student Developers",
    description:
      "A recurring microgrant fund for students shipping open-source Stellar tooling. This round funds a review committee stipend, a grant-distribution contract with milestone-gated releases, and the first cohort of 25 grantees.",
    category: "Education",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",
    websiteUrl: "https://openledger.example.dev",
    creator: DEMO_ADDRESSES[3],
    token: USDC,
    goal: 15000,
    raised: 15000,
    backerCount: 142,
    deadlineDays: -40,
    createdDaysAgo: 95,
    status: "completed",
    milestoneSpecs: [
      { title: "Distribution contract", description: "Deploy the milestone-gated grant distribution contract.", percentage: 20, status: "released" },
      { title: "Cohort selection", description: "Review committee selects the first cohort of 25 grantees.", percentage: 20, status: "released" },
      { title: "Grant disbursement", description: "Disburse grants to all 25 selected students.", percentage: 60, status: "released" },
    ],
  },
  {
    id: "solarnode-hardware",
    title: "SolarNode: Solar-Powered Stellar Validator Kits",
    description:
      "SolarNode ships an off-grid, solar-powered validator kit so node operators in low-connectivity regions can keep the network decentralized. Funds cover hardware design finalization, a first production run of 100 units, and a firmware update contract for OTA releases.",
    category: "Hardware",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80",
    creator: DEMO_ADDRESSES[4],
    token: XLM,
    goal: 80000,
    raised: 9800,
    backerCount: 41,
    deadlineDays: -5,
    createdDaysAgo: 60,
    status: "expired",
    milestoneSpecs: [
      { title: "Design finalization", description: "Finalize PCB and enclosure design for production.", percentage: 25, status: "rejected", proofUrl: "https://solarnode.example.com/proof/design" },
      { title: "Production run", description: "Manufacture the first run of 100 validator kits.", percentage: 50, status: "pending" },
      { title: "OTA firmware", description: "Ship the firmware update contract for over-the-air releases.", percentage: 25, status: "pending" },
    ],
  },
  {
    id: "prism-generative-art",
    title: "Prism: Generative Art Minted Live On-Chain",
    description:
      "Prism is a generative art platform where every piece is rendered and minted live on Stellar as the mint transaction confirms, so the chain itself becomes part of the artwork's seed. Funding covers the on-chain renderer contract, artist royalty splits, and the genesis collection launch.",
    category: "Art",
    imageUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&q=80",
    creator: DEMO_ADDRESSES[5],
    token: XLM,
    goal: 12000,
    raised: 2100,
    backerCount: 19,
    deadlineDays: -12,
    createdDaysAgo: 30,
    status: "cancelled",
    milestoneSpecs: [
      { title: "Renderer contract", description: "Deploy the on-chain seed + renderer contract.", percentage: 50, status: "pending" },
      { title: "Genesis collection", description: "Launch the 500-piece genesis collection.", percentage: 50, status: "pending" },
    ],
  },
  {
    id: "harborwatch-supplychain",
    title: "HarborWatch: Verifiable Cold-Chain Logistics",
    description:
      "HarborWatch anchors IoT temperature-sensor attestations for perishable cargo directly on Stellar, giving importers cryptographic proof a shipment never broke cold-chain. Funding covers the attestation contract, sensor-gateway firmware, and a pilot with two shipping partners.",
    category: "DeFi",
    imageUrl: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1200&q=80",
    websiteUrl: "https://harborwatch.example.io",
    creator: DEMO_ADDRESSES[6],
    token: XLM,
    goal: 35000,
    raised: 18700,
    backerCount: 97,
    deadlineDays: 9,
    createdDaysAgo: 12,
    status: "active",
    milestoneSpecs: [
      { title: "Attestation contract", description: "Deploy the sensor-attestation anchoring contract.", percentage: 30, status: "released" },
      { title: "Gateway firmware", description: "Ship firmware connecting cold-chain sensors to the gateway.", percentage: 30, status: "submitted", proofUrl: "https://harborwatch.example.io/proof/firmware" },
      { title: "Partner pilot", description: "Run a pilot shipment with two logistics partners.", percentage: 40, status: "pending" },
    ],
  },
];

export const demoCampaigns: Campaign[] = seeds.map((seed) => ({
  id: seed.id,
  contractAddress: `C${seed.id.replace(/-/g, "").slice(0, 55).toUpperCase().padEnd(55, "X")}`,
  title: seed.title,
  description: seed.description,
  imageUrl: seed.imageUrl,
  websiteUrl: seed.websiteUrl,
  category: seed.category,
  creator: seed.creator,
  token: seed.token,
  goal: seed.goal,
  raised: seed.raised,
  backerCount: seed.backerCount,
  deadline: daysFromNow(seed.deadlineDays),
  createdAt: daysAgo(seed.createdDaysAgo),
  status: seed.status,
  milestones: milestonesFor(seed.id, seed.goal, daysFromNow(seed.deadlineDays), seed.milestoneSpecs),
}));

export const demoContributions: Record<string, Contribution[]> = Object.fromEntries(
  seeds.map((seed) => [seed.id, contributionsFor(seed.id, Math.min(seed.backerCount, 12), seed.token)])
);

export function getDemoPlatformStats(): PlatformStats {
  return {
    totalCampaigns: demoCampaigns.length,
    totalRaised: demoCampaigns.reduce((sum, c) => sum + c.raised, 0),
    totalBackers: demoCampaigns.reduce((sum, c) => sum + c.backerCount, 0),
  };
}
