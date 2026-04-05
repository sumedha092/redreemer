/** Global AI alert pub/sub for DashboardShell notification bell + AIInsightPanel. */

export type AIRiskLevel = 'high' | 'medium' | 'low';

export type AIAlertListener = (tool: string, riskLevel: AIRiskLevel, message: string) => void;

const listeners = new Set<AIAlertListener>();

export function emitAIAlert(tool: string, riskLevel: AIRiskLevel, message: string) {
  listeners.forEach((fn) => {
    try {
      fn(tool, riskLevel, message);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

export function onAIAlert(listener: AIAlertListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
