import type { Debate } from '@/types/debate';
import { DebateCard } from '@/components/debate/DebateCard';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';

interface Props {
  debates: Debate[];
  address?: string;
}

export function UserDebateHistory({ debates }: Props) {
  if (!debates.length) {
    return (
      <EmptyState
        title="No debates yet"
        description="This address has not participated in any debates."
        action={
          <Link
            href="/debates/new"
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
              textDecoration: 'none',
            }}
          >
            Create First Debate
          </Link>
        }
        icon="🗣️"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {debates.map((d) => (
        <DebateCard key={d.debate_id} debate={d} />
      ))}
    </div>
  );
}
