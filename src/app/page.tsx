import Link from 'next/link';

const FEATURES = [
  {
    icon: '⚖️',
    title: 'AI-Judged Verdicts',
    desc: 'GenLayer evaluates argument quality, detects logical fallacies, and scores evidence — all on-chain.',
    color: '#F5C542',
  },
  {
    icon: '🔗',
    title: 'On-Chain Truth',
    desc: 'Every argument, verdict, and reasoning trace is stored on GenLayer. No fake scores. No off-chain manipulation.',
    color: '#22D3EE',
  },
  {
    icon: '🎯',
    title: 'Fallacy Detection',
    desc: 'Strawman, ad hominem, circular reasoning, slippery slope — the AI judge identifies them all.',
    color: '#E11D48',
  },
  {
    icon: '📊',
    title: 'Evidence Assessment',
    desc: 'The judge evaluates whether your evidence actually supports your claims, not just whether a link exists.',
    color: '#2563EB',
  },
];

const STATS = [
  { label: 'Contract Method', value: 'judge_debate()' },
  { label: 'Network', value: 'GenLayer Studionet' },
  { label: 'Verdict Type', value: 'On-Chain JSON' },
  { label: 'Fake Scores', value: 'Zero' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '100px 24px 80px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 9999,
            background: 'rgba(245,197,66,0.08)',
            border: '1px solid rgba(245,197,66,0.25)',
            fontSize: 13,
            color: '#F5C542',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
        >
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#F5C542' }} />
          Powered by GenLayer Intelligent Contracts
        </div>

        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 900,
            color: '#fff',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            maxWidth: 900,
          }}
        >
          Win debates by{' '}
          <span className="gradient-text">reasoning better</span>,
          <br />
          not by shouting louder.
        </h1>

        <p
          style={{
            fontSize: 20,
            color: '#94a3b8',
            margin: 0,
            maxWidth: 600,
            lineHeight: 1.7,
          }}
        >
          DebateChain is a structured reasoning arena. Arguments, evidence, and verdicts are judged by GenLayer AI and stored on-chain as auditable records.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/debates/new"
            style={{
              padding: '14px 36px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
              textDecoration: 'none',
              boxShadow: '0 0 32px rgba(37,99,235,0.4)',
            }}
          >
            Create a Debate
          </Link>
          <Link
            href="/debates"
            style={{
              padding: '14px 36px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              color: '#e2e8f0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              textDecoration: 'none',
            }}
          >
            Browse Debates
          </Link>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            overflow: 'hidden',
            marginTop: 16,
            flexWrap: 'wrap',
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '14px 28px',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#22D3EE', marginBottom: 2 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px 80px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card"
              style={{
                padding: 28,
                borderColor: `${f.color}22`,
                background: `radial-gradient(ellipse at top left, ${f.color}08, transparent)`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 24px 100px',
        }}
      >
        <div
          style={{
            padding: '48px',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 40px', textAlign: 'center' }}>
            How It Works
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 32,
            }}
          >
            {[
              { n: '1', title: 'Create', desc: 'Set the topic, two sides, rules, and rounds. Locked on-chain.' },
              { n: '2', title: 'Join', desc: 'An opponent accepts Side B and the debate begins.' },
              { n: '3', title: 'Argue', desc: 'Submit opening arguments, rebuttals, and evidence.' },
              { n: '4', title: 'Judge', desc: 'GenLayer AI scores both sides and stores the verdict on-chain.' },
              { n: '5', title: 'Finalize', desc: 'The on-chain verdict is final, auditable, and shareable.' },
            ].map((step) => (
              <div key={step.n} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'rgba(37,99,235,0.15)',
                    border: '2px solid rgba(37,99,235,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#3b82f6',
                    margin: '0 auto 12px',
                  }}
                >
                  {step.n}
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
