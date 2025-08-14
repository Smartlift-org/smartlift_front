// Lightweight WebSocket addEventListener/removeEventListener polyfill for React Native
// Some React Native environments expose WebSocket without addEventListener API,
// but @rails/actioncable expects the browser-like interface.

// Guard against environments where WebSocket is undefined
const G: any = (typeof globalThis !== "undefined"
  ? (globalThis as any)
  : typeof self !== "undefined"
  ? (self as any)
  : ({} as any));

const WS: any = G.WebSocket;

if (typeof WS === "function") {
  const proto = WS.prototype;

  // Only patch if missing
  if (proto && typeof proto.addEventListener !== "function") {
    const listeners: WeakMap<any, Record<string, Set<(ev: any) => void>>> = new WeakMap();

    const ensureMap = (socket: any) => {
      if (!listeners.has(socket)) {
        listeners.set(socket, {} as Record<string, Set<(ev: any) => void>>);
      }
      return listeners.get(socket)!;
    };

    if (typeof proto.addEventListener !== "function") {
      proto.addEventListener = function (type: string, listener: (ev: any) => void) {
        const map = ensureMap(this);
        if (!map[type]) map[type] = new Set();
        map[type].add(listener);
      };
    }

    if (typeof proto.removeEventListener !== "function") {
      proto.removeEventListener = function (type: string, listener: (ev: any) => void) {
        const map = ensureMap(this);
        map[type]?.delete(listener);
      };
    }

    // Patch common event properties to ensure they exist; RN will call these
    [
      ["onopen", "open"],
      ["onmessage", "message"],
      ["onerror", "error"],
      ["onclose", "close"],
    ].forEach(([prop]) => {
      if (!Object.prototype.hasOwnProperty.call(proto, prop)) {
        Object.defineProperty(proto, prop, {
          configurable: true,
          enumerable: true,
          get() {
            return this[`__${prop}`];
          },
          set(handler) {
            this[`__${prop}`] = handler;
          },
        });
      }
    });

    // Optional: provide dispatchEvent for libraries that try to use it
    if (typeof proto.dispatchEvent !== "function") {
      proto.dispatchEvent = function (event: any) {
        const type = event?.type;
        if (typeof type !== "string") return false;
        const map = ensureMap(this);
        const set = map[type];
        if (set && set.size > 0) {
          set.forEach((fn) => {
            try {
              fn(event);
            } catch (_) {}
          });
          return true;
        }
        const handler = this[`on${type}`];
        if (typeof handler === "function") {
          try {
            handler(event);
            return true;
          } catch (_) {}
        }
        return false;
      };
    }

    // As a safety net, wrap the constructor to attach methods per instance
    try {
      const OriginalWS = WS;
      const WrappedWS: any = function (this: any, ...args: any[]) {
        const instance = new (OriginalWS as any)(...args);
        if (typeof instance.addEventListener !== "function") {
          instance.addEventListener = function (type: string, listener: (ev: any) => void) {
            const map = ensureMap(this);
            if (!map[type]) map[type] = new Set();
            map[type].add(listener);
          };
        }
        if (typeof instance.removeEventListener !== "function") {
          instance.removeEventListener = function (type: string, listener: (ev: any) => void) {
            const map = ensureMap(this);
            map[type]?.delete(listener);
          };
        }
        if (typeof instance.dispatchEvent !== "function") {
          instance.dispatchEvent = function (event: any) {
            const type = event?.type;
            if (typeof type !== "string") return false;
            const map = ensureMap(this);
            const set = map[type];
            if (set && set.size > 0) {
              set.forEach((fn) => {
                try { fn(event); } catch (_) {}
              });
              return true;
            }
            const handler = this[`on${type}`];
            if (typeof handler === "function") {
              try { handler(event); return true; } catch (_) {}
            }
            return false;
          };
        }
        return instance;
      } as any;
      WrappedWS.prototype = OriginalWS.prototype;
      // Preserve static props if any
      Object.getOwnPropertyNames(OriginalWS).forEach((k) => {
        try { (WrappedWS as any)[k] = (OriginalWS as any)[k]; } catch (_) {}
      });
      G.WebSocket = WrappedWS;
    } catch (_) {
      // No-op if wrapping fails
    }
  }
}

// ActionCable also listens to window/document events (online/offline, visibility)
// In React Native these don't exist; provide harmless no-ops so it doesn't crash.
try {
  const win: any = (G.window ||= G);
  const doc: any = (G.document ||= {});
  // Minimal location object for libs that expect browser location
  if (!G.location) {
    G.location = { href: "" };
  } else if (typeof G.location.href === "undefined") {
    G.location.href = "";
  }
  const targets = [G, win, doc];
  targets.forEach((t) => {
    if (t && typeof t.addEventListener !== "function") {
      t.addEventListener = function () {};
    }
    if (t && typeof t.removeEventListener !== "function") {
      t.removeEventListener = function () {};
    }
  });
  if (typeof doc.visibilityState === "undefined") {
    doc.visibilityState = "visible";
  }
  if (typeof doc.hidden === "undefined") {
    doc.hidden = false;
  }
  const nav: any = (G.navigator ||= {});
  if (typeof nav.onLine === "undefined") {
    nav.onLine = true;
  }
} catch (_) {
  // ignore
}

export {}; // Ensure this is treated as a module
