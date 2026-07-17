export const metadata = {
  title: 'About DebateChain',
};

const SCORING_RUBRIC = [
  { category: 'Argument Strength', weight: '30%', desc: 'Logical structure, relevance to topic, clear claim and well-supported reasoning.' },
  { category: 'Evidence Quality', weight: '25%', desc: 'Quality, relevance and credibility of supporting evidence.' },
  { category: 'Rebuttal Quality', weight: '20%', desc: 'How well the participant engages the opponent\'s strongest points.' },
  { category: 'Fallacy Penalty', weight: '15%', desc: 'Deduction for weak logic, personal attacks, strawman arguments and unsupported leaps.' },
  { category: 'Clarity & Focus', weight: '10%', desc: 'Readability, topic discipline and concise expression.' },
];

const FALLACIES = [
  'Strawman', 'Ad Hominem', 'False Dilemma', 'Circular Reasoning',
  'Slippery Slope', 'Hasty Generalisation', 'Appeal to Emotion',
  'Appeal to Authority', 'Whataboutism', 'Red Herring', 'Unsupported Claim',
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '60px 28px' }}>

      {/* Header */}
      <div style={{ marginBottom: 52 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(239,138,255,0.08)', border: '1px solid rgba(239,138,255,0.2)',
          fontSize: 11, fontWeight: 700, color: '#ef8aff',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18,
        }}>
          ⚔ Intellectual Combat Protocol
        </span>
        <h1 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#f5eeff', margin: '0 0 18px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          About DebateChain
        </h1>
        <p style={{ fontSize: 17, color: '#7a6490', margin: 0, lineHeight: 1.75, maxWidth: 600 }}>
          DebateChain is not a chat app. It is a reasoning contest protocol. Arguments, evidence, and verdicts become structured, auditable, and reputation-forming on-chain records.
        </p>
      </div>

      {/* Core promise */}
      <div style={{
        padding: '24px 28px', borderRadius: 14, marginBottom: 48,
        background: 'linear-gradient(135deg, rgba(239,138,255,0.08), rgba(191,90,242,0.06))',
        border: '1px solid rgba(239,138,255,0.2)',
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef8aff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Core Promise
        </div>
        <p style={{ fontSize: 18, color: '#f5eeff', margin: 0, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Win debates by reasoning better, not by shouting louder.
        </p>
      </div>

      {/* AI Judgement */}
      <section style={{ marginBottom: 52 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f5eeff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          How AI Judgement Works
        </h2>
        <p style={{ fontSize: 15, color: '#7a6490', lineHeight: 1.75, marginBottom: 24 }}>
          The GenLayer Intelligent Contract evaluates every debate using a locked rubric — not popularity, emotional tone, political preference, or personal identity.
        </p>
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(239,138,255,0.1)', background: 'var(--bg-1)' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 80px 3fr',
            padding: '12px 20px', borderBottom: '1px solid rgba(239,138,255,0.08)',
            fontSize: 11, fontWeight: 700, color: '#4a3d60',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <span>Category</span><span>Weight</span><span>What It Measures</span>
          </div>
          {SCORING_RUBRIC.map((r, i) => (
            <div key={r.category} style={{
              display: 'grid', gridTemplateColumns: '2fr 80px 3fr',
              padding: '14px 20px',
              borderBottom: i < SCORING_RUBRIC.length - 1 ? '1px solid rgba(239,138,255,0.05)' : 'none',
              alignItems: 'start',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f5eeff' }}>{r.category}</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#ef8aff' }}>{r.weight}</span>
              <span style={{ fontSize: 13, color: '#7a6490', lineHeight: 1.6 }}>{r.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fallacy detection */}
      <section style={{ marginBottom: 52 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f5eeff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          Fallacy Detection
        </h2>
        <p style={{ fontSize: 15, color: '#7a6490', lineHeight: 1.75, marginBottom: 20 }}>
          The AI judge identifies specific logical fallacies — not just &quot;weak argument&quot; but exactly what went wrong.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {FALLACIES.map((f) => (
            <span key={f} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              color: '#ff6ef7', background: 'rgba(255,110,247,0.07)',
              border: '1px solid rgba(255,110,247,0.2)',
            }}>
              ⚠ {f}
            </span>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section style={{ marginBottom: 52 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f5eeff', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Technical Stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { layer: 'Frontend', tech: 'Next.js 16 · TypeScript · Tailwind CSS', accent: '#ef8aff' },
            { layer: 'Judgement', tech: 'GenLayer Intelligent Contract · Python', accent: '#bf5af2' },
            { layer: 'Wallet', tech: 'Injected Wallet (MetaMask)', accent: '#d946ef' },
            { layer: 'State', tech: 'GenLayer contract reads and writes only', accent: '#7a6490' },
          ].map((item) => (
            <div key={item.layer} style={{
              padding: '18px 20px', borderRadius: 12,
              background: 'var(--bg-1)', border: `1px solid ${item.accent}20`,
            }}>
              <div style={{ fontSize: 11, color: item.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                {item.layer}
              </div>
              <div style={{ fontSize: 14, color: '#c4a8e0' }}>{item.tech}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Non-negotiables */}
      <section>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f5eeff', margin: '0 0 18px', letterSpacing: '-0.02em' }}>
          Non-Negotiables
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'GenLayer is the source of truth for all verdicts.',
            'No fake winners, fake scores, or off-chain judgement.',
            'No off-chain cache is used for debate state or verdicts.',
            'Contract calls (not token transfers) are used for all write actions.',
            'Fallacies are identified specifically, not generically.',
            'Submitted evidence is evaluated for relevance, not just existence.',
            'Evidence URLs are fetched contract-side when available and judged from stable excerpts.',
          ].map((r) => (
            <div key={r} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '11px 16px', borderRadius: 10,
              background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.1)',
            }}>
              <span style={{ color: '#4ade80', flexShrink: 0, fontWeight: 700, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 14, color: '#c4a8e0', lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
