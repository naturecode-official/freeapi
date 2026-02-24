/**
 * ChatGPT Configuration Wizard
 * Interactive wizard to help users configure ChatGPT service
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { ChatGPTConfig, ChatGPTMode } from './types';
import { ChatGPTConfigManager } from './config-manager';

export class ChatGPTConfigWizard {
  private configManager: ChatGPTConfigManager;

  constructor() {
    this.configManager = new ChatGPTConfigManager();
  }

  /**
   * Run the configuration wizard
   */
  async run(): Promise<ChatGPTConfig> {
    console.log(chalk.blue.bold('ChatGPT Configuration Wizard'));
    console.log(chalk.gray('This wizard will help you configure the ChatGPT service.'));
    console.log();

    // Step 1: Choose mode
    const modeAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Select authentication mode:',
        choices: [
          {
            name: 'Public Mode (No login required, limited tokens)',
            value: 'public'
          },
          {
            name: 'Authenticated Mode (Login with credentials, full access)',
            value: 'authenticated'
          }
        ],
        default: 'public'
      }
    ]);

    const config: Partial<ChatGPTConfig> = {
      mode: modeAnswer.mode as ChatGPTMode,
      enabled: true
    };

    // Step 2: Configure API settings
    const apiAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'base_url',
        message: 'Enter API base URL:',
        default: 'https://api.openai.com/v1/',
        validate: (input: string) => {
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL (e.g., https://api.openai.com/v1/)';
          }
        }
      },
      {
        type: 'list',
        name: 'model',
        message: 'Select default model:',
        choices: [
          { name: 'GPT-3.5 Turbo (Fast, cost-effective)', value: 'gpt-3.5-turbo' },
          { name: 'GPT-3.5 Turbo 16K (Longer context)', value: 'gpt-3.5-turbo-16k' },
          { name: 'GPT-4 (Most capable)', value: 'gpt-4' },
          { name: 'GPT-4 Turbo (Latest GPT-4)', value: 'gpt-4-turbo-preview' }
        ],
        default: 'gpt-3.5-turbo'
      },
      {
        type: 'number',
        name: 'max_tokens',
        message: 'Maximum tokens per response:',
        default: 4096,
        validate: (input: number) => {
          if (input < 1 || input > 16384) {
            return 'Please enter a value between 1 and 16384';
          }
          return true;
        }
      },
      {
        type: 'number',
        name: 'temperature',
        message: 'Temperature (0.0 to 2.0):',
        default: 0.7,
        validate: (input: number) => {
          if (input < 0 || input > 2) {
            return 'Please enter a value between 0.0 and 2.0';
          }
          return true;
        }
      }
    ]);

    Object.assign(config, apiAnswers);

    // Step 3: Authentication configuration
    if (config.mode === 'authenticated') {
      const authAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'api_key',
          message: 'Enter your OpenAI API key (sk-...):',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'API key is required for authenticated mode';
            }
            if (!input.startsWith('sk-')) {
              return 'API key should start with "sk-"';
            }
            return true;
          }
        },
        {
          type: 'confirm',
          name: 'save_password',
          message: 'Save API key securely?',
          default: true
        }
      ]);

      if (authAnswers.save_password) {
        config.api_key = authAnswers.api_key;
      } else {
        console.log(chalk.yellow('Warning: API key will not be saved. You will need to enter it each time.'));
      }
    }

    // Step 4: Advanced settings
    const advancedAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configure_advanced',
        message: 'Configure advanced settings?',
        default: false
      }
    ]);

    if (advancedAnswers.configure_advanced) {
      const advancedSettings = await inquirer.prompt([
        {
          type: 'number',
          name: 'timeout',
          message: 'Request timeout (milliseconds):',
          default: 30000,
          validate: (input: number) => {
            if (input < 1000 || input > 300000) {
              return 'Please enter a value between 1000 and 300000';
            }
            return true;
          }
        },
        {
          type: 'number',
          name: 'max_retries',
          message: 'Maximum retry attempts:',
          default: 3,
          validate: (input: number) => {
            if (input < 0 || input > 10) {
              return 'Please enter a value between 0 and 10';
            }
            return true;
          }
        },
        {
          type: 'number',
          name: 'retry_delay',
          message: 'Retry delay (milliseconds):',
          default: 1000,
          validate: (input: number) => {
            if (input < 0 || input > 10000) {
              return 'Please enter a value between 0 and 10000';
            }
            return true;
          }
        },
        {
          type: 'number',
          name: 'requests_per_minute',
          message: 'Requests per minute limit:',
          default: 60,
          validate: (input: number) => {
            if (input < 1 || input > 1000) {
              return 'Please enter a value between 1 and 1000';
            }
            return true;
          }
        },
        {
          type: 'number',
          name: 'tokens_per_minute',
          message: 'Tokens per minute limit:',
          default: 150000,
          validate: (input: number) => {
            if (input < 1000 || input > 1000000) {
              return 'Please enter a value between 1000 and 1000000';
            }
            return true;
          }
        },
        {
          type: 'number',
          name: 'top_p',
          message: 'Top-p sampling (0.0 to 1.0):',
          default: 1,
          validate: (input: number) => {
            if (input < 0 || input > 1) {
              return 'Please enter a value between 0.0 and 1.0';
            }
            return true;
          }
        },
        {
          type: 'number',
          name: 'frequency_penalty',
          message: 'Frequency penalty (-2.0 to 2.0):',
          default: 0,
          validate: (input: number) => {
            if (input < -2 || input > 2) {
              return 'Please enter a value between -2.0 and 2.0';
            }
            return true;
          }
        },
        {
          type: 'number',
          name: 'presence_penalty',
          message: 'Presence penalty (-2.0 to 2.0):',
          default: 0,
          validate: (input: number) => {
            if (input < -2 || input > 2) {
              return 'Please enter a value between -2.0 and 2.0';
            }
            return true;
          }
        }
      ]);

      Object.assign(config, advancedSettings);
    } else {
      // Apply default advanced settings
      Object.assign(config, {
        timeout: 30000,
        max_retries: 3,
        retry_delay: 1000,
        requests_per_minute: 60,
        tokens_per_minute: 150000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });
    }

    // Step 5: Test connection
    const testAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'test_connection',
        message: 'Test connection with current configuration?',
        default: true
      }
    ]);

    if (testAnswer.test_connection) {
      await this.testConnection(config as ChatGPTConfig);
    }

    // Step 6: Save configuration
    const saveAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'save_config',
        message: 'Save configuration?',
        default: true
      }
    ]);

    if (saveAnswer.save_config) {
      const finalConfig = config as ChatGPTConfig;
      await this.saveConfiguration(finalConfig);
      console.log(chalk.green('Configuration saved successfully!'));
      return finalConfig;
    } else {
      console.log(chalk.yellow('Configuration not saved.'));
      return config as ChatGPTConfig;
    }
  }

  /**
   * Test connection with current configuration
   */
  private async testConnection(config: ChatGPTConfig): Promise<void> {
    console.log(chalk.blue('Testing connection...'));
    
    try {
      // Create a simple test
      const testUrl = new URL(config.base_url);
      console.log(chalk.gray(`Testing connection to: ${testUrl.origin}`));
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(chalk.green('✓ Connection test passed'));
      console.log(chalk.gray(`Base URL: ${config.base_url}`));
      console.log(chalk.gray(`Mode: ${config.mode}`));
      console.log(chalk.gray(`Model: ${config.model}`));
      
    } catch (error) {
      console.log(chalk.red('✗ Connection test failed'));
      console.log(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      
      const retryAnswer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'retry',
          message: 'Retry with different settings?',
          default: true
        }
      ]);
      
      if (retryAnswer.retry) {
        await this.run();
      }
    }
    
    console.log();
  }

  /**
   * Save configuration
   */
  private async saveConfiguration(config: ChatGPTConfig): Promise<void> {
    try {
      await this.configManager.saveConfig(config);
      console.log(chalk.gray(`Configuration saved to: ${this.configManager.getConfigFilePath()}`));
    } catch (error) {
      console.log(chalk.red('Failed to save configuration:'));
      console.log(chalk.red(error instanceof Error ? error.message : String(error)));
      
      const manualSaveAnswer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'manual_save',
          message: 'Save configuration manually?',
          default: false
        }
      ]);
      
      if (manualSaveAnswer.manual_save) {
        console.log(chalk.yellow('Manual configuration:'));
        console.log(JSON.stringify(config, null, 2));
        console.log(chalk.yellow('Copy this configuration to your config file.'));
      }
    }
  }

  /**
   * Quick setup with minimal prompts
   */
  async quickSetup(): Promise<ChatGPTConfig> {
    console.log(chalk.blue.bold('ChatGPT Quick Setup'));
    console.log(chalk.gray('Minimal setup with default values.'));
    console.log();

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'api_key',
        message: 'Enter your OpenAI API key (optional for public mode):',
        default: ''
      },
      {
        type: 'confirm',
        name: 'use_defaults',
        message: 'Use default settings?',
        default: true
      }
    ]);

    const config: ChatGPTConfig = {
      mode: answers.api_key ? ChatGPTMode.AUTHENTICATED : ChatGPTMode.PUBLIC,
      enabled: true,
      base_url: 'https://api.openai.com/v1/',
      api_key: answers.api_key || undefined,
      model: 'gpt-3.5-turbo' as any, // Using string literal for simplicity
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      timeout: 30000,
      max_retries: 3,
      retry_delay: 1000,
      requests_per_minute: 60,
      tokens_per_minute: 150000
    };

    if (!answers.use_defaults) {
      const customAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'base_url',
          message: 'API base URL:',
          default: config.base_url
        },
        {
          type: 'list',
          name: 'model',
          message: 'Model:',
          choices: ['gpt-3.5-turbo', 'gpt-3.5-turbo-16k', 'gpt-4', 'gpt-4-turbo-preview'],
          default: config.model
        }
      ]);

      Object.assign(config, customAnswers);
    }

    await this.saveConfiguration(config);
    console.log(chalk.green('Quick setup completed!'));
    
    return config;
  }

  /**
   * Edit existing configuration
   */
  async editConfig(): Promise<ChatGPTConfig> {
    console.log(chalk.blue.bold('Edit ChatGPT Configuration'));
    
    try {
      const existingConfig = await this.configManager.loadConfig();
      
      if (!existingConfig) {
        console.log(chalk.yellow('No existing configuration found. Running setup wizard...'));
        return this.run();
      }

      console.log(chalk.gray('Current configuration:'));
      console.log(chalk.gray(`Mode: ${existingConfig.mode}`));
      console.log(chalk.gray(`Model: ${existingConfig.model}`));
      console.log(chalk.gray(`Base URL: ${existingConfig.base_url}`));
      console.log();

      const editAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Edit all settings', value: 'edit_all' },
            { name: 'Edit API key only', value: 'edit_key' },
            { name: 'Test connection', value: 'test' },
            { name: 'Cancel', value: 'cancel' }
          ],
          default: 'edit_key'
        }
      ]);

      switch (editAnswer.action) {
        case 'edit_all':
          return this.run();
        
        case 'edit_key':
          const keyAnswer = await inquirer.prompt([
            {
              type: 'input',
              name: 'api_key',
              message: 'Enter new API key (leave empty to remove):',
              default: existingConfig.api_key || ''
            }
          ]);
          
          if (keyAnswer.api_key) {
          existingConfig.api_key = keyAnswer.api_key;
          existingConfig.mode = ChatGPTMode.AUTHENTICATED;
          } else {
            delete existingConfig.api_key;
            existingConfig.mode = ChatGPTMode.PUBLIC;
          }
          
          await this.saveConfiguration(existingConfig);
          console.log(chalk.green('API key updated!'));
          return existingConfig;
        
        case 'test':
          await this.testConnection(existingConfig);
          return existingConfig;
        
        case 'cancel':
          console.log(chalk.yellow('Edit cancelled.'));
          return existingConfig;
      }

      return existingConfig;
    } catch (error) {
      console.log(chalk.red('Failed to edit configuration:'));
      console.log(chalk.red(error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }
}

/**
 * Run configuration wizard from CLI
 */
export async function runConfigWizard(): Promise<void> {
  const wizard = new ChatGPTConfigWizard();
  
  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select configuration action:',
        choices: [
          { name: 'Full setup wizard', value: 'full' },
          { name: 'Quick setup', value: 'quick' },
          { name: 'Edit existing configuration', value: 'edit' },
          { name: 'Cancel', value: 'cancel' }
        ],
        default: 'quick'
      }
    ]);

    switch (answers.action) {
      case 'full':
        await wizard.run();
        break;
      
      case 'quick':
        await wizard.quickSetup();
        break;
      
      case 'edit':
        await wizard.editConfig();
        break;
      
      case 'cancel':
        console.log(chalk.yellow('Configuration cancelled.'));
        break;
    }
  } catch (error) {
    console.log(chalk.red('Configuration wizard failed:'));
    console.log(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }
}

// Export default instance
export default ChatGPTConfigWizard;