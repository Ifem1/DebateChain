import { CreateDebateForm } from '@/components/debate/CreateDebateForm';

export const metadata = {
  title: 'Create Debate — DebateChain',
  description: 'Start a new AI-judged debate on GenLayer.',
};

export default function CreateDebatePage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 36 }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}
        >
          Create a Debate
        </h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
          Set the topic, sides, and rules. Everything is locked on-chain before judgement.
        </p>
      </div>

      {/* Info strip */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
          padding: '14px 18px',
          borderRadius: 10,
          background: 'rgba(37,99,235,0.06)',
          border: '1px solid rgba(37,99,235,0.15)',
          fontSize: 13,
          color: '#94a3b8',
          flexWrap: 'wrap',
        }}
      >
        <span>📋 Topic locked on creation</span>
        <span style={{ color: '#2563EB' }}>·</span>
        <span>⚖️ GenLayer AI judges</span>
        <span style={{ color: '#2563EB' }}>·</span>
        <span>🔗 Verdict stored on-chain</span>
        <span style={{ color: '#2563EB' }}>·</span>
        <span>🚫 No fake scores</span>
      </div>

      <div className="card" style={{ padding: '32px' }}>
        <CreateDebateForm />
      </div>
    </div>
  );
}
