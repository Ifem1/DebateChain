import type { DebateStatus } from '@/types/debate';

interface Props {
  status: DebateStatus;
}

const STEPS: { label: string; statuses: DebateStatus[] }[] = [
  { label: 'Created', statuses: ['CREATED'] },
  { label: 'Joined', statuses: ['ACCEPTED'] },
  { label: 'Opening', statuses: ['OPENING_SUBMITTED'] },
  { label: 'Rebuttal', statuses: ['REBUTTAL_SUBMITTED'] },
  { label: 'Judgement', statuses: ['READY_FOR_JUDGEMENT', 'JUDGED', 'DISPUTED'] },
  { label: 'Finalized', statuses: ['FINALIZED'] },
];

function getStepIndex(status: DebateStatus): number {
  return STEPS.findIndex((s) => s.statuses.includes(status));
}

export function RoundIndicator({ status }: Props) {
  const current = getStepIndex(status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: `2px solid ${
                    done ? '#22c55e' : active ? '#F5C542' : 'rgba(255,255,255,0.1)'
                  }`,
                  background: done
                    ? 'rgba(34,197,94,0.15)'
                    : active
                    ? 'rgba(245,197,66,0.15)'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: done ? '#22c55e' : active ? '#F5C542' : '#475569',
                  transition: 'all 0.2s',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: done ? '#22c55e' : active ? '#F5C542' : '#475569',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  background: i < current ? '#22c55e' : 'rgba(255,255,255,0.08)',
                  margin: '0 4px',
                  marginBottom: 20,
                  transition: 'background 0.2s',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
