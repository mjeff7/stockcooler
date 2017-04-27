import WebSocket from 'ws';


// Webpack dev server uses websockets and interferes with the messages.
const wpWorkaround = (client, msg) => {
  let parsed;

  try {
    parsed = JSON.parse(msg);
  }
  catch(e) {
    console.error("Kludge parse error for message: ", msg);
    console.error("Kludge parse error: ", e);
    return;
  }


  if(!parsed.type) return;
  if(parsed.serverSaw) return;

  client.send(
    JSON.stringify(
      Object.assign({}, parsed, {serverSaw: true})
    )
  );
};




module.exports = server => {
  const clients = new Set();

  const wss = new WebSocket.Server({server});

  wss.on('connection', ws => {
    clients.add(ws);

    const broadcast = msg => clients.forEach(
      client => client !== ws &&
                client.readyState === WebSocket.OPEN &&
                wpWorkaround(client, msg) //client.send(msg)
    );

    ws.on('close', e => console.log("Closed", {e}));
    ws.on('close', () => clients.delete(ws));

    ws.on('error', e => console.log("Error", {e}));

    ws.on('message', e => console.log("message", {e}));
    ws.on('message', broadcast);
  });
};
