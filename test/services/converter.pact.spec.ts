import { Container } from 'typescript-ioc';
import { BadRequestError } from 'typescript-rest/dist/server/model/errors';
import { ConverterService } from '../../src/services/converter.service';
import { resolve } from 'path';
import { Pact } from '@pact-foundation/pact';

const consumerName = 'markstur-calculator';
const providerName = 'markstur-converter';
const providerPort = +process.env.CONVERTER_PORT;

describe('Converter using Pact provider', () => {
  let service: ConverterService;
  let provider: Pact;

  beforeAll(async () => {
    service = Container.get(ConverterService);

    provider = new Pact({
      // cors: true,
      consumer: consumerName,
      provider: providerName,
      port: providerPort,
      log: resolve(process.cwd(), 'logs', 'pact.log'),
      dir: resolve(process.cwd(), 'pacts'),
    });

    await provider.setup();

    const baseState = 'base state';
    await Promise.all([
      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from 2021',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=2021',
        },
        willRespondWith: {
          status: 200,
          body: 'MMXXI',
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from zero',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=0',
        },
        willRespondWith: {
          status: 200,
          body: 'nulla',
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from 3999',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=3999',
        },
        willRespondWith: {
          status: 200,
          body: 'MMMCMXCIX',
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from -1',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=-1',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from 12.34',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=12.34',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-roman from 4000',
        withRequest: {
          method: 'GET',
          path: '/converter/to-roman',
          query: 'value=4000',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from XIIII',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=XIIII',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from "foo"',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=foo',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from ""',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from "XZI"',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=XZI',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from "A"',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=A',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from "X I"',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=X I',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from "X.I"',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=X.I',
        },
        willRespondWith: {
          status: 400,
        },
      }),

      provider.addInteraction({
        state: baseState,
        uponReceiving: 'a request to convert to-number from MMXXI',
        withRequest: {
          method: 'GET',
          path: '/converter/to-number',
          query: 'value=MMXXI',
        },
        willRespondWith: {
          status: 200,
          body: '2021',
        },
      }),
    ]);
  }, 30000);

  test('canary test verifies test infrastructure', () => {
    expect(service).not.toBeUndefined();
  });

  afterAll(async () => {
    await provider.verify().finally(async () => {
      await provider.finalize();
    });
  });

  describe('given server requests', () => {
    describe('the proxy to the converter service provider should...', () => {
      it('handle positive integers between 0 and 3999 inclusive (0)', async () => {
        expect(await service.toRoman(0)).toEqual('nulla');
      });
      it('handle positive integers between 0 and 3999 inclusive (3999)', async () => {
        expect(await service.toRoman(3999)).toEqual('MMMCMXCIX');
      });

      it('return HTTP error code 400 - Bad Request if the number is negative', async () => {
        await expect(service.toRoman(-1)).rejects.toThrow(BadRequestError);
      });
      it('return HTTP error code 400 - Bad Request if the number is above 3999', async () => {
        await expect(service.toRoman(4000)).rejects.toThrow(BadRequestError);
      });
      it('return HTTP error code 400 - Bad Request if the number is a float (12.34)', async () => {
        await expect(service.toRoman(12.34)).rejects.toThrow(BadRequestError);
      });
      it('when converting from Roman Numerals if the value if not a valid Roman Numeral, such as XIIII, then return HTTP error code 400 - Bad Request', async () => {
        await expect(service.toNumber('XIIII')).rejects.toThrow(
          BadRequestError
        );
      });
      it('when converting to a Roman Numerals, if the value parameter is not a valid number then return HTTP error code 400 - Bad Request', async () => {
        await expect(service.toNumber('foo')).rejects.toThrow(BadRequestError);
      });
      it('empty string returns throw 400', async () => {
        await expect(service.toNumber('')).rejects.toThrow(BadRequestError);
      });
      it('"A" returns throw 400', async () => {
        await expect(service.toNumber('A')).rejects.toThrow(BadRequestError);
      });
      it('"XZI" returns throw 400', async () => {
        await expect(service.toNumber('XZI')).rejects.toThrow(BadRequestError);
      });
      it('"X I" returns throw 400', async () => {
        await expect(service.toNumber('X I')).rejects.toThrow(BadRequestError);
      });
      it('"X.I" returns throw 400', async () => {
        await expect(service.toNumber('X.I')).rejects.toThrow(BadRequestError);
      });
    });
  });

  describe('GET /api/converter/to-roman?value=2021', () => {
    it('should return MMXXI from the proxy provider', async () => {
      expect(await service.toRoman(2021)).toBe('MMXXI');
    });
  });

  describe('GET /api/converter/to-number?value=MMXXI', () => {
    it('should return 2021 from the proxy provider', async () => {
      expect(await service.toNumber('MMXXI')).toBe(2021);
    });
  });
});
