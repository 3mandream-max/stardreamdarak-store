import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type InitResult = {
  initialized: boolean;
  skipped: boolean;
  message: string;
};

let initPromise: Promise<InitResult> | null = null;
let initializedOnce = false;

function isEnabled() {
  return process.env.RUNTIME_DB_INIT_ENABLED === "true";
}

function shouldAutoRunOnRequest() {
  return process.env.RUNTIME_DB_INIT_ON_FIRST_REQUEST === "true";
}

function hasInitToken(token: string | null) {
  const expected = process.env.INIT_DB_TOKEN;
  return Boolean(expected) && token === expected;
}

async function runPrismaCommand(args: string[]) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  await execFileAsync(command, ["prisma", ...args], {
    env: process.env,
    timeout: 120000,
  });
}

async function runInit({ seed }: { seed: boolean }): Promise<InitResult> {
  if (!isEnabled()) {
    return {
      initialized: false,
      skipped: true,
      message: "Runtime DB init is disabled.",
    };
  }

  if (initializedOnce) {
    return {
      initialized: true,
      skipped: true,
      message: "Runtime DB init already completed in this runtime instance.",
    };
  }

  await runPrismaCommand(["migrate", "deploy"]);

  if (seed && process.env.RUNTIME_DB_INIT_ALLOW_SEED === "true") {
    await runPrismaCommand(["db", "seed"]);
  }

  initializedOnce = true;

  return {
    initialized: true,
    skipped: false,
    message: "Runtime DB init completed.",
  };
}

export async function maybeInitDatabaseAtRuntime() {
  if (!shouldAutoRunOnRequest()) {
    return;
  }

  if (!initPromise) {
    initPromise = runInit({ seed: false }).catch((error: unknown) => {
      initPromise = null;
      throw error;
    });
  }

  await initPromise;
}

export async function initDatabaseByRequest(input: { token: string | null; seed?: boolean }) {
  if (!hasInitToken(input.token)) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized init request.",
    };
  }

  if (!initPromise) {
    initPromise = runInit({ seed: input.seed === true }).catch((error: unknown) => {
      initPromise = null;
      throw error;
    });
  }

  const result = await initPromise;

  return {
    ok: true,
    status: 200,
    message: result.message,
    initialized: result.initialized,
    skipped: result.skipped,
  };
}

