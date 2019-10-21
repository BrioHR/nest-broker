// tslint:disable: variable-name
import { Inject, Injectable, Logger } from "@nestjs/common";
import { BrokerFactory } from "./adapters/broker-adapter.factory";
import { NEST_BROKER_OPTIONS } from "./constants";
import { NestBrokerOptions } from "./interfaces";

interface INestBrokerService {
  publish(topic: string, content: {}): Promise<any>;
  subscribe(topic: string, callback: () => void): Promise<any>;
}

@Injectable()
export class NestBrokerService implements INestBrokerService {
  private readonly logger: Logger;
  constructor(@Inject(NEST_BROKER_OPTIONS) private _NestBrokerOptions: NestBrokerOptions) {
    this.logger = new Logger("NestBrokerService");
    this.logger.log(`Options: ${JSON.stringify(this._NestBrokerOptions)}`);
  }

  public async publish(topic: string, content: {}): Promise<any> {
    return BrokerFactory.getInstance(this._NestBrokerOptions).publish(topic, content);
  }

  public async subscribe(topic: string, callback: (message: string) => void): Promise<any> {
    return BrokerFactory.getInstance(this._NestBrokerOptions).subscribe(topic, callback);
  }
}
