export interface DecoratorMetadataConfiguration {
  topic: string;
  prefetch: number;
  target: string;
  methodName: string;
  callback: () => void;
}
