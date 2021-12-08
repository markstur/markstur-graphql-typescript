import { ObjectFactory } from 'typescript-ioc';

const baseUrl: string = process.env.SERVICE_URL || 'localhost:3002';

export const converterConfigFactory: ObjectFactory = () => ({
  baseUrl,
});
