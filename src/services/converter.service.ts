import {ConverterApi} from './converter.api';
import {ConverterServiceConfig} from '../config';
import {Inject} from 'typescript-ioc';
import axios, {AxiosResponse} from 'axios';
import {BadRequestError, InternalServerError} from "typescript-rest/dist/server/model/errors";

export class ConverterService implements ConverterApi {
    @Inject
    config: ConverterServiceConfig;

  async toNumber(roman: string): Promise<number> {
      try {
          const axiosResponse: AxiosResponse = await axios.get(`http://localhost:3002/converter/to-number?value=${roman}`);
          return parseInt(axiosResponse.data);
      } catch(error) {
          const e = {...error};
          if (e.response?.status === 400) {
              throw new BadRequestError();
          }
          else {
              throw new InternalServerError();
          }
      }
  }

  async toRoman(n: number): Promise<string> {
      try {
          const axiosResponse: AxiosResponse = await axios.get(`http://${this.config.baseUrl}/converter/to-roman?value=${n}`);
          return axiosResponse.data;
      } catch(error) {
          const e = {...error};
          if (e.response?.status === 400) {
              throw new BadRequestError();
          }
          else {
              throw new InternalServerError();
          }
      }
  }
}
