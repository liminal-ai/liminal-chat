type AuthSyncEvent = { type: 'login' | 'logout' };

let channel: BroadcastChannel | null = null;

export function initAuthSync(onEvent: (e: AuthSyncEvent) => void) {
  if (typeof window === 'undefined' || 'BroadcastChannel' in window === false) return;
  if (!channel) {
    channel = new BroadcastChannel('auth-sync');
    channel.onmessage = (evt) => {
      const data = evt.data as AuthSyncEvent | undefined;
      if (!data) return;
      onEvent(data);
    };
  }
}

export function notifyAuthLogin() {
  if (channel) channel.postMessage({ type: 'login' } as AuthSyncEvent);
}

export function notifyAuthLogout() {
  if (channel) channel.postMessage({ type: 'logout' } as AuthSyncEvent);
}

// Reconnect banner store (minimal, avoids extra deps)
let reconnectListeners: Array<(v: boolean) => void> = [];
let reconnectVisible = false;

export function setReconnectVisible(v: boolean) {
  reconnectVisible = v;
  for (const fn of reconnectListeners) fn(v);
}

export function onReconnectVisible(fn: (v: boolean) => void) {
  reconnectListeners.push(fn);
  // initial
  fn(reconnectVisible);
  return () => {
    reconnectListeners = reconnectListeners.filter((f) => f !== fn);
  };
}
