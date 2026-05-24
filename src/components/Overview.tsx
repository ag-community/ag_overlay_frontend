import type {
  AgOverlayServerData,
  AgOverlayPlayer,
} from "~/schemas/ag_overlay";
import React, { useEffect, useRef, useState } from "react";

import agCrossfireTxt from "~/static/overviews/ag_crossfire.txt";
import agCrossfireImg from "~/static/overviews/ag_crossfire.bmp";
import agHiddenLabTxt from "~/static/overviews/ag_hidden_lab.txt";
import agHiddenLabImg from "~/static/overviews/ag_hidden_lab.bmp";
import agctfDaydreamTxt from "~/static/overviews/agctf_daydream.txt";
import agctfOutlandTxt from "~/static/overviews/agctf_outland.txt";
import agonyTxt from "~/static/overviews/agony.txt";
import agonyImg from "~/static/overviews/agony.bmp";
import bootCampTxt from "~/static/overviews/boot_camp.txt";
import bootCampImg from "~/static/overviews/boot_camp.bmp";
import bootCampxTxt from "~/static/overviews/boot_campx.txt";
import bootCampxImg from "~/static/overviews/boot_campx.bmp";
import bootboxTxt from "~/static/overviews/bootbox.txt";
import bootboxImg from "~/static/overviews/bootbox.bmp";
import bounceTxt from "~/static/overviews/bounce.txt";
import bounceImg from "~/static/overviews/bounce.bmp";
import coldFacesTxt from "~/static/overviews/cold_faces.txt";
import coldFacesImg from "~/static/overviews/cold_faces.bmp";
import combat2Txt from "~/static/overviews/combat2.txt";
import combat2Img from "~/static/overviews/combat2.bmp";
import crossfireTxt from "~/static/overviews/crossfire.txt";
import crossfireImg from "~/static/overviews/crossfire.bmp";
import cyanidestalkyardTxt from "~/static/overviews/cyanidestalkyard.txt";
import cyanidestalkyardImg from "~/static/overviews/cyanidestalkyard.bmp";
import daboTxt from "~/static/overviews/dabo.txt";
import daboImg from "~/static/overviews/dabo.bmp";
import darnTxt from "~/static/overviews/darn.txt";
import darnImg from "~/static/overviews/darn.bmp";
import datacoreTxt from "~/static/overviews/datacore.txt";
import datacoreImg from "~/static/overviews/datacore.bmp";
import dmDust2Txt from "~/static/overviews/dm_dust2.txt";
import dmDust2Img from "~/static/overviews/dm_dust2.bmp";
import doublecrossTxt from "~/static/overviews/doublecross.txt";
import doublecrossImg from "~/static/overviews/doublecross.bmp";
import echoTxt from "~/static/overviews/echo.txt";
import echoImg from "~/static/overviews/echo.bmp";
import edenTxt from "~/static/overviews/eden.txt";
import edenImg from "~/static/overviews/eden.bmp";
import elixirTxt from "~/static/overviews/elixir.txt";
import elixirImg from "~/static/overviews/elixir.bmp";
import endcampTxt from "~/static/overviews/endcamp.txt";
import endcampImg from "~/static/overviews/endcamp.bmp";
import farewellTxt from "~/static/overviews/farewell.txt";
import farewellImg from "~/static/overviews/farewell.bmp";
import flingTxt from "~/static/overviews/fling.txt";
import flingImg from "~/static/overviews/fling.bmp";
import frenziedTxt from "~/static/overviews/frenzied.txt";
import frenziedImg from "~/static/overviews/frenzied.bmp";
import frenzyTxt from "~/static/overviews/frenzy.txt";
import frenzyImg from "~/static/overviews/frenzy.bmp";
import gasworksTxt from "~/static/overviews/gasworks.txt";
import gasworksImg from "~/static/overviews/gasworks.bmp";
import havocTxt from "~/static/overviews/havoc.txt";
import havocImg from "~/static/overviews/havoc.bmp";
import homeworldTxt from "~/static/overviews/homeworld.txt";
import homeworldImg from "~/static/overviews/homeworld.bmp";
import isotonicTxt from "~/static/overviews/isotonic.txt";
import isotonicImg from "~/static/overviews/isotonic.bmp";
import killboxUsaTxt from "~/static/overviews/killbox_usa.txt";
import killboxUsaImg from "~/static/overviews/killbox_usa.bmp";
import lambdaBunkerTxt from "~/static/overviews/lambda_bunker.txt";
import lambdaBunkerImg from "~/static/overviews/lambda_bunker.bmp";
import lastCallTxt from "~/static/overviews/last_call.txt";
import lastCallImg from "~/static/overviews/last_call.bmp";
import lostVillageTxt from "~/static/overviews/lost_village.txt";
import lostVillageImg from "~/static/overviews/lost_village.bmp";
import lostVillage2Txt from "~/static/overviews/lost_village2.txt";
import lostVillage2Img from "~/static/overviews/lost_village2.bmp";
import marioLandTxt from "~/static/overviews/mario_land.txt";
import marioLandImg from "~/static/overviews/mario_land.bmp";
import mossTxt from "~/static/overviews/moss.txt";
import mossImg from "~/static/overviews/moss.bmp";
import noRemorseTxt from "~/static/overviews/no_remorse.txt";
import noRemorseImg from "~/static/overviews/no_remorse.bmp";
import obsoleteTxt from "~/static/overviews/obsolete.txt";
import obsoleteImg from "~/static/overviews/obsolete.bmp";
import olvidadaMuerteTxt from "~/static/overviews/olvidada_Muerte.txt";
import olvidadaMuerteImg from "~/static/overviews/olvidada_Muerte.bmp";
import outcryTxt from "~/static/overviews/outcry.txt";
import outcryImg from "~/static/overviews/outcry.bmp";
import pwrcoreTxt from "~/static/overviews/pwrcore.txt";
import pwrcoreImg from "~/static/overviews/pwrcore.bmp";
import rapidcoreTxt from "~/static/overviews/rapidcore.txt";
import rapidcoreImg from "~/static/overviews/rapidcore.bmp";
import ratsTxt from "~/static/overviews/rats.txt";
import ratsImg from "~/static/overviews/rats.bmp";
import rebellionTxt from "~/static/overviews/rebellion.txt";
import rebellionImg from "~/static/overviews/rebellion.bmp";
import rustmillTxt from "~/static/overviews/rustmill.txt";
import rustmillImg from "~/static/overviews/rustmill.bmp";
import scary1Txt from "~/static/overviews/scary_1.txt";
import scary1Img from "~/static/overviews/scary_1.bmp";
import scary2Txt from "~/static/overviews/scary_2.txt";
import scary2Img from "~/static/overviews/scary_2.bmp";
import semonzTxt from "~/static/overviews/semonz.txt";
import semonzImg from "~/static/overviews/semonz.bmp";
import snarkPitTxt from "~/static/overviews/snark_pit.txt";
import snarkPitImg from "~/static/overviews/snark_pit.bmp";
import stalkxTxt from "~/static/overviews/stalkx.txt";
import stalkxImg from "~/static/overviews/stalkx.bmp";
import stalkyardTxt from "~/static/overviews/stalkyard.txt";
import stalkyardImg from "~/static/overviews/stalkyard.bmp";
import subtransitTxt from "~/static/overviews/subtransit.txt";
import subtransitImg from "~/static/overviews/subtransit.bmp";
import theBeachTxt from "~/static/overviews/the_beach.txt";
import theBeachImg from "~/static/overviews/the_beach.bmp";
import undertowTxt from "~/static/overviews/undertow.txt";
import undertowImg from "~/static/overviews/undertow.bmp";
import undyzTxt from "~/static/overviews/undyz.txt";
import undyzImg from "~/static/overviews/undyz.bmp";
import urethaneTxt from "~/static/overviews/Urethane.txt";
import urethaneImg from "~/static/overviews/urethane.bmp";
import vengeanceTxt from "~/static/overviews/vengeance.txt";
import vengeanceImg from "~/static/overviews/vengeance.bmp";
import xbounceTxt from "~/static/overviews/xbounce.txt";
import xbounceImg from "~/static/overviews/xbounce.bmp";
import xbounce2Txt from "~/static/overviews/xbounce2.txt";
import xbounce2Img from "~/static/overviews/xbounce2.bmp";
import type { OverviewData } from "~/schemas/overview";
import { useSettings } from "~/state/dashboard";
import type { DashboardSettings } from "~/schemas/settings";

