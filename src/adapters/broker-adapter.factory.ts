import { NestBrokerOptions } from "../interfaces";
import { BrokerAdapterInterface } from "./broker-adapter.interface";
import { RabbitMQAdapter } from "./rabbitmq.adapter";

export class BrokerFactory {
  private static instance: BrokerAdapterInterface;

  private constructor() {}

  public static getInstance(options: NestBrokerOptions): BrokerAdapterInterface {
    if (!BrokerFactory.instance) {
      BrokerFactory.instance = new RabbitMQAdapter(options.url, options.service, options.logger);
    }

    return BrokerFactory.instance;
  }
}
