export interface BrokerAdapterInterface {
  publish(topic: string, content: {}): any;
  subscribe(topic: string, prefetch: number, callback: (message: string) => void): any;
}
