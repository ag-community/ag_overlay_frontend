import { useWebSocket } from "partysocket/react";
import { createContext, use, useState, type ReactNode } from "react";
import { z } from "zod";
import {
  agOverlayResponseSchema,
  type AgOverlayData,
} from "~/schemas/ag_overlay";
import { useSettings } from "~/state/dashboard";

const agOverlayArraySchema = z.array(agOverlayResponseSchema);

const AG_OVERLAY_ADDRESS = "127.0.0.1:8080";

const AgOverlayContext = createContext<AgOverlayData[] | null>(null);

export function AGOverlayProvider({ children }: { children: ReactNode }) {
  const [settings] = useSettings();
  const websocketURL =
    settings.websocketURL.trim() || `ws://${AG_OVERLAY_ADDRESS}`;

  useWebSocket(websocketURL, null, {
    onOpen() {
      console.log("Connected to ag overlay");
    },

    onClose() {
      console.log("Disconnected from ag overlay");
    },

    onMessage(e) {
      let json;
      try {
        json = JSON.parse(e.data);
      } catch (error) {
        console.error(e.data);
        console.error("Failed to parse ag overlay data as JSON: ", error);
        return;
      }

      try {
        const parsedData = agOverlayArraySchema.parse(json);
        setAGOverlayData(parsedData);
      } catch (error) {
        console.error(JSON.stringify(json, null, 2));
        console.error("Failed to parse ag overlay data schema: ", error);
      }
    },

    onError() {
      console.error("Error connecting to ag overlay");
    },
  });

  const [AGOverlayData, setAGOverlayData] = useState<AgOverlayData[]>([]);

  return <AgOverlayContext value={AGOverlayData}>{children}</AgOverlayContext>;
}

export function useAGOverlay() {
  const AGOverlayData = use(AgOverlayContext);

  if (!AGOverlayData) {
    throw new Error(`useAGOverlay must be used within a AGOverlayProvider`);
  }

  return AGOverlayData;
}
