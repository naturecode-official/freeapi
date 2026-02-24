#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../../package.json';
import { initCommand } from './commands/init';
import { listCommand } from './commands/list';
import { configCommand } from './commands/config';
import { startCommand } from './commands/start';
import { chatCommand } from './commands/chat';
import { statusCommand } from './commands/status';
import { logsCommand } from './commands/logs';
import { stopCommand } from './commands/stop';

export async function main(): Promise<void> {
  const program = new Command();

  program
    .name('freeapi')
    .description('A tool that runs multiple AI web-based free chat services')
    .version(version)
    .addHelpText('after', `
Examples:
  $ freeapi init                    Initialize configuration
  $ freeapi list                    List available services
  $ freeapi config chatgpt          Configure ChatGPT service
  $ freeapi start chatgpt           Start ChatGPT service
  $ freeapi chat chatgpt            Interactive chat with ChatGPT
  $ freeapi status                  Check service status
  $ freeapi logs                    View logs
  $ freeapi stop                    Stop all services

For more information, visit: https://github.com/yourusername/freeapi
    `);

  // Add commands
  program.addCommand(initCommand());
  program.addCommand(listCommand());
  program.addCommand(configCommand());
  program.addCommand(startCommand());
  program.addCommand(chatCommand());
  program.addCommand(statusCommand());
  program.addCommand(logsCommand());
  program.addCommand(stopCommand());

  // Default command: show available configurations
  program
    .action(async () => {
      console.log(chalk.blue.bold('FreeAPI - AI Services Manager'));
      console.log(chalk.gray('Version: ' + version));
      console.log();
      
      console.log(chalk.yellow('Available Commands:'));
      console.log('  init      Initialize configuration');
      console.log('  list      List available services');
      console.log('  config    Configure specific service');
      console.log('  start     Start service');
      console.log('  chat      Interactive chat');
      console.log('  status    Check service status');
      console.log('  logs      View logs');
      console.log('  stop      Stop services');
      console.log();
      
      console.log(chalk.yellow('Usage:'));
      console.log('  freeapi <command> [options]');
      console.log();
      
      console.log(chalk.yellow('Current Status:'));
      console.log(chalk.red('  No services configured. Run "freeapi init" to get started.'));
      console.log();
      
      console.log(chalk.gray('Run "freeapi --help" for more information.'));
    });

  await program.parseAsync(process.argv);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  });
}