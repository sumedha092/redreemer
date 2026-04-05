export default function ConversationSummary({ conversations = [] }) {
  const recent = conversations.slice(-5)

  if (recent.length === 0) {
    return (
      <p className="text-[hsl(var(--muted-foreground))] text-sm italic">No conversations yet.</p>
    )
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
      {recent.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            msg.role === 'user'
              ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-tr-sm'
              : 'bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] text-[hsl(var(--foreground))] rounded-tl-sm'
          }`}>
            <p>{msg.content}</p>
            {msg.created_at && (
              <p className="text-[10px] opacity-40 mt-1 text-right">
                {new Date(msg.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
