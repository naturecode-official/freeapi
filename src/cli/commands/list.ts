import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { configManager } from '../../utils/config';

interface ServiceInfo {
  name: string;
  type: 'api' | 'browser';
  enabled: boolean;
  configured: boolean;
  description?: string;
}

export function listCommand(): Command {
  const command = new Command('list')
    .description('List available services')
    .option('-a, --all', 'Show all services including disabled ones', false)
    .action(async (options) => {
      const spinner = ora('Loading services...').start();
      
      try {
        // Get configured services
        const configuredServices = await configManager.listServices();
        
        // Default available services
        const defaultServices = [
          { name: 'chatgpt', type: 'api' as const, description: 'OpenAI ChatGPT API service' },
          { name: 'deepseek', type: 'api' as const, description: 'DeepSeek AI API service' },
          { name: 'wenxin', type: 'api' as const, description: 'Wenxin (文心) AI service' },
          { name: 'qwen', type: 'api' as const, description: 'Qwen (通义千问) AI service' }
        ];
        
        // Load service information
        const services: ServiceInfo[] = [];
        
        for (const defaultService of defaultServices) {
          const isConfigured = configuredServices.includes(defaultService.name);
          let serviceConfig: any = {};
          let enabled = false;
          
          if (isConfigured) {
            try {
              serviceConfig = await configManager.getServiceConfig(defaultService.name);
              enabled = serviceConfig?.enabled || false;
            } catch (error) {
              // Ignore errors
            }
          }
          
          services.push({
            name: defaultService.name,
            type: defaultService.type,
            enabled,
            configured: isConfigured,
            description: defaultService.description
          });
        }
        
        spinner.stop();
        
        // Display services
        console.log(chalk.blue.bold('🤖 FreeAPI - Available AI Services'));
        console.log(chalk.gray('='.repeat(60)));
        console.log();
        
        const filteredServices = options.all 
          ? services 
          : services.filter(s => s.enabled || !s.configured);
        
        if (filteredServices.length === 0) {
          console.log(chalk.yellow('No services available.'));
          console.log(chalk.gray('Run "freeapi init" to initialize configuration.'));
          return;
        }
        
        // Display services table
        console.log(chalk.yellow('📋 Service List:'));
        console.log(chalk.gray('-'.repeat(60)));
        
        filteredServices.forEach(service => {
          const statusIcon = service.enabled ? chalk.green('●') : chalk.red('○');
          const configuredIcon = service.configured ? chalk.green('✓') : chalk.yellow('○');
          const typeIcon = service.type === 'api' ? '🔌' : '🌐';
          
          console.log(`  ${statusIcon} ${chalk.cyan(service.name.padEnd(12))} ` +
            `${typeIcon} ${service.description || ''}`);
          console.log(`    ${chalk.gray('Status:')} ${service.enabled ? chalk.green('Enabled') : chalk.red('Disabled')} ` +
            `${chalk.gray('Configured:')} ${configuredIcon}`);
          console.log();
        });
        
        // Show legend
        console.log(chalk.gray('Legend:'));
        console.log(`  ${chalk.green('●')} Enabled  ${chalk.red('○')} Disabled  ${chalk.green('✓')} Configured  ${chalk.yellow('○')} Not configured`);
        console.log(`  ${'🔌'} API Service  ${'🌐'} Browser Service`);
        console.log();
        
        // Show commands
        console.log(chalk.yellow('🚀 Quick Commands:'));
        console.log(`  ${chalk.cyan('freeapi config chatgpt')}    - Configure ChatGPT service`);
        console.log(`  ${chalk.cyan('freeapi start chatgpt')}     - Start ChatGPT service`);
        console.log(`  ${chalk.cyan('freeapi chat chatgpt')}      - Interactive chat with ChatGPT`);
        console.log(`  ${chalk.cyan('freeapi status')}            - Check service status`);
        console.log();
        
        // Show ChatGPT specific info
        const chatGPTConfig = await configManager.getServiceConfig('chatgpt');
        if (chatGPTConfig) {
          console.log(chalk.yellow('💡 ChatGPT Status:'));
          console.log(`  Mode: ${chalk.cyan(chatGPTConfig.mode || 'public')}`);
          console.log(`  Model: ${chalk.cyan(chatGPTConfig.model || 'gpt-3.5-turbo')}`);
          console.log(`  API Key: ${chatGPTConfig.api_key ? chalk.green('Configured') : chalk.yellow('Not configured')}`);
          console.log();
        }
        
        if (!options.all) {
          console.log(chalk.gray('Use ') + chalk.cyan('--all') + chalk.gray(' flag to show all services.'));
        }
        
      } catch (error) {
        spinner.fail(chalk.red('Failed to list services:'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
  
  return command;
}