import { Phone, MessageSquare, X, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  onClose: () => void;
}

export default function CrisisModal({ onClose }: Props) {
  const { t } = useTranslation();
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
            {t('crisis.headline')}
          </h2>
          <p className="text-gray-800 text-sm mt-2 leading-relaxed">
            {t('crisis.sub')}
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
              <p className="font-semibold text-gray-900 text-sm">{t('crisis.call988Title')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('crisis.call988Desc')}</p>
            </div>
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">{t('crisis.call988Badge')}</span>
          </a>

          <a href="sms:741741&body=HELLO"
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <MessageSquare size={20} className="text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{t('crisis.text741Title')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('crisis.text741Desc')}</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">{t('crisis.text741Badge')}</span>
          </a>

          <a href="tel:18004799233"
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-yellow-300 hover:bg-yellow-50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Phone size={20} className="text-purple-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{t('crisis.homelessTitle')}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t('crisis.homelessDesc')}</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">{t('crisis.homelessBadge')}</span>
          </a>
        </div>

        <div className="px-8 pb-8">
          <p className="text-center text-xs text-gray-400 mb-4 leading-relaxed">
            {t('crisis.footnote')}
          </p>
          <button onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <X size={14} />
            {t('crisis.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
