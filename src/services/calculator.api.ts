export abstract class CalculatorApi {
  abstract doMath(operand: string, numberArray: Array<number>): Array<number>;
}
