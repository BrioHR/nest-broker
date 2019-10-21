import { BrokerAdapterInterface } from "./broker-adapter.interface";

export class RabbitMQAdapter implements BrokerAdapterInterface {
  constructor(private url: string, private service: string) {}

  public publish(topic: string, content: {}) {
    return require("amqplib")
      .connect(this.url)
      .then((connection: any) => {
        connection.createChannel().then(async (channel: any) => {
          return Promise.all([
            channel.assertExchange(topic, "fanout"),
            channel.publish(topic, "", Buffer.from(JSON.stringify(content))),
          ]);
        });
      });
  }

  public subscribe(topic: string, callback: (message: string) => void) {
    return require("amqplib")
      .connect(this.url)
      .then((connection: any) => {
        const exchange = topic;
        topic = `${this.service}_${topic}`;
        connection.createChannel().then(async (channel: any) => {
          return Promise.all([
            channel.assertQueue(topic),
            channel.assertExchange(exchange, "fanout"),
            channel.bindQueue(topic, exchange),
            channel.consume(topic, msg => {
              if (msg !== null) {
                try {
                  callback(JSON.parse(msg.content.toString()));
                  channel.ack(msg);
                } catch (e) {
                  // TODO handle nack
                  channel.reject();
                }
              }
            }),
          ]);
        });
      });
  }
}
