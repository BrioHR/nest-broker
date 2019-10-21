export interface BrokerAdapterInterface {
  publish(topic: string, content: {}): any;
  subscribe(topic: string, callback: (message: string) => void): any;
}
