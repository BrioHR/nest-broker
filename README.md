## Description

[NestJS](https://github.com/nestjs/nest) module to produce and consume messages with the broker of your choice.

From the [BrioHR](http://briohr.com) team.

Dependencies :

- [@nestjs-plus/discovery](https://www.npmjs.com/package/@nestjs-plus/discovery)
- [amqplib](https://www.npmjs.com/package/amqplib)

For now these brokers are implemented :

- RabbitMQ : `BROKER_TYPE_RABBIT`

Future brokers to implement :

- Apache Kafka : `BROKER_TYPE_KAFKA`

## Installation

```bash
$ npm i --save @briohr/nest-broker
```

## Usage

Import `NestBrokerModule`:

```typescript
@Module({
  imports: [NestBrokerModule.register({
    url: string, // url of your broker
    type: BROKER_TYPE_RABBIT, // other types will be implemented
    service: 'serviceName' // optional
  })],
  providers: [...],
})
export class AppModule {}
```

Inject `NestBrokerService`:

```typescript
@Injectable()
export class MyService {
  constructor(private readonly nestBroker: NestBrokerService) {}
}
```

## Async options

```typescript
NestBrokerModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    url: configService.getString('BROKER_URL'),
    type: BROKER_TYPE_RABBIT,
    service: 'serviceName',
    logger: new MyLogger()
  }),
  inject: [ConfigService],
}),
```

## API Spec

#### nestBrokerService.publish(topic: string, content: {}): Promise<any>

The publish method produce a message in the specified topic.

## Decorator

#### @Subscribe(topic: string, prefetch = 0)

Used to register and subscribe a service method to a specified topic. **Only on NestJS services methods.**

## Example

### Producer

```typescript
@Controller()
export class AppController {
  constructor(private nestBroker: NestBrokerService) {}

  @Post("/employee")
  createEmployee(): Employee {
    // handle your logic
    const employee = this.employeeService.create({
      id: 1,
      name: "Elliot Alderson"
    });

    const testValue = 9999;

    // when you are done just publish your message with the data you want
    // (this is just an example)
    if (employee && testValue > 0) {
      this.nestBroker.publish("CREATE_EMPLOYEE", {
        id: employee.id,
        name: employee.name,
        testValue
      });
    }

    return employee;
  }
}
```

### Consumer

```typescript
@Injectable()
export class AppService {
  @Subscribe("CREATE_EMPLOYEE")
  processNewEmployee(messageBody): void {
    // handle the CREATE_EMPLOYEE message
    console.log(messageBody); // {id: 1, name: "Elliot Alderson", testValue: 9999}
  }
}
```

The `NestBrokerModule` takes an `options` object:

- `url` is a string, and this is the url to your broker
- `type` is a constant from this module, so you can set the broker type
- `service` is a string, and optional, it's used in case you have multiple service and you want to subscribe them all to the same topic (required for RabbitMQ)
- `logger` is an instance of a custom NestJS Logger, and optional

#### Informations about RabbitMQ implementation

When you publish a message, it is sent to a fanout exchange.

In the background, this module use the `service` option to create specific queues for each consumers. And bind them to the exchange.

The prefetch option in the subscriber decorator is to allow RabbitMQ consume multiples messages at the same time.

#### Informations about Apache Kafka implementation

Not implemented.
