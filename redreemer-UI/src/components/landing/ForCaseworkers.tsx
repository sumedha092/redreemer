import { Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  'Real-time conversation history',
  'Financial Health Score per client',
  'Step progress and milestone tracking',
  'Silent client alerts — 7, 14, 21 day flags',
  'Engagement risk score per client',
  'Scam attempts blocked — visible per client',
  'AI voice milestone celebrations',
  'Direct message composer with suggested outreach',
  'Progress report export for grants',
];

export default function ForCaseworkers() {
  const navigate = useNavigate();

  return (
    <section className="py-28 px-6" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)' }}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium mb-6">
            <Users size={14} /> For Social Workers and Nonprofits
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 mb-4">Your clients, always in view.</h2>
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            The Redreemer dashboard gives you real-time visibility into every client's journey. See who is progressing, who has gone quiet, and who needs a human touch.
          </p>
          <div className="space-y-3 mb-8">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-gray-800 text-sm">
                <CheckCircle size={16} className="text-indigo-500 shrink-0" /> {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Request Dashboard Access <ArrowRight size={16} />
          </button>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(99,102,241,0.08)', filter: 'blur(60px)', borderRadius: '50%' }} />
          <div className="relative bg-white rounded-2xl p-6 border border-indigo-100 shadow-xl">
            <div className="flex gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ name: 'Marcus', pct: 50, color: '#f5e000' }, { name: 'James', pct: 37, color: '#6366f1' }, { name: 'Darnell', pct: 25, color: '#10b981' }].map((c) => (
                <div key={c.name} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="text-xs font-heading font-bold text-gray-900">{c.name}</div>
                  <div className="h-1.5 rounded bg-gray-200 mt-2">
                    <div className="h-full rounded transition-all" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" stroke="#e5e7eb" />
                  <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" strokeDasharray="65 35" stroke="#6366f1" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-indigo-600 text-sm font-bold">52</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
