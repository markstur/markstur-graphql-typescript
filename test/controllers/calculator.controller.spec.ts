import {Application} from 'express';
import {default as request} from 'supertest';
import supertest from 'supertest';

import {buildApiServer} from '../helper';
import {Pact} from "@pact-foundation/pact";
import {resolve} from "path";

describe('calculator.controller', () => {

  let app: Application;
  let apiServer;

    beforeAll(async () => {
        apiServer = buildApiServer();
        expect(await apiServer.start()).toBe(apiServer);
        app = apiServer.getApp();
    });

    afterAll(async () => {
        expect(await apiServer.stop()).toEqual(true);
    });

    describe("running WITH a MOCK converter service", () => {
      const converterPort = process.env.CONVERTER_PORT || '9992';
      let converterPact: Pact;

      beforeAll(async () => {
          converterPact = new Pact({
              consumer: 'markstur-calculator',
              provider: 'markstur-converter',
              port: parseInt(converterPort),
              log: resolve(process.cwd(), "logs", "pact.log"),
              dir: resolve(process.cwd(), "pacts"),
          });
          await converterPact.setup();

          const n2r = {
              '1': 'I',
              '3': 'III',
              '89': 'LXXXIX',
              '111': 'CXI',
              '3000': 'MMM',
          }
          const r2n = {
              'I': 1,
              'V': 5,
              'C': 100,
              'VI': 6,
              'MMXXI': 2021,
              'MMMCMXCIX': 3999,
          }
          const baseState = 'base state';
          const promisedInteractions = [];
          for ( const [n, r] of Object.entries(n2r)) {
              promisedInteractions.push(
                  converterPact.addInteraction({
                      state: baseState,
                      uponReceiving: `a GET request for converter/to-roman?value=${n}`,
                      withRequest: {
                          method: 'GET',
                          path: `/converter/to-roman`,
                          query: `value=${n}`,
                      },
                      willRespondWith: {
                          status: 200,
                          body: r,
                      }
                  })
              )
          }
          for ( const [r, n] of Object.entries(r2n)) {
              promisedInteractions.push(
                  converterPact.addInteraction({
                      state: baseState,
                      uponReceiving: `a GET request for converter/to-number?value=${r}`,
                      withRequest: {
                          method: 'GET',
                          path: `/converter/to-number`,
                          query: `value=${r}`,
                      },
                      willRespondWith: {
                          status: 200,
                          body: n,
                      }
                  })
              )
          }
          promisedInteractions.push(
              converterPact.addInteraction({
                  state: baseState,
                  uponReceiving: 'a GET request for converter/to-number with INVALID operand',
                  withRequest: {
                      method: 'GET',
                      path: `/converter/to-number`,
                      query: `value=${badOperand}`,
                  },
                  willRespondWith: {
                      status: 400,
                  }
              })
          )
          promisedInteractions.push(
              converterPact.addInteraction({
                  state: baseState,
                  uponReceiving: 'a GET request for converter/to-number with EMPTY VALUE',
                  withRequest: {
                      method: 'GET',
                      path: `/converter/to-number`,
                      query: `value=`,
                  },
                  willRespondWith: {
                      status: 400,
                  }
              })
          )
          promisedInteractions.push(
              converterPact.addInteraction({
                  state: baseState,
                  uponReceiving: `a GET request for converter/to-roman with a number > 3999`,
                  withRequest: {
                      method: 'GET',
                      path: `/converter/to-roman`,
                      query: `value=4005`,
                  },
                  willRespondWith: {
                      status: 400,
                  }
              })
          )
          promisedInteractions.push(
              converterPact.addInteraction({
                  state: baseState,
                  uponReceiving: `a GET request for converter/to-roman with a negative number`,
                  withRequest: {
                      method: 'GET',
                      path: `/converter/to-roman`,
                      query: `value=-5`,
                  },
                  willRespondWith: {
                      status: 400,
                  }
              })
          )
          await Promise.all(promisedInteractions);
      });

      afterAll(async () => {
          await converterPact.verify().finally(() => converterPact.finalize());
      });

  test('canary validates test infrastructure', () => {
    expect(true).toBe(true);
  });

  const smoothOperators = ['add', 'sub', 'mult', 'div'];
  const badOperand = 'invalid-operand';
  const goodOperand = 'MMXXI';

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

  describe('when given a single VALID "operands" value', () => {
    it.each(smoothOperators)(
        `/api/calculator/%s?operands=${goodOperand} should return the operands value`,
        async (o) => {
            await request(app)
                .get(`/calculator/${o}`)
                .query(`operands=${goodOperand}`)
                .expect(200)
                .then((response) => {
                    expect(response.text).toEqual(goodOperand);
                })
        }
    );
  });

  describe('when given a single INVALID "operands" value', () => {
    it.each(smoothOperators)(
        `/api/calculator/%s?operands=${badOperand} should throw 400`,
        async (o) => {
            await supertest(app)
                .get(`/calculator/${o}`)
                .query(`operands=${badOperand}`)
                .then((response) => {
                    expect(response.status).toBe(400);
                })
        }
    );
  });

  describe('when given a multiple VALID "operands" value', () => {
      const expected = { 'add': 'CXI', 'sub': 'LXXXIX', 'mult': 'MMM', 'div': 'III (I/III)' }
        it.each(smoothOperators)(
            `/api/calculator/%s?operands=C,V,VI should be...`,
            async (o) => {
                await supertest(app)
                    .get(`/calculator/${o}`)
                    .query(`operands=C,V,VI`)
                    .then((response) => {
                        expect(response.status).toBe(200);
                        expect(response.text).toBe(expected[o]);
                    })
            }
        );
  });

    describe('when the result is too big or negative', () => {
        it('returns 400 when > 3999', async () => {
            await supertest(app).get('/calculator/add?operands=MMMCMXCIX,VI').then((response) => {
                expect(response.status).toBe(400);
                expect(response.text).toContain('BadRequestError');  // Error page
            })
        });
        it('returns 400 when negative', async () => {
            await supertest(app).get('/calculator/sub?operands=I,VI').then((response) => {
                expect(response.status).toBe(400);
                expect(response.text).toContain('BadRequestError');  // Error page
            })
        });
    });
    });

    describe("running WITHOUT an available converter service or mock", () => {
        describe("when given a bogus operator", () => {
            it('returns 404', async () => {
                await supertest(app).get('/calculator/bogus').then((response) => {
                    expect(response.status).toBe(404);
                    expect(response.text).toContain('NotFoundError');  // Error page
                })
            });
            it('returns 500 when it cannot reach converter', async () => {
                await supertest(app).get('/calculator/add?operands=I,I').then((response) => {
                    expect(response.status).toBe(500);
                    expect(response.text).toContain('InternalServerError');  // Error page
                })
            });
        });
    });
});
