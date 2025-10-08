import { Logger } from "@nestjs/common";
import { MODULE_NAME } from "./../constants";
import { BrokerAdapterInterface } from "./broker-adapter.interface";

export class RabbitMQAdapter implements BrokerAdapterInterface {
  private logger: Logger;

  private connection: any; // TODO, need types
  private publishChannelWrapper: any; // TODO, need types

  constructor(private url: string, private service: string, customLogger?: Logger) {
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

    await Promise.all([this.publishChannelWrapper.assertExchange(topic, "fanout"), this.publishChannelWrapper.publish(topic, "", content)]).catch(e =>
      this.logger.error(e)
    );
  }

  public async subscribe(
    topic: string, 
    prefetch: number, 
    callback: (message: string) => void | Promise<void>,
    options?: { ackEarly?: boolean; timeout?: number }
  ): Promise<void> {
    const exchange = topic;
    const queue = `${this.service}_${topic}`;
    const ackEarly = options?.ackEarly ?? false;
    const timeout = options?.timeout ?? 30000;
    
    if (!prefetch) {
      prefetch = 0;
    }
    
    this.connection.createChannel({
      json: true,
      setup: channel => {
        return Promise.all([
          channel.assertQueue(queue, { durable: true }),
          channel.assertExchange(exchange, "fanout"),
          channel.prefetch(prefetch),
          channel.bindQueue(queue, exchange),
          channel.consume(
            queue, 
            async msg => {
              this.logger.log(`Consume ${queue} ${msg.content.toString()}`);
              
              if (msg !== null) {
                // Ack early if configured
                if (ackEarly) {
                  channel.ack(msg);
                }
                
                try {
                  const parsedMessage = JSON.parse(msg.content.toString());
                  
                  if (callback["constructor"]["name"] === "AsyncFunction") {
                    await callback(parsedMessage);
                  } else {
                    callback(parsedMessage);
                  }
                  
                  // Ack after processing if not early ack
                  if (!ackEarly) {
                    channel.ack(msg);
                  }
                  
                  this.logger.log(`Successfully processed message from ${queue}`);
                } catch (e) {
                  this.logger.error(`Error processing message from ${queue}: ${e.message}`, e.stack);
                  
                  // Only reject if we haven't already acked
                  if (!ackEarly && msg && msg.fields && msg.fields.deliveryTag) {
                    channel.reject(msg, false);
                  }
                }
              }
            },
            {
              consumerTimeout: timeout
            }
          )
        ]).catch(e => this.logger.error(e));
      }
    });
  }
}
