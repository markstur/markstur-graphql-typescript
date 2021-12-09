import { ConverterApi } from './converter.api';
import { ConverterServiceConfig} from "../config";
import axios, { AxiosResponse } from 'axios';
import {
  BadRequestError,
  InternalServerError,
} from 'typescript-rest/dist/server/model/errors';
import {Inject} from "typescript-ioc";

export class ConverterService implements ConverterApi {
  @Inject
  config: ConverterServiceConfig;

  async toNumber(roman: string): Promise<number> {
    const converterUrl = this.config.baseUrl;
    try {
      const axiosResponse: AxiosResponse = await axios.get(
        `${converterUrl}/converter/to-number?value=${roman}`
      );
      return parseInt(axiosResponse.data);
    } catch (error) {
      const e = { ...error };
      if (e.response?.status === 400) {
        throw new BadRequestError();
      } else {
        throw new InternalServerError();
      }
    }
  }

  async toRoman(n: number): Promise<string> {
    const converterUrl = this.config.baseUrl;
    try {
      const axiosResponse: AxiosResponse = await axios.get(
        `${converterUrl}/converter/to-roman?value=${n}`
      );
      return axiosResponse.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new BadRequestError(error.response.data?.error);
      } else {
        throw new InternalServerError();
      }
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const converterUrl = this.config.baseUrl;
      const axiosResponse: AxiosResponse = await axios.get(
        `${converterUrl}/converter/health`
      );
      return axiosResponse.status === 200;
    } catch (error) {
      return false;
    }
  }
}
