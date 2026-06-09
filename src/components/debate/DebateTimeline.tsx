import type { Submission, DebateRound, DebateStatus } from '@/types/debate';
import { SideBadge } from '@/components/ui/SideBadge';

// Statuses where we know the opening round is fully done
const PAST_OPENING = new Set<DebateStatus>([
  'REBUTTAL_SUBMITTED', 'READY_FOR_JUDGEMENT', 'JUDGED', 'FINALIZED',
]);
const PAST_REBUTTAL = new Set<DebateStatus>([
  'READY_FOR_JUDGEMENT', 'JUDGED', 'FINALIZED',
]);

interface Props {
  submissions: Submission[];
  sideALabel: string;
  sideBLabel: string;
  roundsRequired: DebateRound[];
  debateStatus: DebateStatus;
}

function formatDate(ts?: number) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const ROUND_LABELS: Record<string, string> = {
  opening: 'Opening Argument',
  rebuttal: 'Rebuttal',
  final: 'Final Statement',
};

function isRoundVisible(round: DebateRound, debateStatus: DebateStatus, roundSubs: Submission[]): boolean {
  // Always show a round if there are submissions for it
  if (roundSubs.length > 0) return true;
  // Show upcoming round header only if the debate has passed the prior round
  if (round === 'rebuttal') return PAST_OPENING.has(debateStatus);
  if (round === 'final') return PAST_REBUTTAL.has(debateStatus);
  // Opening: show once accepted
  return debateStatus !== 'CREATED';
}

export function DebateTimeline({ submissions, sideALabel, sideBLabel, roundsRequired, debateStatus }: Props) {
  if (!submissions.length && debateStatus === 'ACCEPTED') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: 14 }}>
        No arguments submitted yet. Both sides need to submit their opening.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {roundsRequired.map((round) => {
        const roundSubs = submissions.filter((s) => s.round === round);
        if (!isRoundVisible(round, debateStatus, roundSubs)) return null;

        return (
          <div key={round}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#F5C542',
                  padding: '4px 14px',
                  border: '1px solid rgba(245,197,66,0.3)',
                  borderRadius: 9999,
                  background: 'rgba(245,197,66,0.06)',
                }}
              >
                {ROUND_LABELS[round]}
              </span>
              <div
                style={{
                  height: 1,
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              {(['SIDE_A', 'SIDE_B'] as const).map((side) => {
                const sub = roundSubs.find((s) => s.side === side);
                const label = side === 'SIDE_A' ? sideALabel : sideBLabel;

                return (
                  <div
                    key={side}
                    className="card"
                    style={{
                      padding: 20,
                      borderColor: side === 'SIDE_A'
                        ? 'rgba(34,211,238,0.15)'
                        : 'rgba(245,197,66,0.15)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <SideBadge side={side} label={label} size="sm" />
                      {sub?.submitted_at && (
                        <span style={{ fontSize: 11, color: '#475569' }}>
                          {formatDate(sub.submitted_at)}
                        </span>
                      )}
                    </div>

                    {sub ? (
                      <>
                        <p
                          style={{
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: '#cbd5e1',
                            margin: '0 0 12px',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {sub.argument_text}
                        </p>

                        {sub.evidence.length > 0 && (
                          <div
                            style={{
                              borderTop: '1px solid rgba(255,255,255,0.06)',
                              paddingTop: 10,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                color: '#22D3EE',
                                marginBottom: 4,
                              }}
                            >
                              Evidence
                            </span>
                            {sub.evidence.map((e, i) => (
                              <div
                                key={i}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: 6,
                                  background: 'rgba(34,211,238,0.06)',
                                  border: '1px solid rgba(34,211,238,0.15)',
                                  fontSize: 12,
                                  color: '#94a3b8',
                                }}
                              >
                                <div style={{ fontWeight: 600, color: '#22D3EE', marginBottom: 2 }}>
                                  {e.title}
                                </div>
                                {e.note && <div style={{ color: '#64748b' }}>{e.note}</div>}
                                {e.url && (
                                  <a
                                    href={e.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#3b82f6', fontSize: 11, wordBreak: 'break-all' }}
                                  >
                                    {e.url}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {sub.word_count !== undefined && (
                          <div style={{ marginTop: 8, fontSize: 11, color: '#475569' }}>
                            {sub.word_count} words
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ fontSize: 13, color: '#475569', margin: 0, fontStyle: 'italic' }}>
                        Awaiting submission…
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
