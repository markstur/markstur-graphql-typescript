import { resolve } from 'path';
import { Matchers, Pact } from '@pact-foundation/pact';
import axios from 'axios';

const API = 'http://localhost:8000/';

const fetchData = async (query) => {
  const url = `${API}/${query}`;

  return await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
    },
  });
};

describe('project.service', () => {
  test('canary verifies test infrastructure', () => {
    expect(true).toEqual(true);
  });

  const port = 8000;
  let provider: Pact;
  beforeAll(() => {
    provider = new Pact({
      consumer: 'markstur-hello-consumer',
      provider: 'markstur-calculator',
      port,
      log: resolve(process.cwd(), 'logs', 'pact.log'),
      dir: resolve(process.cwd(), 'pacts'),
    });
    return provider.setup();
  }, 30000);

  afterAll(() => {
    return provider.finalize();
  });

  context('given hello', () => {
    context('when called', () => {
      const expectedResult = 'Hello, World!';
      beforeEach(() => {
        return provider.addInteraction({
          state: 'base state',
          uponReceiving: 'a request for hello',
          withRequest: {
            method: 'GET',
            path: '/hello',
            headers: {
              Accept: 'application/json, text/plain, */*',
            },
          },
          willRespondWith: {
            status: 200,
            headers: {
              'content-type': 'text/html; charset=utf-8',
            },
            body: Matchers.string(expectedResult),
          },
        });
      });

      test('should return hello world in data', async () => {
        const result = await fetchData('hello');

        expect(result.data).toEqual(expectedResult);
      });

      afterEach(() => {
        return provider.verify();
      });
    });
  });
});
