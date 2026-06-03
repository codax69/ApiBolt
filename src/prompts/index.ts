import { input, select, confirm } from '@inquirer/prompts';

export interface ProjectAnswers {
  projectName: string;
  language: 'javascript' | 'typescript';
  database: 'mongodb' | 'postgresql' | 'none';
  auth: boolean;
  validation: 'zod' | 'joi' | 'none';
  logging: boolean;
  docker: boolean;
  cicd: boolean;
  testing: boolean;
  install: boolean;
}

export async function promptQuestions(defaultProjectName: string | undefined): Promise<ProjectAnswers> {
  const projectName = await input({
    message: 'Project Name:',
    default: defaultProjectName || 'my-api',
    validate: (value) => {
      const name = value.trim();
      if (!name) return 'Project name cannot be empty';
      if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
        return 'Project name can only contain letters, numbers, hyphens, and underscores';
      }
      return true;
    }
  });

  const language = await select({
    message: 'Language:',
    choices: [
      { name: 'JavaScript', value: 'javascript' as const },
      { name: 'TypeScript', value: 'typescript' as const }
    ]
  });

  const database = await select({
    message: 'Database:',
    choices: [
      { name: 'MongoDB (Mongoose)', value: 'mongodb' as const },
      { name: 'PostgreSQL (Prisma)', value: 'postgresql' as const },
      { name: 'None', value: 'none' as const }
    ]
  });

  // Authentication is only relevant if there's a database to store users
  let auth = false;
  if (database !== 'none') {
    auth = await confirm({
      message: 'Enable JWT Authentication (with signup, login, refresh tokens)?',
      default: true
    });
  }

  const validation = await select({
    message: 'Validation Library:',
    choices: [
      { name: 'Zod', value: 'zod' as const },
      { name: 'Joi', value: 'joi' as const },
      { name: 'None', value: 'none' as const }
    ]
  });

  const logging = await confirm({
    message: 'Enable Logging (Winston & Morgan)?',
    default: true
  });

  const docker = await confirm({
    message: 'Enable Docker Support?',
    default: true
  });

  const cicd = await confirm({
    message: 'Enable GitHub Actions CI/CD Template?',
    default: true
  });

  const testing = await confirm({
    message: 'Enable Testing (Jest & Supertest)?',
    default: true
  });

  const install = await confirm({
    message: 'Install dependencies automatically?',
    default: true
  });

  return {
    projectName,
    language,
    database,
    auth,
    validation,
    logging,
    docker,
    cicd,
    testing,
    install
  };
}
