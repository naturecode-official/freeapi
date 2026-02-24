import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export function initCommand(): Command {
  const command = new Command('init')
    .description('Initialize FreeAPI configuration')
    .option('-f, --force', 'Force reinitialization', false)
    .action(async (options) => {
      const spinner = ora('Initializing FreeAPI...').start();
      
      try {
        const configDir = path.join(os.homedir(), '.freeapi');
        const configFile = path.join(configDir, 'config.yaml');
        
        // Check if already initialized
        if (await fs.pathExists(configFile) && !options.force) {
          spinner.warn('FreeAPI is already initialized.');
          
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Do you want to reinitialize? This will overwrite existing configuration.',
              default: false,
            },
          ]);
          
          if (!confirm) {
            spinner.info('Initialization cancelled.');
            return;
          }
        }
        
        // Create directories
        spinner.text = 'Creating directories...';
        await fs.ensureDir(configDir);
        await fs.ensureDir(path.join(configDir, 'services'));
        await fs.ensureDir(path.join(configDir, 'sessions'));
        await fs.ensureDir(path.join(configDir, 'logs'));
        await fs.ensureDir(path.join(configDir, 'data'));
        await fs.ensureDir(path.join(configDir, 'cache'));
        
        // Create default configuration
        spinner.text = 'Creating default configuration...';
        const defaultConfig = {
          version: '1.0',
          log_level: 'info',
          log_file: path.join(configDir, 'logs', 'freeapi.log'),
          data_dir: path.join(configDir, 'data'),
          cache_dir: path.join(configDir, 'cache'),
          services: {
            enabled: ['chatgpt_web', 'deepseek', 'wenxin'],
            default: 'chatgpt_web',
          },
          browser: {
            headless: true,
            timeout: 30000,
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          },
        };
        
        await fs.writeJson(path.join(configDir, 'config.json'), defaultConfig, { spaces: 2 });
        
        // Create service templates
        spinner.text = 'Creating service templates...';
        
        const chatgptConfig = {
          name: 'chatgpt_web',
          type: 'browser',
          enabled: false,
          credentials: {
            email: '',
            password: '',
          },
          browser: {
            executable_path: 'auto',
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
          },
          session: {
            keep_alive: true,
            refresh_interval: 3600,
            max_retries: 3,
          },
        };
        
        const deepseekConfig = {
          name: 'deepseek',
          type: 'api',
          enabled: false,
          api_key: '',
          endpoint: 'https://api.deepseek.com',
          model: 'deepseek-chat',
          max_tokens: 4096,
          temperature: 0.7,
        };
        
        await fs.writeJson(
          path.join(configDir, 'services', 'chatgpt_web.json'),
          chatgptConfig,
          { spaces: 2 }
        );
        
        await fs.writeJson(
          path.join(configDir, 'services', 'deepseek.json'),
          deepseekConfig,
          { spaces: 2 }
        );
        
        await fs.writeJson(
          path.join(configDir, 'services', 'wenxin.json'),
          { name: 'wenxin', type: 'api', enabled: false, api_key: '' },
          { spaces: 2 }
        );
        
        spinner.succeed(chalk.green('FreeAPI initialized successfully!'));
        
        console.log();
        console.log(chalk.yellow('Next steps:'));
        console.log('1. Configure services:');
        console.log('   ' + chalk.cyan('freeapi config chatgpt_web'));
        console.log('   ' + chalk.cyan('freeapi config deepseek'));
        console.log('2. Start a service:');
        console.log('   ' + chalk.cyan('freeapi start chatgpt_web'));
        console.log('3. Start interactive chat:');
        console.log('   ' + chalk.cyan('freeapi chat chatgpt_web'));
        console.log();
        console.log(chalk.gray('Configuration directory: ') + chalk.cyan(configDir));
        
      } catch (error) {
        spinner.fail(chalk.red('Initialization failed:'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
  
  return command;
}