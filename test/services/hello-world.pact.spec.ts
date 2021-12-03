import {join, resolve} from 'path';
import {Container} from 'typescript-ioc';
import {Matchers, Pact} from '@pact-foundation/pact';
import axios from 'axios';
 
export const API = 'http://localhost:3000/';
 
export const fetchData = async query => {
  const url = `${API}/${query}`;
 
  return await axios.get(url,
    {
      headers: {
          'Content-Type': 'application/json',
           Accept: 'application/json, text/plain, */*'
      }
    });
};
 
import { ProjectServiceConfig } from '../../src/services/project.service';
import { HelloWorldService } from '../../src/services/hello-world.service';

const npmPackage = require(join(process.cwd(), 'package.json'));

describe('project.service', () => {
  test('canary verifies test infrastructure', () => {
    console.log("in test infrastructure");
    expect(true).toEqual(true);
  });

  const port = 3000;
  let provider: Pact;
  beforeAll(() => {
    provider = new Pact({
      consumer: 'markstur-hello-consumer',
      provider: 'markstur-calculator',
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

  

  context('given hello', () => {

    context('when called', () => {
      
      const expectedResult: string = "Hello, World!";
      beforeEach(() => {
        console.log("in before each"+ provider.server);
        return provider.addInteraction({
          state: 'base state',
          uponReceiving: 'a request for hello',
          withRequest: {
            method: 'GET',
            path: '/hello',
            headers: {
              'Accept': 'application/json, text/plain, */*',
            }
          },
          willRespondWith: {
            status: 200,
            headers: {
              "content-type" : "text/html; charset=utf-8",
            },
            body: Matchers.string(expectedResult),
          }
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

