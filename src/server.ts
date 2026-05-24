import type { HTMLBundle } from "bun";
import { mkdir } from "node:fs/promises";
import { parseArgs } from "util";
import dashboard from "./dashboard/dashboard.html";
import index from "./index.html";
import {
  dashboardMessageSchema,
  type DashboardMessage,
} from "./schemas/settings";
import { isProduction } from "./util";

const BG_DIR = ".data/backgrounds";
const LOGO_DIR = ".data/logos";

const args = parseArgs({
  args: process.argv,
  options: {
    help: {
      type: "boolean",
      short: "h",
    },
    host: {
      type: "string",
      default: "localhost",
    },
    port: {
      type: "string",
      default: "7270",
      short: "p",
    },
  },
  strict: true,
  allowPositionals: true,
}).values;

if (args.help) {
  console.log(`tourney-dash [--host localhost] [-p|--port 7270]`);
  process.exit();
}

async function overrideHtmlEtags(htmlFiles: HTMLBundle[], value: string) {
  htmlFiles.forEach((htmlFile) =>
    htmlFile.files?.forEach((file) => {
      if (file.loader === "html") {
        file.headers.etag = value;
      }
    }),
  );
}

async function run() {
  let lastMessage: DashboardMessage | null = null;

  // Bun.build does not seem to change the etag header on changing the hash part
  // of asset filenames because the content of the original HTML file didn't
  // change, leading to 404s, so instead we inject our own at build time
  if (typeof BUILD_TIME_ETAG !== "undefined") {
    await overrideHtmlEtags([index, dashboard], BUILD_TIME_ETAG);
  }

  await mkdir(BG_DIR, { recursive: true });
  await mkdir(LOGO_DIR, { recursive: true });

  return Bun.serve({
    hostname: args.host,
    port: args.port,
    routes: {
      "/dashboard": dashboard,
      "/ws": (req, server) => {
        if (server.upgrade(req)) {
          return;
        }
        return new Response("Upgrade failed", { status: 400 });
      },
      "/api/steam-avatar/:steamId": async (req) => {
        const url = new URL(req.url);
        const steamId = url.pathname.split("/").pop();
        if (!steamId) return new Response("Missing steamId", { status: 400 });
        const res = await fetch(
          `https://steamcommunity.com/profiles/${steamId}?xml=1`,
        );
        return new Response(res.body, {
          headers: { "content-type": "text/xml" },
        });
      },
      "/api/upload-background": async (req) => {
        if (req.method !== "POST") {
          return new Response("Method not allowed", { status: 405 });
        }
        const form = await req.formData();
        const file = form.get("file");
        if (!file || !(file instanceof File)) {
          return new Response("No file uploaded", { status: 400 });
        }
        const buf = await file.arrayBuffer();
        const hash = await crypto.subtle.digest("SHA-256", buf).then((h) =>
          Array.from(new Uint8Array(h))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""),
        );
        const ext = file.name.split(".").pop() || "png";
        const filename = `${hash}.${ext}`;
        const filepath = `${BG_DIR}/${filename}`;
        if (!(await Bun.file(filepath).exists())) {
          await Bun.write(filepath, buf);
        }
        return Response.json({ url: `/uploads/backgrounds/${filename}` });
      },
      "/uploads/backgrounds/:file": async (req) => {
        const url = new URL(req.url);
        const name = url.pathname.split("/").pop();
        if (!name) return new Response("Not found", { status: 404 });
        const file = Bun.file(`${BG_DIR}/${name}`);
        if (!(await file.exists())) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(file);
      },
      "/api/upload-logo": async (req) => {
        if (req.method !== "POST") {
          return new Response("Method not allowed", { status: 405 });
        }
        const form = await req.formData();
        const file = form.get("file");
        if (!file || !(file instanceof File)) {
          return new Response("No file uploaded", { status: 400 });
        }
        const buf = await file.arrayBuffer();
        const hash = await crypto.subtle.digest("SHA-256", buf).then((h) =>
          Array.from(new Uint8Array(h))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""),
        );
        const ext = file.name.split(".").pop() || "png";
        const filename = `${hash}.${ext}`;
        const filepath = `${LOGO_DIR}/${filename}`;
        if (!(await Bun.file(filepath).exists())) {
          await Bun.write(filepath, buf);
        }
        return Response.json({ url: `/uploads/logos/${filename}` });
      },
      "/uploads/logos/:file": async (req) => {
        const url = new URL(req.url);
        const name = url.pathname.split("/").pop();
        if (!name) return new Response("Not found", { status: 404 });
        const file = Bun.file(`${LOGO_DIR}/${name}`);
        if (!(await file.exists())) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(file);
      },
      "/": index,
    },
    websocket: {
      open(ws) {
        console.log(`client has connected`);
        ws.subscribe("settings");

        if (typeof GIT_COMMIT !== "undefined") {
          ws.send(
            JSON.stringify({
              type: "HELLO",
              gitCommit: GIT_COMMIT,
            } satisfies DashboardMessage),
          );
        }

        if (lastMessage) {
          ws.send(JSON.stringify(lastMessage satisfies DashboardMessage));
        }
      },
      close(ws) {
        console.log(`client has disconnected`);
        ws.unsubscribe("settings");
      },
      message(ws, message) {
        try {
          const parsedMessage = dashboardMessageSchema.parse(
            JSON.parse(message.toString()),
          );
          ws.publish("settings", JSON.stringify(parsedMessage));
          lastMessage = parsedMessage;
        } catch (e) {
          console.error(
            "failed to forward settings sent by either overlay or dashboard:",
            e,
          );
        }
      },
      idleTimeout: 30,
    },
    development: !isProduction && {
      hmr: true,
      console: true,
    },
  });
}

export const Server = { run };
