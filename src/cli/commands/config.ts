import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export function configCommand(): Command {
  const command = new Command('config')
    .description('Configure a specific service')
    .argument('<service>', 'Service name to configure')
    .option('-r, --reset', 'Reset to default configuration', false)
    .action(async (serviceName, options) => {
      const spinner = ora(`Configuring ${serviceName}...`).start();
      
      try {
        const configDir = path.join(os.homedir(), '.freeapi');
        const servicesDir = path.join(configDir, 'services');
        const serviceFile = path.join(servicesDir, `${serviceName}.json`);
        
        // Check if initialized
        if (!(await fs.pathExists(configDir))) {
          spinner.fail('FreeAPI is not initialized.');
          console.log(chalk.yellow('Run "freeapi init" to initialize.'));
          return;
        }
        
        // Check if service file exists
        let serviceConfig: any = {};
        if (await fs.pathExists(serviceFile) && !options.reset) {
          try {
            serviceConfig = await fs.readJson(serviceFile);
          } catch (error) {
            spinner.warn('Invalid service configuration, creating new one...');
          }
        }
        
        // Determine service type and configuration questions
        let questions: any[] = [];
        
        if (serviceName === 'chatgpt_web') {
          questions = [
            {
              type: 'confirm',
              name: 'enabled',
              message: 'Enable ChatGPT Web service?',
              default: serviceConfig.enabled || false,
            },
            {
              type: 'input',
              name: 'credentials.email',
              message: 'ChatGPT email:',
              default: serviceConfig.credentials?.email || '',
              when: (answers: any) => answers.enabled,
              validate: (input: string) => {
                if (!input.includes('@')) {
                  return 'Please enter a valid email address';
                }
                return true;
              },
            },
            {
              type: 'password',
              name: 'credentials.password',
              message: 'ChatGPT password:',
              mask: '*',
              when: (answers: any) => answers.enabled && answers.credentials?.email,
              validate: (input: string) => {
                if (input.length < 6) {
                  return 'Password must be at least 6 characters';
                }
                return true;
              },
            },
            {
              type: 'confirm',
              name: 'browser.headless',
              message: 'Run browser in headless mode?',
              default: serviceConfig.browser?.headless ?? true,
              when: (answers: any) => answers.enabled,
            },
            {
              type: 'number',
              name: 'session.refresh_interval',
              message: 'Session refresh interval (seconds):',
              default: serviceConfig.session?.refresh_interval || 3600,
              when: (answers: any) => answers.enabled,
              validate: (input: number) => {
                if (input < 60) {
                  return 'Refresh interval must be at least 60 seconds';
                }
                return true;
              },
            },
          ];
        } else if (serviceName === 'deepseek') {
          questions = [
            {
              type: 'confirm',
              name: 'enabled',
              message: 'Enable DeepSeek service?',
              default: serviceConfig.enabled || false,
            },
            {
              type: 'password',
              name: 'api_key',
              message: 'DeepSeek API Key:',
              mask: '*',
              when: (answers: any) => answers.enabled,
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'API Key is required';
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'model',
              message: 'Model name:',
              default: serviceConfig.model || 'deepseek-chat',
              when: (answers: any) => answers.enabled,
            },
            {
              type: 'number',
              name: 'max_tokens',
              message: 'Max tokens:',
              default: serviceConfig.max_tokens || 4096,
              when: (answers: any) => answers.enabled,
              validate: (input: number) => {
                if (input < 1 || input > 16384) {
                  return 'Max tokens must be between 1 and 16384';
                }
                return true;
              },
            },
            {
              type: 'number',
              name: 'temperature',
              message: 'Temperature (0.0-2.0):',
              default: serviceConfig.temperature || 0.7,
              when: (answers: any) => answers.enabled,
              validate: (input: number) => {
                if (input < 0 || input > 2) {
                  return 'Temperature must be between 0.0 and 2.0';
                }
                return true;
              },
            },
          ];
        } else {
          // Generic API service configuration
          questions = [
            {
              type: 'confirm',
              name: 'enabled',
              message: `Enable ${serviceName} service?`,
              default: serviceConfig.enabled || false,
            },
            {
              type: 'password',
              name: 'api_key',
              message: `${serviceName} API Key:`,
              mask: '*',
              when: (answers: any) => answers.enabled,
              validate: (input: string) => {
                if (!input.trim()) {
                  return 'API Key is required';
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'endpoint',
              message: 'API Endpoint:',
              default: serviceConfig.endpoint || '',
              when: (answers: any) => answers.enabled,
            },
          ];
        }
        
        spinner.stop();
        
        // Ask configuration questions
        const answers = await inquirer.prompt(questions);
        
        // Merge with existing config
        const updatedConfig = {
          name: serviceName,
          type: serviceConfig.type || (serviceName === 'chatgpt_web' ? 'browser' : 'api'),
          ...answers,
        };
        
        // Save configuration
        spinner.start('Saving configuration...');
        await fs.ensureDir(servicesDir);
        await fs.writeJson(serviceFile, updatedConfig, { spaces: 2 });
        
        spinner.succeed(chalk.green(`${serviceName} configured successfully!`));
        
        console.log();
        console.log(chalk.yellow('Configuration saved to:'));
        console.log(chalk.cyan(serviceFile));
        console.log();
        
        if (updatedConfig.enabled) {
          console.log(chalk.green('Service is enabled. You can now:'));
          console.log(`  ${chalk.cyan(`freeapi start ${serviceName}`)} - Start the service`);
          console.log(`  ${chalk.cyan(`freeapi chat ${serviceName}`)} - Start interactive chat`);
        } else {
          console.log(chalk.yellow('Service is disabled. Enable it to use.'));
        }
        
      } catch (error) {
        spinner.fail(chalk.red('Configuration failed:'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
  
  return command;
}