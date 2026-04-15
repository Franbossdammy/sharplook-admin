import { apiService } from './api.service';

export interface AppVersionConfig {
  minimumVersion: string;
  latestVersion: string;
  forceUpdate: boolean;
  updateMessage: string;
}

class AppSettingsService {
  async getVersionConfig(): Promise<AppVersionConfig> {
    const response = await apiService.get<any>('/app/version');
    return response.data;
  }

  async updateVersionConfig(config: Partial<AppVersionConfig>): Promise<AppVersionConfig> {
    const response = await apiService.patch<any>('/app/version', config);
    return response.data;
  }
}

export const appSettingsService = new AppSettingsService();
