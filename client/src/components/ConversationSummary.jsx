export default function ConversationSummary({ conversations = [] }) {
  const recent = conversations.slice(-5)

  if (recent.length === 0) {
    return (
      <div className="text-navy-400 text-sm italic">No conversations yet.</div>
    )
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {recent.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
            msg.role === 'user'
              ? 'bg-navy-700 text-white'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-100'
          }`}>
            <p className="leading-relaxed">{msg.content}</p>
            {msg.created_at && (
              <p className="text-xs opacity-40 mt-1">
                {new Date(msg.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
