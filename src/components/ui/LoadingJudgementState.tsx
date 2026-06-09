'use client';

export function LoadingJudgementState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        gap: 24,
        textAlign: 'center',
      }}
    >
      {/* Animated gavel */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <div
          className="spin-slow"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '3px solid rgba(245,197,66,0.15)',
            borderTopColor: '#F5C542',
            position: 'absolute',
            inset: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          ⚖️
        </div>
      </div>

      <div>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#F5C542',
            margin: '0 0 8px',
          }}
        >
          GenLayer is Judging
        </h3>
        <p style={{ fontSize: 15, color: '#64748b', margin: 0, maxWidth: 360 }}>
          The AI judge is evaluating arguments, detecting fallacies, and assessing evidence. This may take a moment.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
        {['Analysing argument structure…', 'Scanning for logical fallacies…', 'Evaluating evidence quality…', 'Computing final verdict…'].map(
          (step, i) => (
            <div
              key={step}
              className={`reveal stagger-${i + 1}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(245,197,66,0.06)',
                border: '1px solid rgba(245,197,66,0.15)',
              }}
            >
              <span
                className="pulse-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#F5C542',
                  flexShrink: 0,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{step}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
