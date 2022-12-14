import { SetMetadata } from "@nestjs/common";
import { BROKER_SUBSCRIBE } from "../constants";
import { DecoratorMetadataConfiguration } from "../interfaces/decorator-metadata-configuration.interface";

export const Subscribe = (topic: string, prefetch: number = 0) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata<string, DecoratorMetadataConfiguration>(BROKER_SUBSCRIBE, {
      topic,
      prefetch,
      target: target.constructor.name,
      methodName: propertyKey,
      callback: descriptor.value
    })(target, propertyKey, descriptor);

    return descriptor;
  };
};
