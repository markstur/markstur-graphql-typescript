/* eslint-disable */
import { default as express } from 'express';
import { Server } from 'typescript-rest';
import { Inject } from 'typescript-ioc';
import { AddressInfo } from 'net';

import * as npmPackage from '../package.json';
import { parseCsvString } from './util';
import { LoggerApi } from './logger';
import { TracerApi } from './tracer';
import fs = require('fs');
import http = require('http');
import path = require('path');
import cors = require('cors');
import { ApolloServer } from 'apollo-server-express';
import { GraphQLSchema } from 'graphql';
import { buildGraphqlSchema } from './schema';

const config = npmPackage.config || {
  protocol: 'http',
  host: 'localhost',
  port: 3000,
  'context-root': '/',
};
const configApiContext = config['context-root'];

export class ApiServer {
  @Inject
  logger: LoggerApi;
  @Inject
  tracer: TracerApi;

  // private readonly app: express.Application;
  private server: http.Server = null;
  private graphqlServer;
  public PORT: number = +process.env.PORT || npmPackage.config.port;

  constructor(
    private readonly app: express.Application = express(),
    apiContext = configApiContext
  ) {
    // this.app.use(opentracingMiddleware({tracer: this.tracer}));
    this.logger.apply(this.app);
    this.app.use(cors());

    if (!apiContext || apiContext === '/') {
      this.app.use(
          express.static(path.join(process.cwd(), 'public'), {
            maxAge: 31557600000,
          })
      );
    } else {
      this.app.use(
          apiContext,
          express.static(path.join(process.cwd(), 'public'), {
            maxAge: 31557600000,
          })
      );
    }

    const apiRouter: express.Router = express.Router();
    Server.loadServices(apiRouter, ['controllers/*'], __dirname);

    const swaggerPath = path.join(process.cwd(), 'dist/swagger.json');
    if (fs.existsSync(swaggerPath)) {
      Server.swagger(apiRouter, {
        filePath: swaggerPath,
        schemes: this.swaggerProtocols,
        host: this.swaggerHost,
        endpoint: '/api-docs',
      });
    }

    if (!apiContext || apiContext === '/') {
      this.app.use(apiRouter);
    } else {
      this.app.use(apiContext, apiRouter);
    }
    this.startGraphql();
  }

  private async startGraphql() {
    await new Promise<ApolloServer>(async (resolve, reject) => {
      try {
        const schema: GraphQLSchema = (await buildGraphqlSchema()) as any;

        this.graphqlServer = new ApolloServer({schema});
        await this.graphqlServer.start();

        this.graphqlServer.applyMiddleware({app: this.app});

        resolve(this.graphqlServer);
      } catch (error) {
        reject(error);
      }
    })
        .then((graphqlServer) => {
          this.logger.info(
              'Graphql server started: ' + graphqlServer.graphqlPath
          );
        })
        .catch((error) => {
          this.logger.error('Error starting graphql server', {error});
        });
  }

  /**
   * Start the server
   * @returns {Promise<any>}
   */
  public async start(): Promise<ApiServer> {
    return new Promise<ApiServer>((resolve) => {
      this.server = this.app.listen(this.PORT, () => {
        const addressInfo = this.server.address() as AddressInfo;

        const address =
          addressInfo.address === '::' ? 'localhost' : addressInfo.address;

        // tslint:disable-next-line:no-console
        console.log(`Listening to http://${address}:${addressInfo.port}`);

        return resolve(this);
      });
    });
  }

  /**
   * Stop the server (if running).
   * @returns {Promise<boolean>}
   */
  public async stop(): Promise<boolean> {
    if (this.graphqlServer) await this.graphqlServer.stop()
    return new Promise<boolean>((resolve) => {
      if (this.server) {
        this.server.close(() => {
          return resolve(true);
        });
      } else {
        return resolve(false);
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  get swaggerProtocols(): string[] {
    return parseCsvString(process.env.PROTOCOLS, '');
  }

  get swaggerHost(): string {
    return process.env.INGRESS_HOST || '';
  }
}
