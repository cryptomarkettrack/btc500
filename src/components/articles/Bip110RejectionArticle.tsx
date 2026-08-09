import { motion } from "framer-motion";
import { BookOpen, Clock } from "lucide-react";

interface ArticleProps {
  title: string;
  date: string;
  readTime: string;
}

export function Bip110RejectionArticle({ title, date, readTime }: ArticleProps) {
  return (
    <>
      {/* Article header */}
      <motion.header
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>Article</span>
          <span>·</span>
          <Clock className="h-4 w-4" />
          <span>{readTime}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      </motion.header>

      {/* Article content */}
      <motion.article
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="prose prose-lg max-w-none"
      >
        <div className="space-y-6 text-foreground/90 leading-relaxed">
          <p className="lead">
            Bitcoin just delivered another reminder of how hard it is to change the protocol. The{" "}
            <strong>BIP-110 rejection</strong> — more precisely, the failure of the Reduced Data
            Temporary Softfork to win meaningful network consensus — became clear over the weekend
            of August 8–9, 2026, when mandatory signaling began and a tiny minority chain stalled
            almost immediately.
          </p>

          <p>
            For most holders, the main Bitcoin chain kept producing blocks as usual. For Bitcoin
            governance, the episode is larger than a single soft fork. It shows how Bitcoin upgrades
            and proposals live or die: not by marketing, not by node counts alone, and not by a
            loud social-media campaign, but by economic consensus.
          </p>

          {/* Hero image */}
          <figure
            className="overflow-hidden rounded-[24px] border border-border/60 bg-card"
            style={{ margin: "32px 0" }}
          >
            <img
              src="/articles/bip-110/bip-110-rejection.png"
              alt="BIP-110 Reduced Data Temporary Softfork failed — Bitcoin mainnet continued while minority chain stalled after two blocks"
              width={1536}
              height={1024}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
            <figcaption
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--border)",
                fontSize: 13,
                color: "var(--muted-foreground)",
                background: "var(--card)",
              }}
            >
              BIP-110 summary: mainnet continued, miner support stayed near 2.5%, and the minority
              chain stalled after roughly two blocks.
            </figcaption>
          </figure>

          <div className="highlight-box">
            <p>
              <strong>Key takeaway:</strong> BIP-110 did not change Bitcoin’s consensus rules. The
              economic majority stayed on the existing chain, miner signaling never approached the
              proposal’s 55% threshold, and the breakaway BIP-110 chain produced only a couple of
              blocks before effectively stopping.
            </p>
          </div>

          <h2>What Is BIP-110?</h2>
          <p>
            Bitcoin Improvement Proposal BIP-110, formally titled the{" "}
            <strong>Reduced Data Temporary Softfork</strong>, was a proposed soft fork designed to
            temporarily limit how much arbitrary data can be embedded in Bitcoin transactions.
          </p>

          <p>
            Supporters framed it as a defense of Bitcoin’s monetary purpose. After the rise of
            inscription-style techniques and other non-financial data uses, they argued that large
            data payloads burdened node operators, competed with payments for block space, and
            distracted development energy away from Bitcoin as money.
          </p>

          <p>In practical terms, the proposal aimed to:</p>

          <ul>
            <li>Temporarily restrict large arbitrary data fields at the consensus layer</li>
            <li>Limit certain output sizes, data pushes, and Taproot-related data patterns</li>
            <li>Apply those limits for roughly one year (about 52,416 blocks)</li>
            <li>
              Grandfather pre-existing UTXOs so older coins would generally remain spendable under
              the old rules
            </li>
          </ul>

          <p>
            The problem it tried to solve was not abstract. Since 2022–2023, debates over Ordinals,
            inscriptions, BRC-20-style tokens, Runes, and large OP_RETURN-style data have divided the
            community. One camp sees these uses as fee-paying free speech on a neutral network. The
            other sees them as spam that raises costs and dilutes Bitcoin’s identity.
          </p>

          <p>
            BIP-110 was one attempt to settle that fight with a temporary consensus rule change
            rather than with relay policy alone.
          </p>

          <div className="data-point">
            <strong>Important status note:</strong> Publication of a BIP does not mean Bitcoin has
            adopted it. A completed specification is a proposal document, not a network upgrade.
          </div>

          <h2>Why Was BIP-110 Rejected?</h2>
          <p>
            There is no single central “vote count” that officially rejects a Bitcoin proposal. In
            practice, BIP-110 failed because it never secured the multi-constituency consensus
            Bitcoin requires. Several overlapping reasons explain why BIP-110 was rejected by the
            broader network.
          </p>

          <h3>1. Technical concerns</h3>
          <p>
            Critics argued that BIP-110 was not a clean, low-risk change. Soft forks that reject
            previously valid transaction patterns can create edge cases for wallets, contracts, and
            advanced Taproot constructions. Some developers also argued the proposal would not fully
            stop data embedding — only push it into different encodings — while still adding
            complexity and temporary rule dualism.
          </p>

          <p>
            Another concern was activation design. BIP-110 used a relatively low 55% miner-signaling
            threshold for early lock-in and included a mandatory signaling phase in which
            BIP-110-enforcing nodes would reject non-signaling blocks. That structure raised the
            probability of a messy split if economic consensus was missing.
          </p>

          <h3>2. Community disagreement</h3>
          <p>
            The community never aligned. Parts of the Bitcoin Knots and anti-spam node operator
            community supported the idea. Bitcoin Core did not adopt the proposal as a
            network-wide upgrade path. Major mining pools largely declined to signal. Influential
            public voices — including corporate Bitcoin advocates and long-time protocol figures —
            opposed changing consensus rules to police transaction content they considered
            fee-paying and valid under current rules.
          </p>

          <p>
            That disagreement mattered more than any single technical clause. Bitcoin upgrades and
            proposals succeed only when developers, miners, node operators, exchanges, custodians,
            and users broadly converge on the same chain rules.
          </p>

          <h3>3. Security, centralization, and complexity risks</h3>
          <p>Opponents repeatedly raised three risk categories:</p>

          <ul>
            <li>
              <strong>Chain-split risk:</strong> Without broad economic buy-in, a user-activated
              soft fork can isolate enforcing nodes instead of upgrading the network.
            </li>
            <li>
              <strong>Precedent risk:</strong> Changing consensus to invalidate some currently valid,
              fee-paying transactions looked to many like a form of content-based rule-making.
            </li>
            <li>
              <strong>Complexity risk:</strong> Temporary rules force wallets, contracts, and
              infrastructure to reason about two regimes — during the deployment and after expiry —
              which is the opposite of Bitcoin’s usual preference for predictable, long-lived rules.
            </li>
          </ul>

          <div className="data-point">
            <strong>Signaling reality check:</strong> Public reporting around the mandatory window
            put miner support roughly in the 0.3%–2.6% range — far below the 55% threshold needed
            for early lock-in, and nowhere near the supermajority historically associated with
            successful soft forks.
          </div>

          <h2>How Bitcoin Governance Works</h2>
          <p>
            The Bitcoin governance process is deliberately slow, informal, and multi-layered. There
            is no foundation CEO who can ship a protocol change, and no tokenholder vote that can
            force one.
          </p>

          <p>In simplified form, Bitcoin upgrades usually move through these stages:</p>

          <ul>
            <li>
              <strong>Idea and draft:</strong> A developer or group writes a BIP describing the
              motivation, design, and activation path.
            </li>
            <li>
              <strong>Review:</strong> Other developers critique security, incentives, and edge
              cases on mailing lists, code review, and public discussion.
            </li>
            <li>
              <strong>Implementation:</strong> Compatible software is written and tested. Users and
              miners choose which software to run.
            </li>
            <li>
              <strong>Economic consensus:</strong> Miners, exchanges, custodians, businesses, and
              users converge on which rules are “Bitcoin.”
            </li>
            <li>
              <strong>Activation:</strong> Only then does a soft fork become a real network upgrade
              rather than a minority experiment.
            </li>
          </ul>

          <p>
            Consensus is hard because every constituency can block change. Developers can refuse to
            merge code. Miners can refuse to signal or mine under new rules. Node operators can
            refuse to enforce them. Markets can refuse to price a minority fork. That friction is
            not a bug in Bitcoin’s design. It is the design.
          </p>

          <p>
            Bitcoin’s conservative approach exists for a reason. Once rules change, trust assumptions
            change with them. Holders, exchanges, and long-lived contracts need to know that valid
            today will still mean valid tomorrow unless an overwhelming case for change exists.
          </p>

          <div className="highlight-box">
            <p>
              <strong>Governance lesson:</strong> Bitcoin is not governed by the loudest timeline or
              the largest temporary node share. It is governed by who runs economically relevant
              software and which chain the market treats as Bitcoin.
            </p>
          </div>

          <h2>Market and Community Reaction</h2>
          <p>
            Sentiment around the BIP-110 rejection split along predictable lines.
          </p>

          <p>
            Many developers and protocol conservatives treated the outcome as confirmation that
            consensus-layer content restrictions remain extremely hard to pass. From that
            perspective, the proposal’s failure reaffirmed neutrality and caution.
          </p>

          <p>
            Anti-spam advocates saw something different: a missed opportunity to push back against
            non-monetary data and rising long-term node costs. For them, the technical and cultural
            problem remains open even if this particular soft fork did not stick.
          </p>

          <p>
            Traders and market participants mostly cared about one operational question: does this
            create a meaningful chain split or exchange-listed fork coin? Early evidence suggested
            no. The BIP-110 minority chain lacked meaningful hashrate, major exchange support, and
            durable liquidity. Reporting after the mandatory window opened indicated the breakaway
            chain mined only about two blocks and then stalled while the main chain continued
            normally.
          </p>

          <p>
            Social discussion followed the usual Bitcoin pattern: technical threads about activation
            mechanics, governance arguments about censorship versus neutrality, and practical
            warnings for users running BIP-110-enforcing node software who might have fallen out of
            sync with mainnet.
          </p>

          <h2>What the BIP-110 Rejection Means</h2>
          <p>
            The BIP-110 rejection is a signal, not a full resolution of the data debate.
          </p>

          <h3>A signal for future proposals</h3>
          <p>
            Future Bitcoin upgrades and proposals will likely face the same test: broad economic
            alignment before aggressive activation. Low thresholds and mandatory enforcement without
            market buy-in are more likely to produce minority chains than network-wide rule changes.
          </p>

          <h3>Innovation versus stability</h3>
          <p>
            Bitcoin can still innovate — through soft forks that do earn consensus, through second
            layers, and through policy-level tooling. What it resists is rapid consensus mutation
            driven by cultural conflict. Stability won this round. That does not mean every future
            proposal will fail. It means the bar remains high.
          </p>

          <h3>Long-term implications</h3>
          <p>
            Long term, the episode reinforces three structural facts:
          </p>

          <ul>
            <li>Bitcoin’s base layer is hard to re-politicize through short campaigns</li>
            <li>
              Node software choice matters operationally, but markets still define which chain is
              economically relevant
            </li>
            <li>
              Debates over blockspace use will continue, likely through policy, market fees, and
              revised proposals rather than one decisive culture-war soft fork
            </li>
          </ul>

          <h2>
            What This Means for BTC<span className="text-primary">500</span> Investors
          </h2>
          <p>
            For cycle investors following the BTC
            <span className="text-primary">500</span> framework — accumulate roughly 500 days before
            a halving, hold through expansion, and sell about 500 days after — protocol theater is
            rarely the main event. Custody, liquidity, and position discipline usually matter more
            than weekend fork headlines.
          </p>

          <div className="strategy-box">
            <h3>The Core Strategy Still Holds</h3>
            <div className="formula">
              BUY: 500 days before halving
              <br />
              HOLD: through the cycle
              <br />
              SELL: 500 days after halving
            </div>
            <p>
              Governance drama can create noise. Cycle process is still the edge.
            </p>
          </div>

          <p>
            The practical investor takeaway from BIP-110 is operational, not philosophical:
          </p>

          <ul>
            <li>Confirm your wallet or exchange follows Bitcoin mainnet consensus</li>
            <li>
              If you run custom node software, know exactly which rules it enforces before a soft
              fork window opens
            </li>
            <li>
              Treat minority-chain coins, if any appear, as high-risk experiment assets — not as a
              free bonus that is safe to sell casually without understanding replay risk
            </li>
            <li>
              Do not let governance noise force emotional trades outside your cycle plan
            </li>
          </ul>

          <h2>What Happens Next?</h2>
          <p>
            Several paths remain open after the BIP-110 rejection:
          </p>

          <ul>
            <li>
              <strong>Possible revisions:</strong> Supporters may refine the idea, raise the quality
              of technical review, or pursue a less aggressive activation path.
            </li>
            <li>
              <strong>Alternative proposals:</strong> Some discussions already point to stricter or
              differently designed anti-data proposals, while others prefer non-consensus approaches
              such as relay policy changes.
            </li>
            <li>
              <strong>Broader Bitcoin roadmap:</strong> Separate upgrade conversations — privacy,
              scripting, covenants, scaling layers, and quantum readiness — will continue on their
              own timelines. BIP-110’s failure does not freeze the entire roadmap; it only shows
              that contested content-filtering soft forks face extreme resistance.
            </li>
          </ul>

          <p>
            For now, Bitcoin’s consensus rules remain where they were before the weekend drama. The
            minority experiment can exist as software. The market does not have to price it as
            Bitcoin.
          </p>

          <h2>Key Takeaways</h2>
          <ul>
            <li>
              <strong>BIP-110 was rejected because</strong> it never earned broad miner, market, or
              multi-constituency consensus — signaling stayed near low-single-digit percentages.
            </li>
            <li>
              <strong>Bitcoin remains conservative.</strong> Changing consensus rules still requires
              far more than a passionate minority and a completed BIP document.
            </li>
            <li>
              <strong>Governance is slow but intentional.</strong> The friction that frustrated
              BIP-110 supporters is the same friction that protects long-term holders from casual
              protocol experiments.
            </li>
            <li>
              <strong>Mainnet continued normally.</strong> The practical investor impact was small
              unless someone intentionally followed the minority ruleset.
            </li>
            <li>
              <strong>The data debate is not over.</strong> Only this activation path failed. The
              underlying argument about blockspace use continues.
            </li>
          </ul>

          <h2>FAQ</h2>
          <div className="faq-list space-y-6">
            <div>
              <h3>What is BIP-110?</h3>
              <p>
                BIP-110 is the Bitcoin Improvement Proposal for a “Reduced Data Temporary Softfork.”
                It proposed temporary consensus limits on arbitrary data in transactions, aimed
                largely at non-financial data embedding techniques.
              </p>
            </div>

            <div>
              <h3>Why was BIP-110 rejected?</h3>
              <p>
                It failed to secure meaningful economic consensus. Miner signaling stayed far below
                the proposal’s 55% threshold, major pools did not back it, Bitcoin Core did not
                adopt it as a network-wide upgrade, and the resulting minority chain stalled after
                minimal block production.
              </p>
            </div>

            <div>
              <h3>How are Bitcoin proposals approved?</h3>
              <p>
                There is no single approval board. A BIP becomes a real upgrade only when software
                implementing it is widely reviewed, run, and economically recognized as Bitcoin by
                miners, nodes, exchanges, businesses, and users.
              </p>
            </div>

            <div>
              <h3>Does the BIP-110 rejection affect Bitcoin price?</h3>
              <p>
                Protocol governance events can create short-term narrative noise, but BIP-110’s
                failure did not rewrite Bitcoin’s monetary policy, issuance schedule, or mainnet
                rules. Any price impact depends on broader market conditions, not on the mere
                existence of a failed soft-fork attempt.
              </p>
            </div>

            <div>
              <h3>Do I need to do anything as a Bitcoin holder?</h3>
              <p>
                Most holders on standard wallets and exchanges need no action. People running
                BIP-110-enforcing node software should verify whether their node is still following
                mainnet. Anyone tempted to trade minority-chain coins should understand replay risk
                and liquidity risk first.
              </p>
            </div>
          </div>

          <h2>Bottom Line</h2>
          <p>
            The BIP-110 rejection is best understood as a governance stress test. A contentious
            soft fork tried to force a temporary cultural and technical preference into Bitcoin’s
            consensus rules. The network answered the way it often does when consensus is missing:
            the main chain continued, the minority path lost economic relevance, and Bitcoin’s
            conservative upgrade culture was reinforced.
          </p>

          <p>
            That outcome will disappoint people who wanted a decisive anti-data rule change. It will
            reassure people who prioritize neutrality and predictability. For long-term holders, the
            useful lesson is simpler: Bitcoin’s base layer still changes slowly, on purpose — and
            that is a feature of the system, not a failure of it.
          </p>
        </div>
      </motion.article>
    </>
  );
}
