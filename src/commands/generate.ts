import { program } from 'commander';
import chalk from 'chalk';
import { promptQuestions } from '../prompts/index.js';
import { generateProject } from '../generators/projectGenerator.js';

program
  .name('apibolt')
  .description('Bootstrap a production-ready Node.js/Express backend in under 30 seconds')
  .argument('[project-name]', 'Name of the project directory')
  .action(async (projectName: string | undefined) => {
    try {
      console.log(chalk.bold.cyan('\n🚀 Welcome to APIBolt!\n'));
      
      const answers = await promptQuestions(projectName);
      await generateProject(answers);
      
    } catch (error: any) {
      if (error && error.name === 'ExitPromptError') {
        console.log(chalk.yellow('\n👋 Generation cancelled. Bye!'));
      } else {
        console.error(chalk.red('\n❌ Error generating project:'), error);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