const overviewTxts: Record<string, string> = {
  ag_crossfire: agCrossfireTxt,
  ag_hidden_lab: agHiddenLabTxt,
  agctf_daydream: agctfDaydreamTxt,
  agctf_outland: agctfOutlandTxt,
  agony: agonyTxt,
  boot_camp: bootCampTxt,
  boot_campx: bootCampxTxt,
  bootbox: bootboxTxt,
  bounce: bounceTxt,
  cold_faces: coldFacesTxt,
  combat2: combat2Txt,
  crossfire: crossfireTxt,
  cyanidestalkyard: cyanidestalkyardTxt,
  dabo: daboTxt,
  darn: darnTxt,
  datacore: datacoreTxt,
  dm_dust2: dmDust2Txt,
  doublecross: doublecrossTxt,
  echo: echoTxt,
  eden: edenTxt,
  elixir: elixirTxt,
  endcamp: endcampTxt,
  farewell: farewellTxt,
  fling: flingTxt,
  frenzied: frenziedTxt,
  frenzy: frenzyTxt,
  gasworks: gasworksTxt,
  havoc: havocTxt,
  homeworld: homeworldTxt,
  isotonic: isotonicTxt,
  killbox_usa: killboxUsaTxt,
  lambda_bunker: lambdaBunkerTxt,
  last_call: lastCallTxt,
  lost_village: lostVillageTxt,
  lost_village2: lostVillage2Txt,
  mario_land: marioLandTxt,
  moss: mossTxt,
  no_remorse: noRemorseTxt,
  obsolete: obsoleteTxt,
  olvidada_muerte: olvidadaMuerteTxt,
  outcry: outcryTxt,
  pwrcore: pwrcoreTxt,
  rapidcore: rapidcoreTxt,
  rats: ratsTxt,
  rebellion: rebellionTxt,
  rustmill: rustmillTxt,
  scary_1: scary1Txt,
  scary_2: scary2Txt,
  semonz: semonzTxt,
  snark_pit: snarkPitTxt,
  stalkx: stalkxTxt,
  stalkyard: stalkyardTxt,
  subtransit: subtransitTxt,
  the_beach: theBeachTxt,
  undertow: undertowTxt,
  undyz: undyzTxt,
  urethane: urethaneTxt,
  vengeance: vengeanceTxt,
  xbounce: xbounceTxt,
  xbounce2: xbounce2Txt,
};

