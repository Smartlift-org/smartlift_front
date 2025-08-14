declare module '@rails/actioncable' {
  export interface Consumer {
    subscriptions: {
      create(
        channelName: string | { channel: string; [key: string]: any },
        callbacks?: {
          connected?: () => void;
          disconnected?: () => void;
          received?: (data: any) => void;
          rejected?: () => void;
        }
      ): Subscription;
    };
    connection: {
      isOpen(): boolean;
      monitor: {
        on(event: string, callback: () => void): void;
      };
    };
    disconnect(): void;
  }

  export interface Subscription {
    unsubscribe(): void;
    perform(action: string, data?: any): void;
  }

  export function createConsumer(url: string): Consumer;
}
