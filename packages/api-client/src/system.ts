import type { HealthResponse, PingResponse, VersionResponse } from '@mrms/types';
import type { AxiosInstance } from 'axios';


/**
 * System endpoints (Doc 09): liveness/readiness, version metadata, and ping.
 * These are the only endpoints wired in Sprint 1A; resource endpoints are added
 * per sprint from the generated OpenAPI client.
 */
export function createSystemApi(http: AxiosInstance) {
  return {
    /** `GET /health` - aggregated liveness/readiness (DB + Redis indicators). */
    async health(): Promise<HealthResponse> {
      const { data } = await http.get<HealthResponse>('/health');
      return data;
    },

    /** `GET /version` - build/version metadata. */
    async version(): Promise<VersionResponse> {
      const { data } = await http.get<VersionResponse>('/version');
      return data;
    },

    /** `GET /ping` - minimal liveness signal. */
    async ping(): Promise<PingResponse> {
      const { data } = await http.get<PingResponse>('/ping');
      return data;
    },
  };
}

export type SystemApi = ReturnType<typeof createSystemApi>;
