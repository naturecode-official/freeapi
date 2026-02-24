import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { configManager } from '../../utils/config';

export function initCommand(): Command {
  const command = new Command('init')
    .description('Initialize FreeAPI configuration')
    .option('-f, --force', 'Force reinitialization', false)
    .action(async (options) => {
      const spinner = ora('Initializing FreeAPI...').start();
      
      try {
        // Check if already initialized
        const configDir = configManager.getConfigDir();
        
        if (await import('fs-extra').then(fs => fs.pathExists(configDir)) && !options.force) {
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
        
        // Initialize configuration
        spinner.text = 'Creating directories and configuration...';
        await configManager.initialize();
        
        // Create default ChatGPT configuration
        spinner.text = 'Creating default service configurations...';
        
        const defaultChatGPTConfig = {
          name: 'chatgpt',
          type: 'api',
          enabled: true,
          mode: 'public',
          base_url: 'https://api.openai.com/v1/',
          model: 'gpt-3.5-turbo',
          max_tokens: 4096,
          temperature: 0.7,
          timeout: 30000,
          max_retries: 3
        };
        
        await configManager.saveServiceConfig('chatgpt', defaultChatGPTConfig);
        
        spinner.succeed(chalk.green('FreeAPI initialized successfully!'));
        
        console.log();
        console.log(chalk.blue.bold('🎉 FreeAPI is ready to use!'));
        console.log();
        console.log(chalk.yellow('📋 Available commands:'));
        console.log(`  ${chalk.cyan('freeapi list')}           - List available services`);
        console.log(`  ${chalk.cyan('freeapi config chatgpt')} - Configure ChatGPT service`);
        console.log(`  ${chalk.cyan('freeapi start chatgpt')}  - Start ChatGPT service`);
        console.log(`  ${chalk.cyan('freeapi chat chatgpt')}   - Interactive chat with ChatGPT`);
        console.log(`  ${chalk.cyan('freeapi status')}         - Check service status`);
        console.log(`  ${chalk.cyan('freeapi --help')}         - Show all commands`);
        console.log();
        console.log(chalk.yellow('🚀 Quick start with ChatGPT:'));
        console.log(`  1. ${chalk.cyan('freeapi config chatgpt')} - Configure with your API key`);
        console.log(`  2. ${chalk.cyan('freeapi chat chatgpt')}   - Start chatting!`);
        console.log();
        console.log(chalk.gray('Configuration directory: ') + chalk.cyan(configDir));
        console.log(chalk.gray('Run ') + chalk.cyan('freeapi --help') + chalk.gray(' for more information.'));
        
      } catch (error) {
        spinner.fail(chalk.red('Initialization failed:'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
  
  return command;
}