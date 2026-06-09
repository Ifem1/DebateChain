'use client';

import { useState } from 'react';
import type { EvidenceItem } from '@/types/debate';

interface Props {
  value: EvidenceItem[];
  onChange: (items: EvidenceItem[]) => void;
  maxItems?: number;
}

const EMPTY: EvidenceItem = { title: '', url: '', note: '' };

export function EvidenceInput({ value, onChange, maxItems = 5 }: Props) {
  const [open, setOpen] = useState(false);

  const add = () => {
    if (value.length < maxItems) onChange([...value, { ...EMPTY }]);
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const update = (i: number, field: keyof EvidenceItem, val: string) => {
    const copy = [...value];
    copy[i] = { ...copy[i], [field]: val };
    onChange(copy);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: '#22D3EE',
          background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.25)',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 14 }}>+</span>
        {value.length > 0 ? `${value.length} evidence item${value.length !== 1 ? 's' : ''}` : 'Add Evidence'}
      </button>

      {open && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            borderRadius: 10,
            background: 'rgba(34,211,238,0.04)',
            border: '1px solid rgba(34,211,238,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#22D3EE', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Evidence & Sources
            </span>
            <span style={{ fontSize: 11, color: '#475569' }}>
              GenLayer will assess relevance and support quality
            </span>
          </div>

          {value.map((item, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                borderRadius: 8,
                background: 'rgba(9,11,45,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Source {i + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#E11D48',
                    cursor: 'pointer',
                    fontSize: 16,
                    padding: '0 4px',
                  }}
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                placeholder="Title / Description *"
                value={item.title}
                onChange={(e) => update(i, 'title', e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="url"
                placeholder="URL (optional)"
                value={item.url}
                onChange={(e) => update(i, 'url', e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="How this evidence supports your argument"
                value={item.note}
                onChange={(e) => update(i, 'note', e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}

          {value.length < maxItems && (
            <button
              type="button"
              onClick={add}
              style={{
                padding: '8px',
                borderRadius: 8,
                fontSize: 13,
                color: '#64748b',
                background: 'rgba(255,255,255,0.03)',
                border: '1px dashed rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              + Add another source
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  fontSize: 13,
  color: '#e2e8f0',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  outline: 'none',
};
