import { NHAAIntegrationLog } from './types';

class LoggerService {
  private logs: NHAAIntegrationLog[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    // Seed initial startup log
    this.log({
      direction: 'INBOUND',
      action: 'CASE_SYNC',
      status: 'SUCCESS',
      details: 'NHAA Integration Adapter initialized in SANDBOX / DEMO mode. Ready for official API binding.',
      latencyMs: 12,
    });
  }

  log(entry: Omit<NHAAIntegrationLog, 'id' | 'timestamp'>) {
    const newLog: NHAAIntegrationLog = {
      ...entry,
      id: `LOG-NHAA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
    this.notify();
  }

  getLogs(): NHAAIntegrationLog[] {
    return [...this.logs];
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const NHAAIntegrationLogger = new LoggerService();
