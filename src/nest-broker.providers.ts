import { NEST_BROKER_OPTIONS } from "./constants";
import { NestBrokerOptions } from "./interfaces";

export const createNestBrokerProviders = (options: NestBrokerOptions) => {
  return [
    {
      provide: NEST_BROKER_OPTIONS,
      useValue: options,
    },
  ];
};
