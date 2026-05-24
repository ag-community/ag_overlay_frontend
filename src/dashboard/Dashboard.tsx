import { produce } from "immer";
import { screenNames, type ScreenName } from "~/schemas/screens";
import { useAGOverlay } from "~/state/ag_overlay";
import { useSettings } from "~/state/dashboard";
import { useState } from "react";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import "./dashboard.css";
import { ALPHA2_COUNTRY_LIST, getFlagUrl } from "~/utils/countries";

const sidebarItems = [
  { label: "Dashboard", anchor: "dashboard" },
  { label: "Settings", anchor: "settings" },
];

export function Dashboard() {
  const AGOverlayData = useAGOverlay();
  const [settings, setSettings] = useSettings();

  const [selectedSection, setSelectedSection] = useState(
    sidebarItems[0]?.anchor ?? "",
  );

  const setSelectedScreen = (screen: ScreenName) =>
    setSettings(
      produce((settings) => {
        settings.activeScreen = screen;
        settings.previousScreen = settings.activeScreen;
      }),
    );

  const changeBestOf = (delta: number) => {
    setSettings(
      produce((settings) => {
        const next = settings.bestOfPoints + delta;
        if (next >= 1 && next <= 15) {
          settings.bestOfPoints = next;
          const maxPoints = Math.ceil(next / 2);
          if (settings.leftTeamSettings.points > maxPoints)
            settings.leftTeamSettings.points = maxPoints;
          if (settings.rightTeamSettings.points > maxPoints)
            settings.rightTeamSettings.points = maxPoints;
        }
      }),
    );
  };

  const changeLeftPoints = (delta: number) => {
    setSettings(
      produce((settings) => {
        const next = settings.leftTeamSettings.points + delta;
        if (next >= 0 && next <= Math.ceil(settings.bestOfPoints / 2))
          settings.leftTeamSettings.points = next;
      }),
    );
  };

  const changeRightPoints = (delta: number) => {
    setSettings(
      produce((settings) => {
        const next = settings.rightTeamSettings.points + delta;
        if (next >= 0 && next <= Math.ceil(settings.bestOfPoints / 2))
          settings.rightTeamSettings.points = next;
      }),
    );
  };

  const changeRound = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.round = e.target.value;
      }),
    );
  };

  const changeTournamentName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.tournamentName = e.target.value;
      }),
    );
  };

  const handleBackgroundUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload-background", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { url: string };
    setSettings(
      produce((settings) => {
        settings.backgroundUrl = data.url;
      }),
    );
  };

  const removeBackground = () => {
    setSettings(
      produce((settings) => {
        settings.backgroundUrl = "";
      }),
    );
  };

  const changeBackgroundColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundColor = e.target.value;
      }),
    );
  };

  const changeBackgroundOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundOpacity = Number(e.target.value);
      }),
    );
  };

  const changeBackgroundBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.backgroundBlur = Number(e.target.value);
      }),
    );
  };

  const handleLogoUpload = async (
    side: "left" | "right",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload-logo", { method: "POST", body: form });
    const data = (await res.json()) as { url: string };
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamLogoUrl = data.url;
        else settings.rightTeamLogoUrl = data.url;
      }),
    );
  };

  const removeLogo = (side: "left" | "right") => {
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamLogoUrl = "";
        else settings.rightTeamLogoUrl = "";
      }),
    );
  };

  const changeTeamModel = (side: "left" | "right", value: string) => {
    setSettings(
      produce((settings) => {
        if (side === "left") settings.leftTeamSettings.model = value;
        else settings.rightTeamSettings.model = value;
      }),
    );
  };

  const changeWebsocketURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(
      produce((settings) => {
        settings.websocketURL = e.target.value;
      }),
    );
  };

  const [newLeftPlayer, setNewLeftPlayer] = useState({
    steamID: "",
    flagCode: "",
    playerName: "",
  });
  const [newRightPlayer, setNewRightPlayer] = useState({
    steamID: "",
    flagCode: "",
    playerName: "",
  });

  const addLeftPlayer = () => {
    if (
      newLeftPlayer.steamID.trim() === "" ||
      newLeftPlayer.playerName.trim() === ""
    )
      return;
    setSettings(
      produce((settings) => {
        settings.leftTeamSettings.players.push({
          steamID: newLeftPlayer.steamID,
          flagCode: newLeftPlayer.flagCode || undefined,
          playerName: newLeftPlayer.playerName,
        });
      }),
    );
    setNewLeftPlayer({ steamID: "", flagCode: "", playerName: "" });
  };

  const addRightPlayer = () => {
    if (
      newRightPlayer.steamID.trim() === "" ||
      newRightPlayer.playerName.trim() === ""
    )
      return;
    setSettings(
      produce((settings) => {
        settings.rightTeamSettings.players.push({
          steamID: newRightPlayer.steamID,
          flagCode: newRightPlayer.flagCode || undefined,
          playerName: newRightPlayer.playerName,
        });
      }),
    );
    setNewRightPlayer({ steamID: "", flagCode: "", playerName: "" });
  };

  const removePlayer = (side: "left" | "right", steamID: string) => {
    setSettings(
      produce((settings) => {
        if (side === "left") {
          settings.leftTeamSettings.players =
            settings.leftTeamSettings.players.filter(
              (p) => p.steamID !== steamID,
            );
        } else {
          settings.rightTeamSettings.players =
            settings.rightTeamSettings.players.filter(
              (p) => p.steamID !== steamID,
            );
        }
      }),
    );
  };

  return (
    <div className="dashboard-root">
      <aside className="dashboard-sidebar">
        {sidebarItems.map((item) => (
          <button
            key={item.anchor}
            className={`sidebar-btn${selectedSection === item.anchor ? " active" : ""}`}
            onClick={() => setSelectedSection(item.anchor)}
          >
            {item.label}
          </button>
        ))}
      </aside>
      <main className="dashboard-main">
        {selectedSection === "dashboard" && (
          <>
            <section className="dashboard-card" id="scene-switcher">
              <div className="dashboard-card-title">Scene Switcher</div>
              <div className="dashboard-card-content flex-wrap">
                {screenNames.map((scene) => (
                  <button
                    key={scene}
                    className={`dashboard-action-btn ${settings.activeScreen === scene ? "active" : ""}`}
                    onClick={() => setSelectedScreen(scene)}
                  >
                    {scene}
                  </button>
                ))}
              </div>
            </section>

            <section className="dashboard-card" id="tournament">
              <div className="dashboard-card-title">Tournament Settings</div>
              <div className="dashboard-card-content match-settings">
                <div>
                  <div className="dashboard-label">Tournament Name</div>
                  <input
                    type="text"
                    className="dashboard-input"
                    value={settings.tournamentName}
                    onChange={changeTournamentName}
                    style={{
                      minWidth: 180,
                      fontSize: 16,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: "#181c24",
                      color: "#fff",
                      fontFamily: "BenderRegular, sans-serif",
                    }}
                  />
                </div>
                <div>
                  <div className="dashboard-label">Round Name</div>
                  <input
                    type="text"
                    className="dashboard-input"
                    value={settings.round}
                    onChange={changeRound}
                    style={{
                      minWidth: 180,
                      fontSize: 16,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: "#181c24",
                      color: "#fff",
                      fontFamily: "BenderRegular, sans-serif",
                    }}
                  />
                </div>
              </div>
              <div
                className="match-settings"
                style={{
                  borderTop: "1px solid #3a3f4b",
                  paddingTop: 16,
                  marginTop: 8,
                }}
              >
                <div
                  className="dashboard-card-title"
                  style={{ fontSize: 16, marginBottom: 8 }}
                >
                  Teams
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 32,
                    flexWrap: "wrap",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      flex: "1 1 260px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      className="dashboard-label"
                      style={{ color: "#5bc0eb" }}
                    >
                      Left Side
                    </div>
                    <div>
                      <div className="dashboard-label" style={{ fontSize: 13 }}>
                        Team Name
                      </div>
                      <input
                        type="text"
                        className="dashboard-input"
                        value={settings.leftTeamSettings.name}
                        onChange={(e) =>
                          setSettings(
                            produce((s) => {
                              s.leftTeamSettings.name = e.target.value;
                            }),
                          )
                        }
                        style={{
                          padding: "4px 8px",
                          fontSize: 14,
                          maxWidth: "100%",
                        }}
                      />
                    </div>
                    <div>
                      <div className="dashboard-label" style={{ fontSize: 13 }}>
                        Model
                      </div>
                      <input
                        type="text"
                        className="dashboard-input"
                        value={settings.leftTeamSettings.model}
                        onChange={(e) =>
                          changeTeamModel("left", e.target.value)
                        }
                        style={{
                          padding: "4px 8px",
                          fontSize: 14,
                          maxWidth: "100%",
                        }}
                      />
                    </div>
                    <div>
                      <div className="dashboard-label" style={{ fontSize: 13 }}>
                        Logo
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload("left", e)}
                          className="dashboard-input"
                          style={{
                            padding: "4px 8px",
                            fontSize: 14,
                            maxWidth: "100%",
                          }}
                        />
                        {settings.leftTeamLogoUrl && (
                          <>
                            <span
                              style={{
                                fontSize: 12,
                                color: "#b6c2e2",
                                fontFamily: "monospace",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 80,
                              }}
                            >
                              {settings.leftTeamLogoUrl.split("/").pop()}
                            </span>
                            <button
                              onClick={() => removeLogo("left")}
                              className="dashboard-action-btn small"
                              style={{
                                background: "#d32f2f",
                                padding: "2px 6px",
                              }}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      flex: "1 1 260px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div
                      className="dashboard-label"
                      style={{ color: "#ff595e" }}
                    >
                      Right Side
                    </div>
                    <div>
                      <div className="dashboard-label" style={{ fontSize: 13 }}>
                        Team Name
                      </div>
                      <input
                        type="text"
                        className="dashboard-input"
                        value={settings.rightTeamSettings.name}
                        onChange={(e) =>
                          setSettings(
                            produce((s) => {
                              s.rightTeamSettings.name = e.target.value;
                            }),
                          )
                        }
                        style={{
                          padding: "4px 8px",
                          fontSize: 14,
                          maxWidth: "100%",
                        }}
                      />
                    </div>
                    <div>
                      <div className="dashboard-label" style={{ fontSize: 13 }}>
                        Model
                      </div>
                      <input
                        type="text"
                        className="dashboard-input"
                        value={settings.rightTeamSettings.model}
                        onChange={(e) =>
                          changeTeamModel("right", e.target.value)
                        }
                        style={{
                          padding: "4px 8px",
                          fontSize: 14,
                          maxWidth: "100%",
                        }}
                      />
                    </div>
                    <div>
                      <div className="dashboard-label" style={{ fontSize: 13 }}>
                        Logo
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload("right", e)}
                          className="dashboard-input"
                          style={{
                            padding: "4px 8px",
                            fontSize: 14,
                            maxWidth: "100%",
                          }}
                        />
                        {settings.rightTeamLogoUrl && (
                          <>
                            <span
                              style={{
                                fontSize: 12,
                                color: "#b6c2e2",
                                fontFamily: "monospace",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 80,
                              }}
                            >
                              {settings.rightTeamLogoUrl.split("/").pop()}
                            </span>
                            <button
                              onClick={() => removeLogo("right")}
                              className="dashboard-action-btn small"
                              style={{
                                background: "#d32f2f",
                                padding: "2px 6px",
                              }}
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-card" id="scoring">
              <div className="dashboard-card-title">Scoring</div>
              <div className="dashboard-card-content match-settings">
                <div>
                  <div className="dashboard-label">Best Of</div>
                  <div className="dashboard-counter">
                    <button
                      onClick={() => changeBestOf(-1)}
                      className="dashboard-action-btn small"
                    >
                      -
                    </button>
                    <span className="dashboard-value">
                      {settings.bestOfPoints}
                    </span>
                    <button
                      onClick={() => changeBestOf(1)}
                      className="dashboard-action-btn small"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <div className="dashboard-label">
                    {settings.leftTeamSettings.name} Points
                  </div>
                  <div className="dashboard-counter">
                    <button
                      onClick={() => changeLeftPoints(-1)}
                      className="dashboard-action-btn small"
                    >
                      -
                    </button>
                    <span className="dashboard-value">
                      {settings.leftTeamSettings.points}
                    </span>
                    <button
                      onClick={() => changeLeftPoints(1)}
                      className="dashboard-action-btn small"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <div className="dashboard-label">
                    {settings.rightTeamSettings.name} Points
                  </div>
                  <div className="dashboard-counter">
                    <button
                      onClick={() => changeRightPoints(-1)}
                      className="dashboard-action-btn small"
                    >
                      -
                    </button>
                    <span className="dashboard-value">
                      {settings.rightTeamSettings.points}
                    </span>
                    <button
                      onClick={() => changeRightPoints(1)}
                      className="dashboard-action-btn small"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-card" id="background">
              <div className="dashboard-card-title">Background</div>
              <div
                className="dashboard-card-content flex-wrap"
                style={{ alignItems: "flex-start" }}
              >
                <div>
                  <div className="dashboard-label">Color</div>
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={changeBackgroundColor}
                    style={{
                      width: 48,
                      height: 36,
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: "none",
                      padding: 0,
                    }}
                  />
                  <span
                    style={{
                      marginLeft: 8,
                      fontFamily: "monospace",
                      fontSize: 14,
                      color: "#b6c2e2",
                    }}
                  >
                    {settings.backgroundColor}
                  </span>
                </div>
                <div>
                  <div className="dashboard-label">Media</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "nowrap",
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*,video/webm,video/mp4"
                      onChange={handleBackgroundUpload}
                      className="dashboard-input"
                      style={{
                        padding: "4px 8px",
                        fontSize: 14,
                        maxWidth: 260,
                      }}
                    />
                    {settings.backgroundUrl && (
                      <>
                        <span
                          style={{
                            fontSize: 14,
                            color: "#b6c2e2",
                            fontFamily: "monospace",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 180,
                          }}
                        >
                          {settings.backgroundUrl.split("/").pop()}
                        </span>
                        <button
                          onClick={removeBackground}
                          className="dashboard-action-btn small"
                          style={{ background: "#d32f2f" }}
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    gap: 24,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ opacity: settings.backgroundUrl ? 1 : 0.4 }}>
                    <div className="dashboard-label">
                      Opacity ({settings.backgroundOpacity}%)
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={settings.backgroundOpacity}
                      onChange={changeBackgroundOpacity}
                      disabled={!settings.backgroundUrl}
                      style={{ width: 160 }}
                    />
                  </div>
                  <div style={{ opacity: settings.backgroundUrl ? 1 : 0.4 }}>
                    <div className="dashboard-label">
                      Blur ({settings.backgroundBlur}px)
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={settings.backgroundBlur}
                      onChange={changeBackgroundBlur}
                      disabled={!settings.backgroundUrl}
                      style={{ width: 160 }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="dashboard-card" id="server-selector">
              <div className="dashboard-card-title">Server Selector</div>
              <div className="dashboard-card-content flex-wrap">
                <SimpleBar style={{ maxHeight: 240, width: "100%" }}>
                  {AGOverlayData.map((server) => (
                    <button
                      key={server.server_ip}
                      className={`dashboard-action-btn ${settings.selectedServer === server.server_ip ? "active" : ""}`}
                      onClick={() =>
                        setSettings(
                          produce((settings) => {
                            settings.selectedServer = server.server_ip;
                          }),
                        )
                      }
                    >
                      {server.data.hostname} ({server.data.map}) -{" "}
                      {server.data.players.length} players
                    </button>
                  ))}
                </SimpleBar>
              </div>
            </section>

            <section className="dashboard-card" id="players-settings">
              <div className="dashboard-card-title">Players</div>
              <div className="dashboard-card-content flex-wrap players-section">
                <div className="team-players">
                  <div className="dashboard-label" style={{ color: "#5bc0eb" }}>
                    Left Side
                  </div>
                  <div className="add-player-row">
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="SteamID"
                      value={newLeftPlayer.steamID}
                      onChange={(e) =>
                        setNewLeftPlayer({
                          ...newLeftPlayer,
                          steamID: e.target.value,
                        })
                      }
                    />
                    <select
                      className="dashboard-input"
                      value={newLeftPlayer.flagCode}
                      onChange={(e) =>
                        setNewLeftPlayer({
                          ...newLeftPlayer,
                          flagCode: e.target.value,
                        })
                      }
                    >
                      <option value="">No flag</option>
                      {Object.entries(ALPHA2_COUNTRY_LIST).map(
                        ([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ),
                      )}
                    </select>
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="Player Name"
                      value={newLeftPlayer.playerName}
                      onChange={(e) =>
                        setNewLeftPlayer({
                          ...newLeftPlayer,
                          playerName: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addLeftPlayer();
                      }}
                    />
                    <button
                      className="dashboard-action-btn small"
                      onClick={addLeftPlayer}
                    >
                      Add
                    </button>
                  </div>
                  <ul className="players-list">
                    {settings.leftTeamSettings.players.map((p) => (
                      <li key={p.steamID} className="player-item">
                        <div className="player-info">
                          {p.flagCode && (
                            <img
                              src={getFlagUrl(p.flagCode)}
                              className="player-flag"
                              width={22}
                              height={16}
                              alt={p.flagCode}
                            />
                          )}
                          <span>
                            {p.playerName}{" "}
                            {p.flagCode
                              ? `(${ALPHA2_COUNTRY_LIST[p.flagCode]})`
                              : ""}{" "}
                            [{p.steamID}]
                          </span>
                        </div>
                        <button
                          className="dashboard-action-btn small remove-btn"
                          onClick={() => removePlayer("left", p.steamID)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="team-players">
                  <div className="dashboard-label" style={{ color: "#ff595e" }}>
                    Right Side
                  </div>
                  <div className="add-player-row">
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="SteamID"
                      value={newRightPlayer.steamID}
                      onChange={(e) =>
                        setNewRightPlayer({
                          ...newRightPlayer,
                          steamID: e.target.value,
                        })
                      }
                    />
                    <select
                      className="dashboard-input"
                      value={newRightPlayer.flagCode}
                      onChange={(e) =>
                        setNewRightPlayer({
                          ...newRightPlayer,
                          flagCode: e.target.value,
                        })
                      }
                    >
                      <option value="">No flag</option>
                      {Object.entries(ALPHA2_COUNTRY_LIST).map(
                        ([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ),
                      )}
                    </select>
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="Player Name"
                      value={newRightPlayer.playerName}
                      onChange={(e) =>
                        setNewRightPlayer({
                          ...newRightPlayer,
                          playerName: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addRightPlayer();
                      }}
                    />
                    <button
                      className="dashboard-action-btn small"
                      onClick={addRightPlayer}
                    >
                      Add
                    </button>
                  </div>
                  <ul className="players-list">
                    {settings.rightTeamSettings.players.map((p) => (
                      <li key={p.steamID} className="player-item">
                        {p.flagCode && (
                          <img
                            src={getFlagUrl(p.flagCode)}
                            className="player-flag"
                            width={22}
                            height={16}
                          />
                        )}
                        <span>
                          {p.playerName}{" "}
                          {p.flagCode
                            ? `(${ALPHA2_COUNTRY_LIST[p.flagCode]})`
                            : ""}{" "}
                          [{p.steamID}]
                        </span>
                        <button
                          className="dashboard-action-btn small remove-btn"
                          onClick={() => removePlayer("right", p.steamID)}
                          title="Remove"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </>
        )}

        {selectedSection === "settings" && (
          <section className="dashboard-card" id="settings">
            <div className="dashboard-card-title">Connection Settings</div>
            <div className="dashboard-card-content">
              <div>
                <div className="dashboard-label">WebSocket URL</div>
                <input
                  type="text"
                  className="dashboard-input"
                  value={settings.websocketURL}
                  onChange={changeWebsocketURL}
                />
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
