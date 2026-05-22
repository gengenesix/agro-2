export default function AgentRegistrationsPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">My Registrations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Farmers you have verified and onboarded</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-10 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current text-forest">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
          </svg>
        </div>
        <p className="font-bold text-forest text-base">Historical Farmer Registrations</p>
        <p className="text-sm text-muted-foreground">Coming soon — your full registration history with farmer profiles, GPS verification data, and commission breakdown will appear here.</p>
      </div>
    </div>
  )
}
