<p align="center">
    <img src="https://img.shields.io/badge/platform-node-lightgrey.svg?style=flat" alt="platform">
    <img src="https://img.shields.io/badge/license-Apache2-blue.svg?style=flat" alt="Apache 2">
</p>

# Roman numeral calculator

## API Documentation
* /api-docs

## REST services for Roman numberal calculator

* /calculator/{operator}
    
Also includes:

* /converter (proxies to Roman numeral converter)
* /health
* /hello
* /graphql (from template-graphql-typescript)

## Features

Based on the starter kit with the following features:

* Graphql server from [apollo-server-express](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server-express)
* Graphql decorators from [type-graphql](https://www.npmjs.com/package/type-graphql)
* Dependency injection using [typescript-ioc](https://www.npmjs.com/package/typescript-ioc) decorators
- Logging using [pino](hhttps://getpino.io/)
- TDD environment with [jest](https://jestjs.io/)
- Pact testing [Pact.io](https://docs.pact.io/)
- DevOps pipeline

### Building Locally

#### Native Application Development

Install the latest [Node.js](https://nodejs.org/en/download/) 16+ LTS version.

Once the Node toolchain has been installed, you can download the project dependencies with:

```bash
npm install
npm run build
npm run start
```

To run your application locally:
```bash
npm run start
```

Your application will be running at `http://localhost:3000`.  You can access the `/api-docs`, `/health`, `/hello`, and `/graphql` endpoints at the host.

The graphql endpoint presents a query interface. To query via curl, POST the query like this:

```bash
curl --request POST \
  --header 'content-type: application/json' \
  --url http://localhost:3000/graphql \
  --data '{"query":"query { __typename }"}'
```

## Next Steps

* Learn more about augmenting your Node.js applications on IBM Cloud with the [Node Programming Guide](https://cloud.ibm.com/docs/node?topic=nodejs-getting-started).
* Explore other [sample applications](https://cloud.ibm.com/developer/appservice/starter-kits) on IBM Cloud.

## License

This sample application is licensed under the Apache License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1](https://developercertificate.org/) and the [Apache License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache License FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
