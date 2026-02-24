/**
 * FreeAPI Main Entry Point
 * This is the main entry point for the FreeAPI CLI tool
 */

import { main } from './cli/index';

// Export the main function for programmatic usage
export { main };

// If this file is executed directly, run the CLI
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}