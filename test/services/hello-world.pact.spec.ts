import {join, resolve} from 'path';
import {Container} from 'typescript-ioc';
import {Matchers, Pact} from '@pact-foundation/pact';
import axios from 'axios';
 
export const API = 'http://localhost:3000/';
 
export const fetchData = async query => {
  const url = `${API}/${query}`;
 
  return await axios.get(url);
};
 
import { ProjectServiceConfig } from '../../src/services/project.service';
import { HelloWorldService } from '../../src/services/hello-world.service';

const npmPackage = require(join(process.cwd(), 'package.json'));

const consumerName = npmPackage.name;

describe('project.service', () => {
  test('canary verifies test infrastructure', () => {
    console.log("in test infrastructure");
    expect(true).toEqual(true);
  });

  const port = 3000;
  let provider: Pact;
  beforeAll(() => {
    provider = new Pact({
      consumer: consumerName,
      provider: 'hello-world-svc',
      port,
      log: resolve(process.cwd(), "logs", "pact.log"),
      dir: resolve(process.cwd(), "pacts"),
    });
    console.log("in before all, provider setup");
    return provider.setup();
  },30000);

  let classUnderTest: HelloWorldService;
  beforeEach(() => {
    console.log("in before each---35");
    Container.bind(ProjectServiceConfig).factory(() => ({
        baseUrl: `http://localhost:${port}`
        
      }));

    classUnderTest = Container.get(HelloWorldService);
  });

  afterAll(() => {
    console.log("in afterAll, going to finalize");    
    return provider.finalize();
  });

  

  context('given hello-world', () => {
    context('when called', () => {
      
      const expectedResult: string = "Hello, World!";

      beforeEach(() => {
        console.log("in before each"+ provider.server);
        return provider.addInteraction({
          state: 'base state',
          uponReceiving: 'a request for stock items',
          withRequest: {
            method: 'GET',
            path: '/hello-world',
            headers: {
              'Accept': 'application/json, text/plain, */*',
            }
          },
          willRespondWith: {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            },
            body: Matchers.eachLike(expectedResult),
          }
        });
      });

      test('should return hello-world data', async () => {

        const result = await fetchData('hello-world');
        expect(result.data).toEqual([expectedResult]);
      });

      afterEach(() => {
        return provider.verify();
      });
    });
  });
});

