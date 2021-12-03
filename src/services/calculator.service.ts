import {CalculatorApi} from './calculator.api';

const operators = {
  'add': (total, n) => total + n,
  'sub': (total, n) => total - n,
  'mult': (total, n) => total * n,
}

export class CalculatorService implements CalculatorApi {

  private _euclideanSubtraction(a: number, b: number) : number {

    while (a != b) {
        if (a > b) {
            a = a - b;
        }
        else {
            b = b - a;
        }
    }
    return a
  }

  private _simplifyRemainder(whole: number, remainder: number, denominator: number): Array<number> {

    const factor = this._euclideanSubtraction(remainder, denominator)
    return [ whole, remainder/factor, denominator/factor ];
  }

  private _doCrazyRomanDivision(numberArray: Array<number>): Array<number> {
    const numerator =  numberArray.splice(0, 1)[0];
    const denominator =  numberArray.reduce(operators['mult']);
    const whole = Math.trunc(numerator / denominator);
    const remainder = numerator % denominator;

    if (!remainder) {
      return [ whole ];
    }
    else {
      return this._simplifyRemainder(whole, remainder, denominator);
    }
  };

  doMath(operator: string, numberArray: Array<number>): Array<number> {
    if (operator === 'div') {
      return this._doCrazyRomanDivision(numberArray);
    }
    else { // It WAS a one-liner
      return [numberArray.reduce(operators[operator])]
    }
  }
}
