import { CalculatorApi } from './calculator.api';

const operators = {
  add: (total, n) => total + n,
  sub: (total, n) => total - n,
  mult: (total, n) => total * n,
};

export class CalculatorService implements CalculatorApi {
  /**
   * Euclid's algorithm finds the greatest common divisor
   * (using original subtraction-based version instead of recursion).
   */
  private _getGreatestCommonFactor(a: number, b: number): number {
    while (a != b) {
      if (a > b) {
        a = a - b;
      } else {
        b = b - a;
      }
    }
    return a;
  }

  private _simplify(
    whole: number,
    remainder: number,
    denominator: number
  ): Array<number> {
    const factor = this._getGreatestCommonFactor(remainder, denominator);
    return [whole, remainder / factor, denominator / factor];
  }

  private _div(numberArray: Array<number>): Array<number> {
    const numerator = numberArray.splice(0, 1)[0];
    const denominator = numberArray.reduce(operators['mult']);
    const whole = Math.trunc(numerator / denominator);
    const remainder = numerator % denominator;
    return remainder ? this._simplify(whole, remainder, denominator) : [whole];
  }

  doMath(operator: string, numberArray: Array<number>): Array<number> {
    if (operator === 'div') {
      return this._div(numberArray);
    } else {
      return [numberArray.reduce(operators[operator])];
    }
  }
}
