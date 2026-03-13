import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/utils/constants';

export interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  actor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | string;
  actorEmail?: string;
  actorRole?: string;
  details?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  action?: string;
  resource?: string;
  actor?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

class AuditLogService {
  async getAll(
    page: number = 1,
    limit: number = 20,
    filters?: AuditLogFilters
  ): Promise<{ logs: AuditLog[]; total: number; totalPages: number; page: number }> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    if (filters?.action) params.set('action', filters.action);
    if (filters?.resource) params.set('resource', filters.resource);
    if (filters?.actor) params.set('actor', filters.actor);
    if ((filters as any)?.role) params.set('role', (filters as any).role);
    if (filters?.startDate) params.set('startDate', filters.startDate);
    if (filters?.endDate) params.set('endDate', filters.endDate);
    if (filters?.search) params.set('search', filters.search);

    const response = await apiService.get<any>(
      `${API_ENDPOINTS.AUDIT_LOGS}?${params.toString()}`
    );

    // Response is paginated: { success, data: [...], meta: { pagination } }
    const logs = Array.isArray(response.data) ? response.data : [];
    const pagination = response.meta?.pagination || response.pagination || {};

    return {
      logs,
      total: pagination.totalItems || logs.length,
      totalPages: pagination.totalPages || 1,
      page: pagination.currentPage || page,
    };
  }
}

export const auditLogService = new AuditLogService();
