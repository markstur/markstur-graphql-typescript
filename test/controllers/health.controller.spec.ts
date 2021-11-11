import {Application} from 'express';
import {default as request} from 'supertest';

import {buildApiServer} from '../helper';

describe('health.controller', () => {

  let app: Application;
  let apiServer;

  beforeEach(async () => {
    apiServer = buildApiServer();
    expect(await apiServer.start()).toBe(apiServer);

    app = apiServer.getApp();
  });

  afterEach(async () => {
    expect(await apiServer.stop()).toEqual(true);
  });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  describe('Given /health', () => {
    test('should return 200 status', () => {
      return request(app).get('/health').expect(200);
    });

    test('should return {status: "UP:}', () => {
      return request(app).get('/health').expect({status: 'UP'});
    });
  });

});
