import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

interface ServiceInfo {
  name: string;
  type: 'browser' | 'api';
  enabled: boolean;
  configured: boolean;
  status?: 'running' | 'stopped' | 'error';
}

export function listCommand(): Command {
  const command = new Command('list')
    .description('List available services')
    .option('-a, --all', 'Show all services including disabled ones', false)
    .action(async (options) => {
      const spinner = ora('Loading services...').start();
      
      try {
        const configDir = path.join(os.homedir(), '.freeapi');
        const servicesDir = path.join(configDir, 'services');
        
        // Check if initialized
        if (!(await fs.pathExists(configDir))) {
          spinner.fail('FreeAPI is not initialized.');
          console.log(chalk.yellow('Run "freeapi init" to initialize.'));
          return;
        }
        
        // Get all service files
        let serviceFiles: string[] = [];
        if (await fs.pathExists(servicesDir)) {
          serviceFiles = (await fs.readdir(servicesDir))
            .filter(file => file.endsWith('.json'))
            .map(file => path.basename(file, '.json'));
        }
        
        // If no service files, show default services
        if (serviceFiles.length === 0) {
          serviceFiles = ['chatgpt_web', 'deepseek', 'wenxin', 'qwen'];
        }
        
        // Load service information
        const services: ServiceInfo[] = [];
        
        for (const serviceName of serviceFiles) {
          const serviceFile = path.join(servicesDir, `${serviceName}.json`);
          let serviceConfig: any = {};
          let configured = false;
          
          if (await fs.pathExists(serviceFile)) {
            try {
              serviceConfig = await fs.readJson(serviceFile);
              configured = true;
            } catch (error) {
              // Ignore invalid JSON
            }
          }
          
          services.push({
            name: serviceName,
            type: serviceConfig.type || 'api',
            enabled: serviceConfig.enabled || false,
            configured,
            status: 'stopped', // TODO: Implement status checking
          });
        }
        
        spinner.stop();
        
        // Display services
        console.log(chalk.blue.bold('Available AI Services'));
        console.log(chalk.gray('='.repeat(50)));
        console.log();
        
        const filteredServices = options.all 
          ? services 
          : services.filter(s => s.enabled || !s.configured);
        
        if (filteredServices.length === 0) {
          console.log(chalk.yellow('No services available.'));
          console.log(chalk.gray('Run "freeapi init" to create service templates.'));
          return;
        }
        
        // Group services by type
        const browserServices = filteredServices.filter(s => s.type === 'browser');
        const apiServices = filteredServices.filter(s => s.type === 'api');
        
        if (browserServices.length > 0) {
          console.log(chalk.yellow('Browser-based Services:'));
          console.log(chalk.gray('-'.repeat(40)));
          browserServices.forEach(service => {
            const statusIcon = service.enabled ? chalk.green('✓') : chalk.red('✗');
            const configuredIcon = service.configured ? chalk.green('✓') : chalk.yellow('○');
            const statusText = service.status === 'running' ? chalk.green('running') : chalk.gray('stopped');
            
            console.log(`  ${statusIcon} ${chalk.cyan(service.name.padEnd(15))} ` +
              `[${configuredIcon} configured] [${statusText}]`);
          });
          console.log();
        }
        
        if (apiServices.length > 0) {
          console.log(chalk.yellow('API-based Services:'));
          console.log(chalk.gray('-'.repeat(40)));
          apiServices.forEach(service => {
            const statusIcon = service.enabled ? chalk.green('✓') : chalk.red('✗');
            const configuredIcon = service.configured ? chalk.green('✓') : chalk.yellow('○');
            const statusText = service.status === 'running' ? chalk.green('running') : chalk.gray('stopped');
            
            console.log(`  ${statusIcon} ${chalk.cyan(service.name.padEnd(15))} ` +
              `[${configuredIcon} configured] [${statusText}]`);
          });
          console.log();
        }
        
        // Show legend
        console.log(chalk.gray('Legend:'));
        console.log(`  ${chalk.green('✓')} Enabled  ${chalk.red('✗')} Disabled  ${chalk.yellow('○')} Not configured`);
        console.log();
        
        // Show commands
        console.log(chalk.yellow('Commands:'));
        console.log(`  ${chalk.cyan('freeapi config <service>')} - Configure a service`);
        console.log(`  ${chalk.cyan('freeapi start <service>')} - Start a service`);
        console.log(`  ${chalk.cyan('freeapi chat <service>')} - Interactive chat`);
        console.log();
        
        if (!options.all) {
          console.log(chalk.gray('Use --all flag to show disabled services.'));
        }
        
      } catch (error) {
        spinner.fail(chalk.red('Failed to list services:'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
  
  return command;
}