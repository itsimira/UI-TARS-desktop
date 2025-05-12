import { ApiConfig } from '../types';
import { TokenService } from '@main/services/token.service';
import {
  LoginResponse,
  SignUpResponse,
  ValidateResponse,
} from '@ui-tars/shared/types';

export class AuthNetwork {
  private accessToken: string | null = null;

  constructor(private readonly config: ApiConfig) {
    this.loadToken();
  }

  // Get current access token (with automatic refresh if needed)
  async getAccessToken(): Promise<string> {
    return this.accessToken as string;
  }

  // Create a method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.config.endpoint}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Login failed');
    }

    const data: LoginResponse = await response.json();

    // Save tokens from response
    if (data.token) {
      await this.saveToken(data.token);
    }

    return data;
  }

  async signup(email: string, password: string): Promise<SignUpResponse> {
    const response = await fetch(`${this.config.endpoint}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Signup failed');
    }

    const data: SignUpResponse = await response.json();

    if (data.token) {
      await this.saveToken(data.token);
    }

    return data;
  }

  async validate(): Promise<ValidateResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.config.endpoint}/auth/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Validation failed');
    }

    const data: ValidateResponse = await response.json();

    if (!data.valid) {
      throw new Error('Validation failed');
    }

    return data;
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.config.endpoint}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    } finally {
      // Even if the API call fails, clear tokens locally
      await this.clearToken();
    }
  }

  async clearToken(): Promise<void> {
    this.accessToken = null;
    await TokenService.clearToken();
  }

  private async saveToken(accessToken: string): Promise<void> {
    this.accessToken = accessToken;
    await TokenService.saveToken(accessToken);
  }

  private async loadToken(): Promise<void> {
    const token = await TokenService.loadToken();

    if (token) {
      this.accessToken = token;
    }
  }
}
