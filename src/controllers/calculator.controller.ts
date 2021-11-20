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
  operate(@PathParam('operator') operator: string, @QueryParam('operands') operands: string = ''): string {

    const operators = ['add', 'sub', 'mult', 'div'];
    if (!operators.includes(operator)) {
        throw new Errors.NotFoundError(`There is no operator "${operator}"`);
    }

    const operandArray = operands.split(',');
    const numberArray = operandArray.map(s => this.converter.toNumber(s))

    if (operandArray.length === 1) {
        return operandArray[0];  // No math, just echo.
    }

    const calculated = this.calculator.doMath(operator, numberArray);
    if (calculated.length == 3) {
      return `${this.converter.toRoman(calculated[0])} (${this.converter.toRoman(calculated[1])}/${this.converter.toRoman(calculated[2])})}`
    }
    else {
      return this.converter.toRoman(calculated[0]);
    }
  }
}
