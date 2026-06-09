interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: string;
}

export function EmptyState({ title, description, action, icon = '⚖️' }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        gap: 16,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 8 }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 15, color: '#64748b', margin: 0, maxWidth: 400 }}>{description}</p>
      )}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
