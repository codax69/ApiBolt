import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import Handlebars from 'handlebars';
import ora from 'ora';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { ProjectAnswers } from '../prompts/index.js';

// Register Handlebars helpers
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});
Handlebars.registerHelper('or', function (a, b) {
  return a || b;
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, '../templates');

interface FileMap {
  src: string;
  dest: string;
}

export async function generateProject(answers: ProjectAnswers): Promise<void> {
  const targetDir = path.join(process.cwd(), answers.projectName);
  
  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`\n❌ Error: Directory "${answers.projectName}" already exists.`));
    process.exit(1);
  }
  
  const spinner = ora('Creating folder structure...').start();
  
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    
    // Define templates to be copied and compiled
    const filesToGenerate: FileMap[] = [];
    
    // Common files
    filesToGenerate.push({ src: 'common/env.hbs', dest: '.env' });
    filesToGenerate.push({ src: 'common/gitignore.hbs', dest: '.gitignore' });
    filesToGenerate.push({ src: 'common/README.md.hbs', dest: 'README.md' });
    
    if (answers.docker) {
      filesToGenerate.push({ src: 'common/Dockerfile.hbs', dest: 'Dockerfile' });
      filesToGenerate.push({ src: 'common/docker-compose.yml.hbs', dest: 'docker-compose.yml' });
    }
    
    if (answers.cicd) {
      filesToGenerate.push({ src: 'common/github-workflow.hbs', dest: '.github/workflows/node.yml' });
    }
    
    if (answers.database === 'postgresql') {
      filesToGenerate.push({ src: 'common/schema.prisma.hbs', dest: 'prisma/schema.prisma' });
    }
    
    // Language specific files
    const lang = answers.language;
    const ext = lang === 'typescript' ? 'ts' : 'js';
    const langFolder = lang === 'typescript' ? 'typescript' : 'javascript';
    
    filesToGenerate.push({ src: `${langFolder}/package.json.hbs`, dest: 'package.json' });
    filesToGenerate.push({ src: `${langFolder}/src/index.${ext}.hbs`, dest: `src/index.${ext}` });
    filesToGenerate.push({ src: `${langFolder}/src/app.${ext}.hbs`, dest: `src/app.${ext}` });
    
    // Utilities
    filesToGenerate.push({ src: `${langFolder}/src/utils/ApiError.${ext}.hbs`, dest: `src/utils/ApiError.${ext}` });
    filesToGenerate.push({ src: `${langFolder}/src/utils/ApiResponse.${ext}.hbs`, dest: `src/utils/ApiResponse.${ext}` });
    filesToGenerate.push({ src: `${langFolder}/src/utils/asyncHandler.${ext}.hbs`, dest: `src/utils/asyncHandler.${ext}` });
    
    if (answers.logging) {
      filesToGenerate.push({ src: `${langFolder}/src/utils/logger.${ext}.hbs`, dest: `src/utils/logger.${ext}` });
    }
    
    // Middlewares
    filesToGenerate.push({ src: `${langFolder}/src/middlewares/error.middleware.${ext}.hbs`, dest: `src/middlewares/error.middleware.${ext}` });
    
    if (answers.language === 'typescript') {
      filesToGenerate.push({ src: 'typescript/tsconfig.json.hbs', dest: 'tsconfig.json' });
    }
    
    // Database Connection
    if (answers.database !== 'none') {
      filesToGenerate.push({ src: `${langFolder}/src/config/db.${ext}.hbs`, dest: `src/config/db.${ext}` });
    }
    
    // Auth Module
    if (answers.auth) {
      filesToGenerate.push({ src: `${langFolder}/src/middlewares/auth.middleware.${ext}.hbs`, dest: `src/middlewares/auth.middleware.${ext}` });
      filesToGenerate.push({ src: `${langFolder}/src/controllers/auth.controller.${ext}.hbs`, dest: `src/controllers/auth.controller.${ext}` });
      filesToGenerate.push({ src: `${langFolder}/src/routes/auth.routes.${ext}.hbs`, dest: `src/routes/auth.routes.${ext}` });
      filesToGenerate.push({ src: `${langFolder}/src/models/user.model.${ext}.hbs`, dest: `src/models/user.model.${ext}` });
    }
    
    // Validation Module
    if (answers.validation !== 'none') {
      filesToGenerate.push({ src: `${langFolder}/src/middlewares/validation.middleware.${ext}.hbs`, dest: `src/middlewares/validation.middleware.${ext}` });
    }
    if (answers.validation === 'zod') {
      filesToGenerate.push({ src: `${langFolder}/src/zod/auth.validation.${ext}.hbs`, dest: `src/zod/auth.validation.${ext}` });
    }
    
    // Testing
    if (answers.testing) {
      filesToGenerate.push({ src: `${langFolder}/tests/health.test.${ext}.hbs`, dest: `tests/health.test.${ext}` });
      if (answers.auth) {
        filesToGenerate.push({ src: `${langFolder}/tests/auth.test.${ext}.hbs`, dest: `tests/auth.test.${ext}` });
      }
    }
    
    // Compile and write files
    for (const file of filesToGenerate) {
      const templatePath = path.join(templatesDir, file.src);
      const destPath = path.join(targetDir, file.dest);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found: ${templatePath}`);
      }
      
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = Handlebars.compile(templateContent);
      const result = compiledTemplate(answers);
      
      // Ensure target folder exists
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, result, 'utf8');
    }
    
    spinner.succeed(chalk.green('Project structure and files generated successfully!'));
    
    // Package installation
    const packageManager = getPackageManager();
    
    if (answers.install) {
      console.log(chalk.cyan(`\n📦 Using package manager: ${packageManager}`));
      
      const installSpinner = ora(`Installing dependencies with ${packageManager} install...`).start();
      try {
        execSync(`${packageManager} install`, { cwd: targetDir, stdio: 'ignore' });
        installSpinner.succeed(chalk.green('Dependencies installed successfully!'));
      } catch (installErr) {
        installSpinner.fail(chalk.red('Failed to install dependencies automatically.'));
        console.log(chalk.yellow(`You can run "${packageManager} install" manually after setup.`));
      }
      
      // Additional Prisma Client generation if using PostgreSQL
      if (answers.database === 'postgresql') {
        const prismaSpinner = ora('Generating Prisma client...').start();
        try {
          execSync(`npx prisma generate`, { cwd: targetDir, stdio: 'ignore' });
          prismaSpinner.succeed(chalk.green('Prisma Client generated!'));
        } catch (prismaErr) {
          prismaSpinner.fail(chalk.red('Failed to generate Prisma client automatically.'));
          console.log(chalk.yellow('You will need to run "npx prisma generate" manually.'));
        }
      }
    } else {
      console.log(chalk.yellow(`\n⚠️  Skipped automatic package installation.`));
    }
    
    // Print success summary
    console.log(chalk.bold.green('\n🎉 Project Ready!\n'));
    console.log(`To get started, run standard commands:`);
    console.log(chalk.cyan(`  cd ${answers.projectName}`));
    
    if (!answers.install) {
      console.log(chalk.cyan(`  ${packageManager === 'npm' ? 'npm install' : packageManager + ' install'}`));
      if (answers.database === 'postgresql') {
        console.log(chalk.cyan(`  npx prisma generate`));
      }
    }
    
    if (packageManager === 'npm') {
      console.log(chalk.cyan(`  npm run dev`));
    } else {
      console.log(chalk.cyan(`  ${packageManager} dev`));
    }
    console.log();
    
  } catch (error) {
    spinner.fail(chalk.red('Generation failed.'));
    console.error(error);
    process.exit(1);
  }
}

function getPackageManager(): string {
  const userAgent = process.env.npm_config_user_agent || '';
  if (userAgent.startsWith('yarn')) return 'yarn';
  if (userAgent.startsWith('pnpm')) return 'pnpm';
  return 'npm';
}
