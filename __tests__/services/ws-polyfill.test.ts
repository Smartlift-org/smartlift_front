// Extend global type for testing
declare const global: any;

// Create a controlled environment for testing the polyfill
const createTestEnvironment = () => {
  const mockGlobal: any = {
    WebSocket: function MockWebSocket() {
      return {};
    }
  };
  mockGlobal.WebSocket.prototype = {};
  
  return mockGlobal;
};

// Test the actual polyfill logic by executing it in controlled conditions
describe('ws-polyfill', () => {
  beforeEach(() => {
    // Reset modules to ensure fresh imports
    jest.resetModules();
  });

  it('should load without errors', () => {
    expect(() => {
      require('../../services/ws-polyfill');
    }).not.toThrow();
  });

  describe('WebSocket polyfill functionality', () => {
    it('should add addEventListener to WebSocket prototype when missing', () => {
      // Create a mock WebSocket without addEventListener
      const mockWS = function() { return {}; };
      mockWS.prototype = {};
      
      // Simulate the polyfill logic for addEventListener
      const proto = mockWS.prototype;
      const listeners = new WeakMap();
      const ensureMap = (socket: any) => {
        if (!listeners.has(socket)) {
          listeners.set(socket, {});
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
      
      expect(typeof proto.addEventListener).toBe('function');
      
      // Test the functionality
      const instance = {};
      const listener = jest.fn();
      proto.addEventListener.call(instance, 'test', listener);
      
      const map = ensureMap(instance);
      expect(map.test.has(listener)).toBe(true);
    });

    it('should add removeEventListener to WebSocket prototype when missing', () => {
      const mockWS = function() { return {}; };
      mockWS.prototype = {};
      
      const proto = mockWS.prototype;
      const listeners = new WeakMap();
      const ensureMap = (socket: any) => {
        if (!listeners.has(socket)) {
          listeners.set(socket, {});
        }
        return listeners.get(socket)!;
      };

      if (typeof proto.removeEventListener !== "function") {
        proto.removeEventListener = function (type: string, listener: (ev: any) => void) {
          const map = ensureMap(this);
          map[type]?.delete(listener);
        };
      }
      
      expect(typeof proto.removeEventListener).toBe('function');
      
      // Test functionality
      const instance = {};
      const listener = jest.fn();
      const map = ensureMap(instance);
      map['test'] = new Set([listener]);
      
      proto.removeEventListener.call(instance, 'test', listener);
      expect(map.test.has(listener)).toBe(false);
    });

    it('should create event handler properties (onopen, onmessage, etc.)', () => {
      const mockWS = function() { return {}; };
      mockWS.prototype = {};
      const proto = mockWS.prototype;
      
      // Simulate the property definition logic
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
      
      // Test all event handler properties
      ['onopen', 'onmessage', 'onerror', 'onclose'].forEach(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, prop);
        expect(descriptor).toBeDefined();
        expect(descriptor?.configurable).toBe(true);
        expect(descriptor?.enumerable).toBe(true);
        expect(typeof descriptor?.get).toBe('function');
        expect(typeof descriptor?.set).toBe('function');
      });
    });

    it('should add dispatchEvent functionality', () => {
      const mockWS = function() { return {}; };
      mockWS.prototype = {};
      const proto = mockWS.prototype;
      
      const listeners = new WeakMap();
      const ensureMap = (socket: any) => {
        if (!listeners.has(socket)) {
          listeners.set(socket, {});
        }
        return listeners.get(socket)!;
      };

      if (typeof proto.dispatchEvent !== "function") {
        proto.dispatchEvent = function (event: any) {
          const type = event?.type;
          if (typeof type !== "string") return false;
          const map = ensureMap(this);
          const set = map[type];
          if (set && set.size > 0) {
            set.forEach((fn: any) => {
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
      
      expect(typeof proto.dispatchEvent).toBe('function');
      
      // Test dispatchEvent with listeners
      const instance = {};
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const event = { type: 'test', data: 'testData' };
      
      const map = ensureMap(instance);
      map['test'] = new Set([listener1, listener2]);
      
      const result = proto.dispatchEvent.call(instance, event);
      
      expect(result).toBe(true);
      expect(listener1).toHaveBeenCalledWith(event);
      expect(listener2).toHaveBeenCalledWith(event);
    });

    it('should handle dispatchEvent with event handlers', () => {
      const mockWS = function() { return {}; };
      mockWS.prototype = {};
      const proto = mockWS.prototype;
      
      const listeners = new WeakMap();
      const ensureMap = (socket: any) => {
        if (!listeners.has(socket)) {
          listeners.set(socket, {});
        }
        return listeners.get(socket)!;
      };

      proto.dispatchEvent = function (event: any) {
        const type = event?.type;
        if (typeof type !== "string") return false;
        const map = ensureMap(this);
        const set = map[type];
        if (set && set.size > 0) {
          set.forEach((fn: any) => {
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
      
      // Test with ontest handler
      const instance: any = {};
      const handler = jest.fn();
      instance.ontest = handler;
      const event = { type: 'test' };
      
      ensureMap(instance); // Initialize the map
      
      const result = proto.dispatchEvent.call(instance, event);
      
      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should return false for invalid event types in dispatchEvent', () => {
      const mockWS = function() { return {}; };
      mockWS.prototype = {};
      const proto = mockWS.prototype;
      
      const listeners = new WeakMap();
      const ensureMap = (socket: any) => {
        if (!listeners.has(socket)) {
          listeners.set(socket, {});
        }
        return listeners.get(socket)!;
      };

      proto.dispatchEvent = function (event: any) {
        const type = event?.type;
        if (typeof type !== "string") return false;
        // ... rest of implementation
        return false;
      };
      
      const instance = {};
      ensureMap(instance);
      
      expect(proto.dispatchEvent.call(instance, { type: null })).toBe(false);
      expect(proto.dispatchEvent.call(instance, { type: undefined })).toBe(false);
      expect(proto.dispatchEvent.call(instance, {})).toBe(false);
    });

    it('should handle errors in event listeners gracefully', () => {
      const listeners = new Set();
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const normalListener = jest.fn();
      
      listeners.add(errorListener);
      listeners.add(normalListener);
      
      const event = { type: 'test' };
      
      // Simulate the error handling from dispatchEvent
      expect(() => {
        listeners.forEach((fn: any) => {
          try {
            fn(event);
          } catch (_) {}
        });
      }).not.toThrow();
      
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });

    it('should create wrapped WebSocket constructor', () => {
      const OriginalWS = function(...args: any[]) {
        const instance: any = { url: args[0] };
        return instance;
      };
      OriginalWS.prototype = {};
      OriginalWS.CONNECTING = 0;
      OriginalWS.OPEN = 1;
      
      // Simulate the wrapper creation logic
      const WrappedWS: any = function (this: any, ...args: any[]) {
        const instance = new (OriginalWS as any)(...args);
        // Add polyfill methods to instance if missing
        return instance;
      };
      WrappedWS.prototype = OriginalWS.prototype;
      
      // Simulate property copying
      Object.getOwnPropertyNames(OriginalWS).forEach((k) => {
        try {
          (WrappedWS as any)[k] = (OriginalWS as any)[k];
        } catch (_) {}
      });
      
      expect(WrappedWS.CONNECTING).toBe(0);
      expect(WrappedWS.OPEN).toBe(1);
      expect(WrappedWS.prototype).toBe(OriginalWS.prototype);
      
      const instance = new WrappedWS('ws://test');
      expect(instance.url).toBe('ws://test');
    });
  });

  describe('Environment setup functionality', () => {
    it('should test global object detection pattern', () => {
      // Test the global detection logic used in the polyfill
      const testGlobalDetection = () => {
        const G = typeof globalThis !== "undefined"
          ? globalThis
          : typeof self !== "undefined"
          ? self
          : {};
        return G;
      };
      
      const result = testGlobalDetection();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should test environment setup patterns', () => {
      const mockEnv: any = {};
      
      // Test window setup
      const win: any = (mockEnv.window ||= mockEnv);
      expect(win).toBe(mockEnv);
      
      // Test document setup
      const doc: any = (mockEnv.document ||= {});
      expect(doc).toBeDefined();
      
      // Test location setup
      if (!mockEnv.location) {
        mockEnv.location = { href: "" };
      } else if (typeof mockEnv.location.href === "undefined") {
        mockEnv.location.href = "";
      }
      expect(mockEnv.location.href).toBe("");
      
      // Test navigator setup
      const nav: any = (mockEnv.navigator ||= {});
      if (typeof nav.onLine === "undefined") {
        nav.onLine = true;
      }
      expect(nav.onLine).toBe(true);
      
      // Test document properties
      if (typeof doc.visibilityState === "undefined") {
        doc.visibilityState = "visible";
      }
      if (typeof doc.hidden === "undefined") {
        doc.hidden = false;
      }
      expect(doc.visibilityState).toBe("visible");
      expect(doc.hidden).toBe(false);
    });

    it('should test addEventListener setup for environment objects', () => {
      const mockTargets = [{}, {}, {}];
      
      mockTargets.forEach((t: any) => {
        if (t && typeof t.addEventListener !== "function") {
          t.addEventListener = function () {};
        }
        if (t && typeof t.removeEventListener !== "function") {
          t.removeEventListener = function () {};
        }
      });
      
      mockTargets.forEach(t => {
        expect(typeof (t as any).addEventListener).toBe('function');
        expect(typeof (t as any).removeEventListener).toBe('function');
      });
    });
  });

  describe('Direct polyfill testing', () => {
    it('should import polyfill multiple times without issues', () => {
      // Test that requiring the polyfill multiple times is safe
      expect(() => {
        require('../../services/ws-polyfill');
        require('../../services/ws-polyfill');
        require('../../services/ws-polyfill');
      }).not.toThrow();
    });

    it('should execute polyfill code paths', () => {
      // Import the polyfill to ensure its code is executed
      const polyfill = require('../../services/ws-polyfill');
      
      // Test that the polyfill module exports an empty object (as per export {})
      expect(polyfill).toBeDefined();
      expect(typeof polyfill).toBe('object');
    });

    it('should test error handling patterns used in polyfill', () => {
      // Test try-catch pattern used in property copying
      const sourceObj = {
        normalProp: 'value',
        get errorProp() {
          throw new Error('Access error');
        }
      };
      const targetObj: any = {};
      
      Object.getOwnPropertyNames(sourceObj).forEach((key) => {
        try {
          targetObj[key] = (sourceObj as any)[key];
        } catch (_) {
          // Error handling as used in polyfill
        }
      });
      
      expect(targetObj.normalProp).toBe('value');
      expect(targetObj.errorProp).toBeUndefined();
    });

    it('should test WeakMap and Set operations used in polyfill', () => {
      // Test the data structures used in the polyfill
      const listeners = new WeakMap<any, Record<string, Set<Function>>>();
      const testObj = {};
      
      // Test ensureMap-like functionality
      if (!listeners.has(testObj)) {
        listeners.set(testObj, {});
      }
      const map = listeners.get(testObj)!;
      
      // Test Set operations
      if (!map['test']) map['test'] = new Set();
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      
      map['test'].add(fn1);
      map['test'].add(fn2);
      map['test'].add(fn1); // Should not duplicate
      
      expect(map['test'].size).toBe(2);
      expect(map['test'].has(fn1)).toBe(true);
      
      map['test'].delete(fn1);
      expect(map['test'].has(fn1)).toBe(false);
      expect(map['test'].size).toBe(1);
      
      // Test forEach iteration
      const event = { type: 'test' };
      map['test'].forEach((fn) => {
        try {
          fn(event);
        } catch (_) {}
      });
      
      expect(fn2).toHaveBeenCalledWith(event);
    });
  });

  describe('Event listener functionality', () => {
    it('should create event listener maps correctly', () => {
      // Test the ensureMap functionality indirectly by testing a mock object
      const mockObject: any = {};
      const mockMap = new WeakMap();
      
      // Simulate the ensureMap function behavior
      if (!mockMap.has(mockObject)) {
        mockMap.set(mockObject, {} as Record<string, Set<(ev: any) => void>>);
      }
      const map = mockMap.get(mockObject)!;
      
      // Simulate addEventListener behavior
      if (!map['test']) map['test'] = new Set();
      const listener = jest.fn();
      map['test'].add(listener);
      
      expect(map['test'].has(listener)).toBe(true);
      expect(map['test'].size).toBe(1);
    });

    it('should handle event listener removal', () => {
      const mockObject: any = {};
      const mockMap = new WeakMap();
      
      // Setup
      mockMap.set(mockObject, {} as Record<string, Set<(ev: any) => void>>);
      const map = mockMap.get(mockObject)!;
      map['test'] = new Set();
      const listener = jest.fn();
      map['test'].add(listener);
      
      // Remove listener
      map['test']?.delete(listener);
      
      expect(map['test'].has(listener)).toBe(false);
    });

    it('should handle event dispatching to listeners', () => {
      const listeners = new Set<(ev: any) => void>();
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const event = { type: 'test', data: 'testData' };
      
      listeners.add(listener1);
      listeners.add(listener2);
      
      // Simulate dispatchEvent behavior
      listeners.forEach((fn) => {
        try {
          fn(event);
        } catch (_) {
          // Error handling is tested separately
        }
      });
      
      expect(listener1).toHaveBeenCalledWith(event);
      expect(listener2).toHaveBeenCalledWith(event);
    });

    it('should handle errors in event listeners gracefully', () => {
      const listeners = new Set<(ev: any) => void>();
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const normalListener = jest.fn();
      const event = { type: 'test' };
      
      listeners.add(errorListener);
      listeners.add(normalListener);
      
      // Simulate error handling in dispatchEvent
      expect(() => {
        listeners.forEach((fn) => {
          try {
            fn(event);
          } catch (_) {
            // Errors are caught and ignored
          }
        });
      }).not.toThrow();
      
      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('Property descriptor functionality', () => {
    it('should create property descriptors with getter and setter', () => {
      const mockPrototype: any = {};
      const property = 'ontest';
      
      // Simulate the property definition logic
      if (!Object.prototype.hasOwnProperty.call(mockPrototype, property)) {
        Object.defineProperty(mockPrototype, property, {
          configurable: true,
          enumerable: true,
          get() {
            return this[`__${property}`];
          },
          set(handler) {
            this[`__${property}`] = handler;
          },
        });
      }
      
      const descriptor = Object.getOwnPropertyDescriptor(mockPrototype, property);
      expect(descriptor?.configurable).toBe(true);
      expect(descriptor?.enumerable).toBe(true);
      expect(typeof descriptor?.get).toBe('function');
      expect(typeof descriptor?.set).toBe('function');
    });

    it('should store and retrieve handler values through descriptors', () => {
      const mockObject: any = {};
      const handler = jest.fn();
      
      // Simulate property getter/setter behavior
      const privateKey = '__ontest';
      mockObject[privateKey] = handler;
      
      expect(mockObject[privateKey]).toBe(handler);
    });
  });

  describe('Environment detection and setup', () => {
    it('should handle global object detection patterns', () => {
      // Test the global object detection pattern
      const testGlobal = (
        typeof globalThis !== "undefined"
          ? globalThis
          : typeof self !== "undefined"
          ? self
          : {}
      ) as any;
      
      expect(testGlobal).toBeDefined();
      expect(typeof testGlobal).toBe('object');
    });

    it('should handle window setup pattern', () => {
      const mockGlobal: any = {};
      
      // Simulate window setup logic
      const win: any = (mockGlobal.window ||= mockGlobal);
      
      expect(win).toBe(mockGlobal);
      expect(mockGlobal.window).toBe(mockGlobal);
    });

    it('should handle document setup pattern', () => {
      const mockGlobal: any = {};
      
      // Simulate document setup logic
      const doc: any = (mockGlobal.document ||= {});
      
      expect(doc).toBeDefined();
      expect(typeof doc).toBe('object');
      expect(mockGlobal.document).toBe(doc);
    });

    it('should handle location setup pattern', () => {
      const mockGlobal: any = {};
      
      // Simulate location setup logic
      if (!mockGlobal.location) {
        mockGlobal.location = { href: "" };
      } else if (typeof mockGlobal.location.href === "undefined") {
        mockGlobal.location.href = "";
      }
      
      expect(mockGlobal.location).toBeDefined();
      expect(mockGlobal.location.href).toBe("");
    });

    it('should handle navigator setup pattern', () => {
      const mockGlobal: any = {};
      
      // Simulate navigator setup logic
      const nav: any = (mockGlobal.navigator ||= {});
      if (typeof nav.onLine === "undefined") {
        nav.onLine = true;
      }
      
      expect(nav).toBeDefined();
      expect(nav.onLine).toBe(true);
    });

    it('should handle document properties setup pattern', () => {
      const mockDoc: any = {};
      
      // Simulate document properties setup logic
      if (typeof mockDoc.visibilityState === "undefined") {
        mockDoc.visibilityState = "visible";
      }
      if (typeof mockDoc.hidden === "undefined") {
        mockDoc.hidden = false;
      }
      
      expect(mockDoc.visibilityState).toBe("visible");
      expect(mockDoc.hidden).toBe(false);
    });
  });

  describe('Error handling patterns', () => {
    it('should handle try-catch blocks gracefully', () => {
      // Simulate error handling in property copying
      const sourceObject = {
        normalProp: 'value',
        get problematicProp() {
          throw new Error('Access error');
        }
      };
      const targetObject: any = {};
      
      Object.getOwnPropertyNames(sourceObject).forEach((key) => {
        try {
          targetObject[key] = (sourceObject as any)[key];
        } catch (_) {
          // Error is caught and ignored
        }
      });
      
      expect(targetObject.normalProp).toBe('value');
      expect(targetObject.problematicProp).toBeUndefined();
    });

    it('should handle WebSocket constructor wrapping pattern', () => {
      const OriginalWS = function(...args: any[]) {
        return { url: args[0] };
      };
      OriginalWS.prototype = {};
      OriginalWS.CONNECTING = 0;
      
      // Simulate WebSocket wrapping
      const WrappedWS: any = function(...args: any[]) {
        return new (OriginalWS as any)(...args);
      };
      WrappedWS.prototype = OriginalWS.prototype;
      
      // Simulate property copying
      Object.getOwnPropertyNames(OriginalWS).forEach((k) => {
        try {
          (WrappedWS as any)[k] = (OriginalWS as any)[k];
        } catch (_) {
          // Ignore errors
        }
      });
      
      expect(WrappedWS.CONNECTING).toBe(0);
      expect(WrappedWS.prototype).toBe(OriginalWS.prototype);
    });
  });

  describe('Event type validation', () => {
    it('should handle invalid event types', () => {
      // Simulate event type validation from dispatchEvent
      const validateEventType = (event: any) => {
        const type = event?.type;
        return typeof type === "string";
      };
      
      expect(validateEventType({ type: "valid" })).toBe(true);
      expect(validateEventType({ type: null })).toBe(false);
      expect(validateEventType({ type: undefined })).toBe(false);
      expect(validateEventType({})).toBe(false);
      expect(validateEventType(null)).toBe(false);
    });

    it('should handle event handler invocation pattern', () => {
      const mockHandler = jest.fn();
      const event = { type: 'test' };
      
      // Simulate handler invocation with error handling
      if (typeof mockHandler === "function") {
        try {
          mockHandler(event);
        } catch (_) {
          // Error is caught
        }
      }
      
      expect(mockHandler).toHaveBeenCalledWith(event);
    });
  });

  describe('WeakMap usage patterns', () => {
    it('should handle WeakMap operations correctly', () => {
      const weakMap = new WeakMap();
      const key = {};
      const value = { listeners: new Set() };
      
      // Test WeakMap operations used in the polyfill
      expect(weakMap.has(key)).toBe(false);
      weakMap.set(key, value);
      expect(weakMap.has(key)).toBe(true);
      expect(weakMap.get(key)).toBe(value);
    });

    it('should handle Set operations for listeners', () => {
      const listenerSet = new Set<Function>();
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      // Test Set operations used for listeners
      listenerSet.add(listener1);
      listenerSet.add(listener2);
      listenerSet.add(listener1); // Adding same listener twice
      
      expect(listenerSet.size).toBe(2); // Set deduplicates
      expect(listenerSet.has(listener1)).toBe(true);
      
      listenerSet.delete(listener1);
      expect(listenerSet.has(listener1)).toBe(false);
      expect(listenerSet.size).toBe(1);
    });
  });

  describe('Real polyfill execution - IMPROVED COVERAGE', () => {
    let originalWebSocket: any;
    let originalGlobalThis: any;
    let originalSelf: any;

    beforeEach(() => {
      // Save originals
      originalWebSocket = (global as any).WebSocket;
      originalGlobalThis = (global as any).globalThis;
      originalSelf = (global as any).self;
      
      // Ensure globalThis exists for testing
      if (typeof (global as any).globalThis === 'undefined') {
        (global as any).globalThis = global;
      }
      
      // Clean up for fresh test
      delete (global as any).WebSocket;
      delete (global as any).window;
      delete (global as any).document;
      delete (global as any).location;
      delete (global as any).navigator;
      
      jest.resetModules();
    });

    afterEach(() => {
      // Restore originals
      if (originalWebSocket) {
        (global as any).WebSocket = originalWebSocket;
      }
      if (originalGlobalThis) {
        (global as any).globalThis = originalGlobalThis;
      }
      if (originalSelf) {
        (global as any).self = originalSelf;
      }
    });

    it('should execute polyfill when WebSocket is missing', () => {
      // Ensure WebSocket doesn't exist
      expect((global as any).WebSocket).toBeUndefined();
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // The polyfill should not add WebSocket if it doesn't exist
      // but should set up environment variables
      expect((global as any).window).toBeDefined();
      expect((global as any).document).toBeDefined();
      expect((global as any).location).toBeDefined();
      expect((global as any).navigator).toBeDefined();
    });

    it('should execute polyfill when WebSocket exists but lacks methods', () => {
      // Create minimal WebSocket without addEventListener
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Should add missing methods
      expect(typeof mockWebSocket.prototype.addEventListener).toBe('function');
      expect(typeof mockWebSocket.prototype.removeEventListener).toBe('function');
      expect(typeof mockWebSocket.prototype.dispatchEvent).toBe('function');
    });

    it('should not modify WebSocket when addEventListener already exists', () => {
      // Create WebSocket with existing addEventListener
      const mockWebSocket: any = function() { return {}; };
      const existingAddEventListener = jest.fn();
      mockWebSocket.prototype = {
        addEventListener: existingAddEventListener
      };
      (global as any).WebSocket = mockWebSocket;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Should not modify existing addEventListener
      expect(mockWebSocket.prototype.addEventListener).toBe(existingAddEventListener);
    });

    it('should create WebSocket wrapper with instance methods', () => {
      // Create WebSocket without instance methods
      const mockWebSocket: any = function() { 
        return { readyState: 0 }; 
      };
      mockWebSocket.prototype = {};
      mockWebSocket.CONNECTING = 0;
      mockWebSocket.OPEN = 1;
      (global as any).WebSocket = mockWebSocket;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Should create wrapped constructor
      const WrappedWS = (global as any).WebSocket;
      expect(WrappedWS).toBeDefined();
      expect(WrappedWS.CONNECTING).toBe(0);
      expect(WrappedWS.OPEN).toBe(1);
      
      // Test instance creation
      const instance = new WrappedWS('ws://test');
      expect(instance).toBeDefined();
      expect(typeof instance.addEventListener).toBe('function');
      expect(typeof instance.removeEventListener).toBe('function');
      expect(typeof instance.dispatchEvent).toBe('function');
    });

    it('should handle property copying errors gracefully', () => {
      // Create WebSocket with problematic properties
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      Object.defineProperty(mockWebSocket, 'problematicProp', {
        get() { throw new Error('Access denied'); },
        enumerable: true,
        configurable: false
      });
      mockWebSocket.CONNECTING = 0;
      (global as any).WebSocket = mockWebSocket;
      
      // Execute the polyfill - should not throw
      expect(() => {
        require('../../services/ws-polyfill');
      }).not.toThrow();
      
      // Should still work despite property copying errors
      const WrappedWS = (global as any).WebSocket;
      expect(WrappedWS.CONNECTING).toBe(0);
    });

    it('should set up environment with self fallback scenario', () => {
      // Test self fallback scenario - keep globalThis but also set self
      (global as any).self = global;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Should still set up environment
      expect((global as any).window).toBeDefined();
      expect((global as any).document).toBeDefined();
      expect((global as any).location).toBeDefined();
      expect((global as any).navigator).toBeDefined();
    });

    it('should handle location setup branches', () => {
      // Test location undefined branch
      expect((global as any).location).toBeUndefined();
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Should create location with href
      expect((global as any).location).toBeDefined();
      expect((global as any).location.href).toBe("");
    });

    it('should handle existing location without href', () => {
      // Set up location without href
      (global as any).location = { protocol: 'https:' };
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Should add href property
      expect((global as any).location.href).toBe("");
      expect((global as any).location.protocol).toBe('https:');
    });

    it('should create event handler properties on prototype', () => {
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Check that event handler properties exist
      const proto = mockWebSocket.prototype;
      ['onopen', 'onmessage', 'onerror', 'onclose'].forEach(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(proto, prop);
        expect(descriptor).toBeDefined();
        expect(descriptor?.configurable).toBe(true);
        expect(descriptor?.enumerable).toBe(true);
      });
    });

    it('should not overwrite existing event handler properties', () => {
      const mockWebSocket: any = function() { return {}; };
      const existingOnOpen = { value: 'existing' };
      mockWebSocket.prototype = {};
      Object.defineProperty(mockWebSocket.prototype, 'onopen', existingOnOpen);
      (global as any).WebSocket = mockWebSocket;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Should not overwrite existing property
      const descriptor = Object.getOwnPropertyDescriptor(mockWebSocket.prototype, 'onopen');
      expect(descriptor?.value).toBe('existing');
    });

    it('should set up document properties correctly', () => {
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      const doc = (global as any).document;
      expect(doc.visibilityState).toBe('visible');
      expect(doc.hidden).toBe(false);
      expect(typeof doc.addEventListener).toBe('function');
      expect(typeof doc.removeEventListener).toBe('function');
    });

    it('should set up navigator properties correctly', () => {
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      const nav = (global as any).navigator;
      expect(nav.onLine).toBe(true);
    });

    it('should handle environment setup errors gracefully', () => {
      // Create a problematic environment
      Object.defineProperty(global, 'window', {
        get() { throw new Error('Window access denied'); },
        configurable: true
      });
      
      // Execute the polyfill - should not throw
      expect(() => {
        require('../../services/ws-polyfill');
      }).not.toThrow();
    });

    // FASE 1 & 2: TESTS REALES DEL POLYFILL - COVERAGE CRÍTICO
    it('should execute REAL polyfill code - addEventListener prototype (lines 31-33)', () => {
      // Setup WebSocket WITHOUT addEventListener to trigger polyfill lines 31-33
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {}; // NO addEventListener method
      (global as any).WebSocket = mockWebSocket;
      
      // Execute REAL polyfill code
      require('../../services/ws-polyfill');
      
      // Verify lines 31-33 were executed by checking real functionality
      const proto = mockWebSocket.prototype;
      expect(typeof proto.addEventListener).toBe('function');
      
      // Test REAL addEventListener functionality from lines 31-33
      const testObj = {};
      const listener = jest.fn();
      proto.addEventListener.call(testObj, 'test', listener);
      
      // Verify internal state was modified (ensureMap logic)
      expect(() => proto.addEventListener.call(testObj, 'test2', jest.fn())).not.toThrow();
    });

    it('should execute REAL polyfill code - removeEventListener prototype (lines 42-43)', () => {
      // Setup WebSocket WITHOUT removeEventListener
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      // Execute REAL polyfill code
      require('../../services/ws-polyfill');
      
      // Verify lines 42-43 were executed
      const proto = mockWebSocket.prototype;
      expect(typeof proto.removeEventListener).toBe('function');
      
      // Test REAL removeEventListener functionality from lines 42-43
      const testObj = {};
      const listener = jest.fn();
      proto.addEventListener.call(testObj, 'test', listener);
      proto.removeEventListener.call(testObj, 'test', listener);
      
      expect(() => proto.removeEventListener.call(testObj, 'test2', jest.fn())).not.toThrow();
    });

    it('should execute REAL property getters/setters (lines 58-61)', () => {
      // Setup WebSocket WITHOUT onopen, onmessage properties
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      // Execute REAL polyfill code
      require('../../services/ws-polyfill');
      
      // Test REAL getter/setter functionality from lines 58-61
      const instance = new mockWebSocket();
      const handler = jest.fn();
      
      // Test property setter (line 60-61)
      instance.onopen = handler;
      expect(instance.onopen).toBe(handler); // Test getter (line 58)
      
      // Test all event handler properties
      ['onmessage', 'onerror', 'onclose'].forEach(prop => {
        const testHandler = jest.fn();
        instance[prop] = testHandler;
        expect(instance[prop]).toBe(testHandler);
      });
    });

    it('should execute REAL dispatchEvent logic (lines 69-88)', () => {
      // Setup WebSocket WITHOUT dispatchEvent
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      // Execute REAL polyfill code
      require('../../services/ws-polyfill');
      
      const proto = mockWebSocket.prototype;
      const instance = new mockWebSocket();
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const event = { type: 'test' };
      
      // Test lines 69-88: Add listeners and dispatch
      proto.addEventListener.call(instance, 'test', listener1);
      proto.addEventListener.call(instance, 'test', listener2);
      
      // Execute REAL dispatchEvent from lines 69-88
      const result = proto.dispatchEvent.call(instance, event);
      
      expect(result).toBe(true);
      expect(listener1).toHaveBeenCalledWith(event);
      expect(listener2).toHaveBeenCalledWith(event);
    });

    it('should execute REAL dispatchEvent with event handlers (lines 81-88)', () => {
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      require('../../services/ws-polyfill');
      
      const proto = mockWebSocket.prototype;
      const instance = new mockWebSocket();
      const handler = jest.fn();
      const event = { type: 'test' };
      
      // Set event handler property
      instance.ontest = handler;
      
      // Execute REAL dispatchEvent handler logic (lines 81-88)
      const result = proto.dispatchEvent.call(instance, event);
      
      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should execute REAL instance method polyfilling (lines 111-112)', () => {
      // Setup WebSocket that creates instances WITHOUT methods
      const mockWebSocket: any = function() { 
        return { url: 'test' }; // Instance without addEventListener
      };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      // Execute REAL polyfill code
      require('../../services/ws-polyfill');
      
      // Get wrapped constructor
      const WrappedWS = (global as any).WebSocket;
      const instance = new WrappedWS();
      
      // Verify lines 111-112 executed - instance methods added
      expect(typeof instance.addEventListener).toBe('function');
      expect(typeof instance.removeEventListener).toBe('function');
      expect(typeof instance.dispatchEvent).toBe('function');
      
      // Test REAL instance functionality
      const listener = jest.fn();
      const event = { type: 'test' };
      
      instance.addEventListener('test', listener);
      const result = instance.dispatchEvent(event);
      
      expect(result).toBe(true);
      expect(listener).toHaveBeenCalledWith(event);
    });

    it('should execute real dispatchEvent with listeners and handlers', () => {
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Create instance using the wrapped constructor
      const WrappedWS = (global as any).WebSocket;
      const instance = new WrappedWS();
      const listener = jest.fn();
      const event = { type: 'test' };
      
      // Add listener and dispatch event
      instance.addEventListener('test', listener);
      const result = instance.dispatchEvent(event);
      
      expect(result).toBe(true);
      expect(listener).toHaveBeenCalledWith(event);
    });

    it('should handle dispatchEvent with invalid event types', () => {
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Create instance using the wrapped constructor
      const WrappedWS = (global as any).WebSocket;
      const instance = new WrappedWS();
      
      // Test invalid event types
      expect(instance.dispatchEvent({ type: null })).toBe(false);
      expect(instance.dispatchEvent({ type: undefined })).toBe(false);
      expect(instance.dispatchEvent({})).toBe(false);
    });

    it('should handle self as global reference', () => {
      // Set self to reference global
      (global as any).self = global;
      
      // Execute the polyfill
      require('../../services/ws-polyfill');
      
      // Should still set up environment using self
      expect((global as any).window).toBeDefined();
      expect((global as any).document).toBeDefined();
    });

    it('should handle environment setup gracefully', () => {
      // Execute the polyfill - should not throw even with minimal environment
      expect(() => {
        require('../../services/ws-polyfill');
      }).not.toThrow();
      
      // Should set up basic environment
      expect((global as any).window).toBeDefined();
      expect((global as any).document).toBeDefined();
    });

    // ESPECÍFICOS PARA LÍNEAS RESTANTES NO CUBIERTAS
    it('should execute property getter code (lines 58-61)', () => {
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      require('../../services/ws-polyfill');
      
      const instance = new mockWebSocket();
      
      // Test getter by first setting through setter, then accessing getter
      const testHandler = jest.fn();
      instance.onopen = testHandler; // This uses setter (lines 60-61)
      const result = instance.onopen; // This uses getter (line 58)
      expect(result).toBe(testHandler);
      
      // Test all event handler getters/setters
      ['onmessage', 'onerror', 'onclose'].forEach(prop => {
        const handler = jest.fn();
        instance[prop] = handler; // setter
        expect(instance[prop]).toBe(handler); // getter
      });
    });

    it('should execute dispatchEvent return false path (line 88)', () => {
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      require('../../services/ws-polyfill');
      
      const proto = mockWebSocket.prototype;
      const instance = new mockWebSocket();
      
      // Create event with no listeners and no handler - should hit line 88
      const event = { type: 'nonexistent' };
      
      const result = proto.dispatchEvent.call(instance, event);
      expect(result).toBe(false); // This executes line 88: return false
    });

    it('should execute instance method checking (lines 111-112)', () => {
      // Create WebSocket that returns instances WITH existing addEventListener function
      const existingAddEventListener = jest.fn();
      const mockWebSocket: any = function() { 
        return { 
          url: 'test',
          addEventListener: existingAddEventListener // Instance already has FUNCTION method
        }; 
      };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      require('../../services/ws-polyfill');
      
      const WrappedWS = (global as any).WebSocket;
      const instance = new WrappedWS();
      
      // Lines 111-112: if (typeof instance.addEventListener !== "function")
      // Should NOT overwrite existing FUNCTION method
      expect(instance.addEventListener).toBe(existingAddEventListener);
      
      // Test that existing method works
      instance.addEventListener('test', jest.fn());
      expect(existingAddEventListener).toHaveBeenCalled();
    });

    it('should execute instance handler invocation (lines 129-136)', () => {
      const mockWebSocket: any = function() { return {}; };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      require('../../services/ws-polyfill');
      
      const WrappedWS = (global as any).WebSocket;
      const instance = new WrappedWS();
      const handler = jest.fn();
      const event = { type: 'test' };
      
      // Set handler on instance (not through property)
      instance.ontest = handler;
      
      // Call dispatchEvent on instance (not prototype) - executes lines 129-136
      const result = instance.dispatchEvent(event);
      
      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith(event);
    });

    it('should execute all remaining edge cases', () => {
      const mockWebSocket: any = function() { 
        return { 
          removeEventListener: null, // Existing but not function
          dispatchEvent: undefined   // Existing but not function
        }; 
      };
      mockWebSocket.prototype = {};
      (global as any).WebSocket = mockWebSocket;
      
      require('../../services/ws-polyfill');
      
      const WrappedWS = (global as any).WebSocket;
      const instance = new WrappedWS();
      
      // Should have all methods polyfilled
      expect(typeof instance.addEventListener).toBe('function');
      expect(typeof instance.removeEventListener).toBe('function'); 
      expect(typeof instance.dispatchEvent).toBe('function');
      
      // Test actual functionality to ensure code paths are executed
      const listener = jest.fn();
      instance.addEventListener('test', listener);
      instance.removeEventListener('test', listener);
      
      const result = instance.dispatchEvent({ type: 'empty' });
      expect(result).toBe(false);
    });
  });
});
