export interface BrokerAdapterInterface {
  publish(topic: string, content: {}): Promise<void>;
  subscribe(topic: string, prefetch: number, callback: (message: string) => void): Promise<void>;
}
