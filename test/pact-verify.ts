import * as path from 'path';
import fs = require('fs');
import { Verifier, VerifierOptions } from '@pact-foundation/pact';
import * as yargs from 'yargs';

import { buildApiServer } from './helper';
import * as config from '../package.json';
import { ApiServer } from '../src/server';
import superagent = require('superagent');
import { Container, Scope } from 'typescript-ioc';
import { ConverterApi } from '../src/services';
import { ConverterService } from '../src/services/converter.service';
import { Errors } from 'typescript-rest';

/* eslint-disable */
const provider = config.config;
const opts: VerifierOptions = config.pact as any;

const argv = yargs.options({
  providerBaseUrl: {
    alias: 'p',
    default: `${provider.protocol}://${provider.host}:${provider.port}${provider.contextRoot}`,
  },
}).argv;

const pactBrokerUrl = process.env.PACTBROKER_URL || opts.pactBrokerUrl;

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

async function buildOptions(): Promise<VerifierOptions> {
  // add this to the Verifier opts
  const stateHandlers = {
    'base state': () => {
      console.log('BASE STATE: no setup needed');
      Container.bind(ConverterApi).scope(Scope.Singleton).to(ConverterService);
    },
    'WITH CONVERTER': () => {
      console.log('A Mock converter will be used.');
      Container.bind(ConverterApi).scope(Scope.Singleton).to(MockConverter);
    },
    'WITHOUT CONVERTER': () => {
      console.log('Expect errors and delays with any converter call.');
      Container.bind(ConverterApi).scope(Scope.Singleton).to(MockNoConverter);
    },
  };

  const pactUrls = await listPactFiles(path.join(process.cwd(), 'pacts'));
  if (!pactBrokerUrl && pactUrls.length === 0) {
    console.log(
      'Nothing to test. Pact Broker url not set and no pact files found'
    );
    return undefined;
  }

  const options: VerifierOptions = Object.assign(
    {},
    opts,
    { stateHandlers },
    argv,
    pactBrokerUrl ? { pactBrokerUrl } : { pactUrls },
    {
      provider: 'markstur-calculator',
      providerVersion: config.version,
      publishVerificationResult: true,
    }
  );

  console.log('Pact verification options', options);

  return options;
}

async function listPactFiles(pactDir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(pactDir)) {
      resolve([]);
      return;
    }

    fs.readdir(pactDir, (err, items) => {
      if (err) {
        reject(err);
        return;
      }

      if (!items || items.length == 0) {
        reject(new Error('no pact files found'));
        return;
      }

      resolve(items.map((item) => path.join(pactDir, item)));
    });
  });
}

async function verifyPact() {
  const options: VerifierOptions = await buildOptions().catch((err) => {
    console.log('Error building pact options: ' + err.message);
    return null;
  });

  if (!options) {
    return;
  }

  if (options.pactBrokerUrl) {
    const url = `${options.pactBrokerUrl}/pacts/provider/${options.provider}/latest`;
    try {
      await superagent.get(url);
    } catch (err) {
      if (err.status === 404) {
        console.log(
          'No pacts found for provider in pact broker: ' + options.provider
        );
        return;
      }
    }
  }

  console.log('Starting server');
  const server: ApiServer = await buildApiServer().start();

  try {
    await new Verifier(options).verifyProvider();
  } finally {
    await server.stop();
  }
}

verifyPact().catch((err) => {
  console.log('Error verifying provider', err);
  process.exit(1);
});
