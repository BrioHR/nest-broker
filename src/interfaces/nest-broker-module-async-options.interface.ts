import { ModuleMetadata, Type } from "@nestjs/common/interfaces";
import { NestBrokerOptionsFactory } from "./nest-broker-options-factory.interface";
import { NestBrokerOptions } from "./nest-broker-options.interface";

export interface NestBrokerAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  inject?: any[];
  useExisting?: Type<NestBrokerOptionsFactory>;
  useClass?: Type<NestBrokerOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<NestBrokerOptions> | NestBrokerOptions;
}
