import { NestBrokerOptions } from "../interfaces";
import { BrokerAdapterInterface } from "./broker-adapter.interface";
import { RabbitMQAdapter } from "./rabbitmq.adapter";

export class BrokerFactory {
  public static getInstance(options: NestBrokerOptions): BrokerAdapterInterface {
    return new RabbitMQAdapter(options.url, options.service, options.logger);
    /*
    TODO switch type load specific adapter
    switch (type) {
      case BROKER_TYPE_RABBIT:
        return new RabbitMQAdapter(url);
      default:
        throw new Error('Broker not implemented');
    } */
  }
}
