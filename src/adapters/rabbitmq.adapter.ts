import { Logger } from "@nestjs/common";

import { BrokerAdapterInterface } from "./broker-adapter.interface";
import { MODULE_NAME } from "./../constants";

export class RabbitMQAdapter implements BrokerAdapterInterface {
  private logger: Logger;
  constructor(private url: string, private service: string, customLogger?: Logger) {
    this.logger = new Logger(MODULE_NAME);
    if (customLogger) {
      this.logger = customLogger;
    }
  }

  public async publish(topic: string, content: {}): Promise<void> {
    try {
      this.connect(this.url, connect => {
        connect
          .then(async (connection: any) => {
            return connection.createChannel();
          })
          .then(async (channel: any) => {
            this.logger.log(`Publish ${topic} ${JSON.stringify(content)}`);

            return Promise.all([
              channel.assertExchange(topic, "fanout"),
              channel.publish(topic, "", Buffer.from(JSON.stringify(content)))
            ]);
          });
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  public async subscribe(topic: string, callback: (message: string) => void): Promise<void> {
    try {
      this.connect(this.url, connect => {
        connect
          .then(async (connection: any) => {
            return connection.createChannel();
          })
          .then(async (channel: any) => {
            const exchange = topic;
            const queue = `${this.service}_${topic}`;

            return Promise.all([
              channel.assertQueue(queue),
              channel.assertExchange(exchange, "fanout"),
              channel.bindQueue(queue, exchange),
              channel.consume(queue, async msg => {
                this.logger.log(`Consume ${queue} ${msg.content.toString()}`);
                if (msg !== null) {
                  try {
                    callback(JSON.parse(msg.content.toString()));
                    channel.ack(msg);
                  } catch (e) {
                    // TODO handle nack
                    channel.reject();
                  }
                }
              })
            ]);
          });
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  private connect(url: string, callback): any {
    require("amqplib/callback_api").connect(url, (err, conn) => {
      if (err) {
        this.logger.error("[AMQP]", err.message);

        return setTimeout(() => this.connect(url, callback), 3000);
      }
      conn.on("error", err => {
        if (err.message !== "Connection closing") {
          this.logger.error("[AMQP] conn error", err.message);

          return setTimeout(() => this.connect(url, callback), 3000);
        }
      });
      conn.on("close", () => {
        this.logger.error("[AMQP] reconnecting");

        return setTimeout(() => this.connect(url, callback), 3000);
      });

      this.logger.log("[AMQP] connected");

      callback(Promise.resolve(conn));
    });
  }
}