const overviewImgs: Record<string, string> = {
  ag_crossfire: agCrossfireImg,
  ag_hidden_lab: agHiddenLabImg,
  agony: agonyImg,
  boot_camp: bootCampImg,
  boot_campx: bootCampxImg,
  bootbox: bootboxImg,
  bounce: bounceImg,
  cold_faces: coldFacesImg,
  combat2: combat2Img,
  crossfire: crossfireImg,
  cyanidestalkyard: cyanidestalkyardImg,
  dabo: daboImg,
  darn: darnImg,
  datacore: datacoreImg,
  dm_dust2: dmDust2Img,
  doublecross: doublecrossImg,
  echo: echoImg,
  eden: edenImg,
  elixir: elixirImg,
  endcamp: endcampImg,
  farewell: farewellImg,
  fling: flingImg,
  frenzied: frenziedImg,
  frenzy: frenzyImg,
  gasworks: gasworksImg,
  havoc: havocImg,
  homeworld: homeworldImg,
  isotonic: isotonicImg,
  killbox_usa: killboxUsaImg,
  lambda_bunker: lambdaBunkerImg,
  last_call: lastCallImg,
  lost_village: lostVillageImg,
  lost_village2: lostVillage2Img,
  mario_land: marioLandImg,
  moss: mossImg,
  no_remorse: noRemorseImg,
  obsoloete: obsoleteImg,
  olvidada_muerte: olvidadaMuerteImg,
  outcry: outcryImg,
  pwrcore: pwrcoreImg,
  rapidcore: rapidcoreImg,
  rats: ratsImg,
  rebellion: rebellionImg,
  rustmill: rustmillImg,
  scary_1: scary1Img,
  scary_2: scary2Img,
  semonz: semonzImg,
  snark_pit: snarkPitImg,
  stalkx: stalkxImg,
  stalkyard: stalkyardImg,
  subtransit: subtransitImg,
  the_beach: theBeachImg,
  undertow: undertowImg,
  undyz: undyzImg,
  urethane: urethaneImg,
  vengeance: vengeanceImg,
  xbounce: xbounceImg,
  xbounce2: xbounce2Img,
};

