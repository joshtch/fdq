// a domain, in this lib, is a set of numbers denoted by lo-hi range pairs (inclusive)
// for memory and performance reasons fdq has three different representations for a domain;
// - arrdom: an array with number pairs. mostly used by external apis because its easier to deal with. GC sensitive.
// - numdom: a 31bit field where each bit represents the inclusion of a value of its index (0 through 30). 31st bit unused
// - strdom: each value of an arrdom encoded as a double 16bit character. fixed range size (4 characters).

import expect from '../fixtures/mocha_proxy.fixt';
import {
  fixt_arrdom_nums,
  fixt_arrdom_range,
  fixt_assertStrings,
  fixt_dom_clone,
  fixt_dom_empty,
  fixt_dom_nums,
  fixt_dom_range,
  fixt_dom_solved,
  fixt_domainEql,
  fixt_numdom_empty,
  fixt_numdom_nums,
  fixt_numdom_range,
  fixt_numdom_solved,
  fixt_strdom_empty,
  fixt_strdom_nums,
  fixt_strdom_range,
  fixt_strdom_ranges,
  fixt_strdom_value,
} from '../fixtures/domain.fixt';

import {
  NO_SUCH_VALUE,
  SMALL_MAX_NUM,
  SUP,
} from '../../src/helpers';
import {
  EMPTY,
  NOT_FOUND,
  STR_RANGE_SIZE,

  domain_arrToSmallest,
  domain_str_closeGaps,
  domain_containsValue,
  domain_createRange,
  domain_numnum_createRangeZeroToMax,
  domain_createValue,
  domain_divby,
  domain_fromListToArrdom,
  domain_getFirstIntersectingValue,
  domain_getValue,
  domain_hasNoZero,
  domain_intersection,
  domain_isSolved,
  domain_isZero,
  domain_max,
  _domain_str_mergeOverlappingRanges,
  //domain_middleElement,
  domain_min,
  domain_mul,
  domain_numToStr,
  domain_str_rangeIndexOf,
  domain_removeGte,
  domain_removeLte,
  domain_removeValue,
  domain_resolveAsBooly,
  domain_sharesNoElements,
  domain_str_simplify,
  domain_size,
  _domain_str_quickSortRanges,
  domain_toArr,
  domain_toList,
  domain_toSmallest,
  domain__debug,
} from '../../src/domain';

const FLOOR_FRACTIONS = true;
const CEIL_FRACTIONS = false;

