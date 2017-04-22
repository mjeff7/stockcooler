const WebSocket = require('ws');

module.exports = server => {
  const clients = new Set();

  const wss = new WebSocket.Server({server});

  wss.on('connection', ws => {
    clients.add(ws);
    ws.send("Hello");

    const broadcast = msg => clients.forEach(
      client => client !== ws &&
                client.readyState === WebSocket.OPEN &&
                client.send(msg)
    );

    ws.on('close', e => console.log("Closed", {e}));
    ws.on('close', () => clients.delete(ws));

    ws.on('error', e => console.log("Error", {e}));

    ws.on('message', e => console.log("message", JSON.stringify({e}, null, 2)));
    ws.on('message', broadcast);
  });
};
