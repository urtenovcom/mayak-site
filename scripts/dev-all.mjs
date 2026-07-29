// Поднимает всё окружение разработки одной командой:
//   1) PostgreSQL в Docker (контейнер mayak-postgres),
//   2) API админки (react-project-admin-back, порт 5000),
//   3) сайт (порт 3199, webpack — Turbopack падает на кириллице в пути).
//
// Запуск: npm run dev:all
// Ctrl+C останавливает сайт и API; контейнер БД остаётся поднятым.

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BACKEND = join(ROOT, "react-project-admin-back");

// Docker Desktop не прописывает docker в PATH этой машины.
const DOCKER_CANDIDATES = [
  "docker",
  "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe",
];

const COLORS = { site: "\x1b[36m", api: "\x1b[35m", db: "\x1b[33m", reset: "\x1b[0m" };

function log(scope, message) {
  const color = COLORS[scope] ?? "";
  console.log(`${color}[${scope}]${COLORS.reset} ${message}`);
}

function findDocker() {
  for (const candidate of DOCKER_CANDIDATES) {
    const result = spawnSync(candidate, ["--version"], { encoding: "utf8" });
    if (result.status === 0) return candidate;
  }
  return null;
}

function ensureDatabase() {
  const docker = findDocker();
  if (!docker) {
    log("db", "Docker не найден — считаю, что БД поднята другим способом.");
    return;
  }

  const running = spawnSync(
    docker,
    ["ps", "--filter", "name=mayak-postgres", "--format", "{{.Names}}"],
    { encoding: "utf8" },
  );

  if (running.stdout.includes("mayak-postgres")) {
    log("db", "PostgreSQL уже запущен.");
    return;
  }

  log("db", "Поднимаю контейнер mayak-postgres…");
  const started = spawnSync(docker, ["start", "mayak-postgres"], { encoding: "utf8" });

  if (started.status !== 0) {
    log("db", "Контейнера нет. Создайте его: docker compose up -d (из react-project-admin-back).");
    return;
  }

  // Ждём готовности, иначе Prisma отвалится на старте API.
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const ready = spawnSync(
      docker,
      ["exec", "mayak-postgres", "pg_isready", "-U", "mayak", "-d", "mayak"],
      { encoding: "utf8" },
    );
    if (ready.status === 0) {
      log("db", "PostgreSQL принимает подключения.");
      return;
    }
    spawnSync(process.execPath, ["-e", "setTimeout(()=>{},500)"]);
  }

  log("db", "PostgreSQL не ответил вовремя — API может не подняться.");
}

function run(scope, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  const pipe = (stream) => {
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => {
      for (const line of chunk.split("\n")) {
        if (line.trim()) log(scope, line.trimEnd());
      }
    });
  };

  pipe(child.stdout);
  pipe(child.stderr);

  child.on("exit", (code) => log(scope, `процесс завершился (код ${code ?? 0})`));
  return child;
}

ensureDatabase();

const children = [];

if (existsSync(join(BACKEND, "node_modules"))) {
  children.push(run("api", "npm", ["run", "dev"], BACKEND));
} else {
  log("api", "Не установлены зависимости. Выполните: npm install в react-project-admin-back");
}

children.push(run("site", "npm", ["run", "dev", "--", "--webpack", "-p", "3199"], ROOT));

log("site", "Сайт: http://localhost:3199 · Админка: http://localhost:3199/admin");
log("api", "API: http://localhost:5000");

const shutdown = () => {
  for (const child of children) child.kill();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
