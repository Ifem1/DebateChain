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
  'Appeal to Authority (without evidence)', 'Whataboutism', 'Red Herring', 'Unsupported Claim',
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.03em' }}>
          About DebateChain
        </h1>
        <p style={{ fontSize: 18, color: '#94a3b8', margin: 0, lineHeight: 1.7 }}>
          DebateChain is not a chat app. It is a reasoning contest protocol. Arguments, evidence, and verdicts become structured, auditable, and reputation-forming on-chain records.
        </p>
      </div>

      {/* Core promise */}
      <div
        style={{
          padding: '24px 28px',
          borderRadius: 14,
          background: 'rgba(245,197,66,0.06)',
          border: '1px solid rgba(245,197,66,0.2)',
          marginBottom: 40,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F5C542', margin: '0 0 8px' }}>
          Core Promise
        </h2>
        <p style={{ fontSize: 16, color: '#e2e8f0', margin: 0, fontWeight: 500 }}>
          Win debates by reasoning better, not by shouting louder.
        </p>
      </div>

      {/* How judgement works */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 20px' }}>
          How AI Judgement Works
        </h2>
        <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 24 }}>
          The GenLayer Intelligent Contract evaluates every debate. It does not decide based on popularity, emotional tone, political preference, or personal identity. It judges based on a locked rubric.
        </p>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 80px 3fr',
              gap: 0,
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: 11,
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
            }}
          >
            <span>Category</span>
            <span>Weight</span>
            <span>What It Measures</span>
          </div>
          {SCORING_RUBRIC.map((r, i) => (
            <div
              key={r.category}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 80px 3fr',
                gap: 0,
                padding: '14px 20px',
                borderBottom: i < SCORING_RUBRIC.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                alignItems: 'start',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{r.category}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#F5C542' }}>{r.weight}</span>
              <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{r.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fallacy detection */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
          Fallacy Detection
        </h2>
        <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 20 }}>
          The AI judge identifies specific logical fallacies rather than just saying an argument is weak.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {FALLACIES.map((f) => (
            <span
              key={f}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                fontSize: 13,
                color: '#E11D48',
                background: 'rgba(225,29,72,0.08)',
                border: '1px solid rgba(225,29,72,0.2)',
                fontWeight: 500,
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 20px' }}>
          Technical Stack
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { layer: 'Frontend', tech: 'Next.js 16 · TypeScript · Tailwind CSS', color: '#2563EB' },
            { layer: 'Judgement', tech: 'GenLayer Intelligent Contract · Python', color: '#F5C542' },
            { layer: 'Wallet', tech: 'Injected Wallet (MetaMask)', color: '#22D3EE' },
            { layer: 'Indexing', tech: 'Supabase (cache only, never source of truth)', color: '#94a3b8' },
          ].map((item) => (
            <div
              key={item.layer}
              className="card"
              style={{ padding: '16px 20px', borderColor: `${item.color}22` }}
            >
              <div style={{ fontSize: 11, color: item.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                {item.layer}
              </div>
              <div style={{ fontSize: 14, color: '#e2e8f0' }}>{item.tech}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Non-negotiables */}
      <section>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
          Non-Negotiables
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            'GenLayer is the source of truth for all verdicts.',
            'No fake winners, fake scores, or off-chain judgement.',
            'Supabase only caches on-chain data — it never decides debate results.',
            'Contract calls (not token transfers) are used for all write actions.',
            'Fallacies are identified specifically, not generically.',
            'Evidence is evaluated for relevance, not just existence.',
          ].map((r) => (
            <div
              key={r}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(34,197,94,0.04)',
                border: '1px solid rgba(34,197,94,0.1)',
              }}
            >
              <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>{r}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
