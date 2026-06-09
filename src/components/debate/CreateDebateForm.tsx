'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/providers/WalletProvider';
import { createDebate, generateId } from '@/lib/genlayer';
import type { CreateDebateInput, DebateType, DebateRound } from '@/types/debate';

const DEBATE_TYPES: { value: DebateType; label: string; desc: string }[] = [
  { value: 'claim_vs_counterclaim', label: 'Claim vs Counterclaim', desc: 'One side argues for, the other against.' },
  { value: 'product_comparison', label: 'Product Comparison', desc: 'Two products or approaches compared.' },
  { value: 'governance', label: 'Governance Debate', desc: 'Debate a proposal before a vote.' },
  { value: 'educational', label: 'Educational', desc: 'Learning-focused with detailed feedback.' },
  { value: 'creator_challenge', label: 'Creator Challenge', desc: 'Public contest with shareable verdict.' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  fontSize: 14,
  color: '#e2e8f0',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: 6,
  display: 'block',
  letterSpacing: '0.03em',
};

export function CreateDebateForm() {
  const { address, isConnected, connect } = useWallet();
  const router = useRouter();

  const [form, setForm] = useState<CreateDebateInput>({
    topic: '',
    side_a_label: '',
    side_b_label: '',
    debate_type: 'claim_vs_counterclaim',
    word_limit: 600,
    evidence_required: false,
    rounds_required: ['opening', 'rebuttal'],
    rules: 'Standard debate rules apply. Be respectful, use evidence, avoid personal attacks.',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const toggle = (field: keyof CreateDebateInput, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleRound = (round: DebateRound) => {
    setForm((f) => ({
      ...f,
      rounds_required: f.rounds_required.includes(round)
        ? f.rounds_required.filter((r) => r !== round)
        : [...f.rounds_required, round],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) { setError('Topic is required.'); return; }
    if (!form.side_a_label.trim() || !form.side_b_label.trim()) {
      setError('Both side labels are required.'); return;
    }
    if (form.rounds_required.length === 0) {
      setError('At least one round is required.'); return;
    }
    if (!address) { setError('Connect your wallet first.'); return; }

    setError(null);
    setSubmitting(true);
    try {
      const debateId = generateId('debate');
      const hash = await createDebate(address, debateId, form);
      setTxHash(hash);
      setCreatedId(debateId);
      setTimeout(() => router.push(`/debates/${debateId}`), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create debate on GenLayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div
        style={{
          padding: '48px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 40 }}>🔐</div>
        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
          Connect Your Wallet
        </h3>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          You need a wallet to create a debate on GenLayer.
        </p>
        <button
          onClick={connect}
          style={{
            padding: '12px 32px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (txHash) {
    return (
      <div
        style={{
          padding: '48px 32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)',
            border: '2px solid #22c55e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          ✓
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', margin: 0 }}>
          Debate Created On-Chain
        </h3>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          Transaction submitted to GenLayer. Redirecting to your debate room…
        </p>
        <code
          style={{
            fontSize: 12,
            color: '#22D3EE',
            background: 'rgba(34,211,238,0.08)',
            padding: '6px 12px',
            borderRadius: 6,
            wordBreak: 'break-all',
          }}
        >
          {txHash.slice(0, 20)}…{txHash.slice(-8)}
        </code>
        {createdId && (
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/debates/${createdId}`;
              navigator.clipboard.writeText(url).then(() => {
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 2000);
              });
            }}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: inviteCopied ? '#22c55e' : '#22D3EE',
              background: inviteCopied ? 'rgba(34,197,94,0.08)' : 'rgba(34,211,238,0.08)',
              border: `1px solid ${inviteCopied ? 'rgba(34,197,94,0.25)' : 'rgba(34,211,238,0.25)'}`,
              cursor: 'pointer',
            }}
          >
            {inviteCopied ? '✓ Invite Link Copied!' : '🔗 Copy Invite Link for Opponent'}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Topic */}
      <div>
        <label style={labelStyle}>Debate Topic *</label>
        <textarea
          value={form.topic}
          onChange={(e) => toggle('topic', e.target.value)}
          placeholder="e.g. Should DAOs use AI-assisted proposal review?"
          rows={3}
          required
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
        />
      </div>

      {/* Sides */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ ...labelStyle, color: '#22D3EE' }}>Side A Label *</label>
          <input
            type="text"
            value={form.side_a_label}
            onChange={(e) => toggle('side_a_label', e.target.value)}
            placeholder="e.g. Yes, for"
            required
            style={{ ...inputStyle, borderColor: 'rgba(34,211,238,0.2)' }}
          />
        </div>
        <div>
          <label style={{ ...labelStyle, color: '#F5C542' }}>Side B Label *</label>
          <input
            type="text"
            value={form.side_b_label}
            onChange={(e) => toggle('side_b_label', e.target.value)}
            placeholder="e.g. No, against"
            required
            style={{ ...inputStyle, borderColor: 'rgba(245,197,66,0.2)' }}
          />
        </div>
      </div>

      {/* Type */}
      <div>
        <label style={labelStyle}>Debate Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {DEBATE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggle('debate_type', t.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                textAlign: 'left',
                color: form.debate_type === t.value ? '#fff' : '#94a3b8',
                background: form.debate_type === t.value
                  ? 'rgba(37,99,235,0.2)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.debate_type === t.value ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: form.debate_type === t.value ? '#94a3b8' : '#475569' }}>
                {t.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div>
        <label style={labelStyle}>Rounds Required</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['opening', 'rebuttal', 'final'] as DebateRound[]).map((r) => {
            const active = form.rounds_required.includes(r);
            const required = r === 'opening'; // opening always required
            return (
              <button
                key={r}
                type="button"
                onClick={() => !required && toggleRound(r)}
                disabled={required}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: active ? '#F5C542' : '#475569',
                  background: active ? 'rgba(245,197,66,0.1)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(245,197,66,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  cursor: required ? 'default' : 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {r} {required && '(required)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Word limit & evidence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Word Limit Per Argument</label>
          <input
            type="number"
            value={form.word_limit}
            onChange={(e) => toggle('word_limit', Number(e.target.value))}
            min={100}
            max={2000}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Evidence Required</label>
          <button
            type="button"
            onClick={() => toggle('evidence_required', !form.evidence_required)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: form.evidence_required ? '#22D3EE' : '#64748b',
              background: form.evidence_required
                ? 'rgba(34,211,238,0.1)'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${form.evidence_required ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {form.evidence_required ? '✓ Evidence Required' : '○ Evidence Optional'}
          </button>
        </div>
      </div>

      {/* Rules */}
      <div>
        <label style={labelStyle}>Judging Rules / Context</label>
        <textarea
          value={form.rules}
          onChange={(e) => toggle('rules', e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'rgba(225,29,72,0.1)',
            border: '1px solid rgba(225,29,72,0.3)',
            fontSize: 13,
            color: '#f43f5e',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: 'rgba(245,197,66,0.05)',
          border: '1px solid rgba(245,197,66,0.12)',
          fontSize: 12,
          color: '#94a3b8',
        }}
      >
        ⚖️ This debate will be created as a GenLayer contract call (not a token transfer). The topic, sides, and rules will be locked on-chain.
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '14px 32px',
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 700,
          color: '#fff',
          background: submitting
            ? 'rgba(37,99,235,0.4)'
            : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
          border: 'none',
          cursor: submitting ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-end',
          boxShadow: submitting ? 'none' : '0 0 20px rgba(37,99,235,0.3)',
          transition: 'all 0.2s',
        }}
      >
        {submitting ? 'Creating on GenLayer…' : 'Create Debate On-Chain'}
      </button>
    </form>
  );
}
