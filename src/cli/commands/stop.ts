import { Command } from 'commander';
import chalk from 'chalk';
// import inquirer from 'inquirer';

export function stopCommand(): Command {
  const command = new Command('stop')
    .description('Stop services')
    .option('-a, --all', 'Stop all services', false)
    .argument('[service]', 'Service name to stop (optional)')
    .action(async (serviceName, options) => {
       // const spinner = ora('Stopping services...').start();
      
      try {
        // TODO: Implement service stopping logic
        await new Promise(resolve => setTimeout(resolve, 800));
        
         // spinner.stop();
        
        if (serviceName) {
          console.log(chalk.blue.bold(`Stopping ${serviceName}`));
        } else if (options.all) {
          console.log(chalk.blue.bold('Stopping all services'));
        } else {
          console.log(chalk.blue.bold('Stop Services'));
        }
        
        console.log(chalk.gray('='.repeat(50)));
        console.log();
        
        console.log(chalk.yellow('Service stopping will be implemented in Phase 2.'));
        console.log();
        
        console.log(chalk.yellow('Currently running services (simulated):'));
        console.log(`  ${chalk.gray('○')} chatgpt_web  ${chalk.gray('(not running)')}`);
        console.log(`  ${chalk.gray('○')} deepseek     ${chalk.gray('(not running)')}`);
        console.log();
        
        console.log(chalk.yellow('To implement service management:'));
        console.log(`  1. ${chalk.cyan('freeapi start <service>')} - Start a service`);
        console.log(`  2. ${chalk.cyan('freeapi status')} - Check service status`);
        console.log(`  3. ${chalk.cyan('freeapi stop')} - Stop services`);
        console.log();
        
        console.log(chalk.gray('Service lifecycle management will be implemented in Phase 2.'));
        
       } catch (error) {
        // spinner.fail(chalk.red('Failed to stop services:'));
        console.error(chalk.red('Failed to stop services:'));
        console.error(chalk.red(error instanceof Error ? error.message : String(error)));
        process.exit(1);
      }
    });
  
  return command;
}