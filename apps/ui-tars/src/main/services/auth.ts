import { ipcMain } from 'electron';
import { authService } from '@main/services/api/api.factory';
import { LoginData } from '@main/services/api/dto';
import { TokenService } from '@main/services/token.service';
import { ValidateResponse } from '@ui-tars/shared/types';

export function registerAuthIPC() {
  ipcMain.handle('login', async (_, userData: LoginData) => {
    return await authService.login(userData.email, userData.password);
  });

  ipcMain.handle('signup', async (_, userData: LoginData) => {
    return await authService.signup(userData.email, userData.password);
  });

  ipcMain.handle('logout', async () => {
    return await authService.clearToken();
  });

  ipcMain.handle('validate', async () => {
    try {
      return await authService.validate();
    } catch (error) {
      console.error('Validation failed:', error);
      return { valid: false, user: null } as ValidateResponse;
    }
  });

  ipcMain.handle('store-token', async (_, token: string) => {
    return TokenService.saveToken(token);
  });

  ipcMain.handle('load-token', async () => {
    try {
      return await TokenService.loadToken();
    } catch (error) {
      console.error('Failed to load tokens:', error);
      return null;
    }
  });

  ipcMain.handle('clear-token', async () => {
    return await TokenService.clearToken();
  });
}
