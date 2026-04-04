export default function FlagBadges({ client }) {
  const flags = []

  if (client.last_active) {
    const daysSince = Math.floor((Date.now() - new Date(client.last_active)) / (1000 * 60 * 60 * 24))
    if (daysSince >= 5) {
      flags.push({ label: `Inactive ${daysSince}d`, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' })
    }
  }

  if (client.crisis_flag) {
    flags.push({ label: 'Crisis Mention', color: 'bg-red-500/20 text-red-400 border-red-500/30' })
  }

  if (flags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag, i) => (
        <span key={i} className={`text-xs px-2 py-1 rounded-full border font-medium ${flag.color}`}>
          {flag.label}
        </span>
      ))}
    </div>
  )
}
