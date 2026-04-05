import { Phone, MessageSquare, X, Heart } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function CrisisModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Top band */}
        <div className="px-8 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
          <div className="w-14 h-14 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-gray-900" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 leading-tight">
            You're not alone.
          </h2>
          <p className="text-gray-800 text-sm mt-2 leading-relaxed">
            Help is available right now, 24/7. No judgment. Free and confidential.
          </p>
        </div>

        {/* Crisis lines */}
        <div className="px-8 py-6 space-y-3">
          <a href="tel:988"
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-green-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Call or Text 988</p>
              <p className="text-xs text-gray-500 mt-0.5">Suicide & Crisis Lifeline — free, 24/7</p>
            </div>
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">CALL NOW</span>
          </a>

          <a href="sms:741741&body=HELLO"
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <MessageSquare size={20} className="text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Text HOME to 741741</p>
              <p className="text-xs text-gray-500 mt-0.5">Crisis Text Line — text-based support</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">TEXT</span>
          </a>

          <a href="tel:18004799233"
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-purple-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">National Homeless Hotline</p>
              <p className="text-xs text-gray-500 mt-0.5">1-800-479-9233 — shelter & resources</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">CALL</span>
          </a>
        </div>

        <div className="px-8 pb-8">
          <p className="text-center text-xs text-gray-400 mb-4 leading-relaxed">
            These services are free, confidential, and available in multiple languages.
          </p>
          <button onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <X size={14} />
            I'm okay, close this
          </button>
        </div>
      </div>
    </div>
  );
}
