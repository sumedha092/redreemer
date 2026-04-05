import { useState, useCallback, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Lightbulb, Shield, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { emitAIAlert } from '@/lib/aiAlertBus';

interface Props {
  tool: 'emergency' | 'budget' | 'debt' | 'risk' | 'networth' | 'goals';
  data: Record<string, unknown>;
  className?: string;
  /** Called when AI detects a high-risk condition — used to push to notification bell */
  onAlert?: (message: string, level: 'warning' | 'danger') => void;
}

type InsightState = 'loading' | 'done' | 'error';

export default function AIInsightPanel({ tool, data, className = '', onAlert }: Props) {
  const [state, setState] = useState<InsightState>('loading');
  const [insights, setInsights] = useState<Record<string, string | number> | null>(null);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDataRef = useRef<string>('');
  const alertedRef = useRef<Set<string>>(new Set());

  const analyze = useCallback(async (d: Record<string, unknown>) => {
    setState('loading');
    setError('');
    try {
      const { data: res } = await api.post('/api/ai/insights', { tool, data: d });
      const ins = res.insights as Record<string, string | number>;
      setInsights(ins);
      setState('done');

      // Fire alerts for high-risk conditions (only once per session per level)
      const fire = (message: string, level: 'warning' | 'danger') => {
        onAlert?.(message, level);
        emitAIAlert(tool, level === 'danger' ? 'high' : 'medium', message);
      };

      const alertKey = `${tool}-${ins.riskLevel || ins.trend || ''}`;
      if (!alertedRef.current.has(alertKey)) {
        if (tool === 'emergency' && ins.riskLevel === 'high') {
          fire(`Emergency fund at HIGH risk — ${ins.prediction}`, 'danger');
          alertedRef.current.add(alertKey);
        } else if (tool === 'emergency' && ins.riskLevel === 'medium') {
          fire(`Emergency fund needs attention — ${ins.recommendation}`, 'warning');
          alertedRef.current.add(alertKey);
        } else if (tool === 'budget' && Number(ins.score) < 40) {
          fire(`Budget health is low (${ins.score}/100) — ${ins.topIssue}`, 'warning');
          alertedRef.current.add(alertKey);
        } else if (tool === 'risk' && ins.trend === 'declining') {
          fire(`Financial risk is increasing — ${ins.topRisk}`, 'danger');
          alertedRef.current.add(alertKey);
        } else if (tool === 'debt' && ins.riskFlag && ins.riskFlag !== 'null') {
          fire(`Debt alert: ${ins.riskFlag}`, 'warning');
          alertedRef.current.add(alertKey);
        }
      }
    } catch (err: any) {
      setError('AI analysis unavailable');
      setState('error');
    }
  }, [tool, onAlert]);

  // Auto-analyze on mount
  useEffect(() => {
    prevDataRef.current = JSON.stringify(data);
    analyze(data);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-analyze when data changes (debounced 2s to avoid hammering on every keystroke)
  useEffect(() => {
    const serialized = JSON.stringify(data);
    if (serialized === prevDataRef.current) return;
    prevDataRef.current = serialized;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      analyze(data);
    }, 2000);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [data, analyze]);

  const configs: Record<string, { fields: { key: string; label: string; icon: typeof Sparkles; color: string }[] }> = {
    emergency: {
      fields: [
        { key: 'prediction', label: 'AI Prediction', icon: TrendingUp, color: 'text-blue-600' },
        { key: 'recommendation', label: 'Next Action', icon: Lightbulb, color: 'text-yellow-600' },
        { key: 'insight', label: 'Insight', icon: Sparkles, color: 'text-purple-600' },
      ]
    },
    budget: {
      fields: [
        { key: 'topIssue', label: 'Top Issue', icon: AlertTriangle, color: 'text-red-500' },
        { key: 'quickWin', label: 'Quick Win', icon: Lightbulb, color: 'text-yellow-600' },
        { key: 'pattern', label: 'Pattern Detected', icon: TrendingUp, color: 'text-blue-600' },
      ]
    },
    debt: {
      fields: [
        { key: 'recommendation', label: 'AI Recommendation', icon: Sparkles, color: 'text-purple-600' },
        { key: 'quickWin', label: 'Focus Here First', icon: Lightbulb, color: 'text-yellow-600' },
        { key: 'motivation', label: 'Motivation', icon: TrendingUp, color: 'text-green-600' },
      ]
    },
    risk: {
      fields: [
        { key: 'summary', label: 'AI Summary', icon: Sparkles, color: 'text-purple-600' },
        { key: 'topRisk', label: 'Biggest Risk', icon: AlertTriangle, color: 'text-red-500' },
        { key: 'nextStep', label: 'Next Step', icon: Lightbulb, color: 'text-yellow-600' },
      ]
    },
    networth: {
      fields: [
        { key: 'assessment', label: 'Assessment', icon: Sparkles, color: 'text-purple-600' },
        { key: 'trajectory', label: '6-Month Outlook', icon: TrendingUp, color: 'text-blue-600' },
        { key: 'priority', label: 'Top Priority', icon: Lightbulb, color: 'text-yellow-600' },
      ]
    },
    goals: {
      fields: [
        { key: 'mostAchievable', label: 'Most Achievable', icon: TrendingUp, color: 'text-green-600' },
        { key: 'tip', label: 'AI Tip', icon: Lightbulb, color: 'text-yellow-600' },
        { key: 'celebration', label: 'Progress Note', icon: Sparkles, color: 'text-purple-600' },
      ]
    },
  };

  const config = configs[tool];

  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  // Alert banner for high-risk states shown inline
  const showAlertBanner = state === 'done' && insights && (
    (tool === 'emergency' && insights.riskLevel === 'high') ||
    (tool === 'budget' && Number(insights.score) < 40) ||
    (tool === 'risk' && insights.trend === 'declining')
  );

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white overflow-hidden ${className}`}>
      {/* Alert banner */}
      {showAlertBanner && (
        <div className="flex items-start gap-3 px-5 py-3 bg-red-50 border-b border-red-100">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700">AI Alert</p>
            <p className="text-xs text-red-600 mt-0.5">
              {tool === 'emergency' && `Your emergency fund is at HIGH risk. ${insights?.prediction}`}
              {tool === 'budget' && `Budget health is critical (${insights?.score}/100). ${insights?.topIssue}`}
              {tool === 'risk' && `Your financial risk is increasing. ${insights?.topRisk}`}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100"
        style={{ background: 'linear-gradient(135deg, #fefce8, #fff9e6)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
            <Sparkles size={12} className="text-gray-900" />
          </div>
          <span className="font-heading font-bold text-xs text-gray-900">AI Insights</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-semibold">Gemini</span>
        </div>
        {state === 'done' && (
          <button onClick={() => analyze(data)} className="text-gray-400 hover:text-gray-700 transition-colors" title="Refresh">
            <RefreshCw size={12} />
          </button>
        )}
        {state === 'loading' && (
          <div className="flex items-center gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-yellow-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {state === 'loading' && (
          <p className="text-xs text-gray-400 text-center py-3">Analyzing your data...</p>
        )}

        {state === 'error' && (
          <div className="flex items-center gap-2 py-2">
            <p className="text-xs text-gray-400">{error}</p>
            <button onClick={() => analyze(data)} className="text-xs text-yellow-600 hover:underline">Retry</button>
          </div>
        )}

        {state === 'done' && insights && (
          <div className="space-y-3">
            {/* Risk level badge */}
            {tool === 'emergency' && insights.riskLevel && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskColors[insights.riskLevel as string] || riskColors.medium}`}>
                  {String(insights.riskLevel).toUpperCase()} RISK
                </span>
                {insights.monthsUntilRisk && (
                  <span className="text-xs text-gray-500">~{insights.monthsUntilRisk} months until likely need</span>
                )}
              </div>
            )}

            {/* Budget score bar */}
            {tool === 'budget' && insights.score !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Budget Health</span>
                  <span className="font-mono font-bold text-sm text-gray-900">{insights.score}/100</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${insights.score}%`,
                      background: Number(insights.score) >= 70 ? '#16a34a' : Number(insights.score) >= 40 ? '#f5e000' : '#ef4444'
                    }} />
                </div>
                {insights.savingsOpportunity && (
                  <p className="text-[10px] text-green-600 font-medium">Potential savings: {insights.savingsOpportunity}/month</p>
                )}
              </div>
            )}

            {/* Debt risk flag */}
            {tool === 'debt' && insights.riskFlag && insights.riskFlag !== 'null' && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle size={12} className="text-red-500 shrink-0" />
                <span className="text-xs text-red-600">{String(insights.riskFlag)}</span>
              </div>
            )}

            {/* Risk trend */}
            {tool === 'risk' && insights.trend && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Trend:</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  insights.trend === 'improving' ? 'bg-green-100 text-green-700' :
                  insights.trend === 'declining' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {String(insights.trend).charAt(0).toUpperCase() + String(insights.trend).slice(1)}
                </span>
                {insights.topStrength && (
                  <span className="text-xs text-gray-400 truncate">Strength: {String(insights.topStrength)}</span>
                )}
              </div>
            )}

            {/* Goals at-risk */}
            {tool === 'goals' && insights.atRisk && insights.atRisk !== 'null' && (
              <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle size={12} className="text-red-500 shrink-0" />
                <span className="text-xs text-red-600">{String(insights.atRisk)}</span>
              </div>
            )}

            {/* Main insight fields */}
            {config.fields.map(f => insights[f.key] && (
              <div key={f.key} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon size={11} className={f.color} />
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{f.label}</p>
                  <p className="text-xs text-gray-800 leading-relaxed mt-0.5">{String(insights[f.key])}</p>
                </div>
              </div>
            ))}

            {/* Net worth milestone */}
            {tool === 'networth' && insights.milestone && (
              <div className="p-2.5 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-[9px] font-semibold text-yellow-700 uppercase">Next Milestone</p>
                <p className="text-xs text-gray-800 mt-0.5">{String(insights.milestone)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
