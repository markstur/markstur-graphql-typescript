import { GET, Path } from 'typescript-rest';
import { Inject } from 'typescript-ioc';
import { ConverterApi } from '../services';

@Path('/health')
export class HealthController {
  @Inject
  converter: ConverterApi;

  @GET
  async healthCheck(): Promise<{ status: string; checks: object[] }> {
    const status = (await this.converter.isHealthy()) ? 'UP' : 'DOWN';

    return {
      status,
      checks: [
        {
          name: 'converterHealth',
          status,
        },
      ],
    };
  }
}
