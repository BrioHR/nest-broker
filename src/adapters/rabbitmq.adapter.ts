import { Logger } from "@nestjs/common";
import { MODULE_NAME } from "./../constants";
import { BrokerAdapterInterface } from "./broker-adapter.interface";

export class RabbitMQAdapter implements BrokerAdapterInterface {
  private logger: Logger;

  private connection: any; // TODO, need types
  private publishChannelWrapper: any; // TODO, need types

  constructor(
    private url: string,
    private service: string,
    customLogger?: Logger
  ) {
    this.logger = new Logger(MODULE_NAME);
    if (customLogger) {
      this.logger = customLogger;
    }

    this.connection = require("amqp-connection-manager").connect([this.url]);
    this.connection.on("connect", () => {
      this.logger.log(`Connected to RabbitMQ.`);
    });
    this.connection.on("disconnect", () => {
      this.logger.error(`Disconnected.`);
    });

    this.publishChannelWrapper = this.connection.createChannel({
      json: true
    });
  }

  public async publish(topic: string, content: {}): Promise<void> {
    this.logger.log(`Publish ${topic} ${JSON.stringify(content)}`);

    await Promise.all([
      this.publishChannelWrapper.assertExchange(topic, "fanout"),
      this.publishChannelWrapper.publish(topic, "", content)
    ]).catch(e => this.logger.error(e));
  }

  public async subscribe(
    topic: string,
    callback: (message: string) => void
  ): Promise<void> {
    const exchange = topic;
    const queue = `${this.service}_${topic}`;

    this.connection.createChannel({
      json: true,
      setup: channel => {
        return Promise.all([
          channel.assertQueue(queue, { durable: true }),
          channel.assertExchange(exchange, "fanout"),
          channel.bindQueue(queue, exchange),
          channel.consume(queue, async msg => {
            this.logger.log(`Consume ${queue} ${msg.content.toString()}`);
            if (msg !== null) {
              try {
                callback(JSON.parse(msg.content.toString()));
                channel.ack(msg);
              } catch (e) {
                channel.reject();
              }
            }
          })
        ]).catch(e => this.logger.error(e));
      }
    });
  }
}
