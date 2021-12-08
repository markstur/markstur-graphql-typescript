import { Application } from 'express';
import supertest from 'supertest';
import { Container, Scope } from 'typescript-ioc';

import { HelloWorldApi } from '../../src/services';
import { buildApiServer } from '../helper';

class MockHelloWorldService implements HelloWorldApi {
  greeting = jest.fn().mockName('greeting');
}

describe('hello-world.controller', () => {
  let apiServer;
  let app: Application;
  let mockGreeting: jest.Mock;

  beforeEach(async () => {
    apiServer = buildApiServer();
    await apiServer.start();

    app = apiServer.getApp();

    Container.bind(HelloWorldApi)
      .scope(Scope.Singleton)
      .to(MockHelloWorldService);

    const mockService: HelloWorldApi = Container.get(HelloWorldApi);
    mockGreeting = mockService.greeting as jest.Mock;
  });

  afterEach(async () => {
    await apiServer.stop();
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('Given /hello', () => {
    const expectedResponse = 'Hello there!';

    beforeEach(() => {
      mockGreeting.mockReturnValueOnce(Promise.resolve(expectedResponse));
    });

    test('should return "Hello, World!"', async () => {
      await supertest(app)
        .get('/hello')
        .expect(200)
        .then((res) => {
          expect(res.text).toBe(expectedResponse);
        });
    });
  });

  describe('Given /hello/Johnny', () => {
    const name = 'Johnny';

    beforeEach(() => {
      mockGreeting.mockImplementation((name) => name);
    });

    test('should return "Hello, Johnny!"', async () => {
      await supertest(app)
        .get(`/hello/${name}`)
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toBe(name);
        });
    });
  });
});
