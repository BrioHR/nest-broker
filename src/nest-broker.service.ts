import { Inject, Injectable } from "@nestjs/common";
import { BrokerFactory } from "./adapters/broker-adapter.factory";
import { NEST_BROKER_OPTIONS } from "./constants";
import { NestBrokerOptions } from "./interfaces";

interface INestBrokerService {
  publish(topic: string, content: {}): Promise<any>;
  subscribe(topic: string, prefetch: number, callback: () => void): Promise<any>;
}

@Injectable()
export class NestBrokerService implements INestBrokerService {
  constructor(@Inject(NEST_BROKER_OPTIONS) private _NestBrokerOptions: NestBrokerOptions) {}

  public async publish(topic: string, content: {}): Promise<any> {
    return BrokerFactory.getInstance(this._NestBrokerOptions).publish(topic, content);
  }

  public async subscribe(
    topic: string,
    prefetch: number,
    callback: (message: string) => void
  ): Promise<any> {
    return BrokerFactory.getInstance(this._NestBrokerOptions).subscribe(topic, prefetch, callback);
  }
}
