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
}

export const api = new ApiService();
export default api;
