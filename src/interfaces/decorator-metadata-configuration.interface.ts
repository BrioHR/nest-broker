export interface DecoratorMetadataConfiguration {
  topic: string;
  target: string;
  methodName: string;
  callback: () => void;
}
