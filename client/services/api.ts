/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '../../shared/types/index.ts';

class ApiService {
  private baseUrl = '/api/v1';

  /**
   * Helper to retrieve auth token on demand
   */
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('metafirm_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Universal HTTP Request proxy
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const authHeader = this.getAuthHeader();
    const headers = {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options.headers || {}),
    };

    try {
      const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP Request failed with status ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error(`API Client Error [${endpoint}]:`, error);
      return {
        success: false,
        error: {
          code: 'NETWORK_OR_API_ERROR',
          message: error.message || 'An unexpected error occurred during request execution.',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * HTTP GET convenience method
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * HTTP POST convenience method
   */
  async post<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    });
  }

  /**
   * HTTP PATCH convenience method
   */
  async patch<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers,
    });
  }

  /**
   * HTTP DELETE convenience method
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * Admin: Fetch admin dashboard overview metrics
   */
  async getAdminDashboardOverview(): Promise<ApiResponse<any>> {
    return this.get<any>('/admin/dashboard/overview');
  }

  /**
   * Admin: Fetch paginated, filtered, sorted users
   */
  async getAdminUsers(params: {
    search?: string;
    filter?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.filter) query.append('filter', params.filter);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    
    return this.get<any>(`/admin/users?${query.toString()}`);
  }

  /**
   * Admin: Get details of a single user profile
   */
  async getAdminUserProfile(targetUid: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/users/${targetUid}/profile`);
  }

  /**
   * Admin: Update user profile info
   */
  async updateAdminUserProfile(
    targetUid: string,
    fields: {
      name?: string;
      email?: string;
      mobile?: string;
      status?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/users/${targetUid}/profile`, fields);
  }

  /**
   * Admin: Adjust user wallet balance
   */
  async adjustAdminUserWallet(
    targetUid: string,
    payload: {
      amount: number;
      memo: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/users/${targetUid}/wallet-adjustment`, payload);
  }

  /**
   * Admin: Send custom notification to a user
   */
  async sendAdminUserNotification(
    targetUid: string,
    payload: {
      message: string;
      priority?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/users/${targetUid}/send-notification`, payload);
  }

  /**
   * Admin: Retrieve user's transactions history
   */
  async getAdminUserTransactions(
    targetUid: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/users/${targetUid}/transactions?${query.toString()}`);
  }

  /**
   * Admin: Retrieve user's deposit history
   */
  async getAdminUserDeposits(
    targetUid: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/users/${targetUid}/deposits?${query.toString()}`);
  }

  /**
   * Admin: Retrieve user's withdrawal history
   */
  async getAdminUserWithdrawals(
    targetUid: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/users/${targetUid}/withdrawals?${query.toString()}`);
  }

  /**
   * Admin: Retrieve user's administrative audit trail
   */
  async getAdminUserAudits(
    targetUid: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    return this.get<any>(`/admin/users/${targetUid}/audits?${query.toString()}`);
  }

  /**
   * Admin: Retrieve user's referral team network downlines
   */
  async getAdminUserTeamNetwork(targetUid: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/users/${targetUid}/team`);
  }

  /**
   * Admin: Perform administrative operations (like suspension or password reset) on a user's account
   */
  async adminActionUser(
    targetUid: string,
    payload: {
      action: 'RESET_PASSWORD' | 'FORCE_PASSWORD_CHANGE' | 'SUSPEND' | 'UNLOCK' | 'CHANGE_ROLE' | 'CHANGE_VIP';
      password?: string;
      value?: any;
    }
  ): Promise<ApiResponse<any>> {
    return this.post<any>(`/users/admin/action/${targetUid}`, payload);
  }

  /**
   * Users: Retrieve currently authenticated user dashboard metrics
   */
  async getUserDashboard(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/dashboard');
  }

  /**
   * Users: Retrieve user deposit history
   */
  async getUserDeposits(params?: { limit?: number; offset?: number; status?: string }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.status) query.append('status', params.status);
    return this.get<any>(`/users/deposits?${query.toString()}`);
  }

  /**
   * Users: Retrieve user transaction history
   */
  async getUserTransactions(params?: { limit?: number; offset?: number; type?: string; status?: string }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    return this.get<any>(`/users/transactions?${query.toString()}`);
  }

  /**
   * Users: Retrieve official VIP Qualification Matrix and requirements
   */
  async getVipMatrix(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/vip-matrix');
  }

  /**
   * Users: Execute manual Daily DPY yield claim
   */
  async claimYield(claimId: string): Promise<ApiResponse<any>> {
    return this.post<any>('/users/claim-yield', { claimId });
  }

  /* =========================================================================
   * SUPPORT & ADMINISTRATIVE TICKETS ENDPOINTS
   * ========================================================================= */

  /**
   * Users: Fetch user's submitted support tickets
   */
  async getUserSupportTickets(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/support/tickets');
  }

  /**
   * Users: Create a brand new support ticket (with optional attachments in base64 payload)
   */
  async createUserSupportTicket(payload: {
    category: string;
    subject: string;
    description: string;
    attachmentName?: string;
    attachmentData?: string;
  }): Promise<ApiResponse<any>> {
    return this.post<any>('/users/support/tickets', payload);
  }

  /**
   * Users: Fetch conversation thread history for a ticket
   */
  async getTicketMessages(ticketId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/users/support/tickets/${ticketId}/messages`);
  }

  /**
   * Users: Submit response/reply inside a ticket thread
   */
  async replyToTicket(ticketId: string, message: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/users/support/tickets/${ticketId}/messages`, { message });
  }

  /**
   * Users: Resolve and close a ticket
   */
  async closeTicket(ticketId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/users/support/tickets/${ticketId}/close`, {});
  }

  /**
   * Admin: Retrieve all support tickets with pagination, search, and category filters
   */
  async getAdminSupportTickets(params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    return this.get<any>(`/admin/support/tickets?${query.toString()}`);
  }

  /**
   * Admin: Retrieve complete thread history for any ticket in system
   */
  async getAdminTicketMessages(ticketId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/admin/support/tickets/${ticketId}/messages`);
  }

  /**
   * Admin: Reply inside a user ticket thread
   */
  async replyToTicketAsAdmin(ticketId: string, message: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/admin/support/tickets/${ticketId}/messages`, { message });
  }

  /**
   * Admin: Update ticket status, priority, or assignment properties
   */
  async updateTicketProperties(
    ticketId: string,
    payload: {
      status?: string;
      priority?: string;
      assignedAdminUid?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.patch<any>(`/admin/support/tickets/${ticketId}`, payload);
  }

  /* =========================================================================
   * NOTIFICATIONS ENDPOINTS
   * ========================================================================= */

  /**
   * Users: Fetch user notifications
   */
  async getNotifications(): Promise<ApiResponse<any>> {
    return this.get<any>('/users/notifications');
  }

  /**
   * Users: Mark a single notification as read
   */
  async markNotificationRead(id: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/users/notifications/${id}/read`, {});
  }

  /**
   * Users: Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<ApiResponse<any>> {
    return this.post<any>('/users/notifications/read-all', {});
  }

  /**
   * Users: Delete/Dismiss a single notification
   */
  async deleteNotification(id: string): Promise<ApiResponse<any>> {
    return this.delete<any>(`/users/notifications/${id}`);
  }
}

export const api = new ApiService();
export default api;
