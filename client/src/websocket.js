// @flow

import type { Event } from './events';
import type { Subscriber } from './types';
import { try_ } from './utils';


const deadWebSocket = {
  addEventListener: () => null,
  readyState: null,
  send: () => null,
};

export const webSocketHub = (
  addr: string,
  errorHandler: mixed => mixed = () => null
) => {
  const emitError = errorHandler;
  const subscribers = new Set();
  const ws = try_(
    () => new WebSocket(addr),
    emitError,
    deadWebSocket
  );

  const subscribe = (subscriber: Subscriber) => {
    subscribers.add(subscriber);

    return () => subscribers.delete(subscriber);
  };

  const emitLocal = (message: Event) => subscribers.forEach(s => s(message));
  const emit = (message: Event) => {
    emitLocal(message);
    if(ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  };

  ws.addEventListener('message', msg =>
    typeof msg.data === 'string'
    ? emitLocal(JSON.parse(msg.data))
    : emitError({
      error: 'Received WebSocket message without string data.',
      message: msg,
    })
  );

  // Flow needs the string annotation to disambiguate the addEventListener
  // call. eslint incorrectly thinks the parentheses are unneeded.
  // eslint-disable-next-line no-extra-parens
  ws.addEventListener(('error': string), e => emitError({
    error: 'WebSocket connect error',
    originalError: e,
  }));

  return {
    emit,
    subscribe,
  };
};
