export default function SecurityPanel() {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
      <h3 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-3 flex items-center gap-2">
        <span className="text-amber-500">🔒</span> Security & Privacy
      </h3>
      <div className="space-y-3 text-xs text-[hsl(var(--foreground)/0.7)] leading-relaxed">
        <div>
          <p className="text-[hsl(var(--foreground))] font-medium mb-1">What Redreemer stores</p>
          <p>Name, phone number, step progress, and conversation history — only what's needed to help each person move forward.</p>
        </div>
        <div>
          <p className="text-[hsl(var(--foreground))] font-medium mb-1">What Redreemer never does</p>
          <ul className="space-y-1">
            <li>✗ Share data with parole officers or law enforcement</li>
            <li>✗ Report anything to any government authority</li>
            <li>✗ Sell or share data with third parties</li>
            <li>✗ Use data for advertising</li>
          </ul>
        </div>
        <div>
          <p className="text-[hsl(var(--foreground))] font-medium mb-1">How data is protected</p>
          <p>Auth0 handles authentication with role-based access control. Supabase Row Level Security enforces data isolation at the database level — caseworkers can only access their own clients, even if the application layer is bypassed.</p>
        </div>
      </div>
    </div>
  )
}