type Props = {
  server: AgOverlayServerData;
};

export function Overview({ server }: Props) {
  const [settings] = useSettings();
  const { overview } = useOverviewData(server.map);
  const [containerSize, setContainerSize] = useState({
    width: 320,
    height: 240,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function calculateContainerSize() {
      const maxWidth = window.innerWidth * 0.18;
      const maxHeight = window.innerHeight * 0.23;
      const aspect = overview.imageWidth / overview.imageHeight;
      let width = maxWidth;
      let height = width / aspect;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspect;
      }
      setContainerSize({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    }
    calculateContainerSize();
    window.addEventListener("resize", calculateContainerSize);
    return () => window.removeEventListener("resize", calculateContainerSize);
  }, [overview.imageWidth, overview.imageHeight]);

  const cleanMapName = server.map
    ? normalizeOverviewMapName(server.map)
    : "crossfire";
  const mapImage =
    overview.layers.length > 0
      ? overviewImgs[cleanMapName] || crossfireImg
      : crossfireImg;
  const chromaKeyedMap = useChromaKeyImage(
    mapImage,
    overview.imageWidth,
    overview.imageHeight,
  );

  return (
    <div
      ref={containerRef}
      className="overview-container"
      style={{
        width: `${containerSize.width}px`,
        height: `${containerSize.height}px`,
      }}
    >
      <img
        src={chromaKeyedMap || mapImage}
        alt="overview"
        className="overview-map-img"
        draggable={false}
      />
      {server.players.map((player, idx) => (
        <div
          key={player.name + idx}
          className={playerDotClass(settings, player)}
          style={playerDotStyle(
            player,
            overview,
            containerSize.width,
            containerSize.height,
          )}
        ></div>
      ))}
    </div>
  );
}

function parseOverviewFile(content: string): OverviewData {
  const lines = content.split("\n");
  const overview: OverviewData = {
    zoom: 1.0,
    origin: { x: 0, y: 0, z: 0 },
    rotated: 0,
    imageWidth: 1024,
    imageHeight: 768,
    layers: [],
  };

  let inGlobal = false;
  let inLayer = false;
  let currentLayer: { image: string; height: number } | null = null;

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith("//") || line === "") continue;

    if (line.toLowerCase() === "global") {
      inGlobal = true;
      continue;
    }

    if (line.toLowerCase() === "layer") {
      inLayer = true;
      currentLayer = { image: "", height: 0 };
      continue;
    }

    if (line === "{") continue;

    if (line === "}") {
      if (inLayer && currentLayer && currentLayer.image) {
        overview.layers.push(currentLayer);
        currentLayer = null;
      }
      inGlobal = false;
      inLayer = false;
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length === 0 || !parts[0]) continue;

    const key = parts[0].toUpperCase();

    if (inGlobal) {
      if (key === "ZOOM" && parts[1]) {
        overview.zoom = Number.parseFloat(parts[1]);
      } else if (
        key === "ORIGIN" &&
        parts.length >= 4 &&
        parts[1] &&
        parts[2] &&
        parts[3]
      ) {
        overview.origin.x = Number.parseFloat(parts[1]);
        overview.origin.y = Number.parseFloat(parts[2]);
        overview.origin.z = Number.parseFloat(parts[3]);
      } else if (key === "ROTATED" && parts[1]) {
        overview.rotated = Number.parseInt(parts[1], 10);
      } else if (key === "IMAGEWIDTH" && parts[1]) {
        overview.imageWidth = Number.parseInt(parts[1], 10);
      } else if (key === "IMAGEHEIGHT" && parts[1]) {
        overview.imageHeight = Number.parseInt(parts[1], 10);
      }
    }

    if (inLayer && currentLayer) {
      if (key === "IMAGE" && parts[1]) {
        currentLayer.image = parts[1].replace(/["']/g, "");
      } else if (key === "HEIGHT" && parts[1]) {
        currentLayer.height = Number.parseFloat(parts[1]);
      }
    }
  }

  return overview;
}

function useOverviewData(mapName: string) {
  const [overview, setOverview] = useState<OverviewData>({
    zoom: 1.0,
    origin: { x: 0, y: 0, z: 0 },
    rotated: 0,
    imageWidth: 1024,
    imageHeight: 768,
    layers: [],
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapName) return;
    setLoaded(false);
    const cleanMapName = normalizeOverviewMapName(mapName);
    const txt = overviewTxts[cleanMapName];
    if (txt) {
      setOverview(parseOverviewFile(txt));
      setLoaded(true);
    } else {
      setOverview({
        zoom: 1.0,
        origin: { x: 0, y: 0, z: 0 },
        rotated: 0,
        imageWidth: 1024,
        imageHeight: 768,
        layers: [],
      });
      setLoaded(true);
    }
  }, [mapName]);

  return { overview, loaded };
}

