import { GET, Path, QueryParam } from 'typescript-rest';
import { Inject } from 'typescript-ioc';
import { ConverterApi } from '../services';

@Path('/converter')
export class ConverterController {
  @Inject
  service: ConverterApi;

  @Path('to-number')
  @GET
  async toNumber(@QueryParam('value') value: string): Promise<number> {
    return this.service.toNumber(value);
  }

  @Path('to-roman')
  @GET
  async toRoman(@QueryParam('value') value: number): Promise<string> {
    return this.service.toRoman(value);
  }
}
