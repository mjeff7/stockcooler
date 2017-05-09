// @flow

export const webSocketHub = (addr, errorHandler = () => null) => {
  const subscribers = new Set();
  const ws = new WebSocket(addr);

  const subscribe = (subscriber: Subscriber) => {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  };

  const emitLocal = (message: Event) => subscribers.forEach(s => s(message));
  const emit = (message: Event) => {
    emitLocal(message);
    if(ws.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify(message));
  };

  const emitError = error => {
    console.error({error});
    errorHandler(error);
  };

  ws.addEventListener('message', msg =>
    typeof msg.data === 'string'
    ? emitLocal(JSON.parse(msg.data))
    : emitError({
        error: 'Received WebSocket message without string data.',
        message: msg
    })
  );

  ws.addEventListener(('error': string), e => emitError({
    error: 'WebSocket connect error',
    originalError: e
  }));

  return {
    subscribe,
    emit
  };
};