describe('src/domain.spec', function() {

  describe('EMPTY', function() {

    it('should be empty', function() {
      expect(EMPTY).to.eql(fixt_dom_empty());
    });
  });

  describe('domain_createValue', function() {

    it('should exist', function() {
      expect(domain_createValue).to.be.a('function');
    });

    describe('numdoms', function() {

      it('should convert small solved values to nums', function() {
        fixt_domainEql(domain_createRange(0, 10), domain_createRange(0, 10));
        fixt_domainEql(domain_createRange(20, SMALL_MAX_NUM), domain_createRange(20, SMALL_MAX_NUM));
        fixt_domainEql(domain_createRange(0, SMALL_MAX_NUM), domain_createRange(0, SMALL_MAX_NUM));
      });

      it('should convert small solved values to nums', function() {
        expect(domain_createValue(0)).to.eql(fixt_numdom_solved(0));
        expect(domain_createValue(1)).to.eql(fixt_numdom_solved(1));
        expect(domain_createValue(5)).to.eql(fixt_numdom_solved(5));
        expect(domain_createValue(8)).to.eql(fixt_numdom_solved(8));
        expect(domain_createValue(12)).to.eql(fixt_numdom_solved(12));
        expect(domain_createValue(18)).to.eql(fixt_numdom_solved(18));
        expect(domain_createValue(21)).to.eql(fixt_numdom_solved(21));
        expect(domain_createValue(29)).to.eql(fixt_numdom_solved(29));
        expect(domain_createValue(30)).to.eql(fixt_numdom_solved(30));
      });
    });

    describe('strdoms', function() {

      it('should convert small values to nums', function() {
        expect(domain_createValue(31)).to.eql(fixt_numdom_solved(31));
        expect(domain_createValue(32)).to.eql(fixt_numdom_solved(32));
        expect(domain_createValue(100)).to.eql(fixt_numdom_solved(100));
        expect(domain_createValue(56548)).to.eql(fixt_numdom_solved(56548));
        expect(domain_createValue(447)).to.eql(fixt_numdom_solved(447));
        expect(domain_createValue(SUP)).to.eql(fixt_numdom_solved(SUP));
        expect(domain_createValue(SUP - 1)).to.eql(fixt_numdom_solved(SUP - 1));
      });
    });
  });

  describe('domain_createRange', function() {

    it('should exist', function() {
      expect(domain_createRange).to.be.a('function');
    });

    describe('numdoms', function() {

      it('should convert small values to nums', function() {
        expect(domain_createRange(0, 0)).to.eql(fixt_numdom_solved(0));
        expect(domain_createRange(0, 1)).to.eql(fixt_numdom_range(0, 1));
        expect(domain_createRange(0, 29)).to.eql(fixt_numdom_range(0, 29));
        expect(domain_createRange(0, 30)).to.eql(fixt_numdom_range(0, 30));
        expect(domain_createRange(29, 30)).to.eql(fixt_numdom_range(29, 30));
        expect(domain_createRange(30, 30)).to.eql(fixt_numdom_solved(30));
        expect(domain_createRange(8, 14)).to.eql(fixt_numdom_range(8, 14));
        expect(domain_createRange(5, 21)).to.eql(fixt_numdom_range(5, 21));
        expect(domain_createRange(24, 28)).to.eql(fixt_numdom_range(24, 28));
      });
    });

    describe('strdoms', function() {

      it('should convert small values to nums', function() {
        fixt_assertStrings(domain_createRange(0, SUP), fixt_strdom_range(0, SUP));
        expect(domain_createRange(SUP, SUP)).to.eql(fixt_numdom_solved(SUP));
        fixt_assertStrings(domain_createRange(SUP - 1, SUP), fixt_strdom_range(SUP - 1, SUP));
        fixt_assertStrings(domain_createRange(200, 2000), fixt_strdom_range(200, 2000));
        expect(domain_createRange(SUP - 1, SUP - 1)).to.eql(fixt_numdom_solved(SUP - 1));
        fixt_assertStrings(domain_createRange(0, SUP - 1), fixt_strdom_range(0, SUP - 1));
        fixt_assertStrings(domain_createRange(5, 53243), fixt_strdom_range(5, 53243));
        expect(domain_createRange(85755487, 85755487)).to.eql(fixt_numdom_solved(85755487));
      });
    });
  });

  describe('domain_createRangeZeroToMax', function() {

    const ZERO = 1 << 0;
    const ONE = 1 << 1;
    const TWO = 1 << 2;
    const THREE = 1 << 3;
    const FOUR = 1 << 4;
    const FIVE = 1 << 5;
    const SIX = 1 << 6;
    const SEVEN = 1 << 7;
    const EIGHT = 1 << 8;
    const NINE = 1 << 9;
    const TEN = 1 << 10;
    const ELEVEN = 1 << 11;
    const TWELVE = 1 << 12;
    const THIRTEEN = 1 << 13;
    const FOURTEEN = 1 << 14;
    const FIFTEEN = 1 << 15;
    const SIXTEEN = 1 << 16;
    const SEVENTEEN = 1 << 17;
    const EIGHTEEN = 1 << 18;
    const NINETEEN = 1 << 19;
    const TWENTY = 1 << 20;
    const TWENTYONE = 1 << 21;
    const TWENTYTWO = 1 << 22;
    const TWENTYTHREE = 1 << 23;
    const TWENTYFOUR = 1 << 24;
    const TWENTYFIVE = 1 << 25;
    const TWENTYSIX = 1 << 26;
    const TWENTYSEVEN = 1 << 27;
    const TWENTYEIGHT = 1 << 28;
    const TWENTYNINE = 1 << 29;
    const THIRTY = 1 << 30;

    it('should work', function() {
      expect(_ => domain_numnum_createRangeZeroToMax(ZERO)).to.throw('INVALID INPUT');
      expect(domain_numnum_createRangeZeroToMax(ONE)).to.eql(ZERO | ONE);
      expect(domain_numnum_createRangeZeroToMax(TWO)).to.eql(ZERO | ONE | TWO);
      expect(domain_numnum_createRangeZeroToMax(THREE)).to.eql(ZERO | ONE | TWO | THREE);
      expect(domain_numnum_createRangeZeroToMax(FOUR)).to.eql(ZERO | ONE | TWO | THREE | FOUR);
      expect(domain_numnum_createRangeZeroToMax(SIX)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX);
      expect(domain_numnum_createRangeZeroToMax(SEVEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN);
      expect(domain_numnum_createRangeZeroToMax(EIGHT)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT);
      expect(domain_numnum_createRangeZeroToMax(NINE)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE);
      expect(domain_numnum_createRangeZeroToMax(TEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN);
      expect(domain_numnum_createRangeZeroToMax(ELEVEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN);
      expect(domain_numnum_createRangeZeroToMax(TWELVE)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE);
      expect(domain_numnum_createRangeZeroToMax(THIRTEEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN);
      expect(domain_numnum_createRangeZeroToMax(FOURTEEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN);
      expect(domain_numnum_createRangeZeroToMax(FIFTEEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN);
      expect(domain_numnum_createRangeZeroToMax(SIXTEEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN);
      expect(domain_numnum_createRangeZeroToMax(SEVENTEEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN);
      expect(domain_numnum_createRangeZeroToMax(EIGHTEEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN);
      expect(domain_numnum_createRangeZeroToMax(NINETEEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN);
      expect(domain_numnum_createRangeZeroToMax(TWENTY)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY);
      expect(domain_numnum_createRangeZeroToMax(TWENTYONE)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE);
      expect(domain_numnum_createRangeZeroToMax(TWENTYTWO)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO);
      expect(domain_numnum_createRangeZeroToMax(TWENTYTHREE)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO | TWENTYTHREE);
      expect(domain_numnum_createRangeZeroToMax(TWENTYFOUR)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO | TWENTYTHREE | TWENTYFOUR);
      expect(domain_numnum_createRangeZeroToMax(TWENTYFIVE)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO | TWENTYTHREE | TWENTYFOUR | TWENTYFIVE);
      expect(domain_numnum_createRangeZeroToMax(TWENTYSIX)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO | TWENTYTHREE | TWENTYFOUR | TWENTYFIVE | TWENTYSIX);
      expect(domain_numnum_createRangeZeroToMax(TWENTYSEVEN)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO | TWENTYTHREE | TWENTYFOUR | TWENTYFIVE | TWENTYSIX | TWENTYSEVEN);
      expect(domain_numnum_createRangeZeroToMax(TWENTYEIGHT)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO | TWENTYTHREE | TWENTYFOUR | TWENTYFIVE | TWENTYSIX | TWENTYSEVEN | TWENTYEIGHT);
      expect(domain_numnum_createRangeZeroToMax(TWENTYNINE)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO | TWENTYTHREE | TWENTYFOUR | TWENTYFIVE | TWENTYSIX | TWENTYSEVEN | TWENTYEIGHT | TWENTYNINE);
      expect(domain_numnum_createRangeZeroToMax(THIRTY)).to.eql(ZERO | ONE | TWO | THREE | FOUR | FIVE | SIX | SEVEN | EIGHT | NINE | TEN | ELEVEN | TWELVE | THIRTEEN | FOURTEEN | FIFTEEN | SIXTEEN | SEVENTEEN | EIGHTEEN | NINETEEN | TWENTY | TWENTYONE | TWENTYTWO | TWENTYTHREE | TWENTYFOUR | TWENTYFIVE | TWENTYSIX | TWENTYSEVEN | TWENTYEIGHT | TWENTYNINE | THIRTY);
    });
  });

  describe('fromListToArrdom', function() {

    it('should exist', function() {
      expect(domain_fromListToArrdom).to.be.a('function');
    });

    it('should return empty array for empty lists', function() {
      expect(domain_fromListToArrdom([])).to.eql([]);
    });

    describe('numdoms', function() {

      it('should work with [0,0]', function() {
        expect(domain_fromListToArrdom([0])).to.eql(fixt_arrdom_nums(0));
        expect(domain_fromListToArrdom([0, 0])).to.eql(fixt_arrdom_nums(0));
      });

      it('should work with [0,1]', function() {
        expect(domain_fromListToArrdom([0, 1])).to.eql(fixt_arrdom_nums(0, 1));
        expect(domain_fromListToArrdom([1, 0])).to.eql(fixt_arrdom_nums(0, 1));
        expect(domain_fromListToArrdom([0, 0, 1, 1])).to.eql(fixt_arrdom_nums(0, 1));
        expect(domain_fromListToArrdom([1, 1, 0, 0])).to.eql(fixt_arrdom_nums(0, 1));
      });

      it('should throw with negative elements', function() {
        expect(() => domain_fromListToArrdom([10, 1, -1, 0])).to.throw('A_OOB_INDICATES_BUG');
        expect(() => domain_fromListToArrdom([10, 1, -1, 0, 10, 1, -1, 0, 10, 1, -1, 0])).to.throw('A_OOB_INDICATES_BUG');
      });

      it('should not sort input array', function() {
        let list = [4, 3, 8, 2];
        domain_fromListToArrdom(list, true, true);

        expect(list).to.eql([4, 3, 8, 2]);
      });
    });

    describe('strdoms', function() {

      it('should work with [SUP,SUP]', function() {
        expect(domain_fromListToArrdom([SUP])).to.eql(fixt_arrdom_nums(SUP));
        expect(domain_fromListToArrdom([SUP, SUP])).to.eql(fixt_arrdom_nums(SUP));
      });

      it('should work with [SUP-1,SUP]', function() {
        expect(domain_fromListToArrdom([SUP - 1, SUP])).to.eql(fixt_arrdom_nums(SUP - 1, SUP));
        expect(domain_fromListToArrdom([SUP, SUP - 1])).to.eql(fixt_arrdom_nums(SUP, SUP - 1));
        expect(domain_fromListToArrdom([SUP - 1, SUP - 1, SUP, SUP])).to.eql(fixt_arrdom_nums(SUP - 1, SUP));
        expect(domain_fromListToArrdom([SUP - 1, SUP - 1, SUP, SUP])).to.eql(fixt_arrdom_nums(SUP - 1, SUP));
      });

      it('should throw with negative elements', function() {
        expect(() => domain_fromListToArrdom([SUP, 1, -1, 0])).to.throw('A_OOB_INDICATES_BUG');
        expect(() => domain_fromListToArrdom([SUP, 1, -1, 0, 10, 1, -1, 0, 10, 1, -1, 0])).to.throw('A_OOB_INDICATES_BUG');
      });

      it('should not sort input array', function() {
        let list = [4, SUP, 3, 8, 2];
        let domain = domain_fromListToArrdom(list);

        expect(list).to.eql([4, SUP, 3, 8, 2]); // not changed
        expect(domain).to.eql(fixt_arrdom_nums(2, SUP, 3, 4, 8));
      });
    });
  });

  describe('getValue', function() {

    it('should exist', function() {
      expect(domain_getValue).to.be.a('function');
    });

    describe('strdom', function() {

      it('should return NOT_FOUND if the domain has more than two values', function() {
        expect(domain_getValue(fixt_strdom_ranges([10, 20], [30, 40]))).to.equal(NOT_FOUND);
      });

      it('should return NOT_FOUND if the domain is empty', function() {
        expect(domain_getValue(fixt_numdom_empty())).to.eql(NO_SUCH_VALUE);
      });

      it('should return NO_SUCH_VALUE if the two elements are not equal', function() {
        expect(domain_getValue(fixt_strdom_nums(321, 1))).to.equal(NO_SUCH_VALUE);
      });

      it('should return value if both elements are same', function() {
        expect(domain_getValue(fixt_strdom_nums(1700))).to.equal(1700);
        expect(domain_getValue(fixt_strdom_nums(SUP))).to.equal(SUP);
        expect(domain_getValue(fixt_strdom_nums(SUP - 1))).to.equal(SUP - 1);
        expect(domain_getValue(fixt_strdom_nums(32))).to.equal(32);
        expect(domain_getValue(fixt_strdom_nums(0))).to.equal(0);
      });
    });

    describe('numdom', function() {

      it('should return NOT_FOUND if the domain has more than two values', function() {
        expect(domain_getValue(fixt_numdom_nums(10, 12))).to.equal(NOT_FOUND);
      });

      it('should return NOT_FOUND if the domain is empty', function() {
        let A = fixt_numdom_empty();
        expect(domain_getValue(A)).to.equal(NOT_FOUND);
      });

      it('should return 12 if it only contains 12', function() {
        expect(domain_getValue(fixt_numdom_nums(12))).to.equal(12);
      });

      it('should return 0 if it only contains 0', function() {
        expect(domain_getValue(fixt_numdom_nums(0))).to.equal(0);
      });
    });

    describe('solved numdom', function() {

      it('should work with solved numdoms', function() {
        for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
          expect(domain_getValue(fixt_numdom_solved(i)), 'i=' + i).to.equal(i);
        }
      });
    });
  });

  describe('toList', function() {

    it('should exist', function() {
      expect(domain_toList).to.be.a('function');
    });

    it('should require a domain', function() {
      expect(() => domain_toList()).to.throw('ONLY_NORDOM');
    });

    describe('strdom', function() {

      it('should work', function() {
        expect(domain_toList(fixt_strdom_nums(SUP))).to.eql([SUP]);
        expect(domain_toList(fixt_strdom_nums(SUP - 1, SUP))).to.eql([SUP - 1, SUP]);
        expect(domain_toList(fixt_strdom_nums(32))).to.eql([32]);
        expect(domain_toList(fixt_strdom_nums(0))).to.eql([0]);
      });
    });

    describe('numdom', function() {

      it('should accept empty domain', function() {
        expect(domain_toList(fixt_numdom_empty())).to.eql([]);
      });

      it('[0,0]', function() {
        expect(domain_toList(fixt_numdom_nums(0))).to.eql([0]);
      });

      it('[0,1]', function() {
        expect(domain_toList(fixt_numdom_nums(0, 1))).to.eql([0, 1]);
      });

      it('[1,1]', function() {
        expect(domain_toList(fixt_numdom_nums(1))).to.eql([1]);
      });
    });

    describe('solved numdom', function() {

      it('should work with solved numdoms', function() {
        for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
          expect(domain_toList(fixt_numdom_solved(i)), 'i=' + i).to.eql([i]);
        }
      });
    });
  });

  describe('getFirstIntersectingValue ', function() {

    describe('strdom', function() {

      it('should work with SUP range', function() {
        let A = fixt_strdom_range(SUP - 3, SUP);

        expect(domain_getFirstIntersectingValue(A, [SUP])).to.eql(SUP);
        expect(domain_getFirstIntersectingValue(A, [SUP, 10, 9, 7]), '[0,10,9,7]').to.eql(SUP);
        expect(domain_getFirstIntersectingValue(A, [10, 9, 7, SUP]), '[10,9,7,0]').to.eql(SUP);
        expect(domain_getFirstIntersectingValue(A, [SUP - 1])).to.eql(SUP - 1);
        expect(domain_getFirstIntersectingValue(A, [SUP - 2])).to.eql(SUP - 2);
        expect(domain_getFirstIntersectingValue(A, [SUP - 3])).to.eql(SUP - 3);
        expect(domain_getFirstIntersectingValue(A, [99, 100])).to.eql(NO_SUCH_VALUE);
      });

      it('should work with multiple ranges', function() {
        let A = fixt_strdom_ranges([SUP - 14, SUP - 10], [SUP - 4, SUP]);

        expect(domain_getFirstIntersectingValue(A, [SUP])).to.eql(SUP);
        expect(domain_getFirstIntersectingValue(A, [SUP, SUP - 10, SUP - 11])).to.eql(SUP);
        expect(domain_getFirstIntersectingValue(A, [SUP - 10, SUP - 11, SUP, SUP - 12])).to.eql(SUP - 10);
        expect(domain_getFirstIntersectingValue(A, [SUP - 1])).to.eql(SUP - 1);
        expect(domain_getFirstIntersectingValue(A, [SUP - 100, SUP - 12])).to.eql(SUP - 12);
        expect(domain_getFirstIntersectingValue(A, [SUP - 12, SUP - 100])).to.eql(SUP - 12);
      });

      it('should return NO_SUCH_VALUE if the list not intersect with domain', function() {
        let A = fixt_strdom_ranges([SUP - 24, SUP - 20], [SUP - 14, SUP - 10], [SUP - 4, SUP]);

        expect(domain_getFirstIntersectingValue(A, [99, 5, SUP - 12, 11])).to.eql(SUP - 12);
        expect(domain_getFirstIntersectingValue(A, [99, 5])).to.eql(NO_SUCH_VALUE);
      });

      it('should throw for negative values', function() {
        let A = fixt_strdom_ranges([SUP - 24, SUP - 20], [SUP - 14, SUP - 10], [SUP - 4, SUP]);

        expect(() => domain_getFirstIntersectingValue(A, [99, -1, SUP - 12, 11])).to.throw('A_OOB_INDICATES_BUG');
        expect(() => domain_getFirstIntersectingValue(A, [99, -1])).to.throw('A_OOB_INDICATES_BUG');
      });
    });

    describe('numdom', function() {

      it('should work with single range', function() {
        let A = fixt_numdom_range(0, 3);

        expect(domain_getFirstIntersectingValue(A, [0])).to.eql(0);
        expect(domain_getFirstIntersectingValue(A, [0, 10, 9, 7]), '[0,10,9,7]').to.eql(0);
        expect(domain_getFirstIntersectingValue(A, [10, 9, 7, 0]), '[10,9,7,0]').to.eql(0);
        expect(domain_getFirstIntersectingValue(A, [1])).to.eql(1);
        expect(domain_getFirstIntersectingValue(A, [2])).to.eql(2);
        expect(domain_getFirstIntersectingValue(A, [3])).to.eql(3);
        expect(domain_getFirstIntersectingValue(A, [99, 100])).to.eql(NO_SUCH_VALUE);
      });

      it('should work with zero domain', function() {
        let A = fixt_numdom_nums(0);

        expect(domain_getFirstIntersectingValue(A, [0])).to.eql(0);
        expect(domain_getFirstIntersectingValue(A, [0, 10, 11])).to.eql(0);
        expect(domain_getFirstIntersectingValue(A, [10, 11, 0, 12])).to.eql(0);
        expect(domain_getFirstIntersectingValue(A, [1])).to.eql(NO_SUCH_VALUE);
        expect(domain_getFirstIntersectingValue(A, [1, 2, 3, 4, 5])).to.eql(NO_SUCH_VALUE);
      });

      it('should work with multiple ranges', function() {
        let A = fixt_numdom_nums(0, 1, 2, 3, 4, 10, 11, 12, 13, 14);

        expect(domain_getFirstIntersectingValue(A, [0])).to.eql(0);
        expect(domain_getFirstIntersectingValue(A, [0, 10, 11])).to.eql(0);
        expect(domain_getFirstIntersectingValue(A, [10, 11, 0, 12])).to.eql(10);
        expect(domain_getFirstIntersectingValue(A, [1])).to.eql(1);
        expect(domain_getFirstIntersectingValue(A, [100, 12])).to.eql(12);
        expect(domain_getFirstIntersectingValue(A, [12, 100])).to.eql(12);
      });

      it('should return NO_SUCH_VALUE if the list not intersect with domain', function() {
        let A = fixt_numdom_nums(0, 1, 2, 3, 4, 10, 11, 12, 13, 14);

        expect(domain_getFirstIntersectingValue(A, [99, 5, 12, 11])).to.eql(12);
        expect(domain_getFirstIntersectingValue(A, [99, 5])).to.eql(NO_SUCH_VALUE);
      });

      it('should throw for negative values', function() {
        let A = fixt_numdom_nums(0, 1, 2, 3, 4, 10, 11, 12, 13, 14);

        expect(() => domain_getFirstIntersectingValue(A, [99, -1, 12, 11])).to.throw('A_OOB_INDICATES_BUG');
        expect(() => domain_getFirstIntersectingValue(A, [99, -1])).to.throw('A_OOB_INDICATES_BUG');
      });
    });

    describe('solved numdom', function() {

      it('should work with solved numdoms', function() {
        for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
          // test for list with target (i) as first, middle, last, and
          // not-existing element. also empty list and only i.
          expect(domain_getFirstIntersectingValue(fixt_numdom_solved(i), [i]), 'i=' + i).to.equal(i);
          expect(domain_getFirstIntersectingValue(fixt_numdom_solved(i), [i, 500, SUP]), 'i=' + i).to.equal(i);
          expect(domain_getFirstIntersectingValue(fixt_numdom_solved(i), [500, i, SUP]), 'i=' + i).to.equal(i);
          expect(domain_getFirstIntersectingValue(fixt_numdom_solved(i), [500, SUP, i]), 'i=' + i).to.equal(i);
          expect(domain_getFirstIntersectingValue(fixt_numdom_solved(i), [500, SUP]), 'i=' + i).to.equal(NO_SUCH_VALUE);
          expect(domain_getFirstIntersectingValue(fixt_numdom_solved(i), []), 'i=' + i).to.equal(NO_SUCH_VALUE);
        }
      });
    });
  });

  describe('containsValue', function() {

    it('should exist', function() {
      expect(domain_containsValue).to.be.a('function');
    });

    describe('arrdom', function() {
      describe('should return true if domain contains given value', function() {

        it('one range in domain', function() {
          expect(domain_containsValue(fixt_strdom_range(SUP - 10, SUP), SUP - 5)).to.equal(true);
        });

        it('multiple ranges in domain', function() {
          expect(domain_containsValue(fixt_strdom_ranges([SUP - 60, SUP - 50], [SUP - 30, SUP - 20], [SUP - 10, SUP]), SUP - 25)).to.equal(true);
        });
      });

      describe('should return false if domain does not contain value', function() {

        it('empty array', function() {
          expect(domain_containsValue(fixt_numdom_empty(), 0)).to.equal(false);
        });

        it('one range in domain', function() {
          expect(domain_containsValue(fixt_strdom_range(SUP - 10, SUP), 25)).to.equal(false);
        });

        it('multiple ranges in domain', function() {
          expect(domain_containsValue(fixt_strdom_ranges([SUP - 60, SUP - 50], [SUP - 30, SUP - 20], [SUP - 10, SUP]), SUP - 15)).to.equal(false);
        });
      });
    });

    describe('numdom', function() {

      describe('should return true if domain contains given value', function() {

        it('one range in domain', function() {
          expect(domain_containsValue(fixt_numdom_range(0, 10), 5)).to.equal(true);
        });

        it('multiple ranges in domain', function() {
          expect(domain_containsValue(fixt_numdom_nums(0, 1, 2, 4, 5, 8, 9, 10, 11), 9)).to.equal(true);
        });
      });

      describe('should return false if domain does not contain value', function() {

        it('empty array', function() {
          expect(domain_containsValue(fixt_numdom_empty(), 0)).to.equal(false);
        });

        it('one range in domain', function() {
          expect(domain_containsValue(fixt_numdom_range(0, 10), 25)).to.equal(false);
        });

        it('multiple ranges in domain', function() {
          expect(domain_containsValue(fixt_numdom_nums(0, 1, 2, 4, 5, 8, 9, 10, 11), 6)).to.equal(false);
        });
      });

    });

    describe('solved numdom', function() {

      it('should work with solved numdoms', function() {
        for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
          // do a search that passes, fails, and is oob
          expect(domain_containsValue(fixt_numdom_solved(i), 0), 'i=' + i + ',q=0').to.equal(i === 0);
          expect(domain_containsValue(fixt_numdom_solved(i), 1), 'i=' + i + ',q=1').to.equal(i === 1);
          expect(domain_containsValue(fixt_numdom_solved(i), SUP), 'i=' + i + ',q=SUP').to.equal(false);
        }
      });
    });

    describe('large value in numdom range', function() {

      it('should return false when numbers are oob for bitdom ranges', function() {
        expect(domain_containsValue(fixt_numdom_range(0, 10), 10000)).to.equal(false);
        expect(domain_containsValue(fixt_numdom_range(0, 10), 1760)).to.equal(false); // this value is a regression that uncovered a bug
        expect(_ => domain_containsValue(fixt_numdom_range(0, 10), -1)).to.throw('OOB');
        expect(_ => domain_containsValue(fixt_numdom_range(0, 10), -10000)).to.throw('OOB');
      });
    });
  });

  describe('domain_rangeIndexOf', function() {

    it('should exist', function() {
      expect(domain_str_rangeIndexOf).to.be.a('function');
    });

    describe('should return index of range offset that encloses value', function() {
      // note: not range index, but index on the set of numbers which represents range pairs

      it('one range in domain', function() {
        expect(domain_str_rangeIndexOf(fixt_strdom_range(SUP - 10, SUP), SUP - 5)).to.eql(0);
      });

      it('multiple ranges in domain', function() {
        expect(domain_str_rangeIndexOf(fixt_strdom_ranges([SUP - 60, SUP - 50], [SUP - 30, SUP - 20], [SUP - 10, SUP]), SUP - 50)).to.eql(0);
        expect(domain_str_rangeIndexOf(fixt_strdom_ranges([SUP - 60, SUP - 50], [SUP - 30, SUP - 20], [SUP - 10, SUP]), SUP - 25)).to.eql(1 * STR_RANGE_SIZE);
        expect(domain_str_rangeIndexOf(fixt_strdom_ranges([SUP - 60, SUP - 50], [SUP - 30, SUP - 20], [SUP - 10, SUP]), SUP - 5)).to.eql(2 * STR_RANGE_SIZE);
      });
    });

    describe('should return NOT_FOUND if domain does not contain value', function() {

      it('empty array', function() {
        expect(_ => domain_str_rangeIndexOf(fixt_strdom_empty(), 0)).to.throw('NOT_EMPTY_STR');
      });

      it('one range in domain', function() {
        expect(domain_str_rangeIndexOf(fixt_strdom_range(SUP - 10, SUP), SUP - 25)).to.eql(NOT_FOUND);
      });

      it('multiple ranges in domain', function() {
        expect(domain_str_rangeIndexOf(fixt_strdom_ranges([SUP - 60, SUP - 50], [SUP - 30, SUP - 20], [SUP - 10, SUP]), SUP - 15)).to.eql(NOT_FOUND);
      });
    });
  });

  describe('domain_removeValue', function() {

    it('should exist', function() {
      expect(domain_removeValue).to.be.a('function');
    });

    it('should reject an invalid value', function() { // (only numbers are valid values)
      expect(() => domain_removeValue(fixt_dom_nums(1, 2, 3), '15')).to.throw('VALUE_SHOULD_BE_VALID_DOMAIN_ELEMENT');
      expect(() => domain_removeValue(fixt_dom_nums(1, 2, 3), ['15'])).to.throw('VALUE_SHOULD_BE_VALID_DOMAIN_ELEMENT');
    });

    describe('strdom', function() {

      it('should require a domain', function() {
        expect(() => domain_removeValue(null, 15)).to.throw('ONLY_NORDOM');
      });

      // target: 5
      // 012 456 89 -> 012 4 6 89
      // 012 567    -> 012 67
      // 01 345     -> 01 34
      // 01 345 89  -> 01 34 89
      // 012 5 789  -> 012 789
      // 5 789      -> 789
      // 012 5      -> 012
      // 789        -> 789
      // 012        -> 012
      // 5          -> empty
      // empty      -> empty

      function test(domain, value, expectation) {
        it(`should remove [${value}] from [${domain__debug(domain)}] resulting in [${domain__debug(expectation)}]`, function() {
          let clone = fixt_dom_clone(domain);
          let result = domain_removeValue(fixt_dom_clone(domain), value);

          expect(domain, 'should not change').to.eql(clone);
          if (typeof expectation === 'string') fixt_assertStrings(result, expectation);
          else expect(result).to.equal(expectation); // output is a numdom
          expect(result).to.eql(expectation);
        });
      }

      test(fixt_strdom_ranges([100, 102], [104, 106], [108, 109]), 105, fixt_strdom_ranges([100, 102], [104, 104], [106, 106], [108, 109]));
      test(fixt_strdom_ranges([100, 102], [104, 106]), 105, fixt_strdom_ranges([100, 102], [104, 104], [106, 106]));
      test(fixt_strdom_ranges([100, 101], [103, 105]), 105, fixt_strdom_ranges([100, 101], [103, 104]));
      test(fixt_strdom_ranges([100, 101], [103, 105], [108, 109]), 105, fixt_strdom_ranges([100, 101], [103, 104], [108, 109]));
      test(fixt_strdom_ranges([100, 102], [105, 105], [107, 109]), 105, fixt_strdom_ranges([100, 102], [107, 109]));
      test(fixt_strdom_ranges([105, 105], [107, 109]), 105, fixt_strdom_ranges([107, 109]));
      test(fixt_strdom_ranges([100, 102], [105, 105]), 105, fixt_strdom_ranges([100, 102]));
      test(fixt_strdom_ranges([107, 109]), 105, fixt_strdom_ranges([107, 109]));
      test(fixt_strdom_ranges([100, 102]), 105, fixt_strdom_ranges([100, 102]));
      test(fixt_strdom_ranges([105, 105]), 105, fixt_numdom_empty());

      test(fixt_strdom_ranges([32, 32]), 32, fixt_numdom_empty());
      test(fixt_strdom_ranges([SUP, SUP]), SUP, fixt_numdom_empty());
      test(fixt_strdom_ranges([SUP - 1, SUP - 1]), SUP - 1, fixt_numdom_empty());
      test(fixt_strdom_ranges([SUP - 1, SUP]), SUP, fixt_numdom_solved(SUP - 1));
    });

    describe('numdom', function() {

      // target: 5
      // 012 456 89 -> 012 4 6 89
      // 012 567    -> 012 67
      // 01 345     -> 01 34
      // 01 345 89  -> 01 34 89
      // 012 5 789  -> 012 789
      // 5 789      -> 789
      // 012 5      -> 012
      // 789        -> 789
      // 012        -> 012
      // 5          -> empty
      // empty      -> empty

      function test(domain, value, output) {
        it(`should remove [${value}] from [${domain}] resulting in [${output}]`, function() {
          expect(domain_removeValue(domain, value)).to.eql(output);
        });
      }

      test(fixt_numdom_nums(0, 1, 2, 4, 5, 6, 8, 9), 5, fixt_numdom_nums(0, 1, 2, 4, 6, 8, 9));
      test(fixt_numdom_nums(0, 1, 2, 4, 5, 6), 5, fixt_numdom_nums(0, 1, 2, 4, 6));
      test(fixt_numdom_nums(0, 1, 3, 4, 5), 5, fixt_numdom_nums(0, 1, 3, 4));
      test(fixt_numdom_nums(0, 1, 3, 4, 5, 8, 9), 5, fixt_numdom_nums(0, 1, 3, 4, 8, 9));
      test(fixt_numdom_nums(0, 1, 2, 5, 7, 8, 9), 5, fixt_numdom_nums(0, 1, 2, 7, 8, 9));
      test(fixt_numdom_nums(5, 7, 8, 9), 5, fixt_numdom_nums(7, 8, 9));
      test(fixt_numdom_nums(0, 1, 2, 5), 5, fixt_numdom_nums(0, 1, 2));
      test(fixt_numdom_nums(7, 8, 9), 5, fixt_numdom_nums(7, 8, 9));
      test(fixt_numdom_nums(0, 1, 2), 5, fixt_numdom_nums(0, 1, 2));
      test(fixt_numdom_nums(5), 5, fixt_numdom_nums());
    });

    describe('solved numdom', function() {

      it('should work with solved numdoms', function() {
        let nums = [0, 1, 10, 100, 1000, SUP - 1, SUP];
        for (let i = 0; i < nums.length; ++i) {
          let n = nums[i];
          // do a search that passes and one that fails
          expect(domain_removeValue(fixt_numdom_solved(n), n), 'n=' + n + ',q=' + n).to.equal(fixt_dom_empty());
          expect(domain_removeValue(fixt_numdom_solved(n), 5), 'n=' + n + ',q=5').to.equal(fixt_numdom_solved(n));
        }
      });
    });
  });

  describe('domain_sharesNoElements', function() {

    it('should exist', function() {
      expect(domain_sharesNoElements).to.be.a('function');
    });

    describe('strdom', function() {

      it('unit tests', function() {
        expect(domain_sharesNoElements(fixt_strdom_range(1, SUP), fixt_strdom_range(500, 600))).to.eql(false);
        expect(domain_sharesNoElements(fixt_strdom_range(1, SUP - 10), fixt_strdom_range(SUP - 5, SUP))).to.eql(true);
        expect(domain_sharesNoElements(fixt_strdom_range(500, 600), fixt_strdom_range(1, SUP))).to.eql(false);
        expect(domain_sharesNoElements(fixt_strdom_range(SUP - 5, SUP), fixt_strdom_range(1, SUP - 10))).to.eql(true);
      });
    });

    describe('numdom', function() {

      it('unit tests', function() {
        expect(domain_sharesNoElements(fixt_numdom_range(1, 20), fixt_numdom_range(15, 25))).to.eql(false);
        expect(domain_sharesNoElements(fixt_numdom_range(1, 20), fixt_numdom_range(25, 27))).to.eql(true);
        expect(domain_sharesNoElements(fixt_numdom_range(15, 25), fixt_numdom_range(1, 20))).to.eql(false);
        expect(domain_sharesNoElements(fixt_numdom_range(25, 27), fixt_numdom_range(1, 20))).to.eql(true);
      });
    });

    describe('soldom', function() {

      it('unit tests', function() {
        //expect(domain_sharesNoElements(fixt_numdom_range(1, 20), fixt_numdom_solved(15))).to.eql(false);
        //expect(domain_sharesNoElements(fixt_numdom_range(1, 20), fixt_numdom_solved(25))).to.eql(true);
        //expect(domain_sharesNoElements(fixt_numdom_solved(15), fixt_numdom_range(1, 20))).to.eql(false);
        //expect(domain_sharesNoElements(fixt_numdom_solved(25), fixt_numdom_range(1, 20))).to.eql(true);
        expect(domain_sharesNoElements(fixt_numdom_solved(500), fixt_strdom_range(1, SUP))).to.eql(false);
        expect(domain_sharesNoElements(fixt_numdom_solved(SUP), fixt_strdom_range(1, SUP - 10))).to.eql(true);
        expect(domain_sharesNoElements(fixt_numdom_solved(20), fixt_numdom_solved(20))).to.eql(false);
        expect(domain_sharesNoElements(fixt_numdom_solved(20), fixt_numdom_solved(0))).to.eql(true);
        expect(domain_sharesNoElements(fixt_numdom_solved(0), fixt_numdom_solved(20))).to.eql(true);
      });
    });
  });

  describe('domain_min', function() {

    it('should exist', function() {
      expect(domain_min).to.be.a('function');
    });

    it('arrdom', function() {
      expect(domain_min(fixt_strdom_ranges([0, 10], [100, 300]))).to.eql(0);
      expect(domain_min(fixt_strdom_ranges([0, 10], [100, SUP]))).to.eql(0);
      expect(domain_min(fixt_strdom_ranges([1, 1], [100, SUP]))).to.eql(1);
      expect(domain_min(fixt_strdom_ranges([100, 100]))).to.eql(100);
      expect(domain_min(fixt_strdom_ranges([SUP, SUP]))).to.eql(SUP);
      expect(domain_min(fixt_strdom_ranges([SUP - 1, SUP]))).to.eql(SUP - 1);
    });

    it('numdom', function() {
      for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
        // basically trying each small domain range from [0,30] to [30,30]
        expect(domain_min(fixt_numdom_nums(i)), i + ' | i').to.eql(i);
        expect(domain_min(fixt_numdom_nums(i, 30)), i + ' | 30').to.eql(i);
      }
    });
  });

  describe('domain_max', function() {

    it('should exist', function() {
      expect(domain_max).to.be.a('function');
    });

    it('arrdom', function() {
      expect(domain_max(fixt_strdom_ranges([0, 10], [100, 300]))).to.eql(300);
      expect(domain_max(fixt_strdom_ranges([0, 10], [100, SUP]))).to.eql(SUP);
      expect(domain_max(fixt_strdom_ranges([1, 1], [100, SUP]))).to.eql(SUP);
      expect(domain_max(fixt_strdom_ranges([100, 100]))).to.eql(100);
      expect(domain_max(fixt_strdom_ranges([SUP, SUP]))).to.eql(SUP);
      expect(domain_max(fixt_strdom_ranges([SUP - 1, SUP]))).to.eql(SUP);
    });

    it('numdom', function() {
      for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
        // basically trying each small domain range from [0,30] to [30,30]
        expect(domain_max(fixt_numdom_nums(0, i)), '0 | ' + i).to.eql(i);
      }
    });
  });

  describe('domain_mergeOverlappingInline', function() {

    it('should exist', function() {
      expect(_domain_str_mergeOverlappingRanges).to.be.a('function');
    });

    it('should throw for domains as numbers', function() {
      expect(_ => _domain_str_mergeOverlappingRanges(fixt_numdom_nums(1))).to.throw('ONLY_STRDOM');
    });

    it('should return empty domain for empty domain', function() {
      expect(_domain_str_mergeOverlappingRanges(fixt_strdom_empty()), fixt_strdom_empty());
    });

    it('should return same range for single range domain', function() {
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_range(910, 9100)), fixt_strdom_range(910, 9100));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_range(930, 9213)), fixt_strdom_range(930, 9213));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_range(90, 91)), fixt_strdom_range(90, 91));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_range(SUP, SUP)), fixt_strdom_range(SUP, SUP));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_range(SUP - 1, SUP)), fixt_strdom_range(SUP - 1, SUP));
    });

    it('should return same if not overlapping', function() {
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([910, 9100], [9200, 9300])), fixt_strdom_ranges([910, 9100], [9200, 9300]));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 90], [92, 92])), fixt_strdom_ranges([90, 90], [92, 92]));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 90], [SUP, SUP])), fixt_strdom_ranges([90, 90], [SUP, SUP]));
    });

    it('should merge if two domains overlap', function() {
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 91], [91, 92])), fixt_strdom_range(90, 92));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 950], [925, 975])), fixt_strdom_range(90, 975));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([9213, 9278], [9244, 9364])), fixt_strdom_range(9213, 9364));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([910, 920], [930, 940], [935, 945], [950, 960])), fixt_strdom_ranges([910, 920], [930, 945], [950, 960]));
    });

    it('should merge if two domains touch', function() {
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 90], [91, 91])), fixt_strdom_range(90, 91));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 91], [92, 93])), fixt_strdom_range(90, 93));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 910], [910, 920])), fixt_strdom_range(90, 920));
    });

    it('should chain merges', function() {
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 90], [91, 91], [92, 92])), fixt_strdom_range(90, 92));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 91], [91, 92], [92, 93])), fixt_strdom_range(90, 93));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 90], [91, 92], [92, 93])), fixt_strdom_range(90, 93));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([91, 92], [92, 93])), fixt_strdom_range(91, 93));
    });

    it('should make sure resulting range wraps both ranges', function() {
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 90], [90, 91])), fixt_strdom_range(90, 91));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 91], [90, 90])), fixt_strdom_range(90, 91));
      fixt_assertStrings(_domain_str_mergeOverlappingRanges(fixt_strdom_ranges([90, 910], [914, 916], [915, 920], [916, 919], [917, 918])), fixt_strdom_ranges([90, 910], [914, 920]));
    });
  });

  describe('domain_simplifyInline', function() {

    it('should exist', function() {
      expect(domain_str_simplify).to.be.a('function');
    });

    it('should throw for domains as numbers', function() {
      expect(_ => domain_str_simplify(fixt_numdom_empty())).to.throw('ONLY_STRDOM');
      expect(_ => domain_str_simplify(fixt_numdom_nums(1, 3, 9))).to.throw('ONLY_STRDOM');
      expect(_ => domain_str_simplify()).to.throw('ONLY_STRDOM');
    });

    it('should work with empty domain', function() {
      let arr = fixt_strdom_empty();

      expect(domain_str_simplify(arr)).to.eql(fixt_dom_empty());
    });

    it('should return a solved domain if it has one range', function() {
      fixt_assertStrings(domain_str_simplify(fixt_strdom_range(90, 91)), fixt_strdom_range(90, 91));
      expect(domain_str_simplify(fixt_strdom_range(SUP, SUP))).to.eql(fixt_numdom_solved(SUP));
    });

    it('should work if domain is not changed', function() {
      fixt_assertStrings(domain_str_simplify(fixt_strdom_ranges([91, 92], [920, 930])), fixt_strdom_ranges([91, 92], [920, 930]));
      fixt_assertStrings(domain_str_simplify(fixt_strdom_ranges([91, 92], [920, SUP])), fixt_strdom_ranges([91, 92], [920, SUP]));
    });

    it('should simplify back-to-back domains', function() {
      fixt_assertStrings(domain_str_simplify(fixt_strdom_ranges([91, 92], [92, 93])), fixt_strdom_range(91, 93));
      fixt_assertStrings(domain_str_simplify(fixt_strdom_ranges([91, 92], [92, SUP])), fixt_strdom_range(91, SUP));
    });

    it('should simplify swapped back-to-back domains', function() {
      fixt_assertStrings(domain_str_simplify(fixt_strdom_ranges([92, 93], [91, 92])), fixt_strdom_range(91, 93));
      fixt_assertStrings(domain_str_simplify(fixt_strdom_ranges([92, SUP], [91, 92])), fixt_strdom_range(91, SUP));
    });
  });

  describe('intersection', function() {

    it('should exist', function() {
      expect(domain_intersection).to.be.a('function');
    });

    it('should require two domains', function() {
      expect(() => domain_intersection()).to.throw('ONLY_NORDOM');
      expect(() => domain_intersection(fixt_numdom_empty())).to.throw('ONLY_NORDOM');
      expect(() => domain_intersection(null, fixt_numdom_empty())).to.throw('ONLY_NORDOM');
    });

    it('should return empty numdom', function() {
      expect(domain_intersection(fixt_numdom_empty(), fixt_numdom_empty())).to.eql(fixt_dom_empty());
    });

    it('should throw for EMPTY_STR', function() {
      expect(_ => domain_intersection(fixt_strdom_empty(), fixt_strdom_empty())).to.throw('empty domains are always numdoms');
      expect(_ => domain_intersection(fixt_strdom_empty(), fixt_numdom_empty())).to.throw('empty domains are always numdoms');
      expect(_ => domain_intersection(fixt_numdom_empty(), fixt_strdom_empty())).to.throw('empty domains are always numdoms');
    });

    describe('strdom', function() {

      it('should handle empty domain with single element domain', function() {
        expect(domain_intersection(fixt_numdom_empty(), fixt_strdom_range(90, 91))).to.eql(fixt_dom_empty());
      });

      it('should handle empty domain with multi element domain', function() {
        expect(domain_intersection(fixt_numdom_empty(), fixt_strdom_ranges([90, 91], [93, 95]))).to.eql(fixt_dom_empty());
      });

      it('should handle single element domain with empty domain', function() {
        expect(domain_intersection(fixt_strdom_range(90, 91), fixt_numdom_empty())).to.eql(fixt_dom_empty());
      });

      it('should handle single element domain with empty domain', function() {
        expect(domain_intersection(fixt_strdom_ranges([90, 91], [93, 95]), fixt_numdom_empty())).to.eql(fixt_dom_empty());
      });

      it('should handle single element domains', function() {
        expect(domain_intersection(fixt_strdom_range(90, 91), fixt_strdom_range(93, 95))).to.eql(fixt_dom_empty());
      });

      it('should intersect single element domains', function() {
        fixt_assertStrings(domain_intersection(fixt_strdom_range(90, 95), fixt_strdom_range(93, 100)), fixt_strdom_range(93, 95));
      });

      it('should intersect single element domains reversed', function() {
        fixt_assertStrings(domain_intersection(fixt_strdom_range(93, 100), fixt_strdom_range(90, 95)), fixt_strdom_range(93, 95));
      });

      it('should handle single element domain with multi element domain', function() {
        expect(domain_intersection(fixt_strdom_range(90, 91), fixt_strdom_ranges([10, 20], [30, 40]))).to.eql(fixt_dom_empty());
      });

      it('should handle multi element domain with single element domain', function() {
        expect(domain_intersection(fixt_strdom_ranges([0, 1], [10, 120]), fixt_strdom_range(130, 140))).to.eql(fixt_dom_empty());
      });

      it('should intersect single element domain with multi element domain', function() {
        expect(domain_intersection(fixt_strdom_range(5, 16), fixt_strdom_ranges([10, 20], [30, 40]))).to.eql(fixt_numdom_range(10, 16));
      });

      it('should intersect multi element domain with single element domain', function() {
        fixt_assertStrings(domain_intersection(fixt_strdom_ranges([0, 1], [25, 35]), fixt_strdom_range(30, 40)), fixt_strdom_range(30, 35));
      });

      it('should handle multi element domains', function() {
        expect(domain_intersection(fixt_strdom_ranges([0, 1], [10, 120]), fixt_strdom_ranges([130, 140], [150, 160]))).to.eql(fixt_dom_empty());
      });

      it('should intersect multi element domains', function() {
        fixt_assertStrings(domain_intersection(fixt_strdom_ranges([0, 1], [10, 35]), fixt_strdom_ranges([30, 40], [50, 60])), fixt_strdom_range(30, 35));
      });

      it('should return two ranges if a range in one domain intersects with two ranges of the other domain', function() {
        fixt_assertStrings(domain_intersection(fixt_strdom_range(15, 35), fixt_strdom_ranges([10, 20], [30, 40])), fixt_strdom_ranges([15, 20], [30, 35]));
      });

      it('should divide and conquer some random tests 1', function() {
        // copy(JSON.stringify(function f(n) {
        //   var arr = [];
        //   while (--n > 0) {
        //     var t = Math.floor(Math.random() * 100);
        //     arr.push(t, t+Math.floor(Math.random() * 20));
        //   }
        //   return arr;
        // }(10).map(function(a){
        //   return [Math.min(a[0],a[1]), Math.max(a[0], a[1])];
        // })).replace(/,/g, ', '))

        let a = fixt_strdom_ranges([10, 23], [29, 38], [49, 49], [54, 68], [77, 78], [84, 100]);
        let b = fixt_strdom_ranges([1, 1], [3, 21], [25, 38], [54, 67], [70, 84], [88, 107]);

        fixt_assertStrings(domain_intersection(a, b), fixt_strdom_ranges([10, 21], [29, 38], [54, 67], [77, 78], [84, 84], [88, 100]));
      });

      it('should divide and conquer some random tests 2', function() {
        let a = fixt_strdom_ranges([17, 23], [37, 78], [85, 104]);
        let b = fixt_strdom_ranges([6, 25], [47, 56], [58, 60], [64, 67], [83, 103]);

        fixt_assertStrings(domain_intersection(a, b), fixt_strdom_ranges([17, 23], [47, 56], [58, 60], [64, 67], [85, 103]));
      });

      it('should divide and conquer some random tests 3', function() {
        let a = fixt_strdom_ranges([9, 36], [54, 66], [74, 77], [84, 96]);
        let b = fixt_strdom_range(1, 75);

        fixt_assertStrings(domain_intersection(a, b), fixt_strdom_ranges([9, 36], [54, 66], [74, 75]));
      });

      it('should normalize a numdom if the result is low enough', function() {
        let a = fixt_strdom_ranges([9, 30], [54, 67], [74, 77], [84, 96]);
        let b = fixt_strdom_range(28, 35);

        // only 28,29,30 intersects (crossing the numdom boundary)
        expect(domain_intersection(a, b)).to.eql(fixt_numdom_range(28, 30));
      });

      it('should return a solved numdom if the result is solved to a strdom value', function() {
        let a = fixt_strdom_ranges([9, 36], [54, 66], [74, 77], [84, 96]);
        let b = fixt_strdom_range(66, 70);

        // only 66 intersects
        expect(domain_intersection(a, b), domain_toArr(domain_intersection(a, b))).to.eql(fixt_numdom_solved(66));
      });

      it('should return a solved numdom if the result is solved to a numdom value', function() {
        let a = fixt_strdom_ranges([9, 30], [54, 66], [74, 77], [84, 96]);
        let b = fixt_strdom_range(30, 35);

        // only 66 intersects
        expect(domain_intersection(a, b)).to.eql(fixt_numdom_solved(30));
      });
    });

    describe('numdom', function() {

      it('should return a small domain', function() {
        let arr1 = fixt_numdom_empty();
        let arr2 = fixt_numdom_empty();
        let out = domain_intersection(arr1, arr2);

        expect(out).to.equal(fixt_numdom_empty());
      });

      it('should handle empty domain with single element domain', function() {
        expect(domain_intersection(fixt_numdom_empty(), fixt_numdom_range(0, 1))).to.eql(fixt_numdom_empty());
      });

      it('should handle empty domain with multi element domain', function() {
        expect(domain_intersection(fixt_numdom_empty(), fixt_numdom_nums(0, 1, 3, 4, 5))).to.eql(fixt_numdom_empty());
      });

      it('should handle single element domain with empty domain', function() {
        expect(domain_intersection(fixt_numdom_range(0, 1), fixt_numdom_empty())).to.eql(fixt_numdom_empty());
        expect(domain_intersection(fixt_numdom_empty(), fixt_numdom_range(0, 1))).to.eql(fixt_numdom_empty());
        expect(domain_intersection(fixt_numdom_nums(0, 1, 3, 4, 5), fixt_numdom_empty())).to.eql(fixt_numdom_empty());
        expect(domain_intersection(fixt_numdom_empty(), fixt_numdom_nums(0, 1, 3, 4, 5))).to.eql(fixt_numdom_empty());
      });

      it('should handle single element domains', function() {
        expect(domain_intersection(fixt_numdom_range(0, 1), fixt_numdom_range(3, 5))).to.eql(fixt_numdom_empty());
        expect(domain_intersection(fixt_numdom_range(3, 5), fixt_numdom_range(0, 1))).to.eql(fixt_numdom_empty());
      });

      it('should intersect single element domains', function() {
        expect(domain_intersection(fixt_numdom_range(0, 5), fixt_numdom_range(3, 10))).to.eql(fixt_numdom_range(3, 5));
        expect(domain_intersection(fixt_numdom_range(3, 10), fixt_numdom_range(0, 5))).to.eql(fixt_numdom_range(3, 5));
      });

      it('should handle single element domain with multi element domain', function() {
        expect(domain_intersection(fixt_numdom_range(10, 15), fixt_numdom_range(0, 1))).to.eql(fixt_numdom_empty());
        expect(domain_intersection(fixt_numdom_range(0, 1), fixt_numdom_range(10, 15))).to.eql(fixt_numdom_empty());
      });

      it('should handle multi element domain with single element domain', function() {
        expect(domain_intersection(fixt_numdom_nums(5, 6, 7), fixt_numdom_nums(0, 1, 10, 11, 12, 13, 14, 15))).to.eql(fixt_numdom_empty());
        expect(domain_intersection(fixt_numdom_nums(0, 1, 10, 11, 12, 13, 14, 15), fixt_numdom_nums(5, 6, 7))).to.eql(fixt_numdom_empty());
      });

      it('should intersect single element domain with multi element domain', function() {
        expect(domain_intersection(fixt_numdom_nums(0, 1, 10, 11, 12, 13, 14, 15), fixt_numdom_range(5, 15))).to.eql(fixt_numdom_range(10, 15));
        expect(domain_intersection(fixt_numdom_range(5, 15), fixt_numdom_nums(0, 1, 10, 11, 12, 13, 14, 15))).to.eql(fixt_numdom_range(10, 15));
      });

      it('should return two ranges if a range in one domain intersects with two ranges of the other domain', function() {
        expect(domain_intersection(fixt_numdom_range(5, 10), fixt_numdom_nums(4, 5, 6, 9, 10, 11))).to.eql(fixt_numdom_nums(5, 6, 9, 10));
        expect(domain_intersection(fixt_numdom_nums(4, 5, 6, 9, 10, 11), fixt_numdom_range(5, 10))).to.eql(fixt_numdom_nums(5, 6, 9, 10));
      });
    });

    describe('anydom', function() {

      it('should work with strdom and numdom', function() {
        expect(domain_intersection(fixt_strdom_range(0, 95), fixt_numdom_range(5, 10))).to.eql(fixt_numdom_range(5, 10));
      });

      it('should work with numdom and strdom', function() {
        expect(domain_intersection(fixt_numdom_range(5, 10), fixt_strdom_range(0, 95))).to.eql(fixt_numdom_range(5, 10));
      });
    });

    describe('solved numdom', function() {

      it('should work with two solved numdoms', function() {
        for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
          // test an intersection that succeeds and one that fails
          expect(domain_intersection(fixt_numdom_solved(i), fixt_numdom_solved(i)), 'i=' + i + ',yes').to.equal(fixt_numdom_solved(i));
          expect(domain_intersection(fixt_numdom_solved(i), fixt_numdom_solved(SUP)), 'i=' + i + ',left, no').to.equal(fixt_dom_empty());
          expect(domain_intersection(fixt_numdom_solved(SUP), fixt_numdom_solved(i)), 'i=' + i + ',right,no').to.equal(fixt_dom_empty());
        }
      });

      it('should work with two numdoms, one solved', function() {
        expect(domain_intersection(fixt_numdom_solved(SUP), fixt_numdom_nums(0, 1)), 'SUP left').to.equal(fixt_dom_empty());
        expect(domain_intersection(fixt_numdom_nums(0, 1), fixt_numdom_solved(SUP)), 'SUP right').to.equal(fixt_dom_empty());

        for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
          expect(domain_intersection(fixt_numdom_solved(i), fixt_numdom_nums(0, 1, i)), 'i=' + i + ',left').to.equal(fixt_numdom_solved(i));
          expect(domain_intersection(fixt_numdom_nums(0, 1, i), fixt_numdom_solved(i)), 'i=' + i + ',right').to.equal(fixt_numdom_solved(i));
        }
      });

      it('should work with solved numdom and strdom', function() {
        let nums = [0, 1, 10, 100, 1000, SUP - 1, SUP];
        for (let i = 0; i < nums.length; ++i) {
          let n = nums[i];
          // check all values in nums left and right
          expect(domain_intersection(fixt_numdom_solved(n), fixt_strdom_range(0, SUP)), 'i=' + n + ',left').to.equal(fixt_numdom_solved(n));
          expect(domain_intersection(fixt_strdom_range(0, SUP), fixt_numdom_solved(n)), 'i=' + n + ',left').to.equal(fixt_numdom_solved(n));
          // check fixt_dom_empty() when strdom does not contain the needle
          expect(domain_intersection(fixt_numdom_solved(n), fixt_strdom_nums(...(nums.filter(x => x !== n)))), 'i=' + n + ',left').to.equal(fixt_dom_empty());
          expect(domain_intersection(fixt_strdom_nums(...(nums.filter(x => x !== n))), fixt_numdom_solved(n)), 'i=' + n + ',left').to.equal(fixt_dom_empty());
        }
      });
    });
  });

  describe('domain_closeGapsStr', function() {

    it('should exist', function() {
      expect(domain_str_closeGaps).to.be.a('function');
    });

    it('should requires two domains', function() {
      expect(() => domain_str_closeGaps()).to.throw('ONLY_STRDOM');
      expect(() => domain_str_closeGaps(fixt_strdom_empty(), undefined)).to.throw('ONLY_STRDOM');
      expect(() => domain_str_closeGaps(undefined, fixt_strdom_empty())).to.throw('ONLY_STRDOM');
    });

    it('should accept EMPTY_STR domains', function() {
      expect(domain_str_closeGaps(fixt_strdom_empty(), fixt_strdom_empty())).to.eql([fixt_strdom_empty(), fixt_strdom_empty()]);
    });

    it('should not change anything if left domain is empty', function() {
      let a = fixt_strdom_empty();
      let b = fixt_strdom_ranges([10, 23], [29, 38], [49, 49], [54, 68], [77, 78], [84, 100]);

      let r = domain_str_closeGaps(a, b);
      fixt_assertStrings(r[0], a);
      fixt_assertStrings(r[1], b);
      expect(r).to.eql([a, b]);
    });

    it('should not change anything if right domain is empty', function() {
      let a = fixt_strdom_ranges([10, 23], [29, 38], [49, 49], [54, 68], [77, 78], [84, 100]);
      let b = fixt_strdom_empty();

      let r = domain_str_closeGaps(a, b);
      fixt_assertStrings(r[0], a);
      fixt_assertStrings(r[1], b);
      expect(r).to.eql([a, b]);
    });

    it('should close gaps in right domain of len of only range in left domain', function() {
      let a = fixt_strdom_range(10, 20); // note: len is 11 because ranges are inclusive
      let b = fixt_strdom_ranges([100, 110], [120, 200], [300, 310], [321, 400]); // both gaps should be closed
      let c = fixt_strdom_range(10, 20);
      let d = fixt_strdom_ranges([100, 200], [300, 400]);

      let r = domain_str_closeGaps(a, b);
      fixt_assertStrings(r[0], c);
      fixt_assertStrings(r[1], d);
      expect(r).to.eql([c, d]);
    });

    it('should not close bigger gaps', function() {
      let a = fixt_strdom_range(10, 20); // note: len is 11 because ranges are inclusive
      let b = fixt_strdom_ranges([300, 310], [322, 400]); // gap is 12
      let c = fixt_strdom_range(10, 20);
      let d = fixt_strdom_ranges([300, 310], [322, 400]);

      let r = domain_str_closeGaps(a, b);
      fixt_assertStrings(r[0], c);
      fixt_assertStrings(r[1], d);
      expect(r).to.eql([c, d]);
    });

    it('should close gaps in left domain of len of only range in right domain', function() {
      let a = fixt_strdom_ranges([100, 110], [120, 200], [300, 310], [321, 400]); // both gaps should be closed
      let b = fixt_strdom_range(10, 20); // note: len is 11 because ranges are inclusive
      let c = fixt_strdom_ranges([100, 200], [300, 400]);
      let d = fixt_strdom_range(10, 20);

      let r = domain_str_closeGaps(a, b);
      fixt_assertStrings(r[0], c);
      fixt_assertStrings(r[1], d);
      expect(r).to.eql([c, d]);
    });

    it('should close only gaps that are big enough', function() {
      // left spans 11, right spans 12. only left gets closed because
      // b's len = 10 and there are no 1-place gaps allowed in csis
      // (so max gap to close is 11)
      let a = fixt_strdom_ranges([100, 110], [120, 200], [300, 310], [321, 400]);
      let b = fixt_strdom_range(10, 19); // len 10
      let c = fixt_strdom_ranges([100, 200], [300, 310], [321, 400]);
      let d = fixt_strdom_range(10, 19);

      let r = domain_str_closeGaps(a, b);
      fixt_assertStrings(r[0], c);
      fixt_assertStrings(r[1], d);
      expect(r).to.eql([c, d]);
    });

    return it('should revisit domains after one (double) cycle if min size grew', function() {
      let a = fixt_strdom_ranges([1, 2], [4, 5], [8, 900]);
      let b = fixt_strdom_ranges([1, 2], [4, 5], [8, 900]);
      let c = fixt_strdom_range(1, 900);
      let d = fixt_strdom_range(1, 900);

      // first min size is 2, so 1~2..4~5 is closed but not 4~5-8~900,
      // then min size becomes 5 and 1~5..8~900 is closed.
      // (that holds both ways) so we end up with 1~900
      let r = domain_str_closeGaps(a, b);
      fixt_assertStrings(r[0], c);
      fixt_assertStrings(r[1], d);
      expect(r).to.eql([c, d]);
    });
  });

  describe('size', function() {

    it('should exist', function() {
      expect(domain_size).to.be.a('function');
    });

    it('should require a domain', function() {
      expect(_ => domain_size()).to.throw('ONLY_NORDOM');
    });

    it('should work with empty domains', function() {
      expect(domain_size(fixt_numdom_empty())).to.eql(0);
    });

    it('should throw for empty strdoms', function() {
      expect(_ => domain_size(fixt_strdom_empty())).to.throw('empty domains are always numdoms');
    });

    describe('arrdom', function() {

      it('should count the values', function() {
        expect(domain_size(fixt_strdom_ranges([0, 1], [4, 12], [115, 117]))).to.equal(14);
      });
    });

    describe('numdom', function() {

      it('should count the bits', function() {
        expect(domain_size(fixt_numdom_nums(2, 5, 7, 9, 11, 12))).to.equal(6);
      });

      it('should count single values for each valid value', function() {
        expect(domain_size(fixt_numdom_nums(0))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(1))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(2))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(3))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(4))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(5))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(6))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(7))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(8))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(9))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(10))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(11))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(12))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(13))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(14))).to.equal(1);
        expect(domain_size(fixt_numdom_nums(15))).to.equal(1);
      });

      it('should count entire range', function() {
        expect(domain_size(fixt_numdom_range(0, 15))).to.equal(16);
      });
    });

    describe('solved numdom', function() {

      it('should always be size=1', function() {
        let nums = [0, 1, 10, 100, 1000, SUP - 1, SUP];
        for (let i = 0; i < nums.length; ++i) {
          let n = nums[i];
          expect(domain_size(fixt_numdom_solved(n)), 'n=' + n).to.equal(1);
        }
      });
    });
  });

  describe('domain_mul', function() {

    it('should exist', function() {
      expect(domain_mul).to.be.a('function');
    });

    it('should require domains', function() {
      expect(() => domain_mul()).to.throw('ONLY_NORDOM');
      expect(() => domain_mul(fixt_strdom_empty())).to.throw('empty domains are always numdoms');
      expect(() => domain_mul(null, fixt_strdom_empty())).to.throw('ONLY_NORDOM');
    });

    it('should accept empty domains', function() {

      expect(domain_mul(fixt_numdom_empty(), fixt_numdom_empty())).to.eql(fixt_numdom_empty());
      expect(domain_mul(fixt_numdom_empty(), fixt_strdom_nums(50, 60))).to.eql(fixt_numdom_empty());
      expect(domain_mul(fixt_strdom_nums(0, 1), fixt_numdom_empty())).to.eql(fixt_numdom_empty());
    });

    it('should return empty domain if one is empty', function() {

      let a = fixt_numdom_nums(0, 1, 4, 5, 7, 8, 10, 11, 12, 15, 16, 17);
      expect(domain_mul(a, fixt_numdom_empty())).to.eql(fixt_numdom_empty());
      expect(domain_mul(fixt_numdom_empty(), a)).to.eql(fixt_numdom_empty());
    });

    it('should multiply two anydoms', function() {
      let A = fixt_numdom_range(5, 10);
      let B = fixt_strdom_range(50, 60);
      let E = fixt_strdom_range(250, 600);

      expect(domain_mul(A, B)).to.eql(E);
      expect(domain_mul(B, A)).to.eql(E);
    });

    it('should multiply two strdoms', function() {
      let A = fixt_strdom_ranges([5, 10], [20, 35]);
      let B = fixt_strdom_ranges([50, 60], [110, 128]);
      let E = fixt_strdom_ranges([250, 2100], [2200, 4480]);

      expect(domain_mul(A, B)).to.eql(E);
      expect(domain_mul(B, A)).to.eql(E);
    });

    it('should multiply two numdoms', function() {
      let A = fixt_numdom_nums(0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17);
      let B = fixt_numdom_nums(0, 1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17);
      let E = fixt_strdom_ranges([0, 204], [225, 289]);

      expect(domain_mul(A, B)).to.eql(E);
      expect(domain_mul(B, A)).to.eql(E);
    });
  });

  describe('domain_divby', function() {

    it('should exist', function() {
      expect(domain_divby).to.be.a('function');
      expect(SUP).to.a('number');
    });

    it('should require domains', function() {
      expect(() => domain_divby()).to.throw('ONLY_NORDOM');
      expect(() => domain_divby(fixt_numdom_empty())).to.throw('ONLY_NORDOM');
      expect(() => domain_divby(null, fixt_numdom_empty())).to.throw('ONLY_NORDOM');
    });

    it('should accept empty domains', function() {
      expect(domain_divby(fixt_numdom_empty(), fixt_numdom_empty())).to.eql(fixt_numdom_empty());
    });

    it('should accept empty domains', function() {
      expect(domain_divby(fixt_numdom_empty(), fixt_numdom_empty())).to.eql(fixt_numdom_empty());
    });

    it('should return empty domain if one is empty', function() {
      let A = fixt_strdom_ranges([0, 1], [4, 5], [7, 8], [10, 12], [15, 117]);

      expect(domain_divby((A.slice(0)), fixt_numdom_empty())).to.eql(fixt_numdom_empty());
      expect(domain_divby(fixt_numdom_empty(), (A.slice(0)))).to.eql(fixt_numdom_empty());
    });

    it('should divide one range from another', function() {
      let A = fixt_strdom_range(500, 600);
      let B = fixt_strdom_range(5, 10);
      let E = fixt_strdom_range(50, 120);

      fixt_assertStrings(domain_divby(A, B), E);
    });

    it('should return a numdom if result is small enough', function() {
      let A = fixt_strdom_range(50, 60);
      let B = fixt_strdom_range(5, 10);
      let E = fixt_numdom_range(5, 12);

      expect(domain_divby(A, B)).to.eql(E);
    });

    it('should divide one domain from another; floored', function() {
      let A = fixt_strdom_ranges([5, 10], [20, 35]);
      let B = fixt_strdom_ranges([50, 60], [110, 128]);
      let E = fixt_numdom_solved(0);

      expect(domain_divby(A, B, FLOOR_FRACTIONS)).to.eql(E); // would be [0.0390625, 0.7] which gets floored to [0, 0.7] so [0,0]
    });

    it('should divide one domain from another (2); floored', function() {
      let A = fixt_numdom_nums(1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17);
      let B = fixt_numdom_nums(1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17);
      let E = fixt_numdom_nums(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17);

      expect(domain_divby(A, B, FLOOR_FRACTIONS)).to.eql(E);
    });

    it('should divide one domain from another; integer', function() {
      let A = fixt_strdom_ranges([5, 10], [20, 35]);
      let B = fixt_strdom_ranges([50, 60], [110, 128]);
      let E = fixt_numdom_empty();

      expect(domain_divby(A, B, CEIL_FRACTIONS)).to.eql(E); // would be [0.0390625, 0.7] but there are no ints in between that so its empty
    });

    it('should divide one domain from another (2); integer', function() {
      let A = fixt_numdom_nums(1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17);
      let B = fixt_numdom_nums(1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17);
      let E = fixt_numdom_nums(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17);

      expect(domain_divby(A, B, CEIL_FRACTIONS)).to.eql(E);
    });

    it('divide by zero should blow up', function() {
      let A = fixt_strdom_ranges([0, 1], [4, 12], [15, 117]);
      let B = fixt_strdom_ranges([0, 1], [4, 12], [15, 117]);
      let E = fixt_strdom_ranges([0, SUP]);

      fixt_assertStrings(domain_divby(A, B), E);
    });

    describe('simple examples with strdom result', function() {
      function doit(a, b, c) {
        it(`should pass [${a}] / [${b}] = [${c}]`, function() {
          a = domain_arrToSmallest(a);
          b = domain_arrToSmallest(b);
          c = domain_arrToSmallest(c);

          fixt_domainEql(domain_divby(a, b), c);
        });
      }

      doit([5, 10], [0, 1], [5, SUP]);
      doit([5000, 5000], [10, 10], [500, 500]);
      doit([SUP, SUP], [10, 10], [SUP / 10, SUP / 10]);
    });

    describe('simple examples with numdom result', function() {
      function doit(a, b, c) {
        it(`should pass [${a}] / [${b}] = [${c}]`, function() {
          a = domain_arrToSmallest(a);
          b = domain_arrToSmallest(b);
          c = domain_arrToSmallest(c);

          expect(domain_divby(a, b)).to.eql(c);
        });
      }

      doit([50, 60], [5, 5], [10, 12]);
      doit([50, 50, 60, 60], [5, 5], [10, 10, 12, 12]);
      doit([50, 60], [5, 5, 10, 10], [5, 6, 10, 12]);
      doit([50, 60], [5, 10], [5, 12]);
      doit([0, 0], [5, 10], [0, 0]);
      doit([0, 1], [5, 10], [0, 0]); // because all results are <1
      doit([0, 10], [2, 2], [0, 5]);
      doit([5, 10], [0, 0], []);
    });
  });

  describe('domain_isSolved', function() {

    it('should exist', function() {
      expect(domain_isSolved).to.be.a('function');
    });

    describe('strdom', function() {

      it('should throw for solved strdoms', function() {
        expect(_ => domain_isSolved(fixt_strdom_value(SUP))).to.throw('EXPECTING_STRDOM_NOT_TO_BE_SOLVED');
        expect(_ => domain_isSolved(fixt_strdom_value(SUP - 1))).to.throw('EXPECTING_STRDOM_NOT_TO_BE_SOLVED');
        expect(_ => domain_isSolved(fixt_strdom_value(SUP - 18))).to.throw('EXPECTING_STRDOM_NOT_TO_BE_SOLVED');
      });

      it('should return false if a domain is empty', function() {
        expect(domain_isSolved(fixt_numdom_empty())).to.equal(false);
      });

      it('should return false if a domain covers more than one value', function() {
        expect(domain_isSolved(fixt_strdom_range(90, 91))).to.equal(false);
        expect(domain_isSolved(fixt_strdom_range(918, 920))).to.equal(false);
        expect(domain_isSolved(fixt_strdom_range(SUP - 50, SUP))).to.equal(false);
        expect(domain_isSolved(fixt_strdom_ranges([SUP - 10, SUP - 5], [SUP - 1, SUP]))).to.equal(false);
        expect(domain_isSolved(fixt_strdom_ranges([0, 1], [5, SUP]))).to.equal(false);
        expect(domain_isSolved(fixt_strdom_ranges([5, 8], [50, SUP]))).to.equal(false);
        expect(domain_isSolved(fixt_strdom_ranges([5, 8], [23, 34], [50, SUP]))).to.equal(false);
      });
    });

    describe('numdom', function() {

      it('should reject numdoms that are actually soldoms', function() {
        for (let i = 0; i <= SMALL_MAX_NUM; ++i) {
          expect(_ => domain_isSolved(fixt_numdom_nums(i))).to.throw('EXPECTING_SOLVED_NUMDOM_TO_BE_SOLDOM');
        }
      });

      it('should see double values', function() {
        expect(domain_isSolved(fixt_numdom_nums(0, 1))).to.equal(false);
        expect(domain_isSolved(fixt_numdom_nums(0, 10))).to.equal(false);
        expect(domain_isSolved(fixt_numdom_nums(0, 15))).to.equal(false);
        expect(domain_isSolved(fixt_numdom_nums(10, 15))).to.equal(false);
        expect(domain_isSolved(fixt_numdom_nums(4, 6))).to.equal(false);
      });

      it('should see multiple values', function() {
        expect(domain_isSolved(fixt_numdom_nums(2, 5, 7, 9, 11, 12))).to.equal(false);
      });

      it('should return false for entire range', function() {
        expect(domain_isSolved(fixt_numdom_range(0, 15))).to.equal(false);
      });

      it('should return false for empty', function() {
        expect(domain_isSolved(fixt_numdom_empty())).to.equal(false);
      });
    });
  });

  describe('domain_sortByRange', function() {

    it('should exist', function() {
      expect(_domain_str_quickSortRanges).to.be.a('function');
    });

    it('should allow EMPTY_STR domains', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_empty())).to.eql(fixt_strdom_empty());
    });

    it('should return the sorted strdom', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_range(0, 1))).to.equal(fixt_strdom_range(0, 1));
    });

    it('should keep pairs sorted', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_ranges([0, 1], [2, 3]))).to.eql(fixt_strdom_ranges([0, 1], [2, 3]));
    });

    it('should sort range pairs by lo', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_ranges([2, 3], [0, 1]))).to.eql(fixt_strdom_ranges([0, 1], [2, 3]));
    });

    it('should sort range pairs by hi if lo is equal', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_ranges([2, 3], [2, 1]))).to.eql(fixt_strdom_ranges([2, 1], [2, 3]));
    });

    it('should not change domain if already sorted even when lo is equal', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_ranges([2, 3], [2, 6]))).to.eql(fixt_strdom_ranges([2, 3], [2, 6]));
    });

    it('should accept solved domains', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_ranges([50, 50]))).to.eql(fixt_strdom_ranges([50, 50]));
    });

    it('should allow single value ranges', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_ranges([0, 1], [5, 10], [3, 3]))).to.eql(fixt_strdom_ranges([0, 1], [3, 3], [5, 10]));
    });

    it('should work with 4 ranges', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_ranges([20, 30], [0, 1], [5, 10], [3, 3]))).to.eql(fixt_strdom_ranges([0, 1], [3, 3], [5, 10], [20, 30]));
    });

    it('should work with 5 ranges', function() {
      expect(_domain_str_quickSortRanges(fixt_strdom_ranges([20, 30], [0, 1], [18, 19], [5, 10], [3, 3]))).to.eql(fixt_strdom_ranges([0, 1], [3, 3], [5, 10], [18, 19], [20, 30]));
    });

    it('should work with 50 ranges', function() {
      // arr = []
      // for i in [0...50]
      //   arr.push (x=Mathf.floor(Math.random() * 100)), x + Math.floor(Math.random() * 100)

      let arr = [61, 104, 78, 130, 6, 92, 34, 51, 86, 109, 0, 32, 39, 62, 91, 96, 49, 134, 91, 163, 42, 105, 22, 78, 78, 133, 13, 111, 49, 141, 41, 134, 34, 57, 19, 27, 25, 64, 18, 75, 75, 151, 88, 127, 30, 74, 11, 59, 84, 107, 54, 91, 3, 85, 97, 167, 55, 103, 81, 174, 32, 55, 28, 87, 42, 69, 31, 118, 99, 137, 12, 94, 31, 98, 69, 162, 52, 89, 85, 126, 93, 160, 20, 53, 82, 88, 8, 46, 29, 75, 97, 146, 13, 35, 51, 125, 5, 18, 88, 178];
      let out = [0, 32, 3, 85, 5, 18, 6, 92, 8, 46, 11, 59, 12, 94, 13, 35, 13, 111, 18, 75, 19, 27, 20, 53, 22, 78, 25, 64, 28, 87, 29, 75, 30, 74, 31, 98, 31, 118, 32, 55, 34, 51, 34, 57, 39, 62, 41, 134, 42, 69, 42, 105, 49, 134, 49, 141, 51, 125, 52, 89, 54, 91, 55, 103, 61, 104, 69, 162, 75, 151, 78, 130, 78, 133, 81, 174, 82, 88, 84, 107, 85, 126, 86, 109, 88, 127, 88, 178, 91, 96, 91, 163, 93, 160, 97, 146, 97, 167, 99, 137];


      expect(_domain_str_quickSortRanges(domain_arrToSmallest(arr))).to.eql(domain_arrToSmallest(out));
    });

    it('should work with 51 ranges', function() {

      let arr = [4, 13, 67, 101, 38, 70, 99, 144, 65, 126, 45, 110, 86, 183, 73, 134, 84, 112, 64, 83, 63, 90, 18, 64, 52, 116, 87, 134, 35, 125, 13, 94, 23, 30, 97, 117, 64, 82, 77, 134, 61, 72, 63, 76, 38, 111, 33, 96, 5, 98, 5, 50, 52, 121, 18, 30, 70, 155, 8, 56, 4, 15, 21, 98, 95, 166, 83, 148, 33, 62, 0, 72, 57, 107, 60, 133, 66, 163, 48, 130, 90, 163, 56, 123, 14, 26, 90, 92, 9, 64, 4, 4, 17, 22, 9, 78, 25, 66, 87, 95, 64, 145];
      let out = [0, 72, 4, 4, 4, 13, 4, 15, 5, 50, 5, 98, 8, 56, 9, 64, 9, 78, 13, 94, 14, 26, 17, 22, 18, 30, 18, 64, 21, 98, 23, 30, 25, 66, 33, 62, 33, 96, 35, 125, 38, 70, 38, 111, 45, 110, 48, 130, 52, 116, 52, 121, 56, 123, 57, 107, 60, 133, 61, 72, 63, 76, 63, 90, 64, 82, 64, 83, 64, 145, 65, 126, 66, 163, 67, 101, 70, 155, 73, 134, 77, 134, 83, 148, 84, 112, 86, 183, 87, 95, 87, 134, 90, 92, 90, 163, 95, 166, 97, 117, 99, 144];

      expect(_domain_str_quickSortRanges(domain_arrToSmallest(arr))).to.eql(domain_arrToSmallest(out));
    });

    it('should work with 250 ranges', function() {
      // this should be very fast.

      let arr = [56, 103, 54, 76, 81, 144, 30, 103, 38, 50, 3, 25, 37, 80, 2, 44, 67, 82, 80, 88, 37, 67, 25, 76, 47, 105, 16, 97, 46, 78, 21, 111, 14, 113, 47, 84, 55, 63, 15, 19, 54, 75, 40, 57, 34, 85, 62, 71, 16, 52, 70, 152, 1, 42, 86, 126, 97, 109, 9, 38, 91, 140, 27, 48, 54, 115, 3, 18, 1, 35, 17, 66, 38, 65, 33, 123, 7, 70, 68, 150, 64, 86, 77, 167, 73, 159, 0, 97, 76, 155, 2, 50, 48, 116, 52, 136, 31, 43, 65, 163, 20, 41, 70, 146, 83, 120, 79, 135, 9, 98, 16, 67, 55, 144, 0, 26, 70, 97, 9, 67, 39, 98, 14, 102, 67, 89, 44, 140, 97, 132, 90, 99, 61, 108, 71, 126, 31, 72, 17, 26, 98, 162, 32, 125, 51, 115, 96, 176, 39, 83, 77, 147, 20, 24, 18, 26, 12, 17, 45, 110, 57, 74, 28, 49, 7, 11, 32, 43, 43, 50, 5, 70, 42, 139, 81, 83, 20, 33, 77, 107, 52, 101, 36, 78, 49, 74, 90, 118, 36, 74, 4, 87, 62, 109, 15, 60, 11, 34, 85, 184, 27, 115, 2, 52, 37, 102, 40, 132, 87, 117, 94, 163, 48, 70, 50, 139, 97, 137, 31, 31, 42, 78, 28, 29, 70, 147, 8, 87, 87, 140, 59, 142, 43, 110, 3, 76, 39, 59, 57, 137, 54, 128, 72, 82, 66, 81, 30, 39, 69, 122, 5, 102, 81, 170, 94, 102, 25, 31, 95, 190, 66, 107, 1, 48, 54, 81, 60, 117, 2, 69, 31, 42, 90, 92, 13, 37, 58, 94, 83, 160, 96, 145, 59, 80, 27, 35, 60, 71, 57, 102, 93, 115, 43, 106, 62, 72, 74, 131, 93, 101, 32, 51, 80, 139, 17, 87, 9, 11, 2, 71, 57, 59, 38, 71, 81, 153, 59, 136, 65, 94, 23, 106, 77, 139, 1, 91, 27, 44, 96, 173, 56, 139, 44, 119, 85, 132, 26, 33, 63, 80, 73, 125, 69, 98, 6, 34, 27, 53, 74, 160, 46, 108, 88, 174, 97, 154, 7, 90, 89, 133, 1, 46, 76, 161, 85, 110, 31, 100, 97, 164, 66, 93, 71, 156, 1, 70, 99, 123, 84, 126, 2, 17, 65, 163, 68, 102, 5, 71, 95, 97, 28, 49, 34, 62, 22, 47, 76, 145, 0, 65, 38, 117, 95, 161, 46, 105, 93, 130, 48, 48, 90, 180, 67, 115, 21, 54, 18, 111, 98, 107, 12, 38, 0, 92, 7, 66, 25, 57, 29, 65, 9, 81, 5, 14, 3, 40, 6, 102, 65, 92, 17, 101, 11, 98, 55, 110, 85, 168, 51, 90, 38, 99, 75, 143, 84, 139, 85, 114, 41, 59, 9, 55, 77, 166, 25, 107, 40, 125, 72, 160, 53, 90, 0, 50, 28, 28, 51, 140, 3, 24, 85, 154, 30, 42, 62, 106, 46, 89, 4, 65, 45, 62, 92, 175, 23, 51, 32, 100, 37, 102];
      let out = [0, 26, 0, 50, 0, 65, 0, 92, 0, 97, 1, 35, 1, 42, 1, 46, 1, 48, 1, 70, 1, 91, 2, 17, 2, 44, 2, 50, 2, 52, 2, 69, 2, 71, 3, 18, 3, 24, 3, 25, 3, 40, 3, 76, 4, 65, 4, 87, 5, 14, 5, 70, 5, 71, 5, 102, 6, 34, 6, 102, 7, 11, 7, 66, 7, 70, 7, 90, 8, 87, 9, 11, 9, 38, 9, 55, 9, 67, 9, 81, 9, 98, 11, 34, 11, 98, 12, 17, 12, 38, 13, 37, 14, 102, 14, 113, 15, 19, 15, 60, 16, 52, 16, 67, 16, 97, 17, 26, 17, 66, 17, 87, 17, 101, 18, 26, 18, 111, 20, 24, 20, 33, 20, 41, 21, 54, 21, 111, 22, 47, 23, 51, 23, 106, 25, 31, 25, 57, 25, 76, 25, 107, 26, 33, 27, 35, 27, 44, 27, 48, 27, 53, 27, 115, 28, 28, 28, 29, 28, 49, 28, 49, 29, 65, 30, 39, 30, 42, 30, 103, 31, 31, 31, 42, 31, 43, 31, 72, 31, 100, 32, 43, 32, 51, 32, 100, 32, 125, 33, 123, 34, 62, 34, 85, 36, 74, 36, 78, 37, 67, 37, 80, 37, 102, 37, 102, 38, 50, 38, 65, 38, 71, 38, 99, 38, 117, 39, 59, 39, 83, 39, 98, 40, 57, 40, 125, 40, 132, 41, 59, 42, 78, 42, 139, 43, 50, 43, 106, 43, 110, 44, 119, 44, 140, 45, 62, 45, 110, 46, 78, 46, 89, 46, 105, 46, 108, 47, 84, 47, 105, 48, 48, 48, 70, 48, 116, 49, 74, 50, 139, 51, 90, 51, 115, 51, 140, 52, 101, 52, 136, 53, 90, 54, 75, 54, 76, 54, 81, 54, 115, 54, 128, 55, 63, 55, 110, 55, 144, 56, 103, 56, 139, 57, 59, 57, 74, 57, 102, 57, 137, 58, 94, 59, 80, 59, 136, 59, 142, 60, 71, 60, 117, 61, 108, 62, 71, 62, 72, 62, 106, 62, 109, 63, 80, 64, 86, 65, 92, 65, 94, 65, 163, 65, 163, 66, 81, 66, 93, 66, 107, 67, 82, 67, 89, 67, 115, 68, 102, 68, 150, 69, 98, 69, 122, 70, 97, 70, 146, 70, 147, 70, 152, 71, 126, 71, 156, 72, 82, 72, 160, 73, 125, 73, 159, 74, 131, 74, 160, 75, 143, 76, 145, 76, 155, 76, 161, 77, 107, 77, 139, 77, 147, 77, 166, 77, 167, 79, 135, 80, 88, 80, 139, 81, 83, 81, 144, 81, 153, 81, 170, 83, 120, 83, 160, 84, 126, 84, 139, 85, 110, 85, 114, 85, 132, 85, 154, 85, 168, 85, 184, 86, 126, 87, 117, 87, 140, 88, 174, 89, 133, 90, 92, 90, 99, 90, 118, 90, 180, 91, 140, 92, 175, 93, 101, 93, 115, 93, 130, 94, 102, 94, 163, 95, 97, 95, 161, 95, 190, 96, 145, 96, 173, 96, 176, 97, 109, 97, 132, 97, 137, 97, 154, 97, 164, 98, 107, 98, 162, 99, 123];

      expect(_domain_str_quickSortRanges(domain_arrToSmallest(arr))).to.eql(domain_arrToSmallest(out));
    });
  });

  describe('domain_removeGte', function() {

    it('should exist', function() {
      expect(domain_removeGte).to.be.a('function');
    });

    it('should accept an empty domain', function() {
      expect(domain_removeGte(fixt_numdom_empty(), 5)).to.eql(fixt_numdom_empty());
    });

    // case: v=5
    // 012 456 => 012 4
    // 012 45  => 012 4
    // 012 567 => 012
    // 012 5   => 012
    // 012 678 => 012
    // 5       => empty
    // 012     => NONE
    // 678     => empty

    describe('strdom', function() {

      function gteTest(domain, value, expected) {
        it(`should gte ${domain__debug(domain)} >= ${value} -> ${domain__debug(expected)}`, function() {
          let clone = fixt_dom_clone(domain);
          let result = domain_removeGte(domain, value);

          expect(result).to.eql(expected);
          expect(domain).to.eql(clone);
        });
      }

      gteTest(fixt_strdom_ranges([100, 110]), 105, fixt_strdom_ranges([100, 104]));
      gteTest(fixt_strdom_ranges([100, 102], [104, 106]), 105, fixt_strdom_ranges([100, 102], [104, 104]));
      gteTest(fixt_strdom_ranges([100, 102], [104, 105]), 105, fixt_strdom_ranges([100, 102], [104, 104]));
      gteTest(fixt_strdom_ranges([100, 102], [105, 107]), 105, fixt_strdom_ranges([100, 102]));
      gteTest(fixt_strdom_ranges([100, 102], [105, 105]), 105, fixt_strdom_ranges([100, 102]));
      gteTest(fixt_strdom_ranges([100, 102], [106, 108]), 105, fixt_strdom_ranges([100, 102]));
      gteTest(fixt_strdom_ranges([105, 105]), 105, fixt_numdom_empty());
      gteTest(fixt_strdom_ranges([100, 102]), 105, fixt_strdom_ranges([100, 102]));
      gteTest(fixt_strdom_ranges([106, 108]), 105, fixt_numdom_empty());
      gteTest(fixt_strdom_range(0, 1000), SMALL_MAX_NUM, fixt_numdom_range(0, SMALL_MAX_NUM - 1));
      gteTest(fixt_strdom_range(0, 1000), SMALL_MAX_NUM + 1, fixt_numdom_range(0, SMALL_MAX_NUM));
      gteTest(fixt_strdom_range(5, 50), 31, fixt_numdom_range(5, 30));
      gteTest(fixt_strdom_range(500, 501), 501, fixt_numdom_solved(500));
      gteTest(fixt_strdom_nums(500, 900), 900, fixt_numdom_solved(500));
      gteTest(fixt_strdom_nums(500, 900, 901), 900, fixt_numdom_solved(500));
    });

    describe('numdom', function() {

      function gteTest(domain, value, expected) {
        it(`should gte [${domain}] >= ${value} -> [${expected}]`, function() {
          let clone = fixt_dom_clone(domain);
          let result = domain_removeGte(domain, value);

          expect(result).to.eql(expected);
          expect(domain).to.eql(clone);
        });
      }

      gteTest(fixt_numdom_nums(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10), 5, fixt_numdom_nums(0, 1, 2, 3, 4));
      gteTest(fixt_numdom_nums(0, 1, 2, 4, 5, 6), 5, fixt_numdom_nums(0, 1, 2, 4));
      gteTest(fixt_numdom_nums(0, 1, 2, 4, 5), 5, fixt_numdom_nums(0, 1, 2, 4));
      gteTest(fixt_numdom_nums(0, 1, 2, 5, 6, 7), 5, fixt_numdom_nums(0, 1, 2));
      gteTest(fixt_numdom_nums(0, 1, 2, 5), 5, fixt_numdom_nums(0, 1, 2));
      gteTest(fixt_numdom_nums(0, 1, 2, 6, 7, 8), 5, fixt_numdom_nums(0, 1, 2));
      gteTest(fixt_numdom_nums(5), 5, fixt_numdom_empty());
      gteTest(fixt_numdom_nums(0, 1, 2), 5, fixt_numdom_nums(0, 1, 2));
      gteTest(fixt_numdom_nums(6, 7, 8), 5, fixt_numdom_empty());
      gteTest(fixt_numdom_nums(5, 6), 6, fixt_numdom_solved(5));
      gteTest(fixt_numdom_solved(20), 21, fixt_numdom_solved(20));
      gteTest(fixt_numdom_solved(10), 10, fixt_numdom_empty());

      it('should improve code coverage', function() {
        let numdom = fixt_numdom_range(0, 30);
        for (let i = 0; i <= 50; ++i) {
          let v = domain_removeGte(numdom, i);
          expect(v).to.be.a('number');
        }
      });
    });

    describe('solved numdoms', function() {

      it('should work with solved domains', function() {
        let nums = [0, 1, 10, 100, 1000, SUP - 1, SUP];
        for (let i = 0; i < nums.length; ++i) {
          let n = nums[i];
          // check with needle being lt, eq, gt
          let lt = n - 1;
          let eq = n;
          let gt = n + 1;

          if (lt >= 0) expect(domain_removeGte(fixt_numdom_solved(n), lt), 'n=' + n + ',lt').to.equal(fixt_dom_empty());
          if (eq >= 0 && eq <= SUP) expect(domain_removeGte(fixt_numdom_solved(n), eq), 'n=' + n + ',eq').to.equal(fixt_dom_empty());
          if (gt <= SUP) expect(domain_removeGte(fixt_numdom_solved(n), gt), 'n=' + n + ',gt').to.equal(fixt_numdom_solved(n));
        }
      });
    });
  });

  describe('domain_toArr', function() {

    it('should exist', function() {
      expect(domain_toArr).to.be.a('function');
    });

    it('should work with a bool', function() {
      expect(domain_toArr(fixt_strdom_range(0, 1))).to.eql(fixt_arrdom_range(0, 1));
      expect(domain_toArr(fixt_numdom_nums(0, 1))).to.eql(fixt_arrdom_range(0, 1));
      expect(domain_toArr(fixt_arrdom_range(0, 1))).to.eql(fixt_arrdom_range(0, 1));
    });

    it('should clone the arr with param', function() {
      let A = fixt_arrdom_range(0, 1);

      expect(domain_toArr(A, true)).to.not.equal(A);
      expect(domain_toArr(A, true)).to.eql(A);
      expect(domain_toArr(A, false)).to.equal(A);
    });
  });

  describe('domain_removeLte', function() {

    it('should exist', function() {
      expect(domain_removeLte).to.be.a('function');
    });

    it('should accept an empty domain', function() {
      expect(() => domain_removeLte(fixt_numdom_empty(), 5)).not.to.throw();
    });

    // case: v=5
    // 456 89 => 6 89
    // 45  89 => 89
    // 567 9  => 67 9
    // 5   89 => 89
    // 5      => empty
    // 678    => NONE
    // 012    => empty

    describe('strdom', function() {

      function lteTest(domain, value, expected) {
        it(`should lte ${domain__debug(domain)} <= ${value} -> ${domain__debug(expected)}`, function() {
          let clone = fixt_dom_clone(domain);
          let result = domain_removeLte(domain, value);

          expect(result).to.eql(expected);
          expect(domain).to.eql(clone);
        });
      }

      lteTest(fixt_strdom_ranges([100, 110]), 105, fixt_strdom_ranges([106, 110]));
      lteTest(fixt_strdom_ranges([104, 106], [108, 109]), 105, fixt_strdom_ranges([106, 106], [108, 109]));
      lteTest(fixt_strdom_ranges([104, 105], [108, 109]), 105, fixt_strdom_ranges([108, 109]));
      lteTest(fixt_strdom_ranges([105, 107], [109, 109]), 105, fixt_strdom_ranges([106, 107], [109, 109]));
      lteTest(fixt_strdom_ranges([105, 105], [108, 109]), 105, fixt_strdom_ranges([108, 109]));
      lteTest(fixt_strdom_ranges([105, 105]), 105, fixt_dom_empty());
      lteTest(fixt_strdom_ranges([106, 108]), 105, fixt_strdom_ranges([106, 108]));
      lteTest(fixt_strdom_ranges([100, 104]), 105, fixt_dom_empty());
      lteTest(fixt_strdom_ranges([0, SMALL_MAX_NUM]), 10, fixt_numdom_range(11, SMALL_MAX_NUM));
      lteTest(fixt_strdom_range(500, 501), 500, fixt_numdom_solved(501)); // should be solved, later
      lteTest(fixt_strdom_nums(500, 900), 500, fixt_numdom_solved(900));
      lteTest(fixt_strdom_nums(500, 900, 901), 900, fixt_numdom_solved(901));
    });

    describe('numdom', function() {

      function lteTest(domain, value, expected) {
        it(`should lte [${domain}] <= ${value} -> [${expected}]`, function() {
          let clone = fixt_dom_clone(domain);
          let result = domain_removeLte(domain, value);

          expect(result, domain_toArr(result) + ' -> ' + domain_toArr(expected)).to.eql(expected);
          expect(domain).to.eql(clone);
        });
      }

      lteTest(fixt_numdom_nums(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10), 5, fixt_numdom_nums(6, 7, 8, 9, 10));
      lteTest(fixt_numdom_nums(4, 5, 6, 8, 9), 5, fixt_numdom_nums(6, 8, 9));
      lteTest(fixt_numdom_nums(4, 5, 8, 9), 5, fixt_numdom_nums(8, 9));
      lteTest(fixt_numdom_nums(5, 6, 7, 9), 5, fixt_numdom_nums(6, 7, 9));
      lteTest(fixt_numdom_nums(5, 8, 9), 5, fixt_numdom_nums(8, 9));
      lteTest(fixt_numdom_nums(5), 5, fixt_numdom_empty());
      lteTest(fixt_numdom_nums(6, 7, 8), 5, fixt_numdom_nums(6, 7, 8));
      lteTest(fixt_numdom_nums(0, 1, 2, 3, 4), 5, fixt_numdom_empty());
      lteTest(fixt_numdom_nums(5, 6), 5, fixt_numdom_solved(6));
      lteTest(fixt_numdom_solved(20), 19, fixt_numdom_solved(20));
      lteTest(fixt_numdom_solved(10), 10, fixt_numdom_empty());

      it('should improve code coverage', function() {
        let numdom = fixt_numdom_range(0, 30);
        for (let i = 0; i <= 50; ++i) {
          let v = domain_removeLte(numdom, i);
          expect(v).to.be.a('number');
        }
      });
    });

    describe('solved numdoms', function() {

      it('should work with solved domains', function() {
        let nums = [0, 1, 10, 100, 1000, SUP - 1, SUP];
        for (let i = 0; i < nums.length; ++i) {
          let n = nums[i];
          // check with needle being lt, eq, gt
          let lt = n - 1;
          let eq = n;
          let gt = n + 1;

          if (lt >= 0) expect(domain_removeLte(fixt_numdom_solved(n), lt), 'n=' + n + ',lt').to.equal(fixt_numdom_solved(n));
          if (eq >= 0 && eq <= SUP) expect(domain_removeLte(fixt_numdom_solved(n), eq), 'n=' + n + ',eq').to.equal(fixt_dom_empty());
          if (gt <= SUP) expect(domain_removeLte(fixt_numdom_solved(n), gt), 'n=' + n + ',gt').to.equal(fixt_dom_empty());
        }
      });
    });
  });

  describe('domain_numToStr and domain_toList and domain_numstr and domain_fromList', function() {

    describe('numdom', function() {

      it('should work with all permutations', function() {
        // 27 is an arbitrary number (ok, prime) to not waste toooo much time on this
        for (let bitdom = 0; bitdom <= 0xffff; bitdom += 27) {
          let list = [];
          if (bitdom & 1 << 0) list.push(0);
          if (bitdom & 1 << 1) list.push(1);
          if (bitdom & 1 << 2) list.push(2);
          if (bitdom & 1 << 3) list.push(3);
          if (bitdom & 1 << 4) list.push(4);
          if (bitdom & 1 << 5) list.push(5);
          if (bitdom & 1 << 6) list.push(6);
          if (bitdom & 1 << 7) list.push(7);
          if (bitdom & 1 << 8) list.push(8);
          if (bitdom & 1 << 9) list.push(9);
          if (bitdom & 1 << 10) list.push(10);
          if (bitdom & 1 << 11) list.push(11);
          if (bitdom & 1 << 12) list.push(12);
          if (bitdom & 1 << 13) list.push(13);
          if (bitdom & 1 << 14) list.push(14);
          if (bitdom & 1 << 15) list.push(15);
          if (bitdom & 1 << 16) list.push(16);
          if (bitdom & 1 << 17) list.push(17);
          if (bitdom & 1 << 18) list.push(18);
          if (bitdom & 1 << 19) list.push(19);
          if (bitdom & 1 << 20) list.push(20);
          if (bitdom & 1 << 21) list.push(21);
          if (bitdom & 1 << 22) list.push(22);
          if (bitdom & 1 << 23) list.push(23);
          if (bitdom & 1 << 24) list.push(24);
          if (bitdom & 1 << 25) list.push(25);
          if (bitdom & 1 << 26) list.push(26);
          if (bitdom & 1 << 27) list.push(27);
          if (bitdom & 1 << 28) list.push(28);
          if (bitdom & 1 << 29) list.push(29);
          if (bitdom & 1 << 30) list.push(30);

          let expNum = fixt_numdom_nums(...list);
          let expStr = fixt_strdom_nums(...list) || EMPTY;

          let outFromFlags = domain_numToStr(bitdom) || EMPTY;
          let outToList = domain_toList(bitdom);
          let outSmallest = domain_toSmallest(expStr);
          let outFromList = fixt_arrdom_nums(...list);

          let is = 'i=' + bitdom;
          expect(bitdom, is).to.eql(expNum); // more of a confirmation that the specs are proper
          expect(outFromFlags, is).to.eql(expStr);
          expect(outToList, is).to.eql(list);
          expect(outSmallest, is).to.eql(bitdom);
          expect(outFromList, is).to.eql(domain_toArr(bitdom));
        }
      });
    });
  });

  describe('domain_any__debug', function() {

    it('should work with all domain representations', function() {
      domain__debug(fixt_numdom_nums(0, 2, 15));
      domain__debug(fixt_strdom_nums(0, 2, 15, 200, SUP));
      domain__debug(fixt_arrdom_nums(0, 2, 15, 200));
      domain__debug(fixt_numdom_solved(100));
    });
  });

  describe('domain_isZero', function() {

    it('should return true if the domain is zero', function() {
      expect(domain_isZero(fixt_dom_nums(0))).to.eql(true);
    });

    it('should return false if the domain is not zero', function() {
      expect(domain_isZero(fixt_dom_nums(0, 1))).to.eql(false);
      expect(domain_isZero(fixt_dom_nums(0, 1, 2, 3, 4, 5))).to.eql(false);
    });

    it('should return false if the domain has no zero', function() {
      expect(domain_isZero(fixt_dom_nums(1))).to.eql(false);
      expect(domain_isZero(fixt_dom_nums(1, 2, 3))).to.eql(false);
    });

    it('should return false if the domain is empty', function() {
      expect(domain_isZero(fixt_dom_empty())).to.eql(false);
    });
  });

  describe('domain_hasNoZero', function() {

    it('should return false if the domain is zero', function() {
      expect(domain_hasNoZero(fixt_dom_nums(0))).to.eql(false);
    });

    it('should return false if the domain is has zero', function() {
      expect(domain_hasNoZero(fixt_dom_nums(0, 1))).to.eql(false);
      expect(domain_hasNoZero(fixt_dom_nums(0, 1, 2, 3, 4, 5))).to.eql(false);
    });

    it('should return true if the domain has no zero', function() {
      expect(domain_hasNoZero(fixt_dom_nums(1))).to.eql(true);
      expect(domain_hasNoZero(fixt_dom_nums(1, 2, 3))).to.eql(true);
    });

    it('should return true if the domain is empty', function() {
      expect(domain_hasNoZero(fixt_dom_empty())).to.eql(true);
    });
  });

  describe('domain_resolveAsBooly', function() {

    it('should remove the zero if result is true', function() {
      expect(domain_resolveAsBooly(fixt_dom_solved(0), true)).to.eql(fixt_dom_empty());
      expect(domain_resolveAsBooly(fixt_dom_range(0, 10), true)).to.eql(fixt_dom_range(1, 10));
      expect(domain_resolveAsBooly(fixt_dom_range(1, 10), true)).to.eql(fixt_dom_range(1, 10));
      expect(domain_resolveAsBooly(fixt_dom_empty(), true)).to.eql(fixt_dom_empty());
    });

    it('should remove the nonzeroes if result is false', function() {
      expect(domain_resolveAsBooly(fixt_dom_solved(0), false)).to.eql(fixt_dom_solved(0));
      expect(domain_resolveAsBooly(fixt_dom_range(0, 10), false)).to.eql(fixt_dom_solved(0));
      expect(domain_resolveAsBooly(fixt_dom_range(1, 10), false)).to.eql(fixt_dom_empty());
      expect(domain_resolveAsBooly(fixt_dom_empty(), false)).to.eql(fixt_dom_empty());
    });
  });
});
