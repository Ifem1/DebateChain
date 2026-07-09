import Link from 'next/link';

const FEATURES = [
  {
    icon: '⚖️',
    title: 'AI-Judged Verdicts',
    desc: 'GenLayer evaluates argument quality, flags logical fallacies, and scores submitted evidence — all on-chain with consensus.',
    accent: '#ef8aff',
  },
  {
    icon: '🔗',
    title: 'Immutable Truth',
    desc: 'Every argument, verdict, and reasoning trace is stored on GenLayer. No fake scores. No off-chain manipulation.',
    accent: '#bf5af2',
  },
  {
    icon: '⚡',
    title: 'Fallacy Detection',
    desc: 'Strawman, ad hominem, circular reasoning — the AI judge highlights specific reasoning flaws for review.',
    accent: '#ff6ef7',
  },
  {
    icon: '📊',
    title: 'Evidence Assessment',
    desc: 'The judge checks submitted source details and contract-fetched excerpts, not just whether a link exists.',
    accent: '#d946ef',
  },
];

const STEPS = [
  { n: '01', title: 'Create', desc: 'Set the topic, two sides, rules, and rounds. Locked on-chain the moment you sign.' },
  { n: '02', title: 'Challenge', desc: 'An opponent finds your debate and accepts Side B. The arena opens.' },
  { n: '03', title: 'Argue', desc: 'Submit openings, rebuttals, evidence. Each round is a chance to dismantle their logic.' },
  { n: '04', title: 'Judge', desc: 'GenLayer AI validators reach consensus and write the verdict on-chain.' },
  { n: '05', title: 'Finalize', desc: 'The result is permanent, auditable, and shareable. Your legacy is immortalized.' },
];

