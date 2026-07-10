import Link from "next/link";
import { getPlatformStats, listCampaigns } from "@/lib/contracts";
import { formatAmount } from "@/lib/format";
import { CampaignGrid } from "@/components/campaign/CampaignGrid";

const STEPS = [
  {
    title: "Create",
    description: "Launch a campaign with a funding goal, deadline, and milestone plan in minutes.",
  },
  {
    title: "Back",
    description: "Contribute XLM or a supported token straight from your Freighter wallet.",
  },
  {
    title: "Milestones",
    description: "Creators submit proof of progress for each milestone as they hit it.",
  },
  {
    title: "Release",
    description: "Approved milestones release funds; failed campaigns refund every backer automatically.",
  },
];

export default async function Home() {
  const [stats, campaigns] = await Promise.all([
    getPlatformStats(),
    listCampaigns({ sort: "most-funded" }),
  ]);

  const featured = campaigns
    .filter((c) => c.status === "active" || c.status === "funded")
    .slice(0, 3);

  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden bg-hero-glow">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            Built on Stellar &amp; Soroban
          </span>
          <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Fund and build the future on Stellar
          </h1>
          <p className="max-w-xl text-balance text-base text-muted sm:text-lg">
            Launch a milestone-based crowdfunding campaign, back the projects you believe in, and
            get automatic refunds if a campaign doesn&apos;t reach its goal — all secured by
            Soroban smart contracts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/campaign/new"
              className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
            >
              Start a Campaign
            </Link>
            <Link
              href="/explore"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:border-brand-400"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          <StatTile label="Campaigns Launched" value={formatAmount(stats.totalCampaigns)} />
          <StatTile label="Total Raised" value={formatAmount(stats.totalRaised)} suffix="XLM" />
          <StatTile label="Backers" value={formatAmount(stats.totalBackers)} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Featured campaigns</h2>
            <p className="mt-1 text-sm text-muted">Momentum on Stellar right now.</p>
          </div>
          <Link href="/explore" className="text-sm font-medium text-brand-300 transition hover:text-brand-200">
            View all →
          </Link>
        </div>
        <CampaignGrid
          campaigns={featured}
          emptyTitle="No featured campaigns yet"
          emptyDescription="Be the first to launch a campaign on Stellar Crowdfund."
        />
      </section>

      <section className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-foreground">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-border bg-surface p-6">
                <span className="text-sm font-semibold text-brand-400">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Ready to bring your project to life?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
          Set a goal, define your milestones, and let backers fund your progress every step of the way.
        </p>
        <Link
          href="/campaign/new"
          className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
        >
          Start a Campaign
        </Link>
      </section>
    </div>
  );
}

function StatTile({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-8 text-center">
      <p className="text-3xl font-bold text-foreground">
        {value}
        {suffix && <span className="ml-1 text-lg font-medium text-muted">{suffix}</span>}
      </p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
