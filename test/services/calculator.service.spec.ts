import {Container} from 'typescript-ioc';
import {CalculatorService} from '../../src/services/calculator.service';

describe('Calculator service', () =>{

  let service: CalculatorService;
  beforeAll(() => {
    service = Container.get(CalculatorService);
  });

  test('canary test verifies test infrastructure', () => {
    expect(service).not.toBeUndefined();
  });

  describe('When the calculator service', () => {
    context('is given an add operation with parameters "I, IV, X, XX"', () => {
      test('the expected result should be XXXV : 1(I) + 4(IV) +10(X)+ 20(XX) = 35(XXXV)', () => {
          expect(service.doMath('add', [1, 4, 10, 20])).toStrictEqual([35]);
      });
    });
    context('is given a sub operation with parameters "L, III, X, VI, I, IX"' , () => {
      test('the expected result should be XXI : 50(L) - 3(III) - 10(X) - 6(VI) - 1(I) - 9(IX) = 21(XXI)', () => {
          expect(service.doMath('sub', [50, 3, 10, 6, 1, 9])).toStrictEqual([21]);
      });
    });
    context('is given a mult operation with parameters "I, II, III, IV, V)', () => {
      test('the expected result should be CXX : 1(I) * 2(II) * 3(III) * 4(IV) * 5(V) = 120(CXX)', () => {
          expect(service.doMath('mult', [1, 2, 3, 4, 5])).toStrictEqual([120]);
      });
    });

    context('is given a div operation with parameters "LX, III, II)', () => {
      test('the expected result should be XV : 60(LX) / 3(III) / 2(II) = 10(X)', () => {
          expect(service.doMath('div', [60, 3, 2 ])).toStrictEqual([10]);
      });
    });

    context('is given those crazy div with remainder scenarios -- Did the Romans do that???', () => {
      test('div(XX, II, III) should return III (I/III) : 20/2 = 10; 10 / 3 = 3', () => {
          expect(service.doMath('div', [20, 2, 3])).toStrictEqual([3, 1, 3]);
      });
      test('div(XIX, III, II) should return III (I/VI) : 19/3 = 6; 6/2 = 3', () => {
          expect(service.doMath('div', [19, 3, 2])).toStrictEqual([3, 1, 6]);
      });
      test('div(XX, III, II) should return III (I/III) : 20/3 = 6; 6/2 = 3 = 3', () => {
          expect(service.doMath('div', [20, 2, 3])).toStrictEqual([3, 1, 3]);
      });
      test('div(21, 35) should return 0 (3/5) if we handle zero and least common denominator', () => {
          expect(service.doMath('div', [21, 35])).toStrictEqual([0, 3, 5]);
      });
      test('div(85, 68) should return 1 (1/4) if we can figure 17/68 == 1/4', () => {
          expect(service.doMath('div', [85, 68])).toStrictEqual([1, 1, 4]);
      });
    });
  });

});

