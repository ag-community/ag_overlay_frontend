<template>
  <div>
    <div class="overlay" :class="{ 'empty': !selectedServer }">
      <div v-if="selectedServer" class="tournament-overlay">
        <div class="header">
          <div class="score-display">
            <div class="team-icon team-a-icon" 
                 :style="getTeamIconStyle('a')"></div>
            <div class="team-score-value">{{ teamAKills }}</div>
            <div class="score-spacer">
              <div class="match-timer">{{ formatTime(selectedServer?.data?.timelimit - selectedServer?.data.effective_time|| 0) }}</div>
            </div>
            <div class="team-score-value">{{ teamBKills }}</div>
            <div class="team-icon team-b-icon"
                 :style="getTeamIconStyle('b')"></div>
          </div>
        </div>

        <div class="teams-container">
          <div class="team team-a">
            <div 
              v-for="(player, index) in teamAPlayers" 
              :key="'team-a-' + index" 
              class="player"
              :style="{ 
                backgroundColor: convertToRgba(teamAColor),
                textAlign: 'left' 
              }"
            >
              <div class="player-header">
                <div class="weapon-icon">
                  <img :src="`images/weapons/${player.weapon}.png`" :alt="player.weapon" />
                </div>
                <div class="player-name">{{ player.name }}</div>
              </div>
              <div class="player-stats">
                <div class="hp-icon">❤️</div>
                <div class="hp-value">{{ player.health }}</div>
                <div class="hev-icon">🛡️</div>
                <div class="hev-value">{{ player.hev }}</div>
                <div class="stat-spacer"></div>
                <div class="kill-icon">⚔️</div>
                <div class="kill-value">{{ player.frags }}</div>
                <div class="death-icon">☠️</div>
                <div class="death-value">{{ player.deaths }}</div>
              </div>
            </div>
          </div>

          <div class="team team-b">
            <div 
              v-for="(player, index) in teamBPlayers" 
              :key="'team-b-' + index" 
              class="player"
              :style="{ 
                backgroundColor: convertToRgba(teamBColor),
                textAlign: 'right'
              }"
            >
              <div class="player-header player-header-right">
                <div class="player-name">{{ player.name }}</div>
                <div class="weapon-icon">
                  <img :src="`images/weapons/${player.weapon}.png`" :alt="player.weapon" />
                </div>
              </div>
              <div class="player-stats player-stats-right">
                <div class="kill-icon">⚔️</div>
                <div class="kill-value">{{ player.frags }}</div>
                <div class="death-icon">☠️</div>
                <div class="death-value">{{ player.deaths }}</div>
                <div class="stat-spacer"></div>
                <div class="hp-icon">❤️</div>
                <div class="hp-value">{{ player.health }}</div>
                <div class="hev-icon">🛡️</div>
                <div class="hev-value">{{ player.hev }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-panel">
      <h2 class="settings-title">Control Panel</h2>
      
      <div class="settings-grid">
        <div class="settings-card connection-card">
          <div class="card-header">
            <h3>Connection</h3>
            <span class="connection-badge" :class="{'connected': isConnected, 'disconnected': !isConnected}">
              {{ isConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          
          <div class="card-content">
            <div class="input-group">
              <label for="websocket-url">WebSocket URL:</label>
              <div class="input-with-button">
                <input 
                  id="websocket-url"
                  v-model="websocketUrl" 
                  placeholder="ws://dirección:puerto" 
                />
                <button @click="reconnectWebsocket" class="action-button reconnect-button">
                  <span class="button-icon">↻</span>
                  <span>Reconnect</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-card server-card">
          <div class="card-header">
            <h3>Servers</h3>
            <button @click="clearSelection" class="clear-button">
              <span class="button-icon">×</span>
              <span>Clear selection</span>
            </button>
          </div>
          
          <div class="card-content servers-container">
            <div class="server-list">
              <button 
                v-for="(server, index) in servers" 
                :key="index"
                @click="selectServer(server)"
                :class="{ 'active': selectedServer === server }"
                class="server-button"
              >
                <span class="server-name">{{ server.data.hostname }}</span>
                <span class="server-details">{{ server.server_ip }} ({{ server.data.players.length }} players)</span>
              </button>
              <div v-if="servers.length === 0" class="no-servers">
                No servers available
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="teams-settings">
        <div class="settings-card team-card team-a-card">
          <div class="card-header">
            <div class="team-color-indicator" :style="{backgroundColor: teamAColor}"></div>
            <h3>Team A</h3>
          </div>
          
          <div class="card-content">
            <div class="input-group">
              <label for="team-a-model">Model:</label>
              <input id="team-a-model" v-model="teamAModel" placeholder="Model name" />
            </div>
            
            <div class="input-group">
              <label for="team-a-color">Color:</label>
              <div class="color-preview-container">
                <input id="team-a-color" type="color" v-model="teamAColor" />
                <div class="color-preview" :style="{backgroundColor: teamAColor}">
                  <span class="color-hex">{{ teamAColor }}</span>
                </div>
              </div>
            </div>

            <div class="input-group">
              <label>Icon:</label>
              <div class="icon-controls">
                <div class="icon-option">
                  <input type="checkbox" v-model="useDefaultIconsA" id="defaultIconA" />
                  <label for="defaultIconA">Use default icon</label>
                </div>
                <div class="file-input-wrapper" :class="{'disabled': useDefaultIconsA}">
                  <button class="file-button" :disabled="useDefaultIconsA">Select file</button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleTeamIconUpload($event, 'a')" 
                    :disabled="useDefaultIconsA"
                    id="teamAIconInput"
                    class="file-input"
                  />
                </div>
                <div class="icon-preview team-a-icon" :style="getTeamIconStyle('a')"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="settings-card team-card team-b-card">
          <div class="card-header">
            <div class="team-color-indicator" :style="{backgroundColor: teamBColor}"></div>
            <h3>Team B</h3>
          </div>
          
          <div class="card-content">
            <div class="input-group">
              <label for="team-b-model">Model:</label>
              <input id="team-b-model" v-model="teamBModel" placeholder="Model name" />
            </div>
            
            <div class="input-group">
              <label for="team-b-color">Color:</label>
              <div class="color-preview-container">
                <input id="team-b-color" type="color" v-model="teamBColor" />
                <div class="color-preview" :style="{backgroundColor: teamBColor}">
                  <span class="color-hex">{{ teamBColor }}</span>
                </div>
              </div>
            </div>

            <div class="input-group">
              <label>Icon:</label>
              <div class="icon-controls">
                <div class="icon-option">
                  <input type="checkbox" v-model="useDefaultIconsB" id="defaultIconB" />
                  <label for="defaultIconB">Use default icon</label>
                </div>
                <div class="file-input-wrapper" :class="{'disabled': useDefaultIconsB}">
                  <button class="file-button" :disabled="useDefaultIconsB">Select file</button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    @change="handleTeamIconUpload($event, 'b')" 
                    :disabled="useDefaultIconsB"
                    id="teamBIconInput"
                    class="file-input"
                  />
                </div>
                <div class="icon-preview team-b-icon" :style="getTeamIconStyle('b')"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
interface Server {
  server_ip: string;
  data: ServerData;
}

interface ServerData {
  effective_time: number;
  hostname: string;
  players: Player[];
  timelimit: number;
}

interface Player {
  ammo: number;
  clip: number;
  deaths: number;
  frags: number;
  health: number;
  hev: number;
  name: string;
  team: string;
  weapon: string;
}

export default {
  name: 'App',
  data: () => ({
      connection: null as WebSocket | null,
      servers: [] as Server[],
      selectedServer: null as Server | null,
      teamAModel: 'blue',
      teamBModel: 'red',
      teamAColor: '#0000FF',
      teamBColor: '#960000',
      teamAIcon: '',
      teamBIcon: '',
      useDefaultIconsA: true,
      useDefaultIconsB: true,
      websocketUrl: 'ws://104.234.7.207:8081',
      isConnected: false,
    }),
  computed: {
    teamAPlayers(): Player[] {
      if (!this.selectedServer || !this.teamAModel) return [];

      return this.selectedServer.data.players.filter((player) => {
        return player.team.toLowerCase() === this.teamAModel.toLowerCase();
      });
    },
    teamBPlayers(): Player[] {
      if (!this.selectedServer || !this.teamBModel) return [];

      return this.selectedServer.data.players.filter((player) => {
        return player.team.toLowerCase() === this.teamBModel.toLowerCase();
      });
    },
    teamAKills(): number {
      return this.teamAPlayers.reduce(
        (total, player) => total + player.frags,
        0,
      );
    },
    teamBKills(): number {
      return this.teamBPlayers.reduce(
        (total, player) => total + player.frags,
        0,
      );
    },
  },
  methods: {
    formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    convertToRgba(hex: string): string {
      const hex2 = hex.substring(1);
      const r = parseInt(hex2.substring(0, 2), 16);
      const g = parseInt(hex2.substring(2, 4), 16);
      const b = parseInt(hex2.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.7)`;
    },
    selectServer(server: Server): void {
      this.selectedServer = server;
    },
    clearSelection(): void {
      this.selectedServer = null;
    },
    handleTeamIconUpload(event: Event, team: 'a' | 'b'): void {
      const input = event.target as HTMLInputElement;
      if (input.files?.[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (team === 'a') {
            this.teamAIcon = e.target?.result as string;
          } else {
            this.teamBIcon = e.target?.result as string;
          }
        };
        reader.readAsDataURL(input.files[0]);
      }
    },
    getTeamIconStyle(team: 'a' | 'b'): Record<string, string> {
      const useDefault =
        team === 'a' ? this.useDefaultIconsA : this.useDefaultIconsB;

      if (useDefault) {
        return {};
      }

      const iconUrl = team === 'a' ? this.teamAIcon : this.teamBIcon;

      if (!iconUrl) {
        return {};
      }

      return {
        backgroundImage: `url('${iconUrl}')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      };
    },
    reconnectWebsocket(): void {
      if (this.connection) {
        this.connection.close();
      }

      this.initWebsocketConnection();
    },
    initWebsocketConnection(): void {
      console.log(
        'Starting connection to WebSocket Server:',
        this.websocketUrl,
      );

      try {
        this.connection = new WebSocket(this.websocketUrl);

        this.connection.onmessage = (event) => {
          this.servers = JSON.parse(event.data);

          if (this.selectedServer?.server_ip) {
            const updatedServer = this.servers.find(
              (s) => s.server_ip === this.selectedServer?.server_ip,
            );
            if (updatedServer) {
              this.selectedServer = updatedServer;
            }
          }
        };

        this.connection.onopen = (_event) => {
          console.log('Successfully connected to the echo websocket server...');
          this.isConnected = true;
        };

        this.connection.onclose = (_event) => {
          console.log('Connection to WebSocket server closed');
          this.isConnected = false;
        };

        this.connection.onerror = (_event) => {
          console.error('WebSocket connection error');
          this.isConnected = false;
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        this.isConnected = false;
      }
    },
  },
  created: function () {
    this.initWebsocketConnection();
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

.overlay {
  width: 1920px;
  height: 1080px;
  background-color: transparent;
  position: relative;
  overflow: hidden;
}

.tournament-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  height: 80px;
}

.score-display {
  display: flex;
  align-items: center;
  background-color: rgba(30, 30, 30, 0.8);
  padding: 10px 20px;
  border-radius: 5px;
  gap: 15px;
}

.team-icon {
  width: 30px;
  height: 30px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.team-a-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue"><rect x="0" y="0" width="24" height="24" /></svg>');
}

.team-b-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><rect x="0" y="0" width="24" height="24" /></svg>');
}

.team-score-value {
  font-size: 32px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.score-spacer {
  margin: 0 15px;
  padding: 5px 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.match-timer {
  font-size: 24px;
  font-weight: bold;
}

.teams-container {
  display: flex;
  width: 100%;
  margin-top: 20px;
  flex-grow: 1;
  align-items: center;
  justify-content: space-between;
}

.team {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 300px;
}

.team-a {
  align-items: flex-start;
}

.team-b {
  align-items: flex-end;
}

.player {
  padding: 8px 12px;
  color: white;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  margin-bottom: 2px;
  width: 100%;
  max-width: 300px;
}

.player-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 4px;
  width: 100%;
}

.team-a .player-header {
  flex-direction: row-reverse;
}

.player-header-right {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.player-name {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.team-a .player-name {
  margin-right: 0;
  margin-left: 8px;
}

.team-b .player-name {
  margin-left: 0;
  margin-right: 8px;
  text-align: right;
}

.team-a .weapon-icon {
  margin-right: 8px;
  margin-left: 0;
}

.team-b .weapon-icon {
  margin-left: 8px;
  margin-right: 0;
}

.weapon-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.weapon-icon img {
  height: 20px;
  width: auto;
  object-fit: contain;
}

.player-stats {
  display: grid;
  grid-template-columns: auto auto auto auto auto 1fr auto auto auto auto;
  align-items: center;
  width: 100%;
}

.player-stats-right {
  grid-template-columns: auto auto auto auto auto 1fr auto auto auto auto;
  direction: ltr;
  justify-content: flex-end;
}

.hp-icon, .kill-icon, .death-icon, .hev-icon {
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: end;
}

.hp-value, .kill-value, .death-value, .hev-value {
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.stat-spacer {
  flex-grow: 1;
}

.settings-panel {
  margin-top: 30px;
  padding: 24px;
  background-color: #2c2c2c;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

.settings-title {
  color: #fff;
  margin: 0 0 20px 0;
  padding-bottom: 15px;
  border-bottom: 2px solid #444;
  text-align: center;
  font-weight: 600;
  letter-spacing: 1px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 20px;
}

.settings-card {
  background-color: #383838;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  background-color: #444;
  padding: 12px 16px;
  justify-content: space-between;
}

.card-header h3 {
  margin: 0;
  font-size: 17px;
  color: #fff;
  font-weight: 500;
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #e0e0e0;
  font-weight: 500;
  font-size: 14px;
}

.input-group input[type="text"],
.input-group input[type="url"],
.input-group input {
  padding: 10px 12px;
  background-color: #2a2a2a;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 15px;
  transition: all 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
}

.input-with-button {
  display: flex;
  gap: 8px;
}

.input-with-button input {
  flex: 1;
}

.action-button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.button-icon {
  font-size: 16px;
  font-weight: bold;
}

.reconnect-button {
  background-color: #2196F3;
  color: white;
}

.reconnect-button:hover {
  background-color: #1976D2;
}

.connection-badge {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 50px;
  font-weight: 500;
}

.connected {
  background-color: #43a047;
  color: white;
}

.disconnected {
  background-color: #e53935;
  color: white;
}

.servers-container {
  padding: 0 !important;
  overflow: hidden;
}

.server-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 250px;
  flex: 1;
}

.server-button {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background-color: #2d2d2d;
  border: none;
  border-bottom: 1px solid #444;
  color: #e0e0e0;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.server-button:hover {
  background-color: #3a3a3a;
}

.server-button.active {
  background-color: #1e5799;
  color: white;
}

.server-name {
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 15px;
}

.server-details {
  font-size: 13px;
  color: #bbb;
}

.server-button.active .server-details {
  color: #a9d3ff;
}

.clear-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.clear-button:hover {
  background-color: #d32f2f;
}

.teams-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.team-card {
  display: flex;
  flex-direction: column;
}

.team-a-card .card-header {
  background-color: rgba(0, 0, 255, 0.5);
}

.team-b-card .card-header {
  background-color: rgba(150, 0, 0, 0.5);
}

.color-preview-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview {
  width: 100px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-hex {
  color: white;
  text-shadow: 0 0 3px rgba(0,0,0,0.8);
  font-size: 12px;
  font-family: monospace;
}

input[type="color"] {
  width: 60px;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.icon-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-option label {
  margin: 0;
}

.file-input-wrapper {
  position: relative;
  overflow: hidden;
}

.file-button {
  background-color: #5c5c5c;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-button:hover {
  background-color: #6e6e6e;
}

.file-input-wrapper.disabled .file-button {
  background-color: #4a4a4a;
  color: #888;
  cursor: not-allowed;
}

.file-input {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input:disabled {
  cursor: not-allowed;
}

.icon-preview {
  width: 40px;
  height: 40px;
  background-color: #333;
  border-radius: 4px;
  margin-top: 5px;
}

.team-color-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
}

.no-servers {
  padding: 20px;
  text-align: center;
  color: #888;
  font-style: italic;
}

/* Custom scrollbar */
.server-list::-webkit-scrollbar {
  width: 8px;
}

.server-list::-webkit-scrollbar-track {
  background: #252525;
}

.server-list::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.server-list::-webkit-scrollbar-thumb:hover {
  background: #777;
}

.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
