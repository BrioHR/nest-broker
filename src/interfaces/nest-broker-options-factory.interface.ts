import { NestBrokerOptions } from "./nest-broker-options.interface";

export interface NestBrokerOptionsFactory {
  createNestBrokerOptions(): Promise<NestBrokerOptions> | NestBrokerOptions;
}
