export interface BrokerAdapterInterface {
  publish(topic: string, content: {}): Promise<void>;
  subscribe(topic: string, prefetch: number, callback: (message: string) => void, options?: { ackEarly?: boolean; timeout?: number }): Promise<void>;
}
