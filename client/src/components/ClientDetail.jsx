import StepProgress from './StepProgress.jsx'
import ConversationSummary from './ConversationSummary.jsx'
import FlagBadges from './FlagBadges.jsx'
import VoicePlayer from './VoicePlayer.jsx'
import MessageComposer from './MessageComposer.jsx'
import StepEditor from './StepEditor.jsx'
import ExportButton from './ExportButton.jsx'
import HealthScore from './HealthScore.jsx'

const USER_TYPE_LABELS = {
  homeless: { label: 'Homeless', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  reentry: { label: 'Reentry', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  both: { label: 'Homeless + Reentry', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
}

export default function ClientDetail({ client, onStepUpdate }) {
  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center text-navy-400 text-sm">
        Select a client to view details
      </div>
    )
  }

  const typeInfo = USER_TYPE_LABELS[client.user_type] || USER_TYPE_LABELS.homeless
  const lastActive = client.last_active
    ? new Date(client.last_active).toLocaleDateString()
    : 'Never'

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-xl font-bold">{client.name || 'Unknown'}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <span className="text-navy-400 text-xs">Last active: {lastActive}</span>
            {client.city && <span className="text-navy-400 text-xs">{client.city}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton client={client} />
        </div>
      </div>

      {/* Flags */}
      <FlagBadges client={client} />

      {/* Health score */}
      <HealthScore clientId={client.id} initialScore={client.financial_health_score || 0} />

      {/* Step editor */}
      <StepEditor client={client} onUpdate={onStepUpdate} />

      {/* Step progress */}
      <div className="bg-navy-800 rounded-xl p-5">
        <StepProgress client={client} />
      </div>

      {/* Voice milestones */}
      <div className="bg-navy-800 rounded-xl p-5">
        <VoicePlayer client={client} stepLogs={client.stepLogs || []} />
      </div>

      {/* Conversation summary */}
      <div className="bg-navy-800 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Recent Conversations</h3>
        <ConversationSummary conversations={client.conversations || []} />
      </div>

      {/* Message composer */}
      <div className="bg-navy-800 rounded-xl p-5">
        <MessageComposer clientId={client.id} />
      </div>
    </div>
  )
}
