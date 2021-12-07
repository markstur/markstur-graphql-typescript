export abstract class ConverterApi {
  abstract toNumber(roman: string): Promise<number>;
  abstract toRoman(n: number): Promise<string>;
  abstract isHealthy(): Promise<boolean>;
}
