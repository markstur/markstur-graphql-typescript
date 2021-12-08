import { ConverterServiceConfig } from './converter-service.config';
import { converterConfigFactory } from './converter-service.config.provider';
import { Container } from 'typescript-ioc';

export * from './converter-service.config';

Container.bind(ConverterServiceConfig).factory(converterConfigFactory);
