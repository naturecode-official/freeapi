/**
 * Configuration utilities for FreeAPI
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export interface GlobalConfig {
  version: string;
  initialized: boolean;
  services: string[];
  last_updated: number;
}

export class ConfigManager {
  private configDir: string;
  private configFile: string;
  private servicesDir: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.freeapi');
    this.configFile = path.join(this.configDir, 'config.json');
    this.servicesDir = path.join(this.configDir, 'services');
  }

  /**
   * Initialize FreeAPI configuration
   */
  async initialize(): Promise<void> {
    try {
      // Create directories
      await fs.ensureDir(this.configDir);
      await fs.ensureDir(this.servicesDir);

      // Create default config if it doesn't exist
      if (!(await fs.pathExists(this.configFile))) {
        const defaultConfig: GlobalConfig = {
          version: '1.0.0',
          initialized: true,
          services: [],
          last_updated: Date.now()
        };
        
        await fs.writeJson(this.configFile, defaultConfig, { spaces: 2 });
      }

      // Create README file
      const readmePath = path.join(this.configDir, 'README.md');
      if (!(await fs.pathExists(readmePath))) {
        const readmeContent = `# FreeAPI Configuration Directory

This directory contains FreeAPI configuration files.

## Files
- \`config.json\` - Global configuration
- \`services/\` - Service-specific configurations
- \`logs/\` - Application logs (if enabled)

## Service Configuration
Each service has its own configuration file in the \`services/\` directory.
Example: \`services/chatgpt.json\`

## Backup
You can backup this directory to preserve your configurations.
`;
        await fs.writeFile(readmePath, readmeContent);
      }
    } catch (error) {
      throw new Error(`Failed to initialize configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get global configuration
   */
  async getConfig(): Promise<GlobalConfig> {
    try {
      if (!(await fs.pathExists(this.configFile))) {
        await this.initialize();
      }
      
      return await fs.readJson(this.configFile);
    } catch (error) {
      throw new Error(`Failed to read configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update global configuration
   */
  async updateConfig(updates: Partial<GlobalConfig>): Promise<void> {
    try {
      const config = await this.getConfig();
      const updatedConfig = {
        ...config,
        ...updates,
        last_updated: Date.now()
      };
      
      await fs.writeJson(this.configFile, updatedConfig, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to update configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get service configuration
   */
  async getServiceConfig(serviceName: string): Promise<any> {
    try {
      const serviceFile = path.join(this.servicesDir, `${serviceName}.json`);
      
      if (!(await fs.pathExists(serviceFile))) {
        return null;
      }
      
      return await fs.readJson(serviceFile);
    } catch (error) {
      throw new Error(`Failed to read service configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Save service configuration
   */
  async saveServiceConfig(serviceName: string, config: any): Promise<void> {
    try {
      const serviceFile = path.join(this.servicesDir, `${serviceName}.json`);
      
      // Update global config to include this service
      const globalConfig = await this.getConfig();
      if (!globalConfig.services.includes(serviceName)) {
        globalConfig.services.push(serviceName);
        await this.updateConfig({ services: globalConfig.services });
      }
      
      await fs.writeJson(serviceFile, config, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to save service configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all configured services
   */
  async listServices(): Promise<string[]> {
    try {
      if (!(await fs.pathExists(this.servicesDir))) {
        return [];
      }
      
      const files = await fs.readdir(this.servicesDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
    } catch (error) {
      throw new Error(`Failed to list services: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete service configuration
   */
  async deleteServiceConfig(serviceName: string): Promise<void> {
    try {
      const serviceFile = path.join(this.servicesDir, `${serviceName}.json`);
      
      if (await fs.pathExists(serviceFile)) {
        await fs.remove(serviceFile);
        
        // Update global config
        const globalConfig = await this.getConfig();
        const updatedServices = globalConfig.services.filter(name => name !== serviceName);
        await this.updateConfig({ services: updatedServices });
      }
    } catch (error) {
      throw new Error(`Failed to delete service configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get configuration directory path
   */
  getConfigDir(): string {
    return this.configDir;
  }

  /**
   * Get services directory path
   */
  getServicesDir(): string {
    return this.servicesDir;
  }

  /**
   * Backup configuration
   */
  async backup(backupDir?: string): Promise<string> {
    try {
      const backupPath = backupDir || path.join(os.homedir(), 'freeapi-backup', new Date().toISOString().split('T')[0]);
      await fs.ensureDir(backupPath);
      
      await fs.copy(this.configDir, path.join(backupPath, 'config'));
      
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to backup configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Restore configuration from backup
   */
  async restore(backupPath: string): Promise<void> {
    try {
      const backupConfigDir = path.join(backupPath, 'config');
      
      if (!(await fs.pathExists(backupConfigDir))) {
        throw new Error('Backup directory does not contain configuration files');
      }
      
      // Remove existing config
      if (await fs.pathExists(this.configDir)) {
        await fs.remove(this.configDir);
      }
      
      // Restore from backup
      await fs.copy(backupConfigDir, this.configDir);
    } catch (error) {
      throw new Error(`Failed to restore configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager();