import {GET, Path, PathParam, QueryParam} from 'typescript-rest';
import {Inject} from 'typescript-ioc';
import {ConverterApi} from '../services';
import {CalculatorApi} from '../services';
import {LoggerApi} from '../logger';
import {Errors} from 'typescript-rest';

@Path('/calculator')
export class CalculatorController {

  @Inject
  calculator: CalculatorApi;
  @Inject
  converter: ConverterApi;

  @Inject
  _baseLogger: LoggerApi;

  get logger() {
    return this._baseLogger.child('CalculatorController');
  }

  @Path(':operator')
  @GET
  async operate(@PathParam('operator') operator: string, @QueryParam('operands') operands: string = ''): Promise<string> {

    const operators = ['add', 'sub', 'mult', 'div'];
    if (!operators.includes(operator)) {
      throw new Errors.NotFoundError(`There is no valid operator "${operator}"`);
    }

    if (!operands) {
      throw new Errors.BadRequestError(`There is no operand"`);
    }

    const operandArray = operands.split(',');
    if (operandArray.length === 1) {
      await this.converter.toNumber(operandArray[0]);  // Just to validate it
      return operandArray[0];  // No math needed, just echo the valid single operand.
    }

    const promiseArray = Promise.all(operandArray.map(s => this.converter.toNumber(s)));
    const numberArray = await promiseArray;

    const calculated = this.calculator.doMath(operator, numberArray);

    // If the calculated result is negative or over 3999 then the API should return an error code 501 - Not Implemented.
    if (calculated[0] > 3999 || calculated[0] < 0) {
      throw new Errors.NotImplementedError(`Result ${calculated[0]} > 3999`);
    }

    if (calculated.length == 3) {
      const promiseConverted = Promise.all([this.converter.toRoman(calculated[0]), this.converter.toRoman(calculated[1]), this.converter.toRoman(calculated[2])]);
      const converted = await promiseConverted;
      return `${converted[0]} (${converted[1]}/${converted[2]})`;
    }
    else {
      return this.converter.toRoman(calculated[0]);
    }
  }
}
