import { apiService } from './api.service';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants';
import { LoginCredentials, AuthResponse, User } from '@/types';
import Cookies from "js-cookie"

export class AuthService {
 async login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiService.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);

  const { accessToken, refreshToken, user } = response.data;

  console.log(response.data);
  

  // Store tokens and user data
  if (accessToken) {
   
    Cookies.set(STORAGE_KEYS.AUTH_TOKEN, accessToken)
  }

  if (refreshToken) {
    Cookies.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  if (user) {
    Cookies.set(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  return response;
}


  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } finally {
      this.clearAuthData();
    }
  }

  clearAuthData(): void {
    Cookies.remove(STORAGE_KEYS.AUTH_TOKEN);
    Cookies.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Cookies.remove(STORAGE_KEYS.USER_DATA);
  }

  getToken(): string | null {
    return Cookies.get(STORAGE_KEYS!.AUTH_TOKEN) || null;
  }

  getCurrentUser(): User | null {
    const userData = Cookies.get(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    const adminRoles = ['admin', 'super_admin', 'financial_admin', 'analytics_admin', 'support'];
    return !!user?.role && adminRoles.includes(user.role);
  }

  getRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role ?? null;
  }
}

export const authService = new AuthService();
