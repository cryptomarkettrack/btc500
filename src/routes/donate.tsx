import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bitcoin,
  Copy,
  Check,
  Coins,
  CircleDollarSign,
  Heart,
  ShieldCheck,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generatePageHead, generateWebPageSchema } from "@/lib/site";

const donateSchema = generateWebPageSchema({
  path: "/donate",
  name: "Donate to BTC500 — Bitcoin Halving Countdown",
  description:
    "Support BTC500 and help keep the Bitcoin halving countdown, cycle tools, and analytics free. Donate with BTC, BEP-20 BTC, ETH, or USDC.",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Donate", path: "/donate" },
  ],
});

export const Route = createFileRoute("/donate")({
  component: Donate,
  head: () =>
    generatePageHead({
      path: "/donate",
      title: "Donate — Support BTC500 | Bitcoin Halving Countdown",
      description:
        "Support BTC500 and help keep the Bitcoin halving countdown, cycle score, and investment tools free for everyone. Donate with BTC, BEP-20 BTC, ETH, or USDC.",
      keywords:
        "donate BTC500, support Bitcoin halving countdown, Bitcoin donation, crypto donation, BTC donation, BEP-20 BTC donation, ETH donation, USDC donation",
      ogTitle: "Donate — Support BTC500",
      ogDescription:
        "Support BTC500 and keep Bitcoin halving tools free. Donate with BTC, BEP-20 BTC, ETH, or USDC.",
      ogImageAlt: "Donate to BTC500 — Support Bitcoin Halving Countdown",
      twitterTitle: "Donate — Support BTC500",
      twitterDescription:
        "Keep Bitcoin halving tools free. Donate with BTC, BEP-20 BTC, ETH, or USDC.",
      schema: donateSchema,
    }),
});

type DonationOption = {
  id: string;
  name: string;
  network: string;
  address: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
  addressPrefix: string;
  explorerLink: string;
  explorerName: string;
};

const donationOptions: DonationOption[] = [
  {
    id: "btc",
    name: "Bitcoin",
    network: "BTC",
    address: "bc1qmq4mlpj09at3hfn93ggaqrflyqyslyguyndudp",
    description: "Native Bitcoin (SegWit) — standard network fees apply.",
    icon: Bitcoin,
    accent: "border-primary/30 bg-gradient-to-br from-primary/10 to-orange-500/5",
    iconBg: "bg-primary/15 text-primary",
    addressPrefix: "bc1",
    explorerLink: "https://mempool.space/address/bc1qmq4mlpj09at3hfn93ggaqrflyqyslyguyndudp",
    explorerName: "Mempool",
  },
  {
    id: "btc-bep20",
    name: "Bitcoin (BEP-20)",
    network: "BNB Smart Chain",
    address: "0x1a2de03B0C61b8bf1dAC6fA9b60D29732fB093d5",
    description: "BEP-20 BTC token on BNB Smart Chain — low fees and fast transfer.",
    icon: Zap,
    accent: "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-amber-500/5",
    iconBg: "bg-yellow-500/15 text-yellow-500",
    addressPrefix: "0x",
    explorerLink: "https://bscscan.com/address/0x1a2de03B0C61b8bf1dAC6fA9b60D29732fB093d5",
    explorerName: "BscScan",
  },
  {
    id: "eth",
    name: "Ethereum",
    network: "ETH · Base",
    address: "0x1a2de03B0C61b8bf1dAC6fA9b60D29732fB093d5",
    description: "Ethereum (ETH) and Base network supported. Send ETH or other ERC-20 tokens here.",
    icon: Coins,
    accent: "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/5",
    iconBg: "bg-blue-500/15 text-blue-500",
    addressPrefix: "0x",
    explorerLink: "https://etherscan.io/address/0x1a2de03B0C61b8bf1dAC6fA9b60D29732fB093d5",
    explorerName: "Etherscan",
  },
  {
    id: "usdc",
    name: "USDC",
    network: "Base",
    address: "0x1a2de03B0C61b8bf1dAC6fA9b60D29732fB093d5",
    description: "USD Coin (USDC) — send on the Base network for low fees.",
    icon: CircleDollarSign,
    accent: "border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-cyan-500/5",
    iconBg: "bg-sky-500/15 text-sky-500",
    addressPrefix: "0x",
    explorerLink: "https://basescan.org/address/0x1a2de03B0C61b8bf1dAC6fA9b60D29732fB093d5",
    explorerName: "BaseScan",
  },
];

function Donate() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (option: DonationOption) => {
    try {
      await navigator.clipboard.writeText(option.address);
      setCopiedId(option.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = option.address;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(option.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-10 sm:pt-16">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Support BTC500</h1>
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            BTC500 is free, open, and ad-light. If you find the halving countdown, cycle tools, or
            analytics useful, a small donation helps keep everything running.
          </p>
        </header>

        {/* Disclaimer card */}
        <Card className="mb-8 border-border/60 bg-card/50">
          <CardContent className="flex items-start gap-3 pt-6">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Important:</span> Only send funds to
              the addresses listed on this page. Double-check the address and network before
              confirming any transaction. Crypto transfers are irreversible.
            </div>
          </CardContent>
        </Card>

        {/* Donation methods */}
        <div className="grid gap-6 sm:grid-cols-2">
          {donationOptions.map((option) => {
            const Icon = option.icon;
            const isCopied = copiedId === option.id;
            const isNativeBtc = option.id === "btc";
            return (
              <Card
                key={option.id}
                className={`border transition-all hover:shadow-md ${option.accent}`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${option.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className="text-lg">{option.name}</CardTitle>
                      <CardDescription className="text-xs">{option.network}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {option.description}
                  </p>

                  {/* Address display */}
                  <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                    <div className="break-all font-mono text-[11px] leading-relaxed text-foreground/90">
                      {option.address}
                    </div>
                  </div>

                  {/* Copy button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(option)}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                      isCopied
                        ? "bg-green-500/15 text-green-500"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Address
                      </>
                    )}
                  </button>

                  {/* Explorer link */}
                  <a
                    href={option.explorerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs transition-colors ${
                      isNativeBtc
                        ? "text-primary hover:text-primary/80"
                        : "text-blue-500 hover:text-blue-400"
                    }`}
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on {option.explorerName}
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Note about networks */}
        <Card className="mt-8 border-border/60 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant="outline" className="border-primary/40 text-primary px-2 py-0.5">
                Network Guide
              </Badge>
              Which network should I use?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">Bitcoin (BTC)</span> — Send native BTC
              to the SegWit address. No memo or tag needed.
            </div>
            <div>
              <span className="font-semibold text-foreground">Bitcoin (BEP-20)</span> — Send BTC as
              a BEP-20 token on BNB Smart Chain for low fees and fast transfers.
            </div>
            <div>
              <span className="font-semibold text-foreground">Ethereum (ETH)</span> — Send ETH on
              the Ethereum network, or use Base for lower fees. The same address works on both
              networks.
            </div>
            <div>
              <span className="font-semibold text-foreground">USDC</span> — Send USDC on the Base
              network to keep gas costs minimal.
            </div>
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Thank you for your support. Every donation helps keep BTC500 free and running.
        </p>
      </main>
    </div>
  );
}
