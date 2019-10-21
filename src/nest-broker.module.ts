import { DiscoveryModule, DiscoveryService } from "@nestjs-plus/discovery";
import { DynamicModule, Global, Module, OnModuleInit, Provider } from "@nestjs/common";
import { BROKER_SUBSCRIBE, NEST_BROKER_OPTIONS } from "./constants";
import {
  DecoratorMetadataConfiguration,
  NestBrokerAsyncOptions,
  NestBrokerOptions,
  NestBrokerOptionsFactory,
} from "./interfaces";
import { createNestBrokerProviders } from "./nest-broker.providers";
import { NestBrokerService } from "./nest-broker.service";

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [NestBrokerService],
  exports: [NestBrokerService],
})
export class NestBrokerModule implements OnModuleInit {
  public static register(options: NestBrokerOptions): DynamicModule {
    return {
      module: NestBrokerModule,
      providers: createNestBrokerProviders(options),
    };
  }

  public static registerAsync(options: NestBrokerAsyncOptions): DynamicModule {
    return {
      module: NestBrokerModule,
      providers: [...this.createProviders(options)],
    };
  }

  private static createProviders(options: NestBrokerAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createOptionsProvider(options)];
    }

    return [
      this.createOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createOptionsProvider(options: NestBrokerAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: NEST_BROKER_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    return {
      provide: NEST_BROKER_OPTIONS,
      useFactory: async (optionsFactory: NestBrokerOptionsFactory) =>
        optionsFactory.createNestBrokerOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  constructor(
    private readonly brokerService: NestBrokerService,
    private readonly discover: DiscoveryService,
  ) {}

  public async onModuleInit() {
    await this.registerSubscribers();
  }

  private async registerSubscribers() {
    const providers = await this.discover.providerMethodsWithMetaAtKey<
      DecoratorMetadataConfiguration
    >(BROKER_SUBSCRIBE);

    for (const provider of providers) {
      this.brokerService.subscribe(provider.meta.topic, provider.meta.callback);
    }
  }
}
