import { XMLParser } from "fast-xml-parser";

const DEFAULT_AVATAR = "https://i.ibb.co/9tsY2vP/noavatar.jpg";

interface SteamResponse {
  avatarFull: string;
}

const parser = new XMLParser();

export async function getAvatarUrl(steamid: string): Promise<SteamResponse> {
  try {
    const response = await fetch(`/api/steam-avatar/${steamid}`);
    const text = await response.text();
    const data = parser.parse(text);
    const avatarFull = data?.profile?.avatarFull;
    return { avatarFull: avatarFull ?? DEFAULT_AVATAR };
  } catch {
    return { avatarFull: DEFAULT_AVATAR };
  }
}
