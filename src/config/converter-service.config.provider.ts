import { ObjectFactory } from 'typescript-ioc';
import { config } from '../../package.json';

const baseUrl: string =
  process.env.CONVERTER_URL ||
  config.converterUrl ||
  'http://markstur-converter:80';

export const converterConfigFactory: ObjectFactory = () => ({
  baseUrl,
});
