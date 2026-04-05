import { Heart } from 'lucide-react'

export default function CrisisOverlay({ open, onClose }) {
  if (!open) return null
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-start p-4 pt-6 md:pt-8 bg-[hsl(var(--background)/0.97)] backdrop-blur-md rounded-2xl border-2 border-[hsl(var(--secondary)/0.5)] overflow-y-auto"
      role="alertdialog"
      aria-labelledby="crisis-overlay-title"
      aria-describedby="crisis-overlay-body"
    >
      <Heart className="w-10 h-10 text-[hsl(var(--secondary))] mb-3 shrink-0" aria-hidden />
      <h2 id="crisis-overlay-title" className="font-heading font-bold text-lg text-center text-[hsl(var(--foreground))] mb-2">
        Your safety comes first
      </h2>
      <p id="crisis-overlay-body" className="text-sm text-center text-[hsl(var(--muted-foreground))] max-w-md mb-4">
        If you might hurt yourself or you’re in danger, please reach out now. This is not punishment — you deserve help.
      </p>
      <div className="w-full max-w-md space-y-2 mb-4">
        <a
          href="tel:988"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-semibold text-sm hover:opacity-95 transition-opacity"
        >
          Call or text 988
        </a>
        <a
          href="sms:741741?body=HOME"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl glass border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium text-sm"
        >
          Text HOME to 741741
        </a>
        <a
          href="tel:911"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] text-sm font-medium"
        >
          Emergency — call 911
        </a>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-[hsl(var(--primary))] font-medium underline-offset-2 hover:underline mb-2"
        >
          I’m safe for now — back to chat
        </button>
      )}
    </div>
  )
}
