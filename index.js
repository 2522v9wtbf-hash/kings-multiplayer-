const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let players = {};

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).substr(2, 9);

  players[id] = { x: 0, y: 0 };

  ws.send(JSON.stringify({
    type: "init",
    id,
    players
  }));

  broadcast();

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "move") {
        players[id] = { x: data.x, y: data.y };
        broadcast();
      }
    } catch (e) {}
  });

  ws.on("close", () => {
    delete players[id];
    broadcast();
  });

  function broadcast() {
    const data = JSON.stringify({
      type: "players",
      players
    });

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
});

server.listen(process.env.PORT || 10000);
