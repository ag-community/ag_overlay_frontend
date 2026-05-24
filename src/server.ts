import type { HTMLBundle } from "bun";
import { mkdir } from "node:fs/promises";
import { parseArgs } from "util";
import { XMLParser } from "fast-xml-parser";
import dashboard from "./dashboard/dashboard.html";
import index from "./index.html";
import {
  dashboardMessageSchema,
  type DashboardMessage,
} from "./schemas/settings";
import { isProduction } from "./util";
import { ALPHA2_COUNTRY_LIST } from "./utils/countries";

const BG_DIR = ".data/backgrounds";
const LOGO_DIR = ".data/logos";
const STEAM_ID64_BASE = 76561197960265728n;
const steamXmlParser = new XMLParser();

type ResolvedSteamProfile = {
  steamID: string;
  playerName: string;
  avatarUrl: string;
  flagCode?: string;
  source: "steam";
};

function normalizeCountryName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const countryNameToCode = new Map(
  Object.entries(ALPHA2_COUNTRY_LIST).map(([code, name]) => [
    normalizeCountryName(name),
    code,
  ]),
);

function countryCodeFromText(value: string | undefined) {
  if (!value) return undefined;
  const normalizedValue = normalizeCountryName(value);
  if (!normalizedValue) return undefined;

  const direct = countryNameToCode.get(normalizedValue);
  if (direct) return direct;

  for (const [name, code] of countryNameToCode) {
    if (
      normalizedValue.includes(name) ||
      name.includes(normalizedValue) ||
      normalizedValue.endsWith(` ${name}`) ||
      normalizedValue.startsWith(`${name} `)
    ) {
      return code;
    }
  }

  return undefined;
}

function steamIdToSteam64(input: string) {
  const match = input.trim().match(/^STEAM_[0-5]:([01]):(\d+)$/i);
  if (!match) return null;
  const y = BigInt(match[1]);
  const z = BigInt(match[2]);
  return (STEAM_ID64_BASE + z * 2n + y).toString();
}

function steamId3ToSteam64(input: string) {
  const match = input.trim().match(/^\[?U:1:(\d+)\]?$/i);
  if (!match) return null;
  return (STEAM_ID64_BASE + BigInt(match[1])).toString();
}

function looksLikeSteam64(input: string) {
  return /^\d{17}$/.test(input.trim());
}

function parseSteamInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (url.hostname.includes("steamcommunity.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "profiles" && parts[1]) {
        return { kind: "steam64" as const, value: parts[1] };
      }
      if (parts[0] === "id" && parts[1]) {
        return { kind: "vanity" as const, value: parts[1] };
      }
    }
  } catch {}

  const fromSteamId = steamIdToSteam64(trimmed);
  if (fromSteamId) return { kind: "steam64" as const, value: fromSteamId };

  const fromSteamId3 = steamId3ToSteam64(trimmed);
  if (fromSteamId3) return { kind: "steam64" as const, value: fromSteamId3 };

  if (looksLikeSteam64(trimmed)) {
    return { kind: "steam64" as const, value: trimmed };
  }

  return { kind: "vanity" as const, value: trimmed.replace(/^\/+|\/+$/g, "") };
}

async function fetchSteamProfileXml(path: string) {
  const res = await fetch(`https://steamcommunity.com/${path}?xml=1`);
  if (!res.ok) {
    throw new Error(`Steam XML lookup failed with ${res.status}`);
  }
  const text = await res.text();
  const parsed = steamXmlParser.parse(text);
  const profile = parsed?.profile;
  if (!profile?.steamID64) {
    throw new Error("Steam profile could not be resolved");
  }
  return profile as Record<string, string>;
}

async function fetchSteamCountryCode(path: string) {
  const res = await fetch(`https://steamcommunity.com/${path}`);
  if (!res.ok) return undefined;
  const html = await res.text();

  const countryCodeMatch = html.match(/"loccountrycode":"([A-Z]{2})"/);
  if (countryCodeMatch?.[1]) {
    return countryCodeMatch[1];
  }

  const stateMatch = html.match(/"location":"([^"]+)"/);
  if (stateMatch?.[1]) {
    return countryCodeFromText(stateMatch[1]);
  }

  return undefined;
}

async function resolveSteamProfile(rawInput: string): Promise<ResolvedSteamProfile> {
  const parsedInput = parseSteamInput(rawInput);
  if (!parsedInput) {
    throw new Error("Missing Steam input");
  }

  const initialPath =
    parsedInput.kind === "steam64"
      ? `profiles/${parsedInput.value}`
      : `id/${parsedInput.value}`;

  const profile = await fetchSteamProfileXml(initialPath);
  const steamID = String(profile.steamID64);
  const playerName = String(profile.steamID ?? "").trim();
  const avatarUrl = String(
    profile.avatarFull || profile.avatarMedium || profile.avatarIcon || "",
  ).trim();

  if (!steamID || !playerName) {
    throw new Error("Resolved Steam profile is missing required fields");
  }

  const canonicalPath = `profiles/${steamID}`;
  const flagCode =
    (await fetchSteamCountryCode(canonicalPath)) ||
    countryCodeFromText(
      String(profile.location || profile.locationCountryCode || "").trim(),
    );

  return {
    steamID,
    playerName,
    avatarUrl,
    flagCode,
    source: "steam",
  };
}

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
      "/api/steam-profile/resolve": async (req) => {
        const url = new URL(req.url);
        const query = url.searchParams.get("q")?.trim();
        if (!query) {
          return Response.json({ error: "Missing query" }, { status: 400 });
        }

        try {
          const profile = await resolveSteamProfile(query);
          return Response.json(profile);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to resolve Steam profile";
          return Response.json({ error: message }, { status: 422 });
        }
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
