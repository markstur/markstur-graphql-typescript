import {CalculatorApi} from './calculator.api';
// import {Inject} from 'typescript-ioc';
// import {LoggerApi} from '../logger';

const operators = {
  'add': (total, n) => total + n,
  'sub': (total, n) => total - n,
  'mult': (total, n) => total * n,
  'div': (total, n) => Math.trunc(total / n),
}

export class CalculatorService implements CalculatorApi {
  // logger: LoggerApi;

  // constructor(
    // @Inject
    // logger: LoggerApi,
  // ) {
    // this.logger = logger.child('CalculatorService');
  // }

  doMath(operator: string, numberArray: Array<number>): number {
    return numberArray.reduce(operators[operator])
  }
}
