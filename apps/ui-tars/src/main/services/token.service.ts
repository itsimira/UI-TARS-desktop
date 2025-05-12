import * as keytar from 'keytar';

// Service name for keytar (secure credential storage)
const SERVICE_NAME = 'Pretendic';
const ACCOUNT_NAME = 'AuthToken';

export class TokenService {
  static async saveToken(accessToken: string): Promise<void> {
    keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, accessToken);
  }

  static async loadToken(): Promise<string | null> {
    try {
      return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      return null;
    }
  }

  static async clearToken(): Promise<void> {
    keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  }
}
