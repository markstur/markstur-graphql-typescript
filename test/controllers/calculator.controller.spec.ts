import {Application} from 'express';
import {default as request} from 'supertest';

import {buildApiServer} from '../helper';

describe('calculator.controller', () => {

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

  const smoothOperators = ['add', 'sub', 'mult', 'div'];
  const anyOneOperand = 'any-one-operand';

  describe('when given calculator/<operator> with no operands', () => {
    it.each(smoothOperators)(
        `/api/calculator/%s with no operands should throw 400`,
        async (o) => {
            await request(app)
                .get(`/calculator/${o}`)
                .expect(400)
        }
    );
  });

  describe('when given a single "operands" value', () => {
    it.each(smoothOperators)(
        `/api/calculator/%s?operands=${anyOneOperand} should return the operands value`,
        async (o) => {
            await request(app)
                .get(`/calculator/${o}`)
                .query(`operands=${anyOneOperand}`)
                .expect(200)
                .then((response) => {
                    expect(response.text).toEqual(anyOneOperand);
                })
        }
    );
  });

  describe("when given a bogus operator", () => {
    it('returns 404', async () => {
        await request(app)
            .get('/calculator/bogus')
            .expect(404)
    });
  });
});
