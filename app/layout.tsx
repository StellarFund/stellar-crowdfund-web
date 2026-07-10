import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";
import { WalletProvider } from "@/hooks/useWallet";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { NetworkSelector } from "@/components/wallet/NetworkSelector";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Stellar Crowdfund | Fund and build the future on Stellar",
  description:
    "Create crowdfunding campaigns on Stellar, back projects you believe in, track milestones, and get automatic refunds if a campaign fails.",
};

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/campaign/new", label: "Start a Campaign" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/backed", label: "Backed" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-background font-sans text-foreground antialiased`}
      >
        <WalletProvider>
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-sm text-white">
                  S
                </span>
                Stellar Crowdfund
              </Link>

              <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="transition hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <NetworkSelector />
                </div>
                <ConnectButton />
              </div>
            </div>

            <nav className="flex items-center gap-4 overflow-x-auto border-t border-border px-4 py-2 text-sm font-medium text-muted md:hidden">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="shrink-0 transition hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-border">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p>Built on Stellar. Part of the StellarFund org.</p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://github.com/StellarFund/stellar-crowdfund-web"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-foreground"
                >
                  Web
                </a>
                <a
                  href="https://github.com/StellarFund/stellar-crowdfund-contracts"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-foreground"
                >
                  Contracts
                </a>
                <a
                  href="https://github.com/StellarFund/stellar-crowdfund-api-docs"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-foreground"
                >
                  API + Docs
                </a>
              </div>
            </div>
          </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
