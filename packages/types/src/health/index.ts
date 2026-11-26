export type HealthCheckState = 'up' | 'down' | 'degraded';

export interface DependencyHealthCheck {
  status: HealthCheckState;
  latency?: number;
  message?: string;
}

export interface HealthStatusResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: Record<string, DependencyHealthCheck>;
  system?: {
    memory?: {
      heapUsed: string;
      heapTotal: string;
      rss: string;
      external: string;
    };
    nodeVersion?: string;
    platform?: string;
    pid?: number;
  };
}
