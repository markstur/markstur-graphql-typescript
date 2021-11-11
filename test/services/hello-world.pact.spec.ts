import {join, resolve} from 'path';
import {Container} from 'typescript-ioc';
import {Matchers, Pact} from '@pact-foundation/pact';
import axios from 'axios';
 
export const API = 'http://localhost:3000/';
 
export const fetchData = async query => {
  const url = `${API}/${query}`;
 
  return await axios.get(url);
};
 
// const request = require('supertest');

import { ProjectServiceConfig, ProjectService } from '../../src/services/project.service';
import { HelloWorldService } from '../../src/services/hello-world.service';
// import { query } from 'express';

// const fetch = require('node-fetch');

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
      provider: 'project-svc',
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

  

  context('given listProjects()', () => {
    context('when called', () => {
      
      const expectedResult: string = "Hello, World!";

      // const projectsQuery: string = "{ projects { tasks { id } } }";

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

      test('should return project data', async () => {

        // const response = await fetch('https://localhost:3000/hello-world');
        const result = await fetchData('hello-world');
        console.log("RESULT.DATA", result.data);
        expect(result.data).toEqual([expectedResult]);
      });

      afterEach(() => {
        return provider.verify();
      });
    });
  });
});

