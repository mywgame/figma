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
}

export const api = new ApiService();
export default api;
