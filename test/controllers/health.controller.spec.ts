import { Application } from 'express';
import supertest from 'supertest';
import { Errors } from 'typescript-rest';

import { ConverterApi } from '../../src/services';
import { buildApiServer } from '../helper';
import { Container, Scope } from 'typescript-ioc';

/* eslint-disable */
class MockNoConverter implements ConverterApi {
  isHealthy(): Promise<boolean> {
    return Promise.resolve(false);
  }
  toNumber(roman: string): Promise<number> {
    throw Errors.InternalServerError;
  }
  toRoman(n: number): Promise<string> {
    throw Errors.InternalServerError;
  }
}

class MockConverter implements ConverterApi {
  isHealthy(): Promise<boolean> {
    return Promise.resolve(true);
  }
  toNumber(roman: string): Promise<number> {
    return Promise.resolve(0);
  }
  toRoman(n: number): Promise<string> {
    return Promise.resolve('nulla');
  }
}
/* eslint-enable */

describe('health.controller', () => {
  let app: Application;
  let apiServer;

  beforeEach(async () => {
    apiServer = buildApiServer();
    await apiServer.start();

    app = apiServer.getApp();
  });

  afterEach(async () => {
    await apiServer.stop();
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('MOCK healthy converter', () => {
    beforeEach(async () => {
      Container.bind(ConverterApi).scope(Scope.Singleton).to(MockConverter);
    });

    describe('Given /health', () => {
      test('should return 200 status', () => {
        return supertest(app).get('/health').expect(200);
      });

      test('should return {status: "DOWN:}', () => {
        return supertest(app)
          .get('/health')
          .expect({
            status: 'UP',
            checks: [
              {
                name: 'converterHealth',
                status: 'UP',
              },
            ],
          });
      });
    });
  });

  describe('WITHOUT converter', () => {
    beforeEach(async () => {
      Container.bind(ConverterApi).scope(Scope.Singleton).to(MockNoConverter);
    });

    test('canary validates test infrastructure', () => {
      expect(true).toBe(true);
    });

    describe('Given /health', () => {
      test('should return 200 and {status: "DOWN:}', async () => {
        await supertest(app)
          .get('/health')
          .expect(200, {
            status: 'DOWN',
            checks: [
              {
                name: 'converterHealth',
                status: 'DOWN',
              },
            ],
          });
      });
    });
  });
});