function normalizeOverviewMapName(mapName: string) {
  return mapName
    .replace(/^maps\//, "")
    .replace(/\.bsp$/, "")
    .toLowerCase();
}

function useChromaKeyImage(src: string, width: number, height: number) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (
          typeof r === "number" &&
          typeof g === "number" &&
          typeof b === "number" &&
          g > 200 &&
          r < 100 &&
          b < 100
        ) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL("image/png"));
    };
  }, [src, width, height]);

  return dataUrl;
}

function worldToScreen(
  player: AgOverlayPlayer,
  overview: OverviewData,
  containerWidth: number,
  containerHeight: number,
) {
  const { zoom, origin, rotated, imageWidth, imageHeight } = overview;
  const screenAspect = imageWidth / imageHeight;
  let screenX: number, screenY: number;
  if (rotated) {
    const deltaX = player.x - origin.x;
    const deltaY = player.y - origin.y;
    const normalizedX = (deltaX * zoom) / 4096.0;
    const normalizedY = (deltaY * zoom * screenAspect) / 4096.0;
    screenX = imageWidth / 2.0 + normalizedX * (imageWidth / 2.0);
    screenY = imageHeight / 2.0 - normalizedY * (imageHeight / 2.0);
  } else {
    const deltaX = player.x - origin.x;
    const deltaY = player.y - origin.y;
    const normalizedX = (deltaY * zoom) / 4096.0;
    const normalizedY = (deltaX * zoom * screenAspect) / 4096.0;
    screenX = imageWidth / 2.0 - normalizedX * (imageWidth / 2.0);
    screenY = imageHeight / 2.0 - normalizedY * (imageHeight / 2.0);
  }
  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;
  return { x: screenX * scaleX, y: screenY * scaleY };
}

function isPlayerVisible(
  player: AgOverlayPlayer,
  overview: OverviewData,
  containerWidth: number,
  containerHeight: number,
) {
  const screenPos = worldToScreen(
    player,
    overview,
    containerWidth,
    containerHeight,
  );
  return (
    screenPos.x >= -20 &&
    screenPos.x <= containerWidth + 20 &&
    screenPos.y >= -20 &&
    screenPos.y <= containerHeight + 20
  );
}

function playerDotClass(settings: DashboardSettings, player: AgOverlayPlayer) {
  const team = player.team.toLowerCase();
  if (team === settings.leftTeamSettings.model.toLowerCase())
    return "overview-player-dot overview-player-dot-left";
  if (team === settings.rightTeamSettings.model.toLowerCase())
    return "overview-player-dot overview-player-dot-right";
  return "overview-player-dot overview-player-dot-other";
}

function playerDotStyle(
  player: AgOverlayPlayer,
  overview: OverviewData,
  containerWidth: number,
  containerHeight: number,
) {
  const { x, y } = worldToScreen(
    player,
    overview,
    containerWidth,
    containerHeight,
  );
  return {
    left: `${x - 6}px`,
    top: `${y - 6}px`,
    display: isPlayerVisible(player, overview, containerWidth, containerHeight)
      ? "flex"
      : "none",
  } as React.CSSProperties;
}
