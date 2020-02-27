import { Logger } from "@nestjs/common";

export interface NestBrokerOptions {
  url: string;
  type: string;
  service?: string;
  logger?: Logger;
}
