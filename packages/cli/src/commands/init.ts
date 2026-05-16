import path from "path";
import fs from "fs/promises";
import ora from "ora";
import chalk from "chalk";
import { execa } from "execa";
import prompts from "prompts";
import { writeFile } from "../utils/writeFile";
const TEMPLATES: Record<string, string> = {
  todo: "todo-app",
  chat: "chat-app",
  notes: "notes-app",
  blank: "blank",
};

const MAX_PACKAGE_NAME_LENGTH = 214;

function getAppNameValidationError(value: string): string | null {
  if (!/^[a-z0-9-]+$/.test(value)) {
    return "App name can only contain lowercase letters, numbers, and dashes.";
  }

  if (value.length > MAX_PACKAGE_NAME_LENGTH) {
    return `App name must be ${MAX_PACKAGE_NAME_LENGTH} characters or fewer.`;
  }

  return null;
}

export async function initCommand(
  appNameArg: string | undefined,
  options: { template: string; install: boolean }
): Promise<void> {
  // ── Step 1: App name ──────────────────────────────────────────────────────
  let appName = appNameArg;

  if (appName !== undefined) {
    const validationError = getAppNameValidationError(appName);

    if (validationError !== null) {
      console.error(chalk.red(`Error: ${validationError}`));
      process.exit(1);
    }
  }

  if (appName === undefined || appName.trim() === "") {
    const response = await prompts({
      type: "text",
      name: "appName",
      message: "What is your app name?",
      initial: "my-zerithdb-app",
      validate: (v: string) => getAppNameValidationError(v) ?? true,
    });

    appName = response.appName as string;
  }

  if (appName === undefined || appName.trim() === "") {
    console.log(chalk.red("Aborted."));
    process.exit(1);
  }

  // ── Step 2: Template selection ────────────────────────────────────────────
  let template = options.template;

  if (!(template in TEMPLATES)) {
    const response = await prompts({
      type: "select",
      name: "template",
      message: "Pick a starter template",
      choices: [
        { title: "✅  Todo App", value: "todo" },
        { title: "💬  Chat App", value: "chat" },
        { title: "📝  Notes App", value: "notes" },
        { title: "📦  Blank", value: "blank" },
      ],
    });

    template = response.template as string;
  }

  const targetDir = path.resolve(process.cwd(), appName);

  // ── Step 3: Scaffold ───────────────────────────────────────────────────────
  const spinner = ora().start();

  try {
    spinner.text = `Creating project directory for ${chalk.cyan(appName)}...`;
    await fs.mkdir(targetDir, { recursive: true });

    spinner.text = "Generating starter application files...";
    await scaffoldTemplate(targetDir, appName, template);

    spinner.text = "Configuring ZerithDB starter setup...";

    spinner.succeed(`Created ${chalk.cyan(appName)} successfully`);
  } catch (err) {
    spinner.fail("Project scaffolding failed");
    console.error(err);
    process.exit(1);
  }

  // ── Step 4: Install ────────────────────────────────────────────────────────
  if (options.install) {
    const installSpinner = ora("Installing project dependencies...").start();

    try {
      await execa("npm", ["install"], { cwd: targetDir });

      installSpinner.succeed("Dependencies installed successfully");
    } catch {
      installSpinner.warn("Dependency installation failed. Please run `npm install` manually.");
    }
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log(`
${chalk.green("✔")} ${chalk.bold("Your ZerithDB app is ready!")}

${chalk.gray("Project:")} ${chalk.cyan(appName)}
${chalk.gray("Template:")} ${chalk.cyan(TEMPLATES[template] ?? template)}

${chalk.gray("Next steps:")}
  ${chalk.cyan(`cd ${appName}`)}
  ${chalk.cyan("npm run dev")}

${chalk.gray("Local development:")}
  ${chalk.cyan("http://localhost:3000")}

${chalk.gray("Available commands:")}
  ${chalk.cyan("npm run dev")}    Start development server
  ${chalk.cyan("npm run build")}  Create production build
  ${chalk.cyan("npm run start")}  Start production server

${chalk.gray("Docs:")} https://zerithdb.dev/docs
${chalk.gray("Discord:")} https://discord.gg/MhvuDvzWfF
`);
}

async function scaffoldTemplate(
  targetDir: string,
  appName: string,
  template: string
): Promise<void> {
  // Write package.json
  const pkg = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
    },
    dependencies: {
      "zerithdb-sdk": "latest",
      next: "^14.2.0",
      react: "^18.3.0",
      "react-dom": "^18.3.0",
    },
    devDependencies: {
      typescript: "^5.5.0",
      "@types/react": "^18.3.0",
      "@types/node": "^22.0.0",
    },
  };

  await writeFile(targetDir, "package.json", JSON.stringify(pkg, null, 2));

  const indexContent = template === "todo" ? todoTemplate(appName) : blankTemplate(appName);

  const layoutContent = layoutTemplate();

  await writeFile(targetDir, "src/app/page.tsx", indexContent);
  await writeFile(targetDir, "src/app/layout.tsx", layoutContent);

  // .gitignore
  await writeFile(targetDir, ".gitignore", "node_modules\n.next\ndist\n.env\n");
}

function layoutTemplate(): string {
  return `"use client";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;
}

function todoTemplate(appName: string): string {
  return `"use client";
// ${appName} — ZerithDB Todo App
// Generated by \`npx zerithdb init\`

import { createApp } from "zerithdb-sdk";

const app = createApp({
  appId: "${appName}",
});

app.sync.enable();

export default function App() {
  return <div>Hello from ZerithDB! Edit src/App.tsx to get started.</div>;
}
`;
}

function blankTemplate(appName: string): string {
  return `"use client";
// ${appName} — ZerithDB App
import { createApp } from "zerithdb-sdk";

const app = createApp({ appId: "${appName}" });

export default function App() {
  return <div>Hello ZerithDB!</div>;
}
`;
}
