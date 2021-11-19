import {GET, Path, PathParam, QueryParam} from 'typescript-rest';
import {Inject} from 'typescript-ioc';
// import {ConverterApi} from '../services';
import {LoggerApi} from '../logger';
import {Errors} from 'typescript-rest';
import { UNARY_OPERATORS } from '@babel/types';

@Path('/calculator')
export class CalculatorController {

  // @Inject
  // service: ConverterApi;
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

    if (operandArray.includes('')) {
        throw new Errors.BadRequestError("Found empty string operand");
    }

    if (operandArray.length > 1) {
        throw new Errors.NotImplementedError("TODO more than one operand");
    }

    return operandArray[0];
  }
}