const STATS = [
  { label: 'Contract Method', value: 'judge_debate()', icon: '⚙️' },
  { label: 'Network', value: 'GenLayer Studionet', icon: '🌐' },
  { label: 'Verdict Storage', value: 'On-Chain JSON', icon: '🔒' },
  { label: 'Fake Scores', value: 'Zero', icon: '🚫' },
];

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="grid-bg" style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '110px 28px 100px',
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: -120, left: '30%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,138,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(191,90,242,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Two-column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 64,
            alignItems: 'center',
          }}>
            {/* Left */}
            <div>
              {/* Live badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px', borderRadius: 999,
                background: 'rgba(239,138,255,0.08)',
                border: '1px solid rgba(239,138,255,0.25)',
                fontSize: 12, color: '#ef8aff', fontWeight: 700,
                letterSpacing: '0.07em', textTransform: 'uppercase',
                marginBottom: 24,
              }}>
                <span className="pulse-dot" />
                Intellectual Combat Protocol · Active
              </div>

              <h1 style={{
                fontSize: 'clamp(38px, 4.5vw, 66px)',
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                margin: '0 0 24px',
                color: '#f5eeff',
              }}>
                Forge your{' '}
                <span className="gradient-text">legacy</span>
                <br />in the chain.
              </h1>

              <p style={{
                fontSize: 17,
                color: '#7a6490',
                lineHeight: 1.75,
                margin: '0 0 36px',
                maxWidth: 480,
              }}>
                DebateChain is a decentralized proving ground. Arguments are timestamped, evidence URLs are checked when available, and AI consensus decides the victor — on-chain, forever.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
                <Link href="/debates/new" className="btn-primary" style={{ fontSize: 15, padding: '13px 32px' }}>
                  ⚔ Start Debate
                </Link>
                <Link href="/debates" className="btn-ghost" style={{ fontSize: 15, padding: '13px 32px' }}>
                  Browse Arena →
                </Link>
              </div>

              {/* Mini stats */}
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                {[
                  { v: '100%', l: 'On-Chain' },
                  { v: 'AI', l: 'Judge' },
                  { v: '0', l: 'Fake Scores' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#ef8aff' }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: '#4a3d60', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — arena card */}
            <div>
              {/* Featured debate mock card */}
              <div style={{
                borderRadius: 20,
                background: 'var(--bg-1)',
                border: '1px solid rgba(239,138,255,0.2)',
                padding: 28,
                boxShadow: '0 0 60px rgba(239,138,255,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <span className="tag tag-primary">⚡ Live Arena</span>
                  <span style={{ fontSize: 12, color: '#4a3d60' }}>GenLayer Studionet</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f5eeff', lineHeight: 1.35, marginBottom: 20 }}>
                  Should AI be granted legal personhood before 2030?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { side: 'Side A', label: 'Pro Personhood', color: '#ef8aff' },
                    { side: 'Side B', label: 'Against', color: '#bf5af2' },
                  ].map(s => (
                    <div key={s.side} style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: `${s.color}0d`,
                      border: `1px solid ${s.color}25`,
                    }}>
                      <div style={{ fontSize: 10, color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{s.side}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f5eeff' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a6490', marginBottom: 6 }}>
                    <span>Round 2 / Rebuttal</span>
                    <span>Awaiting judgement</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(239,138,255,0.12)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '65%', borderRadius: 2, background: 'linear-gradient(90deg, #ef8aff, #bf5af2)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1, padding: '10px 14px', borderRadius: 8, textAlign: 'center',
                    background: 'rgba(239,138,255,0.08)', border: '1px solid rgba(239,138,255,0.2)',
                    fontSize: 12, fontWeight: 700, color: '#ef8aff', cursor: 'pointer',
                  }}>
                    Watch Battle
                  </div>
                  <div style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(239,138,255,0.04)', border: '1px solid rgba(239,138,255,0.1)',
                    fontSize: 12, color: '#4a3d60', cursor: 'pointer',
                  }}>
                    ⚖️ Judge
                  </div>
                </div>
              </div>

              {/* Verdict finalized chip */}
              <div style={{
                marginTop: 14,
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(74,222,128,0.05)',
                border: '1px solid rgba(74,222,128,0.15)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>Verdict Finalized On-Chain</div>
                  <div style={{ fontSize: 11, color: '#4a3d60' }}>Winner determined by GenLayer AI consensus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Protocol stats strip ─────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(239,138,255,0.06)', borderBottom: '1px solid rgba(239,138,255,0.06)', background: 'var(--bg-1)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: '22px 28px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(239,138,255,0.06)' : 'none',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ef8aff' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#4a3d60', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '90px 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span className="tag tag-primary" style={{ marginBottom: 14, display: 'inline-flex' }}>Protocol Features</span>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, color: '#f5eeff', margin: 0, letterSpacing: '-0.02em' }}>
            Logic is your only weapon
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 18 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card card-hover reveal" style={{
              padding: 28,
              borderColor: `${f.accent}20`,
              background: `radial-gradient(140px at top left, ${f.accent}08, transparent)`,
              animationDelay: `${i * 0.08}s`,
              opacity: 0,
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 13,
                background: `${f.accent}12`,
                border: `1px solid ${f.accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 18,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f5eeff', margin: '0 0 10px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#7a6490', margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section style={{ padding: '0 28px 100px' }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          borderRadius: 22,
          background: 'var(--bg-1)',
          border: '1px solid rgba(239,138,255,0.12)',
          padding: '60px 52px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* bg glow */}
          <div style={{
            position: 'absolute', top: -100, right: -80,
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239,138,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative' }}>
            <span className="tag tag-primary" style={{ marginBottom: 14, display: 'inline-flex' }}>Protocol Flow</span>
            <h2 style={{ fontSize: 'clamp(26px, 2.8vw, 40px)', fontWeight: 900, color: '#f5eeff', margin: 0, letterSpacing: '-0.02em' }}>
              From challenge to immortal verdict
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            {/* Connecting line */}
            <div style={{
              position: 'absolute', top: 24, left: 36, right: 36, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(239,138,255,0.3), rgba(239,138,255,0.3), transparent)',
            }} />

            {STEPS.map((step, i) => (
              <div key={step.n} style={{ flex: 1, textAlign: 'center', padding: '0 12px', position: 'relative' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: i === 3 ? 'linear-gradient(135deg, #ef8aff, #bf5af2)' : 'var(--bg-2)',
                  border: i === 3 ? 'none' : '1px solid rgba(239,138,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 900,
                  color: i === 3 ? '#07070f' : '#ef8aff',
                  margin: '0 auto 18px',
                  boxShadow: i === 3 ? '0 0 24px rgba(239,138,255,0.4)' : 'none',
                  position: 'relative', zIndex: 1,
                }}>
                  {step.n}
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: '#f5eeff', margin: '0 0 8px' }}>{step.title}</h4>
                <p style={{ fontSize: 12, color: '#7a6490', margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding: '0 28px 120px' }}>
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
          padding: '72px 40px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(239,138,255,0.08), rgba(191,90,242,0.06))',
          border: '1px solid rgba(239,138,255,0.2)',
          boxShadow: '0 0 80px rgba(239,138,255,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(239,138,255,0.03) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(239,138,255,0.03) 40px)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, color: '#f5eeff', margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Ready to prove your logic?
            </h2>
            <p style={{ fontSize: 16, color: '#7a6490', margin: '0 0 36px', lineHeight: 1.7 }}>
              Every argument you make is cryptographically linked to your identity and stored forever. Your intellectual legacy starts now.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/debates/new" className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
                ⚡ Enter the Arena
              </Link>
              <Link href="/debates" className="btn-ghost" style={{ fontSize: 16, padding: '14px 36px' }}>
                View Active Debates
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
