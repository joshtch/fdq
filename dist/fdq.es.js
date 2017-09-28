function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _defineProperty$1(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty$1(target, key, source[key]);
    });
  }

  return target;
} // FDlib Helpers


var INSPECT = typeof require === 'function' ? function (arg) {
  return require('util').inspect(arg, {
    showHidden: false,
    depth: 100
  }).replace(/\n ?/g, ' ');
} : function (o) {
  return "" + o;
};
var TERM = console;

function setTerm(newTerm) {
  TERM = _objectSpread$1({}, TERM, newTerm);
}

function getTerm() {
  return TERM;
}
// All explicit throws should use this function. Also helps with tooling
// later, catching and reporting explicit throws and whatnot.


function THROW() {
  for (var _len = arguments.length, msg = new Array(_len), _key = 0; _key < _len; _key++) {
    msg[_key] = arguments[_key];
  }

  throw new Error(msg.join(': '));
}

var SUB = 0; // WARNING: don't change this. It's mostly a magic number thing.

var SUP = 100000000; // Don't let this max exceed 30 bits or stuff will break

var NOT_FOUND = -1; // Different from NOT_FOUND in that NOT_FOUND must be -1 because of the indexOf api
// while NO_SUCH_VALUE must be a value that cannot be a legal domain value (<SUB or >SUP)

var NO_SUCH_VALUE = Math.min(0, SUB) - 1; // Make sure NO_SUCH_VALUE is a value that may be neither valid in a domain nor >=0

var ARR_RANGE_SIZE = 2; // Magic number

var SMALL_MAX_NUM = 30; // There are SMALL_MAX_NUM flags. if they are all on, this is the number value
// (oh and; 1<<31 is negative. >>>0 makes it unsigned. this is why 30 is max.)

var SOLVED_FLAG = 1 << 31 >>> 0; // The >>> makes it unsigned, we dont really need it but it may help perf a little (unsigned vs signed)

var $STABLE = 0;
var $CHANGED = 1;
var $SOLVED = 2;
var $REJECTED = 3;

if (process.env.NODE_ENV !== 'production') {
  if (NOT_FOUND !== NO_SUCH_VALUE) {
    var _msg = 'not found constants NOT_FOUND and NO_SUCH_VALUE need to be equal to prevent confusion bugs';
    getTerm().error(_msg);
    THROW(_msg);
  }
} // Assert helper library. This should not be in production


function ASSERT(bool, msg) {
  if (msg === void 0) {
    msg = '';
  }

  if (process.env.NODE_ENV !== 'production') {
    if (bool) {
      return;
    }

    if (!msg) msg = '(no desc)'; // Msg = new Error('trace').stack;

    var TERM = getTerm();
    TERM.error("Assertion fail: " + msg);

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    if (args) {
      TERM.log('Error args:', args);
    } //      TERM.trace()
    //      process.exit() # uncomment for quick error access :)


    var suffix = args && args.length > 0 ? "Args (" + args.length + "x): `" + _stringify(args) + "`" : '';
    THROW("Assertion fail: " + msg + " " + suffix);
  }
}

function _stringify(o) {
  if (Array.isArray(o)) {
    return "[ " + o.map(_stringify).join(', ') + " ]";
  }

  return "" + o;
} // Simple function to completely validate a domain


function ASSERT_STRDOM(domain, expectSmallest, domain__debug) {
  if (process.env.NODE_ENV !== 'production') {
    var s = domain__debug && domain__debug(domain);
    var strdomValueLen = 2;
    var strdomRangeLen = 2 * strdomValueLen;
    ASSERT(typeof domain === 'string', 'ONLY_STRDOM', s);
    ASSERT(domain.length % strdomRangeLen === 0, 'SHOULD_CONTAIN_RANGES', s);
    var lo = domain.charCodeAt(0) << 16 | domain.charCodeAt(1);
    var hi = domain.charCodeAt(domain.length - strdomValueLen) << 16 | domain.charCodeAt(domain.length - strdomValueLen + 1);
    ASSERT(lo >= SUB, 'SHOULD_BE_GTE ' + SUB, s);
    ASSERT(hi <= SUP, 'SHOULD_BE_LTE ' + SUP, s);
    ASSERT(!expectSmallest || lo !== hi || domain.length > strdomRangeLen, 'SHOULD_NOT_BE_SOLVED', s);
    return true;
  }
}

function ASSERT_SOLDOM(domain, value) {
  if (process.env.NODE_ENV !== 'production') {
    ASSERT(typeof domain === 'number', 'ONLY_SOLDOM');
    ASSERT(domain >= 0, 'ALL_SOLDOMS_SHOULD_BE_UNSIGNED');
    ASSERT(domain >= SOLVED_FLAG, 'SOLDOMS_MUST_HAVE_FLAG_SET');
    ASSERT((domain ^ SOLVED_FLAG) >= SUB, 'SOLVED_NUMDOM_SHOULD_BE_MIN_SUB');
    ASSERT((domain ^ SOLVED_FLAG) <= SUP, 'SOLVED_NUMDOM_SHOULD_BE_MAX_SUP');
    if (value !== undefined) ASSERT((domain ^ SOLVED_FLAG) === value, 'SHOULD_BE_SOLVED_TO:' + value);
    return true;
  }
}

function ASSERT_BITDOM(domain) {
  if (process.env.NODE_ENV !== 'production') {
    ASSERT(typeof domain === 'number', 'ONLY_BITDOM');
    ASSERT(domain >= 0, 'ALL_BITDOMS_SHOULD_BE_UNSIGNED');
    ASSERT(domain < SOLVED_FLAG, 'SOLVED_FLAG_NOT_SET');
    ASSERT(SMALL_MAX_NUM < 31, 'next assertion relies on this');
    ASSERT(domain >= 0 && domain < 1 << SMALL_MAX_NUM + 1 >>> 0, 'NUMDOM_SHOULD_BE_VALID_RANGE');
    return true;
  }
}

function ASSERT_ARRDOM(domain, min, max) {
  if (process.env.NODE_ENV !== 'production') {
    ASSERT(Array.isArray(domain), 'ONLY_ARRDOM');
    if (domain.length === 0) return;
    ASSERT(domain.length % 2 === 0, 'SHOULD_CONTAIN_RANGES');
    ASSERT(domain[0] >= (min || SUB), 'SHOULD_BE_GTE ' + (min || SUB));
    ASSERT(domain[domain.length - 1] <= (max === undefined ? SUP : max), 'SHOULD_BE_LTE ' + (max === undefined ? SUP : max));
    return true;
  }
}

function ASSERT_NORDOM(domain, expectSmallest, domain__debug) {
  if (process.env.NODE_ENV !== 'production') {
    var s = domain__debug && domain__debug(domain);
    ASSERT(typeof domain === 'string' || typeof domain === 'number', 'ONLY_NORDOM', s);

    if (typeof domain === 'string') {
      ASSERT(domain.length > 0, 'empty domains are always numdoms');

      if (expectSmallest) {
        var lo = domain.charCodeAt(0) << 16 | domain.charCodeAt(1);
        var hi = domain.charCodeAt(domain.length - 2) << 16 | domain.charCodeAt(domain.length - 1);
        ASSERT(hi > SMALL_MAX_NUM, 'EXPECTING_STRDOM_TO_HAVE_NUMS_GT_BITDOM', s);
        ASSERT(domain.length > 4 || lo !== hi, 'EXPECTING_STRDOM_NOT_TO_BE_SOLVED');
      }

      return ASSERT_STRDOM(domain, undefined, undefined);
    }

    if (expectSmallest) ASSERT(!domain || domain >= SOLVED_FLAG || (domain & domain - 1) !== 0, 'EXPECTING_SOLVED_NUMDOM_TO_BE_SOLDOM', s);
    ASSERT_NUMDOM(domain, s);
    return true;
  }
}

function ASSERT_NUMDOM(domain, expectSmallest, domain__debug) {
  if (process.env.NODE_ENV !== 'production') {
    var s = domain__debug && domain__debug(domain);
    ASSERT(typeof domain === 'number', 'ONLY_NUMDOM', s);
    if (expectSmallest) ASSERT(!domain || domain >= SOLVED_FLAG || (domain & domain - 1) !== 0, 'EXPECTING_SOLVED_NUMDOM_TO_BE_SOLDOM', s);
    if (domain >= SOLVED_FLAG) ASSERT_SOLDOM(domain);else ASSERT_BITDOM(domain);
    return true;
  }
}

function ASSERT_VARDOMS_SLOW(vardoms, domain__debug) {
  if (process.env.NODE_ENV !== 'production') {
    for (var _iterator = vardoms, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var domain = _ref;
      ASSERT_NORDOM(domain, true, domain__debug);
    }
  }
}

var LOG_NONE = 0;
var LOG_STATS = 1;
var LOG_SOLVES = 2;
var LOG_MIN = LOG_NONE;
var LOG_MAX = LOG_SOLVES;
var LOG_FLAG_NONE = 0;
var LOG_FLAG_PROPSTEPS = 1;
var LOG_FLAG_CHOICE = 2;
var LOG_FLAG_SEARCH = 4;
var LOG_FLAG_SOLUTIONS = 8;
var LOG_FLAGS = LOG_FLAG_NONE; // LOG_FLAG_PROPSTEPS|LOG_FLAG_CHOICE|LOG_FLAG_SOLUTIONS|LOG_FLAG_SEARCH;

function helper_logger() {
  if (process.env.NODE_ENV !== 'production') {
    var _getTerm;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    (_getTerm = getTerm()).log.apply(_getTerm, ['LOG'].concat(args));
  }
}

function ASSERT_LOG(flags, func) {
  if (process.env.NODE_ENV !== 'production') {
    if (flags & LOG_FLAGS) {
      ASSERT(typeof func === 'function');
      func(helper_logger);
    }
  }
}

var TRACING = false;

function isTracing() {
  if (process.env.NODE_ENV !== 'production') {
    return TRACING;
  }

  return false;
}

function setTracing(b) {
  if (process.env.NODE_ENV !== 'production') {
    TRACING = b;
  }
}
/**
 * @return {boolean}
 */


function TRACE() {
  if (process.env.NODE_ENV !== 'production') {
    var _getTerm2;

    if (arguments.length === 1 && (arguments.length <= 0 ? undefined : arguments[0]) === '') return false;
    if (TRACING) (_getTerm2 = getTerm()).log.apply(_getTerm2, arguments);
    return false;
  }
}

function TRACE_MORPH(from, to, desc, names, indexes) {
  if (process.env.NODE_ENV !== 'production') {
    TRACE(' ### Morphing;    ', from, '   ==>    ', to);
  }
}

function TRACE_SILENT() {
  if (process.env.NODE_ENV !== 'production') {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    TRACE.apply(void 0, ["\x1B[90m"].concat(args, ["\x1B[0m"]));
  }
} // A domain, in this lib, is a set of numbers denoted by lo-hi range pairs (inclusive)
// Basically means the ranges in the domain are ordered
// ascending and no ranges overlap. We call this "simplified"
// const FIRST_RANGE = 0;


var STR_FIRST_RANGE_LO = 0; // First and second char of a string

var STR_FIRST_RANGE_HI = 2; // Third and fourth char of a string

var MIN = Math.min;
var MAX = Math.max;
var FLOOR = Math.floor;
var CEIL = Math.ceil; // Size of values and ranges in a string domain

var STR_VALUE_SIZE = 2;
var STR_RANGE_SIZE = 4;
var EMPTY = 0;
var EMPTY_STR = '';
var DOM_ZERO = domain_createValue(0);
var DOM_BOOL = domain_createRange(0, 1); ///**
// * Append given range to the end of given domain. Does not
// * check if the range belongs there! Dumbly appends.
// *
// * @param {$nordom} domain
// * @param {number} lo
// * @param {number} hi
// * @returns {$domain}
// */
// function domain_appendRange(domain, lo, hi) {
//  ASSERT_NORDOM(domain);
//
//  if (typeof domain === 'number') {
//    // note: this function should not receive numdoms with a SOLVED_FLAG set
//    // it is only used in temporary array cases, the flag must be set afterwards
//    ASSERT(domain < SOLVED_FLAG, 'not expecting solved numdoms');
//    if (hi <= SMALL_MAX_NUM) return domain_bit_addRange(domain, lo, hi);
//    domain = domain_numToStr(domain);
//  }
//  return domain_str_addRange(domain, lo, hi);
// }

/**
 * Append given range to the end of given domain. Does not
 * check if the range belongs there! Dumbly appends.
 *
 * @param {$nordom} domain
 * @param {number} lo
 * @param {number} hi
 * @returns {$domain}
 */

function domain_bit_addRange(domain, lo, hi) {
  ASSERT_BITDOM(domain); // What we do is:
  // - create a 1
  // - move the 1 to the left, `1+to-from` times
  // - subtract 1 to get a series of `to-from` ones
  // - shift those ones `from` times to the left
  // - OR that result with the domain and return it

  var range = (1 << 1 + (hi | 0) - (lo | 0)) - 1 << lo;
  return domain | range;
}
/**
 * Append given range to the end of given domain. Does not
 * check if the range belongs there! Dumbly appends.
 *
 * @param {$nordom} domain
 * @param {number} lo
 * @param {number} hi
 * @returns {$domain}
 */
// function domain_str_addRange(domain, lo, hi) {
//  ASSERT_STRDOM(domain);
//  ASSERT(lo >= 0);
//  ASSERT(hi <= SUP);
//  ASSERT(lo <= hi);
//
//  return domain + domain_str_encodeRange(lo, hi);
// }

/**
 * returns whether domain covers given value
 *
 * @param {$nordom} domain
 * @param {number} value
 * @returns {boolean}
 */


function domain_containsValue(domain, value) {
  ASSERT_NORDOM(domain);
  if (typeof domain === 'number') return domain_num_containsValue(domain, value);
  return domain_str_containsValue(domain, value);
}

function domain_num_containsValue(domain, value) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_sol_containsValue(domain, value);
  return domain_bit_containsValue(domain, value);
}

function domain_sol_containsValue(domain, value) {
  ASSERT_SOLDOM(domain);
  ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');
  ASSERT(value >= SUB);
  ASSERT(value <= SUP);
  return (domain ^ SOLVED_FLAG) === value;
}

function domain_bit_containsValue(domain, value) {
  ASSERT_BITDOM(domain);
  ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');
  ASSERT(value >= SUB, 'OOB');
  ASSERT(value <= SUP, 'OOB');
  if (value < SUB || value > SMALL_MAX_NUM) return false;
  return (domain & 1 << value) !== 0;
}

function domain_str_containsValue(domain, value) {
  ASSERT_STRDOM(domain);
  ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');
  ASSERT(value >= SUB, 'value must be >=SUB', value);
  ASSERT(value <= SUP, 'value must be <=SUP', value);
  return domain_str_rangeIndexOf(domain, value) !== NOT_FOUND;
}
/**
 * Return the range index in given domain that covers given
 * value, or if the domain does not cover it at all
 *
 * @param {$strdom} domain
 * @param {number} value
 * @returns {number} >=0 actual index on strdom or NOT_FOUND
 */


function domain_str_rangeIndexOf(domain, value) {
  ASSERT_STRDOM(domain);
  ASSERT(domain !== '', 'NOT_EMPTY_STR');
  ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');
  ASSERT(value >= SUB);
  ASSERT(value <= SUP);
  var len = domain.length;

  for (var index = 0; index < len; index += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain, index);

    if (lo <= value) {
      var hi = domain_str_decodeValue(domain, index + STR_VALUE_SIZE);

      if (hi >= value) {
        // Value is lo<=value<=hi
        return index;
      }
    } else {
      // Value is between previous range and this one, aka: not found.
      break;
    }
  }

  return NOT_FOUND;
}
/**
 * Check if given domain is solved. If so, return the value
 * to which it was solved. Otherwise return NO_SUCH_VALUE.
 *
 * @param {$nordom} domain
 * @returns {number}
 */


function domain_getValue(domain) {
  ASSERT_NORDOM(domain); // TODO: in a sound system we'd only have to check for soldoms...

  if (typeof domain === 'number') return domain_num_getValue(domain);
  return domain_str_getValue(domain);
}

function domain_num_getValue(domain) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_sol_getValue(domain);
  return domain_bit_getValue(domain);
}

function domain_sol_getValue(domain) {
  ASSERT_SOLDOM(domain);
  return domain ^ SOLVED_FLAG;
}

function domain_bit_getValue(domain) {
  ASSERT_BITDOM(domain);
  var lo = domain_bit_min(domain);
  return domain === 1 << lo ? lo : NO_SUCH_VALUE;
}

function domain_str_getValue(domain) {
  ASSERT_STRDOM(domain);
  if (domain.length !== STR_RANGE_SIZE) return NO_SUCH_VALUE;
  var lo = domain_str_decodeValue(domain, STR_FIRST_RANGE_LO);
  var hi = domain_str_decodeValue(domain, STR_FIRST_RANGE_HI);
  if (lo === hi) return lo;
  return NO_SUCH_VALUE;
}
/**
 * @param {$strdom} domain
 * @param {number} index
 * @returns {number}
 */


function domain_str_decodeValue(domain, index) {
  ASSERT_STRDOM(domain);
  return domain.charCodeAt(index) << 16 | domain.charCodeAt(index + 1);
}
/**
 * @param {number} value
 * @returns {string} not a $strdom but half of one
 */


function domain_str_encodeValue(value) {
  return String.fromCharCode(value >>> 16 & 0xffff, value & 0xffff);
}
/**
 * @param {number} lo
 * @param {number} hi
 * @returns {$strdom} One range is still a valid domain
 */


function domain_str_encodeRange(lo, hi) {
  return String.fromCharCode(lo >>> 16 & 0xffff, lo & 0xffff, hi >>> 16 & 0xffff, hi & 0xffff);
}
/**
 * External API only. Always returns an arrdom.
 *
 * @param {number[]} list
 * @returns {$arrdom}
 */


function domain_fromListToArrdom(list) {
  if (list.length === 0) return [];
  list = list.slice(0);
  list.sort(function (a, b) {
    return a - b;
  }); // Note: default sort is lexicographic!

  var arrdom = [];
  var hi;
  var lo;

  for (var index = 0; index < list.length; index++) {
    var value = list[index];
    ASSERT(value >= SUB, 'A_OOB_INDICATES_BUG');
    ASSERT(value <= SUP, 'A_OOB_INDICATES_BUG');

    if (index === 0) {
      lo = value;
      hi = value;
    } else {
      ASSERT(value >= hi, 'LIST_SHOULD_BE_ORDERED_BY_NOW'); // Imo it should not even contain dupe elements... but that may happen anyways

      if (value > hi + 1) {
        arrdom.push(lo, hi);
        lo = value;
      }

      hi = value;
    }
  }

  arrdom.push(lo, hi);
  ASSERT_ARRDOM(arrdom);
  return arrdom;
}
/**
 * Domain to list of possible values
 *
 * @param {$nordom} domain
 * @returns {number[]}
 *
 * @nosideffects
 */


function domain_toList(domain) {
  ASSERT_NORDOM(domain);
  if (typeof domain === 'number') return domain_num_toList(domain);
  return domain_str_toList(domain);
}

function domain_num_toList(domain) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_sol_toList(domain);
  return domain_bit_toList(domain);
}

function domain_sol_toList(domain) {
  ASSERT_SOLDOM(domain);
  return [domain ^ SOLVED_FLAG];
}

function domain_bit_toList(domain) {
  ASSERT_BITDOM(domain);
  var list = [];

  for (var i = 0; i < SMALL_MAX_NUM; ++i) {
    if ((domain & 1 << i >>> 0) > 0) list.push(i);
  }

  return list;
}

function domain_str_toList(domain) {
  ASSERT_STRDOM(domain);
  var list = [];

  for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
    for (var n = domain_str_decodeValue(domain, i), m = domain_str_decodeValue(domain, i + STR_VALUE_SIZE); n <= m; ++n) {
      list.push(n);
    }
  }

  return list;
}
/**
 * @param {$nordom} domain
 * @param {number[]} list
 * @returns {number} Can return NO_SUCH_VALUE
 */


function domain_getFirstIntersectingValue(domain, list) {
  ASSERT_NORDOM(domain);
  if (typeof domain === 'number') return domain_num_getFirstIntersectingValue(domain, list);
  return domain_str_getFirstIntersectingValue(domain, list);
}

function domain_num_getFirstIntersectingValue(domain, list) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_sol_getFirstIntersectingValue(domain, list);
  return domain_bit_getFirstIntersectingValue(domain, list);
}

function domain_sol_getFirstIntersectingValue(domain, list) {
  ASSERT_SOLDOM(domain);
  ASSERT(list && Array.isArray(list), 'A_EXPECTING_LIST');
  var solvedValue = domain ^ SOLVED_FLAG;
  if (list.indexOf(solvedValue) >= 0) return solvedValue;
  return NO_SUCH_VALUE;
}

function domain_bit_getFirstIntersectingValue(domain, list) {
  ASSERT_BITDOM(domain);
  ASSERT(list && Array.isArray(list), 'A_EXPECTING_LIST');

  for (var i = 0; i < list.length; ++i) {
    var value = list[i];
    ASSERT(value >= SUB && value <= SUP, 'A_OOB_INDICATES_BUG'); // Internally all domains elements should be sound; SUB>=n>=SUP
    // 1<<100 = 16 and large numbers are valid here so do check

    if (value <= SMALL_MAX_NUM && (domain & 1 << value) > 0) return value;
  }

  return NO_SUCH_VALUE;
}

function domain_str_getFirstIntersectingValue(domain, list) {
  ASSERT_STRDOM(domain);
  ASSERT(list && Array.isArray(list), 'A_EXPECTING_LIST');

  for (var i = 0; i < list.length; i++) {
    var value = list[i];
    ASSERT(value >= SUB && value <= SUP, 'A_OOB_INDICATES_BUG'); // Internally all domains elements should be sound; SUB>=n>=SUP

    if (domain_str_containsValue(domain, value)) {
      return value;
    }
  }

  return NO_SUCH_VALUE;
}
/**
 * All ranges will be ordered ascending and overlapping ranges are merged
 * This function first checks whether simplification is needed at all
 * Should normalize all return values.
 *
 * @param {$strdom|string} domain
 * @returns {$strdom} ironically, not optimized to a number if possible
 */


function domain_str_simplify(domain) {
  ASSERT_STRDOM(domain);
  if (!domain) return EMPTY; // Keep return type consistent, dont return EMPTY

  if (domain.length === STR_RANGE_SIZE) return domain_toSmallest(domain); // Order ranges, then merge overlapping ranges (TODO: can we squash this step together?)

  domain = _domain_str_quickSortRanges(domain);
  domain = _domain_str_mergeOverlappingRanges(domain);
  return domain_toSmallest(domain);
}
/**
 * Sort all ranges in this pseudo-strdom from lo to hi. Domain
 * may already be csis but we're not sure. This function call
 * is part of the process of ensuring that.
 *
 * @param {$strdom|string} domain MAY not be CSIS yet (that's probably why this function is called in the first place)
 * @returns {$strdom|string} ranges in this string will be ordered but may still overlap
 */


function _domain_str_quickSortRanges(domain) {
  ASSERT_STRDOM(domain);
  if (!domain) return EMPTY_STR; // Keep return type consistent, dont return EMPTY

  var len = domain.length;
  if (len <= STR_RANGE_SIZE) return domain; // TODO: right now we convert to actual values and concat with "direct" string access. would it be faster to use slices? and would it be faster to do string comparisons with the slices and no decoding?

  var pivotIndex = 0; // TODO: i think we'd be better off with a different pivot? middle probably performs better

  var pivotLo = domain_str_decodeValue(domain, pivotIndex);
  var pivotHi = domain_str_decodeValue(domain, pivotIndex + STR_VALUE_SIZE);
  var left = EMPTY_STR;
  var right = EMPTY_STR;

  for (var i = STR_RANGE_SIZE; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain, i); // TODO: if we change assumptions elsewhere we could drop the `hi` stuff from this function altogether

    if (lo < pivotLo || lo === pivotLo && domain_str_decodeValue(domain, i + STR_VALUE_SIZE) < pivotHi) {
      left += domain[i] + domain[i + 1] + domain[i + 2] + domain[i + 3];
    } else {
      right += domain[i] + domain[i + 1] + domain[i + 2] + domain[i + 3];
    }
  }

  return String(_domain_str_quickSortRanges(left)) + // Sort left part, without pivot
  domain[pivotIndex] + // Include pivot (4 chars)
  domain[pivotIndex + 1] + domain[pivotIndex + STR_VALUE_SIZE] + domain[pivotIndex + STR_VALUE_SIZE + 1] + _domain_str_quickSortRanges(right) // Sort right part, without pivot
  ;
}
/**
 * @param {$strdom|string} domain May already be csis but at least all ranges should be ordered and are lo<=hi
 * @returns {$strdom}
 */


function _domain_str_mergeOverlappingRanges(domain) {
  ASSERT_STRDOM(domain);
  if (!domain) return EMPTY_STR; // Prefer strings for return type consistency
  // assumes domain is sorted
  // assumes all ranges are "sound" (lo<=hi)

  var len = domain.length;
  if (len === STR_RANGE_SIZE) return domain;
  var newDomain = domain[STR_FIRST_RANGE_LO] + domain[STR_FIRST_RANGE_LO + 1]; // Just copy the first two characters...

  var lasthi = domain_str_decodeValue(domain, STR_FIRST_RANGE_HI);
  var lasthindex = STR_FIRST_RANGE_HI;

  for (var i = STR_RANGE_SIZE; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain, i);
    var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
    ASSERT(lo <= hi, 'ranges should be ascending'); // Either:
    // - lo <= lasthi, hi <= lasthi: last range consumes current range (drop it)
    // - lo <= lasthi+1: replace lasthi, last range is extended by current range
    // - lo >= lasthi+2: flush lasthi, replace lastlo and lasthi, current range becomes last range
    // if (lo <= lasthi && hi <= lasthi) {}
    // else

    if (lo <= lasthi + 1) {
      if (hi > lasthi) {
        lasthi = hi;
        lasthindex = i + STR_VALUE_SIZE;
      }
    } else {
      ASSERT(lo >= lasthi + 2, 'should be this now');
      newDomain += domain[lasthindex] + domain[lasthindex + 1] + domain[i] + domain[i + 1];
      lasthi = hi;
      lasthindex = i + STR_VALUE_SIZE;
    }
  }

  return newDomain + domain[lasthindex] + domain[lasthindex + 1];
}
/**
 * Intersect two $domains.
 * Intersection means the result only contains the values
 * that are contained in BOTH domains.
 *
 * @param {$nordom} domain1
 * @param {$nordom} domain2
 * @returns {$nordom}
 */


function domain_intersection(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  if (domain1 === domain2) return domain1;
  var isNum1 = typeof domain1 === 'number';
  var isNum2 = typeof domain2 === 'number';
  if (isNum1 && isNum2) return domain_numnum_intersection(domain1, domain2);
  if (isNum1) return domain_numstr_intersection(domain1, domain2);
  if (isNum2) return domain_numstr_intersection(domain2, domain1); // Swapped!

  return domain_strstr_intersection(domain1, domain2);
}

function domain_numnum_intersection(domain1, domain2) {
  ASSERT_NUMDOM(domain1);
  ASSERT_NUMDOM(domain2);
  var sol1 = domain1 >= SOLVED_FLAG;
  var sol2 = domain2 >= SOLVED_FLAG;

  if (sol1) {
    if (sol2) return domain_solsol_intersect(domain1, domain2);
    return domain_solbit_intersect(domain1, domain2);
  }

  if (sol2) return domain_solbit_intersect(domain2, domain1);
  return domain_bitbit_intersect(domain1, domain2);
}

function domain_solbit_intersect(soldom, bitdom) {
  ASSERT_SOLDOM(soldom);
  ASSERT_BITDOM(bitdom);
  var solvedValue = soldom ^ SOLVED_FLAG;
  if (solvedValue <= SMALL_MAX_NUM && bitdom & 1 << solvedValue) return soldom;
  return EMPTY;
}

function domain_solsol_intersect(domain1, domain2) {
  ASSERT_SOLDOM(domain1);
  ASSERT_SOLDOM(domain2);
  if (domain1 === domain2) return domain1;
  return EMPTY;
}

function domain_bitbit_intersect(domain1, domain2) {
  ASSERT_BITDOM(domain1);
  ASSERT_BITDOM(domain2);
  return domain_bitToSmallest(domain1 & domain2);
}

function domain_numstr_intersection(numdom, strdom) {
  ASSERT_NUMDOM(numdom);
  ASSERT_STRDOM(strdom);
  if (numdom >= SOLVED_FLAG) return domain_solstr_intersect(numdom, strdom);
  return domain_bitstr_intersect(numdom, strdom);
}

function domain_solstr_intersect(soldom, strdom) {
  ASSERT_SOLDOM(soldom);
  ASSERT_STRDOM(strdom);
  var solvedValue = soldom ^ SOLVED_FLAG;

  for (var i = 0, len = strdom.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(strdom, i);
    var hi = domain_str_decodeValue(strdom, i + STR_VALUE_SIZE); // Once a range is found beyond the solved value we can never find solved value in domain_str

    if (solvedValue < lo) break; // When lo<=value<=hi the intersection is non-empty. return the solved domain.

    if (solvedValue <= hi) return soldom;
  }

  return EMPTY;
}

function domain_bitstr_intersect(bitdom, strdom) {
  ASSERT_BITDOM(bitdom);
  ASSERT_STRDOM(strdom); // TODO: intersect in a "zipper" O(max(n,m)) algorithm instead of O(n*m). see _domain_strstr_intersection

  var domain = EMPTY;

  for (var i = 0, len = strdom.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(strdom, i);
    if (lo > SMALL_MAX_NUM) break;
    var hi = domain_str_decodeValue(strdom, i + STR_VALUE_SIZE);

    for (var j = lo, m = MIN(SMALL_MAX_NUM, hi); j <= m; ++j) {
      var flag = 1 << j;
      if (bitdom & flag) domain |= flag; // Could be: domain |= domain1 & NUMBER[j]; but this reads better?
    }
  }

  return domain_bitToSmallest(domain);
}

function domain_strstr_intersection(domain1, domain2) {
  ASSERT_STRDOM(domain1);
  ASSERT_STRDOM(domain2);
  var len1 = domain1.length;
  var len2 = domain2.length;
  if ((len1 | len2) === 0) return EMPTY;
  var newDomain = EMPTY_STR;
  var index1 = 0;
  var index2 = 0;
  var lo1 = domain_str_decodeValue(domain1, STR_FIRST_RANGE_LO);
  var hi1 = domain_str_decodeValue(domain1, STR_FIRST_RANGE_HI);
  var lo2 = domain_str_decodeValue(domain2, STR_FIRST_RANGE_LO);
  var hi2 = domain_str_decodeValue(domain2, STR_FIRST_RANGE_HI);

  while (true) {
    if (hi1 < lo2) {
      index1 += STR_RANGE_SIZE;
      if (index1 >= len1) break;
      lo1 = domain_str_decodeValue(domain1, index1);
      hi1 = domain_str_decodeValue(domain1, index1 + STR_VALUE_SIZE);
    } else if (hi2 < lo1) {
      index2 += STR_RANGE_SIZE;
      if (index2 >= len2) break;
      lo2 = domain_str_decodeValue(domain2, index2);
      hi2 = domain_str_decodeValue(domain2, index2 + STR_VALUE_SIZE);
    } else {
      ASSERT(lo1 <= lo2 && lo2 <= hi1 || lo2 <= lo1 && lo1 <= hi2, '_domain_strstr_intersection: both ranges must overlap at least for some element because neither ends before the other [' + lo1 + ',' + hi1 + ' - ' + lo2 + ',' + hi2 + ']');
      var mh = MIN(hi1, hi2);
      newDomain += domain_str_encodeRange(MAX(lo1, lo2), mh); // Put all ranges after the one we just added...

      mh += 2; // Last added range + 1 position gap

      lo1 = lo2 = mh;
      ASSERT(hi1 < mh || hi2 < mh, 'at least one range should be moved forward now');

      if (hi1 < mh) {
        index1 += STR_RANGE_SIZE;
        if (index1 >= len1) break;
        lo1 = domain_str_decodeValue(domain1, index1);
        hi1 = domain_str_decodeValue(domain1, index1 + STR_VALUE_SIZE);
      }

      if (hi2 < mh) {
        index2 += STR_RANGE_SIZE;
        if (index2 >= len2) break;
        lo2 = domain_str_decodeValue(domain2, index2);
        hi2 = domain_str_decodeValue(domain2, index2 + STR_VALUE_SIZE);
      }
    }
  }

  if (newDomain === EMPTY_STR) return EMPTY;
  return domain_toSmallest(newDomain);
}
/**
 * Check if domain contains value, if so, return a domain with
 * just given value. Otherwise return the empty domain.
 *
 * @param {$nordom} domain
 * @param {number} value
 * @returns {$nordom}
 */


function domain_intersectionValue(domain, value) {
  ASSERT_NORDOM(domain);
  ASSERT(value >= SUB && value <= SUP, 'Expecting valid value');
  if (domain_containsValue(domain, value)) return domain_createValue(value);
  return domain_createEmpty();
}
/**
 * Return a simple string showing the given domain in array
 * form and the representation type that was passed on.
 *
 * @param {$domain} domain
 * @returns {string}
 */


function domain__debug(domain) {
  if (typeof domain === 'number') {
    if (domain >= SOLVED_FLAG) return 'soldom([' + (domain ^ SOLVED_FLAG) + ',' + (domain ^ SOLVED_FLAG) + '])';
    return 'numdom([' + domain_numToArr(domain) + '])';
  }

  if (typeof domain === 'string') return 'strdom([' + domain_strToArr(domain) + '])';
  if (Array.isArray(domain)) return 'arrdom([' + domain + '])';
  return '???dom(' + domain + ')';
}
/**
 * The idea behind this function - which is primarily
 * intended for domain_plus and domain_minus and probably applies
 * to nothing else - is that when adding two intervals,
 * both intervals expand by the other's amount. This means
 * that when given two segmented domains, each continuous
 * range expands by at least the interval of the smallest
 * range of the other segmented domain. When such an expansion
 * occurs, any gaps between subdomains that are <= the smallest
 * range's interval width get filled up, which we can exploit
 * to reduce the number of segments in a domain. Reducing the
 * number of domain segments helps reduce the N^2 complexity of
 * the subsequent domain consistent interval addition method.
 *
 * @param {$strdom} domain1
 * @param {$strdom} domain2
 * @returns {$strdom[]} NOT smallest! call sites depend on strdom, and they will take care of normalization
 */


function domain_str_closeGaps(domain1, domain2) {
  ASSERT_STRDOM(domain1);
  ASSERT_STRDOM(domain2);

  if (domain1 && domain2) {
    var change;

    do {
      change = 0;

      if (domain1.length > STR_RANGE_SIZE) {
        var smallestRangeSize = domain_str_smallestRangeSize(domain2);

        var domain = _domain_str_closeGaps(domain1, smallestRangeSize);

        change += domain1.length - domain.length;
        domain1 = domain;
      }

      if (domain2.length > STR_RANGE_SIZE) {
        var _smallestRangeSize = domain_str_smallestRangeSize(domain1);

        var _domain = _domain_str_closeGaps(domain2, _smallestRangeSize);

        change += domain2.length - _domain.length;
        domain2 = _domain;
      }
    } while (change !== 0);
  } // TODO: we could return a concatted string and prefix the split, instead of this temporary array...


  return [domain1, domain2];
}
/**
 * Closes all the gaps between the intervals according to
 * the given gap value. All gaps less than this gap are closed.
 * Domain is not harmed
 *
 * @param {$strdom} domain
 * @param {number} gap
 * @returns {$strdom} (min/max won't be eliminated and input should be a "large" domain)
 */


function _domain_str_closeGaps(domain, gap) {
  ASSERT_STRDOM(domain);
  var newDomain = domain[STR_FIRST_RANGE_LO] + domain[STR_FIRST_RANGE_LO + 1];
  var lasthi = domain_str_decodeValue(domain, STR_FIRST_RANGE_HI);
  var lasthindex = STR_FIRST_RANGE_HI;

  for (var i = STR_RANGE_SIZE, len = domain.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain, i);
    var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);

    if (lo - lasthi > gap) {
      newDomain += domain[lasthindex] + domain[lasthindex + 1] + domain[i] + domain[i + 1];
    }

    lasthi = hi;
    lasthindex = i + STR_VALUE_SIZE;
  }

  newDomain += domain[lasthindex] + domain[lasthindex + 1];
  return newDomain;
}
/**
 * @param {$strdom} domain
 * @returns {number}
 */


function domain_str_smallestRangeSize(domain) {
  ASSERT_STRDOM(domain);
  var min_width = SUP;

  for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain, i);
    var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
    var width = 1 + hi - lo;

    if (width < min_width) {
      min_width = width;
    }
  }

  return min_width;
}
/**
 * Note that this one isn't domain consistent.
 *
 * @param {$nordom} domain1
 * @param {$nordom} domain2
 * @returns {$domain}
 */


function domain_mul(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2); // TOFIX: quick shortcut for solved domains
  // for simplicity sake, convert them back to arrays

  if (typeof domain1 === 'number') domain1 = domain_numToStr(domain1);
  if (typeof domain2 === 'number') domain2 = domain_numToStr(domain2); // TODO domain_mulNum

  return domain_strstr_mul(domain1, domain2);
}

function domain_strstr_mul(domain1, domain2) {
  ASSERT_STRDOM(domain1);
  ASSERT_STRDOM(domain2);
  var result = EMPTY_STR;

  for (var i = 0, leni = domain1.length; i < leni; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain1, i);
    var hi = domain_str_decodeValue(domain1, i + STR_VALUE_SIZE);
    result += _domain_str_mulByRange(domain2, lo, hi);
  } // TODO: is it worth doing this step immediately?


  return domain_str_simplify(result);
}
/**
 * Multiply a domain by given range
 *
 * @param {$strdom} strdom
 * @param {number} lo
 * @param {number} hi
 * @returns {$strdom} NOT normalized
 */


function _domain_str_mulByRange(strdom, lo, hi) {
  ASSERT_STRDOM(strdom, false, domain__debug);
  ASSERT(typeof lo === 'number', 'lo should be number');
  ASSERT(typeof hi === 'number', 'hi should be number');
  var result = EMPTY_STR;

  for (var j = 0, len = strdom.length; j < len; j += STR_RANGE_SIZE) {
    var loj = domain_str_decodeValue(strdom, j);
    var hij = domain_str_decodeValue(strdom, j + STR_VALUE_SIZE);
    result += domain_str_encodeRange(MIN(SUP, lo * loj), MIN(SUP, hi * hij));
  }

  return result;
}
/**
 * Divide one range by another
 * Result has any integer values that are equal or between
 * the real results. This means fractions are floored/ceiled.
 * This is an expensive operation.
 * Zero is a special case.
 *
 * Does not harm input domains
 *
 * @param {$nordom} domain1
 * @param {$nordom} domain2
 * @param {boolean} [floorFractions=true] Include the floored lo of the resulting ranges?
 *         For example, <5,5>/<2,2> is <2.5,2.5>. If this flag is true, it will include
 *         <2,2>, otherwise it will not include anything for that division.
 * @returns {$nordom}
 */


function domain_divby(domain1, domain2, floorFractions) {
  if (floorFractions === void 0) {
    floorFractions = true;
  }

  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2); // TOFIX: add quick shortcut for solved domains
  // for simplicity sake, convert them back to arrays

  if (typeof domain1 === 'number') domain1 = domain_numToStr(domain1);
  if (typeof domain2 === 'number') domain2 = domain_numToStr(domain2); // TODO: domain_divByNum

  return domain_strstr_divby(domain1, domain2, floorFractions);
}

function domain_strstr_divby(domain1, domain2, floorFractions) {
  if (floorFractions === void 0) {
    floorFractions = true;
  }

  ASSERT_STRDOM(domain1);
  ASSERT_STRDOM(domain2);
  var result = EMPTY_STR;

  for (var i = 0, leni = domain2.length; i < leni; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain2, i);
    var hi = domain_str_decodeValue(domain2, i + STR_VALUE_SIZE);
    result += _domain_str_divbyRange(domain1, lo, hi, floorFractions);
  }

  return domain_str_simplify(result);
}

function _domain_str_divbyRange(strdom, divisorLo, divisorHi, floorFractions) {
  // Division: Dividend / Divisor = Quotient
  ASSERT_STRDOM(strdom);
  ASSERT(typeof divisorLo === 'number', 'lo should be a number');
  ASSERT(typeof divisorHi === 'number', 'hi should be a number');
  ASSERT(divisorLo >= 0 && divisorHi >= 0, 'lo/hi cannot be negative');
  var result = EMPTY_STR;

  for (var j = 0, lenj = strdom.length; j < lenj; j += STR_RANGE_SIZE) {
    var dividendLo = domain_str_decodeValue(strdom, j);
    var dividendHi = domain_str_decodeValue(strdom, j + STR_VALUE_SIZE); // Cannot /0
    // we ignore it right now. should we...
    // - add a 0 or SUB or SUP for it
    // - throw an error / issue a warning for it

    if (divisorHi > 0) {
      var quotientLo = dividendLo / divisorHi;
      var quotientHi = divisorLo > 0 ? dividendHi / divisorLo : SUP; // We cant use fractions, so we'll only include any values in the
      // resulting domains that are _above_ the lo and _below_ the hi.

      var left = CEIL(quotientLo);
      var right = FLOOR(quotientHi); // If the fraction is within the same integer this could result in
      // lo>hi so we must prevent this case

      if (left <= right) {
        result += domain_str_encodeRange(left, right);
      } else {
        ASSERT(FLOOR(quotientLo) === FLOOR(quotientHi), 'left>right when fraction is in same int, which can happen', quotientLo, quotientHi);

        if (floorFractions) {
          // Only use the floored value
          // note: this is a choice. not both floor/ceil because then 5/2=2.5 becomes [2,3]. should be [2,2] or [3,3]
          result += domain_str_encodeRange(right, right);
        }
      }
    }
  }

  return result;
}
/**
 * Do the opposite of a mul. This is _like_ a div but there
 * are special cases for zeroes and fractions:
 * - x * y = 0
 *   - x / 0 = y (not infinity)
 *   - y / 0 = x (not infinity)
 * - 2 * x = [2, 3]
 *   - 2 / [1, 3] = x (integer division so x=1)
 *   - x / [1, 3] = 2
 *
 * @param {$nordom} domain1
 * @param {$nordom} domain2
 * @returns {$nordom}
 */


function domain_invMul(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2); // TOFIX: add quick shortcut for solved domains
  // if (domain_isZero(domain2)) return domain1;
  // for simplicity sake, convert them back to arrays

  if (typeof domain1 === 'number') domain1 = domain_numToStr(domain1);
  if (typeof domain2 === 'number') domain2 = domain_numToStr(domain2); // TODO: domain_divByNum

  return domain_strstr_invMul(domain1, domain2);
}

function domain_strstr_invMul(domain1, domain2) {
  ASSERT_STRDOM(domain1);
  ASSERT_STRDOM(domain2);
  var result = EMPTY_STR;

  for (var i = 0, len = domain2.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain2, i);
    var hi = domain_str_decodeValue(domain2, i + STR_VALUE_SIZE);
    result += _domain_str_invMulRange(domain1, lo, hi);
  }

  return domain_str_simplify(result);
}

function _domain_str_invMulRange(domain, divisorLo, divisorHi) {
  // Note: act like div but do exact opposite of mul regardless
  // all we worry about is the zero since input is >=0 and finite
  ASSERT_STRDOM(domain);
  var result = EMPTY_STR;

  for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
    var dividendLo = domain_str_decodeValue(domain, i);
    var dividendHi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
    var quotientLo = divisorHi ? dividendLo / divisorHi : SUB; // Use SUB if /0

    var quotientHi = divisorLo ? dividendHi / divisorLo : SUP; // Use SUP if /0
    // only care about the integers within the division range

    var lo = CEIL(quotientLo);
    var hi = FLOOR(quotientHi); // If the lo hi quotients are inside the same integer, the result is empty

    if (lo <= hi) {
      result += domain_str_encodeRange(lo, hi);
    }
  }

  return result;
}
/**
 * Return the number of elements this domain covers
 *
 * @param {$nordom} domain
 * @returns {number}
 */


function domain_size(domain) {
  ASSERT_NORDOM(domain);
  if (typeof domain === 'number') return domain_num_size(domain);
  return domain_str_size(domain);
}

function domain_num_size(domain) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return 1;
  return domain_bit_size(domain);
}

var _ref = function () {
  //'use asm';
  function _domain_bit_size(domain) {
    domain = domain | 0; // Hot paths; binary
    // the empty domain is "free"

    switch (domain | 0) {
      case 0:
        return 0;
      // Empty domain

      case 1:
        return 1;

      case 2:
        return 1;

      case 3:
        return 2;

      default:
        break;
    } // 32-bit popcount (count of set bits) using the SWAR algorithm.
    // See stackoverflow.com/a/109025


    domain = domain - (domain >> 1 & 0x55555555) | 0;
    domain = (domain & 0x33333333) + (domain >> 2 & 0x33333333) | 0;
    domain = domain + (domain >> 4) & 0x0f0f0f0f | 0;
    return (domain << 24) + (domain << 16) + (domain << 8) + domain >> 24 | 0;
  }

  return {
    _domain_bit_size: _domain_bit_size
  };
}(),
    _domain_bit_size = _ref._domain_bit_size;

function domain_bit_size(domain) {
  ASSERT_BITDOM(domain);
  return _domain_bit_size(domain) | 0;
}

function domain_str_size(domain) {
  ASSERT_STRDOM(domain);
  ASSERT(domain && domain.length > 0, 'A_EXPECTING_NON_EMPTY_STRDOM');
  var count = 0;

  for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
    // TODO: add test to confirm this still works fine if SUB is negative
    count += 1 + domain_str_decodeValue(domain, i + STR_VALUE_SIZE) - domain_str_decodeValue(domain, i);
  }

  return count;
}
/**
 * Get the middle element of all elements in domain.
 * Not hi-lo/2 but the (size/2)th element.
 * For domains with an even number of elements it
 * will take the first value _above_ the middle,
 * in other words; index=ceil(count/2).
 *
 * @param {$nordom} domain
 * @returns {number} can return
 */


function domain_middleElement(domain) {
  ASSERT_NORDOM(domain);

  if (typeof domain === 'number') {
    if (domain >= SOLVED_FLAG) return domain ^ SOLVED_FLAG; // For simplicity sake, convert them back to arrays

    domain = domain_numToStr(domain);
  } // TODO: domain_middleElementNum(domain);


  return domain_str_middleElement(domain);
}

function domain_str_middleElement(domain) {
  ASSERT_STRDOM(domain);
  if (!domain) return NO_SUCH_VALUE;
  var size = domain_str_size(domain);
  var targetValue = FLOOR(size / 2);
  var lo;
  var hi;

  for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
    lo = domain_str_decodeValue(domain, i);
    hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
    var count = 1 + hi - lo;

    if (targetValue < count) {
      break;
    }

    targetValue -= count;
  } // `targetValue` should be the `nth` element in the current range (`lo-hi`)
  // so we can use `lo` and add the remainder of `targetValue` to get the mid value


  return lo + targetValue;
}
/**
 * Get lowest value in the domain
 * Only use if callsite doesn't need to cache first range (because array access)
 *
 * @param {$nordom} domain
 * @returns {number}
 */


function domain_min(domain) {
  ASSERT_NORDOM(domain);
  if (typeof domain === 'number') return domain_num_min(domain);
  return domain_str_min(domain);
}

function domain_num_min(domain) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_sol_min(domain);
  return domain_bit_min(domain);
}

function domain_sol_min(domain) {
  ASSERT_SOLDOM(domain);
  return domain ^ SOLVED_FLAG;
}

var _ref2 = function (stdlib) {
  //'use asm';
  var clz = stdlib.Math.clz32;

  function _domain_bit_min(domain) {
    domain = domain | 0; // fast paths: these are by far the most used case in our situation

    switch (domain | 0) {
      case 0:
        return -1;

      case 1:
        return 0;

      case 2:
        return 1;

      case 3:
        return 0;

      default:
        break;
    } // 1. Fill in all the higher bits after the first one
    // ASMjs for some reason does not allow ^=,&=, or |=


    domain = domain | domain << 16;
    domain = domain | domain << 8;
    domain = domain | domain << 4;
    domain = domain | domain << 2;
    domain = domain | domain << 1; // 2. Now, inversing the bits (including the first set
    // bit, which becomes unset) reveals the lowest bits

    return 32 - clz(~domain) | 0;
  }

  return {
    _domain_bit_min: _domain_bit_min
  };
}({
  Math: {
    clz32: Math.clz32
  }
}),
    _domain_bit_min = _ref2._domain_bit_min;

function domain_bit_min(domain) {
  ASSERT_BITDOM(domain);
  return _domain_bit_min(domain) | 0;
}

function domain_str_min(domain) {
  ASSERT_STRDOM(domain);
  if (!domain) return NO_SUCH_VALUE;
  return domain_str_decodeValue(domain, STR_FIRST_RANGE_LO);
}
/**
 * Only use if callsite doesn't use last range again
 *
 * @param {$nordom} domain
 * @returns {number} can be NO_SUCH_VALUE
 */


function domain_max(domain) {
  ASSERT_NORDOM(domain);
  if (typeof domain === 'number') return domain_num_max(domain);
  return domain_str_max(domain);
}

function domain_num_max(domain) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_sol_max(domain);
  return domain_bit_max(domain);
}

function domain_sol_max(domain) {
  ASSERT_SOLDOM(domain);
  return domain ^ SOLVED_FLAG;
}

var _ref3 = function (stdlib) {
  //'use asm';
  var clz = stdlib.Math.clz32;

  function _domain_bit_max(domain) {
    domain = domain | 0; // Fast paths: these are by far the most used case in our situation
    // (the empty domain check is "free" here)

    switch (domain | 0) {
      case 0:
        return -1;
      // Empty domain

      case 1:
        return 0;
      // Should not be possible. implies a soldom

      case 2:
        return 1;

      case 3:
        return 1;

      default:
        break;
    }

    return 31 - clz(domain) | 0;
  }

  return {
    _domain_bit_max: _domain_bit_max
  };
}({
  Math: {
    clz32: Math.clz32
  }
}),
    _domain_bit_max = _ref3._domain_bit_max;

function domain_bit_max(domain) {
  ASSERT_BITDOM(domain);
  return _domain_bit_max(domain) | 0;
}

function domain_str_max(domain) {
  ASSERT_STRDOM(domain);
  if (!domain) return NO_SUCH_VALUE; // Last encoded value in the string should be the hi of the last range. so max is last value

  return domain_str_decodeValue(domain, domain.length - STR_VALUE_SIZE);
}

function domain_arr_max(domain) {
  ASSERT_ARRDOM(domain);
  var len = domain.length;
  if (len === 0) return NO_SUCH_VALUE;
  return domain[len - 1];
}
/**
 * A domain is "solved" if it covers exactly one value. It is not solved if it is empty.
 *
 * @param {$nordom} domain
 * @returns {boolean}
 */


function domain_isSolved(domain) {
  ASSERT_NORDOM(domain, true, domain__debug);
  ASSERT((domain & SOLVED_FLAG) !== 0 === domain >= SOLVED_FLAG, 'if flag is set the num should be gte to flag');
  return typeof domain === 'number' && domain >= SOLVED_FLAG;
}
/**
 * Purely checks whether given domain is solved to zero
 *
 * @param {$nordom} domain
 * @returns {boolean}
 */


function domain_isZero(domain) {
  ASSERT_NORDOM(domain);
  return domain === DOM_ZERO;
}
/**
 * Purely checks whether given domain does not contain the value zero
 *
 * @param {$nordom} domain
 * @returns {boolean}
 */


function domain_hasNoZero(domain) {
  ASSERT_NORDOM(domain);
  return !domain_hasZero(domain); // This roundabout way of checking ensures true when the domain is empty
}
/**
 * Does the domain have, at least, a zero? This may be a
 * domain that is solved to zero but not necessarily.
 *
 * @param {$nordom} domain
 * @returns {boolean}
 */


function domain_hasZero(domain) {
  ASSERT_NORDOM(domain);
  return domain_min(domain) === 0;
}
/**
 * Is the var strictly the domain [0, 1] ?
 *
 * @param {$nordom} domain
 * @returns {boolean}
 */


function domain_isBool(domain) {
  return domain === DOM_BOOL;
}
/**
 * Does the domain have a zero and one nonzero value?
 *
 * @param {$nordom} domain
 * @returns {boolean}
 */


function domain_isBoolyPair(domain) {
  ASSERT_NORDOM(domain);
  return domain_isBooly(domain) && domain_size(domain) === 2;
}
/**
 * Does the domain have a zero and a nonzero value?
 *
 * @param {$nordom} domain
 * @returns {boolean}
 */


function domain_isBooly(domain) {
  ASSERT_NORDOM(domain);
  return domain_isBool(domain) || !domain_isZero(domain) && domain_hasZero(domain);
}
/**
 * Treat domain as booly ("zero or nonzero")
 * If result then remove the zero, otherwise remove anything nonzero
 * The result should be either the domain solved to zero or any domain that contains no zero. Well or the empty domain.
 *
 * @param {$nordom} domain
 * @param {boolean} result
 * @returns {$nordom}
 */


function domain_resolveAsBooly(domain, result) {
  return result ? domain_removeValue(domain, 0) : domain_removeGtUnsafe(domain, 0);
}
/**
 * Is given domain empty?
 * Assuming a nordom, the only value that returns true is EMPTY.
 * Minifier or browser should eliminate this function.
 *
 * @param {$nordom} domain
 * @returns {boolean}
 */


function domain_isEmpty(domain) {
  ASSERT(domain !== '', 'never use empty string as rejected domain');
  ASSERT_NORDOM(domain);
  return domain === EMPTY;
}
/**
 * Remove all values from domain that are greater
 * than or equal to given value
 *
 * @param {$domain} domain
 * @param {number} value
 * @returns {$domain}
 */


function domain_removeGte(domain, value) {
  ASSERT_NORDOM(domain);
  ASSERT(typeof value === 'number' && value >= SUB - 1 && value <= SUP + 1, 'VALUE_SHOULD_BE_VALID_DOMAIN_ELEMENT', domain__debug(domain), value); // Or +-1...

  if (typeof domain === 'number') return domain_num_removeGte(domain, value);
  return domain_str_removeGte(domain, value);
}

function domain_num_removeGte(domain, value) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_sol_removeGte(domain, value);
  return domain_bitToSmallest(domain_bit_removeGte(domain, value));
}

function domain_sol_removeGte(domain, value) {
  ASSERT_SOLDOM(domain); // (could we just do `return (domain >= (value|SOLVED_FLAG)) ? EMPTY : domain` ?)

  var solvedValue = domain ^ SOLVED_FLAG;
  if (solvedValue >= value) return EMPTY;
  return domain; // No change
}
/**
 * Remove all values from domain that are greater
 * than or equal to given value
 *
 * @param {$numdom} domain
 * @param {number} value NOT a flag
 * @returns {$numdom}
 */


function domain_bit_removeGte(domain, value) {
  switch (value) {
    case 0:
      return 0;

    case 1:
      return domain & 0x00000001;

    case 2:
      return domain & 0x00000003;

    case 3:
      return domain & 0x00000007;

    case 4:
      return domain & 0x0000000f;

    case 5:
      return domain & 0x0000001f;

    case 6:
      return domain & 0x0000003f;

    case 7:
      return domain & 0x0000007f;

    case 8:
      return domain & 0x000000ff;

    case 9:
      return domain & 0x000001ff;

    case 10:
      return domain & 0x000003ff;

    case 11:
      return domain & 0x000007ff;

    case 12:
      return domain & 0x00000fff;

    case 13:
      return domain & 0x00001fff;

    case 14:
      return domain & 0x00003fff;

    case 15:
      return domain & 0x00007fff;

    case 16:
      return domain & 0x0000ffff;

    case 17:
      return domain & 0x0001ffff;

    case 18:
      return domain & 0x0003ffff;

    case 19:
      return domain & 0x0007ffff;

    case 20:
      return domain & 0x000fffff;

    case 21:
      return domain & 0x001fffff;

    case 22:
      return domain & 0x003fffff;

    case 23:
      return domain & 0x007fffff;

    case 24:
      return domain & 0x00ffffff;

    case 25:
      return domain & 0x01ffffff;

    case 26:
      return domain & 0x03ffffff;

    case 27:
      return domain & 0x07ffffff;

    case 28:
      return domain & 0x0fffffff;

    case 29:
      return domain & 0x1fffffff;

    case 30:
      return domain & 0x3fffffff;
  }

  return domain; // When value > 30
}
/**
 * Remove any value from domain that is bigger than or equal to given value.
 * Since domains are assumed to be in CSIS form, we can start from the back and
 * search for the first range that is smaller or contains given value. Prune
 * any range that follows it and trim the found range if it contains the value.
 * Returns whether the domain was changed somehow.
 *
 * @param {$strdom} strdom
 * @param {number} value
 * @returns {$strdom}
 */


function domain_str_removeGte(strdom, value) {
  ASSERT_STRDOM(strdom);

  for (var i = 0, len = strdom.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(strdom, i);
    var hi = domain_str_decodeValue(strdom, i + STR_VALUE_SIZE); // Case: v=5
    // 012 456 // => 012 4
    // 012 45  // => 012 4
    // 012 567 // => 012
    // 012 5   // => 012
    // 012 678 // => 012
    // 012     // => NONE
    // 678     // => empty
    // TODO: if we know the returned domain is a small domain we should prevent the slice at all.

    if (lo >= value) {
      // >
      // 67 9    -> empty
      // 012 789 -> 012
      // ==
      // 567 9   -> empty
      // 012 567 -> 012
      // 012 5   -> 012
      // 5       ->
      if (!i) return EMPTY;
      return domain_toSmallest(strdom.slice(0, i));
    }

    if (value <= hi) {
      if (i === 0 && value === lo + 1) {
        // Domain_createValue(lo);
        var slo = strdom.slice(0, STR_VALUE_SIZE);
        return domain_toSmallest(slo + slo);
      } // 012 456 -> 012 4
      // 012 45  -> 012 4


      var newDomain = strdom.slice(0, i + STR_VALUE_SIZE) + domain_str_encodeValue(value - 1);
      ASSERT(newDomain.length > STR_VALUE_SIZE, 'cannot be a solved value'); // If (value - 1 <= SMALL_MAX_NUM) return newDomain;

      return domain_toSmallest(newDomain);
    }
  }

  return strdom; // 012 -> 012
}
/**
 * Remove all values from domain that are lower
 * than or equal to given value
 *
 * @param {$domain} domain
 * @param {number} value
 * @returns {$domain}
 */


function domain_removeLte(domain, value) {
  ASSERT_NORDOM(domain);
  ASSERT(typeof value === 'number' && value >= SUB - 1 && value <= SUP + 1, 'VALUE_SHOULD_BE_VALID_DOMAIN_ELEMENT', domain__debug(domain), value); // Or +-1...

  if (typeof domain === 'number') return domain_num_removeLte(domain, value);
  return domain_str_removeLte(domain, value);
}

function domain_num_removeLte(domain, value) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_sol_removeLte(domain, value);
  return domain_toSmallest(domain_bit_removeLte(domain, value));
}

function domain_sol_removeLte(domain, value) {
  // (could we just do `return (domain <= (value|SOLVED_FLAG)) ? EMPTY : domain` ?)
  var solvedValue = domain ^ SOLVED_FLAG;
  if (solvedValue <= value) return EMPTY;
  return domain; // No change
}
/**
 * Remove all values from domain that are lower
 * than or equal to given value
 *
 * @param {$numdom} domain
 * @param {number} value NOT a flag
 * @returns {$numdom}
 */


function domain_bit_removeLte(domain, value) {
  switch (value) {
    case 0:
      return domain & 0x7ffffffe;

    case 1:
      return domain & 0x7ffffffc;

    case 2:
      return domain & 0x7ffffff8;

    case 3:
      return domain & 0x7ffffff0;

    case 4:
      return domain & 0x7fffffe0;

    case 5:
      return domain & 0x7fffffc0;

    case 6:
      return domain & 0x7fffff80;

    case 7:
      return domain & 0x7fffff00;

    case 8:
      return domain & 0x7ffffe00;

    case 9:
      return domain & 0x7ffffc00;

    case 10:
      return domain & 0x7ffff800;

    case 11:
      return domain & 0x7ffff000;

    case 12:
      return domain & 0x7fffe000;

    case 13:
      return domain & 0x7fffc000;

    case 14:
      return domain & 0x7fff8000;

    case 15:
      return domain & 0x7fff0000;

    case 16:
      return domain & 0x7ffe0000;

    case 17:
      return domain & 0x7ffc0000;

    case 18:
      return domain & 0x7ff80000;

    case 19:
      return domain & 0x7ff00000;

    case 20:
      return domain & 0x7fe00000;

    case 21:
      return domain & 0x7fc00000;

    case 22:
      return domain & 0x7f800000;

    case 23:
      return domain & 0x7f000000;

    case 24:
      return domain & 0x7e000000;

    case 25:
      return domain & 0x7c000000;

    case 26:
      return domain & 0x78000000;

    case 27:
      return domain & 0x70000000;

    case 28:
      return domain & 0x60000000;

    case 29:
      return domain & 0x40000000;

    case 30:
      return 0;
    // Assuming domain is "valid" this should remove all elements
  }

  if (value < 0) return domain;
  ASSERT(value > SMALL_MAX_NUM, 'if not below zero than above max');
  return 0;
}
/**
 * Remove any value from domain that is lesser than or equal to given value.
 * Since domains are assumed to be in CSIS form, we can start from the front and
 * search for the first range that is smaller or contains given value. Prune
 * any range that preceeds it and trim the found range if it contains the value.
 * Returns whether the domain was changed somehow
 * Does not harm domain
 *
 * @param {$strdom} strdom
 * @param {number} value
 * @returns {$nordom}
 */


function domain_str_removeLte(strdom, value) {
  ASSERT_STRDOM(strdom);

  for (var i = 0, len = strdom.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(strdom, i);
    var hi = domain_str_decodeValue(strdom, i + STR_VALUE_SIZE); // Case: v=5
    // 456 89 => 6 89
    // 45 89  => 89
    // 56 89  => 6 89
    // 5  89  => 5 89
    // 6788   => 67 9
    // 789    => NONE
    // 012    => empty

    if (lo > value) {
      // 678 -> 678
      if (!i) return domain_toSmallest(strdom); // 234 678 -> 678

      return domain_toSmallest(strdom.slice(i));
    }

    if (hi === value) {
      // 45 89  => 89
      // 5  89  => 5 89
      // 15     =>
      if (i >= len - STR_RANGE_SIZE) return EMPTY;
      return domain_toSmallest(strdom.slice(i + STR_RANGE_SIZE));
    }

    if (value <= hi) {
      // 456 89 => 6 89
      // 56 89  => 6 89
      return domain_toSmallest(domain_str_encodeValue(value + 1) + strdom.slice(i + STR_VALUE_SIZE));
    }
  }

  return EMPTY; // 012 -> empty
}
/**
 * Removes all values lower than value.
 * Only "unsafe" in the sense that no flag is raised
 * for oob values (<-1 or >sup+1) or non-numeric values.
 * This unsafeness simplifies other code significantly.
 *
 * @param {$nordom} domain
 * @param {number} value
 * @returns {$nordom}
 */


function domain_removeLtUnsafe(domain, value) {
  ASSERT_NORDOM(domain);
  ASSERT(typeof value === 'number', 'Expecting a numerical value');
  if (value <= SUB) return domain;
  if (value > SUP) return domain_createEmpty();
  return domain_removeLte(domain, value - 1);
}
/**
 * Removes all values lower than value.
 * Only "unsafe" in the sense that no flag is raised
 * for oob values (<-1 or >sup+1) or non-numeric values
 * This unsafeness simplifies other code significantly.
 *
 * @param {$nordom} domain
 * @param {number} value
 * @returns {$nordom}
 */


function domain_removeGtUnsafe(domain, value) {
  ASSERT_NORDOM(domain);
  ASSERT(typeof value === 'number', 'Expecting a numerical value');
  if (value >= SUP) return domain;
  if (value < SUB) return domain_createEmpty();
  return domain_removeGte(domain, value + 1);
}
/**
 * Remove given value from given domain and return
 * the new domain that doesn't contain it.
 *
 * @param {$domain} domain
 * @param {number} value
 * @returns {$domain}
 */


function domain_removeValue(domain, value) {
  ASSERT_NORDOM(domain);
  ASSERT(typeof value === 'number' && value >= 0, 'VALUE_SHOULD_BE_VALID_DOMAIN_ELEMENT', value); // So cannot be negative

  if (typeof domain === 'number') return domain_num_removeValue(domain, value);
  return domain_toSmallest(domain_str_removeValue(domain, value));
}
/**
 * @param {$numdom} domain
 * @param {number} value
 * @returns {$domain}
 */


function domain_num_removeValue(domain, value) {
  if (domain >= SOLVED_FLAG) return domain_sol_removeValue(domain, value);
  return domain_bit_removeValue(domain, value);
}

function domain_sol_removeValue(domain, value) {
  if (value === (domain ^ SOLVED_FLAG)) return EMPTY;
  return domain;
}
/**
 * @param {$bitdom} domain
 * @param {number} value NOT a flag
 * @returns {$bitdom}
 */


function domain_bit_removeValue(domain, value) {
  if (value > 30) return domain_toSmallest(domain); // Though probably already fine, we dont know what `domain` is here

  var flag = 1 << value;
  return domain_bitToSmallest((domain | flag) ^ flag);
}
/**
 * @param {$strdom} domain
 * @param {number} value
 * @returns {$domain} should be smallest
 */


function domain_str_removeValue(domain, value) {
  ASSERT_STRDOM(domain);
  var lastLo = -1;
  var lastHi = -1;

  for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain, i); // Domain is CSIS so once a range was found beyond value, no further ranges can possibly wrap value. return now.

    if (value < lo) break;
    var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);

    if (value <= hi) {
      return _domain_str_removeValue(domain, len, i, lo, hi, value, lastLo, lastHi);
    }

    lastLo = lo;
    lastHi = hi;
  } // "no change" because domain was not found.


  return domain;
}

function _domain_str_removeValue(domain, len, index, lo, hi, value, lastLo, lastHi) {
  ASSERT_STRDOM(domain);
  ASSERT(domain, 'SHOULD_NOT_BE_EMPTY_YET'); // Normalize to (solved) numdom if the result is solved:
  // - one range and it contains two values: solved numdom
  // - oen range and it contains one value: EMPTY
  // - two ranges and both have one value: solved numdom
  // - removed value is >MAX_NUMDOM_VALUE and new highest value <=MAX_NUMDOM_VALUE: numdom
  //   - must remove highest value of dom. either
  //     - from a range of >=2 values (check hi-1)
  //     - from range with one value (check lastHi)

  if (len === STR_RANGE_SIZE) {
    if (hi - lo === 1) return ((lo === value ? hi : lo) | SOLVED_FLAG) >>> 0;
    if (lo === hi) return EMPTY;
    ASSERT(hi - lo > 1);
  } else if (index && len === 2 * STR_RANGE_SIZE && lo === hi && lastLo === lastHi) {
    return (lastLo | SOLVED_FLAG) >>> 0;
  }

  if (index === len - STR_RANGE_SIZE && value === hi) {
    // To numdom checks
    if (lo === hi && lastHi <= SMALL_MAX_NUM) {
      ASSERT(len > STR_RANGE_SIZE, 'this return-EMPTY case is checked above'); // Numdom excluding the last range

      var newLen = len - STR_RANGE_SIZE;
      return domain_strToBit(domain.slice(0, newLen), newLen);
    }

    if (hi - 1 <= SMALL_MAX_NUM) {
      ASSERT(len > STR_RANGE_SIZE || hi - lo > 2, 'one-range check done above, would return solved numdom'); // Numdom excluding last value of last range
      // (the encodeValue step is unfortunate but let's KISS)

      return domain_strToBit(domain.slice(0, -STR_VALUE_SIZE) + domain_str_encodeValue(hi - 1), len);
    }
  } // From this point onward we'll return a strdom


  var before = domain.slice(0, index);
  var after = domain.slice(index + STR_RANGE_SIZE);

  if (hi === value) {
    if (lo === value) {
      // Lo=hi=value; drop this range completely
      return before + after;
    }

    return before + domain_str_encodeRange(lo, hi - 1) + after;
  }

  if (lo === value) {
    return before + domain_str_encodeRange(lo + 1, hi) + after;
  } // We get new two ranges...


  return before + domain_str_encodeRange(lo, value - 1) + domain_str_encodeRange(value + 1, hi) + after;
}
/**
 * Check if every element in one domain not
 * occur in the other domain and vice versa
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */


function domain_sharesNoElements(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  var isNum1 = typeof domain1 === 'number';
  var isNum2 = typeof domain2 === 'number';
  if (isNum1 && isNum2) return domain_numnum_sharesNoElements(domain1, domain2);
  if (isNum1) return domain_numstr_sharesNoElements(domain1, domain2);
  if (isNum2) return domain_numstr_sharesNoElements(domain2, domain1);
  return domain_strstr_sharesNoElements(domain1, domain2);
}

function domain_numnum_sharesNoElements(domain1, domain2) {
  if (domain1 >= SOLVED_FLAG) {
    if (domain2 >= SOLVED_FLAG) return domain_solsol_sharesNoElements(domain1, domain2);
    return domain_solbit_sharesNoElements(domain1, domain2);
  }

  if (domain2 >= SOLVED_FLAG) return domain_solbit_sharesNoElements(domain2, domain1);
  return domain_bitbit_sharesNoElements(domain1, domain2);
}

function domain_solsol_sharesNoElements(domain1, domain2) {
  return domain1 !== domain2;
}

function domain_solbit_sharesNoElements(soldom, bitsol) {
  var solvedValue = soldom ^ SOLVED_FLAG;
  if (solvedValue > SMALL_MAX_NUM) return true;
  return (bitsol & 1 << solvedValue) === 0;
}
/**
 * Check if every element in one domain does not
 * occur in the other domain and vice versa
 *
 * @param {$numdom} domain1
 * @param {$numdom} domain2
 * @returns {boolean}
 */


function domain_bitbit_sharesNoElements(domain1, domain2) {
  // Checks whether not a single bit in set in _both_ domains
  return (domain1 & domain2) === 0;
}
/**
 * Check if every element in one domain not
 * occur in the other domain and vice versa
 *
 * @param {$numdom} numdom
 * @param {$strdom} strdom
 * @returns {boolean}
 */


function domain_numstr_sharesNoElements(numdom, strdom) {
  ASSERT_NUMDOM(numdom);
  ASSERT_STRDOM(strdom);
  if (numdom >= SOLVED_FLAG) return domain_solstr_sharesNoElements(numdom, strdom);
  return domain_bitstr_sharesNoElements(numdom, strdom);
}

function domain_solstr_sharesNoElements(soldom, strdom) {
  var solvedValue = soldom ^ SOLVED_FLAG;

  for (var strIndex = 0, strlen = strdom.length; strIndex < strlen; strIndex += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(strdom, strIndex);
    var hi = domain_str_decodeValue(strdom, strIndex + STR_VALUE_SIZE);
    if (solvedValue < lo) return true; // Solved value not found so element not shared

    if (solvedValue <= hi) return false; // Solved value is in current range so element shared
  } // Did not find a range that contained value so no element shared


  return true;
}

function domain_bitstr_sharesNoElements(bitdom, strdom) {
  ASSERT_BITDOM(bitdom);
  ASSERT_STRDOM(strdom);
  var strIndex = 0;
  var strlen = strdom.length;

  for (var numIndex = 0; numIndex <= SMALL_MAX_NUM; ++numIndex) {
    if (bitdom & 1 << numIndex) {
      // Find numIndex (as value) in domain_str. return true when
      // found. return false if number above small_max_num is found
      while (strIndex < strlen) {
        var lo = domain_str_decodeValue(strdom, strIndex);
        var hi = domain_str_decodeValue(strdom, strIndex + STR_VALUE_SIZE); // There is overlap if numIndex is within current range so return false

        if (numIndex >= lo && numIndex <= hi) return false; // The next value in domain_num can not be smaller and the previous
        // domain_str range was below that value and the next range is beyond
        // the small domain max so there can be no more matching values

        if (lo > SMALL_MAX_NUM) return true; // This range is bigger than target value so the value doesnt
        // exist; skip to next value

        if (lo > numIndex) break;
        strIndex += STR_RANGE_SIZE;
      }

      if (strIndex >= strlen) return true;
    }
  }

  return true; // Dead code?
}
/**
 * Check if every element in one domain not
 * occur in the other domain and vice versa
 *
 * @param {$strdom} domain1
 * @param {$strdom} domain2
 * @returns {boolean}
 */


function domain_strstr_sharesNoElements(domain1, domain2) {
  ASSERT_STRDOM(domain1);
  ASSERT_STRDOM(domain2);
  var len1 = domain1.length;
  var len2 = domain2.length;
  var index1 = 0;
  var index2 = 0;
  var lo1 = domain_str_decodeValue(domain1, STR_FIRST_RANGE_LO);
  var hi1 = domain_str_decodeValue(domain1, STR_FIRST_RANGE_HI);
  var lo2 = domain_str_decodeValue(domain2, STR_FIRST_RANGE_LO);
  var hi2 = domain_str_decodeValue(domain2, STR_FIRST_RANGE_HI);

  while (true) {
    if (hi1 < lo2) {
      index1 += STR_RANGE_SIZE;
      if (index1 >= len1) break;
      lo1 = domain_str_decodeValue(domain1, index1);
      hi1 = domain_str_decodeValue(domain1, index1 + STR_VALUE_SIZE);
    } else if (hi2 < lo1) {
      index2 += STR_RANGE_SIZE;
      if (index2 >= len2) break;
      lo2 = domain_str_decodeValue(domain2, index2);
      hi2 = domain_str_decodeValue(domain2, index2 + STR_VALUE_SIZE);
    } else {
      ASSERT(lo1 <= lo2 && lo2 <= hi1 || lo2 <= lo1 && lo1 <= hi2, 'domain_strstr_sharesNoElements: both ranges must overlap at least for some element because neither ends before the other [' + lo1 + ',' + hi1 + ' - ' + lo2 + ',' + hi2 + ']');
      return false;
    }
  } // No overlaps found


  return true;
}
/**
 * @param {number} value
 * @returns {$domain} will be a soldom
 */


function domain_createValue(value) {
  ASSERT(value >= SUB, 'domain_createValue: value should be within valid range', SUB, '<=', value);
  ASSERT(value <= SUP, 'domain_createValue: value should be within valid range', SUP, '>=', value);
  return (value | SOLVED_FLAG) >>> 0;
}
/**
 * @param {number} lo
 * @param {number} hi
 * @returns {$nordom}
 */


function domain_createRange(lo, hi) {
  ASSERT(lo >= SUB, 'lo should be >= SUB', lo, hi);
  ASSERT(hi <= SUP, 'hi should be <= SUP', lo, hi);
  ASSERT(lo <= hi, 'should be lo<=hi', lo, hi);
  if (lo === hi) return domain_createValue(lo);
  if (hi <= SMALL_MAX_NUM) return domain_num_createRange(lo, hi);
  return domain_str_encodeRange(lo, hi);
}
/**
 * @param {number} lo
 * @param {number} hi
 * @returns {$bitdom}
 */


function domain_num_createRange(lo, hi) {
  return (1 << 1 + hi - lo) - 1 << lo;
}
/**
 * This function mainly prevents leaking EMPTY outside of domain.js
 * Browsers should optimize this away, if the minifier didn't already.
 *
 * @returns {$numdom}
 */


function domain_createEmpty() {
  return EMPTY;
}

function domain_createBoolyPair(value) {
  if (value === 0) return domain_createValue(0);
  if (value === 1) return domain_createRange(0, 1);
  return domain_arrToSmallest([0, 0, value, value]); // Meh. we can optimize this if it turns out a perf issue
}
/**
 * Return a domain containing all numbers from zero to the highest
 * number in given domain. In binary this means we'll set all the
 * bits of lower value than the most-significant set bit.
 *
 * @param {$numdom} domain_num Must be > ZERO
 * @returns {$domain} never solved since that requires ZERO to be a valid input, which it isnt
 */


function domain_numnum_createRangeZeroToMax(domain_num) {
  ASSERT_NUMDOM(domain_num);
  ASSERT(domain_num < SOLVED_FLAG, 'should not be solved num');
  ASSERT(domain_num !== 1 << 0, 'INVALID INPUT, ZERO would be a solved domain which is caught elsewhere'); // If (domain_num === (1 << 0)) return SOLVED_FLAG; // note: SOLVED_FLAG|0 === SOLVED_FLAG.

  domain_num |= domain_num >> 1;
  domain_num |= domain_num >> 2;
  domain_num |= domain_num >> 4;
  domain_num |= domain_num >> 8;
  domain_num |= domain_num >> 16;
  return domain_num;
}
/**
 * Get a domain representation in array form
 *
 * @param {$domain} domain
 * @param {boolean} [clone] If input is array, slice the array? (other cases will always return a fresh array)
 * @returns {$arrdom} (small domains will also be arrays)
 */


function domain_toArr(domain, clone) {
  if (typeof domain === 'number') return domain_numToArr(domain);
  if (typeof domain === 'string') return domain_strToArr(domain);
  ASSERT(Array.isArray(domain), 'can only be array now');
  if (clone) return domain.slice(0);
  return domain;
}

function domain_numToArr(domain) {
  ASSERT_NUMDOM(domain);
  if (domain >= SOLVED_FLAG) return domain_solToArr(domain);
  return domain_bitToArr(domain);
}

function domain_solToArr(domain) {
  var solvedValue = domain ^ SOLVED_FLAG;
  return [solvedValue, solvedValue];
}

function domain_bitToArr(domain) {
  if (domain === EMPTY) return [];
  var arr = [];
  var lo = -1;
  var hi = -1;

  if (1 << 0 & domain) {
    lo = 0;
    hi = 0;
  }

  if (1 << 1 & domain) {
    if (lo !== 0) {
      // Lo is either 0 or nothing
      lo = 1;
    }

    hi = 1; // There cannot be a gap yet
  }

  if (1 << 2 & domain) {
    if (hi === 0) {
      arr.push(0, 0);
      lo = 2;
    } else if (hi !== 1) {
      // If hi isnt 0 and hi isnt 1 then hi isnt set and so lo isnt set
      lo = 2;
    }

    hi = 2;
  }

  if (1 << 3 & domain) {
    if (hi < 0) {
      // This is the LSB that is set
      lo = 3;
    } else if (hi !== 2) {
      // There's a gap so push prev range now
      arr.push(lo, hi);
      lo = 3;
    }

    hi = 3;
  } // Is the fifth bit or higher even set at all? for ~85% that is not the case at this point


  if (domain >= 1 << 4) {
    for (var i = 4; i <= SMALL_MAX_NUM; ++i) {
      if (domain & 1 << i) {
        if (hi < 0) {
          // This is the LSB that is set
          lo = i;
        } else if (hi !== i - 1) {
          // There's a gap so push prev range now
          arr.push(lo, hi);
          lo = i;
        }

        hi = i;
      }
    }
  } // Since the domain wasn't empty (checked at start) there
  // must now be an unpushed lo/hi pair left to push...


  arr.push(lo, hi);
  return arr;
}

function domain_strToArr(domain) {
  ASSERT_STRDOM(domain);
  if (domain === EMPTY) return [];
  var arr = [];

  for (var i = 0, len = domain.length; i < len; i += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain, i);
    var hi = domain_str_decodeValue(domain, i + STR_VALUE_SIZE);
    arr.push(lo, hi);
  }

  return arr;
}
/**
 * Get a domain representation in string form
 *
 * @param {$domain} domain
 * @returns {$strdom} (small domains will also be strings)
 */


function domain_toStr(domain) {
  if (typeof domain === 'number') return domain_numToStr(domain);
  if (typeof domain === 'string') return domain;
  ASSERT(Array.isArray(domain), 'can only be array now');
  return domain_arrToStr(domain);
}

function domain_numToStr(domain) {
  if (domain >= SOLVED_FLAG) return domain_solToStr(domain);
  return domain_bitToStr(domain);
}

function domain_solToStr(domain) {
  var solvedValue = domain ^ SOLVED_FLAG;
  return domain_str_encodeRange(solvedValue, solvedValue);
}

function domain_bitToStr(domain) {
  ASSERT_NUMDOM(domain);
  if (domain === EMPTY) return EMPTY_STR;
  var str = EMPTY_STR;
  var lo = -1;
  var hi = -1;

  if (1 << 0 & domain) {
    lo = 0;
    hi = 0;
  }

  if (1 << 1 & domain) {
    if (lo !== 0) {
      // Lo is either 0 or nothing
      lo = 1;
    }

    hi = 1; // There cannot be a gap yet
  }

  if (1 << 2 & domain) {
    if (hi === 0) {
      str = domain_str_encodeRange(0, 0);
      lo = 2;
    } else if (hi !== 1) {
      // If hi isnt 0 and hi isnt 1 then hi isnt set and so lo isnt set
      lo = 2;
    }

    hi = 2;
  }

  if (1 << 3 & domain) {
    if (hi < 0) {
      // This is the LSB that is set
      lo = 3;
    } else if (hi !== 2) {
      // There's a gap so push prev range now
      str += domain_str_encodeRange(lo, hi);
      lo = 3;
    }

    hi = 3;
  } // Is the fifth bit or higher even set at all? for ~85% that is not the case at this point


  if (domain >= 1 << 4) {
    for (var i = 4; i <= SMALL_MAX_NUM; ++i) {
      if (domain & 1 << i) {
        if (hi < 0) {
          // This is the LSB that is set
          lo = i;
        } else if (hi !== i - 1) {
          // There's a gap so push prev range now
          str += domain_str_encodeRange(lo, hi);
          lo = i;
        }

        hi = i;
      }
    }
  } // Since the domain wasn't empty (checked at start) there
  // must now be an unpushed lo/hi pair left to push...


  str += domain_str_encodeRange(lo, hi);
  return str;
}

function domain_arrToStr(arrdom) {
  ASSERT_ARRDOM(arrdom);
  var str = EMPTY_STR;

  for (var i = 0, len = arrdom.length; i < len; i += ARR_RANGE_SIZE) {
    var lo = arrdom[i];
    var hi = arrdom[i + 1];
    ASSERT(typeof lo === 'number');
    ASSERT(typeof hi === 'number');
    str += domain_str_encodeRange(lo, hi);
  }

  return str;
}
/**
 * Returns the smallest representation of given domain. The order is:
 * soldom < numdom < strdom
 * Won't return arrdoms.
 *
 * @param {$domain} domain
 * @returns {$domain}
 */


function domain_toSmallest(domain) {
  if (typeof domain === 'number') return domain_numToSmallest(domain);
  ASSERT(typeof domain === 'string', 'there is no arrtosmallest', domain);
  return domain_strToSmallest(domain);
}

function domain_anyToSmallest(domain) {
  // For tests and config import
  if (Array.isArray(domain)) domain = domain_arrToStr(domain);
  return domain_toSmallest(domain);
}

function domain_numToSmallest(domain) {
  if (domain >= SOLVED_FLAG) return domain;
  return domain_bitToSmallest(domain);
}

function domain_bitToSmallest(domain) {
  var value = domain_getValue(domain);
  if (value === NO_SUCH_VALUE) return domain;
  return domain_createValue(value);
}

function domain_strToSmallest(domain) {
  var len = domain.length;
  if (!len) return EMPTY;
  var min = domain_str_decodeValue(domain, 0);
  var max = domain_str_decodeValue(domain, len - STR_VALUE_SIZE);

  if (len === STR_RANGE_SIZE) {
    if (min === max) return domain_createValue(min);
  }

  if (max <= SMALL_MAX_NUM) return domain_strToBit(domain, len);
  return domain;
}
/**
 * Convert string domain to number domain. Assumes domain
 * is eligible to be a small domain.
 *
 * @param {$strdom} strdom
 * @param {number} len Cache of domain.length (string length... not value count)
 * @returns {$strdom}
 */


function domain_strToBit(strdom, len) {
  ASSERT_STRDOM(strdom);
  ASSERT(strdom.length === len, 'len should be cache of domain.length');
  ASSERT(domain_max(strdom) <= SMALL_MAX_NUM, 'SHOULD_BE_SMALL_DOMAIN', strdom, domain_max(strdom));
  if (len === 0) return EMPTY;
  var lo = domain_str_decodeValue(strdom, 0);
  var hi = domain_str_decodeValue(strdom, 0 + STR_VALUE_SIZE); // If (len === STR_RANGE_SIZE && lo === hi) {
  //  return (lo | SOLVED_FLAG) >>> 0; // >>>0 forces unsigned.
  // }

  var out = domain_bit_addRange(EMPTY, lo, hi);

  for (var i = STR_RANGE_SIZE; i < len; i += STR_RANGE_SIZE) {
    var _lo = domain_str_decodeValue(strdom, i);

    var _hi = domain_str_decodeValue(strdom, i + STR_VALUE_SIZE);

    out = domain_bit_addRange(out, _lo, _hi);
  }

  return out;
}

function domain_arrToSmallest(arrdom) {
  ASSERT_ARRDOM(arrdom);
  var len = arrdom.length;
  if (len === 0) return EMPTY;
  if (len === ARR_RANGE_SIZE && arrdom[0] === arrdom[1]) return domain_createValue(arrdom[0]);
  ASSERT(typeof arrdom[arrdom.length - 1] === 'number');
  var max = domain_arr_max(arrdom);
  if (max <= SMALL_MAX_NUM) return _domain_arrToBit(arrdom, len);
  return domain_arrToStr(arrdom);
}

function _domain_arrToBit(domain, len) {
  ASSERT_ARRDOM(domain);
  ASSERT(domain[domain.length - 1] <= SMALL_MAX_NUM, 'SHOULD_BE_SMALL_DOMAIN', domain); // TODO
  // if (domain.length === 2 && domain[0] === domain[1]) return (domain[0] | SOLVED_FLAG) >>> 0;

  var out = 0;

  for (var i = 0; i < len; i += ARR_RANGE_SIZE) {
    out = domain_bit_addRange(out, domain[i], domain[i + 1]);
  }

  return out;
} // This file only concerns itself with adding two domains


var min = Math.min;
/**
 * Does not harm input domains
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {$domain}
 */

function domain_plus(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2); // Note: this is not 0+x=x. this is nothing+something=nothing because the domains contain no value

  if (!domain1 || !domain2) return EMPTY;
  var isNum1 = typeof domain1 === 'number';
  var isNum2 = typeof domain2 === 'number';
  var result;

  if (isNum1 && isNum2) {
    // If the highest number in the result is below the max of a small
    // domain we can take a fast path for it. this case happens often.
    if (_domain_plusWillBeSmall(domain1, domain2)) {
      return domain_toSmallest(_domain_plusNumNumNum(domain1, domain2));
    }

    result = _domain_plusNumNumStr(domain1, domain2);
  } else if (isNum1) result = _domain_plusNumStrStr(domain1, domain2);else if (isNum2) result = _domain_plusNumStrStr(domain2, domain1); // Swapped domains!
  else result = _domain_plusStrStrStr(domain1, domain2);

  return domain_toSmallest(domain_str_simplify(result));
}

function _domain_plusStrStrStr(domain1, domain2) {
  ASSERT_STRDOM(domain1);
  ASSERT_STRDOM(domain2); // Simplify the domains by closing gaps since when we add
  // the domains, the gaps will close according to the
  // smallest interval width in the other domain.

  var domains = domain_str_closeGaps(domain1, domain2);
  domain1 = domains[0];
  domain2 = domains[1];
  var newDomain = EMPTY_STR;

  for (var index = 0, len = domain1.length; index < len; index += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain1, index);
    var hi = domain_str_decodeValue(domain1, index + STR_VALUE_SIZE);
    newDomain += _domain_plusRangeStrStr(lo, hi, domain2);
  }

  return newDomain;
}

function _domain_plusWillBeSmall(domain1, domain2) {
  // If both domains are small enough they cannot add to a domain beyond the max
  ASSERT(typeof domain1 === 'number', 'ONLY_WITH_NUMBERS');
  ASSERT(typeof domain2 === 'number', 'ONLY_WITH_NUMBERS'); // If (((domain1 | domain2) >>> 0) < (1 << 15)) return true; // could catch some cases
  // if (domain1 < (1<<15) && domain2 < (1<<15)) return true;  // alternative of above

  return domain_max(domain1) + domain_max(domain2) <= SMALL_MAX_NUM; // If max changes, update above too!
}

function _domain_plusNumNumStr(domain1, domain2) {
  ASSERT_NUMDOM(domain1);
  ASSERT_NUMDOM(domain2);

  if (domain1 >= SOLVED_FLAG) {
    var solvedValue = domain1 ^ SOLVED_FLAG;
    return _domain_plusRangeNumStr(solvedValue, solvedValue, domain2);
  }

  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain1 & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY_STR;

  while (flagValue <= domain1 && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain1) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain += _domain_plusRangeNumStr(lo, hi, domain2);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain + _domain_plusRangeNumStr(lo, hi, domain2);
}

function _domain_plusNumNumNum(domain1, domain2) {
  ASSERT_NUMDOM(domain1);
  ASSERT_NUMDOM(domain2);
  ASSERT(domain1 !== EMPTY && domain2 !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');
  ASSERT(domain_max(domain1) + domain_max(domain2) <= SMALL_MAX_NUM, 'THE_POINTE');

  if (domain1 >= SOLVED_FLAG) {
    var solvedValue = domain1 ^ SOLVED_FLAG;
    return _domain_plusRangeNumNum(solvedValue, solvedValue, domain2);
  }

  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain1 & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY;

  while (flagValue <= domain1 && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain1) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain |= _domain_plusRangeNumNum(lo, hi, domain2);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain | _domain_plusRangeNumNum(lo, hi, domain2);
}

function _domain_plusRangeNumNum(loi, hii, domain_num) {
  ASSERT_NUMDOM(domain_num);
  ASSERT(domain_num !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');

  if (domain_num >= SOLVED_FLAG) {
    var solvedValue = domain_num ^ SOLVED_FLAG;
    return _domain_plusRangeRangeNum(loi, hii, solvedValue, solvedValue);
  }

  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain_num & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY;

  while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain_num) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain |= _domain_plusRangeRangeNum(loi, hii, lo, hi);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain | _domain_plusRangeRangeNum(loi, hii, lo, hi);
}

function _domain_plusNumStrStr(domain_num, domain_str) {
  ASSERT_NUMDOM(domain_num);
  ASSERT_STRDOM(domain_str);

  if (domain_num >= SOLVED_FLAG) {
    var solvedValue = domain_num ^ SOLVED_FLAG;
    return _domain_plusRangeStrStr(solvedValue, solvedValue, domain_str);
  }

  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain_num & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY_STR;

  while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain_num) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain += _domain_plusRangeStrStr(lo, hi, domain_str);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain + _domain_plusRangeStrStr(lo, hi, domain_str);
}

function _domain_plusRangeNumStr(loi, hii, domain_num) {
  ASSERT_NUMDOM(domain_num);

  if (domain_num >= SOLVED_FLAG) {
    var solvedValue = domain_num ^ SOLVED_FLAG;
    return _domain_plusRangeRangeStr(loi, hii, solvedValue, solvedValue);
  }

  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain_num & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY_STR;

  while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain_num) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain += _domain_plusRangeRangeStr(loi, hii, lo, hi);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain + _domain_plusRangeRangeStr(loi, hii, lo, hi);
}

function _domain_plusRangeStrStr(loi, hii, domain_str) {
  ASSERT_STRDOM(domain_str);
  var newDomain = EMPTY_STR;

  for (var index = 0, len = domain_str.length; index < len; index += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain_str, index);
    var hi = domain_str_decodeValue(domain_str, index + STR_VALUE_SIZE);
    newDomain += _domain_plusRangeRangeStr(loi, hii, lo, hi);
  }

  return newDomain;
}

function _domain_plusRangeRangeStr(loi, hii, loj, hij) {
  ASSERT(loi + loj >= 0, 'DOMAINS_SHOULD_NOT_HAVE_NEGATIVES');
  var lo = loi + loj;

  if (lo <= SUP) {
    // If lo exceeds SUP the resulting range is completely OOB and we ignore it.
    var hi = min(SUP, hii + hij);
    return domain_str_encodeRange(lo, hi);
  }

  return EMPTY_STR;
}

function _domain_plusRangeRangeNum(loi, hii, loj, hij) {
  ASSERT(loi + loj >= 0, 'DOMAINS_SHOULD_NOT_HAVE_NEGATIVES');
  ASSERT(loi + loj <= SMALL_MAX_NUM, 'RESULT_SHOULD_NOT_EXCEED_SMALL_DOMAIN');
  ASSERT(hii + hij <= SMALL_MAX_NUM, 'RESULT_SHOULD_NOT_EXCEED_SMALL_DOMAIN');
  var domain = domain_num_createRange(loi + loj, hii + hij);
  ASSERT(typeof domain === 'number' && domain < SOLVED_FLAG, 'expecting numdom, not soldom');
  return domain;
} // This file only concerns itself with subtracting two domains


var max = Math.max;
/**
 * Subtract one domain from the other
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {$domain}
 */

function domain_minus(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2); // Note: this is not x-0=x. this is nothing-something=nothing because the domains contain no value

  if (!domain1 || !domain2) return EMPTY; // Optimize an easy path: if both domains contain zero the
  // result will always be [0, max(domain1)], because:
  // d1-d2 = [lo1-hi2, hi1-lo2] -> [0-hi2, hi1-0] -> [0, hi1]

  if (domain_min(domain1) === 0 && domain_min(domain2) === 0) {
    return domain_createRange(0, domain_max(domain1));
  }

  var isNum1 = typeof domain1 === 'number';
  var isNum2 = typeof domain2 === 'number';

  if (isNum1) {
    // Note: if domain1 is a small domain the result is always a small domain
    if (isNum2) return domain_toSmallest(_domain_minusNumNum(domain1, domain2));
    var D = domain_toSmallest(_domain_minusNumStr(domain1, domain2));
    if (D === EMPTY_STR) return EMPTY;
    return D;
  }

  var result;
  if (isNum2) result = _domain_minusStrNumStr(domain1, domain2); // Cannot swap minus args!
  else result = _domain_minusStrStrStr(domain1, domain2);
  var E = domain_toSmallest(domain_str_simplify(result));
  if (E === EMPTY_STR) return EMPTY;
  return E;
}

function _domain_minusStrStrStr(domain1, domain2) {
  ASSERT_STRDOM(domain1);
  ASSERT_STRDOM(domain2); // Simplify the domains by closing gaps since when we add
  // the domains, the gaps will close according to the
  // smallest interval width in the other domain.

  var domains = domain_str_closeGaps(domain1, domain2);
  domain1 = domains[0];
  domain2 = domains[1];
  ASSERT(typeof domain1 === 'string', 'make sure closeGaps doesnt "optimize"');
  ASSERT(typeof domain2 === 'string', 'make sure closeGaps doesnt "optimize"');
  var newDomain = EMPTY_STR;

  for (var index = 0, len = domain1.length; index < len; index += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain1, index);
    var hi = domain_str_decodeValue(domain1, index + STR_VALUE_SIZE);
    newDomain += _domain_minusRangeStrStr(lo, hi, domain2);
  }

  return newDomain;
}

function _domain_minusNumNum(domain1, domain2) {
  if (domain1 >= SOLVED_FLAG) {
    var solvedValue = domain1 ^ SOLVED_FLAG;

    if (domain2 >= SOLVED_FLAG) {
      var result = solvedValue - (domain2 ^ SOLVED_FLAG);
      if (result < 0) return EMPTY;
      return domain_createValue(result);
    }

    if (solvedValue <= SMALL_MAX_NUM) return _domain_minusRangeNumNum(solvedValue, solvedValue, domain2);
    return _domain_minusRangeNumStr(solvedValue, solvedValue, domain2);
  }

  return _domain_minusNumNumNum(domain1, domain2);
}

function _domain_minusNumNumNum(domain1, domain2) {
  ASSERT_NUMDOM(domain1);
  ASSERT_NUMDOM(domain2);
  ASSERT(domain1 !== EMPTY && domain2 !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');
  ASSERT(domain_max(domain1) - domain_min(domain2) <= SMALL_MAX_NUM, 'MAX-MIN_MUST_NOT_EXCEED_NUMDOM_RANGE');
  ASSERT(domain1 < SOLVED_FLAG, 'solved domain1 is expected to be caught elsewhere');
  if (domain_num_containsValue(domain1, 0) && domain_num_containsValue(domain2, 0)) return domain_numnum_createRangeZeroToMax(domain1);
  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain1 & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY;

  while (flagValue <= domain1 && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain1) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain |= _domain_minusRangeNumNum(lo, hi, domain2);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain | _domain_minusRangeNumNum(lo, hi, domain2);
}

function _domain_minusNumStr(domain_num, domain_str) {
  if (domain_num >= SOLVED_FLAG) {
    var solvedValue = domain_num ^ SOLVED_FLAG;
    if (solvedValue <= SMALL_MAX_NUM) return _domain_minusRangeStrNum(solvedValue, solvedValue, domain_str);
    return _domain_minusRangeStrStr(solvedValue, solvedValue, domain_str);
  }

  return _domain_minusNumStrNum(domain_num, domain_str);
}

function _domain_minusNumStrNum(domain_num, domain_str) {
  ASSERT_NUMDOM(domain_num);
  ASSERT_STRDOM(domain_str);
  ASSERT(domain_num !== EMPTY && domain_str !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');
  ASSERT(domain_max(domain_num) - domain_min(domain_str) <= SMALL_MAX_NUM, 'MAX-MIN_MUST_NOT_EXCEED_NUMDOM_RANGE');

  if (domain_num >= SOLVED_FLAG) {
    var solvedValue = domain_num ^ SOLVED_FLAG;
    return _domain_minusRangeStrNum(solvedValue, solvedValue, domain_str);
  } // Since any number above the small domain max ends up with negative, which is truncated, use the max of domain1


  if (domain_num_containsValue(domain_num, 0) && domain_min(domain_str) === 0) return domain_numnum_createRangeZeroToMax(domain_num);
  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain_num & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY;

  while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain_num) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain |= _domain_minusRangeStrNum(lo, hi, domain_str);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain | _domain_minusRangeStrNum(lo, hi, domain_str);
}

function _domain_minusRangeNumNum(loi, hii, domain_num) {
  ASSERT_NUMDOM(domain_num);
  ASSERT(domain_num !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE');

  if (domain_num >= SOLVED_FLAG) {
    var solvedValue = domain_num ^ SOLVED_FLAG;
    return _domain_minusRangeRangeNum(loi, hii, solvedValue, solvedValue);
  }

  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain_num & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY;

  while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain_num) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain |= _domain_minusRangeRangeNum(loi, hii, lo, hi);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain | _domain_minusRangeRangeNum(loi, hii, lo, hi);
}

function _domain_minusStrNumStr(domain_str, domain_num) {
  ASSERT_NUMDOM(domain_num);
  ASSERT_STRDOM(domain_str);
  ASSERT(domain_num !== EMPTY && domain_str !== EMPTY, 'SHOULD_BE_CHECKED_ELSEWHERE'); // Optimize an easy path: if both domains contain zero the
  // result will always be [0, max(domain1)], because:
  // d1-d2 = [lo1-hi2, hi1-lo2] -> [0-hi2, hi1-0] -> [0, hi1]

  if (domain_min(domain_str) === 0 && domain_min(domain_num) === 0) {
    return domain_createRange(0, domain_max(domain_str));
  }

  var newDomain = EMPTY_STR;

  for (var index = 0, len = domain_str.length; index < len; index += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain_str, index);
    var hi = domain_str_decodeValue(domain_str, index + STR_VALUE_SIZE);
    newDomain += _domain_minusRangeNumStr(lo, hi, domain_num);
  }

  return newDomain;
}

function _domain_minusRangeNumStr(loi, hii, domain_num) {
  ASSERT_NUMDOM(domain_num);
  if (domain_num === EMPTY) return EMPTY;

  if (domain_num >= SOLVED_FLAG) {
    var solvedValue = domain_num ^ SOLVED_FLAG;
    return _domain_minusRangeRangeStr(loi, hii, solvedValue, solvedValue);
  }

  var flagIndex = 0; // Find the first set bit. must find something because small domain and not empty

  while ((domain_num & 1 << flagIndex) === 0) {
    ++flagIndex;
  }

  var lo = flagIndex;
  var hi = flagIndex;
  var flagValue = 1 << ++flagIndex;
  var newDomain = EMPTY_STR;

  while (flagValue <= domain_num && flagIndex <= SMALL_MAX_NUM) {
    if ((flagValue & domain_num) > 0) {
      if (hi !== flagIndex - 1) {
        // There's a gap so push prev range now
        newDomain += _domain_minusRangeRangeStr(loi, hii, lo, hi);
        lo = flagIndex;
      }

      hi = flagIndex;
    }

    flagValue = 1 << ++flagIndex;
  }

  return newDomain + _domain_minusRangeRangeStr(loi, hii, lo, hi);
}

function _domain_minusRangeStrStr(loi, hii, domain_str) {
  ASSERT_STRDOM(domain_str);
  var newDomain = EMPTY_STR;

  for (var index = 0, len = domain_str.length; index < len; index += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain_str, index);
    var hi = domain_str_decodeValue(domain_str, index + STR_VALUE_SIZE);
    newDomain += _domain_minusRangeRangeStr(loi, hii, lo, hi);
  }

  return newDomain;
}

function _domain_minusRangeStrNum(loi, hii, domain_str) {
  ASSERT_STRDOM(domain_str);
  var newDomain = EMPTY;

  for (var index = 0, len = domain_str.length; index < len; index += STR_RANGE_SIZE) {
    var lo = domain_str_decodeValue(domain_str, index);
    var hi = domain_str_decodeValue(domain_str, index + STR_VALUE_SIZE);
    newDomain |= _domain_minusRangeRangeNum(loi, hii, lo, hi);
  }

  return newDomain;
}

function _domain_minusRangeRangeStr(loi, hii, loj, hij) {
  var hi = hii - loj;

  if (hi >= SUB) {
    // Silently ignore results that are OOB
    var lo = max(SUB, loi - hij);
    return domain_str_encodeRange(lo, hi);
  }

  return EMPTY_STR;
}

function _domain_minusRangeRangeNum(loi, hii, loj, hij) {
  var hi = hii - loj;

  if (hi >= SUB) {
    // Silently ignore results that are OOB
    var lo = max(SUB, loi - hij);
    ASSERT(lo <= SMALL_MAX_NUM, 'RESULT_SHOULD_NOT_EXCEED_SMALL_DOMAIN');
    ASSERT(hi <= SMALL_MAX_NUM, 'RESULT_SHOULD_NOT_EXCEED_SMALL_DOMAIN');
    var domain = domain_num_createRange(lo, hi);
    ASSERT(typeof domain === 'number' && domain < SOLVED_FLAG, 'expecting numdom, not soldom');
    return domain;
  }

  return EMPTY;
}

var TRIE_ROOT_OFFSET = 0;
var TRIE_BUCKET_COUNT = 10; // 10 digits

var TRIE_NODE_SIZE = TRIE_BUCKET_COUNT + 1; // Inc value

var TRIE_INITIAL_SIZE = 16 * 1024;
var TRIE_MINIMAL_GROWTH = 4 * 1024;
var TRIE_KEY_NOT_FOUND = -1;
var TRIE_EMPTY = undefined;
var TRIE_8_BIT = 8;
var TRIE_16_BIT = 16;
var TRIE_32_BIT = 32;
var TRIE_64_BIT = 64;
// `size(Trie)-1`) so initially 11 bytes, later 12 bytes and then 22 bytes once the number of
// nodes exceeds 255

/**
 * Create a new trie and, optionally, initialize it
 * with given values as keys and their index as value.
 * Check `trie_add` for assumed key composition restrictions
 *
 * @param {string[]} [valuesByIndex] If exists, adds all values in array as keys, index as values
 * @param {number} [initialLength] Hint to help control memory consumption for large/small tries. This length is in cells, not bytes. (byteLength=length*(bitsize/8))
 * @param {number} [initialBitsize] Hint to set bitsize explicitly. One of: 8 16 32 64
 * @returns {$trie}
 */

function trie_create(valuesByIndex, initialLength, initialBitsize) {
  var size = initialLength | 0 || TRIE_INITIAL_SIZE; // TODO: if (!size) THROW('fixme'); // Blabla it's possible the constant is not yet initialized due to minification. dont initialize a trie in module global space

  var bits = Math.max(trie_getValueBitsize(size), initialBitsize | 0); // Given bitsize might be lower than max address, ignore it in that case

  var buffer = trie_createBuffer(size, bits); // Have to use a wrapper because the buffer ref may change when it grows
  // otherwise we could just store the meta data inside the buffer. but at
  // least this is easier to read :)

  var trie = {
    _class: '$trie',
    buffer: buffer,
    bits: bits,
    // 8 16 32 (64?)
    lastNode: TRIE_ROOT_OFFSET,
    // Pointer to last node in the buffer
    count: 0 // Number of keys in the Trie

  };

  if (process.env.NODE_ENV !== 'production') {
    trie = _objectSpread$1({}, trie, {
      // Debug stats... any use should be wrapped in ASSERT so that it's use gets removed in a dist
      _mallocs: String(buffer.length),
      // Malloc steps in a string
      _adds: 0,
      // Number of trie_add calls
      _addSteps: 0,
      // Sum of steps taken in all trie_add calls
      _hass: 0,
      // Number of trie_has calls
      _gets: 0,
      // Number of trie_get calls (and also contains has)
      _getSteps: 0 // Sum of steps for all gets on this trie

    });
  }

  if (valuesByIndex) {
    for (var i = 0, n = valuesByIndex.length; i < n; ++i) {
      trie_add(trie, valuesByIndex[i], i);
    }
  }

  return trie;
}
/**
 * Create a buffer
 *
 * @param {number} size Length of the buffer in cells, not bytes (!)
 * @param {number} bits One of: 8 16 32 64
 * @returns {TypedArray}
 */


function trie_createBuffer(size, bits) {
  switch (bits) {
    case TRIE_8_BIT:
      return new Uint8Array(size);

    case TRIE_16_BIT:
      return new Uint16Array(size);

    case TRIE_32_BIT:
      return new Uint32Array(size);

    case TRIE_64_BIT:
      return new Float64Array(size);
    // Let's hope not ;)

    default:
      THROW('Unsupported bit size');
  }
}
/**
 * Reserve a part of the Trie memory to represent a node in the Trie.
 *
 * In this particular implementation nodes are of fixed width. It's
 * a field of 10 address cells and one value cell.
 *
 * Address cells point to other nodes. If zero, there is none (because
 * that would be the root node) and a search ends in not found.
 *
 * Value cells that are zero (default) are also "not found".
 *
 * @returns {Uint16Array}
 */


function trie_addNode(trie) {
  var newNodePtr = trie.lastNode + TRIE_NODE_SIZE;
  trie.lastNode = newNodePtr; // Technically the `while` is valid (instead of an `if`) but only
  // if the buffer could grow by a smaller amount than the node size...
  // note: buffer.length is cell size, buffer.byteLength is byte size. we want cells here.

  while (newNodePtr + TRIE_NODE_SIZE >= trie.buffer.length) {
    trie_grow(trie);
  }

  return newNodePtr;
}
/**
 * Allocate more size for this Trie
 *
 * Basically creates a new buffer with a larger size and then copies
 * the current buffer into it. If the new size exceeds the max size
 * of the current type (16bit/32bit) then the buffer is converted to
 * a bigger bit size automagically.
 * The trie buffer reference will be updated with the new buffer
 *
 * @param {$trie} trie
 */


function trie_grow(trie) {
  var len = trie.buffer.length; // Cell size! not byte size.

  var newSize = ~~(len * 1.1); // Grow by 10% (an arbitrary number)

  if (len + TRIE_MINIMAL_GROWTH > newSize) newSize = TRIE_MINIMAL_GROWTH + len;
  trie_malloc(trie, newSize);
}
/**
 * Allocate space for a Trie and copy given Trie to it.
 * Will grow bitsize if required, but never shrink it.
 * (Bitsize must grow if cell size exceeds certain threshholds
 * because otherwise we can't address all bytes in the buffer)
 *
 * @param {$trie} trie
 * @param {number} size Cell size, not byte size
 */


function trie_malloc(trie, size) {
  // Make sure addressing fits
  var newBits = trie_getValueBitsize(size); // Dont shrink bit size even if length would allow it; "large" _values_ may require it
  // (our tries dont need to shrink)

  trie.bits = Math.max(trie.bits, newBits);
  var nbuf = trie_createBuffer(size, trie.bits);
  nbuf.set(trie.buffer, 0);
  if (process.env.NODE_ENV !== 'production') ASSERT(trie._mallocs += ' ' + nbuf.length);
  trie.buffer = nbuf;
}
/**
 * Return the cell width in bits to fit given value.
 * For example, numbers below 256 can be represented in
 * 8 bits but numbers above it will need at least 16 bits.
 * Max is 64 but you can't pass on larger numbers in JS, anyways :)
 *
 * @param {number} value
 * @returns {number}
 */


function trie_getValueBitsize(value) {
  if (value < 0x100) return TRIE_8_BIT;
  if (value < 0x10000) return TRIE_16_BIT;
  if (value < 0x100000000) return TRIE_32_BIT;
  return TRIE_64_BIT;
}
/**
 * Add a key/value pair
 *
 * Note: keys and values are of limited structure
 *
 * The key must be a string of ascii in range of 32-131.
 * This key is hashed by turning each character into its
 * ascii ordinal value, stringifying it padded with zero,
 * and hashing each of the two resulting digits. This way
 * we can guarantee that each node in the Trie only
 * requires 10 places (one for each digit) plus a value.
 * That makes reads super fast.
 *
 * @param {$trie} trie
 * @param {string} key
 * @param {number} value Any unsigned 32bit-1 value
 * @returns {number} previous value, or -1 if there wasn't any
 */


function trie_add(trie, key, value) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._adds);
  trie_ensureValueFits(trie, value);
  return _trie_add(trie, TRIE_ROOT_OFFSET, key, 0, key.length, value);
}
/**
 * Recursively find the place to add the key. If
 * the trail runs cold, pave it. Clobbers existing
 * values (though in our implementation that current
 * shouldn't really happen...)
 *
 * @param {$trie} trie
 * @param {number} offset
 * @param {string} key
 * @param {number} index Current index of the key being walked
 * @param {number} len Cache of key.length
 * @param {number} value Any unsigned 32bit-1 value
 * @returns {number} the old value, or not found
 */


function _trie_add(trie, offset, key, index, len, value) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._addSteps);
  ASSERT(offset >= 0, 'OFFSET_UNSIGNED');
  ASSERT(typeof key === 'string', 'STRING_KEY');
  ASSERT(index >= 0, 'INDEX_UNSIGNED');
  ASSERT(key.length === len, 'KEY_LEN');
  ASSERT(value >= 0, 'VALUE_UNSIGNED'); // Dont create next path part if it would create a leaf node

  if (index >= len) {
    var buffer = trie.buffer;
    var valuePtr = offset + TRIE_BUCKET_COUNT;
    var curValue = trie.buffer[valuePtr];
    if (!curValue) ++trie.count;
    buffer[valuePtr] = value + 1; // 0 is reserved to mean "unused"

    return curValue - 1;
  }

  var c = key.charCodeAt(index) - 32; // Allow all asciis 31 < c < 130 encoded as stringified double digits

  offset = _trie_pavePath(trie, offset, c % 10);
  offset = _trie_pavePath(trie, offset, Math.floor(c / 10));
  return _trie_add(trie, offset, key, index + 1, len, value);
}
/**
 * Add a key/value pair
 *
 * This adds a value under a key that is a number. This
 * way reads and writes take `ceil(log(n)/log(10))` steps.
 * Eg. as many steps as digits in the decimal number.
 *
 * @param {$trie} trie
 * @param {number} key Assumes an unsigned int
 * @param {number} value Any unsigned 32bit-1 value
 * @returns {number} previous value, or -1 if there wasn't any
 */


function trie_addNum(trie, key, value) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._adds);
  trie_ensureValueFits(trie, value);
  return _trie_addNum(trie, TRIE_ROOT_OFFSET, key + 1, value);
}
/**
 * Recursively find the place to add the key. If
 * the trail runs cold, pave it. Clobbers existing
 * values (though in our implementation that current
 * shouldn't really happen...)
 *
 * @param {$trie} trie
 * @param {number} offset
 * @param {number} key Assumes an unsigned int >0
 * @param {number} value Any unsigned 32bit-1 value
 * @returns {number} the old value, or not found
 */


function _trie_addNum(trie, offset, key, value) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._addSteps);
  ASSERT(offset >= 0, 'OFFSET_UNSIGNED');
  ASSERT(typeof key === 'number', 'NUMBER_KEY');
  ASSERT(value >= 0, 'VALUE_UNSIGNED');

  if (key === 0) {
    var buffer = trie.buffer;
    var valuePtr = offset + TRIE_BUCKET_COUNT;
    var curValue = trie.buffer[valuePtr];
    if (!curValue) ++trie.count;
    buffer[valuePtr] = value + 1; // 0 is reserved to mean "unused"

    return curValue - 1;
  }

  offset = _trie_pavePath(trie, offset, key % 10);
  key = Math.floor(key / 10);
  return _trie_addNum(trie, offset, key, value);
}
/**
 * Make sure the Trie can hold a value of given manitude.
 * If the current bitsize of the trie is too small it will
 * grow the buffer to accomodate the larger size.
 *
 * @param {$trie} trie
 * @param {number} value
 */


function trie_ensureValueFits(trie, value) {
  var bitsNeeded = trie_getValueBitsize(value);

  if (bitsNeeded > trie.bits) {
    trie.bits = bitsNeeded;
    trie_malloc(trie, trie.buffer.length); // Note: length = cell size, byteLength = byte size. we mean cell here.
  }
}
/**
 * One step of writing a value. Offset should be a node, if
 * the digit has no address yet create it. If a node needs
 * to be created the buffer may be grown to fit the new node.
 * It will return the pointer of the (possibly new) next
 * node for given digit.
 *
 * @param {$trie} trie
 * @param {number} offset Start of a node
 * @param {number} digit Zero through nine
 * @returns {number} new address
 */


function _trie_pavePath(trie, offset, digit) {
  offset += digit;
  var ptr = trie.buffer[offset];

  if (!ptr) {
    ptr = trie_addNode(trie);
    trie.buffer[offset] = ptr;
  }

  return ptr;
}
/**
 * Find the value for given key. See trie_add for more details.
 *
 * @param {$trie} trie
 * @param {string} key
 * @returns {number} -1 if not found, >= 0 otherwise
 */


function trie_get(trie, key) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._gets);
  return _trie_get(trie, TRIE_ROOT_OFFSET, key, 0, key.length);
}
/**
 * Recursive function to search for key
 *
 * @param {$trie} trie
 * @param {number} offset Start of a node
 * @param {string} key
 * @param {number} index Current index of the key being walked
 * @param {number} len Cache of key.length
 * @returns {number} -1 if not found or >= 0 otherwise
 */


function _trie_get(trie, offset, key, index, len) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._getSteps);
  ASSERT(offset >= 0, 'OFFSET_UNSIGNED');
  ASSERT(typeof key === 'string', 'STRING_KEY', key);
  ASSERT(index >= 0, 'INDEX_UNSIGNED');
  ASSERT(key.length === len, 'KEY_LEN', key);
  var buffer = trie.buffer;

  if (index >= len) {
    var valuePtr = offset + TRIE_BUCKET_COUNT;
    return buffer[valuePtr] - 1;
  }

  var c = key.charCodeAt(index) - 32; // Allow all asciis 31 < c < 130 encoded as stringified double digits

  offset = buffer[offset + c % 10];
  if (!offset) return TRIE_KEY_NOT_FOUND;
  offset = buffer[offset + Math.floor(c / 10)];
  if (!offset) return TRIE_KEY_NOT_FOUND;
  return _trie_get(trie, offset, key, index + 1, len);
}
/**
 * See trie_get for more details
 *
 * @param {$trie} trie
 * @param {string} key
 * @returns {boolean}
 */


function trie_has(trie, key) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._hass);
  return trie_get(trie, key) !== TRIE_KEY_NOT_FOUND;
}
/**
 * Find the value for given number key.
 * See trie_addNum for more details.
 *
 * @param {$trie} trie
 * @param {number} key Assumed to be an unsigned int >=0
 * @returns {number} -1 if not found, >= 0 otherwise
 */


function trie_getNum(trie, key) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._gets);
  return _trie_getNum(trie, TRIE_ROOT_OFFSET, key + 1);
}
/**
 * Recursive function to search for number key
 *
 * @param {$trie} trie
 * @param {number} offset Start of a node
 * @param {number} key Assumed to be an unsigned int >=0
 * @returns {number} -1 if not found or >= 0 otherwise
 */


function _trie_getNum(trie, offset, key) {
  if (process.env.NODE_ENV !== 'production') ASSERT(++trie._getSteps);
  ASSERT(offset >= 0, 'OFFSET_UNSIGNED');
  ASSERT(typeof key === 'number', 'NUMBER_KEY');
  var buffer = trie.buffer;

  if (key === 0) {
    var valuePtr = offset + TRIE_BUCKET_COUNT;
    return buffer[valuePtr] - 1;
  }

  offset = buffer[offset + key % 10];
  if (!offset) return TRIE_KEY_NOT_FOUND;
  key = Math.floor(key / 10);
  return _trie_getNum(trie, offset, key);
}

// propagators are generated once a space is created. Constraints
// tend to be more concise and reflect the original intent, whereas
// propagators are low level. One constraint can generate multiple
// propagators to do its work, like how sum(A,B,C) breaks down to
// plus(plus(A,B), C) which in turn breaks down to 2x three propagators
// for the plus.

function constraint_create(name, varIndexes, param) {
  return {
    _class: '$constraint',
    name: name,
    varIndexes: varIndexes,
    param: param
  };
}
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @param {number} varIndex3
 * @returns {$fd_changeState}
 */


function propagator_divStep(space, config, varIndex1, varIndex2, varIndex3) {
  ASSERT(varIndex1 >= 0 && varIndex2 >= 0 && varIndex3 >= 0, 'expecting three vars', varIndex1, varIndex2, varIndex3);
  var domain1 = space.vardoms[varIndex1];
  var domain2 = space.vardoms[varIndex2];
  var domain3 = space.vardoms[varIndex3];
  space.vardoms[varIndex3] = _propagator_divStep(domain1, domain2, domain3);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_divStep; indexes:', varIndex1, varIndex2, varIndex3, 'doms:', domain__debug(domain1), 'div', domain__debug(domain2), 'was', domain__debug(domain3), 'now', domain__debug(space.vardoms[varIndex3]));
  });
  ASSERT_NORDOM(space.vardoms[varIndex1], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex2], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex3], true, domain__debug);
}
/**
 * @param {$nordom} domain1
 * @param {$nordom} domain2
 * @param {$nordom} domResult
 * @returns {$nordom}
 */


function _propagator_divStep(domain1, domain2, domResult) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT_NORDOM(domResult);
  ASSERT(domain1 && domain2 && domResult, 'SHOULD_NOT_BE_REJECTED');
  var domain = domain_divby(domain1, domain2);
  return domain_intersection(domResult, domain);
} // Markov helper functions

/**
 * If a row has no boolean condition, return it.
 * If the boolean condition of a row is 1, return it.
 * If no row meets these conditions, return the last row.
 *
 * @param {$space} space
 * @param {?} matrix
 * @returns {*}
 */


function markov_getNextRowToSolve(space, matrix) {
  var vardoms = space.vardoms;
  var row;

  for (var i = 0; i < matrix.length; i++) {
    row = matrix[i];
    var boolDomain = vardoms[row._boolVarIndex];

    if (boolDomain === undefined || domain_getValue(boolDomain) === 1) {
      break;
    }
  }

  return row;
}

function markov_createLegend(merge, inputLegend, domain) {
  if (merge) {
    return markov_mergeDomainAndLegend(inputLegend, domain);
  }

  return inputLegend;
}

function markov_mergeDomainAndLegend(inputLegend, domain) {
  var legend;

  if (inputLegend) {
    legend = inputLegend.slice(0);
  } else {
    legend = [];
  }

  var listed = domain_toList(domain);

  for (var i = 0; i < listed.length; ++i) {
    var val = listed[i];

    if (legend.indexOf(val) < 0) {
      legend.push(val);
    }
  }

  return legend;
}

function markov_createProbVector(space, matrix, expandVectorsWith, valueCount) {
  var row = markov_getNextRowToSolve(space, matrix);
  var probVector = row.vector;

  if (expandVectorsWith !== null) {
    // Could be 0
    probVector = probVector ? probVector.slice(0) : [];
    var delta = valueCount - probVector.length;

    if (delta > 0) {
      for (var i = 0; i < delta; ++i) {
        probVector.push(expandVectorsWith);
      }
    }

    return probVector;
  }

  if (!probVector || probVector.length !== valueCount) {
    THROW('E_EACH_MARKOV_VAR_MUST_HAVE_PROB_VECTOR_OR_ENABLE_EXPAND_VECTORS');
  }

  return probVector;
}
/**
 * Markov uses a special system for trying values. The domain doesn't
 * govern the list of possible values, only acts as a mask for the
 * current node in the search tree (-> space). But since FD will work
 * based on this domain anyways we will need this extra step to verify
 * whether a solved var is solved to a valid value in current context.
 *
 * Every markov variable should have a propagator. Perhaps later
 * there can be one markov propagator that checks all markov vars.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex
 */


function propagator_markovStepBare(space, config, varIndex) {
  // THIS IS VERY EXPENSIVE IF expandVectorsWith IS ENABLED
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  var domain = space.vardoms[varIndex];
  ASSERT_NORDOM(domain);
  ASSERT(domain, 'SHOULD_NOT_BE_REJECTED');

  if (!domain_isSolved(domain)) {
    ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
      return log('propagator_markovStepBare; indexes:', varIndex, 'was solved:', domain__debug(domain));
    });
    return;
  }

  var value = domain_min(domain); // Note: solved so lo=hi=value

  var configVarDistOptions = config.varDistOptions;
  var distributeOptions = configVarDistOptions[config.allVarNames[varIndex]];
  ASSERT(distributeOptions, 'var should have a config', varIndex, distributeOptions && JSON.stringify(configVarDistOptions));
  ASSERT(distributeOptions.valtype === 'markov', 'var should be a markov var', distributeOptions.valtype);
  var expandVectorsWith = distributeOptions.expandVectorsWith;
  ASSERT(distributeOptions.matrix, 'there should be a matrix available for every var');
  ASSERT(distributeOptions.legend || expandVectorsWith !== null, 'every var should have a legend or expandVectorsWith set'); // Note: expandVectorsWith can be 0, so check with null

  var values = markov_createLegend(expandVectorsWith !== null, distributeOptions.legend, domain); // TODO: domain is a value, can this be optimized? is that worth the effort? (profile this)

  var probabilities = markov_createProbVector(space, distributeOptions.matrix, expandVectorsWith, values.length);
  var pos = values.indexOf(value);

  if (pos < 0 || pos >= probabilities.length || probabilities[pos] === 0) {
    space.vardoms[varIndex] = domain_createEmpty();
  }

  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_markovStepBare; indexes:', varIndex, 'was:', domain__debug(domain), 'became:', domain__debug(space.vardoms[varIndex]));
  });
  ASSERT_NORDOM(space.vardoms[varIndex], true, domain__debug);
}
/**
 * Min as in minus. Only updates the result domain.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @param {number} varIndex3
 */


function propagator_minStep(space, config, varIndex1, varIndex2, varIndex3) {
  ASSERT(varIndex1 >= 0 && varIndex2 >= 0 && varIndex3 >= 0, 'expecting three vars', varIndex1, varIndex2, varIndex3);
  var domain1 = space.vardoms[varIndex1];
  var domain2 = space.vardoms[varIndex2];
  var domain3 = space.vardoms[varIndex3]; // TODO: prune domain1 and domain2 like ring does, but here

  var nR = _propagator_minStep(domain1, domain2, domain3);

  space.vardoms[varIndex3] = nR;
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_minStep; indexes:', varIndex1, varIndex2, varIndex3, 'doms:', domain__debug(domain1), domain__debug(domain2), 'was', domain__debug(domain3), 'now', domain__debug(space.vardoms[varIndex3]));
  });
  ASSERT_NORDOM(space.vardoms[varIndex1], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex2], true, domain__debug);
  ASSERT(domain_isEmpty(nR) || ASSERT_NORDOM(nR, true, domain__debug) || true, 'R can be empty');
}
/**
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @param {$domain} domResult
 * @returns {$domain}
 */


function _propagator_minStep(domain1, domain2, domResult) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
  var domain = domain_minus(domain1, domain2);

  if (!domain) {
    TRACE('_propagator_minStep resulted in empty domain');
    return domain;
  }

  return domain_intersection(domResult, domain);
}
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @param {number} varIndex3
 */


function propagator_mulStep(space, config, varIndex1, varIndex2, varIndex3) {
  ASSERT(varIndex1 >= 0 && varIndex2 >= 0 && varIndex3 >= 0, 'expecting three vars', varIndex1, varIndex2, varIndex3);
  var vardoms = space.vardoms;
  var domain1 = vardoms[varIndex1];
  var domain2 = vardoms[varIndex2];
  var domain3 = vardoms[varIndex3];
  space.vardoms[varIndex3] = _propagator_mulStep(domain1, domain2, domain3);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_mulStep; indexes:', varIndex1, varIndex2, varIndex3, 'doms:', domain__debug(domain1), 'mul', domain__debug(domain2), 'was', domain__debug(domain3), 'now', domain__debug(vardoms[varIndex3]));
  });
  ASSERT_NORDOM(space.vardoms[varIndex1], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex2], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex3], true, domain__debug);
}
/**
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @param {$domain} domResult
 * @returns {$domain}
 */


function _propagator_mulStep(domain1, domain2, domResult) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
  var domain = domain_mul(domain1, domain2);
  return domain_intersection(domResult, domain);
}
/**
 * A boolean variable that represents whether a comparison
 * condition between two variables currently holds or not.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 * @param {Function} opFunc like propagator_ltStepBare
 * @param {Function} nopFunc opposite of opFunc like propagator_gtStepBare
 * @param {string} opName
 * @param {string} invOpName
 * @param {Function} opRejectChecker
 * @param {Function} nopRejectChecker
 */


function propagator_reifiedStepBare(space, config, leftVarIndex, rightVarIndex, resultVarIndex, opFunc, nopFunc, opName, invOpName, opRejectChecker, nopRejectChecker) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof leftVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof rightVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof resultVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof opName === 'string', 'OP_SHOULD_BE_STRING');
  ASSERT(typeof invOpName === 'string', 'NOP_SHOULD_BE_STRING');
  var vardoms = space.vardoms;
  var domResult = vardoms[resultVarIndex];
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_reifiedStepBare before; op:', opName, ', indexes:', resultVarIndex, '=', leftVarIndex, opName + '?', rightVarIndex, ', doms:', domain__debug(vardoms[resultVarIndex]), '=', domain__debug(vardoms[leftVarIndex]), opName + '?', domain__debug(vardoms[rightVarIndex]));
  }); // The result var is either ZERO (reified constraint must not hold) or NONZERO (reified constraint must hold)
  // the actual nonzero value, if any, is irrelevant

  if (domain_isZero(domResult)) {
    nopFunc(space, config, leftVarIndex, rightVarIndex);
  } else if (domain_hasNoZero(domResult)) {
    opFunc(space, config, leftVarIndex, rightVarIndex);
  } else {
    var domain1 = vardoms[leftVarIndex];
    var domain2 = vardoms[rightVarIndex];
    ASSERT_NORDOM(domain1);
    ASSERT_NORDOM(domain2);
    ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
    ASSERT(!domain_isZero(domResult) && !domain_hasNoZero(domResult), 'result should be booly now');

    if (nopRejectChecker(domain1, domain2)) {
      ASSERT(!opRejectChecker(domain1, domain2), 'with non-empty domains op and nop cant BOTH reject');
      vardoms[resultVarIndex] = domain_removeValue(domResult, 0);
      opFunc(space, config, leftVarIndex, rightVarIndex);
    } else if (opRejectChecker(domain1, domain2)) {
      vardoms[resultVarIndex] = domain_removeGtUnsafe(domResult, 0);
      nopFunc(space, config, leftVarIndex, rightVarIndex);
    }
  }

  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_reifiedStepBare after; doms:', domain__debug(vardoms[resultVarIndex]), '=', domain__debug(vardoms[leftVarIndex]), opName + '?', domain__debug(vardoms[rightVarIndex]));
  });
  ASSERT_NORDOM(space.vardoms[leftVarIndex], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[rightVarIndex], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[resultVarIndex], true, domain__debug);
}
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @param {number} varIndex3
 * @param {string} opName
 * @param {Function} opFunc
 */


function propagator_ringStepBare(space, config, varIndex1, varIndex2, varIndex3, opName, opFunc) {
  ASSERT(varIndex1 >= 0 && varIndex2 >= 0 && varIndex3 >= 0, 'expecting three vars', varIndex1, varIndex2, varIndex3);
  ASSERT(typeof opName === 'string', 'OP_SHOULD_BE_STRING');
  var vardoms = space.vardoms;
  var domain1 = vardoms[varIndex1];
  var domain2 = vardoms[varIndex2];
  var domain3 = vardoms[varIndex3];
  ASSERT(opName === 'plus' && opFunc === domain_plus || opName === 'min' && opFunc === domain_minus || opName === 'mul' && opFunc === domain_mul || opName === 'div' && opFunc === domain_invMul, 'should get proper opfunc');
  space.vardoms[varIndex3] = _propagator_ringStepBare(domain1, domain2, domain3, opFunc, opName);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_ringStepBare; op:', opName, 'indexes:', varIndex3, '=', varIndex1, {
      u: '+',
      n: '-',
      l: '*',
      v: '/'
    }[opName[2]], varIndex2, ', names:', config.allVarNames[varIndex3], '=', config.allVarNames[varIndex1], {
      u: '+',
      n: '-',
      l: '*',
      v: '/'
    }[opName[2]], config.allVarNames[varIndex2]);
  });
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log(' - doms before:', domain__debug(domain3), '=', domain__debug(domain1), {
      u: '+',
      n: '-',
      l: '*',
      v: '/'
    }[opName[2]], domain__debug(domain2));
  });
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log(' - doms after :', domain__debug(vardoms[varIndex3]), '=', domain__debug(vardoms[varIndex1]), {
      u: '+',
      n: '-',
      l: '*',
      v: '/'
    }[opName[2]], domain__debug(vardoms[varIndex2]));
  });
  ASSERT_NORDOM(space.vardoms[varIndex1], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex2], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex3], true, domain__debug);
}
/**
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @param {$domain} domainResult
 * @param {Function} opFunc
 * @param {string} opName For debugging only, the canonical name of opFunc
 * @returns {$domain}
 */


function _propagator_ringStepBare(domain1, domain2, domainResult, opFunc, opName) {
  ASSERT(typeof opFunc === 'function', 'EXPECTING_FUNC_TO_BE:', opName);
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
  var domain = opFunc(domain1, domain2);
  return domain_intersection(domainResult, domain);
}
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 */


function propagator_ltStepBare(space, config, varIndex1, varIndex2) {
  ASSERT(space._class === '$space', 'SHOULD_GET_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  var domain1 = space.vardoms[varIndex1];
  var domain2 = space.vardoms[varIndex2];
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
  var lo1 = domain_min(domain1);
  var hi2 = domain_max(domain2);
  space.vardoms[varIndex1] = domain_removeGte(domain1, hi2);
  space.vardoms[varIndex2] = domain_removeLte(domain2, lo1);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_ltStepBare; indexes:', varIndex1, varIndex2, ', from:', domain__debug(domain1), '<', domain__debug(domain2), ', to:', domain__debug(space.vardoms[varIndex1]), '<', domain__debug(space.vardoms[varIndex2]));
  });
  ASSERT_NORDOM(space.vardoms[varIndex1], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex2], true, domain__debug);
}

function propagator_gtStepBare(space, config, varIndex1, varIndex2) {
  return propagator_ltStepBare(space, config, varIndex2, varIndex1);
}
/**
 * Lt would reject if all elements in the left var are bigger or equal to
 * the right var. And since everything is CSIS, we only have to check the
 * lo bound of left to the high bound of right for that answer.
 * Read-only check
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */


function propagator_ltStepWouldReject(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
  var result = domain_min(domain1) >= domain_max(domain2);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_ltStepWouldReject;', domain__debug(domain1), '>=?', domain__debug(domain2), '=>', domain_min(domain1), '>=?', domain_max(domain2), '->', result);
  });
  return result;
}
/**
 * Reverse of propagator_ltStepWouldReject
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */


function propagator_gtStepWouldReject(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
  return propagator_ltStepWouldReject(domain2, domain1);
}
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @returns {$fd_changeState}
 */


function propagator_lteStepBare(space, config, varIndex1, varIndex2) {
  ASSERT(space._class === '$space', 'SHOULD_GET_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  var domain1 = space.vardoms[varIndex1];
  var domain2 = space.vardoms[varIndex2];
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
  var lo1 = domain_min(domain1);
  var hi2 = domain_max(domain2);
  space.vardoms[varIndex1] = domain_removeGte(domain1, hi2 + 1);
  space.vardoms[varIndex2] = domain_removeLte(domain2, lo1 - 1);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_ltStepBare; indexes:', varIndex1, varIndex2, ', from:', domain__debug(domain1), '<=', domain__debug(domain2), ', to:', domain__debug(space.vardoms[varIndex1]), '<=', domain__debug(space.vardoms[varIndex2]));
  });
  ASSERT_NORDOM(space.vardoms[varIndex1], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex2], true, domain__debug);
}

function propagator_gteStepBare(space, config, varIndex1, varIndex2) {
  return propagator_lteStepBare(space, config, varIndex2, varIndex1);
}
/**
 * Lte would reject if all elements in the left var are bigger than the
 * right var. And since everything is CSIS, we only have to check the
 * lo bound of left to the high bound of right for that answer.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */


function propagator_lteStepWouldReject(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
  var result = domain_min(domain1) > domain_max(domain2);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_lteStepWouldReject;', domain__debug(domain1), '>?', domain__debug(domain2), '=>', domain_min(domain1), '>?', domain_max(domain2), '->', result);
  });
  return result;
}
/**
 * Reverse of propagator_lteStepWouldReject
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */


function propagator_gteStepWouldReject(domain1, domain2) {
  return propagator_lteStepWouldReject(domain2, domain1);
}
/**
 * This eq propagator looks a lot different from neq because in
 * eq we can prune early all values that are not covered by both.
 * Any value that is not covered by both can not be a valid solution
 * that holds this constraint. In neq that's different and we can
 * only start pruning once at least one var has a solution.
 * Basically eq is much more efficient compared to neq because we
 * can potentially skip a lot of values early.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 * @returns {$fd_changeState}
 */


function propagator_eqStepBare(space, config, varIndex1, varIndex2) {
  ASSERT(space._class === '$space', 'SHOULD_GET_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  var vardoms = space.vardoms;
  var domain1 = vardoms[varIndex1];
  var domain2 = vardoms[varIndex2];
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED');
  var result = domain_intersection(domain1, domain2);
  vardoms[varIndex1] = result;
  vardoms[varIndex2] = result;
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_eqStepBare; indexes:', varIndex1, varIndex2, 'doms:', domain__debug(domain1), 'eq', domain__debug(domain2), '->', domain__debug(result));
  });
  ASSERT_NORDOM(space.vardoms[varIndex1], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex2], true, domain__debug);
}
/**
 * The eq step would reject if there all elements in one domain
 * do not occur in the other domain. Because then there's no
 * valid option to make sure A=B holds. So search for such value
 * or return false.
 * Read only check
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */


function propagator_eqStepWouldReject(domain1, domain2) {
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'NON_EMPTY_DOMAIN_EXPECTED');
  var result = domain_sharesNoElements(domain1, domain2);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_eqStepWouldReject;', domain__debug(domain1), '!==', domain__debug(domain2), '->', result);
  });
  return result;
}
/**
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex1
 * @param {number} varIndex2
 */


function propagator_neqStepBare(space, config, varIndex1, varIndex2) {
  ASSERT(space && space._class === '$space', 'SHOULD_GET_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  var vardoms = space.vardoms;
  var domain1 = vardoms[varIndex1];
  var domain2 = vardoms[varIndex2];
  ASSERT_NORDOM(domain1);
  ASSERT_NORDOM(domain2);
  ASSERT(domain1 && domain2, 'SHOULD_NOT_BE_REJECTED'); // Remove solved value from the other domain. confirm neither rejects over it.

  var value = domain_getValue(domain1);

  if (value === NO_SUCH_VALUE) {
    // Domain1 is not solved, remove domain2 from domain1 if domain2 is solved
    value = domain_getValue(domain2);

    if (value !== NO_SUCH_VALUE) {
      vardoms[varIndex1] = domain_removeValue(domain1, value);
    }
  } else if (domain1 === domain2) {
    vardoms[varIndex1] = domain_createEmpty();
    vardoms[varIndex2] = domain_createEmpty();
  } else {
    vardoms[varIndex2] = domain_removeValue(domain2, value);
  }

  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_neqStepBare; indexes:', varIndex1, varIndex2, 'doms:', domain__debug(domain1), 'neq', domain__debug(domain2), '->', domain__debug(vardoms[varIndex1]), domain__debug(vardoms[varIndex2]));
  });
  ASSERT_NORDOM(space.vardoms[varIndex1], true, domain__debug);
  ASSERT_NORDOM(space.vardoms[varIndex2], true, domain__debug);
}
/**
 * Neq will only reject if both domains are solved and equal.
 * This is a read-only check.
 *
 * @param {$domain} domain1
 * @param {$domain} domain2
 * @returns {boolean}
 */


function propagator_neqStepWouldReject(domain1, domain2) {
  var value = domain_getValue(domain1);
  var result = value !== NO_SUCH_VALUE && value === domain_getValue(domain2);
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('propagator_neqStepWouldReject;', domain__debug(domain1), '===', domain__debug(domain2), '->', result);
  });
  return result;
}
/**
 * @param {string} name
 * @param {Function} stepper
 * @param {number} index1
 * @param {number} [index2=-1]
 * @param {number} [index3=-1]
 * @param {string} [arg1='']
 * @param {string} [arg2='']
 * @param {string} [arg3='']
 * @param {string} [arg4='']
 * @param {string} [arg5='']
 * @param {string} [arg6='']
 * @returns {$propagator}
 */


function propagator_create(name, stepper, index1, index2, index3, arg1, arg2, arg3, arg4, arg5, arg6) {
  if (index1 === void 0) {
    index1 = -1;
  }

  if (index2 === void 0) {
    index2 = -1;
  }

  if (index3 === void 0) {
    index3 = -1;
  }

  if (arg1 === void 0) {
    arg1 = '';
  }

  if (arg2 === void 0) {
    arg2 = '';
  }

  if (arg3 === void 0) {
    arg3 = '';
  }

  if (arg4 === void 0) {
    arg4 = '';
  }

  if (arg5 === void 0) {
    arg5 = '';
  }

  if (arg6 === void 0) {
    arg6 = '';
  }

  return {
    _class: '$propagator',
    name: name,
    stepper: stepper,
    index1: index1,
    index2: index2,
    index3: index3,
    arg1: arg1,
    arg2: arg2,
    arg3: arg3,
    arg4: arg4,
    arg5: arg5,
    arg6: arg6
  };
}
/**
 * Adds propagators which reify the given operator application
 * to the given boolean variable.
 *
 * `opname` is a string giving the name of the comparison
 * operator to reify. Currently, 'eq', 'neq', 'lt', 'lte', 'gt' and 'gte'
 * are supported.
 *
 * `leftVarIndex` and `rightVarIndex` are the arguments accepted
 * by the comparison operator.
 *
 * `resultVarIndex` is the name of the boolean variable to which to
 * reify the comparison operator. Note that this boolean
 * variable must already have been declared. If this argument
 * is omitted from the call, then the `reified` function can
 * be used in "functional style" and will return the name of
 * the reified boolean variable which you can pass to other
 * propagator creator functions.
 *
 * @param {$config} config
 * @param {string} opname
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */


function propagator_addReified(config, opname, leftVarIndex, rightVarIndex, resultVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof opname === 'string', 'OP_SHOULD_BE_STRING');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
  var nopName;
  var opFunc;
  var nopFunc;
  var opRejectChecker;
  var nopRejectChecker;

  switch (opname) {
    case 'eq':
      {
        nopName = 'neq';
        opFunc = propagator_eqStepBare;
        nopFunc = propagator_neqStepBare;
        opRejectChecker = propagator_eqStepWouldReject;
        nopRejectChecker = propagator_neqStepWouldReject;
        break;
      }

    case 'neq':
      {
        nopName = 'eq';
        opFunc = propagator_neqStepBare;
        nopFunc = propagator_eqStepBare;
        opRejectChecker = propagator_neqStepWouldReject;
        nopRejectChecker = propagator_eqStepWouldReject;
        break;
      }

    case 'lt':
      opFunc = propagator_ltStepBare;
      opRejectChecker = propagator_ltStepWouldReject;
      nopName = 'gte';
      nopFunc = propagator_gteStepBare;
      nopRejectChecker = propagator_gteStepWouldReject;
      break;

    case 'lte':
      opFunc = propagator_lteStepBare;
      opRejectChecker = propagator_lteStepWouldReject;
      nopName = 'gt';
      nopFunc = propagator_gtStepBare;
      nopRejectChecker = propagator_gtStepWouldReject;
      break;

    case 'gt':
      return propagator_addReified(config, 'lt', rightVarIndex, leftVarIndex, resultVarIndex);

    case 'gte':
      return propagator_addReified(config, 'lte', rightVarIndex, leftVarIndex, resultVarIndex);

    default:
      THROW('UNKNOWN_REIFIED_OP');
  }

  config_addPropagator(config, propagator_create('reified', propagator_reifiedStepBare, leftVarIndex, rightVarIndex, resultVarIndex, opFunc, nopFunc, opname, nopName, opRejectChecker, nopRejectChecker));
}
/**
 * Domain equality propagator. Creates the propagator
 * in given config.
 * Can pass in vars or numbers that become anonymous
 * vars. Must at least pass in one var because the
 * propagator would be useless otherwise.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */


function propagator_addEq(config, leftVarIndex, rightVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  config_addPropagator(config, propagator_create('eq', propagator_eqStepBare, leftVarIndex, rightVarIndex));
}
/**
 * Less than propagator. See general propagator nores
 * for fdeq which also apply to this one.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */


function propagator_addLt(config, leftVarIndex, rightVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  config_addPropagator(config, propagator_create('lt', propagator_ltStepBare, leftVarIndex, rightVarIndex));
}
/**
 * Greater than propagator.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */


function propagator_addGt(config, leftVarIndex, rightVarIndex) {
  // _swap_ v1 and v2 because: a>b is b<a
  propagator_addLt(config, rightVarIndex, leftVarIndex);
}
/**
 * Less than or equal to propagator.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */


function propagator_addLte(config, leftVarIndex, rightVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  config_addPropagator(config, propagator_create('lte', propagator_lteStepBare, leftVarIndex, rightVarIndex));
}
/**
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */


function propagator_addMul(config, leftVarIndex, rightVarIndex, resultVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
  config_addPropagator(config, propagator_create('mul', propagator_mulStep, leftVarIndex, rightVarIndex, resultVarIndex));
}
/**
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */


function propagator_addDiv(config, leftVarIndex, rightVarIndex, resultVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
  config_addPropagator(config, propagator_create('div', propagator_divStep, leftVarIndex, rightVarIndex, resultVarIndex));
}
/**
 * Greater than or equal to.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */


function propagator_addGte(config, leftVarIndex, rightVarIndex) {
  // _swap_ v1 and v2 because: a>=b is b<=a
  propagator_addLte(config, rightVarIndex, leftVarIndex);
}
/**
 * Ensures that the two variables take on different values.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 */


function propagator_addNeq(config, leftVarIndex, rightVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  config_addPropagator(config, propagator_create('neq', propagator_neqStepBare, leftVarIndex, rightVarIndex));
}
/**
 * Takes an arbitrary number of FD variables and adds propagators that
 * ensure that they are pairwise distinct.
 *
 * @param {$config} config
 * @param {number[]} varIndexes
 */


function propagator_addDistinct(config, varIndexes) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');

  for (var i = 0; i < varIndexes.length; i++) {
    var varIndex = varIndexes[i];

    for (var j = 0; j < i; ++j) {
      propagator_addNeq(config, varIndex, varIndexes[j]);
    }
  }
}
/**
 * @param {$config} config
 * @param {string} targetOpName
 * @param {string} invOpName
 * @param {Function} opFunc
 * @param {Function} nopFunc
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */


function propagator_addRingPlusOrMul(config, targetOpName, invOpName, opFunc, nopFunc, leftVarIndex, rightVarIndex, resultVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof targetOpName === 'string', 'OP_SHOULD_BE_STRING');
  ASSERT(typeof invOpName === 'string', 'INV_OP_SHOULD_BE_STRING');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
  propagator_addRing(config, leftVarIndex, rightVarIndex, resultVarIndex, targetOpName, opFunc);
  propagator_addRing(config, resultVarIndex, rightVarIndex, leftVarIndex, invOpName, nopFunc);
  propagator_addRing(config, resultVarIndex, leftVarIndex, rightVarIndex, invOpName, nopFunc);
}
/**
 * @param {$config} config
 * @param {string} A
 * @param {string} B
 * @param {string} C
 * @param {string} opName
 * @param {Function} opFunc
 */


function propagator_addRing(config, A, B, C, opName, opFunc) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof A === 'number' && A >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', A);
  ASSERT(typeof B === 'number' && B >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', B);
  ASSERT(typeof C === 'number' && C >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', C);
  config_addPropagator(config, propagator_create('ring', propagator_ringStepBare, A, B, C, opName, opFunc));
}
/**
 * Bidirectional addition propagator.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */


function propagator_addPlus(config, leftVarIndex, rightVarIndex, resultVarIndex) {
  propagator_addRingPlusOrMul(config, 'plus', 'min', domain_plus, domain_minus, leftVarIndex, rightVarIndex, resultVarIndex);
}
/**
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */


function propagator_addMin(config, leftVarIndex, rightVarIndex, resultVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof leftVarIndex === 'number' && leftVarIndex >= 0, 'LEFT_VAR_SHOULD_BE_VALID_INDEX', leftVarIndex);
  ASSERT(typeof rightVarIndex === 'number' && rightVarIndex >= 0, 'RIGHT_VAR_SHOULD_BE_VALID_INDEX', rightVarIndex);
  ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);
  config_addPropagator(config, propagator_create('min', propagator_minStep, leftVarIndex, rightVarIndex, resultVarIndex));
}
/**
 * Bidirectional multiplication propagator.
 *
 * @param {$config} config
 * @param {number} leftVarIndex
 * @param {number} rightVarIndex
 * @param {number} resultVarIndex
 */


function propagator_addRingMul(config, leftVarIndex, rightVarIndex, resultVarIndex) {
  propagator_addRingPlusOrMul(config, 'mul', 'div', domain_mul, domain_invMul, leftVarIndex, rightVarIndex, resultVarIndex);
}
/**
 * Sum of N domains = resultVar
 * Creates as many anonymous varIndexes as necessary.
 *
 * @param {$config} config
 * @param {number[]} varIndexes
 * @param {number} resultVarIndex
 */


function propagator_addSum(config, varIndexes, resultVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(Array.isArray(varIndexes), 'varIndexes should be an array of var names', varIndexes);
  ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', typeof resultVarIndex, resultVarIndex);
  var len = varIndexes.length;

  switch (len) {
    case 0:
      THROW('SUM_REQUIRES_VARS');
      return undefined;

    case 1:
      propagator_addEq(config, resultVarIndex, varIndexes[0]);
      return undefined;

    case 2:
      propagator_addPlus(config, varIndexes[0], varIndexes[1], resultVarIndex);
      return undefined;

    default:
      break;
  } // "divide and conquer" ugh. feels like there is a better way to do this


  ASSERT(len > 2, 'expecting at least 3 elements in the list...', varIndexes);
  var t1;
  var n = Math.floor(varIndexes.length / 2);

  if (n > 1) {
    t1 = config_addVarAnonNothing(config);
    propagator_addSum(config, varIndexes.slice(0, n), t1);
  } else {
    t1 = varIndexes[0];
  }

  var t2 = config_addVarAnonNothing(config);
  propagator_addSum(config, varIndexes.slice(n), t2);
  propagator_addPlus(config, t1, t2, resultVarIndex);
}
/**
 * Product of N varIndexes = resultVar.
 * Create as many anonymous varIndexes as necessary.
 *
 * @param {$config} config
 * @param {number[]} varIndexes
 * @param {number} resultVarIndex
 */


function propagator_addProduct(config, varIndexes, resultVarIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(Array.isArray(varIndexes), 'varIndexes should be an array of var names', varIndexes);
  ASSERT(typeof resultVarIndex === 'number' && resultVarIndex >= 0, 'RESULT_VAR_SHOULD_BE_VALID_INDEX', resultVarIndex);

  switch (varIndexes.length) {
    case 0:
      THROW('PRODUCT_REQUIRES_VARS');
      return undefined;

    case 1:
      // Note: by putting the result var first we get
      // the var name back for it in case it's a number
      propagator_addEq(config, resultVarIndex, varIndexes[0]);
      return undefined;

    case 2:
      propagator_addRingMul(config, varIndexes[0], varIndexes[1], resultVarIndex);
      return undefined;

    default:
      break;
  }

  var n = Math.floor(varIndexes.length / 2);
  var t1;

  if (n > 1) {
    t1 = config_addVarAnonNothing(config);
    propagator_addProduct(config, varIndexes.slice(0, n), t1);
  } else {
    t1 = varIndexes[0];
  }

  var t2 = config_addVarAnonNothing(config);
  propagator_addProduct(config, varIndexes.slice(n), t2);
  propagator_addRingMul(config, t1, t2, resultVarIndex);
}
/**
 * @param {$config} config
 * @param {number} varIndex
 */


function propagator_addMarkov(config, varIndex) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof varIndex === 'number' && varIndex >= 0, 'VAR_SHOULD_BE_VALID_INDEX', varIndex);
  config_addPropagator(config, propagator_create('markov', propagator_markovStepBare, varIndex));
} // Config for a search tree where each node is a Space

/**
 * @returns {$config}
 */


function config_create() {
  var config = {
    _class: '$config',
    // Names of all vars in this search tree
    allVarNames: [],
    // Doing `indexOf` for 5000+ names is _not_ fast. so use a trie
    _varNamesTrie: trie_create(),
    varStratConfig: config_createVarStratConfig(),
    valueStratName: 'min',
    targetedVars: 'all',
    varDistOptions: {},
    beforeSpace: undefined,
    afterSpace: undefined,
    // This is for the rng stuff in this library. in due time all calls
    // should happen through this function. and it should be initialized
    // with the rngCode string for exportability. this would be required
    // for webworkers and DSL imports which can't have functions. tests
    // can initialize it to something static, prod can use a seeded rng.
    rngCode: '',
    // String. Function(rngCode) should return a callable rng
    _defaultRng: undefined,
    // Function. if not exist at init time it'll be `rngCode ? Function(rngCode) : Math.random`
    // the propagators are generated from the constraints when a space
    // is created from this config. constraints are more higher level.
    allConstraints: [],
    constantCache: {},
    // <value:varIndex>, generally anonymous vars but pretty much first come first serve
    initialDomains: [],
    // $nordom[] : initial domains for each var, maps 1:1 to allVarNames
    _propagators: [],
    // Initialized later
    _varToPropagators: [],
    // Initialized later
    _constrainedAway: [],
    // List of var names that were constrained but whose constraint was optimized away. they will still be "targeted" if target is all. TODO: fix all tests that depend on this and eliminate this. it is a hack.
    _constraintHash: {} // Every constraint is logged here (note: for results only the actual constraints are stored). if it has a result, the value is the result var _name_. otherwise just `true` if it exists and `false` if it was optimized away.

  };

  if (process.env.NODE_ENV !== 'production') {
    config._propagates = 0;
  }

  return config;
}

function config_clone(config, newDomains) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  var varStratConfig = config.varStratConfig,
      valueStratName = config.valueStratName,
      targetedVars = config.targetedVars,
      varDistOptions = config.varDistOptions,
      constantCache = config.constantCache,
      allVarNames = config.allVarNames,
      allConstraints = config.allConstraints,
      initialDomains = config.initialDomains,
      _propagators = config._propagators,
      _varToPropagators = config._varToPropagators,
      _constrainedAway = config._constrainedAway;
  var clone = {
    _class: '$config',
    _varNamesTrie: trie_create(allVarNames),
    // Just create a new trie with (should be) the same names
    varStratConfig: varStratConfig,
    valueStratName: valueStratName,
    targetedVars: Array.isArray(targetedVars) ? targetedVars.slice(0) : targetedVars,
    varDistOptions: JSON.parse(JSON.stringify(varDistOptions)),
    // TOFIX: clone this more efficiently
    rngCode: config.rngCode,
    _defaultRng: config.rngCode ? undefined : config._defaultRng,
    constantCache: constantCache,
    // Is by reference ok?
    allVarNames: allVarNames.slice(0),
    allConstraints: allConstraints.slice(0),
    initialDomains: newDomains ? newDomains.map(domain_toSmallest) : initialDomains,
    // <varName:domain>
    _propagators: _propagators && _propagators.slice(0),
    // In case it is initialized
    _varToPropagators: _varToPropagators && _varToPropagators.slice(0),
    // Inited elsewhere
    _constrainedAway: _constrainedAway && _constrainedAway.slice(0),
    // List of var names that were constrained but whose constraint was optimized away. they will still be "targeted" if target is all. TODO: fix all tests that depend on this and eliminate this. it is a hack.
    // not sure what to do with this in the clone...
    _constraintHash: {}
  };

  if (process.env.NODE_ENV !== 'production') {
    clone._propagates = 0;
  }

  return clone;
}
/**
 * Add an anonymous var with max allowed range
 *
 * @param {$config} config
 * @returns {number} varIndex
 */


function config_addVarAnonNothing(config) {
  return config_addVarNothing(config, true);
}
/**
 * @param {$config} config
 * @param {string|boolean} varName (If true, is anonymous)
 * @returns {number} varIndex
 */


function config_addVarNothing(config, varName) {
  return _config_addVar(config, varName, domain_createRange(SUB, SUP));
}
/**
 * @param {$config} config
 * @param {number} lo
 * @param {number} hi
 * @returns {number} varIndex
 */


function config_addVarAnonRange(config, lo, hi) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof lo === 'number', 'A_LO_MUST_BE_NUMBER');
  ASSERT(typeof hi === 'number', 'A_HI_MUST_BE_NUMBER');
  if (lo === hi) return config_addVarAnonConstant(config, lo);
  return config_addVarRange(config, true, lo, hi);
}
/**
 * @param {$config} config
 * @param {string|boolean} varName (If true, is anonymous)
 * @param {number} lo
 * @param {number} hi
 * @returns {number} varIndex
 */


function config_addVarRange(config, varName, lo, hi) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof varName === 'string' || varName === true, 'A_VARNAME_SHOULD_BE_STRING_OR_TRUE');
  ASSERT(typeof lo === 'number', 'A_LO_MUST_BE_NUMBER');
  ASSERT(typeof hi === 'number', 'A_HI_MUST_BE_NUMBER');
  ASSERT(lo <= hi, 'A_RANGES_SHOULD_ASCEND');
  var domain = domain_createRange(lo, hi);
  return _config_addVar(config, varName, domain);
}
/**
 * @param {$config} config
 * @param {string|boolean} varName (If true, anon)
 * @param {$arrdom} domain Small domain format not allowed here. this func is intended to be called from FDO, which only accepts arrdoms
 * @returns {number} varIndex
 */


function config_addVarDomain(config, varName, domain, _allowEmpty, _override) {
  ASSERT(Array.isArray(domain), 'DOMAIN_MUST_BE_ARRAY_HERE');
  return _config_addVar(config, varName, domain_anyToSmallest(domain), _allowEmpty, _override);
}
/**
 * @param {$config} config
 * @param {number} value
 * @returns {number} varIndex
 */


function config_addVarAnonConstant(config, value) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');

  if (config.constantCache[value] !== undefined) {
    return config.constantCache[value];
  }

  return config_addVarConstant(config, true, value);
}
/**
 * @param {$config} config
 * @param {string|boolean} varName (True means anon)
 * @param {number} value
 * @returns {number} varIndex
 */


function config_addVarConstant(config, varName, value) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof varName === 'string' || varName === true, 'varName must be a string or true for anon');
  ASSERT(typeof value === 'number', 'A_VALUE_SHOULD_BE_NUMBER');
  var domain = domain_createRange(value, value);
  return _config_addVar(config, varName, domain);
}
/**
 * @param {$config} config
 * @param {string|true} varName If true, the varname will be the same as the index it gets on allVarNames
 * @param {$nordom} domain
 * @returns {number} varIndex
 */


function _config_addVar(config, varName, domain, _allowEmpty, _override) {
  if (_override === void 0) {
    _override = false;
  }

  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(_allowEmpty || domain, 'NON_EMPTY_DOMAIN');
  ASSERT(_allowEmpty || domain_min(domain) >= SUB, 'domain lo should be >= SUB', domain);
  ASSERT(_allowEmpty || domain_max(domain) <= SUP, 'domain hi should be <= SUP', domain);

  if (_override) {
    ASSERT(trie_has(config._varNamesTrie, varName), 'Assuming var exists when explicitly overriding');
    var index = trie_get(config._varNamesTrie, varName);
    ASSERT(index >= 0, 'should exist');
    ASSERT_NORDOM(domain, true, domain__debug);
    config.initialDomains[index] = domain;
    return;
  }

  var allVarNames = config.allVarNames;
  var varIndex = allVarNames.length;

  if (varName === true) {
    varName = '__' + String(varIndex) + '__';
  } else {
    if (typeof varName !== 'string') THROW('Var names should be a string or anonymous, was: ' + JSON.stringify(varName));
    if (!varName) THROW('Var name cannot be empty string');
    if (String(parseInt(varName, 10)) === varName) THROW("Don't use numbers as var names (" + varName + ')');
  } // Note: 100 is an arbitrary number but since large sets are probably
  // automated it's very unlikely we'll need this check in those cases


  if (varIndex < 100) {
    if (trie_has(config._varNamesTrie, varName)) THROW('Var name already part of this config. Probably a bug?', varName);
  }

  var solvedTo = domain_getValue(domain);
  if (solvedTo !== NOT_FOUND && !config.constantCache[solvedTo]) config.constantCache[solvedTo] = varIndex;
  ASSERT_NORDOM(domain, true, domain__debug);
  config.initialDomains[varIndex] = domain;
  config.allVarNames.push(varName);
  trie_add(config._varNamesTrie, varName, varIndex);
  return varIndex;
}
/**
 * Create a config object for the var distribution
 *
 * @param {Object} obj
 * @property {string} [obj.type] Map to the internal names for var distribution strategies
 * @property {string} [obj.priorityByName] An ordered list of var names to prioritize. Names not in the list go implicitly and unordered last.
 * @property {boolean} [obj.inverted] Should the list be interpreted inverted? Unmentioned names still go last, regardless.
 * @property {Object} [obj.fallback] Same struct as obj. If current strategy is inconclusive it can fallback to another strategy.
 * @returns {$var_strat_config}
 */


function config_createVarStratConfig(obj) {
  /**
   * @typedef {$var_strat_config}
   */
  return {
    _class: '$var_strat_config',
    type: obj && obj.type || 'naive',
    priorityByName: obj && obj.priorityByName,
    _priorityByIndex: undefined,
    inverted: Boolean(obj && obj.inverted),
    fallback: obj && obj.fallback
  };
}
/**
 * Configure an option for the solver
 *
 * @param {$config} config
 * @param {string} optionName
 * @param {*} optionValue
 * @param {string} [optionTarget] For certain options, this is the target var name
 */


function config_setOption(config, optionName, optionValue, optionTarget) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof optionName === 'string', 'option name is a string');
  ASSERT(optionValue !== undefined, 'should get a value');
  ASSERT(optionTarget === undefined || typeof optionTarget === 'string', 'the optional name is a string');

  if (optionName === 'varStratOverride') {
    THROW('deprecated, should be wiped internally');
  }

  var fallback = false;

  switch (optionName) {
    case 'varStrategyFallback':
      fallback = true;
    // Fall-through

    case 'varStrategy':
      {
        if (typeof optionValue === 'function') THROW('functions no longer supported', optionValue);
        if (typeof optionValue === 'string') THROW('strings should be passed on as {type:value}', optionValue);
        if (typeof optionValue !== 'object') THROW('varStrategy should be object', optionValue);
        if (optionValue.name) THROW('name should be type');
        if (optionValue.dist_name) THROW('dist_name should be type');
        ASSERT(!optionTarget, 'optionTarget is not used for varStrategy (this is not "per-var strat")');
        var vsc = config_createVarStratConfig(optionValue);

        if (fallback) {
          var rvsc = config.varStratConfig;
          ASSERT(rvsc, 'there must be an existing config to add a fallback');

          while (rvsc.fallback) {
            rvsc = rvsc.fallback;
          }

          rvsc.fallback = vsc;
        } else {
          config.varStratConfig = vsc;

          while (vsc.fallback) {
            vsc.fallback = config_createVarStratConfig(vsc.fallback);
            vsc = vsc.fallback;
          }
        }

        break;
      }

    case 'valueStrategy':
      // Determine how the next value of a variable is picked when creating a new space
      config.valueStratName = optionValue;
      break;

    case 'targeted_var_names':
      if (!optionValue || optionValue.length === 0) {
        THROW('ONLY_USE_WITH_SOME_TARGET_VARS'); // Omit otherwise to target all
      } // Which vars must be solved for this space to be solved
      // string: 'all'
      // string[]: list of vars that must be solved
      // function: callback to return list of names to be solved


      config.targetedVars = optionValue;
      break;

    case 'varStratOverrides':
      // An object which defines a value distributor per variable
      // which overrides the globally set value distributor.
      // See Bvar#distributeOptions (in multiverse)
      for (var _i2 = 0, _Object$entries2 = Object.entries(optionValue); _i2 < _Object$entries2.length; _i2++) {
        var _Object$entries2$_i = _Object$entries2[_i2],
            key = _Object$entries2$_i[0],
            value = _Object$entries2$_i[1];
        config_setOption(config, 'varValueStrat', value, key);
      }

      break;

    case 'varValueStrat':
      // Override all the specific strategy parameters for one variable
      ASSERT(typeof optionTarget === 'string', 'expecting a name');
      if (!config.varDistOptions) config.varDistOptions = {};
      ASSERT(!config.varDistOptions[optionTarget], 'should not be known yet');
      config.varDistOptions[optionTarget] = optionValue;

      if (optionValue.valtype === 'markov') {
        var matrix = optionValue.matrix;

        if (!matrix) {
          if (optionValue.expandVectorsWith) {
            optionValue.matrix = [{
              vector: []
            }];
            matrix = optionValue.matrix;
          } else {
            THROW('FDO: markov var missing distribution (needs matrix or expandVectorsWith)');
          }
        }

        for (var _iterator = matrix, _isArray = Array.isArray(_iterator), _i3 = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i3 >= _iterator.length) break;
            _ref = _iterator[_i3++];
          } else {
            _i3 = _iterator.next();
            if (_i3.done) break;
            _ref = _i3.value;
          }

          var row = _ref;
          if (row.boolean) THROW('row.boolean was deprecated in favor of row.boolVarName');
          if (row.booleanId !== undefined) THROW('row.booleanId is no longer used, please use row.boolVarName');
          var boolFuncOrName = row.boolVarName;

          if (typeof boolFuncOrName === 'function') {
            boolFuncOrName = boolFuncOrName(optionValue);
          }

          if (boolFuncOrName) {
            if (typeof boolFuncOrName !== 'string') {
              THROW('row.boolVarName, if it exists, should be the name of a var or a func that returns that name, was/got: ' + boolFuncOrName + ' (' + typeof boolFuncOrName + ')');
            } // Store the var index


            row._boolVarIndex = trie_get(config._varNamesTrie, boolFuncOrName);
          }
        }
      }

      break;
    // Hooks called before and after propagating each space.
    // The callback receives the targeted Space object.
    // If it returns truthy it immediately aborts the search entirely.
    // (Can be used for timeout, inspection, or manual selection)

    case 'beforeSpace':
      config.beforeSpace = optionValue;
      break;

    case 'afterSpace':
      config.afterSpace = optionValue;
      break;

    case 'var':
      return THROW('REMOVED. Replace `var` with `varStrategy`');

    case 'val':
      return THROW('REMOVED. Replace `var` with `valueStrategy`');

    case 'rng':
      // Sets the default rng for this solve. a string should be raw js
      // code, number will be a static return value, a function is used
      // as is. the resulting function should return a value `0<=v<1`
      if (typeof optionValue === 'string') {
        config.rngCode = optionValue;
      } else if (typeof optionValue === 'number') {
        config.rngCode = 'return ' + optionValue + ';'; // Dont use arrow function. i dont think this passes through babel.
      } else {
        ASSERT(typeof optionValue === 'function', 'rng should be a preferably a string and otherwise a function');
        config._defaultRng = optionValue;
      }

      break;

    default:
      THROW('unknown option');
  }
}
/**
 * @param {$config} config
 * @param {$propagator} propagator
 */


function config_addPropagator(config, propagator) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(propagator._class === '$propagator', 'EXPECTING_PROPAGATOR');

  config._propagators.push(propagator);
}
/**
 * Creates a mapping from a varIndex to a set of propagatorIndexes
 * These propagators are the ones that use the varIndex
 * This is useful for quickly determining which propagators
 * need to be stepped while propagating them.
 *
 * @param {$config} config
 */


function config_populateVarPropHash(config) {
  var hash = new Array(config.allVarNames.length);
  var propagators = config._propagators;
  var initialDomains = config.initialDomains;

  for (var propagatorIndex = 0, plen = propagators.length; propagatorIndex < plen; ++propagatorIndex) {
    var propagator = propagators[propagatorIndex];

    _config_addVarConditionally(propagator.index1, initialDomains, hash, propagatorIndex);

    if (propagator.index2 >= 0) _config_addVarConditionally(propagator.index2, initialDomains, hash, propagatorIndex);
    if (propagator.index3 >= 0) _config_addVarConditionally(propagator.index3, initialDomains, hash, propagatorIndex);
  }

  config._varToPropagators = hash;
}

function _config_addVarConditionally(varIndex, initialDomains, hash, propagatorIndex) {
  // (at some point this could be a strings, or array, or whatever)
  ASSERT(typeof varIndex === 'number', 'must be number'); // Dont bother adding props on unsolved vars because they can't affect
  // anything anymore. seems to prevent about 10% in our case so worth it.

  var domain = initialDomains[varIndex];
  ASSERT_NORDOM(domain, true, domain__debug);

  if (!domain_isSolved(domain)) {
    if (!hash[varIndex]) hash[varIndex] = [propagatorIndex];else if (hash[varIndex].indexOf(propagatorIndex) < 0) hash[varIndex].push(propagatorIndex);
  }
}
/**
 * Create a constraint. If the constraint has a result var it
 * will return (only) the variable name that ends up being
 * used (anonymous or not).
 *
 * In some edge cases the constraint can be resolved immediately.
 * There are two ways a constraint can resolve: solved or reject.
 * A solved constraint is omitted and if there is a result var it
 * will become a constant that is set to the outcome of the
 * constraint. If rejected the constraint will still be added and
 * will immediately reject the search once it starts.
 *
 * Due to constant optimization and mapping the result var name
 * may differ from the input var name. In that case both names
 * should map to the same var index internally. Only constraints
 * with a result var have a return value here.
 *
 * @param {$config} config
 * @param {string} name Type of constraint (hardcoded values)
 * @param {<string,number,undefined>[]} varNames All the argument var names for target constraint
 * @param {string} [param] The result var name for certain. With reifiers param is the actual constraint to reflect.
 * @returns {string|undefined} Actual result vars only, undefined otherwise. See desc above.
 */


function config_addConstraint(config, name, varNames, param) {
  // Should return a new var name for most props
  ASSERT(config && config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(varNames.every(function (e) {
    return typeof e === 'string' || typeof e === 'number' || e === undefined;
  }), 'all var names should be strings or numbers or undefined', varNames);
  var inputConstraintKeyOp = name;
  var resultVarName;
  var anonIsBool = false;

  switch (name
  /* eslint no-fallthrough: "off" */
  ) {
    case 'reifier':
      anonIsBool = true;
      inputConstraintKeyOp = param;
    // Fall-through

    case 'plus':
    case 'min':
    case 'ring-mul':
    case 'ring-div':
    case 'mul':
      ASSERT(varNames.length === 3, 'MISSING_RESULT_VAR');
    // Note that the third value may still be "undefined"
    // fall-through

    case 'sum':
    case 'product':
      {
        var sumOrProduct = name === 'product' || name === 'sum';
        resultVarName = sumOrProduct ? param : varNames[2];
        var resultVarIndex;

        if (resultVarName === undefined) {
          if (anonIsBool) resultVarIndex = config_addVarAnonRange(config, 0, 1);else resultVarIndex = config_addVarAnonNothing(config);
          resultVarName = config.allVarNames[resultVarIndex];
        } else if (typeof resultVarName === 'number') {
          resultVarIndex = config_addVarAnonConstant(config, resultVarName);
          resultVarName = config.allVarNames[resultVarIndex];
        } else if (typeof resultVarName === 'string') {
          resultVarIndex = trie_get(config._varNamesTrie, resultVarName);
          if (resultVarIndex < 0) THROW('Vars must be defined before using them (' + resultVarName + ')');
        } else {
          THROW("expecting result var name to be absent or a number or string: `" + resultVarName + "`");
        }

        if (sumOrProduct) param = resultVarIndex;else varNames[2] = resultVarName;
        break;
      }

    case 'distinct':
    case 'eq':
    case 'neq':
    case 'lt':
    case 'lte':
    case 'gt':
    case 'gte':
      break;

    default:
      THROW("UNKNOWN_PROPAGATOR " + name);
  } // Note: if param is a var constant then that case is already resolved above


  config_compileConstants(config, varNames);
  if (config_dedupeConstraint(config, inputConstraintKeyOp + '|' + varNames.join(','), resultVarName)) return resultVarName;
  var varIndexes = config_varNamesToIndexes(config, varNames);
  var constraint = constraint_create(name, varIndexes, param);
  config.allConstraints.push(constraint);
  return resultVarName;
}
/**
 * Go through the list of var names and create an anonymous var for
 * each value that is actually a number rather than a string.
 * Replaces the values inline.
 *
 * @param {$config} config
 * @param {string|number} varNames
 */


function config_compileConstants(config, varNames) {
  for (var i = 0, n = varNames.length; i < n; ++i) {
    if (typeof varNames[i] === 'number') {
      var varIndex = config_addVarAnonConstant(config, varNames[i]);
      varNames[i] = config.allVarNames[varIndex];
    }
  }
}
/**
 * Convert a list of var names to a list of their indexes
 *
 * @param {$config} config
 * @param {string[]} varNames
 * @returns {number[]}
 */


function config_varNamesToIndexes(config, varNames) {
  var varIndexes = [];

  for (var i = 0, n = varNames.length; i < n; ++i) {
    var varName = varNames[i];
    ASSERT(typeof varName === 'string', 'var names should be strings here', varName, i, varNames);
    var varIndex = trie_get(config._varNamesTrie, varName);
    if (varIndex === TRIE_KEY_NOT_FOUND) THROW('CONSTRAINT_VARS_SHOULD_BE_DECLARED', 'name=', varName, 'index=', i, 'names=', varNames);
    varIndexes[i] = varIndex;
  }

  return varIndexes;
}
/**
 * Check whether we already know a given constraint (represented by a unique string).
 * If we don't, add the string to the cache with the expected result name, if any.
 *
 * @param config
 * @param constraintUI
 * @param resultVarName
 * @returns {boolean}
 */


function config_dedupeConstraint(config, constraintUI, resultVarName) {
  if (!config._constraintHash) config._constraintHash = {}; // Can happen for imported configs that are extended or smt

  var haveConstraint = config._constraintHash[constraintUI];

  if (haveConstraint === true) {
    if (resultVarName !== undefined) {
      throw new Error('How is this possible?'); // Either a constraint-with-value gets a result var, or it's a constraint-sans-value
    }

    return true;
  }

  if (haveConstraint !== undefined) {
    ASSERT(typeof haveConstraint === 'string', 'if not true or undefined, it should be a string');
    ASSERT(resultVarName && typeof resultVarName === 'string', 'if it was recorded as a constraint-with-value then it should have a result var now as well'); // The constraint exists and had a result. map that result to this result for equivalent results.

    config_addConstraint(config, 'eq', [resultVarName, haveConstraint]); // _could_ also be optimized away ;)

    return true;
  }

  config._constraintHash[constraintUI] = resultVarName || true;
  return false;
}
/**
 * Generate all propagators from the constraints in given config
 * Puts these back into the same config.
 *
 * @param {$config} config
 */


function config_generatePropagators(config) {
  ASSERT(config && config._class === '$config', 'EXPECTING_CONFIG');
  var allConstraints = config.allConstraints;
  config._propagators = [];

  for (var _iterator2 = allConstraints, _isArray2 = Array.isArray(_iterator2), _i4 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray2) {
      if (_i4 >= _iterator2.length) break;
      _ref2 = _iterator2[_i4++];
    } else {
      _i4 = _iterator2.next();
      if (_i4.done) break;
      _ref2 = _i4.value;
    }

    var constraint = _ref2;

    if (constraint.varNames) {
      getTerm().warn('saw constraint.varNames, converting to varIndexes, log out result and update test accordingly');
      constraint.varIndexes = constraint.varNames.map(function (name) {
        return trie_get(config._varNamesTrie, name);
      });
      var p = constraint.param;
      delete constraint.param;
      delete constraint.varNames;
      constraint.param = p;
    }

    if (constraint.varIndexes[1] === -1) throw new Error('nope? ' + INSPECT(constraint));
    config_generatePropagator(config, constraint.name, constraint.varIndexes, constraint.param, constraint);
  }
}
/**
 * @param {$config} config
 * @param {string} name
 * @param {number[]} varIndexes
 * @param {string|undefined} param Depends on the prop; reifier=op name, product/sum=result var
 */


function config_generatePropagator(config, name, varIndexes, param, _constraint) {
  ASSERT(config && config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof name === 'string', 'NAME_SHOULD_BE_STRING');
  ASSERT(Array.isArray(varIndexes), 'INDEXES_SHOULD_BE_ARRAY', JSON.stringify(_constraint));

  switch (name) {
    case 'plus':
      return propagator_addPlus(config, varIndexes[0], varIndexes[1], varIndexes[2]);

    case 'min':
      return propagator_addMin(config, varIndexes[0], varIndexes[1], varIndexes[2]);

    case 'ring-mul':
      return propagator_addRingMul(config, varIndexes[0], varIndexes[1], varIndexes[2]);

    case 'ring-div':
      return propagator_addDiv(config, varIndexes[0], varIndexes[1], varIndexes[2]);

    case 'mul':
      return propagator_addMul(config, varIndexes[0], varIndexes[1], varIndexes[2]);

    case 'sum':
      return propagator_addSum(config, varIndexes.slice(0), param);

    case 'product':
      return propagator_addProduct(config, varIndexes.slice(0), param);

    case 'distinct':
      return propagator_addDistinct(config, varIndexes.slice(0));

    case 'reifier':
      return propagator_addReified(config, param, varIndexes[0], varIndexes[1], varIndexes[2]);

    case 'neq':
      return propagator_addNeq(config, varIndexes[0], varIndexes[1]);

    case 'eq':
      return propagator_addEq(config, varIndexes[0], varIndexes[1]);

    case 'gte':
      return propagator_addGte(config, varIndexes[0], varIndexes[1]);

    case 'lte':
      return propagator_addLte(config, varIndexes[0], varIndexes[1]);

    case 'gt':
      return propagator_addGt(config, varIndexes[0], varIndexes[1]);

    case 'lt':
      return propagator_addLt(config, varIndexes[0], varIndexes[1]);

    default:
      THROW('UNEXPECTED_NAME: ' + name);
  }
}

function config_generateMarkovs(config) {
  var varDistOptions = config.varDistOptions;

  for (var _i5 = 0, _Object$keys = Object.keys(varDistOptions); _i5 < _Object$keys.length; _i5++) {
    var varName = _Object$keys[_i5];
    var varIndex = trie_get(config._varNamesTrie, varName);
    if (varIndex < 0) THROW('Found markov var options for an unknown var name (name=' + varName + ')');
    var options = varDistOptions[varName];

    if (options && options.valtype === 'markov') {
      return propagator_addMarkov(config, varIndex);
    }
  }
}

function config_populateVarStrategyListHash(config) {
  var vsc = config.varStratConfig;

  while (vsc) {
    if (vsc.priorityByName) {
      var obj = {};
      var list = vsc.priorityByName;

      for (var i = 0, len = list.length; i < len; ++i) {
        var varIndex = trie_get(config._varNamesTrie, list[i]);
        ASSERT(varIndex !== TRIE_KEY_NOT_FOUND, 'VARS_IN_PRIO_LIST_SHOULD_BE_KNOWN_NOW');
        obj[varIndex] = len - i; // Never 0, offset at 1. higher value is higher prio
      }

      vsc._priorityByIndex = obj;
    }

    vsc = vsc.fallback;
  }
}
/**
 * At the start of a search, populate this config with the dynamic data
 *
 * @param {$config} config
 */


function config_init(config) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');

  if (!config._varNamesTrie) {
    config._varNamesTrie = trie_create(config.allVarNames);
  } // Generate the default rng ("Random Number Generator") to use in stuff like markov
  // We prefer the rngCode because that way we can serialize the config (required for stuff like webworkers)


  if (!config._defaultRng) config._defaultRng = config.rngCode ? new Function(config.rngCode) : Math.random;
  /* eslint no-new-func: "off" */

  ASSERT_VARDOMS_SLOW(config.initialDomains, domain__debug);
  config_generatePropagators(config);
  config_generateMarkovs(config);
  config_populateVarPropHash(config);
  config_populateVarStrategyListHash(config);
  ASSERT_VARDOMS_SLOW(config.initialDomains, domain__debug);
  ASSERT(config._varToPropagators, 'should have generated hash');
} // This is an export function for config

/**
 * Export a given config with optional target domains
 * (initial domains otherwise) to special DSL string.
 * The resulting string should be usable with the
 * importer to create a new solver with same state.
 * This function only omits constraints when they only
 * consist of constants. Optimization should occur elsewhere.
 *
 * @param {$config} config
 * @param {$domain[]} [vardoms] If not given then config.initialDomains are used
 * @param {boolean} [usePropagators] Output the low-level propagators instead of the higher level constraints
 * @param {boolean} [minimal] Omit comments, use short var names, reduce whitespace where possible. etc
 * @param {boolean} [withDomainComments] Put the input domains behind each constraint even if minimal=true
 * @param {boolean} [realName] Use the original var names?
 * @returns {string}
 */


function exporter(config, vardoms, usePropagators, minimal, withDomainComments, realName) {
  // TOFIX: the alias stuff needs to be unique. currently exports from presolver clash with names generated here.
  realName = true; // TODO: dont export contants that are not bound to constraints and not targeted explicitly
  // TODO: deal export->import better wrt anonymous vars

  var var_dist_options = config.varDistOptions;
  var domains = vardoms || config.initialDomains;
  var varNames = config.allVarNames;
  var indexToString = realName ? function (index) {
    return exporter_encodeVarName(varNames[index]);
  } : minimal ? exporter_varstrShort : exporter_varstrNum;
  var vars = varNames.map(function (varName, varIndex) {
    var domain = exporter_domstr(domains[varIndex]);
    var s = ': ' + indexToString(varIndex) + ' = ' + domain;
    var overrides = var_dist_options[varName];

    if (overrides && (overrides.valtype !== 'list' || overrides.list && overrides.list.length > 0)) {
      s += ' @' + overrides.valtype;

      switch (overrides.valtype) {
        case 'markov':
          if ('expandVectorsWith' in overrides) s += 'expand(' + (overrides.expandVectorsWith || 0) + ')';
          if ('legend' in overrides) s += ' legend(' + overrides.legend.join(' ') + ')';
          if ('matrix' in overrides) s += ' matrix(' + JSON.stringify(overrides.matrix).replace(/"/g, '') + ')';
          break;

        case 'list':
          if (typeof overrides.list === 'function') s += ' prio(???func???)';else s += ' prio(' + overrides.list.join(' ') + ')';
          break;

        case 'max':
        case 'mid':
        case 'min':
        case 'minMaxCycle':
        case 'naive':
        case 'splitMax':
        case 'splitMin':
          break;

        default:
          getTerm().warn('Unknown value strategy override: ' + overrides.valtype);
          s += ' @? ' + JSON.stringify(overrides);
      }
    }

    if (!realName && varName !== String(varIndex)) s += String(' # ' + exporter_encodeVarName(varName));
    return s;
  });
  var constraints = usePropagators ? [] : config.allConstraints.map(function (constraint) {
    var indexes = constraint.varIndexes; // Create var names for each index, unless solved, in that case use solved value as literal

    var aliases = indexes.map(indexToString);
    indexes.forEach(function (varIndex, i) {
      var v = domain_getValue(domains[varIndex]);
      if (v >= 0) aliases[i] = v;
    }); // Do same for param if it's an index

    var paramName = '';

    if (typeof constraint.param === 'number') {
      var paramV = domain_getValue(domains[constraint.param]);
      if (paramV >= 0) paramName = paramV;else paramName = indexToString(constraint.param);
    }

    var s = '';
    var comment = '';
    var op;

    switch (constraint.name) {
      case 'reifier':
        switch (constraint.param) {
          case 'eq':
            op = '==';
            break;

          case 'neq':
            op = '!=';
            break;

          case 'lt':
            op = '<';
            break;

          case 'lte':
            op = '<=';
            break;

          case 'gt':
            op = '>';
            break;

          case 'gte':
            op = '>=';
            break;

          default:
            THROW('what dis param: ' + op);
        }

        s += aliases[2] + ' = ' + aliases[0] + ' ' + op + '? ' + aliases[1];
        break;

      case 'plus':
        s += aliases[2] + ' = ' + aliases[0] + ' + ' + aliases[1];
        break;

      case 'min':
        s += aliases[2] + ' = ' + aliases[0] + ' - ' + aliases[1];
        break;

      case 'ring-mul':
        s += aliases[2] + ' = ' + aliases[0] + ' * ' + aliases[1];
        break;

      case 'ring-div':
        s += aliases[2] + ' = ' + aliases[0] + ' / ' + aliases[1];
        break;

      case 'mul':
        s += aliases[2] + ' = ' + aliases[0] + ' * ' + aliases[1];
        break;

      case 'sum':
        s += paramName + ' = sum(' + aliases.join(' ') + ')';
        break;

      case 'product':
        s += paramName + ' = product(' + aliases.join(' ') + ')';
        break;

      case 'markov':
        s += '# markov(' + aliases + ')';
        break;

      case 'distinct':
        s += 'distinct(' + aliases + ')';
        break;

      case 'eq':
        s += aliases[0] + ' == ' + aliases[1];
        break;

      case 'neq':
        s += aliases[0] + ' != ' + aliases[1];
        break;

      case 'lt':
        s += aliases[0] + ' < ' + aliases[1];
        break;

      case 'lte':
        s += aliases[0] + ' <= ' + aliases[1];
        break;

      case 'gt':
        s += aliases[0] + ' > ' + aliases[1];
        break;

      case 'gte':
        s += aliases[0] + ' >= ' + aliases[1];
        break;

      default:
        getTerm().warn('unknown constraint: ' + constraint.name);
        s += 'unknown = ' + JSON.stringify(constraint);
    }

    var t = s; // If a constraint has no vars, ignore it.
    // note: this assumes those constraints are not contradictions

    if (s.indexOf(realName ? "'" : '$') < 0 || constraint.name === 'distinct' && aliases.length <= 1 || (constraint.name === 'product' || constraint.name === 'sum') && aliases.length === 0) {
      if (!minimal) {
        comment += (comment ? ', ' : ' # ') + 'dropped; constraint already solved (' + s + ') (' + indexes.map(indexToString) + ', ' + indexToString(constraint.param) + ')';
      }

      s = '';
    }

    if (!minimal || withDomainComments) {
      // This is more for easier debugging...
      aliases.forEach(function (alias, i) {
        if (typeof alias === 'string') t = t.replace(alias, exporter_domstr(domains[indexes[i]]));
      });
      if (typeof constraint.param === 'number' && typeof paramName === 'string') t = t.replace(paramName, exporter_domstr(domains[constraint.param]));

      if (s || !minimal) {
        // S += ' '.repeat(Math.max(0, 30 - s.length))
        for (var i = Math.max(0, 30 - s.length); i >= 0; --i) {
          s += ' ';
        }

        s += '      # ' + t;
      }

      s += comment;
    }

    return s;
  }).filter(function (s) {
    return Boolean(s);
  });
  var propagators = usePropagators ? config._propagators.map(function (propagator) {
    var varIndex1 = propagator.index1;
    var varIndex2 = propagator.index2;
    var varIndex3 = propagator.index3;
    var v1 = varIndex1 >= 0 ? domain_getValue(domains[varIndex1]) : -1;
    var name1 = v1 >= 0 ? v1 : varIndex1 < 0 ? undefined : indexToString(varIndex1);
    var v2 = varIndex2 >= 0 ? domain_getValue(domains[varIndex2]) : -1;
    var name2 = v2 >= 0 ? v2 : varIndex2 < 0 ? undefined : indexToString(varIndex2);
    var v3 = varIndex3 >= 0 ? domain_getValue(domains[varIndex3]) : -1;
    var name3 = v3 >= 0 ? v3 : varIndex3 < 0 ? undefined : indexToString(varIndex3);
    var s = '';
    var comment = '';
    var op;

    switch (propagator.name) {
      case 'reified':
        switch (propagator.arg3) {
          case 'eq':
            op = '==';
            break;

          case 'neq':
            op = '!=';
            break;

          case 'lt':
            op = '<';
            break;

          case 'lte':
            op = '<=';
            break;

          case 'gt':
            op = '>';
            break;

          case 'gte':
            op = '>=';
            break;

          default:
            THROW('what dis param: ' + op);
        }

        s += name3 + ' = ' + name1 + ' ' + op + '? ' + name2;
        break;

      case 'eq':
        s += name1 + ' == ' + name2;
        break;

      case 'lt':
        s += name1 + ' < ' + name2;
        break;

      case 'lte':
        s += name1 + ' <= ' + name2;
        break;

      case 'mul':
        s += name3 + ' = ' + name1 + ' * ' + name2;
        break;

      case 'div':
        s += name3 + ' = ' + name1 + ' / ' + name2;
        break;

      case 'neq':
        s += name1 + ' != ' + name2;
        break;

      case 'min':
        s += name3 + ' = ' + name1 + ' - ' + name2;
        break;

      case 'ring':
        switch (propagator.arg1) {
          case 'plus':
            s += name3 + ' = ' + name1 + ' + ' + name2;
            break;

          case 'min':
            s += name3 + ' = ' + name1 + ' - ' + name2;
            break;

          case 'ring-mul':
            s += name3 + ' = ' + name1 + ' * ' + name2;
            break;

          case 'ring-div':
            s += name3 + ' = ' + name1 + ' / ' + name2;
            break;

          default:
            throw new Error('Unexpected ring op:' + propagator.arg1);
        }

        break;

      case 'markov':
        // ignore. the var @markov modifier should cause this. it's not a real constraint.
        return '';

      default:
        getTerm().warn('unknown propagator: ' + propagator.name);
        s += 'unknown = ' + JSON.stringify(propagator);
    }

    var t = s; // If a propagator has no vars, ignore it.
    // note: this assumes those constraints are not contradictions

    if (s.indexOf('$') < 0) {
      if (!minimal) comment += (comment ? ', ' : ' # ') + 'dropped; constraint already solved (' + s + ')';
      s = '';
    }

    if (!minimal) {
      // This is more for easier debugging...
      if (typeof name1 === 'string') t = t.replace(name1, exporter_domstr(domains[varIndex1]));
      if (typeof name2 === 'string') t = t.replace(name2, exporter_domstr(domains[varIndex2]));
      if (typeof name3 === 'string') t = t.replace(name3, exporter_domstr(domains[varIndex3]));
      s += ' '.repeat(Math.max(0, 30 - s.length)) + '      # initial: ' + t;
      s += comment;
    }

    return s;
  }).filter(function (s) {
    return Boolean(s);
  }) : [];
  return ['## constraint problem export', '@custom var-strat = ' + JSON.stringify(config.varStratConfig), // TODO
  '@custom val-strat = ' + config.valueStratName, vars.join('\n') || '# no vars', constraints.join('\n') || propagators.join('\n') || '# no constraints', '@custom targets ' + (config.targetedVars === 'all' ? ' = all' : '(' + config.targetedVars.map(function (varName) {
    return indexToString(trie_get(config._varNamesTrie, varName));
  }).join(' ') + ')'), '## end of export'].join('\n\n');
}

function exporter_encodeVarName(varName) {
  if (typeof varName === 'number') return varName; // Constant

  return "'" + varName + "'"; // "quoted var names" can contain any char.
}

function exporter_varstrNum(varIndex) {
  // Note: we put a `$` behind it so that we can search-n-replace for `$1` without matching `$100`
  return '$' + varIndex + '$';
}

function exporter_varstrShort(varIndex) {
  // Take care not to start the name with a number
  // note: .toString(36) uses a special (standard) base 36 encoding; 0-9a-z to represent 0-35
  var name = varIndex.toString(36);
  if (name[0] < 'a') name = '$' + name; // This is a little lazy but whatever

  return name;
}

function exporter_domstr(domain) {
  // Represent domains as pairs, a single pair as [lo hi] and multiple as [[lo hi] [lo hi]]
  var arrdom = domain_toArr(domain);
  if (arrdom.length === 2 && arrdom[0] === arrdom[1]) return String(arrdom[0]);

  if (arrdom.length > 2) {
    var dom = [];

    for (var i = 0, n = arrdom.length; i < n; i += 2) {
      dom.push('[' + arrdom[i] + ' ' + arrdom[i + 1] + ']');
    }

    arrdom = dom;
  }

  return '[' + arrdom.join(' ') + ']';
} // This is an import function for config

/**
 * @param {string} str
 * @param {FDO} [solver]
 * @param {boolean} [_debug] Log out entire input with error token on fail?
 * @returns {FDO}
 */


function importer(str, solver, _debug) {
  if (!solver) solver = new FDO();
  var pointer = 0;
  var len = str.length;

  while (!isEof()) {
    parseStatement();
  }

  return solver;

  function read() {
    return str[pointer];
  }

  function readD(delta) {
    return str[pointer + delta];
  }

  function skip() {
    ++pointer;
  }

  function is(c, desc) {
    if (read() !== c) THROW('Expected ' + (desc ? desc + ' ' : '') + '`' + c + '`, found `' + read() + '`');
    skip();
  }

  function skipWhitespaces() {
    while (pointer < len && isWhitespace(read())) {
      skip();
    }
  }

  function skipWhites() {
    while (!isEof()) {
      var c = read();

      if (isWhite(c)) {
        skip();
      } else if (isComment(c)) {
        skipComment();
      } else {
        break;
      }
    }
  }

  function isWhitespace(s) {
    return s === ' ' || s === '\t';
  }

  function isNewline(s) {
    return s === '\n' || s === '\r';
  }

  function isComment(s) {
    return s === '#';
  }

  function isWhite(s) {
    return isWhitespace(s) || isNewline(s);
  }

  function expectEol() {
    skipWhitespaces();

    if (pointer < len) {
      var c = read();

      if (c === '#') {
        skipComment();
      } else if (isNewline(c)) {
        skip();
      } else {
        THROW('Expected EOL but got `' + read() + '`');
      }
    }
  }

  function atEol() {
    if (pointer >= len) return true;
    var c = read();
    return c === '#' || isNewline(c);
  }

  function isEof() {
    return pointer >= len;
  }

  function parseStatement() {
    // Either:
    // - start with colon: var decl
    // - start with hash: line comment
    // - empty: empty
    // - otherwise: constraint
    skipWhites();

    switch (read()) {
      case ':':
        return parseVar();

      case '#':
        return skipComment();

      case '@':
        return parseAtRule();

      default:
        if (!isEof()) return parseUndefConstraint();
    }
  }

  function parseVar() {
    skip(); // Is(':')

    skipWhitespaces();
    var nameNames = parseIdentifier();
    skipWhitespaces();

    if (read() === ',') {
      nameNames = [nameNames];

      do {
        skip();
        skipWhitespaces();
        nameNames.push(parseIdentifier());
        skipWhitespaces();
      } while (!isEof() && read() === ',');
    }

    if (read() === '=') {
      skip();
      skipWhitespaces();
    }

    var domain = parseDomain();
    skipWhitespaces();
    var mod = parseModifier();
    expectEol();

    if (typeof nameNames === 'string') {
      solver.decl(nameNames, domain, mod, true);
    } else {
      nameNames.forEach(function (name) {
        return solver.decl(name, domain, mod, true);
      });
    }
  }

  function parseIdentifier() {
    if (read() === "'") return parseQuotedIdentifier();
    return parseUnquotedIdentifier();
  }

  function parseQuotedIdentifier() {
    is("'", 'start of Quoted identifier');
    var start = pointer;
    var c = read();

    while (!isEof() && !isNewline(c) && c !== "'") {
      skip();
      c = read();
    }

    if (isEof()) THROW('Quoted identifier must be closed');
    if (start === pointer) THROW('Expected to parse identifier, found none');
    is("'", 'end of Quoted identifier');
    return str.slice(start, pointer - 1); // Return unquoted ident
  }

  function parseUnquotedIdentifier() {
    // Anything terminated by whitespace
    var start = pointer;
    if (read() >= '0' && read() <= '9') THROW('Unquoted ident cant start with number');

    while (!isEof() && isValidUnquotedIdentChar(read())) {
      skip();
    }

    if (start === pointer) THROW('Expected to parse identifier, found none [' + read() + ']');
    return str.slice(start, pointer);
  }

  function isValidUnquotedIdentChar(c) {
    // Meh. i syntactically dont care about unicode chars so if you want to use them i wont stop you here
    return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c === '_' || c === '$' || c === '-' || c > '~';
  }

  function parseDomain() {
    // []
    // [lo hi]
    // [[lo hi] [lo hi] ..]
    // *
    // 25
    // (comma's optional and ignored)
    var c = read();
    var domain;

    switch (c) {
      case '[':
        is('[', 'domain start');
        skipWhitespaces();
        domain = [];

        if (read() === '[') {
          do {
            skip();
            skipWhitespaces();
            var lo = parseNumber();
            skipWhitespaces();

            if (read() === ',') {
              skip();
              skipWhitespaces();
            }

            var hi = parseNumber();
            skipWhitespaces();
            is(']', 'range-end');
            skipWhitespaces();
            domain.push(lo, hi);

            if (read() === ',') {
              skip();
              skipWhitespaces();
            }
          } while (read() === '[');
        } else if (read() !== ']') {
          do {
            skipWhitespaces();

            var _lo = parseNumber();

            skipWhitespaces();

            if (read() === ',') {
              skip();
              skipWhitespaces();
            }

            var _hi = parseNumber();

            skipWhitespaces();
            domain.push(_lo, _hi);

            if (read() === ',') {
              skip();
              skipWhitespaces();
            }
          } while (read() !== ']');
        }

        is(']', 'domain-end');
        if (domain.length === 0) THROW('Empty domain [] in dsl, this problem will always reject');
        return domain;

      case '*':
        skip();
        return [SUB, SUP];

      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        {
          var v = parseNumber();
          skipWhitespaces();
          return [v, v];
        }

      default:
        THROW('Expecting valid domain start, found `' + c + '`');
    }
  }

  function parseModifier() {
    if (read() !== '@') return;
    skip();
    var mod = {};
    var start = pointer;

    while (read() >= 'a' && read() <= 'z') {
      skip();
    }

    var stratName = str.slice(start, pointer);

    switch (stratName) {
      case 'list':
        parseList(mod);
        break;

      case 'markov':
        parseMarkov(mod);
        break;

      case 'max':
      case 'mid':
      case 'min':
      case 'naive':
        break;

      case 'minMaxCycle':
      case 'splitMax':
      case 'splitMin':
      default:
        THROW('implement me (var mod) [`' + stratName + '`]');
    }

    mod.valtype = stratName;
    return mod;
  }

  function parseList(mod) {
    skipWhitespaces();
    if (str.slice(pointer, pointer + 5) !== 'prio(') THROW('Expecting the priorities to follow the `@list`');
    pointer += 5;
    mod.list = parseNumList();
    is(')', 'list end');
  }

  function parseMarkov(mod) {
    for (;;) {
      skipWhitespaces();

      if (str.slice(pointer, pointer + 7) === 'matrix(') {
        // TOFIX: there is no validation here. apply stricter and safe matrix parsing
        var matrix = str.slice(pointer + 7, pointer = str.indexOf(')', pointer));
        var code = 'return ' + matrix;
        var func = new Function(code);
        /* eslint no-new-func: "off" */

        mod.matrix = func();
        if (pointer === -1) THROW('The matrix must be closed by a `)` but did not find any');
      } else if (str.slice(pointer, pointer + 7) === 'legend(') {
        pointer += 7;
        mod.legend = parseNumList();
        skipWhitespaces();
        is(')', 'legend closer');
      } else if (str.slice(pointer, pointer + 7) === 'expand(') {
        pointer += 7;
        mod.expandVectorsWith = parseNumber();
        skipWhitespaces();
        is(')', 'expand closer');
      } else {
        break;
      }

      skip();
    }
  }

  function skipComment() {
    is('#', 'comment start'); // Is('#', 'comment hash');

    while (!isEof() && !isNewline(read())) {
      skip();
    }

    if (!isEof()) skip();
  }

  function parseUndefConstraint() {
    // Parse a constraint that does not return a value itself
    // first try to parse single value constraints without value like markov() and distinct()
    if (parseUexpr()) return; // So the first value must be a value returning expr

    var A = parseVexpr(); // Returns a var name or a constant value

    skipWhitespaces();
    var cop = parseCop();
    skipWhitespaces();

    switch (cop) {
      case '=':
        parseAssignment(A);
        break;

      case '==':
        solver.eq(A, parseVexpr());
        break;

      case '!=':
        solver.neq(A, parseVexpr());
        break;

      case '<':
        solver.lt(A, parseVexpr());
        break;

      case '<=':
        solver.lte(A, parseVexpr());
        break;

      case '>':
        solver.gt(A, parseVexpr());
        break;

      case '>=':
        solver.gte(A, parseVexpr());
        break;

      case '&':
        // Force A and B to non-zero (artifact)
        // (could easily be done at compile time)
        // for now we mul the args and force the result non-zero, this way neither arg can be zero
        // TODO: this could be made "safer" with more work; `(A/A)+(B/B) > 0` doesnt risk going oob, i think. and otherwise we could sum two ==?0 reifiers to equal 2. just relatively very expensive.
        solver.neq(solver.mul(A, parseVexpr()), solver.num(0));
        break;

      case '!&':
        // Nand is a nall with just two args...
        // it is the opposite from AND, and so is the implementation
        // (except since we can force to 0 instead of "nonzero" we can drop the eq wrapper)
        solver.mul(A, parseVexpr(), solver.num(0));
        break;

      case '|':
        // Force at least one of A and B to be non-zero (both is fine too)
        // if we add both args and check the result for non-zero then at least one arg must be non-zero
        solver.neq(solver.plus(A, parseVexpr()), solver.num(0));
        break;

      case '!|':
        // Unconditionally force A and B to zero
        solver.eq(A, solver.num(0));
        solver.eq(parseVexpr(), solver.num(0));
        break;

      case '^':
        // Force A zero and B nonzero or A nonzero and B zero (anything else rejects)
        // this is more tricky/expensive to implement than AND and OR...
        // x=A+B,x==A^x==B owait
        // (A==?0)+(B==?0)==1
        solver.eq(solver.plus(solver.isEq(A, 0), solver.isEq(parseVexpr(), 0)), 1);
        break;

      case '!^':
        // Xor means A and B both solve to zero or both to non-zero
        // (A==?0)==(B==?0)
        solver.eq(solver.isEq(A, solver.num(0)), solver.isEq(parseVexpr(), solver.num(0)));
        break;

      case '->':
        {
          // I think this could be implemented in various ways
          // A -> B     =>    ((A !=? 0) <= (B !=? 0)) & ((B ==? 0) <= (A ==? 0))
          // (if A is nonzero then B must be nonzero, otherwise B can be anything. But also if B is zero then
          // A must be zero and otherwise A can be anything. They must both hold to simulate an implication.)
          var B = parseVexpr(); // (A !=? 0) <= (B !=? 0))

          solver.lte(solver.isNeq(A, solver.num(0)), solver.isNeq(B, solver.num(0))); // (B ==? 0) <= (A ==? 0)

          solver.lte(solver.isEq(B, solver.num(0)), solver.isEq(A, solver.num(0)));
          break;
        }

      case '!->':
        // Force A to nonzero and B to zero
        solver.gt(A, solver.num(0));
        solver.eq(parseVexpr(), solver.num(0));
        break;

      default:
        if (cop) THROW('Unknown cop that starts with: [' + cop + ']');
    }

    expectEol();
  }

  function parseAssignment(C) {
    // Note: if FDO api changes this may return the wrong value...
    // it should always return the "result var" var name or constant
    // (that would be C, but C may be undefined here and created by FDO)
    var freshVar = typeof C === 'string' && !solver.hasVar(C);
    if (freshVar) C = solver.decl(C);
    var A = parseVexpr(C, freshVar);
    skipWhitespaces();
    var c = read();

    if (isEof() || isNewline(c) || isComment(c)) {
      // Any group without "top-level" op (`A=(B+C)`), or sum() etc
      // but also something like `x = 5` (which we cant detect here)
      // so just to make sure those cases dont fall through add an
      // extra eq. this should resolve immediately without change to
      // cases like `x = sum()`
      solver.eq(A, C);
      return A;
    }

    return parseAssignRest(A, C, freshVar);
  }

  function parseAssignRest(A, C, freshVar) {
    var rop = parseRop();
    skipWhitespaces();

    switch (rop) {
      case '==?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return solver.isEq(A, parseVexpr(), C);

      case '!=?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return solver.isNeq(A, parseVexpr(), C);

      case '<?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return solver.isLt(A, parseVexpr(), C);

      case '<=?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return solver.isLte(A, parseVexpr(), C);

      case '>?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return solver.isGt(A, parseVexpr(), C);

      case '>=?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return solver.isGte(A, parseVexpr(), C);

      case '|?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return compileIssome(C, [A, parseVexpr()]);

      case '!|?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return compileIsnone(C, [A, parseVexpr()]);

      case '&?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return compileIsall(C, [A, parseVexpr()]);

      case '!&?':
        if (freshVar) solver.decl(C, [0, 1], undefined, false, true);
        return compileIsnall(C, [A, parseVexpr()]);

      case '+':
        return solver.plus(A, parseVexpr(), C);

      case '-':
        return solver.minus(A, parseVexpr(), C);

      case '*':
        return solver.mul(A, parseVexpr(), C);

      case '/':
        return solver.div(A, parseVexpr(), C);

      default:
        if (rop !== undefined) THROW('Expecting right paren or rop, got: `' + rop + '`');
        return A;
    }
  }

  function parseCop() {
    var c = read();

    switch (c) {
      case '=':
        skip();

        if (read() === '=') {
          skip();
          return '==';
        }

        return '=';

      case '!':
        skip();
        c = read();

        if (c === '=') {
          skip();
          return '!=';
        }

        if (c === '&') {
          skip();
          return '!&';
        }

        if (c === '^') {
          skip();
          return '!^';
        }

        if (c === '|') {
          skip();
          return '!|';
        }

        if (c === '-' && readD(1) === '>') {
          skip();
          skip();
          return '!->';
        }

        return '!';

      case '<':
        skip();

        if (read() === '=') {
          skip();
          return '<=';
        }

        return '<';

      case '>':
        skip();

        if (read() === '=') {
          skip();
          return '>=';
        }

        return '>';

      case '&':
      case '|':
      case '^':
        skip();
        return c;

      case '#':
        THROW('Expected to parse a cop but found a comment instead');
        break;

      case '-':
        if (readD(1) === '>') {
          skip();
          skip();
          return '->';
        }

        break;

      default:
        break;
    }

    if (isEof()) THROW('Expected to parse a cop but reached eof instead');
    THROW('Unknown cop char: `' + c + '`');
  }

  function parseRop() {
    var a = read();

    switch (a) {
      case '=':
        {
          skip();
          var b = read();

          if (b === '=') {
            skip();
            is('?', 'reifier suffix');
            return '==?';
          }

          return '=';
        }

      case '!':
        skip();

        if (read() === '=') {
          is('=', 'middle part of !=? op');
          is('?', 'reifier suffix');
          return '!=?';
        }

        if (read() === '|') {
          is('|', 'middle part of !|? op');
          is('?', 'reifier suffix');
          return '!|?';
        }

        if (read() === '&') {
          is('&', 'middle part of !&? op');
          is('?', 'reifier suffix');
          return '!&?';
        }

        THROW('invalid rop char after ! [' + read() + ']');
        break;

      case '<':
        skip();

        if (read() === '=') {
          skip();
          is('?', 'reifier suffix');
          return '<=?';
        }

        is('?', 'reifier suffix');
        return '<?';

      case '>':
        skip();

        if (read() === '=') {
          skip();
          is('?', 'reifier suffix');
          return '>=?';
        }

        is('?', 'reifier suffix');
        return '>?';

      case '|':
        skip();
        is('?', 'reifier suffix');
        return '|?';

      case '&':
        skip();
        is('?', 'reifier suffix');
        return '&?';

      case '+':
      case '-':
      case '*':
      case '/':
        skip();
        return a;

      default:
        THROW('Expecting right paren or rop, got: `' + a + '`');
    }
  }

  function parseUexpr() {
    // It's not very efficient (we could parse an ident before and check that result here) but it'll work for now
    if (str.slice(pointer, pointer + 4) === 'all(') parseAll();else if (str.slice(pointer, pointer + 9) === 'distinct(') parseDistinct(9);else if (str.slice(pointer, pointer + 5) === 'diff(') parseDistinct(5);else if (str.slice(pointer, pointer + 5) === 'nall(') parseNall();else if (str.slice(pointer, pointer + 5) === 'none(') parseNone();else if (str.slice(pointer, pointer + 5) === 'same(') parseSame();else if (str.slice(pointer, pointer + 5) === 'some(') parseSome();else if (str.slice(pointer, pointer + 5) === 'xnor(') parseXnor();else return false;
    return true;
  }

  function parseVexpList() {
    var list = [];
    skipWhitespaces();

    while (!isEof() && read() !== ')') {
      var v = parseVexpr();
      list.push(v);
      skipWhitespaces();

      if (read() === ',') {
        skip();
        skipWhitespaces();
      }
    }

    return list;
  }

  function parseVexpr(resultVar, freshVar) {
    // Valcall, ident, number, group
    var c = read();
    var v;
    if (c === '(') v = parseGrouping();else if (c === '[') {
      var d = parseDomain();
      if (d[0] === d[1] && d.length === 2) v = d[0];else v = solver.decl(undefined, d);
    } else if (c >= '0' && c <= '9') {
      v = parseNumber();
    } else {
      var ident = parseIdentifier();

      var _d = read();

      if (ident === 'sum' && _d === '(') {
        v = parseSum(resultVar);
      } else if (ident === 'product' && _d === '(') {
        v = parseProduct(resultVar);
      } else if (ident === 'all' && _d === '?' && (skip(), read() === '(')) {
        if (freshVar) solver.decl(resultVar, [0, 1], undefined, false, true);
        v = parseIsAll(resultVar);
      } else if (ident === 'diff' && _d === '?' && (skip(), read() === '(')) {
        if (freshVar) solver.decl(resultVar, [0, 1], undefined, false, true);
        v = parseIsDiff(resultVar);
      } else if (ident === 'nall' && _d === '?' && (skip(), read() === '(')) {
        if (freshVar) solver.decl(resultVar, [0, 1], undefined, false, true);
        v = parseIsNall(resultVar);
      } else if (ident === 'none' && _d === '?' && (skip(), read() === '(')) {
        if (freshVar) solver.decl(resultVar, [0, 1], undefined, false, true);
        v = parseIsNone(resultVar);
      } else if (ident === 'same' && _d === '?' && (skip(), read() === '(')) {
        if (freshVar) solver.decl(resultVar, [0, 1], undefined, false, true);
        v = parseIsSame(resultVar);
      } else if (ident === 'some' && _d === '?' && (skip(), read() === '(')) {
        if (freshVar) solver.decl(resultVar, [0, 1], undefined, false, true);
        v = parseIsSome(resultVar);
      } else if (_d === '?') {
        THROW('Unknown reifier constraint func: [' + ident + ']');
      } else {
        v = ident;
      }
    }
    return v;
  }

  function parseGrouping() {
    is('(', 'group open');
    skipWhitespaces();
    var A = parseVexpr();
    skipWhitespaces();

    if (read() === '=') {
      if (read() !== '=') {
        parseAssignment(A);
        skipWhitespaces();
        is(')', 'group closer');
        return A;
      }
    }

    if (read() === ')') {
      // Just wrapping a vexpr is okay
      skip();
      return A;
    }

    var C = parseAssignRest(A);
    skipWhitespaces();
    is(')', 'group closer');
    return C;
  }

  function parseNumber() {
    var start = pointer;

    while (read() >= '0' && read() <= '9') {
      skip();
    }

    if (start === pointer) {
      THROW('Expecting to parse a number but did not find any digits [' + start + ',' + pointer + '][' + read() + ']');
    }

    return parseInt(str.slice(start, pointer), 10);
  }

  function parseAll() {
    pointer += 4;
    skipWhitespaces();
    var refs = parseVexpList(); // R can only be 0 if (at least) one of the args is zero. so by removing
    // 0 from R's domain we require all args nonzero. cheap hack.

    var r = solver.product(refs, solver.decl(undefined, [1, SUP]));
    skipWhitespaces();
    is(')', 'ALL closer');
    return r;
  }

  function parseDistinct(delta) {
    pointer += delta;
    skipWhitespaces();
    var vals = parseVexpList();
    if (vals.length === 0) THROW('Expecting at least one expression');
    solver.distinct(vals);
    skipWhitespaces();
    is(')', 'distinct call closer');
    expectEol();
  }

  function parseSum(result) {
    is('(', 'sum call opener');
    skipWhitespaces();
    var refs = parseVexpList();
    var r = solver.sum(refs, result);
    skipWhitespaces();
    is(')', 'sum closer');
    return r;
  }

  function parseProduct(result) {
    is('(', 'product call opener');
    skipWhitespaces();
    var refs = parseVexpList();
    var r = solver.product(refs, result);
    skipWhitespaces();
    is(')', 'product closer');
    return r;
  }

  function parseIsAll(result) {
    is('(', 'isall call opener');
    skipWhitespaces();
    var refs = parseVexpList();
    var r = compileIsall(result, refs);
    skipWhitespaces();
    is(')', 'isall closer');
    return r;
  }

  function compileIsall(result, args) {
    // R = all?(A B C ...)   ->   X = A * B * C * ..., R = X !=? 0
    var x = solver.decl(); // Anon var [sub,sup]

    solver.product(args, x);
    return solver.isNeq(x, solver.num(0), result);
  }

  function parseIsDiff(result) {
    is('(', 'isdiff call opener');
    skipWhitespaces();
    var refs = parseVexpList(); // R = diff?(A B C ...)
    // =>
    // x e args, y e args, x!=y
    // =>
    // Rxy = dom(x) !=? dom(y)
    // c = sum(Rxy ...)
    // R = c ==? argCount

    var reifs = [];

    for (var i = 0; i < refs.length; ++i) {
      var indexA = refs[i];

      for (var j = i + 1; j < refs.length; ++j) {
        var indexB = refs[j];
        reifs.push(solver.isNeq(indexA, indexB));
      }
    }

    solver.isEq(solver.sum(reifs), solver.num(reifs.length), result);
    skipWhitespaces();
    is(')', 'isdiff closer');
    return result;
  }

  function parseIsNall(result) {
    is('(', 'isnall call opener');
    skipWhitespaces();
    var refs = parseVexpList();
    var r = compileIsnall(result, refs);
    skipWhitespaces();
    is(')', 'isnall closer');
    return r;
  }

  function compileIsnall(result, args) {
    // R = nall?(A B C ...)   ->   X = A * B * C * ..., R = X ==? 0
    var x = solver.decl(); // Anon var [sub,sup]

    solver.product(args, x);
    return solver.isEq(x, solver.num(0), result);
  }

  function parseIsNone(result) {
    is('(', 'isnone call opener');
    skipWhitespaces();
    var refs = parseVexpList();
    var r = compileIsnone(result, refs);
    skipWhitespaces();
    is(')', 'isnone closer');
    return r;
  }

  function compileIsnone(result, args) {
    // R = none?(A B C ...)   ->   X = sum(A B C ...), R = X ==? 0
    var x = solver.decl(); // Anon var [sub,sup]

    solver.sum(args, x);
    return solver.isEq(x, solver.num(0), result);
  }

  function parseIsSame(result) {
    is('(', 'issame call opener');
    skipWhitespaces();
    var refs = parseVexpList(); // R = same?(A B C ...)   ->   A==?B,B==?C,C==?..., sum(reifs) === reifs.length

    var reifs = [];

    for (var i = 1; i < refs.length; ++i) {
      var _r = solver.decl(undefined, [0, 1]);

      solver.isEq(refs[i - 1], refs[i], _r);
      reifs.push(_r);
    }

    var x = solver.decl(); // Anon var [sub,sup]

    solver.sum(reifs, x);
    var r = solver.isEq(x, solver.num(reifs.length), result);
    skipWhitespaces();
    is(')', 'issame closer');
    return r;
  }

  function parseIsSome(result) {
    is('(', 'issome call opener');
    skipWhitespaces();
    var refs = parseVexpList();
    var r = compileIssome(result, refs);
    skipWhitespaces();
    is(')', 'issome closer');
    return r;
  }

  function compileIssome(result, args) {
    // R = some?(A B C ...)   ->   X = sum(A B C ...), R = X !=? 0
    var x = solver.decl(); // Anon var [sub,sup]

    solver.sum(args, x);
    return solver.isNeq(x, solver.num(0), result);
  }

  function parseNall() {
    pointer += 5;
    skipWhitespaces();
    var refs = parseVexpList(); // TODO: could also sum reifiers but i think this is way more efficient. for the time being.

    solver.product(refs, solver.num(0));
    skipWhitespaces();
    is(')', 'nall closer');
    expectEol();
  }

  function parseNone() {
    pointer += 5;
    skipWhitespaces();
    var refs = parseVexpList();
    solver.sum(refs, solver.num(0)); // Lazy way out but should resolve immediately anyways

    skipWhitespaces();
    is(')', 'none closer');
    expectEol();
  }

  function parseSame() {
    pointer += 5;
    skipWhitespaces();
    var refs = parseVexpList();

    for (var i = 1; i < refs.length; ++i) {
      solver.eq(refs[i - 1], refs[i]);
    }

    skipWhitespaces();
    is(')', 'same closer');
    expectEol();
  }

  function parseSome() {
    pointer += 5;
    skipWhitespaces();
    var refs = parseVexpList();
    solver.sum(refs, solver.decl(undefined, [1, SUP]));
    skipWhitespaces();
    is(')', 'some closer');
    expectEol();
  }

  function parseXnor() {
    pointer += 5;
    skipWhitespaces();
    var refs = parseVexpList();
    skipWhitespaces();
    is(')', 'xnor() closer');
    expectEol(); // Xnor(A B C)
    // =>
    // x=X+B+C                  (if x is 0, all the args were zero: "none")
    // y=X*B*C                  (if y is not 0, none of the args were zero: "all")
    // (x==0) + (y!=0) == 1     (must all be zero or all be nonzero)

    var x = solver.decl(); // Anon var [sub,sup]

    var y = solver.decl(); // Anon var [sub,sup]

    solver.sum(refs, x);
    solver.product(refs, y);
    solver.plus(solver.isEq(x, 0), solver.isNeq(y, 0), 1);
  }

  function parseNumstr() {
    var start = pointer;

    while (read() >= '0' && read() <= '9') {
      skip();
    }

    return str.slice(start, pointer);
  }

  function parseNumList() {
    var nums = [];
    skipWhitespaces();
    var numstr = parseNumstr();

    while (numstr) {
      nums.push(parseInt(numstr, 10));
      skipWhitespaces();

      if (read() === ',') {
        ++pointer;
        skipWhitespaces();
      }

      numstr = parseNumstr();
    }

    if (nums.length === 0) THROW('Expected to parse a list of at least some numbers but found none');
    return nums;
  }

  function parseIdentList() {
    var idents = [];

    for (;;) {
      skipWhitespaces();
      if (atEol()) THROW('Missing target char at eol/eof');
      if (read() === ')') break;

      if (read() === ',') {
        skip();
        skipWhitespaces();
        if (atEol()) THROW('Trailing comma not supported');
      }

      if (read() === ',') THROW('Double comma not supported');
      var ident = parseIdentifier();
      idents.push(ident);
    }

    if (idents.length === 0) THROW('Expected to parse a list of at least some identifiers but found none');
    return idents;
  }

  function readLine() {
    var line = '';

    while (!isEof() && !isNewline(read())) {
      line += read();
      skip();
    }

    return line;
  }

  function parseAtRule() {
    is('@'); // Mostly temporary hacks while the dsl stabilizes...

    if (str.slice(pointer, pointer + 6) === 'custom') {
      pointer += 6;
      skipWhitespaces();
      var ident = parseIdentifier();
      skipWhitespaces();

      if (read() === '=') {
        skip();
        skipWhitespaces();
        if (read() === '=') THROW('Unexpected double eq sign');
      }

      switch (ident) {
        case 'var-strat':
          parseVarStrat();
          break;

        case 'val-strat':
          parseValStrat();
          break;

        case 'set-valdist':
          {
            skipWhitespaces();
            var target = parseIdentifier();
            var config = parseRestCustom();
            solver.setValueDistributionFor(target, JSON.parse(config));
            break;
          }

        case 'targets':
          parseTargets();
          break;

        case 'nobool':
        case 'noleaf':
        case 'free':
          skipWhitespaces();
          if (read() === ',') THROW('Leading comma not supported');
          if (atEol()) THROW('Expected to parse some var values'); // ignore. it's a presolver debug tool

          readLine();
          break;

        default:
          THROW('Unsupported custom rule: ' + ident);
      }
    } else {
      THROW('Unknown atrule');
    }

    expectEol();
  }

  function parseVarStrat() {
    // @custom var-strat [fallback] [=] naive
    // @custom var-strat [fallback] [=] size
    // @custom var-strat [fallback] [=] min
    // @custom var-strat [fallback] [=] max
    // @custom var-strat [fallback] [=] throw
    // @custom var-strat [fallback] [inverted] [list] (a b c)
    skipWhitespaces();
    var fallback = false;

    if (read() === 'f') {
      // Inverted
      var ident = parseIdentifier();
      if (ident !== 'fallback') THROW('Expecting `fallback` here');
      fallback = true;
      skipWhitespaces();
    }

    var inverted = false;

    if (read() === 'i') {
      // Inverted
      var _ident = parseIdentifier();

      if (_ident !== 'inverted') THROW('Expecting `inverted` here');
      inverted = true;
      skipWhitespaces();
    }

    if (read() === 'l' || read() === '(') {
      if (read() === 'l') {
        // List (optional keyword)
        if (parseIdentifier() !== 'list') THROW('Unexpected ident after `inverted` (only expecting `list` or the list)');
        skipWhitespaces();
      }

      is('(');
      var priorityByName = parseIdentList();
      if (priorityByName.length > 0) config_setOption(solver.config, fallback ? 'varStrategyFallback' : 'varStrategy', {
        type: 'list',
        inverted: inverted,
        priorityByName: priorityByName
      });else config_setOption(solver.config, fallback ? 'varStrategyFallback' : 'varStrategy', {
        type: 'naive'
      });
      skipWhitespaces();
      is(')');
    } else {
      if (read() === '=') {
        skip();
        skipWhitespaces();
      }

      if (inverted) THROW('The `inverted` keyword is only valid for a prio list'); // Parse ident and use that as the vardist

      var _ident2 = parseIdentifier();

      if (_ident2 === 'list') THROW('Use a grouped list of idents for vardist=list');
      if (_ident2 !== 'naive' && _ident2 !== 'size' && _ident2 !== 'min' && _ident2 !== 'max' && _ident2 !== 'throw') THROW('Unknown var dist [' + _ident2 + ']');
      config_setOption(solver.config, fallback ? 'varStrategyFallback' : 'varStrategy', {
        type: _ident2
      });
    }
  }

  function parseValStrat() {
    var name = parseIdentifier();
    expectEol();
    solver.config.valueStratName = name;
  }

  function parseRestCustom() {
    skipWhitespaces();

    if (read() === '=') {
      skip();
      skipWhitespaces();
    }

    return readLine();
  }

  function parseTargets() {
    skipWhitespaces();

    if (str.slice(pointer, pointer + 3) === 'all') {
      pointer += 3;
      solver.config.targetedVars = 'all';
    } else {
      is('(', 'ONLY_USE_WITH_SOME_TARGET_VARS');
      skipWhitespaces();
      if (read() === ',') THROW('Leading comma not supported');
      var idents = parseIdentList();
      if (idents.length > 0) solver.config.targetedVars = idents;
      is(')');
    }
  }

  function THROW(msg) {
    if (_debug) {
      getTerm().log(str.slice(0, pointer) + '##|PARSER_IS_HERE[' + msg + ']|##' + str.slice(pointer));
    }

    msg = 'Importer parser error: ' + msg + ', source at #|#: `' + str.slice(Math.max(0, pointer - 70), pointer) + '#|#' + str.slice(pointer, Math.min(str.length, pointer + 70)) + '`';
    throw new Error(msg);
  }
}

var space_uid = 0;
/**
 * @returns {$space}
 */

function space_createRoot() {
  ASSERT(!(space_uid = 0));

  if (process.env.NODE_ENV !== 'production') {
    // Only for debugging
    var _depth = 0;
    var _child = 0;
    var _path = '';
    return space_createNew([], undefined, _depth, _child, _path);
  }

  return space_createNew([]);
}
/**
 * @param {$config} config
 * @returns {$space}
 */


function space_createFromConfig(config) {
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  var space = space_createRoot();
  space_initFromConfig(space, config);
  return space;
}
/**
 * Create a space node that is a child of given space node
 *
 * @param {$space} space
 * @returns {$space}
 */


function space_createClone(space) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  var vardomsCopy = space.vardoms.slice(0);

  var unsolvedVarIndexes = space._unsolved.slice(0);

  if (process.env.NODE_ENV !== 'production') {
    // Only for debugging
    var _depth = space._depth + 1;

    var _child = space._child_count++;

    var _path = space._path;
    return space_createNew(vardomsCopy, unsolvedVarIndexes, _depth, _child, _path);
  }

  return space_createNew(vardomsCopy, unsolvedVarIndexes);
}
/**
 * Create a new config with the configuration of the given Space
 * Basically clones its config but updates the `initialDomains` with fresh state
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {$space}
 */


function space_toConfig(space, config) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  var vardoms = space.vardoms;
  var allVarNames = config.allVarNames;
  var newDomains = [];

  for (var i = 0, n = allVarNames.length; i < n; i++) {
    var domain = vardoms[i];
    newDomains[i] = domain_toStr(domain);
  }

  return config_clone(config, undefined);
}
/**
 * Concept of a space that holds config, some named domains (referred to as "vars"), and some propagators
 *
 * @param {$domain[]} vardoms Maps 1:1 to config.allVarNames
 * @param {number[]|undefined} unsolvedVarIndexes
 * @param {number} _depth (Debugging only) How many parent nodes are there from this node?
 * @param {number} _child (Debugging only) How manieth child is this of the parent?
 * @param {string} _path (Debugging only) String of _child values from root to this node (should be unique per node and len=_depth+1)
 * @returns {$space}
 */


function space_createNew(vardoms, unsolvedVarIndexes, _depth, _child, _path) {
  ASSERT(typeof vardoms === 'object' && vardoms, 'vars should be an object', vardoms);
  var space = {
    _class: '$space',
    vardoms: vardoms,
    _unsolved: unsolvedVarIndexes,
    next_distribution_choice: 0,
    updatedVarIndex: -1,
    // The varIndex that was updated when creating this space (-1 for root)
    _lastChosenValue: -1 // Cache to prevent duplicate operations

  }; // Search graph metrics (debug only)

  if (process.env.NODE_ENV !== 'production') {
    space._depth = _depth;
    space._child = _child;
    space._child_count = 0;
    space._path = _path + _child;
    space._uid = ++space_uid;
  }

  return space;
}
/**
 * @param {$space} space
 * @param {$config} config
 */


function space_initFromConfig(space, config) {
  ASSERT(space._class === '$space', 'EXPECTING_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  space_generateVars(space, config); // Config must be initialized (generating propas may introduce fresh vars)

  space_initializeUnsolvedVars(space, config);
}
/**
 * Initialized the list of unsolved variables. These are either the explicitly
 * targeted variables, or any unsolved variables if none were explicitly targeted.
 *
 * @param {$space} space
 * @param {$config} config
 */


function space_initializeUnsolvedVars(space, config) {
  ASSERT(space._class === '$space', 'EXPECTING_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  var targetVarNames = config.targetedVars;
  var vardoms = space.vardoms;
  var unsolvedVarIndexes = [];
  space._unsolved = unsolvedVarIndexes;

  if (targetVarNames === 'all') {
    for (var varIndex = 0, n = vardoms.length; varIndex < n; ++varIndex) {
      if (!domain_isSolved(vardoms[varIndex])) {
        if (config._varToPropagators[varIndex] || config._constrainedAway && config._constrainedAway.indexOf(varIndex) >= 0) {
          unsolvedVarIndexes.push(varIndex);
        }
      }
    }
  } else {
    ASSERT(Array.isArray(targetVarNames), 'expecting targetVarNames to be an array or the string `all`', targetVarNames);
    ASSERT(targetVarNames.every(function (e) {
      return typeof e === 'string';
    }), 'you must target var names only, they must all be strings', targetVarNames);
    var varNamesTrie = config._varNamesTrie;

    for (var _iterator = targetVarNames, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var varName = _ref;
      space_addVarNameToUnsolved(varName, varNamesTrie, vardoms, unsolvedVarIndexes);
    }
  }
}
/**
 * @param {string} varName
 * @param {$trie} varNamesTrie
 * @param {$nordom[]} vardoms
 * @param {number[]} unsolvedVarIndexes
 */


function space_addVarNameToUnsolved(varName, varNamesTrie, vardoms, unsolvedVarIndexes) {
  var varIndex = trie_get(varNamesTrie, varName);
  if (varIndex === TRIE_KEY_NOT_FOUND) THROW('E_VARS_SHOULD_EXIST_NOW [' + varName + ']');

  if (!domain_isSolved(vardoms[varIndex])) {
    unsolvedVarIndexes.push(varIndex);
  }
}
/**
 * Run all the propagators until stability point.
 * Returns true if any propagator rejects.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {boolean} when true, a propagator rejects and the (current path to a) solution is invalid
 */


function space_propagate(space, config) {
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('space_propagate()');
  });
  ASSERT(space._class === '$space', 'EXPECTING_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');

  if (process.env.NODE_ENV !== 'production') {
    config._propagates = (config._propagates | 0) + 1;
  }

  if (space_onBeforePropagate(space, config)) {
    return true;
  }

  var propagators = config._propagators; // "cycle" is one step, "epoch" all steps until stable (but not solved per se)
  // worst case all unsolved vars change. but in general it's about 30% so run with that

  var cells = Math.ceil(space._unsolved.length * TRIE_NODE_SIZE * 0.3);
  var changedTrie = trie_create(TRIE_EMPTY, cells); // Track changed vars per cycle in this epoch

  var cycles = 0;
  ASSERT(typeof cycles === 'number', 'cycles is a number?');
  ASSERT(changedTrie._class === '$trie', 'trie is a trie?');
  var changedVars = []; // In one cycle

  var minimal = 1;

  if (space.updatedVarIndex >= 0) {
    changedVars.push(space.updatedVarIndex);
  } else {
    // Very first cycle of first epoch of the search. all propagators must be visited at least once now.
    var rejected = space_propagateAll(space, config, propagators, changedVars, changedTrie, ++cycles);

    if (rejected) {
      return true;
    }
  }

  while (changedVars.length) {
    var newChangedVars = [];

    var _rejected = space_propagateChanges(space, config, propagators, minimal, changedVars, newChangedVars, changedTrie, ++cycles);

    if (_rejected) {
      return true;
    }

    changedVars = newChangedVars;
    minimal = 2; // See space_propagateChanges
  }

  if (space_onAfterPropagate(space, config)) {
    return true;
  }

  return false;
}

function space_propagateAll(space, config, propagators, changedVars, changedTrie, cycleIndex) {
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('space_propagateAll (' + propagators.length + ' propas have changed vars)');
  });

  for (var _iterator2 = propagators, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
    var _ref2;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref2 = _i2.value;
    }

    var propagator = _ref2;
    var rejected = space_propagateStep(space, config, propagator, changedVars, changedTrie, cycleIndex);
    if (rejected) return true;
  }

  return false;
}

function space_propagateByIndexes(space, config, propagators, propagatorIndexes, changedVars, changedTrie, cycleIndex) {
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('space_propagateByIndexes (' + propagatorIndexes.length + ' propas have changed vars)');
  });

  var _loop = function _loop(i, n) {
    var propagatorIndex = propagatorIndexes[i];
    var propagator = propagators[propagatorIndex];
    ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
      return log(' - ', i + 1 + '/' + propagatorIndexes.length, '; prop index=', propagatorIndex, ', prop=', JSON.stringify(propagator).replace(/\n/g, '; '));
    });
    var rejected = space_propagateStep(space, config, propagator, changedVars, changedTrie, cycleIndex);

    if (rejected) {
      ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
        return log(' - ', i + 1 + '/' + propagatorIndexes.length, '; has rejected');
      });
      return {
        v: true
      };
    }
  };

  for (var i = 0, n = propagatorIndexes.length; i < n; i++) {
    var _ret = _loop(i);

    if (typeof _ret === "object") return _ret.v;
  }

  return false;
}

function space_propagateStep(space, config, propagator, changedVars, changedTrie, cycleIndex) {
  ASSERT(propagator._class === '$propagator', 'EXPECTING_PROPAGATOR');
  var vardoms = space.vardoms;
  var index1 = propagator.index1,
      index2 = propagator.index2,
      index3 = propagator.index3,
      stepper = propagator.stepper,
      arg1 = propagator.arg1,
      arg2 = propagator.arg2,
      arg3 = propagator.arg3,
      arg4 = propagator.arg4,
      arg5 = propagator.arg5,
      arg6 = propagator.arg6;
  ASSERT(index1 !== 'undefined', 'all props at least use the first var...');
  var domain1 = vardoms[index1];
  var domain2 = index2 !== undefined && vardoms[index2];
  var domain3 = index3 !== undefined && vardoms[index3];
  ASSERT_NORDOM(domain1, true, domain__debug);
  ASSERT(domain2 === undefined || ASSERT_NORDOM(domain2, true, domain__debug));
  ASSERT(domain3 === undefined || ASSERT_NORDOM(domain3, true, domain__debug));
  ASSERT(typeof stepper === 'function', 'stepper should be a func'); // TODO: if we can get a "solved" state here we can prevent an isSolved check later...

  stepper(space, config, index1, index2, index3, arg1, arg2, arg3, arg4, arg5, arg6);

  if (domain1 !== vardoms[index1]) {
    if (domain_isEmpty(vardoms[index1])) {
      return true; // Fail
    }

    space_recordChange(index1, changedTrie, changedVars, cycleIndex);
  }

  if (index2 !== undefined && domain2 !== vardoms[index2]) {
    if (domain_isEmpty(vardoms[index2])) {
      return true; // Fail
    }

    space_recordChange(index2, changedTrie, changedVars, cycleIndex);
  }

  if (index3 !== undefined && index3 !== -1 && domain3 !== vardoms[index3]) {
    if (domain_isEmpty(vardoms[index3])) {
      return true; // Fail
    }

    space_recordChange(index3, changedTrie, changedVars, cycleIndex);
  }

  return false;
}

function space_recordChange(varIndex, changedTrie, changedVars, cycleIndex) {
  if (typeof varIndex === 'number') {
    var status = trie_getNum(changedTrie, varIndex);

    if (status !== cycleIndex) {
      changedVars.push(varIndex);
      trie_addNum(changedTrie, varIndex, cycleIndex);
    }
  } else {
    ASSERT(Array.isArray(varIndex), 'index1 is always used');

    for (var _iterator3 = varIndex, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray3) {
        if (_i3 >= _iterator3.length) break;
        _ref3 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) break;
        _ref3 = _i3.value;
      }

      var index = _ref3;
      space_recordChange(index, changedTrie, changedVars, cycleIndex);
    }
  }
}

function space_propagateChanges(space, config, allPropagators, minimal, targetVars, changedVars, changedTrie, cycleIndex) {
  ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
    return log('space_propagateChanges (' + targetVars.length + ' vars to check), var indexes;', targetVars.slice(0, 10) + (targetVars.length > 10 ? '... and ' + (targetVars.length - 10) + ' more' : ''));
  });
  ASSERT(space._class === '$space', 'EXPECTING_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  var varToPropagators = config._varToPropagators;

  var _loop2 = function _loop2(i, vlen) {
    var varIndex = targetVars[i];
    var propagatorIndexes = varToPropagators[varIndex];
    ASSERT_LOG(LOG_FLAG_PROPSTEPS, function (log) {
      return log(' - var ' + (i + 1) + '/' + targetVars.length, ', varIndex', targetVars[i], ', is part of', propagatorIndexes.length, 'propas;', propagatorIndexes);
    }); // Note: the first loop of propagate() should require all propagators affected, even if
    // it is just one. after that, if a var was updated that only has one propagator it can
    // only have been updated by that one propagator. however, this step is queueing up
    // propagators to check, again, since one of its vars changed. a propagator that runs
    // twice without other changes will change nothing. so we do it for the initial loop,
    // where the var is updated externally, after that the change can only occur from within
    // a propagator so we skip it.
    // ultimately a list of propagators should perform better but the indexOf negates that perf
    // (this doesn't affect a whole lot of vars... most of them touch multiple propas)

    if (propagatorIndexes && propagatorIndexes.length >= minimal) {
      var result = space_propagateByIndexes(space, config, allPropagators, propagatorIndexes, changedVars, changedTrie, cycleIndex);
      if (result) return {
        v: true
      }; // Rejected
    }
  };

  for (var i = 0, vlen = targetVars.length; i < vlen; i++) {
    var _ret2 = _loop2(i);

    if (typeof _ret2 === "object") return _ret2.v;
  }

  return false;
}
/**
 * @param {$space} space
 * @param {$config} config
 * @returns {boolean}
 */


function space_onBeforePropagate(space, config) {
  var callback = config.beforeSpace;

  if (callback && callback(space)) {
    config.aborted = true;
    return true;
  }

  return false;
}
/**
 * @param {$space} space
 * @param {$config} config
 * @returns {boolean}
 */


function space_onAfterPropagate(space, config) {
  var callback = config.afterSpace;

  if (callback && callback(space)) {
    config.aborted = true;
    return true;
  }

  return false;
}
/**
 * Returns true if this space is solved - i.e. when
 * all the vars in the space have a singleton domain.
 *
 * This is a *very* strong condition that might not need
 * to be satisfied for a space to be considered to be
 * solved. For example, the propagators may determine
 * ranges for all variables under which all conditions
 * are met and there would be no further need to enumerate
 * those solutions.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {boolean}
 */


function space_updateUnsolvedVarList(space, config) {
  ASSERT(space._class === '$space', 'EXPECTING_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  var vardoms = space.vardoms;
  var unsolvedVarIndexes = space._unsolved;
  var m = 0;

  for (var _iterator4 = unsolvedVarIndexes, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
    var _ref4;

    if (_isArray4) {
      if (_i4 >= _iterator4.length) break;
      _ref4 = _iterator4[_i4++];
    } else {
      _i4 = _iterator4.next();
      if (_i4.done) break;
      _ref4 = _i4.value;
    }

    var varIndex = _ref4;
    var domain = vardoms[varIndex];

    if (!domain_isSolved(domain)) {
      unsolvedVarIndexes[m++] = varIndex;
    }
  }

  unsolvedVarIndexes.length = m;
  return m === 0; // 0 unsolved means we've solved it :)
}
/**
 * Returns an object whose field names are the var names
 * and whose values are the solved values. The space *must*
 * be already in a solved state for this to work.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {Object}
 */


function space_solution(space, config) {
  ASSERT(space._class === '$space', 'EXPECTING_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  var allVarNames = config.allVarNames;
  var result = {};

  for (var varIndex = 0, n = allVarNames.length; varIndex < n; varIndex++) {
    var varName = allVarNames[varIndex];
    result[varName] = space_getVarSolveState(space, varIndex);
  }

  return result;
}
/**
 * Note: this is the (shared) second most called function of the library
 * (by a third of most, but still significantly more than the rest)
 *
 * @param {$space} space
 * @param {number} varIndex
 * @returns {number|number[]|boolean} The solve state for given var index, also put into result
 */


function space_getVarSolveState(space, varIndex) {
  ASSERT(typeof varIndex === 'number', 'VAR_SHOULD_BE_INDEX');
  var domain = space.vardoms[varIndex];

  if (domain_isEmpty(domain)) {
    return false;
  }

  var value = domain_getValue(domain);
  if (value !== NO_SUCH_VALUE) return value;
  return domain_toArr(domain);
}
/**
 * Initialize the vardoms array on the first space node.
 *
 * @param {$space} space
 * @param {$config} config
 */


function space_generateVars(space, config) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  var vardoms = space.vardoms;
  ASSERT(vardoms, 'expecting var domains');
  var initialDomains = config.initialDomains;
  ASSERT(initialDomains, 'config should have initial vars');
  var allVarNames = config.allVarNames;
  ASSERT(allVarNames, 'config should have a list of vars');

  for (var varIndex = 0, len = allVarNames.length; varIndex < len; varIndex++) {
    var domain = initialDomains[varIndex];
    ASSERT_NORDOM(domain, true, domain__debug);
    vardoms[varIndex] = domain_toSmallest(domain);
  }
}

var BETTER = 1;
var SAME = 2;
var WORSE = 3;
/**
 * Given a list of variables return the next var to consider based on the
 * current var distribution configuration and an optional filter condition.
 *
 * @param {$space} space
 * @param {$config} config
 * @return {number}
 */

function distribution_getNextVarIndex(space, config) {
  var varStratConfig = config.varStratConfig;
  var isBetterVarFunc = distribution_getFunc(varStratConfig.type);

  var varIndex = _distribution_varFindBest(space, config, isBetterVarFunc, varStratConfig);

  return varIndex;
}
/**
 * @param {string} distName
 * @returns {Function|undefined}
 */


function distribution_getFunc(distName) {
  switch (distName) {
    case 'naive':
      return null;

    case 'size':
      return distribution_varByMinSize;

    case 'min':
      return distribution_varByMin;

    case 'max':
      return distribution_varByMax;

    case 'markov':
      return distribution_varByMarkov;

    case 'list':
      return distribution_varByList;

    case 'throw':
      return THROW('Throwing an error because var-strat requests it');

    default:
      return THROW('unknown next var func', distName);
  }
}
/**
 * Return the best varIndex according to a fitness function
 *
 * @param {$space} space
 * @param {$config} config
 * @param {Function($space, currentIndex, bestIndex, Function)} [fitnessFunc] Given two var indexes returns true iif the first var is better than the second var
 * @param {Object} varStratConfig
 * @returns {number} The varIndex of the next var or NO_SUCH_VALUE
 */


function _distribution_varFindBest(space, config, fitnessFunc, varStratConfig) {
  var i = 0;
  var unsolvedVarIndexes = space._unsolved;
  ASSERT(unsolvedVarIndexes.length, 'there should be unsolved vars left to pick (caller should ensure this)');
  var bestVarIndex = unsolvedVarIndexes[i++];

  if (fitnessFunc) {
    for (var len = unsolvedVarIndexes.length; i < len; i++) {
      var varIndex = unsolvedVarIndexes[i];
      ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
      ASSERT(space.vardoms[varIndex] !== undefined, 'expecting each varIndex to have an domain', varIndex);

      if (BETTER === fitnessFunc(space, config, varIndex, bestVarIndex, varStratConfig)) {
        bestVarIndex = varIndex;
      }
    }
  }

  ASSERT(typeof bestVarIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(bestVarIndex >= 0, 'VAR_INDEX_SHOULD_BE_POSITIVE');
  return bestVarIndex;
} // #####
// preset fitness functions
// #####


function distribution_varByMinSize(space, config, varIndex1, varIndex2) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  var n = domain_size(space.vardoms[varIndex1]) - domain_size(space.vardoms[varIndex2]);
  if (n < 0) return BETTER;
  if (n > 0) return WORSE;
  return SAME;
}

function distribution_varByMin(space, config, varIndex1, varIndex2) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  ASSERT_NORDOM(space.vardoms[varIndex1]);
  ASSERT_NORDOM(space.vardoms[varIndex2]);
  ASSERT(space.vardoms[varIndex1] && space.vardoms[varIndex2], 'EXPECTING_NON_EMPTY');
  var n = domain_min(space.vardoms[varIndex1]) - domain_min(space.vardoms[varIndex2]);
  if (n < 0) return BETTER;
  if (n > 0) return WORSE;
  return SAME;
}

function distribution_varByMax(space, config, varIndex1, varIndex2) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  var n = domain_max(space.vardoms[varIndex1]) - domain_max(space.vardoms[varIndex2]);
  if (n > 0) return BETTER;
  if (n < 0) return WORSE;
  return SAME;
}

function distribution_varByMarkov(space, config, varIndex1, varIndex2, varStratConfig) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  var distOptions = config.varDistOptions; // V1 is only, but if so always, better than v2 if v1 is a markov var

  var varName1 = config.allVarNames[varIndex1];
  ASSERT(typeof varName1 === 'string', 'VAR_NAME_SHOULD_BE_STRING');

  if (distOptions[varName1] && distOptions[varName1].valtype === 'markov') {
    return BETTER;
  }

  var varName2 = config.allVarNames[varIndex2];
  ASSERT(typeof varName2 === 'string', 'VAR_NAME_SHOULD_BE_STRING');

  if (distOptions[varName2] && distOptions[varName2].valtype === 'markov') {
    return WORSE;
  }

  return distribution_varFallback(space, config, varIndex1, varIndex2, varStratConfig.fallback);
}

function distribution_varByList(space, config, varIndex1, varIndex2, varStratConfig) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER'); // Note: config._priorityByIndex is compiled by FDO#prepare from given priorityByName
  // if in the list, lowest prio can be 1. if not in the list, prio will be undefined

  var hash = varStratConfig._priorityByIndex; // If v1 or v2 is not in the list they will end up as undefined

  var p1 = hash[varIndex1];
  var p2 = hash[varIndex2];
  ASSERT(p1 !== 0, 'SHOULD_NOT_USE_INDEX_ZERO');
  ASSERT(p2 !== 0, 'SHOULD_NOT_USE_INDEX_ZERO');

  if (!p1 && !p2) {
    // Neither has a priority
    return distribution_varFallback(space, config, varIndex1, varIndex2, varStratConfig.fallback);
  } // Invert this operation? ("deprioritizing").


  var inverted = varStratConfig.inverted; // If inverted being on the list makes it worse than not.

  if (!p2) {
    if (inverted) return WORSE;
    return BETTER;
  }

  if (!p1) {
    if (inverted) return BETTER;
    return WORSE;
  } // The higher the p, the higher the prio. (the input array is compiled that way)
  // if inverted then low p is higher prio


  if (p1 > p2) {
    if (inverted) return WORSE;
    return BETTER;
  }

  ASSERT(p1 < p2, 'A_CANNOT_GET_SAME_INDEX_FOR_DIFFERENT_NAME');
  if (inverted) return BETTER;
  return WORSE;
}

function distribution_varFallback(space, config, varIndex1, varIndex2, fallbackConfig) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex1 === 'number', 'INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof varIndex2 === 'number', 'INDEX_SHOULD_BE_NUMBER');

  if (!fallbackConfig) {
    return SAME;
  }

  var distName = fallbackConfig.type;

  switch (distName) {
    case 'size':
      return distribution_varByMinSize(space, config, varIndex1, varIndex2);

    case 'min':
      return distribution_varByMin(space, config, varIndex1, varIndex2);

    case 'max':
      return distribution_varByMax(space, config, varIndex1, varIndex2);

    case 'markov':
      return distribution_varByMarkov(space, config, varIndex1, varIndex2, fallbackConfig);

    case 'list':
      return distribution_varByList(space, config, varIndex1, varIndex2, fallbackConfig);

    case 'throw':
      return THROW('nope');

    default:
      return THROW("Unknown var dist fallback name: " + distName);
  }
}
/*
Markov Distribution Helpers
======================================================================

Helpers for Markov-style probabilistic value & var distributions.

const markov = {
  legend: ['small', 'med', 'large'],
  matrix: [{
    vector: [.5, 1, 1],
    condition: function (S, varId) {
      var prev = S.readMatrix(varId, S.cursor() - 1)
      return S.isEqual(prev, 'small');
    },
  }, {
    vector: [1, 1, 1],
    condition: function () { return true; },
  },
  ],
};

const markov = {
  legend: ['small', 'med', 'large'],
  matrix: [{
    vector: [.5, 1, 1],
    condition: function (S, varId) {
      var prev = S.readMatrix(varId, S.cursor() - 1);
      var result = {
        value: S.isEqual(prev, 'small'),
        deps: ...,
      };
      return result;
    },
  }, {
    vector: [1, 1, 1],
    condition: function () { return true; },
  }],
};

Inhomogenous Markov chains [see](https://cw.fel.cvut.cz/wiki/_media/courses/a6m33bin/markov-chains-2.pdf)

in an inhomogeneous Markov model, we can have different distributions at different positions in the sequence

https://en.wikipedia.org/wiki/Markov_chain#Music

*/

/**
 * Given a domain, probability vector, value legend, and rng
 * function; return one of the values in the value legend
 * according to the outcome of the rng and considering the
 * prob weight of each value in the legend.
 * The rng should be normalized (returning values from 0 including
 * up to but not including 1), unless the argument says otherwise
 * (that is used for testing only, to get around rounding errors).
 *
 * @param {$domain} domain A regular domain. It's values only determine whether a legend value can be used, it may have values that can never be picked. It's only a filter mask.
 * @param {number[]} probVector List of probabilities, maps 1:1 to val_legend.
 * @param {number[]} valLegend List of values eligible for picking. Maps 1:1 to prob_vector. Only values in the current domain are actually eligible.
 * @param {Function} randomFunc
 * @param {boolean} [rngIsNormalized=true] Is 0<=rng()<1 or 0<=rng()<total_prob ? The latter is only used for testing to avoid rounding errors.
 * @return {number | undefined}
 */


function distribution_markovSampleNextFromDomain(domain, probVector, valLegend, randomFunc, rngIsNormalized) {
  if (rngIsNormalized === void 0) {
    rngIsNormalized = true;
  }

  ASSERT(Boolean(valLegend), 'A_SHOULD_HAVE_VAL_LEGEND');
  ASSERT(probVector.length <= valLegend.length, 'A_PROB_VECTOR_SIZE_SHOULD_BE_LTE_LEGEND'); // Make vector & legend for available values only

  var filteredLegend = [];
  var cumulativeFilteredProbVector = [];
  var totalProb = 0;

  for (var index = 0; index < probVector.length; index++) {
    var prob = probVector[index];

    if (prob > 0) {
      var value = valLegend[index];

      if (domain_containsValue(domain, value)) {
        totalProb += prob;
        cumulativeFilteredProbVector.push(totalProb);
        filteredLegend.push(value);
      }
    }
  } // No more values left to search


  if (cumulativeFilteredProbVector.length === 0) {
    return;
  } // Only one value left


  if (cumulativeFilteredProbVector.length === 1) {
    return filteredLegend[0];
  } // TOFIX: could set `cumulativeFilteredProbVector[cumulativeFilteredProbVector.length-1] = 1` here...


  return _distribution_markovRoll(randomFunc, totalProb, cumulativeFilteredProbVector, filteredLegend, rngIsNormalized);
}
/**
 * @private
 * @param {Function} rng A function ("random number generator"), which is usually normalized, but in tests may not be
 * @param {number} totalProb
 * @param {number[]} cumulativeProbVector Maps 1:1 to the value legend. `[prob0, prob0+prob1, prob0+prob1+prob2, etc]`
 * @param {number[]} valueLegend
 * @param {boolean} rngIsNormalized
 * @returns {number}
 */


function _distribution_markovRoll(rng, totalProb, cumulativeProbVector, valueLegend, rngIsNormalized) {
  var rngRoll = rng();
  var probVal = rngRoll;

  if (rngIsNormalized) {
    // 0 <= rng < 1
    // roll should yield; 0<=value<1
    ASSERT(rngRoll >= 0, 'RNG_SHOULD_BE_NORMALIZED');
    ASSERT(rngRoll < 1, 'RNG_SHOULD_BE_NORMALIZED');
    probVal = rngRoll * totalProb;
  } // Else 0 <= rng < totalProb (mostly to avoid precision problems in tests)


  var index = 0;

  for (var probVectorCount = cumulativeProbVector.length; index < probVectorCount; index++) {
    // Note: if first element is 0.1 and roll is 0.1 this will pick the
    // SECOND item. by design. so prob domains are `[x, y)`
    var prob = cumulativeProbVector[index];

    if (prob > probVal) {
      break;
    }
  }

  return valueLegend[index];
}
/*
The functions in this file are supposed to determine the next
value while solving a Space. The functions are supposed to
return the new domain for some given var index. If there's no
new choice left it should return undefined to signify the end.
*/


var FIRST_CHOICE = 0;
var SECOND_CHOICE = 1;
var THIRD_CHOICE = 2;
var NO_CHOICE = undefined;

function distribute_getNextDomainForVar(space, config, varIndex, choiceIndex) {
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(space.vardoms[varIndex] && !domain_isSolved(space.vardoms[varIndex]), 'CALLSITE_SHOULD_PREVENT_DETERMINED'); // TODO: test

  var valueStrategy = config.valueStratName; // Each var can override the value distributor

  var configVarDistOptions = config.varDistOptions;
  var varName = config.allVarNames[varIndex];
  ASSERT(typeof varName === 'string', 'VAR_NAME_SHOULD_BE_STRING');
  var valueDistributorName = configVarDistOptions[varName] && configVarDistOptions[varName].valtype;
  if (valueDistributorName) valueStrategy = valueDistributorName;
  var domain = typeof valueStrategy === 'function' ? valueStrategy(space, varIndex, choiceIndex) : _distribute_getNextDomainForVar(valueStrategy, space, config, varIndex, choiceIndex);
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribute_getNextDomainForVar; index', varIndex, 'is now', domain__debug(domain));
  });
  return domain;
}

function _distribute_getNextDomainForVar(stratName, space, config, varIndex, choiceIndex) {
  ASSERT(space._class === '$space', 'EXPECTING_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');

  switch (stratName) {
    case 'max':
      return distribution_valueByMax(space, varIndex, choiceIndex);

    case 'markov':
      return distribution_valueByMarkov(space, config, varIndex, choiceIndex);

    case 'mid':
      return distribution_valueByMid(space, varIndex, choiceIndex);

    case 'min':
    case 'naive':
      return distribution_valueByMin(space, varIndex, choiceIndex);

    case 'minMaxCycle':
      return distribution_valueByMinMaxCycle(space, varIndex, choiceIndex);

    case 'list':
      return distribution_valueByList(space, config, varIndex, choiceIndex);

    case 'splitMax':
      return distribution_valueBySplitMax(space, varIndex, choiceIndex);

    case 'splitMin':
      return distribution_valueBySplitMin(space, varIndex, choiceIndex);

    case 'throw':
      return THROW('Throwing an error because val-strat requests it');

    default:
      THROW('unknown next var func', stratName);
  }
}
/**
 * Attempt to solve by setting var domain to values in the order
 * given as a list. This may also be a function which should
 * return a new domain given the space, var index, and choice index.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain for this var index in the next space TOFIX: support small domains
 */


function distribution_valueByList(space, config, varIndex, choiceIndex) {
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribution_valueByList', varIndex, choiceIndex);
  });
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(config._class === '$config', 'EXPECTING_CONFIG');
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
  var domain = space.vardoms[varIndex];
  var varName = config.allVarNames[varIndex];
  ASSERT(typeof varName === 'string', 'VAR_NAME_SHOULD_BE_STRING');
  ASSERT(domain && !domain_isSolved(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
  var configVarDistOptions = config.varDistOptions;
  ASSERT(configVarDistOptions, 'space should have config.varDistOptions');
  ASSERT(configVarDistOptions[varName], 'there should be distribution options available for every var', varName);
  ASSERT(configVarDistOptions[varName].list, 'there should be a distribution list available for every var', varName);
  var varDistOptions = configVarDistOptions[varName];
  var listSource = varDistOptions.list;
  var fallbackName = '';

  if (varDistOptions.fallback) {
    fallbackName = varDistOptions.fallback.valtype;
    ASSERT(fallbackName, 'should have a fallback type');
    ASSERT(fallbackName !== 'list', 'prevent recursion loops');
  }

  var list = listSource;

  if (typeof listSource === 'function') {
    // Note: callback should return the actual list
    list = listSource(space, varName, choiceIndex);
  }

  switch (choiceIndex) {
    case FIRST_CHOICE:
      {
        var nextValue = domain_getFirstIntersectingValue(domain, list);

        if (nextValue === NO_SUCH_VALUE) {
          return _distribute_getNextDomainForVar(fallbackName || 'naive', space, config, varIndex, FIRST_CHOICE);
        }

        space._lastChosenValue = nextValue;
        return domain_createValue(nextValue);
      }

    case SECOND_CHOICE:
      if (space._lastChosenValue >= 0) {
        return domain_removeValue(domain, space._lastChosenValue);
      }

      return _distribute_getNextDomainForVar(fallbackName || 'naive', space, config, varIndex, SECOND_CHOICE);

    default:
      ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_THRICE');
      return NO_CHOICE;
  }
}
/**
 * Searches through a var's values from min to max.
 * For each value in the domain it first attempts just
 * that value, then attempts the domain without this value.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */


function distribution_valueByMin(space, varIndex, choiceIndex) {
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribution_valueByMin', varIndex, choiceIndex);
  });
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
  var domain = space.vardoms[varIndex];
  ASSERT_NORDOM(domain);
  ASSERT(domain && !domain_isSolved(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');

  switch (choiceIndex) {
    case FIRST_CHOICE:
      {
        var minValue = domain_min(domain);
        space._lastChosenValue = minValue;
        return domain_createValue(minValue);
      }

    case SECOND_CHOICE:
      // Cannot lead to empty domain because lo can only be SUP if
      // domain was solved and we assert it wasn't.
      ASSERT(space._lastChosenValue >= 0, 'first choice should set this property and it should at least be 0', space._lastChosenValue);
      return domain_removeValue(domain, space._lastChosenValue);

    default:
      ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_THRICE');
      return NO_CHOICE;
  }
}
/**
 * Searches through a var's values from max to min.
 * For each value in the domain it first attempts just
 * that value, then attempts the domain without this value.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */


function distribution_valueByMax(space, varIndex, choiceIndex) {
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribution_valueByMax', varIndex, choiceIndex);
  });
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
  var domain = space.vardoms[varIndex];
  ASSERT_NORDOM(domain);
  ASSERT(domain && !domain_isSolved(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');

  switch (choiceIndex) {
    case FIRST_CHOICE:
      {
        var maxValue = domain_max(domain);
        space._lastChosenValue = maxValue;
        return domain_createValue(maxValue);
      }

    case SECOND_CHOICE:
      // Cannot lead to empty domain because hi can only be SUB if
      // domain was solved and we assert it wasn't.
      ASSERT(space._lastChosenValue > 0, 'first choice should set this property and it should at least be 1', space._lastChosenValue);
      return domain_removeValue(domain, space._lastChosenValue);

    default:
      ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_THRICE');
      return NO_CHOICE;
  }
}
/**
 * Searches through a var's values by taking the middle value.
 * This version targets the value closest to `(max-min)/2`
 * For each value in the domain it first attempts just
 * that value, then attempts the domain without this value.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */


function distribution_valueByMid(space, varIndex, choiceIndex) {
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribution_valueByMid', varIndex, choiceIndex);
  });
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
  var domain = space.vardoms[varIndex];
  ASSERT_NORDOM(domain);
  ASSERT(domain && !domain_isSolved(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');

  switch (choiceIndex) {
    case FIRST_CHOICE:
      {
        var middle = domain_middleElement(domain);
        space._lastChosenValue = middle;
        return domain_createValue(middle);
      }

    case SECOND_CHOICE:
      ASSERT(space._lastChosenValue >= 0, 'first choice should set this property and it should at least be 0', space._lastChosenValue);
      return domain_removeValue(domain, space._lastChosenValue);

    default:
      ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_THRICE');
      return NO_CHOICE;
  }
}
/**
 * Search a domain by splitting it up through the (max-min)/2 middle.
 * First simply tries the lower half, then tries the upper half.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */


function distribution_valueBySplitMin(space, varIndex, choiceIndex) {
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribution_valueBySplitMin', varIndex, choiceIndex);
  });
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
  var domain = space.vardoms[varIndex];
  ASSERT_NORDOM(domain);
  ASSERT(domain && !domain_isSolved(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
  var max = domain_max(domain);

  switch (choiceIndex) {
    case FIRST_CHOICE:
      {
        // TOFIX: can do this more optimal if coding it out explicitly
        var min = domain_min(domain);
        var mmhalf = min + Math.floor((max - min) / 2);
        space._lastChosenValue = mmhalf; // Note: domain is not determined so the operation cannot fail
        // Note: this must do some form of intersect, though maybe not constrain

        return domain_intersection(domain, domain_createRange(min, mmhalf));
      }

    case SECOND_CHOICE:
      {
        ASSERT(space._lastChosenValue >= 0, 'first choice should set this property and it should at least be 0', space._lastChosenValue); // Note: domain is not determined so the operation cannot fail
        // Note: this must do some form of intersect, though maybe not constrain

        return domain_intersection(domain, domain_createRange(space._lastChosenValue + 1, max));
      }

    default:
      ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_THRICE');
      return NO_CHOICE;
  }
}
/**
 * Search a domain by splitting it up through the (max-min)/2 middle.
 * First simply tries the upper half, then tries the lower half.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */


function distribution_valueBySplitMax(space, varIndex, choiceIndex) {
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribution_valueBySplitMax', varIndex, choiceIndex);
  });
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
  var domain = space.vardoms[varIndex];
  ASSERT_NORDOM(domain);
  ASSERT(domain && !domain_isSolved(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');
  var min = domain_min(domain);

  switch (choiceIndex) {
    case FIRST_CHOICE:
      {
        // TOFIX: can do this more optimal if coding it out explicitly
        var max = domain_max(domain);
        var mmhalf = min + Math.floor((max - min) / 2);
        space._lastChosenValue = mmhalf; // Note: domain is not determined so the operation cannot fail
        // Note: this must do some form of intersect, though maybe not constrain

        return domain_intersection(domain, domain_createRange(mmhalf + 1, max));
      }

    case SECOND_CHOICE:
      {
        ASSERT(space._lastChosenValue >= 0, 'first choice should set this property and it should at least be 0', space._lastChosenValue); // Note: domain is not determined so the operation cannot fail
        // Note: this must do some form of intersect, though maybe not constrain

        return domain_intersection(domain, domain_createRange(min, space._lastChosenValue));
      }

    default:
      ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_THRICE');
      return NO_CHOICE;
  }
}
/**
 * Applies distribution_valueByMin and distribution_valueByMax alternatingly
 * depending on the position of the given var in the list of vars.
 *
 * @param {$space} space
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */


function distribution_valueByMinMaxCycle(space, varIndex, choiceIndex) {
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribution_valueByMinMaxCycle', varIndex, choiceIndex);
  });

  if (_isEven(varIndex)) {
    return distribution_valueByMin(space, varIndex, choiceIndex);
  }

  return distribution_valueByMax(space, varIndex, choiceIndex);
}
/**
 * @param {number} n
 * @returns {boolean}
 */


function _isEven(n) {
  return n % 2 === 0;
}
/**
 * Search a domain by applying a markov chain to determine an optimal value
 * checking path.
 *
 * @param {$space} space
 * @param {$config} config
 * @param {number} varIndex
 * @param {number} choiceIndex
 * @returns {$domain|undefined} The new domain this var index should get in the next space
 */


function distribution_valueByMarkov(space, config, varIndex, choiceIndex) {
  ASSERT_LOG(LOG_FLAG_CHOICE, function (log) {
    return log('distribution_valueByMarkov', varIndex, choiceIndex);
  });
  ASSERT(space._class === '$space', 'SPACE_SHOULD_BE_SPACE');
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(typeof choiceIndex === 'number', 'CHOICE_SHOULD_BE_NUMBER');
  var domain = space.vardoms[varIndex];
  ASSERT_NORDOM(domain);
  ASSERT(domain && !domain_isSolved(domain), 'DOMAIN_SHOULD_BE_UNDETERMINED');

  switch (choiceIndex) {
    case FIRST_CHOICE:
      {
        // THIS IS AN EXPENSIVE STEP!
        var varName = config.allVarNames[varIndex];
        ASSERT(typeof varName === 'string', 'VAR_NAME_SHOULD_BE_STRING');
        var configVarDistOptions = config.varDistOptions;
        ASSERT(configVarDistOptions, 'space should have config.varDistOptions');
        var distOptions = configVarDistOptions[varName];
        ASSERT(distOptions, 'markov vars should have  distribution options');
        var expandVectorsWith = distOptions.expandVectorsWith;
        ASSERT(distOptions.matrix, 'there should be a matrix available for every var');
        ASSERT(distOptions.legend || typeof expandVectorsWith === 'number' && expandVectorsWith >= 0, 'every var should have a legend or expandVectorsWith set');
        var random = distOptions.random || config._defaultRng;
        ASSERT(typeof random === 'function', 'RNG_SHOULD_BE_FUNCTION'); // Note: expandVectorsWith can be 0, so check with null

        var values = markov_createLegend(typeof expandVectorsWith === 'number', distOptions.legend, domain);
        var valueCount = values.length;

        if (!valueCount) {
          return NO_CHOICE;
        }

        var probabilities = markov_createProbVector(space, distOptions.matrix, expandVectorsWith, valueCount);
        var value = distribution_markovSampleNextFromDomain(domain, probabilities, values, random);

        if (value === null) {
          return NO_CHOICE;
        }

        ASSERT(domain_containsValue(domain, value), 'markov picks a value from the existing domain so no need for a constrain below');
        space._lastChosenValue = value;
        return domain_createValue(value);
      }

    case SECOND_CHOICE:
      {
        var lastValue = space._lastChosenValue;
        ASSERT(typeof lastValue === 'number', 'should have cached previous value');
        var newDomain = domain_removeValue(domain, lastValue);
        ASSERT(domain, 'domain cannot be empty because only one value was removed and the domain is asserted to be not solved above');
        ASSERT_NORDOM(newDomain, true, domain__debug);
        return newDomain;
      }

    default:
      ASSERT(choiceIndex === THIRD_CHOICE, 'SHOULD_NOT_CALL_MORE_THAN_THRICE');
      return NO_CHOICE;
  }
}
/**
 * Depth first search.
 *
 * Traverse the search space in DFS order and return the first (next) solution
 *
 * state.space must be the starting space. The object is used to store and
 * track continuation information from that point onwards.
 *
 * On return, state.status contains either 'solved' or 'end' to indicate
 * the status of the returned solution. Also state.more will be true if
 * the search can continue and there may be more solutions.
 *
 * @param {Object} state
 * @property {$space} state.space Root space if this is the start of searching
 * @property {boolean} [state.more] Are there spaces left to investigate after the last solve?
 * @property {$space[]} [state.stack]=[state,space] The search stack as initialized by this class
 * @property {string} [state.status] Set to 'solved' or 'end'
 * @param {$config} config
 * @param {Function} [dbgCallback] Call after each epoch until it returns false, then stop calling it.
 */


function search_depthFirst(state, config, dbgCallback) {
  var stack = state.stack;
  var epochs = 0; // The stack only contains stable spaces. the first space is not
  // stable so we propagate it first and before putting it on the stack.

  var isStart = !stack || stack.length === 0;

  if (isStart) {
    if (!stack) {
      state.stack = [];
      stack = state.stack;
    }

    var solved = search_depthFirstLoop(state.space, config, stack, state);
    if (dbgCallback && dbgCallback(++epochs)) dbgCallback = undefined;
    if (solved) return;
  }

  while (stack.length > 0 && !config.aborted) {
    ASSERT_LOG(LOG_FLAG_SEARCH, function (log) {
      return log('');
    });
    ASSERT_LOG(LOG_FLAG_SEARCH, function (log) {
      return log('');
    }); // Take the top space and generate the next offspring, if any

    var childSpace = search_createNextSpace(stack[stack.length - 1], config);

    if (childSpace) {
      // Stabilize the offspring and put it on the stack
      var _solved = search_depthFirstLoop(childSpace, config, stack, state);

      if (dbgCallback && dbgCallback(++epochs)) dbgCallback = undefined;
      if (_solved) return;
    } else {
      // Remove the space, it has no more children. this is a dead end.
      stack.pop();
    }
  } // There are no more spaces to explore and therefor no further solutions to be found.


  state.status = 'end';
  state.more = false;
}
/**
 * One search step of the given space
 *
 * @param {$space} space
 * @param {$config} config
 * @param {$space[]} stack
 * @param {Object} state See search_depthFirst
 * @returns {boolean}
 */


function search_depthFirstLoop(space, config, stack, state) {
  ASSERT_LOG(LOG_FLAG_SEARCH, function (log) {
    return log('search_depthFirstLoop; next space');
  });
  ASSERT_LOG(LOG_FLAG_SEARCH, function (log) {
    return log('  -', Math.min(10, space.vardoms.length) + '/' + space.vardoms.length, 'domains:', space.vardoms.slice(0, 10).map(domain__debug).join(', '));
  });
  ASSERT_LOG(LOG_FLAG_SEARCH, function (log) {
    return log('  - updated var index:', space.updatedVarIndex < 0 ? 'root space so check all' : space.updatedVarIndex);
  });
  var rejected = space_propagate(space, config);
  ASSERT_LOG(LOG_FLAG_SEARCH, function (log) {
    return log('search_depthFirstLoop; did space_propagate reject?', rejected);
  });

  if (rejected) {
    ASSERT_LOG(LOG_FLAG_SEARCH, function (log) {
      return log(' ##  REJECTED');
    });

    if (config.aborted) {
      ASSERT_LOG(LOG_FLAG_SEARCH, function (log) {
        return log(' ##  (ABORTED BY CALLBACK)');
      });
    }
  }

  return search_afterPropagation(rejected, space, config, stack, state);
}
/**
 * Process a propagated space and the result. If it rejects, discard the
 * space. If it passed, act accordingly. Otherwise determine whether the
 * space has children. If so queue them. Otherwise discard the space.
 *
 * @param {boolean} rejected Did the propagation end due to a rejection?
 * @param {$space} space
 * @param {$config} config
 * @param {$space[]} stack
 * @param {Object} state See search_depthFirst
 * @returns {boolean|undefined}
 */


function search_afterPropagation(rejected, space, config, stack, state) {
  if (rejected) {
    space.failed = true;
    return false;
  }

  var solved = space_updateUnsolvedVarList(space, config);

  if (solved) {
    _search_onSolve(state, space, stack);

    return true;
  } // Put on the stack so the next loop can branch off it


  stack.push(space);
  return undefined; // Neither solved nor rejected
}
/**
 * Create a new Space based on given Space which basically
 * serves as a child node in a search graph. The space is
 * cloned and in the clone one variable is restricted
 * slightly further. This clone is then returned.
 * This takes various search and distribution strategies
 * into account.
 *
 * @param {$space} space
 * @param {$config} config
 * @returns {$space|undefined} a clone with small modification or nothing if this is an unsolved leaf node
 */


function search_createNextSpace(space, config) {
  var varIndex = distribution_getNextVarIndex(space, config);
  ASSERT(typeof varIndex === 'number', 'VAR_INDEX_SHOULD_BE_NUMBER');
  ASSERT(varIndex >= 0, 'VAR_INDEX_SHOULD_BE_POSITIVE');

  if (varIndex !== NO_SUCH_VALUE) {
    var domain = space.vardoms[varIndex];

    if (!domain_isSolved(domain)) {
      var choice = space.next_distribution_choice++;
      var nextDomain = distribute_getNextDomainForVar(space, config, varIndex, choice);

      if (nextDomain) {
        var clone = space_createClone(space);
        clone.updatedVarIndex = varIndex;
        clone.vardoms[varIndex] = nextDomain;
        return clone;
      }
    }
  } // Space is an unsolved leaf node, return undefined

}
/**
 * When search finds a solution this function is called
 *
 * @param {Object} state The search state data
 * @param {Space} space The search node to fail
 * @param {Space[]} stack See state.stack
 */


function _search_onSolve(state, space, stack) {
  state.status = 'solved';
  state.space = space; // Is this so the solution can be read from it?

  state.more = stack.length > 0;
}
/**
 * Finite Domain brute force solver Only
 * No input-problem optimizations applied, will try to solve the problem as is.
 *
 * @type {FDO}
 */


var FDO =
/*#__PURE__*/
function () {
  /**
   * @param {Object} options = {}
   * @property {string} [options.distribute='naive']
   * @property {Object} [options.searchDefaults]
   * @property {$config} [options.config=config_create()]
   * @property {boolean} [options.exportBare]
   * @property {number} [options.logging=LOG_NONE]
   * @property {Object} [options.logger=console] An object like `console` that can override some of its methods
   */
  function FDO(options) {
    if (options === void 0) {
      options = {};
    }

    this._class = 'fdo';
    if (options.logger) setTerm(options.logger);
    this.logging = options.log || LOG_NONE;
    this.distribute = options.distribute || 'naive';

    if (process.env.NODE_ENV !== 'production') {
      if (options.exportBare !== undefined) {
        this.GENERATE_BARE_DSL = options.exportBare || false;
        this.exported = '';
      }
    }

    ASSERT(options._class !== '$config', 'config should be passed on in a config property of options');

    if (options.config) {
      this.config = options.config;
      var config = this.config;

      if (config.initialDomains) {
        var initialDomains = config.initialDomains;

        for (var i = 0, len = initialDomains.length; i < len; ++i) {
          var domain = initialDomains[i];
          if (domain.length === 0) domain = domain_createEmpty();
          initialDomains[i] = domain_anyToSmallest(domain);
        }
      }

      if (config._propagators) config._propagators = undefined; // Will be regenerated

      if (config._varToPropagators) config._varToPropagators = undefined; // Will be regenerated
    } else {
      this.config = config_create();
    }

    this.solutions = [];
    this.state = {
      space: null,
      more: false
    };
    this._prepared = false;
  }
  /**
   * Returns an anonymous var with given value as lo/hi for the domain
   *
   * @param {number} num
   * @returns {string}
   */


  var _proto = FDO.prototype;

  _proto.num = function num(_num) {
    if (typeof _num !== 'number') {
      THROW("FDO#num: expecting a number, got " + _num + " (a " + typeof _num + ")");
    }

    if (isNaN(_num)) {
      THROW('FDO#num: expecting a number, got NaN');
    }

    var varIndex = config_addVarAnonConstant(this.config, _num);

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += ': __' + varIndex + '__ = ' + _num + '\n';
      }
    }

    return this.config.allVarNames[varIndex];
  }
  /**
   * Declare a var with optional given domain or constant value and distribution options.
   *
   * @param {string} [varName] Optional, Note that you can use this.num() to declare a constant.
   * @param {$arrdom|number} [domainOrValue] Note: if number, it is a constant (so [domain,domain]) not a $numdom! If omitted it becomes [SUB, SUP]
   * @param {Object} [distributionOptions] Var distribution options. A defined non-object here will throw an error to prevent doing declRange
   * @param {boolean} [_allowEmpty=false] Temp (i hope) override for importer
   * @param {boolean} [_override=false] Explicitly override the initial domain for an already existing var (for importer)
   * @returns {string}
   */
  ;

  _proto.decl = function decl(varName, domainOrValue, distributionOptions, _allowEmpty, _override) {
    if (varName === '') THROW('Var name can not be the empty string');
    ASSERT(varName === undefined || typeof varName === 'string', 'var name should be undefined or a string');
    ASSERT(distributionOptions === undefined || typeof distributionOptions === 'object', 'options must be omitted or an object');
    var arrdom = typeof domainOrValue === 'number' ? [domainOrValue, domainOrValue] : domainOrValue || [SUB, SUP];
    ASSERT_ARRDOM(arrdom);
    if (arrdom.length === 0 && !_allowEmpty) THROW('EMPTY_DOMAIN_NOT_ALLOWED');
    var varIndex = config_addVarDomain(this.config, varName || true, arrdom, _allowEmpty, _override);
    varName = this.config.allVarNames[varIndex];

    if (distributionOptions) {
      if (distributionOptions.distribute) THROW('Use `valtype` to set the value distribution strategy');
      config_setOption(this.config, 'varValueStrat', distributionOptions, varName);
    }

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += ': ' + exporter_encodeVarName(varName) + ' = [' + arrdom + ']';

        if (distributionOptions && distributionOptions.valtype === 'markov') {
          this.exported += ' @markov';

          if (distributionOptions.matrix) {
            this.exported += ' matrix(' + distributionOptions.matrix + ')';
          }

          if (distributionOptions.expandVectorsWith !== undefined) {
            this.exported += ' expand(' + distributionOptions.expandVectorsWith + ')';
          }

          if (distributionOptions.legend) {
            this.exported += ' legend(' + distributionOptions.legend + ')';
          }
        }

        this.exported += ' # options=' + JSON.stringify(distributionOptions) + '\n';
      }
    }

    return varName;
  }
  /**
   * Declare multiple variables with the same domain/options
   *
   * @param {string[]} varNames
   * @param {$arrdom|number} [domainOrValue] Note: if number, it is a constant (so [domain,domain]) not a $numdom! If omitted it becomes [SUB, SUP]
   * @param {Object} [options] Var distribution options. A number here will throw an error to prevent doing declRange
   */
  ;

  _proto.decls = function decls(varNames, domainOrValue, options) {
    for (var i = 0, n = varNames.length; i < n; ++i) {
      this.decl(varNames[i], domainOrValue, options);
    }
  }
  /**
   * Declare a var with given range
   *
   * @param {string} varName
   * @param {number} lo Ensure SUB<=lo<=hi<=SUP
   * @param {number} hi Ensure SUB<=lo<=hi<=SUP
   * @param {Object} [options] Var distribution options
   */
  ;

  _proto.declRange = function declRange(varName, lo, hi, options) {
    ASSERT(typeof lo === 'number', 'LO_SHOULD_BE_NUMBER');
    ASSERT(typeof hi === 'number', 'HI_SHOULD_BE_NUMBER');
    ASSERT(typeof options === 'object' || options === undefined, 'EXPECTING_OPTIONS_OR_NOTHING');
    return this.decl(varName, [lo, hi], options);
  } // Arithmetic Propagators
  ;

  _proto.plus = function plus(A, B, C) {
    var R = config_addConstraint(this.config, 'plus', [A, B, C]);

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' + ' + exporter_encodeVarName(B) + ' # plus, result var was: ' + C + '\n';
      }
    }

    return R;
  };

  _proto.minus = function minus(A, B, C) {
    var R = config_addConstraint(this.config, 'min', [A, B, C]);

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' - ' + exporter_encodeVarName(B) + ' # min, result var was: ' + C + '\n';
      }
    }

    return R;
  };

  _proto.mul = function mul(A, B, C) {
    var R = config_addConstraint(this.config, 'ring-mul', [A, B, C]);

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' * ' + exporter_encodeVarName(B) + ' # ringmul, result var was: ' + C + '\n';
      }
    }

    return R;
  };

  _proto.div = function div(A, B, C) {
    var R = config_addConstraint(this.config, 'ring-div', [A, B, C]);

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' / ' + exporter_encodeVarName(B) + ' # ringdiv, result var was: ' + C + '\n';
      }
    }

    return R;
  };

  _proto.sum = function sum(A, C) {
    var R = config_addConstraint(this.config, 'sum', A, C);

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = sum(' + A.map(exporter_encodeVarName) + ') # result var was: ' + C + '\n';
      }
    }

    return R;
  };

  _proto.product = function product(A, C) {
    var R = config_addConstraint(this.config, 'product', A, C);

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = product(' + A.map(exporter_encodeVarName) + ') # result var was: ' + C + '\n';
      }
    }

    return R;
  } // TODO
  // times_plus    k1*v1 + k2*v2
  // wsum          ∑ k*v
  // scale         k*v
  // (In)equality Propagators
  // only first expression can be array
  ;

  _proto.distinct = function distinct(A) {
    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += 'distinct(' + A.map(exporter_encodeVarName) + ')\n';
      }
    }

    config_addConstraint(this.config, 'distinct', A);
  };

  _proto.eq = function eq(e1, e2) {
    if (Array.isArray(e1)) {
      for (var i = 0, n = e1.length; i < n; ++i) {
        this.eq(e1[i], e2);
      }
    } else if (Array.isArray(e2)) {
      for (var _i = 0, _n = e2.length; _i < _n; ++_i) {
        this.eq(e1, e2[_i]);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (this.GENERATE_BARE_DSL) {
          this.exported += exporter_encodeVarName(e1) + ' == ' + exporter_encodeVarName(e2) + '\n';
        }
      }

      config_addConstraint(this.config, 'eq', [e1, e2]);
    }
  };

  _proto.neq = function neq(e1, e2) {
    if (Array.isArray(e1)) {
      for (var i = 0, n = e1.length; i < n; ++i) {
        this.neq(e1[i], e2);
      }
    } else if (Array.isArray(e2)) {
      for (var _i2 = 0, _n2 = e2.length; _i2 < _n2; ++_i2) {
        this.neq(e1, e2[_i2]);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (this.GENERATE_BARE_DSL) {
          this.exported += exporter_encodeVarName(e1) + ' != ' + exporter_encodeVarName(e2) + '\n';
        }
      }

      config_addConstraint(this.config, 'neq', [e1, e2]);
    }
  };

  _proto.gte = function gte(A, B) {
    ASSERT(!Array.isArray(A), 'NOT_ACCEPTING_ARRAYS');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(A) + ' >= ' + exporter_encodeVarName(B) + '\n';
      }
    }

    config_addConstraint(this.config, 'gte', [A, B]);
  };

  _proto.lte = function lte(A, B) {
    ASSERT(!Array.isArray(A), 'NOT_ACCEPTING_ARRAYS');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(A) + ' <= ' + exporter_encodeVarName(B) + '\n';
      }
    }

    config_addConstraint(this.config, 'lte', [A, B]);
  };

  _proto.gt = function gt(A, B) {
    ASSERT(!Array.isArray(A), 'NOT_ACCEPTING_ARRAYS');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(A) + ' > ' + exporter_encodeVarName(B) + '\n';
      }
    }

    config_addConstraint(this.config, 'gt', [A, B]);
  };

  _proto.lt = function lt(A, B) {
    ASSERT(!Array.isArray(A), 'NOT_ACCEPTING_ARRAYS');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(A) + ' < ' + exporter_encodeVarName(B) + '\n';
      }
    }

    config_addConstraint(this.config, 'lt', [A, B]);
  };

  _proto.isNeq = function isNeq(A, B, C) {
    var R = config_addConstraint(this.config, 'reifier', [A, B, C], 'neq');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' !=? ' + exporter_encodeVarName(B) + '\n';
      }
    }

    return R;
  };

  _proto.isEq = function isEq(A, B, C) {
    var R = config_addConstraint(this.config, 'reifier', [A, B, C], 'eq');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' ==? ' + exporter_encodeVarName(B) + '\n';
      }
    }

    return R;
  };

  _proto.isGte = function isGte(A, B, C) {
    var R = config_addConstraint(this.config, 'reifier', [A, B, C], 'gte');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' >=? ' + exporter_encodeVarName(B) + '\n';
      }
    }

    return R;
  };

  _proto.isLte = function isLte(A, B, C) {
    var R = config_addConstraint(this.config, 'reifier', [A, B, C], 'lte');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' <=? ' + exporter_encodeVarName(B) + '\n';
      }
    }

    return R;
  };

  _proto.isGt = function isGt(A, B, C) {
    var R = config_addConstraint(this.config, 'reifier', [A, B, C], 'gt');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' >? ' + exporter_encodeVarName(B) + '\n';
      }
    }

    return R;
  };

  _proto.isLt = function isLt(A, B, C) {
    var R = config_addConstraint(this.config, 'reifier', [A, B, C], 'lt');

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported += exporter_encodeVarName(R) + ' = ' + exporter_encodeVarName(A) + ' <? ' + exporter_encodeVarName(B) + '\n';
      }
    }

    return R;
  } // Various rest

  /**
   * Solve this solver. It should be setup with all the constraints.
   *
   * @param {Object} options
   * @property {number} [options.max=1000]
   * @property {number} [options.log=this.logging] Logging level; one of: 0, 1 or 2 (see LOG_* constants)
   * @property {string|Array.<string|Bvar>} options.vars Target branch vars or var names to force solve. Defaults to all.
   * @property {string|Object} [options.distribute='naive'] Maps to FD.distribution.value, see config_setOptions
   * @property {boolean} [_debug] A more human readable print of the configuration for this solver
   * @property {boolean} [_debugConfig] Log out solver.config after prepare() but before run()
   * @property {boolean} [_debugSpace] Log out solver._space after prepare() but before run(). Only works in dev code (stripped from dist)
   * @property {boolean} [_debugSolver] Call solver._debugSolver() after prepare() but before run()
   * @property {boolean} [_tostring] Serialize the config into a DSL
   * @property {boolean} [_nosolve] Dont actually solve. Used for debugging when printing something but not interested in actually running.
   * @property {number} [_debugDelay=0] When debugging, how many propagate steps should the debugging wait? (0 is only preprocessing)
   * @returns {Object[]}
   */
  ;

  _proto.solve = function solve(options) {
    var _this = this;

    if (options === void 0) {
      options = {};
    }

    if (options.log) this.logging = options.log;
    var log = this.logging;
    var _options = options,
        _options$max = _options.max,
        max = _options$max === void 0 ? 1000 : _options$max;

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        getTerm().log('## bare export:\n' + this.exported + '## end of exported\n');
      }
    }

    this._prepare(options, log);

    var dbgCallback;

    if (options._tostring || options._debug || options._debugConfig || options._debugSpace || options._debugSolver) {
      dbgCallback = function dbgCallback(epoch) {
        if ((options._debugDelay | 0) >= epoch) {
          if (options._tostring) getTerm().log(exporter(_this.config));
          if (options._debug) _this._debugLegible();
          if (options._debugConfig) _this._debugConfig();

          if (process.env.NODE_ENV !== 'production') {
            if (options._debugSpace) getTerm().log('## _debugSpace:\n', INSPECT(_this._space));
          }

          if (options._debugSolver) _this._debugSolver();
          return true;
        }

        return false;
      };

      if (dbgCallback(0)) dbgCallback = undefined;
    }

    if (options._nosolve) return;

    this._run(max, log, dbgCallback);

    return this.solutions;
  }
  /**
   * Prepare internal configuration before actually solving
   * Collects one-time config data and sets up defaults
   *
   * @param {Object} [options={}] See @solve
   * @param {number} log One of the LOG_* constants
   */
  ;

  _proto._prepare = function _prepare(options, log) {
    if (options === void 0) {
      options = {};
    }

    ASSERT(log === undefined || log >= LOG_MIN && log <= LOG_MAX, 'log level should be a valid value or be undefined (in tests)');

    if (log >= LOG_STATS) {
      getTerm().log('      - FD Preparing...');
      getTerm().time('      - FD Prepare Time');
    }

    this._prepareConfig(options, log); // Create the root node of the search tree (each node is a Space)


    var rootSpace = space_createFromConfig(this.config);

    if (process.env.NODE_ENV !== 'production') {
      this._space = rootSpace; // Only exposed for easy access in tests, and so only available after .prepare()
    }

    this.state.space = rootSpace;
    this.state.more = true;
    this.state.stack = [];
    this._prepared = true;
    if (log >= LOG_STATS) getTerm().timeEnd('      - FD Prepare Time');
  }
  /**
   * Prepare the config side of things for a solve.
   * No space is created in this function (that's the point).
   *
   * @param {Object} options See _prepare
   * @param {number} log
   */
  ;

  _proto._prepareConfig = function _prepareConfig(options, log) {
    ASSERT(log === undefined || log >= LOG_MIN && log <= LOG_MAX, 'log level should be a valid value or be undefined (in tests)');
    var config = this.config;
    ASSERT_VARDOMS_SLOW(config.initialDomains, domain__debug);

    if (options.vars && options.vars !== 'all') {
      config_setOption(config, 'targeted_var_names', options.vars);
    }

    if (options.beforeSpace) config_setOption(config, 'beforeSpace', options.beforeSpace);
    if (options.afterSpace) config_setOption(config, 'afterSpace', options.afterSpace);
    config_init(config);
  }
  /**
   * Run the solver. You should call @_prepare before calling this function.
   *
   * @param {number} max Hard stop the solver when this many solutions have been found
   * @param {number} log One of the LOG_* constants
   * @param {Function} [dbgCallback] Call after each epoch until it returns false, then stop calling it.
   */
  ;

  _proto._run = function _run(max, log, dbgCallback) {
    ASSERT(typeof max === 'number', 'max should be a number', max);
    ASSERT(log >= LOG_MIN && log <= LOG_MAX, 'log level should be a valid value');
    ASSERT(this._prepared, 'must run #prepare before #run');
    this._prepared = false;
    var state = this.state;
    ASSERT(state);
    var term;

    if (log >= LOG_STATS) {
      term = getTerm();
      term.log("      - FD Var Count: " + this.config.allVarNames.length);
      term.log("      - FD Targeted: " + (this.config.targetedVars === 'all' ? 'all' : this.config.targetedVars.length));
      term.log("      - FD Constraint Count: " + this.config.allConstraints.length);
      term.log("      - FD Propagator Count: " + this.config._propagators.length);
      term.log('      - FD Solving...');
      term.time('      - FD Solving Time');
    }

    var alreadyRejected = false;
    var vardoms = state.space.vardoms;

    for (var i = 0, n = vardoms.length; i < n; ++i) {
      if (domain_isEmpty(vardoms[i])) {
        alreadyRejected = true;

        if (log >= LOG_STATS) {
          term.log('      - FD: rejected without propagation (' + this.config.allVarNames[i] + ' is empty)');
        }

        break;
      }
    }

    var solvedSpaces;

    if (alreadyRejected) {
      if (log >= LOG_STATS) {
        term.log('      - FD Input Problem Rejected Immediately');
      }

      solvedSpaces = [];
    } else {
      solvedSpaces = solver_runLoop(state, this.config, max, dbgCallback);
    }

    if (log >= LOG_STATS) {
      term.timeEnd('      - FD Solving Time');

      if (process.env.NODE_ENV !== 'production') {
        term.log("      - FD debug stats: called propagate(): " + (this.config._propagates > 0 ? this.config._propagates + 'x' : 'never! Finished by only using precomputations.'));
      }

      term.log("      - FD Solutions: " + solvedSpaces.length);
    }

    solver_getSolutions(solvedSpaces, this.config, this.solutions, log);
  };

  _proto.hasVar = function hasVar(varName) {
    return trie_get(this.config._varNamesTrie, varName) >= 0;
  }
  /**
   * Sets the value distribution options for a var after declaring it.
   *
   * @param {string} varName
   * @param {Object} options
   */
  ;

  _proto.setValueDistributionFor = function setValueDistributionFor(varName, options) {
    ASSERT(typeof varName === 'string', 'var name should be a string', varName);
    ASSERT(typeof options === 'object', 'value strat options should be an object');
    config_setOption(this.config, 'varValueStrat', options, varName);

    if (process.env.NODE_ENV !== 'production') {
      if (this.GENERATE_BARE_DSL) {
        this.exported = this.exported.replace(new RegExp('^(: ' + exporter_encodeVarName(varName) + ' =.*)', 'm'), '$1 # markov (set below): ' + JSON.stringify(options)) + '@custom set-valdist ' + exporter_encodeVarName(varName) + ' ' + JSON.stringify(options) + '\n';
      }
    }
  }
  /**
   * @returns {FDO}
   */
  ;

  _proto.branch_from_current_solution = function branch_from_current_solution() {
    // Get the _solved_ space, convert to config,
    // use new config as base for new solver
    var solvedConfig = space_toConfig(this.state.space, this.config);
    return new FDO({
      config: solvedConfig
    });
  };

  _proto._debugLegible = function _debugLegible() {
    var clone = JSON.parse(JSON.stringify(this.config)); // Prefer this over config_clone, just in case.

    var names = clone.allVarNames;
    var targeted = clone.targetedVars;
    var constraints = clone.allConstraints;
    var domains = clone.initialDomains;
    var propagators = clone._propagators;

    for (var key in clone) {
      // Underscored prefixed objects are generally auto-generated structs
      // we don't want to debug a 5mb buffer, one byte per line.
      if (key[0] === '_' && typeof clone[key] === 'object') {
        clone[key] = '<removed>';
      }
    }

    clone.allVarNames = '<removed>';
    clone.allConstraints = '<removed>';
    clone.initialDomains = '<removed>';
    clone.varDistOptions = '<removed>';
    if (targeted !== 'all') clone.targetedVars = '<removed>';
    var term = getTerm();
    term.log('\n## _debug:\n');
    term.log('- config:');
    term.log(INSPECT(clone));
    term.log('- vars (' + names.length + '):');
    term.log(names.map(function (name, index) {
      return index + ": " + domain__debug(domains[index]) + " " + (name === String(index) ? '' : ' // ' + name);
    }).join('\n'));

    if (targeted !== 'all') {
      term.log('- targeted vars (' + targeted.length + '): ' + targeted.join(', '));
    }

    term.log('- constraints (' + constraints.length + ' -> ' + propagators.length + '):');
    term.log(constraints.map(function (c, index) {
      if (c.param === undefined) {
        return index + ": " + c.name + "(" + c.varIndexes + ")      --->  " + c.varIndexes.map(function (index) {
          return domain__debug(domains[index]);
        }).join(',  ');
      }

      if (c.name === 'reifier') {
        return index + ": " + c.name + "[" + c.param + "](" + c.varIndexes + ")      --->  " + domain__debug(domains[c.varIndexes[0]]) + " " + c.param + " " + domain__debug(domains[c.varIndexes[1]]) + " = " + domain__debug(domains[c.varIndexes[2]]);
      }

      return index + ": " + c.name + "(" + c.varIndexes + ") = " + c.param + "      --->  " + c.varIndexes.map(function (index) {
        return domain__debug(domains[index]);
      }).join(',  ') + " -> " + domain__debug(domains[c.param]);
    }).join('\n'));
    term.log('##/\n');
  };

  _proto._debugSolver = function _debugSolver() {
    var term = getTerm();
    term.log('## _debugSolver:\n');
    var config = this.config; // Term.log('# Config:');
    // term.log(INSPECT(_clone(config)));

    var names = config.allVarNames;
    term.log('# Variables (' + names.length + 'x):');
    term.log('  index name domain toArr');

    for (var varIndex = 0; varIndex < names.length; ++varIndex) {
      term.log('  ', varIndex, ':', names[varIndex], ':', domain__debug(config.initialDomains[varIndex]));
    }

    var constraints = config.allConstraints;
    term.log('# Constraints (' + constraints.length + 'x):');
    term.log('  index name vars param');

    for (var i = 0; i < constraints.length; ++i) {
      term.log('  ', i, ':', constraints[i].name, ':', constraints[i].varIndexes.join(','), ':', constraints[i].param);
    }

    var propagators = config._propagators;
    term.log('# Propagators (' + propagators.length + 'x):');
    term.log('  index name vars args');

    for (var _i3 = 0; _i3 < propagators.length; ++_i3) {
      term.log('  ', _i3, ':', propagators[_i3].name + (propagators[_i3].name === 'reified' ? '(' + propagators[_i3].arg3 + ')' : ''), ':', propagators[_i3].index1, propagators[_i3].index2, propagators[_i3].index3, '->', domain__debug(config.initialDomains[propagators[_i3].index1]), domain__debug(config.initialDomains[propagators[_i3].index2]), domain__debug(config.initialDomains[propagators[_i3].index3]));
    }

    term.log('##');
  };

  _proto._debugConfig = function _debugConfig() {
    var config = _clone(this.config);

    config.initialDomains = config.initialDomains.map(domain__debug);
    getTerm().log('## _debugConfig:\n', INSPECT(config));
  }
  /**
   * Import from a dsl into this solver
   *
   * @param {string} s
   * @param {boolean} [_debug] Log out entire input with error token on fail?
   * @returns {FDO} this
   */
  ;

  _proto.imp = function imp(s, _debug) {
    // Term.log('##x## FDO.imp(...)');
    // term.log(s);
    // term.log('##y##');
    if (this.logging) {
      getTerm().log('      - FD Importing DSL; ' + s.length + ' bytes');
      getTerm().time('      - FD Import Time:');
    }

    var solver = importer(s, this, _debug);

    if (this.logging) {
      getTerm().timeEnd('      - FD Import Time:');
    }

    return solver;
  }
  /**
   * Export this config to a dsl. Optionally pass on a
   * space whose vardoms state to use for initialization.
   *
   * @param {$space} [space]
   * @param {boolean} [usePropagators]
   * @param {boolean} [minimal]
   * @param {boolean} [withDomainComments]
   * @returns {string}
   */
  ;

  _proto.exp = function exp(space, usePropagators, minimal, withDomainComments) {
    return exporter(this.config, space.vardoms, usePropagators, minimal, withDomainComments);
  }
  /**
   * Exposes internal method domain_fromList for subclass
   * (Used by PathSolver in a private project)
   * It will always create an array, never a "small domain"
   * (number that is bit-wise flags) because that should be
   * kept an internal fdq artifact.
   *
   * @param {number[]} list
   * @returns {$arrdom[]}
   */
  ;

  FDO.domainFromList = function domainFromList(list) {
    return domain_fromListToArrdom(list);
  }
  /**
   * Expose the internal terminal (console)
   *
   * @returns {Object} Unless overridden, this is the console global. Otherwise an object with al least the same methods as console
   */
  ;

  FDO.getTerm = function getTerm$1() {
    return getTerm();
  }
  /**
   * Set the terminal object (console by default)
   *
   * @param {Object} term An object that overrides one or more methods on `console`
   */
  ;

  FDO.setTerm = function setTerm$1(term) {
    return setTerm(term);
  };

  FDO.dsl = function dsl() {
    THROW('FDO.dsl: use FDO.solve()');
  };

  FDO.imp = function imp() {
    THROW('FDO.imp: use FDO.solve()');
  }
  /**
   * Shorthand for processing a dsl and returning the first solution, or a string describing reason for failure.
   *
   * @param {string} dsl
   * @param {Object} options Passed on to the FDO constructor
   * @param {boolean} [_debug] Log out entire input with error token on fail?
   * @returns {string|Object|Object[]|FDO} Will return all results if max explicitly not 1, returns FDO if options ask
   */
  ;

  FDO.solve = function solve(dsl, options, _debug) {
    if (options === void 0) {
      options = {};
    }

    if (!options.max) options.max = 1;
    var fdo = new FDO(options).imp(dsl, _debug);
    var s = fdo.solve(options);
    if (options.returnFdo) return fdo;
    if (fdo.config.aborted) return 'aborted';
    if (s.length === 0) return 'rejected';
    if (options.max !== 1) return s;
    return s[0];
  };

  return FDO;
}();
/**
 * Deep clone given object for debugging purposes (only)
 * Revise if used for anything concrete
 *
 * @param {*} value
 * @returns {*}
 */


function _clone(value) {
  switch (typeof value) {
    case 'object':
      {
        if (!value) return null;

        if (Array.isArray(value)) {
          return value.map(function (v) {
            return _clone(v);
          });
        }

        var obj = {};

        for (var _i4 = 0, _Object$entries = Object.entries(value); _i4 < _Object$entries.length; _i4++) {
          var _Object$entries$_i = _Object$entries[_i4],
              key = _Object$entries$_i[0],
              val = _Object$entries$_i[1];
          obj[key] = _clone(val);
        }

        return obj;
      }

    case 'function':
      {
        var fobj = {
          __THIS_IS_A_FUNCTION: 1,
          __source: value.toString()
        };

        for (var _i5 = 0, _Object$entries2 = Object.entries(value); _i5 < _Object$entries2.length; _i5++) {
          var _Object$entries2$_i = _Object$entries2[_i5],
              key = _Object$entries2$_i[0],
              val = _Object$entries2$_i[1];
          fobj[key] = _clone(val);
        }

        return fobj;
      }

    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return value;

    default:
      THROW('config value what?', value);
  }
}
/**
 * This is the core search loop. Supports multiple solves although you
 * probably only need one solution. Won't return more solutions than max.
 *
 * @param {Object} state
 * @param {$config} config
 * @param {number} max Stop after finding this many solutions
 * @param {Function} [dbgCallback] Call after each epoch until it returns false, then stop calling it.
 * @returns {$space[]} All solved spaces that were found (until max or end was reached)
 */


function solver_runLoop(state, config, max, dbgCallback) {
  var list = [];

  while (state.more && list.length < max) {
    search_depthFirst(state, config, dbgCallback);

    if (state.status !== 'end') {
      list.push(state.space);
      ASSERT_LOG(LOG_FLAG_SOLUTIONS, function (log) {
        return log(' ## Found solution:', space_solution(state.space, config));
      });
    }
  }

  return list;
}

function solver_getSolutions(solvedSpaces, config, solutions, log) {
  ASSERT(Array.isArray(solutions), 'solutions target object should be an array');

  if (log >= LOG_STATS) {
    getTerm().time('      - FD Solution Construction Time');
  }

  for (var i = 0; i < solvedSpaces.length; ++i) {
    var solution = space_solution(solvedSpaces[i], config);
    solutions.push(solution);

    if (log >= LOG_SOLVES) {
      getTerm().log('      - FD solution() ::::::::::::::::::::::::::::');
      getTerm().log(JSON.stringify(solution));
      getTerm().log('                      ::::::::::::::::::::::::::::');
    }
  }

  if (log >= LOG_STATS) {
    getTerm().timeEnd('      - FD Solution Construction Time');
  }
}

var ml_opcodeCounter=0;// Note: all ops accept vars and literals
// - a var is signified by a V
// - an 8bit literal signified by 8
// - a 16bit literal signified by F
var ML_START=ml_opcodeCounter++;var ML_ALL=ml_opcodeCounter++;// &     all()
var ML_DIFF=ml_opcodeCounter++;// !=    diff()
var ML_IMP=ml_opcodeCounter++;// ->                (logical implication)
var ML_LT=ml_opcodeCounter++;// <
var ML_LTE=ml_opcodeCounter++;// <=
var ML_NALL=ml_opcodeCounter++;// !&    nall()
var ML_NIMP=ml_opcodeCounter++;// !(->)
var ML_NONE=ml_opcodeCounter++;// ==0   none()
var ML_SAME=ml_opcodeCounter++;// ==    same()
var ML_SOME=ml_opcodeCounter++;// |     some()
var ML_XNOR=ml_opcodeCounter++;// !^    xnor()
var ML_XOR=ml_opcodeCounter++;// ^     xor()
var ML_ISALL=ml_opcodeCounter++;var ML_ISDIFF=ml_opcodeCounter++;var ML_ISLT=ml_opcodeCounter++;var ML_ISLTE=ml_opcodeCounter++;var ML_ISNALL=ml_opcodeCounter++;var ML_ISNONE=ml_opcodeCounter++;var ML_ISSAME=ml_opcodeCounter++;var ML_ISSOME=ml_opcodeCounter++;var ML_SUM=ml_opcodeCounter++;var ML_PRODUCT=ml_opcodeCounter++;var ML_MINUS=ml_opcodeCounter++;var ML_DIV=ml_opcodeCounter++;var ML_NOLEAF=ml_opcodeCounter++;var ML_NOBOOL=ml_opcodeCounter++;var ML_JMP=ml_opcodeCounter++;var ML_JMP32=ml_opcodeCounter++;var ML_NOOP=ml_opcodeCounter++;var ML_NOOP2=ml_opcodeCounter++;var ML_NOOP3=ml_opcodeCounter++;var ML_NOOP4=ml_opcodeCounter++;var ML_STOP=0xff;ASSERT(ml_opcodeCounter<0xff,'All opcodes are 8bit');ASSERT(ML_START===0);ASSERT(ML_STOP===0xff);var SIZEOF_V=1+2;// 16bit
var SIZEOF_W=1+4;// 32bit
var SIZEOF_VVV=1+2+2+2;var SIZEOF_C=1+2;// + 2*count
var SIZEOF_C_2=SIZEOF_C+2*2;// Fixed 2 var without result
var SIZEOF_CR_2=SIZEOF_C+2*2+2;// Fixed 2 var with result
var OFFSET_C_A=SIZEOF_C;var OFFSET_C_B=SIZEOF_C+2;var OFFSET_C_C=SIZEOF_C+4;var OFFSET_C_R=OFFSET_C_C;function ml_sizeof(ml,offset,op){switch(op){case ML_IMP:case ML_LT:case ML_LTE:case ML_NIMP:case ML_XOR:ASSERT(ml_dec16(ml,offset+1)===2);return SIZEOF_C_2;// Always
case ML_START:return 1;case ML_ISLT:case ML_ISLTE:case ML_MINUS:case ML_DIV:return SIZEOF_VVV;case ML_ALL:case ML_DIFF:case ML_NALL:case ML_NONE:case ML_SAME:case ML_SOME:case ML_XNOR:if(ml&&offset>=0)return SIZEOF_C+_dec16(ml,offset+1)*2;return -1;case ML_ISALL:case ML_ISDIFF:case ML_ISNALL:case ML_ISNONE:case ML_ISSAME:case ML_ISSOME:if(ml&&offset>=0)return SIZEOF_C+_dec16(ml,offset+1)*2+2;ASSERT(false,'dont allow this');return -1;case ML_SUM:case ML_PRODUCT:if(ml&&offset>=0)return SIZEOF_C+_dec16(ml,offset+1)*2+2;ASSERT(false,'dont allow this');return -1;case ML_NOBOOL:case ML_NOLEAF:return SIZEOF_V;case ML_JMP:return SIZEOF_V+_dec16(ml,offset+1);case ML_JMP32:return SIZEOF_W+_dec32(ml,offset+1);case ML_NOOP:return 1;case ML_NOOP2:return 2;case ML_NOOP3:return 3;case ML_NOOP4:return 4;case ML_STOP:return 1;default:getTerm().log('(ml) unknown op',op,' at',offset);TRACE('(ml_sizeof) unknown op: '+ml[offset],' at',offset);THROW('(ml_sizeof) unknown op: '+ml[offset],' at',offset);}}function _dec8(ml,pc){return ml[pc];}function ml_dec8(ml,pc){ASSERT(ml instanceof Uint8Array,'ml should be Uint8Array');ASSERT(typeof pc==='number'&&pc>=0&&pc<ml.length,'Invalid or OOB',pc,'>=',ml.length);var num=_dec8(ml,pc);TRACE_SILENT(' . dec8pc decoding',num,'from',pc);return num;}function _dec16(ml,pc){return ml[pc++]<<8|ml[pc];}function ml_dec16(ml,pc){ASSERT(ml instanceof Uint8Array,'ml should be Uint8Array');ASSERT(typeof pc==='number'&&pc>=0&&pc<ml.length,'Invalid or OOB',pc,'>=',ml.length);var n=_dec16(ml,pc);TRACE_SILENT(' . dec16pc decoding',ml[pc]<<8,'from',pc,'and',ml[pc+1],'from',pc+1,'-->',n);return n;}function _dec32(ml,pc){return ml[pc++]<<24|ml[pc++]<<16|ml[pc++]<<8|ml[pc];}function ml_dec32(ml,pc){ASSERT(ml instanceof Uint8Array,'ml should be Uint8Array');ASSERT(typeof pc==='number'&&pc>=0&&pc<ml.length,'Invalid or OOB',pc,'>=',ml.length);var n=_dec32(ml,pc);TRACE_SILENT(' . dec32pc decoding',ml[pc],ml[pc+1],ml[pc+2],ml[pc+3],'( x'+ml[pc].toString(16)+ml[pc+1].toString(16)+ml[pc+2].toString(16)+ml[pc+3].toString(16),') from',pc,'-->',n);return n;}function ml_enc8(ml,pc,num){TRACE_SILENT(' . enc8('+pc+', '+num+'/x'+(num&&num.toString(16))+') at',pc,' ');ASSERT(ml instanceof Uint8Array,'ml should be Uint8Array');ASSERT(typeof pc==='number'&&pc>=0&&pc<ml.length,'Invalid or OOB',pc,'>=',ml.length);ASSERT(typeof num==='number','Encoding numbers',num);ASSERT(num>=0&&num<=0xff,'Only encode 8bit values',num,'0x'+num.toString(16));ASSERT(num>=0,'only expecting non-negative nums',num);ml[pc]=num;}function ml_enc16(ml,pc,num){TRACE_SILENT(' - enc16('+pc+', '+num+'/x'+num.toString(16)+')',num>>8&0xff,'at',pc,'and',num&0xff,'at',pc+1);ASSERT(ml instanceof Uint8Array,'ml should be Uint8Array');ASSERT(typeof pc==='number'&&pc>=0&&pc<ml.length,'Invalid or OOB',pc,'>=',ml.length);ASSERT(typeof num==='number','Encoding numbers');ASSERT(num<=0xffff,'implement 32bit index support if this breaks',num);ASSERT(num>=0,'only expecting non-negative nums',num);ml[pc++]=num>>8&0xff;ml[pc]=num&0xff;}function ml_enc32(ml,pc,num){TRACE_SILENT(' - enc32('+pc+', '+num+'/x'+num.toString(16)+')',ml[pc],ml[pc+1],ml[pc+2],ml[pc+3],'( x'+ml[pc].toString(16)+ml[pc+1].toString(16)+ml[pc+2].toString(16)+ml[pc+3].toString(16),') at',pc+1);ASSERT(ml instanceof Uint8Array,'ml should be Uint8Array');ASSERT(typeof pc==='number'&&pc>=0&&pc<ml.length,'Invalid or OOB',pc,'>=',ml.length);ASSERT(typeof num==='number','Encoding numbers');ASSERT(num<=0xffffffff,'implement 64bit index support if this breaks',num);ASSERT(num>=0,'only expecting non-negative nums',num);ml[pc++]=num>>24&0xff;ml[pc++]=num>>16&0xff;ml[pc++]=num>>8&0xff;ml[pc]=num&0xff;}function ml_eliminate(ml,offset,sizeof){ASSERT(ml instanceof Uint8Array,'ml should be Uint8Array',ml);// ASSERT(ml_validateSkeleton(ml, 'ml_eliminate; before'));
TRACE(' - ml_eliminate: eliminating constraint at',offset,'with size =',sizeof,', ml=',ml.length<50?ml.join(' '):'<BIG>');ASSERT(typeof offset==='number'&&offset>=0&&offset<ml.length,'valid offset required');ASSERT(typeof sizeof==='number'&&sizeof>=0,'valid sizeof required');ASSERT(sizeof===ml_getOpSizeSlow(ml,offset),'sizeof should match size of op at offset',sizeof,ml_getOpSizeSlow(ml,offset),ml__debug(ml,offset,1,undefined,true,true));// Maybe we should move to do this permanently "slow"
ml_compileJumpSafe(ml,offset,sizeof);TRACE('    - after ml_eliminate:',ml.length<50?ml.join(' '):'<trunced>');ASSERT(ml_validateSkeleton(ml,'ml_eliminate; after'));}function ml_compileJumpAndConsolidate(ml,offset,len){TRACE('  - ml_jump: offset = ',offset,'len = ',len);switch(ml[offset+len]){case ML_NOOP:TRACE('  - jmp target is another jmp (noop), merging them');return ml_compileJumpAndConsolidate(ml,offset,len+1);case ML_NOOP2:TRACE('  - jmp target is another jmp (noop2), merging them');return ml_compileJumpAndConsolidate(ml,offset,len+2);case ML_NOOP3:TRACE('  - jmp target is another jmp (noop3), merging them');return ml_compileJumpAndConsolidate(ml,offset,len+3);case ML_NOOP4:TRACE('  - jmp target is another jmp (noop4), merging them');return ml_compileJumpAndConsolidate(ml,offset,len+4);case ML_JMP:var jmplen=ml_dec16(ml,offset+len+1);ASSERT(jmplen>0,'dont think zero is a valid jmp len');ASSERT(jmplen<=0xffff,'oob');TRACE('  - jmp target is another jmp (len =',SIZEOF_V+jmplen,'), merging them');return ml_compileJumpAndConsolidate(ml,offset,len+SIZEOF_V+jmplen);case ML_JMP32:var jmplen32=ml_dec32(ml,offset+len+1);ASSERT(jmplen32>0,'dont think zero is a valid jmp len');ASSERT(jmplen32<=0xffffffff,'oob');TRACE('  - jmp target is a jmp32 (len =',SIZEOF_W+jmplen32,'), merging them');return ml_compileJumpAndConsolidate(ml,offset,len+SIZEOF_W+jmplen32);}ml_compileJumpSafe(ml,offset,len);}function ml_compileJumpSafe(ml,offset,len){switch(len){case 0:return THROW('this is a bug');case 1:TRACE('  - compiling a NOOP');return ml_enc8(ml,offset,ML_NOOP);case 2:TRACE('  - compiling a NOOP2');return ml_enc8(ml,offset,ML_NOOP2);case 3:TRACE('  - compiling a NOOP3');return ml_enc8(ml,offset,ML_NOOP3);case 4:TRACE('  - compiling a NOOP4');return ml_enc8(ml,offset,ML_NOOP4);default:if(len<0xffff){TRACE('  - compiling a ML_JMP of',len,'(compiles',len-SIZEOF_V,'because SIZEOF_V=',SIZEOF_V,')');ml_enc8(ml,offset,ML_JMP);ml_enc16(ml,offset+1,len-SIZEOF_V);}else{TRACE('  - compiling a ML_JMP32 of',len,'(compiles',len-SIZEOF_W,'because SIZEOF_W=',SIZEOF_W,')');ml_enc8(ml,offset,ML_JMP32);ml_enc32(ml,offset+1,len-SIZEOF_W);}}// ASSERT(ml_validateSkeleton(ml, 'ml_jump; after'));
}function ml_countConstraints(ml){var pc=0;var constraints=0;while(pc<ml.length){var pcStart=pc;var op=ml[pc];switch(op){case ML_START:if(pc!==0)return THROW('mlConstraints: zero op @',pcStart,'Uint8Array('+ml.toString('hex').replace(/(..)/g,'$1 ')+')');++pc;break;case ML_STOP:return constraints;case ML_NOOP:++pc;break;case ML_NOOP2:pc+=2;break;case ML_NOOP3:pc+=3;break;case ML_NOOP4:pc+=4;break;case ML_JMP:pc+=SIZEOF_V+_dec16(ml,pc+1);break;case ML_JMP32:pc+=SIZEOF_W+_dec32(ml,pc+1);break;default:var size=ml_sizeof(ml,pc,op);// Throws if op is unknown
++constraints;pc+=size;}}THROW('ML OOB');}function ml_hasConstraint(ml){// Technically this should be cheap; either the first
// op is a constraint or it's a jump directly to stop.
// (all jumps should be consolidated)
var pc=0;while(pc<ml.length){switch(ml[pc]){case ML_START:if(pc!==0)return ml_throw('oops');++pc;break;case ML_STOP:return false;case ML_NOOP:++pc;break;case ML_NOOP2:pc+=2;break;case ML_NOOP3:pc+=3;break;case ML_NOOP4:pc+=4;break;case ML_JMP:pc+=SIZEOF_V+_dec16(ml,pc+1);break;case ML_JMP32:pc+=SIZEOF_W+_dec32(ml,pc+1);break;default:return true;}}THROW('ML OOB');}function ml_c2c2(ml,offset,argCount,opCode,indexA,indexB){// "count without result" (diff, some, nall, etc) to same count type with 2 args without result
TRACE(' -| ml_c2c2 | from',offset,', argCount=',argCount,'to op',ml__opName(opCode),', args:',indexA,indexB);ASSERT(ml_getOpSizeSlow(ml,offset)>=SIZEOF_C_2,'the c2 should fit the existing space entirely');ASSERT(ml_dec16(ml,offset+1)===argCount,'argcount should match');ASSERT(argCount>1,'this fails with count<2 because theres not enough space');// ASSERT(ml_validateSkeleton(ml, 'ml_c2c2-before'));
ml_enc8(ml,offset,opCode);ml_enc16(ml,offset+1,2);ml_enc16(ml,offset+OFFSET_C_A,indexA);ml_enc16(ml,offset+OFFSET_C_B,indexB);var oldLen=SIZEOF_C+argCount*2;if(SIZEOF_C_2<oldLen)ml_compileJumpSafe(ml,offset+SIZEOF_C_2,oldLen-SIZEOF_C_2);ASSERT(ml_validateSkeleton(ml,'ml_c2c2'));}function ml_cx2cx(ml,offset,argCount,opCode,args){TRACE(' -| ml_cx2cx | from',offset,'was argCount=',argCount,'to op',ml__opName(opCode),'with args',args,', new size should be',SIZEOF_C+args.length*2);ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&offset>0&&offset<ml.length,'valid offset',offset);ASSERT(typeof argCount==='number'&&argCount>0&&argCount<ml.length,'valid argCount',argCount);ASSERT(Array.isArray(args),'args is list of indexes',args);ASSERT(argCount===args.length,'this function excepts to morph one count op into another count op of the same size',argCount,args.length,args);args.sort(function(a,b){return a-b;});// Compile args sorted
var opSize=SIZEOF_C+argCount*2;ASSERT(argCount===args.length===(ml_getOpSizeSlow(ml,offset)===opSize),'if same argcount then same size');ASSERT(ml_getOpSizeSlow(ml,offset)===opSize,'the should fit the existing space entirely');ml_enc8(ml,offset,opCode);ml_enc16(ml,offset+1,argCount);for(var i=0;i<argCount;++i){ml_enc16(ml,offset+SIZEOF_C+i*2,args[i]);}ASSERT(ml_validateSkeleton(ml,'ml_cx2cx'));}function ml_any2c(ml,offset,oldSizeof,opCode,args){TRACE(' -| ml_any2c | from',offset,'was len=',oldSizeof,'to op',ml__opName(opCode),'with args',args,', new size should be',SIZEOF_C+args.length*2);ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&offset>0&&offset<ml.length,'valid offset',offset);ASSERT(typeof oldSizeof==='number'&&offset>0&&offset<ml.length,'valid oldSizeof',oldSizeof);ASSERT(Array.isArray(args),'args is list of indexes',args);var count=args.length;var opSize=SIZEOF_C+count*2;ASSERT(ml_getOpSizeSlow(ml,offset)>=opSize,'the c2 should fit the existing space entirely');ml_enc8(ml,offset,opCode);ml_enc16(ml,offset+1,count);for(var i=0;i<count;++i){ml_enc16(ml,offset+SIZEOF_C+i*2,args[i]);}if(opSize<oldSizeof)ml_compileJumpSafe(ml,offset+opSize,oldSizeof-opSize);ASSERT(ml_validateSkeleton(ml,'ml_any2c'));}function ml_cr2cr2(ml,offset,argCount,opCode,indexA,indexB,indexC){// "count with result and any args to count with result with 2 args"
TRACE(' -| ml_cr2cr2 | from',offset,', argCount=',argCount,'to op',ml__opName(opCode),'with args:',indexA,indexB,indexC);ASSERT(argCount>=2,'if this is called for count ops with 1 or 0 args then we have a problem... a cr['+argCount+'] wont fit that');ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&offset>0&&offset<ml.length,'valid offset',offset);ASSERT(typeof opCode==='number'&&offset>=0,'valid opCode',opCode);ASSERT(typeof indexA==='number'&&indexA>=0,'valid indexA',indexA);ASSERT(typeof indexB==='number'&&indexB>=0,'valid indexB',indexB);ASSERT(typeof indexC==='number'&&indexC>=0,'valid indexC',indexC);ASSERT(ml_getOpSizeSlow(ml,offset)>=SIZEOF_CR_2,'the cr2 should fit the existing space entirely');ml_enc8(ml,offset,opCode);ml_enc16(ml,offset+1,2);// Arg count
ml_enc16(ml,offset+OFFSET_C_A,indexA);ml_enc16(ml,offset+OFFSET_C_B,indexB);ml_enc16(ml,offset+OFFSET_C_C,indexC);var oldLen=SIZEOF_C+argCount*2+2;if(SIZEOF_CR_2<oldLen)ml_compileJumpSafe(ml,offset+SIZEOF_CR_2,oldLen-SIZEOF_CR_2);ASSERT(ml_validateSkeleton(ml,'ml_cr2cr2'));}function ml_cr2c2(ml,offset,argCount,opCode,indexA,indexB){// "count with result"
var oldArgCount=ml_dec16(ml,offset+1);TRACE(' -| ml_cr2c2 | from',offset,', with argCount=',oldArgCount,' and a result var, to a argCount=',argCount,' without result, op',ml__opName(opCode),', args:',indexA,indexB);// Count with result and any args to count with result and (exactly) 2 args
ASSERT(argCount>=1,'if this is called for count ops with 0 args then we have a problem... a c['+argCount+'] wont fit that');ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&offset>0&&offset<ml.length,'valid offset',offset);ASSERT(typeof opCode==='number'&&offset>=0,'valid opCode',opCode);ASSERT(typeof indexA==='number'&&indexA>=0,'valid indexA',indexA);ASSERT(typeof indexB==='number'&&indexB>=0,'valid indexB',indexB);ASSERT(ml_getOpSizeSlow(ml,offset)>=SIZEOF_C_2,'the c2 should fit the existing space entirely');ml_enc8(ml,offset,opCode);ml_enc16(ml,offset+1,2);// Arg count
ml_enc16(ml,offset+OFFSET_C_A,indexA);ml_enc16(ml,offset+OFFSET_C_B,indexB);var oldLen=SIZEOF_C+oldArgCount*2+2;if(SIZEOF_C_2<oldLen)ml_compileJumpSafe(ml,offset+SIZEOF_C_2,oldLen-SIZEOF_C_2);ASSERT(ml_validateSkeleton(ml,'ml_cr2c2'));}function ml_cr2c(ml,offset,oldArgCount,opCode,args){// "count with result to count"
// count with result and any args to count without result and any args
// not "any" because the number of new args can at most be only be one more than the old arg count
TRACE(' -| ml_cr2c | from',offset,', with oldArgCount=',oldArgCount,' and a result var, to a oldArgCount=',oldArgCount,' without result, op',ml__opName(opCode),', args:',args);ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&offset>0&&offset<ml.length,'valid offset',offset);ASSERT(typeof oldArgCount==='number','valid oldArgCount',oldArgCount);ASSERT(typeof opCode==='number'&&offset>=0,'valid opCode',opCode);ASSERT(Array.isArray(args)&&args.every(function(v){return typeof v==='number'&&v>=0;}));ASSERT(oldArgCount+1>=args.length,'cr can holds one index more than c so we can compile one more arg here',oldArgCount,'->',args.length);var newArgCount=args.length;ml_enc8(ml,offset,opCode);ml_enc16(ml,offset+1,newArgCount);for(var i=0;i<newArgCount;++i){ml_enc16(ml,offset+SIZEOF_C+i*2,args[i]);}var oldLen=SIZEOF_C+oldArgCount*2+2;var newLen=SIZEOF_C+newArgCount*2;if(newLen<oldLen)ml_compileJumpSafe(ml,offset+newLen,oldLen-newLen);ASSERT(ml_validateSkeleton(ml,'ml_cr2c'));}function ml_vvv2c2(ml,offset,opCode,indexA,indexB){TRACE(' -| ml_vvv2c2 |','to op',ml__opName(opCode),', args:',indexA,indexB);ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&offset>0&&offset<ml.length,'valid offset',offset);ASSERT(typeof opCode==='number'&&offset>=0,'valid opCode',opCode);ASSERT(typeof indexA==='number'&&indexA>=0,'valid indexA',indexA);ASSERT(typeof indexB==='number'&&indexB>=0,'valid indexB',indexB);ASSERT(ml_getOpSizeSlow(ml,offset)===SIZEOF_C_2,'the existing space should be a vvv and that should be a c2');ASSERT(SIZEOF_VVV===SIZEOF_C_2,'need to check here if this changes');// Note: size(vvv) is same as size(c2)
ml_enc8(ml,offset,opCode);ml_enc16(ml,offset+1,2);ml_enc16(ml,offset+OFFSET_C_A,indexA);ml_enc16(ml,offset+OFFSET_C_B,indexB);ASSERT(ml_validateSkeleton(ml,'ml_vvv2c2'));}function ml_walk(ml,offset,callback){ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&offset>=0&&offset<ml.length,'offset should be valid and not oob');ASSERT(typeof callback==='function','callback should be callable');var len=ml.length;var op=ml[offset];while(offset<len){op=ml[offset];if(process.env.NODE_ENV!=='production'){if(offset!==0&&op===ML_START){ml_throw(ml,offset,'should not see op=0 unless offset=0');}}var sizeof=ml_sizeof(ml,offset,op);ASSERT(sizeof>0,'ops should occupy space');var r=callback(ml,offset,op,sizeof);if(r!==undefined)return r;offset+=sizeof;}}function ml_validateSkeleton(ml,msg){if(process.env.NODE_ENV!=='production'){TRACE_SILENT('--- ml_validateSkeleton',msg);var started=false;var stopped=false;ml_walk(ml,0,function(ml,offset,op){if(op===ML_START&&offset===0)started=true;if(op===ML_START&&offset!==0)ml_throw(ml,offset,'ml_validateSkeleton: Found ML_START at offset');if(op===ML_STOP)stopped=true;else if(stopped)ml_throw(ml,offset,'ml_validateSkeleton: Should stop after encountering a stop but did not');});if(!started||!stopped)ml_throw(ml,ml.length,'ml_validateSkeleton: Missing a ML_START or ML_STOP');TRACE_SILENT('--- PASS ml_validateSkeleton');return true;}}function ml_getRecycleOffsets(ml,fromOffset,slotCount,sizePerSlot){TRACE(' - ml_getRecycleOffsets looking for empty spaces to fill',slotCount,'times',sizePerSlot,'bytes');ASSERT(typeof fromOffset==='number'&&fromOffset>=0,'expecting fromOffset',fromOffset);ASSERT(typeof slotCount==='number'&&slotCount>0,'expecting slotCount',slotCount);ASSERT(typeof sizePerSlot==='number'&&sizePerSlot>0,'expecting sizePerSlot',sizePerSlot);var spaces=[];// Find a jump which covers at least the requiredSize
ml_walk(ml,fromOffset,function(ml,offset,op){TRACE('   - considering op',op,'at',offset);if(op===ML_JMP||op===ML_JMP32){var size=ml_getOpSizeSlow(ml,offset);TRACE('   - found jump of',size,'bytes at',offset+', wanted',sizePerSlot,sizePerSlot<=size?' so is ok!':' so is too small');if(size>=sizePerSlot){spaces.push(offset);// Only add it once!
do{// Remove as many from count as there fit in this empty space
--slotCount;size-=sizePerSlot;}while(slotCount&&size>=sizePerSlot);if(!slotCount)return true;}}});if(slotCount)return false;// Unable to collect enough spaces
return spaces;}function ml_recycles(ml,bins,loops,sizeofOp,callback){var i=0;while(i<loops){var currentRecycleOffset=bins.pop();ASSERT(ml_dec8(ml,currentRecycleOffset)===ML_JMP,'should only get jumps here');// Might trap a case where we clobber
var sizeLeft=ml_getOpSizeSlow(ml,currentRecycleOffset);ASSERT(sizeLeft>=sizeofOp,'this is what should have been asked for when getting recycled spaces');do{var stop=callback(currentRecycleOffset,i,sizeLeft);if(stop)return;++i;sizeLeft-=sizeofOp;currentRecycleOffset+=sizeofOp;}while(sizeLeft>=sizeofOp&&i<loops);if(sizeLeft)ml_compileJumpSafe(ml,currentRecycleOffset,sizeLeft);ASSERT(ml_validateSkeleton(ml),'ml_recycles');// Cant check earlier
}}function ml_getOpSizeSlow(ml,offset){ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&offset>=0&&offset<ml.length,'ml_getOpSizeSlow OOB');// This is much slower compared to using the constants because it has to read from the ML
// this function exists to suplement recycling, where you must read the size of the jump
// otherwise you won't know how much space is left after recycling
var size=ml_sizeof(ml,offset,ml[offset]);TRACE_SILENT(' - ml_getOpSizeSlow',offset,ml.length,'-->',size);return size;}function ml__debug(ml,offset,max,problem,mlAlways,_from_ml_throw){var getDomain=problem&&problem.getDomain;var names=problem&&problem.varNames;function ml_index(offset){var index=_dec16(ml,offset);return '{index='+index+(problem&&index<names.length?',name='+names[index]:'')+(problem?','+domain__debug(getDomain(index)):'')+'}';}function ml_16(offset){return _dec16(ml,offset);}var AB;// Grrr switches and let are annoying
var rv=[];if(max<0)max=ml.length;var pc=offset;var count=0;while(count++<max&&pc<ml.length){var name='';var op=ml[pc];// Should have an option to allow it when explicitly stated like below...
/* eslint-disable no-fallthrough */switch(op){case ML_START:if(pc!==0){TRACE('collected debugs up to error:',rv);if(!_from_ml_throw)ml_throw(ml,pc,'ML_START at non-zero');rv.push('unused_error(0)');return rv.join('\n');}break;case ML_IMP:if(!name)name='->';/* Fall-through */case ML_NIMP:if(!name)name='!->';/* Fall-through */case ML_LT:if(!name)name='<';/* Fall-through */case ML_LTE:if(!name)name='<=';/* Fall-through */case ML_XOR:if(!name)name='^';rv.push(ml_index(pc+OFFSET_C_A)+' '+name+' '+ml_index(pc+OFFSET_C_B));break;case ML_ISLT:if(!name)name='<?';/* Fall-through */case ML_ISLTE:if(!name)name='<=?';AB=ml_index(pc+1)+' '+name+' '+ml_index(pc+3);rv.push(ml_index(pc+5)+' = '+AB);break;case ML_SUM:if(!name)name='sum';/* Fall-through */case ML_PRODUCT:if(!name)name='product';/* Fall-through */case ML_ISALL:if(!name)name='isall';/* Fall-through */case ML_ISDIFF:if(!name)name='isdiff';/* Fall-through */case ML_ISNALL:if(!name)name='isnall';/* Fall-through */case ML_ISSAME:if(!name)name='issame';/* Fall-through */case ML_ISSOME:if(!name)name='issome';/* Fall-through */case ML_ISNONE:if(!name)name='isnone';var vars='';var varcount=ml_16(pc+1);for(var i=0;i<varcount;++i){vars+=ml_index(pc+SIZEOF_C+i*2)+' ';}vars=name+'('+vars+')';vars=ml_index(pc+SIZEOF_C+varcount*2)+' = '+vars;rv.push(vars);break;case ML_ALL:if(!name)name='all';/* Fall-through */case ML_NALL:if(!name)name='nall';/* Fall-through */case ML_SAME:if(!name)name='same';/* Fall-through */case ML_SOME:if(!name)name='some';/* Fall-through */case ML_NONE:if(!name)name='none';/* Fall-through */case ML_XNOR:if(!name)name='xnor';/* Fall-through */case ML_DIFF:if(!name)name='diff';var xvars='';var xvarcount=ml_16(pc+1);for(var _i=0;_i<xvarcount;++_i){xvars+=ml_index(pc+SIZEOF_C+_i*2)+' ';}xvars=name+'('+xvars+')';rv.push(xvars);break;case ML_MINUS:if(!name)name='-';/* Fall-through */case ML_DIV:if(!name)name='/';AB=ml_index(pc+1)+' '+name+' '+ml_index(pc+3);rv.push(ml_index(pc+5)+' = '+AB);break;case ML_JMP:rv.push('jmp('+_dec16(ml,pc+1)+')');break;case ML_JMP32:rv.push('jmp32('+_dec32(ml,pc+1)+')');break;case ML_NOBOOL:rv.push('nobool('+_dec16(ml,pc+1)+')');break;case ML_NOLEAF:rv.push('noleaf('+_dec16(ml,pc+1)+')');break;case ML_NOOP:rv.push('noop(1)');break;case ML_NOOP2:rv.push('noop(2)');break;case ML_NOOP3:rv.push('noop(3)');break;case ML_NOOP4:rv.push('noop(4)');break;case ML_STOP:rv.push('stop()');break;default:THROW('add me [pc='+pc+', op='+ml[pc]+']');}var size=ml_sizeof(ml,pc,op);// GetTerm().log('size was:', size, 'rv=', rv);
if(max!==1||mlAlways)rv.push("\x1B[90m"+size+'b ('+pc+' ~ '+(pc+size)+') -> 0x   '+[].concat(ml.slice(pc,pc+Math.min(size,100))).map(function(c){return (c<16?'0':'')+c.toString(16);}).join(' ')+(size>100?'... (trunced)':'')+"\x1B[0m");pc+=size;}return max===1?rv.join('\n'):' ## ML Debug:\n'+rv.join('\n')+'\n ## End of ML Debug'+(offset||pc<ml.length?offset?' (did not start at begin of ml!)':' (did not list all ops, ml at '+pc+' / '+ml.length+'))...':'')+'\n';}function ml__opName(op){ASSERT(typeof op==='number','op should be a constant number');switch(op){case ML_ALL:return 'ML_ALL';case ML_START:return 'ML_START';case ML_SAME:return 'ML_SAME';case ML_LT:return 'ML_LT';case ML_LTE:return 'ML_LTE';case ML_XOR:return 'ML_XOR';case ML_XNOR:return 'ML_XNOR';case ML_IMP:return 'ML_IMP';case ML_NIMP:return 'ML_NIMP';case ML_ISSAME:return 'ML_ISSAME';case ML_ISDIFF:return 'ML_ISDIFF';case ML_ISLT:return 'ML_ISLT';case ML_ISLTE:return 'ML_ISLTE';case ML_SUM:return 'ML_SUM';case ML_PRODUCT:return 'ML_PRODUCT';case ML_ISALL:return 'ML_ISALL';case ML_ISNALL:return 'ML_ISNALL';case ML_ISSOME:return 'ML_ISSOME';case ML_ISNONE:return 'ML_ISNONE';case ML_NALL:return 'ML_NALL';case ML_SOME:return 'ML_SOME';case ML_NONE:return 'ML_NONE';case ML_DIFF:return 'ML_DISTINCT';case ML_MINUS:return 'ML_MINUS';case ML_DIV:return 'ML_DIV';case ML_NOBOOL:return 'ML_NOBOOL';case ML_NOLEAF:return 'ML_NOLEAF';case ML_JMP:return 'ML_JMP';case ML_JMP32:return 'ML_JMP32';case ML_NOOP:return 'ML_NOOP';case ML_NOOP2:return 'ML_NOOP2';case ML_NOOP3:return 'ML_NOOP3';case ML_NOOP4:return 'ML_NOOP4';case ML_STOP:return 'ML_STOP';default:THROW('[ML] unknown op, fixme ['+op+']');}}function ml_throw(ml,offset,msg){var term=getTerm();term.error('\nThere was an ML related error;',msg);var before=ml.slice(Math.max(0,offset-30),offset);var after=ml.slice(offset,offset+20);term.error('ML at error (offset='+offset+'/'+ml.length+'):',before,after);term.error('->',ml__debug(ml,offset,1,undefined,true,true));THROW(msg);}function ml_getOpList(ml){var pc=0;var rv=[];while(pc<ml.length){var op=ml[pc];switch(op){case ML_START:if(pc!==0){rv.push('error(0)');return rv.join(',');}break;case ML_SAME:rv.push('same');break;case ML_LT:rv.push('lt');break;case ML_LTE:rv.push('lte');break;case ML_ALL:rv.push('all');break;case ML_NONE:rv.push('none');break;case ML_XOR:rv.push('xor');break;case ML_XNOR:rv.push('xnor');break;case ML_IMP:rv.push('imp');break;case ML_NIMP:rv.push('nimp');break;case ML_ISLT:rv.push('islt');break;case ML_ISLTE:rv.push('islte');break;case ML_SUM:rv.push('sum');break;case ML_PRODUCT:rv.push('product');break;case ML_ISALL:rv.push('isall');break;case ML_ISDIFF:rv.push('isdiff');break;case ML_ISNALL:rv.push('isnall');break;case ML_ISNONE:rv.push('isnone');break;case ML_ISSAME:rv.push('issame');break;case ML_ISSOME:rv.push('issome');break;case ML_NALL:rv.push('nall');break;case ML_SOME:rv.push('some');break;case ML_DIFF:rv.push('diff');break;case ML_MINUS:rv.push('minus');break;case ML_DIV:rv.push('div');break;case ML_NOBOOL:case ML_NOLEAF:case ML_JMP:case ML_JMP32:case ML_NOOP:case ML_NOOP2:case ML_NOOP3:case ML_NOOP4:case ML_STOP:break;default:rv.push('??!??');}pc+=ml_sizeof(ml,pc,op);}return rv.sort(function(a,b){return a<b?-1:1;}).join(',');}function ml_heapSort16bitInline(ml,offset,argCount){_ml_heapSort16bitInline(ml,offset,argCount);// TRACE('     - op now:', ml__debug(ml, offset-SIZEOF_C, 1))
TRACE('     ### </ml_heapSort16bitInline> values after:',new Array(argCount).fill(0).map(function(_,i){return _dec16(ml,offset+i*2);}).join(' '),'buf:',ml.slice(offset,offset+argCount*2).join(' '));ASSERT(ml_validateSkeleton(ml,'ml_heapSort16bitInline'));}function _ml_heapSort16bitInline(ml,offset,argCount){ASSERT(ml instanceof Uint8Array,'ml is Uint8Array');ASSERT(typeof offset==='number'&&(offset===0||offset>0&&offset<ml.length),'valid offset',ml.length,offset,argCount);ASSERT(typeof argCount==='number'&&(argCount===0||argCount>0&&offset+argCount*2<=ml.length),'valid count',ml.length,offset,argCount);TRACE('     ### <ml_heapSort16bitInline>, argCount=',argCount,', offset=',offset,', buf=',ml.slice(offset,offset+argCount*2));TRACE('     - values before:',new Array(argCount).fill(0).map(function(_,i){return _dec16(ml,offset+i*2);}).join(' '));if(argCount<=1){TRACE(' - (argCount <= 1 so finished)');return;}ml_heapify(ml,offset,argCount);var end=argCount-1;while(end>0){TRACE('     - swapping first elemement (should be biggest of values left to do) [',_dec16(ml,offset),'] with last [',_dec16(ml,offset+end*2),'] and reducing end [',end,'->',end-1,']');ml_swap16(ml,offset,offset+end*2);TRACE('     - (total) buffer now: Uint8Array(',[].map.call(ml.slice(offset,offset+argCount*2),function(b){return (b<16?'0':'')+b.toString(16);}).join(' '),')');--end;ml_heapRepair(ml,offset,0,end);}}function ml_heapParent(index){return Math.floor((index-1)/2);}function ml_heapLeft(index){return index*2+1;}function ml_heapRight(index){return index*2+2;}function ml_heapify(ml,offset,len){TRACE('     - ml_heapify',ml.slice(offset,offset+len*2),offset,len);var start=ml_heapParent(len-1);while(start>=0){ml_heapRepair(ml,offset,start,len-1);--start;// Wont this cause it to do it redundantly twice?
}TRACE('     - ml_heapify end');}function ml_heapRepair(ml,offset,startIndex,endIndex){TRACE('     - ml_heapRepair',offset,startIndex,endIndex,'Uint8Array(',[].map.call(ml.slice(offset+startIndex*2,offset+startIndex*2+(endIndex-startIndex+1)*2),function(b){return (b<16?'0':'')+b.toString(16);}).join(' '),')');var parentIndex=startIndex;var parentValue=ml_dec16(ml,offset+parentIndex*2);var leftIndex=ml_heapLeft(parentIndex);TRACE('     -- first leftIndex=',leftIndex,'end=',endIndex);while(leftIndex<=endIndex){TRACE('       - sift loop. indexes; parent=',parentIndex,'left=',leftIndex,'right=',ml_heapRight(parentIndex),'values; parent=',_dec16(ml,offset+parentIndex*2)+'/'+parentValue,' left=',_dec16(ml,offset+leftIndex*2),' right=',ml_heapRight(parentIndex)<=endIndex?_dec16(ml,offset+ml_heapRight(parentIndex)*2):'void');var leftValue=ml_dec16(ml,offset+leftIndex*2);var swapIndex=parentIndex;var swapValue=parentValue;TRACE('         - swap<left?',swapValue,leftValue,swapValue<leftValue?'yes':'no');if(swapValue<leftValue){swapIndex=leftIndex;swapValue=leftValue;}var rightIndex=ml_heapRight(parentIndex);TRACE('         - right index',rightIndex,'<=',endIndex,rightIndex<=endIndex?'yes it has a right child':'no right child');if(rightIndex<=endIndex){var rightValue=ml_dec16(ml,offset+rightIndex*2);TRACE('         - swap<right?',swapValue,rightValue);if(swapValue<rightValue){swapIndex=rightIndex;swapValue=rightValue;}}TRACE('           - result; parent=',parentIndex,'swap=',swapIndex,', values; parent=',parentValue,', swap=',swapValue,'->',swapIndex===parentIndex?'finished, parent=swap':'should swap');if(swapIndex===parentIndex){TRACE('     - ml_heapRepair end early:','Uint8Array(',[].map.call(ml.slice(offset+startIndex*2,offset+startIndex*2+(endIndex-startIndex+1)*2),function(b){return (b<16?'0':'')+b.toString(16);}).join(' '),')');return;}// "swap"
ml_enc16(ml,offset+parentIndex*2,swapValue);ml_enc16(ml,offset+swapIndex*2,parentValue);TRACE('             - setting parent to index=',swapIndex,', value=',swapValue);parentIndex=swapIndex;// Note: parentValue remains the same because the swapped child becomes the new parent and it gets the old parent value
leftIndex=ml_heapLeft(parentIndex);TRACE('           - next left:',leftIndex,'end:',endIndex);}TRACE('     - ml_heapRepair end:',ml.slice(offset+startIndex*2,offset+startIndex*2+(endIndex-startIndex+1)*2).join(' '));}function ml_swap16(ml,indexA,indexB){var A=ml_dec16(ml,indexA);var B=ml_dec16(ml,indexB);ml_enc16(ml,indexA,B);ml_enc16(ml,indexB,A);}var bounty_flagCounter=0;var BOUNTY_FLAG_NOT_BOOLY=++bounty_flagCounter;// Booly = when only used in bool ops (like nall) or as the lhs of a reifier
var BOUNTY_FLAG_OTHER=++bounty_flagCounter;var BOUNTY_FLAG_DIFF=1<<++bounty_flagCounter;var BOUNTY_FLAG_IMP_LHS=1<<++bounty_flagCounter;var BOUNTY_FLAG_IMP_RHS=1<<++bounty_flagCounter;var BOUNTY_FLAG_ISALL_ARG=1<<++bounty_flagCounter;var BOUNTY_FLAG_ISALL_RESULT=1<<++bounty_flagCounter;var BOUNTY_FLAG_ISLTE_ARG=1<<++bounty_flagCounter;var BOUNTY_FLAG_ISSAME_ARG=1<<++bounty_flagCounter;var BOUNTY_FLAG_ISSAME_RESULT=1<<++bounty_flagCounter;var BOUNTY_FLAG_ISSOME_RESULT=1<<++bounty_flagCounter;var BOUNTY_FLAG_LTE_LHS=1<<++bounty_flagCounter;var BOUNTY_FLAG_LTE_RHS=1<<++bounty_flagCounter;var BOUNTY_FLAG_NALL=1<<++bounty_flagCounter;var BOUNTY_FLAG_SOME=1<<++bounty_flagCounter;var BOUNTY_FLAG_SUM_RESULT=1<<++bounty_flagCounter;var BOUNTY_FLAG_XOR=1<<++bounty_flagCounter;var BOUNTY_JUST_IGNORE=1<<++bounty_flagCounter;ASSERT(bounty_flagCounter<=32,'can only run with 16 flags, or must increase flag size');var BOUNTY_LINK_COUNT=1;// Should it simply trunc over 255?
var BOUNTY_META_FLAGS=32;// Steps of 8 (bits per byte)
var BOUNTY_MAX_OFFSETS_TO_TRACK=20;// Perf case bounty size when this is: 5->1mb, 20->3mb
var BOUNTY_BYTES_PER_OFFSET=4;var BOUNTY_SIZEOF_HEADER=BOUNTY_LINK_COUNT+BOUNTY_META_FLAGS/2;var BOUNTY_SIZEOF_OFFSETS=BOUNTY_MAX_OFFSETS_TO_TRACK*BOUNTY_BYTES_PER_OFFSET;// Need to store 32bit per offset (more like 24 but whatever)
var BOUNTY_SIZEOF_VAR=BOUNTY_SIZEOF_HEADER+BOUNTY_SIZEOF_OFFSETS;/**
 * @param {Uint8Array} ml
 * @param {Object} problem
 * @param {Uint8Array} [bounty]
 */function bounty_collect(ml,problem,bounty){TRACE('\n ## bounty_collect',ml.length<50?ml.join(' '):'');var varNames=problem.varNames,getAlias=problem.getAlias,getDomain=problem.getDomain;var varCount=varNames.length;var pc=0;if(!bounty){bounty=new Uint8Array(varCount*BOUNTY_SIZEOF_VAR);TRACE('Created bounty buffer. Size:',bounty.length);}bounty.fill(0);// Even for new buffer because they are not guaranteed to be zero filled (most like not)
ASSERT(bounty instanceof Uint8Array);bountyLoop();// Note: do not auto-mark booly-pairs as BOOLY here! (for example `x^y,x!=z` could break if x!=y)
TRACE(" - There are "+getDeadCount(bounty)+" dead vars, "+getLeafCount(bounty)+" leaf vars, full distribution: "+getOccurrenceCount(bounty)+" other vars");return bounty;function getBountyOffset(varIndex){return varIndex*BOUNTY_SIZEOF_VAR;}function getOffsetsOffset(varIndex){return varIndex*BOUNTY_SIZEOF_VAR+BOUNTY_SIZEOF_HEADER;}function collect(delta,metaFlags){TRACE('   ! collect(',delta,',',_bounty__debugMeta(metaFlags),')');ASSERT(typeof delta==='number'&&delta>0,'delta should be >0 number',delta);ASSERT(pc+delta>0&&pc+delta<ml.length,'offset should be within bounds of ML');ASSERT(typeof metaFlags==='number'&&metaFlags>0,'at least one metaFlags should be passed on',metaFlags,metaFlags.toString(2));var index=ml_dec16(ml,pc+delta);ASSERT(typeof index==='number','fetched index should be number');ASSERT(!isNaN(index)&&index>=0&&index<=0xffff,'should be a valid index',index);index=getAlias(index);ASSERT(typeof index==='number','fetched alias should be number');ASSERT(!isNaN(index)&&index>=0&&index<=0xffff,'should be a valid index',index);var domain=getDomain(index,true);TRACE('     - index=',index,'domain=',domain__debug(domain));ASSERT_NORDOM(domain);if(domain_getValue(domain)>=0){TRACE('      - ignore all constants. solved vars and constants are not relevant to bounty');return;}var varOffset=getBountyOffset(index);// ASSERT(bounty[varOffset] < 0xff, 'constraint count should not overflow');
var countIndex=bounty[varOffset]++;// Count, but as zero-offset
var flagsOffset=varOffset+BOUNTY_LINK_COUNT;if(countIndex>=0xff){// Hardcoded limit. just ignore this var. we cant safely optimize this.
ASSERT(BOUNTY_META_FLAGS===32,'update code if this changes');_enc32(bounty,flagsOffset,BOUNTY_JUST_IGNORE);}else{ASSERT(BOUNTY_META_FLAGS===32,'update code if this changes because they currently only write 16bits');var currentFlags=_dec32$1(bounty,flagsOffset);TRACE('     >> collecting for index=',index,' -> count now:',bounty[varOffset],'flags:',_bounty__debugMeta(currentFlags),'|=',_bounty__debugMeta(metaFlags),' -> ',_bounty__debugMeta(currentFlags|metaFlags),'from',flagsOffset,'domain:',domain__debug(domain));if(countIndex<BOUNTY_MAX_OFFSETS_TO_TRACK){var offsetsOffset=getOffsetsOffset(index);var nextOffset=offsetsOffset+countIndex*BOUNTY_BYTES_PER_OFFSET;TRACE('       - tracking offset; countIndex=',countIndex,', putting offset at',nextOffset);_enc32(bounty,nextOffset,pc);}else{TRACE('       - unable to track offset; countIndex beyond max;',countIndex,'>',BOUNTY_MAX_OFFSETS_TO_TRACK);}ASSERT(BOUNTY_META_FLAGS===32,'update code if this changes');_enc32(bounty,flagsOffset,currentFlags|metaFlags);}}function bountyLoop(){pc=0;TRACE(' - bountyLoop');while(pc<ml.length){var pcStart=pc;var op=ml[pc];TRACE(' -- CT pc='+pc+', op: '+ml__debug(ml,pc,1,problem));switch(op){case ML_LT:// Lt always has 2 args (any other wouldnt make sense) but is still a c-args op
collect(OFFSET_C_A,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);collect(OFFSET_C_B,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);pc+=SIZEOF_C_2;break;case ML_LTE:// Lte always has 2 args (any other wouldnt make sense) but is still a c-args op
collect(OFFSET_C_A,BOUNTY_FLAG_LTE_LHS|BOUNTY_FLAG_NOT_BOOLY);collect(OFFSET_C_B,BOUNTY_FLAG_LTE_RHS|BOUNTY_FLAG_NOT_BOOLY);pc+=SIZEOF_C_2;break;case ML_XOR:{// Xor always has 2 args (any other wouldnt make sense) but is still a c-args op
collect(OFFSET_C_A,BOUNTY_FLAG_XOR);collect(OFFSET_C_B,BOUNTY_FLAG_XOR);pc+=SIZEOF_C_2;break;}case ML_XNOR:{var nlen=ml_dec16(ml,pc+1);for(var i=0;i<nlen;++i){collect(SIZEOF_C+i*2,BOUNTY_FLAG_OTHER);}pc+=SIZEOF_C+nlen*2;break;}case ML_IMP:collect(OFFSET_C_A,BOUNTY_FLAG_IMP_LHS);collect(OFFSET_C_B,BOUNTY_FLAG_IMP_RHS);pc+=SIZEOF_C_2;break;case ML_NIMP:collect(OFFSET_C_A,BOUNTY_FLAG_OTHER);collect(OFFSET_C_B,BOUNTY_FLAG_OTHER);pc+=SIZEOF_C_2;break;case ML_ALL:{var _nlen=ml_dec16(ml,pc+1);for(var _i=0;_i<_nlen;++_i){collect(SIZEOF_C+_i*2,BOUNTY_FLAG_OTHER);}pc+=SIZEOF_C+_nlen*2;break;}case ML_NALL:{var _nlen2=ml_dec16(ml,pc+1);for(var _i2=0;_i2<_nlen2;++_i2){collect(SIZEOF_C+_i2*2,BOUNTY_FLAG_NALL);}pc+=SIZEOF_C+_nlen2*2;break;}case ML_SAME:{// Should be aliased but if the problem rejected there may be eqs like this left
// (bounty is also used for generating the dsl problem)
var _nlen3=ml_dec16(ml,pc+1);for(var _i3=0;_i3<_nlen3;++_i3){collect(SIZEOF_C+_i3*2,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);}pc+=SIZEOF_C+_nlen3*2;break;}case ML_SOME:{var _nlen4=ml_dec16(ml,pc+1);for(var _i4=0;_i4<_nlen4;++_i4){collect(SIZEOF_C+_i4*2,BOUNTY_FLAG_SOME);}pc+=SIZEOF_C+_nlen4*2;break;}case ML_NONE:{var _nlen5=ml_dec16(ml,pc+1);for(var _i5=0;_i5<_nlen5;++_i5){collect(SIZEOF_C+_i5*2,BOUNTY_FLAG_OTHER);}pc+=SIZEOF_C+_nlen5*2;break;}case ML_ISSAME:{var _nlen6=ml_dec16(ml,pc+1);for(var _i6=0;_i6<_nlen6;++_i6){collect(SIZEOF_C+_i6*2,BOUNTY_FLAG_ISSAME_ARG|BOUNTY_FLAG_NOT_BOOLY);}collect(SIZEOF_C+_nlen6*2,BOUNTY_FLAG_ISSAME_RESULT);// R
pc+=SIZEOF_C+_nlen6*2+2;break;}case ML_ISSOME:{var ilen=ml_dec16(ml,pc+1);for(var _i7=0;_i7<ilen;++_i7){collect(SIZEOF_C+_i7*2,BOUNTY_FLAG_OTHER);}collect(SIZEOF_C+ilen*2,BOUNTY_FLAG_ISSOME_RESULT);// R
pc+=SIZEOF_C+ilen*2+2;break;}case ML_DIFF:{// Note: diff "cant" have multiple counts of same var because that would reject
var dlen=ml_dec16(ml,pc+1);for(var _i8=0;_i8<dlen;++_i8){collect(SIZEOF_C+_i8*2,BOUNTY_FLAG_DIFF|BOUNTY_FLAG_NOT_BOOLY);}pc+=SIZEOF_C+dlen*2;break;}case ML_ISDIFF:{var _ilen=ml_dec16(ml,pc+1);for(var _i9=0;_i9<_ilen;++_i9){collect(SIZEOF_C+_i9*2,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);}collect(SIZEOF_C+_ilen*2,BOUNTY_FLAG_OTHER);// R
pc+=SIZEOF_C+_ilen*2+2;break;}case ML_ISLT:collect(1,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);collect(3,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);collect(5,BOUNTY_FLAG_OTHER);pc+=SIZEOF_VVV;break;case ML_ISLTE:collect(1,BOUNTY_FLAG_ISLTE_ARG|BOUNTY_FLAG_NOT_BOOLY);collect(3,BOUNTY_FLAG_ISLTE_ARG|BOUNTY_FLAG_NOT_BOOLY);collect(5,BOUNTY_FLAG_OTHER);pc+=SIZEOF_VVV;break;case ML_MINUS:case ML_DIV:collect(1,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);collect(3,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);collect(5,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);pc+=SIZEOF_VVV;break;case ML_ISALL:{var _ilen2=ml_dec16(ml,pc+1);for(var _i10=0;_i10<_ilen2;++_i10){collect(SIZEOF_C+_i10*2,BOUNTY_FLAG_ISALL_ARG);}collect(SIZEOF_C+_ilen2*2,BOUNTY_FLAG_ISALL_RESULT);// R
pc+=SIZEOF_C+_ilen2*2+2;break;}case ML_ISNALL:case ML_ISNONE:{var mlen=ml_dec16(ml,pc+1);for(var _i11=0;_i11<mlen;++_i11){collect(SIZEOF_C+_i11*2,BOUNTY_FLAG_OTHER);}collect(SIZEOF_C+mlen*2,BOUNTY_FLAG_OTHER);pc+=SIZEOF_C+mlen*2+2;break;}case ML_SUM:{// TODO: collect multiple occurrences of same var once
var splen=ml_dec16(ml,pc+1);for(var _i12=0;_i12<splen;++_i12){collect(SIZEOF_C+_i12*2,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);}collect(SIZEOF_C+splen*2,BOUNTY_FLAG_SUM_RESULT|BOUNTY_FLAG_NOT_BOOLY);// R
pc+=SIZEOF_C+splen*2+2;break;}case ML_PRODUCT:{// TODO: collect multiple occurrences of same var once
var plen=ml_dec16(ml,pc+1);for(var _i13=0;_i13<plen;++_i13){collect(SIZEOF_C+_i13*2,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);}collect(SIZEOF_C+plen*2,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);// R
pc+=SIZEOF_C+plen*2+2;break;}case ML_START:if(pc!==0)return THROW(' ! compiler problem @',pcStart);++pc;break;case ML_STOP:return;case ML_NOBOOL:// For testing, consider vars under nobool explicitly not-booly
collect(1,BOUNTY_FLAG_OTHER|BOUNTY_FLAG_NOT_BOOLY);pc+=SIZEOF_V;break;case ML_NOLEAF:// Should prevent trivial eliminations because ML_NOLEAF is never part of a trick
// vars under ML_NOLEAF are explicitly never considered leaf vars because their counts is inflated
collect(1,BOUNTY_FLAG_OTHER);pc+=SIZEOF_V;break;case ML_JMP:pc+=SIZEOF_V+ml_dec16(ml,pc+1);break;case ML_JMP32:pc+=SIZEOF_W+ml_dec32(ml,pc+1);break;case ML_NOOP:++pc;break;case ML_NOOP2:pc+=2;break;case ML_NOOP3:pc+=3;break;case ML_NOOP4:pc+=4;break;default:// Put in a switch in the default so that the main switch is smaller. this second switch should never hit.
getTerm().error('(cnt) unknown op',pc,' at',pc);ml_throw(ml,pc,'(bnt) expecting bounty to run after the minifier and these ops should be gone');}}ml_throw(ml,pc,'ML OOB');}function getDeadCount(varMeta){var count=0;for(var i=0;i<varCount;i+=BOUNTY_SIZEOF_VAR){if(!varMeta[i])++count;}return count;}function getLeafCount(varMeta){var count=0;for(var i=0;i<varCount;i+=BOUNTY_SIZEOF_VAR){if(varMeta[i]===1)++count;}return count;}function getOccurrenceCount(varMeta){// Should be eliminated when not used by ASSERTs
var count={};for(var i=0;i<varCount;i+=BOUNTY_SIZEOF_VAR){count[varMeta[i]]=~-count[varMeta[i]];}return count;}}function bounty_getCounts(bounty,varIndex){return bounty[varIndex*BOUNTY_SIZEOF_VAR];}function bounty_markVar(bounty,varIndex){ASSERT(typeof bounty==='object','bounty should be object');ASSERT(typeof varIndex==='number'&&varIndex>=0,'should be valid varIndex');// Until next loop, ignore this var (need to refresh bounty data)
TRACE(' - bounty_markVar',varIndex);bounty[varIndex*BOUNTY_SIZEOF_VAR]=0;}function bounty_getMeta(bounty,varIndex,_debug){ASSERT(bounty_getCounts(bounty,varIndex)>0||_debug,'check caller (2), this is probably a bug (var did not appear in any constraint, or its a constant, or this data was marked as stale)');return _dec32$1(bounty,varIndex*BOUNTY_SIZEOF_VAR+BOUNTY_LINK_COUNT);}function bounty_getOffset(bounty,varIndex,n,_debug){ASSERT(bounty_getCounts(bounty,varIndex)>0||_debug,'check caller (1), this is probably a bug (var did not appear in any constraint, or its a constant, or this data was marked as stale)',varIndex,n,bounty_getCounts(bounty,varIndex),_debug);ASSERT(n<bounty_getCounts(bounty,varIndex),'check caller, this is probably a bug (should not get an offset beyond the count)');ASSERT(n<BOUNTY_MAX_OFFSETS_TO_TRACK,'OOB, shouldnt exceed the max offset count',n,'<',BOUNTY_MAX_OFFSETS_TO_TRACK);return _dec32$1(bounty,varIndex*BOUNTY_SIZEOF_VAR+BOUNTY_SIZEOF_HEADER+n*BOUNTY_BYTES_PER_OFFSET);}function bounty__debug(bounty,varIndex,full){var count=bounty_getCounts(bounty,varIndex);var r="{B: index="+varIndex+", counts="+count+", meta="+bounty__debugMeta(bounty,varIndex);if(full){r+=', offsets:[';for(var i=0;i<BOUNTY_MAX_OFFSETS_TO_TRACK;++i){if(i)r+=', ';if(i>=count)r+='(';r+=_dec32$1(bounty,varIndex*BOUNTY_SIZEOF_VAR+BOUNTY_SIZEOF_HEADER+i*BOUNTY_BYTES_PER_OFFSET);if(i>=count)r+=')';}r+=']';}return r+'}';}function bounty__debugMeta(bounty,index){ASSERT(typeof bounty==='object','bounty object');ASSERT(typeof index==='number','the index should be a number',index);var counts=bounty_getCounts(bounty,index)|0;// Constants would return undefined here
if(counts===0)return '[ constant or marked var ]';var meta=counts&&bounty_getMeta(bounty,index,true);return _bounty__debugMeta(meta);}function _bounty__debugMeta(meta){ASSERT(typeof meta==='number','the meta should be a number',meta);var s='0'.repeat(32-meta.toString(2).length)+meta.toString(2);var what=[];if(!meta)what.push('BOUNTY_NONE');if((meta&BOUNTY_FLAG_NOT_BOOLY)===BOUNTY_FLAG_NOT_BOOLY){what.push('NOT_BOOLY');}else{what.push('BOOLY');}if((meta&BOUNTY_FLAG_OTHER)===BOUNTY_FLAG_OTHER)what.push('OTHER');if((meta&BOUNTY_FLAG_LTE_LHS)===BOUNTY_FLAG_LTE_LHS)what.push('LTE_LHS');if((meta&BOUNTY_FLAG_LTE_RHS)===BOUNTY_FLAG_LTE_RHS)what.push('LTE_RHS');if((meta&BOUNTY_FLAG_ISALL_ARG)===BOUNTY_FLAG_ISALL_ARG)what.push('ISALL_ARG');if((meta&BOUNTY_FLAG_ISALL_RESULT)===BOUNTY_FLAG_ISALL_RESULT)what.push('ISALL_RESULT');if((meta&BOUNTY_FLAG_IMP_LHS)===BOUNTY_FLAG_IMP_LHS)what.push('IMP_LHS');if((meta&BOUNTY_FLAG_IMP_RHS)===BOUNTY_FLAG_IMP_RHS)what.push('IMP_RHS');if((meta&BOUNTY_FLAG_ISLTE_ARG)===BOUNTY_FLAG_ISLTE_ARG)what.push('ISLTE_ARG');if((meta&BOUNTY_FLAG_ISSAME_ARG)===BOUNTY_FLAG_ISSAME_ARG)what.push('ISSAME_ARG');if((meta&BOUNTY_FLAG_ISSAME_RESULT)===BOUNTY_FLAG_ISSAME_RESULT)what.push('ISSAME_RESULT');if((meta&BOUNTY_FLAG_ISSOME_RESULT)===BOUNTY_FLAG_ISSOME_RESULT)what.push('ISSOME_RESULT');if((meta&BOUNTY_FLAG_NALL)===BOUNTY_FLAG_NALL)what.push('NALL');if((meta&BOUNTY_FLAG_DIFF)===BOUNTY_FLAG_DIFF)what.push('DIFF');if((meta&BOUNTY_FLAG_SOME)===BOUNTY_FLAG_SOME)what.push('SOME');if((meta&BOUNTY_FLAG_SUM_RESULT)===BOUNTY_FLAG_SUM_RESULT)what.push('SUM_RESULT');if((meta&BOUNTY_FLAG_XOR)===BOUNTY_FLAG_XOR)what.push('XOR');if((meta&BOUNTY_JUST_IGNORE)===BOUNTY_JUST_IGNORE)what.push('JUST_IGNORE');return '[ '+s+': '+what.join(', ')+' ]';}function _dec32$1(bounty,offset){ASSERT(bounty instanceof Uint8Array,'should be Uint8Array');ASSERT(typeof offset==='number'&&offset>=0&&offset<bounty.length,'Invalid or OOB',offset,'>=',bounty.length);return bounty[offset++]<<24|bounty[offset++]<<16|bounty[offset++]<<8|bounty[offset];}function _enc32(bounty,offset,num){ASSERT(bounty instanceof Uint8Array,'should be Uint8Array');ASSERT(typeof offset==='number'&&offset>=0&&offset<bounty.length,'Invalid or OOB',offset,'>=',bounty.length);ASSERT(typeof num==='number','Encoding numbers');ASSERT(num<=0xffffffff,'implement 64bit index support if this breaks',num);ASSERT(num>=0,'only expecting non-negative nums',num);bounty[offset++]=num>>24&0xff;bounty[offset++]=num>>16&0xff;bounty[offset++]=num>>8&0xff;bounty[offset]=num&0xff;}// TODO: need to update this code to use getDomain and aliases and such
/**
 * Generate a dsl for given ml
 * Includes a full debugging output stack to investigate a problem more thoroughly
 *
 * @param {Uint8Array} ml
 * @param {Object} problem
 * @param {number[]} [bounty]
 * @param {Object} options See preSolver options
 * @returns {string}
 */function ml2dsl(ml,problem,bounty,options){TRACE('\n## ml2dsl');var DEBUG=Boolean(options.debugDsl);// Add debugging help in comments (domains, related constraints, occurrences, etc)
var HASH_NAMES=Boolean(options.hashNames);// Replace all var varNames with $index$ with index in base36
var INDEX_NAMES=Boolean(options.indexNames);// Replace all var varNames with _index_ (ignored if HASH_NAMES is true)
var ADD_GROUPED_CONSTRAINTS=Boolean(options.groupedConstraints);// Only used when debugging
var varNames=problem.varNames,domains=problem.domains,valdist=problem.valdist,getDomain=problem.getDomain,getAlias=problem.getAlias,solveStack=problem.solveStack,targeted=problem.targeted;var pc=0;var dsl='';var LEN=ml.length;function toName(index){if(HASH_NAMES)return '$'+index.toString(36)+'$';if(INDEX_NAMES)return '_'+index+'_';return varNames[index];}function valueOrName(a,vA){if(vA>=0)return vA;return toName(a);}function domainstr(A,vA){if(vA>=0)return 'lit('+vA+')';return domain__debug(A);}function counts(index){var c=bounty_getCounts(bounty,index);if(c===undefined)return '-';return c;}var allParts=[];var partsPerVar=[];var varOps=[];var constraintCount=0;m2d_innerLoop();if(DEBUG){var varDecls=[];var varsLeft=0;var aliases=0;var solved=0;var unsolved=0;// First generate var decls for unsolved, unaliased vars
domains.forEach(function(domain,index){var str='';if(domain===false||bounty&&!counts(index)){// Either solved, alias, or leaf. leafs still needs to be updated after the rest solves.
domain=getDomain(index);if(domain_getValue(domain)>=0){++solved;}else{++aliases;}}else{++varsLeft;ASSERT(domain===getDomain(index),'if not aliased then it should return this',index,domain);ASSERT(domain_getValue(domain)<0,'solved vars should be aliased to their constant');++unsolved;str=': '+toName(index)+' ['+domain_toArr(domain)+']';var vardist=valdist[index];if(vardist){switch(vardist.valtype){case'max':case'mid':case'min':case'naive':str+=' @'+vardist.valtype;break;case'list':str+=' @'+vardist.valtype;str+=' prio('+vardist.list+')';break;case'markov':str+=' # skipping markov dist (no longer supported)';break;case'minMaxCycle':case'splitMax':case'splitMin':default:THROW('unknown var dist ['+vardist.valtype+'] '+JSON.stringify(vardist));}}}varDecls[index]=str;});var varDeclsString=domains.map(function(_,varIndex){// ignore constants, aliases, and leafs
if(domains[varIndex]===false)return '';var cnts=counts(varIndex);if(!cnts)return '';var decl=varDecls[varIndex];ASSERT(varOps[varIndex],'anything that has counts should have varOps of those constraints','var index:',varIndex,'counts:',cnts,', varops:',varOps[varIndex],', decls:',decl,', name:',varNames[varIndex],', ppv:',partsPerVar[varIndex],'->',partsPerVar[varIndex]&&partsPerVar[varIndex].map(function(partIndex){return allParts[partIndex];}));ASSERT(decl,'anything that has counts should have that many constraints','var index:',varIndex,'counts:',cnts,', varops:',varOps[varIndex],', decls:',decl,', name:',varNames[varIndex],', ppv:',partsPerVar[varIndex]);var ops=varOps[varIndex].split(/ /g).sort().join(' ');return decl+' # T:'+targeted[varIndex]+' '+' # ocounts: '+cnts+(HASH_NAMES||!INDEX_NAMES?'  # index = '+varIndex:'')+'  # ops ('+(ops.replace(/[^ ]/g,'').length+1)+'): '+ops+' $ meta: '+bounty__debugMeta(bounty,varIndex)+(ADD_GROUPED_CONSTRAINTS&&partsPerVar[varIndex]?'\n ## '+partsPerVar[varIndex].map(function(partIndex){return allParts[partIndex];}).join(' ## '):'');}).filter(function(s){return Boolean(s);}).join('\n');dsl="\n# Constraints: "+constraintCount+" x\n# Vars: "+domains.length+" x\n#   Aliases: "+aliases+" x\n#   Domained: "+varsLeft+" x\n#    - Solved: "+solved+" x\n#    - Unsolved: "+unsolved+" x\n#    - Solve stack: "+solveStack.length+" x (or "+(solveStack.length-aliases)+" x without aliases)\n";getTerm().log(dsl);dsl+="\n# Var decls:\n"+varDeclsString+"\n\n";}else{dsl+='# vars ('+domains.length+'x total):\n';dsl+=domains.map(function(d,i){return [d,i];}).filter(function(a){return a[0]!==false;}).filter(function(a){return !bounty||counts(a[1])>0;}).map(function(a){return ': '+toName(a[1])+' ['+domain_toArr(a[0])+']';}).join('\n');dsl+='\n\n';}dsl+='\n# Constraints ('+allParts.length+'x):\n'+allParts.join('');dsl+=String('\n# Meta:\n'+m2d_getTargetsDirective());return dsl;// ###########################################
function m2d_dec16(){ASSERT(pc<LEN-1,'OOB');TRACE(' . dec16 decoding',ml[pc]<<8,'from',pc,'and',ml[pc+1],'from',pc+1,'=>',ml[pc]<<8|ml[pc+1]);var s=ml[pc++]<<8|ml[pc++];return s;}function m2d_dec32(){ASSERT(pc<LEN-1,'OOB');TRACE(' . dec32 decoding',ml[pc],ml[pc+1],ml[pc+2],ml[pc+3],'from',pc,'=>',ml[pc]<<8|ml[pc+1]);return ml[pc++]<<24|ml[pc++]<<16|ml[pc++]<<8|ml[pc++];}function m2d_decA(op,skipIfConstant){ASSERT(typeof op==='string'&&op,'op should be string');var a=getAlias(m2d_dec16());var A=getDomain(a);var vA=domain_getValue(A);if(vA>=0&&skipIfConstant)return false;if(DEBUG){if(vA<0){if(!partsPerVar[a])partsPerVar[a]=[];partsPerVar[a].push(allParts.length);varOps[a]=(varOps[a]===undefined?'':varOps[a]+' ')+op;}var s=valueOrName(a,vA);s+=' '.repeat(Math.max(45-s.length,3));s+='# '+domainstr(A,vA);s+=' '.repeat(Math.max(110-s.length,3));s+='# args: '+a;s+=' '.repeat(Math.max(150-s.length,3));if(bounty)s+='# counts: '+counts(a)+' ';s+=' \n';return s;}return valueOrName(a,vA);}function _m2d_decAb(op,a,b){var A=getDomain(a);var vA=domain_getValue(A);var B=getDomain(b);var vB=domain_getValue(B);return __m2d_decAb(op,a,A,vA,b,B,vB);}function __m2d_decAb(op,a,A,vA,b,B,vB){if(DEBUG){if(vA<0){// Else is probably dead code; all binary void constraints with a constant get resolved immediately
if(!partsPerVar[a])partsPerVar[a]=[];partsPerVar[a].push(allParts.length);varOps[a]=(varOps[a]===undefined?'':varOps[a]+' ')+op;}if(vB<0){// Else is probably dead code; all binary void constraints with a constant get resolved immediately
if(!partsPerVar[b])partsPerVar[b]=[];partsPerVar[b].push(allParts.length);varOps[b]=(varOps[b]===undefined?'':varOps[b]+' ')+op;}var s=valueOrName(a,vA)+' '+op+' '+valueOrName(b,vB);s+=' '.repeat(Math.max(45-s.length,3));s+='# '+domainstr(A,vA)+' '+op+' '+domainstr(B,vB);s+=' '.repeat(Math.max(110-s.length,3));s+='# args: '+a+', '+b;s+=' '.repeat(Math.max(150-s.length,3));if(bounty)s+='# counts: '+counts(a)+' '+op+' '+counts(b)+' ';s+=' \n';return s;}return valueOrName(a,vA)+' '+op+' '+valueOrName(b,vB)+'\n';}function m2d_decAbc(op){ASSERT(typeof op==='string'&&op,'op should be string');var a=getAlias(m2d_dec16());var b=getAlias(m2d_dec16());var c=getAlias(m2d_dec16());return _m2d_decAbc(op,a,b,c);}function _m2d_decAbc(op,a,b,c){var A=getDomain(a);var vA=domain_getValue(A);var B=getDomain(b);var vB=domain_getValue(B);var C=getDomain(c);var vC=domain_getValue(C);return __m2d_decAbc(op,a,A,vA,b,B,vB,c,C,vC);}function __m2d_decAbc(op,a,A,vA,b,B,vB,c,C,vC){if(DEBUG){if(vA<0){// Else is probably dead; args are ordered and A can only be solved if B is also solved or unordered.
if(!partsPerVar[a])partsPerVar[a]=[];partsPerVar[a].push(allParts.length);varOps[a]=(varOps[a]===undefined?'':varOps[a]+' ')+op;}if(vB<0){if(!partsPerVar[b])partsPerVar[b]=[];partsPerVar[b].push(allParts.length);varOps[b]=(varOps[b]===undefined?'':varOps[b]+' ')+op;}if(vC<0){if(!partsPerVar[c])partsPerVar[c]=[];partsPerVar[c].push(allParts.length);varOps[c]=(varOps[c]===undefined?'':varOps[c]+' ')+op;}var s=valueOrName(c,vC)+' = '+valueOrName(a,vA)+' '+op+' '+valueOrName(b,vB);s+=' '.repeat(Math.max(45-s.length,3));s+='# '+domainstr(C,vC)+' = '+domainstr(A,vA)+' '+op+' '+domainstr(B,vB);s+=' '.repeat(Math.max(110-s.length,3));s+='# indexes: '+c+' = '+a+' '+op+' '+b;s+=' '.repeat(Math.max(150-s.length,3));if(bounty)s+='# counts: '+counts(c)+' = '+counts(a)+' '+op+' '+counts(b)+' ';s+='\n';return s;}return valueOrName(c,vC)+' = '+valueOrName(a,vA)+' '+op+' '+valueOrName(b,vB)+'\n';}function m2d_listVoid(callName){ASSERT(typeof callName==='string'&&callName,'callName should be string');var argCount=m2d_dec16();if(argCount===2){if(callName==='all')return _m2d_decAb('&',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='diff')return _m2d_decAb('!=',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='imp')return _m2d_decAb('->',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='lt')return _m2d_decAb('<',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='lte')return _m2d_decAb('<=',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='nall')return _m2d_decAb('!&',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='nimp')return _m2d_decAb('!->',getAlias(m2d_dec16()),getAlias(m2d_dec16()));// If (callName === 'none') return _m2d_decAb('!|', getAlias(m2d_dec16()), getAlias(m2d_dec16()));
if(callName==='same')return _m2d_decAb('==',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='some')return _m2d_decAb('|',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='xnor')return _m2d_decAb('!^',getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='xor')return _m2d_decAb('^',getAlias(m2d_dec16()),getAlias(m2d_dec16()));}var indexes='';var counters='';var argNames='';var debugs='';// Let prevIndex = -1;
for(var i=0;i<argCount;++i){var d=getAlias(m2d_dec16());var D=getDomain(d);var vD=domain_getValue(D);argNames+=valueOrName(d,vD)+' ';if(DEBUG){if(vD<0){if(!partsPerVar[d])partsPerVar[d]=[];partsPerVar[d].push(allParts.length);varOps[d]=(varOps[d]===undefined?'':varOps[d]+' ')+callName;}indexes+=d+' ';if(bounty)counters+=counts(d)+' ';debugs+=domainstr(D,vD)+' ';}}if(DEBUG){var s=callName+'( '+argNames+')';s+=' '.repeat(Math.max(45-s.length,3));s+='# '+callName+'( '+debugs+') ';s+=' '.repeat(Math.max(110-s.length,3));s+='# indexes: '+indexes;s+=' '.repeat(Math.max(150-s.length,3));if(bounty)s+='# counts: '+callName+'( '+counters+')';s+='\n';return s;}return callName+'( '+argNames+')\n';}function m2d_listResult(callName){ASSERT(typeof callName==='string'&&callName,'callName should be string');var argCount=m2d_dec16();return m2d_listResultBody(callName,argCount);}function m2d_listResultBody(callName,argCount){ASSERT(typeof callName==='string'&&callName,'callName should be string');if(argCount===2){// If (callName === 'all?') return _m2d_decAbc('&?', getAlias(m2d_dec16()), getAlias(m2d_dec16()), getAlias(m2d_dec16()));
if(callName==='diff?')return _m2d_decAbc('!=?',getAlias(m2d_dec16()),getAlias(m2d_dec16()),getAlias(m2d_dec16()));// If (callName === 'nall?') return _m2d_decAbc('!&?', getAlias(m2d_dec16()), getAlias(m2d_dec16()), getAlias(m2d_dec16()));
// if (callName === 'none?') return _m2d_decAbc('!|?', getAlias(m2d_dec16()), getAlias(m2d_dec16()), getAlias(m2d_dec16()));
if(callName==='same?')return _m2d_decAbc('==?',getAlias(m2d_dec16()),getAlias(m2d_dec16()),getAlias(m2d_dec16()));// If (callName === 'some?') return _m2d_decAbc('|?', getAlias(m2d_dec16()), getAlias(m2d_dec16()), getAlias(m2d_dec16()));
if(callName==='sum')return _m2d_decAbc('+',getAlias(m2d_dec16()),getAlias(m2d_dec16()),getAlias(m2d_dec16()));if(callName==='product')return _m2d_decAbc('*',getAlias(m2d_dec16()),getAlias(m2d_dec16()),getAlias(m2d_dec16()));}var indexes='';var counters='';var argNames='';var debugs='';// Let prevIndex = -1;
for(var i=0;i<argCount;++i){var d=getAlias(m2d_dec16());var D=getDomain(d);var vD=domain_getValue(D);argNames+=valueOrName(d,vD)+' ';if(DEBUG){if(vD<0){if(!partsPerVar[d])partsPerVar[d]=[];partsPerVar[d].push(allParts.length);varOps[d]=(varOps[d]===undefined?'':varOps[d]+' ')+callName;}indexes+=d+' ';if(bounty)counters+=counts(d)+' ';debugs+=domainstr(D,vD)+' ';}}var r=getAlias(m2d_dec16());var R=getDomain(r);var vR=domain_getValue(R);if(DEBUG){if(vR<0){if(!partsPerVar[r])partsPerVar[r]=[];partsPerVar[r].push(allParts.length);varOps[r]=(varOps[r]===undefined?'':varOps[r]+' ')+callName;}var s=valueOrName(r,vR)+' = '+callName+'( '+argNames+')';s+=' '.repeat(Math.max(45-s.length,3));s+='# '+domainstr(R,vR)+' = '+callName+'( '+debugs+') ';s+=' '.repeat(Math.max(110-s.length,3));s+='# indexes: '+r+' = '+indexes;s+=' '.repeat(Math.max(150-s.length,3));if(bounty)s+='# counts: '+counts(r)+' = '+callName+'( '+counters+')';s+='\n';return s;}return valueOrName(r,vR)+' = '+callName+'( '+argNames+')\n';}function m2d_innerLoop(){while(pc<LEN){var pcStart=pc;var op=ml[pc++];var part='';switch(op){case ML_START:case ML_STOP:case ML_NOBOOL:case ML_NOLEAF:case ML_NOOP:case ML_NOOP2:case ML_NOOP3:case ML_NOOP4:case ML_JMP:case ML_JMP32:break;default:++constraintCount;}switch(op){case ML_START:if(pc!==1){// Pc is already incremented...
return THROW(' ! ml2dsl compiler problem @',pcStart);}break;case ML_STOP:TRACE(' ! good end @',pcStart);return;case ML_JMP:var delta=m2d_dec16();TRACE(' ! jmp',delta);if(delta<=0)THROW('Must jump some bytes');pc+=delta;break;case ML_JMP32:var delta32=m2d_dec32();TRACE(' ! jmp32',delta32);if(delta32<=0)THROW('Must jump some bytes');pc+=delta32;break;case ML_LT:TRACE(' ! lt');part=m2d_listVoid('lt');break;case ML_LTE:TRACE(' ! lte');part=m2d_listVoid('lte');break;case ML_XOR:TRACE(' ! xor');part=m2d_listVoid('xor');break;case ML_IMP:TRACE(' ! imp vv');part=m2d_listVoid('imp');break;case ML_NIMP:TRACE(' ! nimp vv');part=m2d_listVoid('nimp');break;case ML_ALL:TRACE(' ! all');part=m2d_listVoid('all');break;case ML_DIFF:TRACE(' ! diff');part=m2d_listVoid('diff');break;case ML_NALL:TRACE(' ! nall');part=m2d_listVoid('nall');break;case ML_NONE:TRACE(' ! none');part=m2d_listVoid('none');break;case ML_SAME:TRACE(' ! same');part=m2d_listVoid('same');break;case ML_SOME:TRACE(' ! some');part=m2d_listVoid('some');break;case ML_XNOR:TRACE(' ! xnor');part=m2d_listVoid('xnor');break;case ML_ISLT:TRACE(' ! islt vvv');part=m2d_decAbc('<?');break;case ML_ISLTE:TRACE(' ! islte vvv');part=m2d_decAbc('<=?');break;case ML_ISALL:TRACE(' ! isall');part=m2d_listResult('all?');break;case ML_ISDIFF:TRACE(' ! isdiff');part=m2d_listResult('diff?');break;case ML_ISNALL:TRACE(' ! isnall');part=m2d_listResult('nall?');break;case ML_ISNONE:TRACE(' ! isnone');part=m2d_listResult('none?');break;case ML_ISSAME:TRACE(' ! issame');part=m2d_listResult('same?');break;case ML_ISSOME:TRACE(' ! issome');part=m2d_listResult('some?');break;case ML_MINUS:TRACE(' ! minus');part=m2d_decAbc('-');break;case ML_DIV:TRACE(' ! div');part=m2d_decAbc('/');break;case ML_SUM:TRACE(' ! sum');part=m2d_listResult('sum');break;case ML_PRODUCT:TRACE(' ! product');part=m2d_listResult('product');break;case ML_NOBOOL:TRACE(' ! nobool');// Fdq will understand but ignore this. skip for constants.
var Bpart=m2d_decA('<debug>',true);if(Bpart!==false)part='@custom nobool '+Bpart+'\n';break;case ML_NOLEAF:TRACE(' ! noleaf');// Fdq will understand but ignore this. skip for constants.
var Apart=m2d_decA('<debug>',true);if(Apart!==false){part='@custom noleaf '+Apart+'\n';}break;case ML_NOOP:TRACE(' ! noop');pc=pcStart+1;break;case ML_NOOP2:TRACE(' ! noop 2');pc=pcStart+2;break;case ML_NOOP3:TRACE(' ! noop 3');pc=pcStart+3;break;case ML_NOOP4:TRACE(' ! noop 4');pc=pcStart+4;break;default:ml_throw('(m2d) unknown op',pc,' at');}allParts.push(part);}}function m2d_getTargetsDirective(){var targets=[];var targeted=problem.targeted;var len=domains.length;var total=0;var nontargets=0;for(var i=0;i<len;++i){if(domains[i]===false)continue;if(!counts(i))continue;++total;if(!targeted[i]){++nontargets;// We only care about this state for vars that will appear in the dsl.
continue;}targets.push(toName(i));}// TODO
// what if there are no targets left? we could set internal
// vars to anything but that could still affect targeted
// vars through the solve stack... or perhaps they are irrelevant?
// does this mean any valuation will work to resolve the vars?
return '@custom targets'+(nontargets&&nontargets.length?'( '+targets.join(' ')+' )':' all')+' # '+(total-nontargets)+' / '+total+'\n';}}function m2d__debug(problem,notTrace){TRACE('\nm2d__debug, temporarily disabling TRACE while generating dsl');var was=isTracing();if(!was&&!notTrace)return '';// TRACE is disabled; dont generate anything as it wont be seen (reduce test runtime)
if(process.env.NODE_ENV!=='production')setTracing(false);var dsl=ml2dsl(problem.ml,problem,bounty_collect(problem.ml,problem),{debugDsl:false,hashNames:false});if(process.env.NODE_ENV!=='production')setTracing(was);return '\n## current remaining problem as dsl:\n'+dsl+'## end of current remaining problem\n';}// Note: you can use the tool at https://pvdz.github.io/logic-table-filter/ to test some of these tricks
var ML_BOOLY_NO=0;var ML_BOOLY_YES=1;var ML_BOOLY_MAYBE=2;function cutter(ml,problem,once){TRACE('\n ## cutter',ml.length<50?ml.join(' '):'');var term=getTerm();var getDomain=problem.getDomain,setDomain=problem.setDomain,addAlias=problem.addAlias,getAlias=problem.getAlias,solveStack=problem.solveStack,leafs=problem.leafs,isConstant=problem.isConstant;var pc=0;var bounty;var stacksBefore;var emptyDomain=false;var changes=0;var loops=0;var requestAnotherCycle=false;// When true this will force another cycle so the minimizer runs again
do{term.time('-> cut_loop '+loops);TRACE(' # start cutter outer loop',loops);bounty=bounty_collect(ml,problem,bounty);TRACE('\n#### Problem state between bounty and cutter: ###');TRACE(ml__debug(ml,0,20,problem));TRACE(m2d__debug(problem));stacksBefore=solveStack.length;changes=0;cutLoop();term.timeEnd('-> cut_loop '+loops);term.log('   - end cutter outer loop',loops,', removed:',solveStack.length-stacksBefore,' vars, total changes:',changes,', emptyDomain =',emptyDomain,'once=',once);++loops;}while(!emptyDomain&&changes&&!once&&!requestAnotherCycle);TRACE('## exit cutter',emptyDomain?'[there was an empty domain]':requestAnotherCycle?'[explicitly requesting another cycle]':loops>1?'[it might not be done]':'[it is done]');if(emptyDomain)return -1;return loops+(requestAnotherCycle?1:0);function somethingChanged(){++changes;}function readIndex(ml,offset){ASSERT(ml instanceof Uint8Array,'ml should be a buffer');ASSERT(typeof offset==='number'&&offset>=0&&offset<=ml.length,'expecting valid offset');ASSERT(arguments.length===2,'only two args');return getAlias(ml_dec16(ml,offset));}function getMeta(bounty,index,keepBoolyFlags,_debug){ASSERT(typeof index==='number'&&index>=0&&index<=0xffff,'expecting valid index');ASSERT(arguments.length===2||arguments.length===3,'only two or three args');if(!isConstant(index)){var meta=bounty_getMeta(bounty,index,_debug);if(!keepBoolyFlags)return scrubBoolyFlag(meta);return meta;}return 0;}function scrubBoolyFlag(meta){return (meta|BOUNTY_FLAG_NOT_BOOLY)^BOUNTY_FLAG_NOT_BOOLY;}function hasFlags(meta,flags){return (meta&flags)===flags;}function getCounts(bounty,index){ASSERT(typeof index==='number'&&index>=0&&index<=0xffff,'expecting valid index');ASSERT(arguments.length===2,'no more than two args');if(!isConstant(index))return bounty_getCounts(bounty,index);return 0;}// ##############
function cutLoop(){TRACE('\n#### - inner cutLoop');pc=0;while(pc<ml.length&&!emptyDomain&&!requestAnotherCycle){var op=ml[pc];TRACE(' -- CU pc='+pc,', op=',op,ml__opName(op));TRACE(' -> op: '+ml__debug(ml,pc,1,problem,true));ASSERT(ml_validateSkeleton(ml,'cutLoop'));switch(op){case ML_ALL:return ml_throw(ml,pc,'all() should be solved and eliminated');case ML_DIFF:cut_diff(ml,pc);break;case ML_DIV:pc+=SIZEOF_VVV;break;case ML_IMP:cut_imp(ml,pc);break;case ML_ISALL:cut_isall(ml,pc);break;case ML_ISDIFF:cut_isdiff(ml,pc);break;case ML_ISLT:cut_islt(ml,pc);break;case ML_ISLTE:cut_islte(ml,pc);break;case ML_ISNALL:cut_isnall(ml,pc);break;case ML_ISSAME:cut_issame(ml,pc);break;case ML_ISSOME:cut_issome(ml,pc);break;case ML_ISNONE:TRACE('(skipped) issome/isnone',pc);var nlen=ml_dec16(ml,pc+1);pc+=SIZEOF_C+nlen*2+2;break;case ML_LT:cut_lt(ml,pc);break;case ML_LTE:cut_lte(ml,pc);break;case ML_MINUS:pc+=SIZEOF_VVV;break;case ML_NALL:cut_nall(ml,pc);break;case ML_NIMP:TRACE('(skipped) nimp',pc);pc+=SIZEOF_C_2;break;case ML_NONE:return ml_throw(ml,pc,'nors should be solved and eliminated');case ML_PRODUCT:TRACE('(skipped) product',pc);var plen=ml_dec16(ml,pc+1);pc+=SIZEOF_C+plen*2+2;break;case ML_SAME:return ml_throw(ml,pc,'eqs should be aliased and eliminated');case ML_SOME:cut_some(ml,pc);break;case ML_SUM:cut_sum(ml,pc);break;case ML_XOR:cut_xor(ml,pc);break;case ML_XNOR:cut_xnor(ml,pc);break;case ML_START:if(pc!==0)return ml_throw(ml,pc,' ! compiler problem @');++pc;break;case ML_STOP:return;case ML_NOBOOL:case ML_NOLEAF:pc+=SIZEOF_V;break;case ML_JMP:cut_moveTo(ml,pc,SIZEOF_V+ml_dec16(ml,pc+1));break;case ML_JMP32:cut_moveTo(ml,pc,SIZEOF_W+ml_dec32(ml,pc+1));break;case ML_NOOP:cut_moveTo(ml,pc,1);break;case ML_NOOP2:cut_moveTo(ml,pc,2);break;case ML_NOOP3:cut_moveTo(ml,pc,3);break;case ML_NOOP4:cut_moveTo(ml,pc,4);break;default:getTerm().error('(cut) unknown op',pc,' at',pc);ml_throw(ml,pc,'(cut) unknown op');}}if(emptyDomain){TRACE('Ended up with an empty domain');return;}if(requestAnotherCycle){TRACE('Stopped cutloop prematurely because another minimizer cycle was requested');return;}TRACE('the implicit end; ml desynced');THROW('ML OOB');}function cut_diff(ml,offset){var argCount=ml_dec16(ml,offset+1);TRACE(' ! cut_diff;',argCount,'args');var indexA=readIndex(ml,offset+OFFSET_C_A);var countsA=getCounts(bounty,indexA);if(countsA>1&&countsA<BOUNTY_MAX_OFFSETS_TO_TRACK){// Search all counts for a second SOME
if(desubset_diff(ml,offset,argCount,indexA,countsA))return;}if(argCount!==2){TRACE(' - did not have 2 args, bailing for now');pc+=SIZEOF_C+argCount*2;return;}// For the remainder, these are NEQ cuts (diff[2])
var indexB=readIndex(ml,offset+OFFSET_C_B);var countsB=getCounts(bounty,indexB);TRACE(' - diff:',indexA,'!=',indexB,'::',domain__debug(getDomain(indexA,true)),'!=',domain__debug(getDomain(indexB,true)));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));TRACE('  - counts:',countsA,countsB,', meta:',bounty__debugMeta(bounty,indexA),bounty__debugMeta(bounty,indexB));if(indexA===indexB){TRACE(' - index A == B, redirecting to minimizer');requestAnotherCycle=true;return;}if(countsA===1){return leaf_diff_pair(ml,offset,indexA,indexB,indexA,indexB);}if(countsB===1){return leaf_diff_pair(ml,offset,indexB,indexA,indexA,indexB);}var TRICK_INV_DIFF_FLAGS=BOUNTY_FLAG_LTE_LHS|BOUNTY_FLAG_LTE_RHS|BOUNTY_FLAG_SOME|BOUNTY_FLAG_NALL|BOUNTY_FLAG_IMP_LHS|BOUNTY_FLAG_IMP_RHS;if(countsA>1&&countsA<=BOUNTY_MAX_OFFSETS_TO_TRACK){var metaA=getMeta(bounty,indexA);// Check if it has any targeted ops, then check if it has no other stuff
var hasGoodOps=(metaA&TRICK_INV_DIFF_FLAGS)>0;var hasBadOps=(metaA|TRICK_INV_DIFF_FLAGS|BOUNTY_FLAG_DIFF)^(TRICK_INV_DIFF_FLAGS|BOUNTY_FLAG_DIFF);TRACE('  - has good:',hasGoodOps,', hasBad:',hasBadOps);// TODO: why are we checking diff here? shouldnt that have been done above? and why not checking that below?
if(hasFlags(metaA,BOUNTY_FLAG_DIFF)&&hasGoodOps&&!hasBadOps){if(trick_diff_elimination(offset,indexA,countsA,indexB))return;}if(hasFlags(metaA,BOUNTY_FLAG_DIFF|BOUNTY_FLAG_XOR)){if(trick_diff_xor(ml,offset,indexA,countsA,indexB))return;}if(trick_diff_alias(indexA,indexB,countsA))return;}if(countsB>1&&countsB<=BOUNTY_MAX_OFFSETS_TO_TRACK){var metaB=getMeta(bounty,indexB);// First remove the booly flag, then check if it has any targeted ops, then check if it has no other stuff
var _hasGoodOps=(metaB&TRICK_INV_DIFF_FLAGS)>0;var _hasBadOps=(metaB|TRICK_INV_DIFF_FLAGS|BOUNTY_FLAG_DIFF)^(TRICK_INV_DIFF_FLAGS|BOUNTY_FLAG_DIFF);TRACE('  - has good:',_hasGoodOps,', hasBad:',_hasBadOps);if(_hasGoodOps&&!_hasBadOps){if(trick_diff_elimination(offset,indexB,countsB,indexA))return;}if(hasFlags(metaB,BOUNTY_FLAG_DIFF|BOUNTY_FLAG_XOR)){if(trick_diff_xor(ml,offset,indexB,countsB,indexA))return;}if(trick_diff_alias(indexB,indexA,countsB))return;var A=getDomain(indexA,true);var B=getDomain(indexB,true);if(domain_isBoolyPair(A)&&A===B){TRACE(' - A and B are booly pair and equal so turn this DIFF into a XOR');TRACE_MORPH('A:[00xx] != B:[00xx]','A ^ B');ml_enc8(ml,offset,ML_XOR);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();return;}}TRACE(' - cut_diff changed nothing');pc+=SIZEOF_C_2;}function cut_imp(ml,offset){var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);var A=getDomain(indexA,true);var B=getDomain(indexB,true);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);TRACE(' ! cut_imp;',indexA,'->',indexB,', ',domain__debug(A),'->',domain__debug(B));TRACE('  - counts:',countsA,'->',countsB,', meta:',bounty__debugMeta(bounty,indexA),'->',bounty__debugMeta(bounty,indexB));if(indexA===indexB){TRACE(' - index A == B, redirecting to minimizer');requestAnotherCycle=true;return;}if(!domain_isBooly(A)||domain_hasNoZero(B)){TRACE(' - this imp is already solved, bouncing back to minimizer');requestAnotherCycle=true;return false;}if(countsA===1){return leaf_imp(ml,offset,indexA,indexB,true);}if(countsB===1){return leaf_imp(ml,offset,indexA,indexB,false);}if(countsA>0){var metaA=getMeta(bounty,indexA);ASSERT(metaA&BOUNTY_FLAG_IMP_LHS,'should be');if(metaA===BOUNTY_FLAG_IMP_LHS){if(trick_only_implhs_leaf(ml,indexA,countsA))return;}if(metaA===BOUNTY_FLAG_NALL||metaA===(BOUNTY_FLAG_NALL|BOUNTY_FLAG_IMP_LHS)){if(trick_implhs_nall_leaf(ml,indexA))return;}if(countsA===2){if(metaA===(BOUNTY_FLAG_IMP_LHS|BOUNTY_FLAG_SOME)){if(trick_implhs_some_leaf(ml,offset,indexA,countsA))return;}}if(hasFlags(metaA,BOUNTY_FLAG_ISALL_RESULT)){// This trick has isall subsume the lte, so no need for R to be leaf
if(trick_implhs_isall_2shared(ml,offset,indexA,countsA))return;// This trick requires R to be leaf
if(countsA===2){if(trick_isall_implhs_1shared(ml,offset,indexA,countsA))return;}}if(countsA>=3){if(metaA===(BOUNTY_FLAG_SOME|BOUNTY_FLAG_NALL|BOUNTY_FLAG_IMP_LHS)){if(trick_implhs_nalls_some(indexA,countsA))return;}if(metaA===(BOUNTY_FLAG_SOME|BOUNTY_FLAG_NALL|BOUNTY_FLAG_IMP_LHS|BOUNTY_FLAG_IMP_RHS)){if(trick_impboth_nall_some(indexA,countsA))return;}}}if(domain_isBool(A)&&domain_isBool(B)){if(countsB===2){var metaB=getMeta(bounty,indexB,true);// Keep booly flags
if(metaB===(BOUNTY_FLAG_IMP_RHS|BOUNTY_FLAG_ISALL_RESULT)){if(trick_imprhs_isall_entry(indexB,offset,countsB,indexA))return;}}}TRACE(' - cut_imp did nothing');pc+=SIZEOF_C_2;}function cut_isall(ml,offset){var argCount=ml_dec16(ml,offset+1);var argsOffset=offset+SIZEOF_C;var opSize=SIZEOF_C+argCount*2+2;var indexR=readIndex(ml,argsOffset+argCount*2);var countsR=getCounts(bounty,indexR);TRACE(' ! cut_isall; R=',indexR,', counts:',countsR,', metaR:',bounty__debugMeta(bounty,indexR));ASSERT(!countsR||!domain_isSolved(getDomain(indexR,true)),'if it has counts it shouldnt be solved',countsR,indexR,domain__debug(getDomain(indexR,true)));if(countsR>0&&countsR<BOUNTY_MAX_OFFSETS_TO_TRACK){if(countsR===1){// When R is a leaf, the isall args are not bound by it nor the reifier so they are free
return leaf_isall(ml,offset,argCount,indexR);}var metaR=getMeta(bounty,indexR);if(metaR===(BOUNTY_FLAG_ISALL_RESULT|BOUNTY_FLAG_ISALL_ARG)){if(leaf_isall_arg_result(ml,indexR,countsR))return;}if(countsR===2){if(metaR===(BOUNTY_FLAG_NALL|BOUNTY_FLAG_ISALL_RESULT)){if(trick_isall_nall_2shared(ml,indexR,offset,countsR))return;}}if(metaR===(BOUNTY_FLAG_NALL|BOUNTY_FLAG_ISALL_RESULT)){if(trick_isall_nall_1shared(ml,indexR,offset,countsR))return;}}TRACE('   cut_isall changed nothing');pc+=opSize;}function cut_isdiff(ml,offset){var argCount=ml_dec16(ml,offset+1);var indexR=readIndex(ml,offset+SIZEOF_C+argCount*2);TRACE(' ! cut_isdiff; ',indexR,'::',domain__debug(getDomain(indexR,true)),', args:',argCount);if(argCount!==2){TRACE(' - argCount=',argCount,', bailing because it is not 2');pc=offset+SIZEOF_C+argCount*2+2;return;}var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);var countsR=getCounts(bounty,indexR);TRACE(' -',indexR,'=',indexA,'!=?',indexB,'::',domain__debug(getDomain(indexR,true)),'=',domain__debug(getDomain(indexA,true)),'!=?',domain__debug(getDomain(indexB,true)));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));ASSERT(!countsR||!domain_isSolved(getDomain(indexR,true)),'if it has counts it shouldnt be solved',countsR,indexR,domain__debug(getDomain(indexR,true)));TRACE('  - counts:',countsR,countsA,countsB,', meta:',bounty__debugMeta(bounty,indexR),'=',bounty__debugMeta(bounty,indexA),'!=?',bounty__debugMeta(bounty,indexB));if(countsR===1){return leaf_isdiff(ml,offset,indexA,indexB,indexR,indexR);}if(countsA===1){ASSERT(!domain_isSolved(getDomain(indexA,true)),'A cannot be solved (bounty ignores constants so count would be 0)');if(canCutIsdiffForArg(indexA,indexB,indexR)){return leaf_isdiff(ml,offset,indexA,indexB,indexR,indexA);}}if(countsB===1){// Not covered, kept here just in case the above assertion doesnt hold in prod
ASSERT(!domain_isSolved(getDomain(indexB,true)),'B cannot be solved (bounty ignores constants so count would be 0)');if(canCutIsdiffForArg(indexB,indexA,indexR)){return leaf_isdiff(ml,offset,indexA,indexB,indexR,indexB);}}var R=getDomain(indexR,true);var A=getDomain(indexA,true);var B=getDomain(indexB,true);if(domain_isBoolyPair(R)){if(domain_isBoolyPair(A)&&domain_isSolved(B)){// R:[00yy] = A:[00xx] !=? 0/x
if(domain_isZero(B)){TRACE_MORPH('R = A !=? 0','!(R ^ A)');ml_cr2c2(ml,offset,2,ML_XNOR,indexA,indexR);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();return;}if(domain_max(A)===domain_getValue(B)){// Must confirm A contains B because it may in some edge cases not
TRACE_MORPH('R = A:[00xx] !=? x','R ^ A');ml_cr2c2(ml,offset,2,ML_XOR,indexA,indexR);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();return;}}if(domain_isSolved(A)&&domain_isBoolyPair(B)){// R:[00yy] = 0/x !=? A:[00xx]
if(domain_isZero(A)){TRACE_MORPH('R = 0 !=? B','!(R ^ B)');ml_cr2c2(ml,offset,2,ML_XNOR,indexB,indexR);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();return;}if(domain_max(B)===domain_getValue(A)){// Must confirm B contains A because it may in some edge cases not
TRACE_MORPH('R = x !=? B:[00xx]','R ^ B');ml_cr2c2(ml,offset,2,ML_XOR,indexB,indexR);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();return;}}}TRACE(' - cut_isdiff changed nothing');pc=offset+SIZEOF_CR_2;}function canCutIsdiffForArg(indexL,indexO,indexR){TRACE('   - canCutIsdiffForArg;',indexL,indexO,indexR,'->',domain__debug(getDomain(indexR,true)),'=',domain__debug(getDomain(indexL,true)),'!=?',domain__debug(getDomain(indexO,true)));// An isdiff with 2 args can only be leaf-cut on an arg if the leaf can represent all outcomes
// so if C is solved, solve as SAME or DIFF.
// otherwise make sure the leaf contains all vars of the other var and at least one var that's not in there
// as long as that's impossible we can't cut it without implicitly forcing vars
// first check whether R is booly-solved, this would mean fewer values to check
var R=getDomain(indexR,true);if(domain_hasNoZero(R)){TRACE('    - R=0 and size(L)>2 so cuttable');// L contains at least two values so regardless of the state of O, L can fulfill !=
ASSERT(domain_size(L)>=2,'see?');return true;}// R=1 or R=booly is more involved because we at least
// need to know whether L contains all values in O
var L=getDomain(indexL,true);var O=getDomain(indexO,true);var LO=domain_intersection(L,O);// <-- this tells us that
TRACE('    - LO:',domain__debug(LO));if(domain_isZero(R)){// Only cut if we are certain L can represent eq in any way O solves
if(!LO){TRACE('    - R>=1 and A contains no value in B so reject');// No values in L and O match so reject
setDomain(indexL,domain_createEmpty(),false,true);return false;}if(LO===O){TRACE('    - R>=1 and A contains all values in B so cuttable');// This means L contains all values in O (and maybe more, dont care)
// which means L can uphold the eq for any value of O
return true;}TRACE('    - R>=1 and A contains some but not all B so not cuttable, yet');// There's no guarantee O solves to a value in L so we cant cut safely
return true;}TRACE('    - R unresolved, cuttable if L contains all values in O and then some;',LO===O,LO!==L,'so:',LO===O&&LO!==L);// We dont know R so L should contain all values in O (LO==O) and at least
// one value not in O (LO != O), to consider this a safe cut. otherwise dont.
return LO===O&&LO!==L;}function cut_islt(ml,offset){var indexA=readIndex(ml,offset+1);var indexB=readIndex(ml,offset+3);var indexR=readIndex(ml,offset+5);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);var countsR=getCounts(bounty,indexR);TRACE(' ! cut_islt; ',indexR,'=',indexA,'<?',indexB,'::',domain__debug(getDomain(indexR,true)),'=',domain__debug(getDomain(indexA,true)),'<?',domain__debug(getDomain(indexB,true)));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));ASSERT(!countsR||!domain_isSolved(getDomain(indexR,true)),'if it has counts it shouldnt be solved',countsR,indexR,domain__debug(getDomain(indexR,true)));TRACE('  - counts:',countsR,countsA,countsB,', meta:',bounty__debugMeta(bounty,indexR),'=',bounty__debugMeta(bounty,indexA),'<?',bounty__debugMeta(bounty,indexB));if(countsR===1){return leaf_islt(ml,offset,indexA,indexB,indexR,indexR);}if(countsA===1){if(canCutIsltForArg(indexA,indexB,indexR,indexA,indexB)){return leaf_islt(ml,offset,indexA,indexB,indexR,indexA);}}if(countsB===1){if(canCutIsltForArg(indexB,indexA,indexR,indexA,indexB)){return leaf_islt(ml,offset,indexA,indexB,indexR,indexB);}}TRACE(' - cut_islt changed nothing');pc=offset+SIZEOF_VVV;}function canCutIsltForArg(indexL,indexO,indexR,indexA,indexB){TRACE('   - canCutIsltForArg;',indexL,indexO,indexR,'->',domain__debug(getDomain(indexR,true)),'=',domain__debug(getDomain(indexA,true)),'<?',domain__debug(getDomain(indexB,true)));// An islt can only be leaf-cut on an arg if the leaf can represent all outcomes
// so if C is solved, solve as SAME or DIFF.
// otherwise make sure the leaf contains all vars of the other var and at least one var that's not in there
// as long as that's impossible we can't cut it without implicitly forcing vars
// keep in mind A and B are ordered and cant be swapped
// first check whether R is booly-solved, this would mean fewer values to check
var A=getDomain(indexA,true);var B=getDomain(indexB,true);var R=getDomain(indexR,true);if(domain_hasNoZero(R)){TRACE('   - R>0');// If L is A, O must have at least one value below min(B). otherwise it must have at least one value > max(A).
if(indexL===indexA)return domain_min(A)<domain_min(B);return domain_max(B)>domain_max(A);}if(domain_isZero(R)){TRACE('   - R=0');// If L is A, O must have at least one value >= min(B). otherwise it must have at least one value <= max(A).
if(indexL===indexA)return domain_min(A)>=domain_min(B);return domain_max(B)<=domain_max(A);}// R unresolved. O must have at least both values to represent R=0 and R>=1
if(indexL===indexA){TRACE('   - R unresolved, L=A',domain_min(A)<domain_min(B),domain_max(A)>=domain_max(B));// L must contain a value < min(B) and a value >= max(B)
return domain_min(A)<domain_min(B)&&domain_max(A)>=domain_max(B);}TRACE('   - R unresolved, L=B',domain_max(B),'>',domain_max(A),'->',domain_max(B)>domain_max(A),domain_min(B),'<=',domain_min(A),'->',domain_min(B)<=domain_min(A));// L is B, L must contain one value above max(A) and one value <= min(A)
return domain_max(B)>domain_max(A)&&domain_min(B)<=domain_min(A);}function cut_islte(ml,offset){var indexA=readIndex(ml,offset+1);var indexB=readIndex(ml,offset+3);var indexR=readIndex(ml,offset+5);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);var countsR=getCounts(bounty,indexR);TRACE(' ! cut_islte; ',indexR,'=',indexA,'<=?',indexB,'::',domain__debug(getDomain(indexR,true)),'=',domain__debug(getDomain(indexA,true)),'<=?',domain__debug(getDomain(indexB,true)));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));ASSERT(!countsR||!domain_isSolved(getDomain(indexR,true)),'if it has counts it shouldnt be solved',countsR,indexR,domain__debug(getDomain(indexR,true)));TRACE('  - counts:',countsR,countsA,countsB,', meta:',bounty__debugMeta(bounty,indexR),'=',bounty__debugMeta(bounty,indexA),'<=?',bounty__debugMeta(bounty,indexB));var R=getDomain(indexR,true);if(!domain_isBooly(R)){TRACE(' - R is already booly solved, requesting another minifier sweep, bailing');requestAnotherCycle=true;return;}if(countsR===1){return leaf_islte(ml,offset,indexA,indexB,indexR,indexR);}var A=getDomain(indexA,true);var B=getDomain(indexB,true);if(countsA===1){if(canCutIslteForArg(indexA,indexB,indexA,indexB,A,B)){return leaf_islte(ml,offset,indexA,indexB,indexR,indexA);}}if(countsB===1){if(canCutIslteForArg(indexB,indexA,indexA,indexB,A,B)){return leaf_islte(ml,offset,indexA,indexB,indexR,indexB);}}if(countsR>0&&countsR<BOUNTY_MAX_OFFSETS_TO_TRACK){if(domain_isSolved(A)){// R = x <=? B
var metaR=getMeta(bounty,indexR);if(hasFlags(metaR,BOUNTY_FLAG_IMP_RHS)){var metaB=getMeta(bounty,indexB);if(hasFlags(metaB,BOUNTY_FLAG_IMP_LHS)){if(trick_imp_islte_c_v(offset,indexR,indexA,indexB,countsR))return;}}}if(domain_isSolved(B)){// R = A <=? x
var _metaR=getMeta(bounty,indexR);if(hasFlags(_metaR,BOUNTY_FLAG_IMP_RHS)){var metaA=getMeta(bounty,indexA);if(hasFlags(metaA,BOUNTY_FLAG_IMP_LHS)){if(trick_imp_islte_v_c(offset,indexR,indexA,indexB,countsR))return;}}}}TRACE(' - cut_islte changed nothing');pc=offset+SIZEOF_VVV;}function canCutIslteForArg(indexL,indexO,indexA,indexB,A,B){TRACE('   - canCutIslteForArg;',indexL,indexO,domain__debug(getDomain(indexA,true)),'<=?',domain__debug(getDomain(indexB,true)));// An islte can only be leaf-cut on an arg if the leaf can represent all outcomes
// so if C is solved, solve as SAME or DIFF.
// otherwise make sure the leaf contains all vars of the other var and at least one var that's not in there
// as long as that's impossible we can't cut it without implicitly forcing vars
// keep in mind A and B are ordered and cant be swapped
// R unresolved. O must have at least both values to represent R=0 and R>=1
if(indexL===indexA){TRACE('   - L=A',domain_min(A)<=domain_min(B),domain_max(A)>domain_max(B));// L must contain a value <= min(B) and a value > max(B)
return domain_min(A)<=domain_min(B)&&domain_max(A)>domain_max(B);}TRACE('   - L=B',domain_max(B),'>=',domain_max(A),'->',domain_max(B)>=domain_max(A),domain_min(B),'<',domain_min(A),'->',domain_min(B)<domain_min(A));// L is B, L must contain one value gte max(A) and one value below min(A)
return domain_max(B)>=domain_max(A)&&domain_min(B)<domain_min(A);}function cut_isnall(ml,offset){var argCount=ml_dec16(ml,offset+1);var argsOffset=offset+SIZEOF_C;var opSize=SIZEOF_C+argCount*2+2;var indexR=readIndex(ml,argsOffset+argCount*2);var countsR=getCounts(bounty,indexR);TRACE(' ! cut_isnall; R=',indexR);ASSERT(!countsR||!domain_isSolved(getDomain(indexR,true)),'if it has counts it shouldnt be solved',countsR,indexR,domain__debug(getDomain(indexR,true)));if(countsR===1){return leaf_isnall(ml,offset,argCount,indexR,countsR);}pc+=opSize;}function cut_issame(ml,offset){var argCount=ml_dec16(ml,offset+1);TRACE(' ! cut_issame');if(argCount!==2){TRACE(' - argCount != 2 so bailing, for now');pc=offset+SIZEOF_C+argCount*2+2;return;}var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);var indexR=readIndex(ml,offset+OFFSET_C_C);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);var countsR=getCounts(bounty,indexR);TRACE(' - cut_issame; ',indexR,'=',indexA,'==?',indexB,'::',domain__debug(getDomain(indexR,true)),'=',domain__debug(getDomain(indexA,true)),'==?',domain__debug(getDomain(indexB,true)));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));ASSERT(!countsR||!domain_isSolved(getDomain(indexR,true)),'if it has counts it shouldnt be solved',countsR,indexR,domain__debug(getDomain(indexR,true)));TRACE('  - counts:',countsR,countsA,countsB,', meta:',bounty__debugMeta(bounty,indexR),'=',bounty__debugMeta(bounty,indexA),'==?',bounty__debugMeta(bounty,indexB));if(countsR===1){return leaf_issame(ml,offset,indexA,indexB,indexR,indexR);}if(countsA===1){ASSERT(!domain_isSolved(getDomain(indexA,true)),'A cannot be solved (bounty ignores constants so count would be 0)');if(canCutIssameForArg(indexA,indexB,indexR)){return leaf_issame(ml,offset,indexA,indexB,indexR,indexA);}}if(countsB===1){// Not covered, kept here just in case the above assertion doesnt hold in prod
ASSERT(!domain_isSolved(getDomain(indexB,true)),'B cannot be solved (bounty ignores constants so count would be 0)');if(canCutIssameForArg(indexB,indexA,indexR)){return leaf_issame(ml,offset,indexA,indexB,indexR,indexB);}}TRACE(' - no change from cut_issame');ASSERT(ml_dec16(ml,offset+1)===2,'should have 2 args');pc=offset+SIZEOF_CR_2;}function canCutIssameForArg(indexL,indexO,indexR){TRACE('   - canCutIssameForArg;',indexL,indexO,indexR,'->',domain__debug(getDomain(indexR,true)),'=',domain__debug(getDomain(indexL,true)),'==?',domain__debug(getDomain(indexO,true)));// An issame can only be leaf-cut on an arg if the leaf can represent all outcomes
// so if C is solved, solve as SAME or DIFF.
// otherwise make sure the leaf contains all vars of the other var and at least one var that's not in there
// as long as that's impossible we can't cut it without implicitly forcing vars
// first check whether R is booly-solved, this would mean fewer values to check
var R=getDomain(indexR,true);if(domain_isZero(R)){TRACE('    - R=0 and size(L)>2 so cuttable');// L contains at least two values so regardless of the state of O, L can fulfill !=
ASSERT(domain_size(L)>=2,'see?');return true;}// R=1 or R=booly is more involved because we at least
// need to know whether L contains all values in O
var L=getDomain(indexL,true);var O=getDomain(indexO,true);var LO=domain_intersection(L,O);// <-- this tells us that
TRACE('    - LO:',domain__debug(LO));if(domain_hasNoZero(R)){// Only cut if we are certain L can represent eq in any way O solves
if(!LO){TRACE('    - R>=1 and A contains no value in B so reject');// No values in L and O match so reject
setDomain(indexL,domain_createEmpty(),false,true);return false;}if(LO===O){TRACE('    - R>=1 and A contains all values in B so cuttable');// This means L contains all values in O (and maybe more, dont care)
// which means L can uphold the eq for any value of O
return true;}TRACE('    - R>=1 and A contains some but not all B so not cuttable, yet');// There's no guarantee O solves to a value in L so we cant cut safely
return true;}TRACE('    - R unresolved, cuttable if L contains all values in O and then some;',LO===O,LO!==L,'so:',LO===O&&LO!==L);// We dont know R so L should contain all values in O (LO==O) and at least
// one value not in O (LO != O), to consider this a safe cut. otherwise dont.
return LO===O&&LO!==L;}function cut_issome(ml,offset){var argCount=ml_dec16(ml,offset+1);var argsOffset=offset+SIZEOF_C;var opSize=SIZEOF_C+argCount*2+2;var indexR=readIndex(ml,argsOffset+argCount*2);var countsR=getCounts(bounty,indexR);TRACE(' ! cut_issome; R=',indexR);if(countsR===1){return leaf_issome(ml,offset,indexR,argCount);}for(var i=0;i<argCount;++i){var index=readIndex(ml,offset+SIZEOF_C+i*2);var A=getDomain(index,true);if(domain_isZero(A)){TRACE(' - some has zeroes, requesting minimizer to remove them');requestAnotherCycle=true;// Minimizer should eliminate these
break;}}TRACE(' - cut_issome did not change anything');pc+=opSize;}function cut_lt(ml,offset){var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);TRACE(' ! cut_lt; ',indexA,'<',indexB,'::',domain__debug(getDomain(indexA,true)),'<',domain__debug(getDomain(indexB,true)));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));TRACE('  - counts:',countsA,countsB,', meta:',bounty__debugMeta(bounty,indexA),'<',bounty__debugMeta(bounty,indexB));if(indexA===indexB){TRACE(' - index A == B, redirecting to minimizer');requestAnotherCycle=true;return;}if(countsA===1){return leaf_lt(ml,offset,indexA,indexB,'lhs');}if(countsB===1){return leaf_lt(ml,offset,indexA,indexB,'rhs');}TRACE(' - cut_lt did not change anything');pc+=SIZEOF_C_2;}function cut_lte(ml,offset){var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);TRACE(' ! cut_lte; ',indexA,'<=',indexB,'::',domain__debug(getDomain(indexA,true)),'<=',domain__debug(getDomain(indexB,true)));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));TRACE('  - counts:',countsA,'<=',countsB,', meta:',bounty__debugMeta(bounty,indexA),'<=',bounty__debugMeta(bounty,indexB));if(indexA===indexB){TRACE(' - index A == B, redirecting to minimizer');requestAnotherCycle=true;return;}if(countsA===1){if(leaf_lte(ml,offset,indexA,indexB,true))return;}if(countsB===1){if(leaf_lte(ml,offset,indexA,indexB,false))return;}if(countsA>0){var metaA=getMeta(bounty,indexA);if(metaA===BOUNTY_FLAG_NALL||metaA===(BOUNTY_FLAG_NALL|BOUNTY_FLAG_LTE_LHS)){if(trick_ltelhs_nall_leaf(ml,indexA,countsA))return;}if(metaA===BOUNTY_FLAG_LTE_LHS){if(trick_only_ltelhs_leaf(ml,indexA,countsA))return;}if(countsA===2){if(metaA===(BOUNTY_FLAG_LTE_LHS|BOUNTY_FLAG_SOME)){if(trick_ltelhs_some_leaf(ml,offset,indexA,countsA))return;}}if(countsA>=3){if(metaA===(BOUNTY_FLAG_SOME|BOUNTY_FLAG_NALL|BOUNTY_FLAG_LTE_LHS)){if(trick_ltelhs_nalls_some(indexA,countsA))return;}if(metaA===(BOUNTY_FLAG_SOME|BOUNTY_FLAG_NALL|BOUNTY_FLAG_LTE_LHS|BOUNTY_FLAG_LTE_RHS)){if(trick_lteboth_nall_some(indexA,countsA))return;}}if(hasFlags(metaA,BOUNTY_FLAG_ISALL_RESULT)){// In this trick one constraint subsumes the other so no need for A being a leaf
if(trick_isall_ltelhs_2shared(ml,offset,indexA,countsA))return;// In this trick A needs to be a leaf
if(countsA===2){if(trick_isall_ltelhs_1shared(ml,offset,indexA,countsA))return;}}}if(countsB===2){var metaB=getMeta(bounty,indexB);if(metaB===(BOUNTY_FLAG_LTE_RHS|BOUNTY_FLAG_ISALL_RESULT)){if(trick_isall_lterhs_entry(indexB,offset,countsB))return;}if(metaB===(BOUNTY_FLAG_LTE_RHS|BOUNTY_FLAG_ISSAME_RESULT)){if(trick_issame_lterhs(indexB,offset,countsB,indexA))return;}}TRACE(' - cut_lte changed nothing');pc+=SIZEOF_C_2;}function cut_nall(ml,offset){var argCount=ml_dec16(ml,offset+1);TRACE(' ! cut_nall;',argCount,'args');var indexA=readIndex(ml,offset+OFFSET_C_A);var countsA=getCounts(bounty,indexA);if(countsA>1&&countsA<BOUNTY_MAX_OFFSETS_TO_TRACK){// Search all counts for a second SOME
if(desubset_nall(ml,offset,argCount,indexA,countsA))return;}if(argCount===2){if(readIndex(ml,offset+OFFSET_C_A)===readIndex(ml,offset+OFFSET_C_B)){TRACE(' - argcount=2 and A==B, requesting minimzer cycle');requestAnotherCycle=true;return;}}for(var i=0;i<argCount;++i){var index=readIndex(ml,offset+SIZEOF_C+i*2);var counts=getCounts(bounty,index);if(counts>0){var meta=getMeta(bounty,index);if(meta===BOUNTY_FLAG_NALL){// Var is only used in nalls. eliminate them all and defer the var
if(trickNallOnly(index,counts))return true;}}}TRACE(' - cut_nall did not change anything');pc+=SIZEOF_C+argCount*2;}function cut_some(ml,offset){var argCount=ml_dec16(ml,pc+1);TRACE(' ! cut_some;',argCount,'args');var indexA=readIndex(ml,offset+OFFSET_C_A);var countsA=getCounts(bounty,indexA);if(countsA>1&&countsA<BOUNTY_MAX_OFFSETS_TO_TRACK){// Search all counts for a second SOME
if(desubset_some(ml,offset,argCount,indexA,countsA))return;}if(argCount===2){var indexB=readIndex(ml,offset+OFFSET_C_B);if(indexA===indexB){TRACE(' - argcount=2 and A==B, requesting minimzer cycle');requestAnotherCycle=true;return;}if(countsA===1){leaf_some_2(ml,offset,indexA,indexB,indexA,indexB);return;}var countsB=getCounts(bounty,indexB);if(countsB===1){leaf_some_2(ml,offset,indexB,indexA,indexA,indexB);return;}}var hasZero=false;for(var i=0;i<argCount;++i){var index=readIndex(ml,offset+SIZEOF_C+i*2);var counts=getCounts(bounty,index);if(counts>0){var meta=getMeta(bounty,index);if(meta===BOUNTY_FLAG_SOME){// Var is only used in SOMEs. eliminate them all and defer the var
if(trickSomeOnly(index,counts))return true;}}var A=getDomain(index,true);if(domain_isZero(A)){hasZero=true;}}if(hasZero){TRACE(' - some has zeroes, requesting minimizer to remove them');requestAnotherCycle=true;// Minimizer should eliminate these
}TRACE(' - cut_some changed nothing');pc+=SIZEOF_C+argCount*2;}function cut_sum(ml,offset){var argCount=ml_dec16(ml,offset+1);var argsOffset=offset+SIZEOF_C;var opSize=SIZEOF_C+argCount*2+2;var indexR=readIndex(ml,argsOffset+argCount*2);var R=getDomain(indexR,true);var countsR=getCounts(bounty,indexR);TRACE(' ! cut_sum;');TRACE('  - index R:',indexR,', domain:',domain__debug(R),', argCount:',argCount,',counts R:',countsR,', meta R:',bounty__debugMeta(bounty,indexR));ASSERT(!countsR||!domain_isSolved(getDomain(indexR,true)),'if it has counts it shouldnt be solved',countsR,indexR,domain__debug(getDomain(indexR,true)));var RisBoolyPair=domain_isBoolyPair(R);// Collect meta data on the args of this sum
// TODO: should we have a bounty for both constraints and vars?
var allSumArgsBool=true;// All args [01]? used later
var allSumArgsBoolyPairs=true;// All args have a zero and one nonzero value?
var sum=domain_createValue(0);var argsMinSum=0;var argsMaxSum=0;var constantValue=0;// Allow up to one constant larger than 0
var constantArgIndex=-1;var multiConstants=false;for(var i=0;i<argCount;++i){var index=readIndex(ml,argsOffset+i*2);var domain=getDomain(index,true);var minValue=domain_min(domain);var maxValue=domain_max(domain);sum=domain_plus(sum,domain);argsMinSum+=minValue;argsMaxSum+=maxValue;// Let nonBoolNonSolvedDomain = maxValue > 1;
if(minValue===maxValue){multiConstants=constantArgIndex>=0;constantValue=minValue;constantArgIndex=i;}else{if(!domain_isBoolyPair(domain))allSumArgsBoolyPairs=false;if(!domain_isBool(domain))allSumArgsBool=false;}}TRACE(' - sum args; min:',argsMinSum,', max:',argsMaxSum,', constantValue:',constantValue,', constant pos:',constantArgIndex,', sum:',domain__debug(sum));if(multiConstants){TRACE(' - multiple constants detected, bailing so minimizer can correct this');return;}// [0 0 23 23] = [0 1] + [0 0 2 2] + [0 0 20 20]   ->    R = all?(A B C)
if(RisBoolyPair&&allSumArgsBoolyPairs){// This trick is irrelevant of leaf status (this could be part of minimizer)
TRACE(' - R is a booly and all the args are booly too, checking whether',domain_max(R),'===',argsMaxSum);ASSERT(argsMinSum===0,'if all are booly argsMinSum should be zero');if(domain_max(R)===argsMaxSum){TRACE(' - R is',domain__debug(R),'and all the args are booly and their argsMaxSum is equal to max(R) so this is actually an isall. morphing sum to isall');ml_enc8(ml,offset,ML_ISALL);return;}}// Note: we cant simply eliminate leaf vars because they still constrain
// the allowed distance between the other variables and if you
// eliminate this constraint, that limitation is not enforced anymore.
// so thread carefully.
if(countsR===1){// R can only be eliminated if all possible additions between A and B occur in it
// because in that case it no longer serves as a constraint to force certain distance(s)
if(sum===domain_intersection(R,sum)){// All possible outcomes of summing any element in the sum args are part of R so
// R is a leaf and the args aren't bound by it so we can safely remove the sum
return leaf_sum_result(ml,offset,argCount,indexR);}// If R is [0, n-1] and all n args are [0, 1] then rewrite to a NALL
if(allSumArgsBool&&R===domain_createRange(0,argCount-1)){return trick_sum_to_nall(ml,offset,argCount,indexR);}// If R is [1, n] and all n args are [0, 1] then rewrite to a SOME
if(allSumArgsBool&&R===domain_createRange(1,argCount)){return trick_some_sum(ml,offset,argCount,indexR);}}if(countsR>=2){var metaR=getMeta(bounty,indexR);ASSERT(hasFlags(metaR,BOUNTY_FLAG_SUM_RESULT),'per definition because this is the R in a sum');// TODO: cant we also do this with counts>2 when R is a bool when ignoring the sum?
// TOFIX: confirm whether we need allSumArgsBool here, or whether we can lax it a little
if(allSumArgsBoolyPairs&&countsR===2){// We already confirmed that R is for a sum, so we can strictly compare the meta flags
// (R = sum(A B C) & (S = R==?3)        ->    S = all?(A B C)
// (R = sum(A B C) & (S = R==?0)        ->    S = none?(A B C)
// (R = sum(A B C) & (S = R==?[0 1])    ->    S = nall?(A B C)
// (R = sum(A B C) & (S = R==?[1 2])    ->    S = some?(A B C)
if(metaR===(BOUNTY_FLAG_ISSAME_ARG|BOUNTY_FLAG_SUM_RESULT)){if(trick_issame_sum(ml,offset,indexR,countsR,argCount,sum,argsMinSum,argsMaxSum,constantValue,constantArgIndex,allSumArgsBoolyPairs))return;}// (R = sum(A B C) & (S = R!=?3)        ->    S = nall?(A B C)
// (R = sum(A B C) & (S = R!=?0)        ->    S = some?(A B C)
// (R = sum(A B C) & (S = R!=?[0 1])    ->    S = all?(A B C)
// (R = sum(A B C) & (S = R!=?[1 2])    ->    S = none?(A B C)
// if (metaR === (BOUNTY_FLAG_ISDIFF_ARG | BOUNTY_FLAG_SUM_RESULT)) {
//  if (trickSumIsdiff(ml, offset, indexR, countsR)) return;
// }
// (R = sum(A B C) & (S = R<=?0)        ->    S = none?(A B C)
// (R = sum(A B C) & (S = R<=?2)        ->    S = nall?(A B C)
// (R = sum(A B C) & (S = 1<=?R)        ->    S = some?(A B C)
// (R = sum(A B C) & (S = 3<=?R)        ->    S = all?(A B C)
if(metaR===(BOUNTY_FLAG_ISLTE_ARG|BOUNTY_FLAG_SUM_RESULT)){if(trick_islte_sum(ml,offset,indexR,countsR,argCount,argsMinSum,argsMaxSum,constantValue,constantArgIndex))return;}// (R = sum(A B C) & (S = R<?1)        ->    S = none?(A B C)
// (R = sum(A B C) & (S = R<?3)        ->    S = nall?(A B C)
// (R = sum(A B C) & (S = 0<?R)        ->    S = some?(A B C)
// (R = sum(A B C) & (S = 2<?R)        ->    S = all?(A B C)
// if (metaR === (BOUNTY_FLAG_ISLT_ARG | BOUNTY_FLAG_SUM_RESULT)) {
//  if (trickSumIslt(ml, offset, indexR, countsR)) return;
// }
}if(countsR===3&&argCount===2&&metaR===(BOUNTY_FLAG_ISSAME_ARG|BOUNTY_FLAG_SUM_RESULT)){// TODO: make generic :)
// R = sum(A B), S = R ==? 1, T = R ==? 2    ->    S = A !=? B, T = all?(A B)
if(trick_issame_issame_sum(ml,offset,indexR,countsR,sum,argCount))return;}if(countsR<BOUNTY_MAX_OFFSETS_TO_TRACK){// If R is only used as a booly and (this) sum result, the actual result is irrelevant: only zero or not zero
// in that case we only want to know whether any of its arguments are non-zero => `isSome`
// For example: (R = sum(A B C), R ^ X) -> (R = isNone?(A B C), R ^ X)
if(trick_sum_booly(ml,offset,indexR,countsR,sum,argCount))return;}}TRACE(' - cut_sum changed nothing');pc+=opSize;}function cut_xnor(ml,offset){var argCount=ml_dec16(ml,offset+1);TRACE(' ! cut_xnor;',argCount,'args');if(argCount===2){var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);TRACE(' - 2 args!',indexA,'!^',indexB,'::',domain__debug(getDomain(indexA,true)),'!^',domain__debug(getDomain(indexB,true)));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));TRACE('  - counts:',countsA,countsB,', meta:',bounty__debugMeta(bounty,indexA),'!^',bounty__debugMeta(bounty,indexB));if(indexA===indexB){TRACE(' - argcount=2 and A==B, requesting minimzer cycle');requestAnotherCycle=true;return;}if(countsA===1){return leaf_xnor(ml,offset,indexA,indexB,indexA,indexB);}if(countsB===1){return leaf_xnor(ml,offset,indexB,indexA,indexA,indexB);}// (do we care about constants here? technically the minimizer should eliminate xnors with constants... so, no?)
if(countsA>0&&countsB>0){var metaA=getMeta(bounty,indexA,true);// Keep booly flags
var metaB=getMeta(bounty,indexB,true);TRACE(' - considering whether A and B are xnor pseudo aliases;',bounty__debugMeta(bounty,indexA),'!^',bounty__debugMeta(bounty,indexB));var boolyA=!hasFlags(metaA,BOUNTY_FLAG_NOT_BOOLY);var boolyB=!hasFlags(metaB,BOUNTY_FLAG_NOT_BOOLY);TRACE(' - ',boolyA||boolyB?'yes':'no',' ->',boolyA,'||',boolyB);if(boolyA||boolyB){// We declare A and alias of B. they are both used as booly only and the xnor states that if and
// only if A is truthy then B must be truthy too. since we confirmed both are only used as booly
// their actual non-zero values are irrelevant and the rewrite is safe. the last thing to make
// sure is that the domains are updated afterwards and not synced and clobbered by the alias code.
return trick_xnor_pseudoSame(ml,offset,indexA,boolyA,indexB,boolyB);}}}TRACE(' - cut_xnor did nothing');pc+=SIZEOF_C+argCount*2;}function cut_xor(ml,offset){var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);var countsA=getCounts(bounty,indexA);var countsB=getCounts(bounty,indexB);TRACE(' ! cut_xor; ',indexA,'^',indexB,'::',domain__debug(getDomain(indexA,true)),'^',domain__debug(getDomain(indexB,true)));TRACE('  - counts:',countsA,countsB,', meta:',bounty__debugMeta(bounty,indexA),'^',bounty__debugMeta(bounty,indexB));ASSERT(!countsA||!domain_isSolved(getDomain(indexA,true)),'if it has counts it shouldnt be solved',countsA,indexA,domain__debug(getDomain(indexA,true)));ASSERT(!countsB||!domain_isSolved(getDomain(indexB,true)),'if it has counts it shouldnt be solved',countsB,indexB,domain__debug(getDomain(indexB,true)));ASSERT(ml_dec16(ml,offset+1)===2,'xor always has 2 args');if(indexA===indexB){TRACE(' - argcount=2 and A==B, requesting minimzer cycle');requestAnotherCycle=true;return;}if(countsA===1){return leaf_xor(ml,offset,indexA,indexB,indexA,indexB);}if(countsB===1){return leaf_xor(ml,offset,indexB,indexA,indexA,indexB);}var A=getDomain(indexA,true);var B=getDomain(indexB,true);if(!domain_isBooly(A)||!domain_isBooly(B)){TRACE(' / at least A or B is already booly solved. bailing so minimizer can take over.');requestAnotherCycle=true;return;}if(countsA>0&&countsB>0){var metaA=getMeta(bounty,indexA,true);// Keep booly flags
var metaB=getMeta(bounty,indexB,true);var AonlyUsedBooly=!hasFlags(metaA,BOUNTY_FLAG_NOT_BOOLY);var BonlyUsedBooly=!hasFlags(metaB,BOUNTY_FLAG_NOT_BOOLY);// Meta should only be these flags
var TRICK_INV_XOR_FLAGS=BOUNTY_FLAG_SOME|BOUNTY_FLAG_NALL|BOUNTY_FLAG_IMP_LHS|BOUNTY_FLAG_IMP_RHS|BOUNTY_FLAG_XOR;if(countsA<BOUNTY_MAX_OFFSETS_TO_TRACK){// Check for some/nall/imp/xor. if A only concerns these then we can invert those
// ops and remove the xor. Note: LTE only works when it could be an implication,
// so we can omit a check for that as those LTE's should morph into IMP eventually
TRACE('  - A; only contains good flags?',(metaA&TRICK_INV_XOR_FLAGS)===metaA);if((metaA&TRICK_INV_XOR_FLAGS)===metaA){if(trick_xor_elimination(offset,indexA,countsA,indexB))return;}if(countsA===2){if(hasFlags(metaA,BOUNTY_FLAG_ISALL_RESULT)){// R^A, R=all?(X Y Z)  ->   A=nall(X Y Z)
if(trick_isall_xor(indexA,indexB,offset,countsA,countsB))return;}if(AonlyUsedBooly&&hasFlags(metaA,BOUNTY_FLAG_ISSOME_RESULT)){// R^X, R=some?(A B C)   ->    X=none?(A B C)
if(trick_issome_xor(indexA,indexB,offset,countsA,countsB))return;}if(metaA===(BOUNTY_FLAG_XOR|BOUNTY_FLAG_SOME)){if(trick_some_xor(indexA,indexB,offset,countsA))return;}}var sB=domain_size(B);if(trick_xor_alias(indexA,indexB,countsA,B,sB,BonlyUsedBooly))return;}if(countsB<BOUNTY_MAX_OFFSETS_TO_TRACK){// Check for some/nall/imp/xor. if B only concerns these then we can invert those
// ops and remove the xor. Note: LTE only works when it could be an implication,
// so we can omit a check for that as those LTE's should morph into IMP eventually
TRACE('  - B; only contains good flags?',(metaB&TRICK_INV_XOR_FLAGS)===metaB);if(domain_isBoolyPair(B)&&(metaB&TRICK_INV_XOR_FLAGS)===metaB){if(trick_xor_elimination(offset,indexB,countsB,indexA))return;}if(countsB===2){if(hasFlags(metaB,BOUNTY_FLAG_ISALL_RESULT)){// R^B, R=all?(X Y Z)  ->   B=nall(X Y Z)
if(trick_isall_xor(indexB,indexA,offset,countsB,countsA))return;}if(BonlyUsedBooly&&hasFlags(metaB,BOUNTY_FLAG_ISSOME_RESULT)){// R^X, R=some?(A B C)   ->    X=none?(A B C)
if(trick_issome_xor(indexB,indexA,offset,countsB,countsA))return;}if(metaB===(BOUNTY_FLAG_XOR|BOUNTY_FLAG_SOME)){if(trick_some_xor(indexB,indexA,offset,countsB))return;}}var sA=domain_size(A);if(trick_xor_alias(indexB,indexA,countsB,A,sA,AonlyUsedBooly))return;}}TRACE(' / cut_xor changed nothing');pc+=SIZEOF_C_2;}// ##############
function leaf_diff_pair(ml,offset,leafIndex,otherIndex,indexA,indexB){TRACE('   - leaf_diff_pair;',leafIndex,'is a leaf var, A != B,',indexA,'!=',indexB);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_diff_pair; solving',indexA,'!=',indexB,'  ->  ',domain__debug(getDomain(indexA)),'!=',domain__debug(getDomain(indexB)));var A=getDomain(indexA);var B=getDomain(indexB);if(domain_size(A)<domain_size(B)){var v=force(indexA);setDomain(indexB,domain_removeValue(B,v));}else{var _v=force(indexB);setDomain(indexA,domain_removeValue(A,_v));}ASSERT(getDomain(indexA)!==getDomain(indexB),'D ought to have at least a value other dan v');});ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,leafIndex);bounty_markVar(bounty,otherIndex);somethingChanged();}function leaf_imp(ml,offset,indexA,indexB,leafIsA){TRACE('   - leaf_imp;',leafIsA?'A':'B','is a leaf var, A -> B;',indexA,'->',indexB);ASSERT(typeof indexA==='number','index A should be number',indexA);ASSERT(typeof indexB==='number','index B should be number',indexB);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_imp; solving',indexA,'->',indexB,'  =>  ',domain__debug(getDomain(indexA)),'->',domain__debug(getDomain(indexB)),'  =>  ',domain_max(getDomain(indexA)),'->',domain_min(getDomain(indexB)));var A=getDomain(indexA);var B=getDomain(indexB);// TODO: weigh in value dists here
if(leafIsA){TRACE(' - A was leaf; A=',domain__debug(A),'->',domain__debug(B));// (we could simply and safely set A to 0 here and skip the solvestack part completely)
if(domain_hasNoZero(B)){var nA=domain_removeValue(A,0);ASSERT(nA,'A should not be empty');if(A!==nA)setDomain(indexA,nA);}else{var _nA=domain_intersectionValue(A,0);ASSERT(_nA,'A should not be empty');if(A!==_nA)setDomain(indexA,_nA);}}else{TRACE(' - B was leaf; A=',domain__debug(A),'->',domain__debug(B));// (we could simply and safely set B to nonzero here and skip the solvestack part completely)
if(domain_hasNoZero(A)){var nB=domain_removeValue(B,0);ASSERT(nB,'B should not be empty');if(A!==nB)setDomain(indexB,nB);}else{var _nB=domain_intersectionValue(B,0);ASSERT(_nB,'B should not be empty');if(B!==_nB)setDomain(indexB,_nB);}}});ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();}function leaf_isdiff(ml,offset,indexA,indexB,indexR,indexL){TRACE('   - leaf_isdiff; index',indexL,'is a leaf var, R = A !=? B,',indexR,'=',indexA,'!=?',indexB,'  ->  ',domain__debug(getDomain(indexR)),'=',domain__debug(getDomain(indexA)),'!=?',domain__debug(getDomain(indexB)));ASSERT(ml_dec16(ml,offset+1)===2);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_isdiff');var A=getDomain(indexA);var B=getDomain(indexB);var R=getDomain(indexR);TRACE(' - leaf=',indexL,';',indexR,'=',indexA,'!=?',indexB,'  =>  ',domain__debug(R),'=',domain__debug(A),'!=?',domain__debug(B),', AB=',domain__debug(domain_intersection(A,B)));if(domain_isSolved(A)){if(domain_isSolved(B)){TRACE(' - A and B are solved, set R to reflect',domain_getValue(A),'!=',domain_getValue(B));if(A!==B)R=domain_removeValue(R,0);else R=domain_removeGtUnsafe(R,0);setDomain(indexR,R);}else if(domain_isBooly(R)){TRACE(' - A is solved but B and R arent, remove A from B and set R>0');B=domain_removeValue(B,domain_getValue(A));setDomain(indexB,B);R=domain_removeValue(R,0);setDomain(indexR,R);}else{TRACE(' - A and R are solved, set B to reflect it');if(domain_isZero(R)){TRACE(' - R=0 so A==B');setDomain(indexB,A);}else{TRACE(' - R>0 so A!=B');B=domain_removeValue(B,domain_getValue(A));setDomain(indexB,B);}}}else if(domain_isSolved(B)){if(domain_isBooly(R)){TRACE(' - B is solved but A and R are not. Remove B from A and set R>0');A=domain_removeValue(A,domain_getValue(B));setDomain(indexA,A);R=domain_removeValue(R,0);setDomain(indexR,R);}else{TRACE(' - B and R are solved but A is not. Update A to reflect R');if(domain_isZero(R)){TRACE(' - R=0 so A==B');setDomain(indexA,B);}else{TRACE(' - R>0 so A!=B');A=domain_removeValue(A,domain_getValue(B));setDomain(indexA,A);}}}else if(domain_isBooly(R)){TRACE(' - A, B, and R arent solved. force A and remove it from B (if A and B intersect) and set R>0');if(domain_intersection(A,B)!==EMPTY){B=domain_removeValue(B,force(indexA));setDomain(indexB,B);}R=domain_removeValue(R,0);setDomain(indexR,R);}else{TRACE(' - A and B arent solved but R is. update A and B to reflect R');if(domain_isZero(R)){TRACE(' - R=0 so A==B');var vA=force(indexA,domain_intersection(A,B));ASSERT(domain_intersection(B,domain_createValue(vA))!==EMPTY);B=domain_createValue(vA);setDomain(indexB,B);}else{var _vA=force(indexA);B=domain_removeValue(B,_vA);setDomain(indexB,B);}}TRACE(' - afterwards: R:'+indexR+':'+domain__debug(getDomain(indexR)),' = A:'+indexA+':'+domain__debug(getDomain(indexA)),' !=? B:'+indexB+':'+domain__debug(getDomain(indexB)),', AB=',domain__debug(domain_intersection(getDomain(indexA),getDomain(indexB))));// 3 things must hold;
// - A or B must be solved or not intersect (otherwise future reductions may violate R)
// - R must not be booly (obviously)
// - R's state must reflect whether or not A shares a value with B (which by the above should at most be one value, but that's not helpful)
ASSERT(getDomain(indexA));ASSERT(getDomain(indexB));ASSERT(getDomain(indexR));ASSERT(domain_intersection(getDomain(indexA),getDomain(indexB))===EMPTY||domain_isSolved(getDomain(indexA))||domain_isSolved(getDomain(indexB)),'at least A or B must be solved in order to ensure R always holds');ASSERT(!domain_isBooly(getDomain(indexR)),'R must not be a booly to ensure the constraint always holds');ASSERT(domain_intersection(getDomain(indexA),getDomain(indexB))===EMPTY===domain_hasNoZero(getDomain(indexR)),'R must be nonzero if A and B share no elements');});ASSERT(ml_dec16(ml,offset+1)===2,'argcount should be 2 at the moment');ml_eliminate(ml,offset,SIZEOF_CR_2);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();}function leaf_isall(ml,offset,argCount,indexR){TRACE('   - leaf_isall;',indexR,'is a leaf var, R = all?(',argCount,'x ),',indexR,'= all?(...)');var args=markAndCollectArgs(ml,offset,argCount);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_isall; ',indexR,'= isAll(',args.join(' '),')  ->  ',domain__debug(getDomain(indexR)),' = isAll(',args.map(function(index){return domain__debug(getDomain(index));}).join(' '),')');var vR=1;for(var i=0;i<argCount;++i){if(force(args[i])===0){vR=0;break;}}var oR=getDomain(indexR);var R=domain_resolveAsBooly(oR,vR);ASSERT(R,'R should be able to at least represent the solution');setDomain(indexR,R);});ml_eliminate(ml,offset,SIZEOF_C+argCount*2+2);bounty_markVar(bounty,indexR);somethingChanged();}function leaf_isall_arg_result(ml,indexR,countsR){// R is only result or arg of isall ops.
// for trick R must be result _and_ arg in _all_ the isalls
// if R is only part of `R = all?(R ...)` ops then leaf(R) and eliminate the constraint
// if R is part of `R = all?(R ...)` and `S = all?(R ...)` then leaf R and morph to imps S->A, S->B all other args
var R=getDomain(indexR,true);if(!domain_isBool(R)){TRACE(' - R is not bool, bailing');return false;}// First verify, scan, and collect
var argOnlyOffsets=[];var resultOnlyOffsets=[];var argAndResultOffsets=[];var allArgs=[];var offsets=[];for(var i=0;i<countsR;++i){var offset=bounty_getOffset(bounty,indexR,i);TRACE('    - i=',i,', offset=',offset);ASSERT(ml_dec8(ml,offset)===ML_ISALL);// Each offset could be visited twice if this trick is applied
if(offsets.indexOf(offset)<0){var argCount=ml_dec16(ml,offset+1);var resultIndex=readIndex(ml,offset+SIZEOF_C+argCount*2);var args=[];var foundAsArg=false;for(var j=0;j<argCount;++j){var index=readIndex(ml,offset+SIZEOF_C+j*2);args.push(index);if(index===indexR)foundAsArg=true;}TRACE('    - is result?',resultIndex===indexR,', is arg?',foundAsArg);ASSERT(foundAsArg||resultIndex===indexR,'R should be part of the isall as per bounty');if(resultIndex!==indexR)argOnlyOffsets.push(offset);else if(!foundAsArg)resultOnlyOffsets.push(offset);else argAndResultOffsets.push(offset);allArgs.push(args);offsets.push(offset);}}TRACE(' - collected: result only:',resultOnlyOffsets,', arg only:',argOnlyOffsets,', both result and arg:',argAndResultOffsets);// Three cases: either R was a result-only or arg-only in at least one isall, or not. yes, three cases.
if(resultOnlyOffsets.length){TRACE(' - there was at least one isall where R was the result only. cant apply this trick. bailing');return false;}ASSERT(argAndResultOffsets.length,'bounty found R to be result and arg of isall and there were no isalls where R was result only so there must be at least one isall with R being result and arg');// Two cases left: either R was result AND arg in all isalls or there was at least one isall where it was arg only
if(argOnlyOffsets.length){return _leafIsallArgResultMaybe(ml,indexR,allArgs,offsets,R,countsR,argOnlyOffsets,argAndResultOffsets);}return _leafIsallArgResultOnly(ml,indexR,allArgs,offsets,R);}function _leafIsallArgResultMaybe(ml,indexR,allArgs,offsets,R,countsR,argOnlyOffsets,argAndResultOffsets){TRACE(' - confirmed, R is only part of isall where R is result and arg or just arg and at least one of each');TRACE(' - R = all?(R ...), S = all?(R ...)    =>    S -> A, S -> B, ... for all args of the isalls');// Note: one isall contributes 2 counts, the other only 1
if(countsR!==3){TRACE(' - countsR != 3, for now we bail on this. maybe in the future we can do this.');return false;}ASSERT(argOnlyOffsets.length===1&&argAndResultOffsets.length===1,'for now');var argOnlyIsallOffset=argOnlyOffsets[0];var argOnlyIsallArgCount=ml_dec16(ml,argOnlyIsallOffset+1);var argAndResultIsallOffset=argAndResultOffsets[0];var argAndResultIsallArgCount=ml_dec16(ml,argAndResultIsallOffset+1);var indexS=readIndex(ml,argOnlyIsallOffset+SIZEOF_C+argOnlyIsallArgCount*2);if(argOnlyIsallArgCount!==2||argAndResultIsallArgCount!==2){var ok=_leafIsallArgResultExcess(ml,indexR,indexS,allArgs);if(!ok)return false;}var indexA=readIndex(ml,argOnlyIsallOffset+OFFSET_C_A);if(indexA===indexR)indexA=readIndex(ml,argOnlyIsallOffset+OFFSET_C_B);var indexB=readIndex(ml,argAndResultIsallOffset+OFFSET_C_A);if(indexB===indexR)indexB=readIndex(ml,argAndResultIsallOffset+OFFSET_C_B);TRACE_MORPH('R = all?(R A), S = all?(R B)','S -> A, S -> B');TRACE(' - indexes;',indexR,'= all?(',indexR,indexA,'),',indexS,'= all?(',indexR,indexB,')');TRACE(' - domains;',domain__debug(getDomain(indexR)),'= all?(',domain__debug(getDomain(indexR)),domain__debug(getDomain(indexA)),'),',domain__debug(getDomain(indexS)),'= all?(',domain__debug(getDomain(indexR)),indexB,')');ml_cr2c2(ml,argOnlyIsallOffset,argOnlyIsallOffset,ML_IMP,indexS,indexA);ml_cr2c2(ml,argAndResultIsallOffset,argAndResultIsallOffset,ML_IMP,indexS,indexB);solveStack.push(function(_,force,getDomain,setDomain){TRACE('_leafIsallArgResultMaybe');var R=getDomain(indexR);var nR=R;// R = R &? A
if(force(indexA)===0){TRACE(' - A is 0 so R cant be 1');nR=domain_removeGtUnsafe(nR,0);}else{// S = R &? B
var vS=force(indexS);if(vS){TRACE(' - S>0 so R must be nonzero');nR=domain_removeValue(nR,0);}else{ASSERT(vS===0);if(force(indexB)>0){TRACE(' - S=0 and B>0 so R must be zero');nR=domain_removeGtUnsafe(nR,0);}}}TRACE(' - final R:',domain__debug(nR));ASSERT(nR);if(R!==nR)setDomain(indexR,nR);});bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);bounty_markVar(bounty,indexS);somethingChanged();return true;}function _leafIsallArgResultExcess(ml,indexR,indexS,argsPerIsall){TRACE(' - _leafIsallArgResultExcess');TRACE(' - collecting excess args now; indexR:',indexR,', all args:',argsPerIsall);// Collect all args except indexR and the first arg of the first two isalls, or second if first is indexR
// we need to recycle spaces for that
var toCompile=[];for(var i=0;i<argsPerIsall.length;++i){var args=argsPerIsall[i];TRACE('   -',i,'; isall args:',args);var gotOne=i>=2;for(var j=0;j<args.length;++j){var index=args[j];TRACE('     -',j,'; index:',index,index===indexR);if(index!==indexR){if(!gotOne&&j<2){TRACE('       - skipped (compiled by caller)');// Skip the first non-R for the first two isalls
gotOne=true;}else{TRACE('       - collected');toCompile.push(index);}}}}TRACE(' - excess args to compile in recycled spaces:',toCompile);// There could potentially be no args to compile here. and that's okay.
var count=toCompile.length;if(count){TRACE(' - found',count,'extra args to compile:',toCompile);// Start by collecting count recycled spaces
var bins=ml_getRecycleOffsets(ml,0,count,SIZEOF_C_2);if(!bins){TRACE(' - Was unable to find enough free space to fit',count,'IMPs, bailing');return false;}var _i=0;while(_i<count){var currentOffset=bins.pop();ASSERT(ml_dec8(ml,currentOffset)===ML_JMP,'should only get jumps here');// Might trap a case where we clobber
var size=ml_getOpSizeSlow(ml,currentOffset);ASSERT(size>=SIZEOF_C_2,'this is what we asked for');do{var _index=toCompile[_i];TRACE('  - compiling lte:',indexS,'->',_index,'   =>    ',domain__debug(getDomain(indexS,true)),'->',domain__debug(getDomain(_index,true)));ml_any2c(ml,currentOffset,ml_getOpSizeSlow(ml,currentOffset),ML_IMP,[indexS,_index]);++_i;size-=SIZEOF_C_2;currentOffset+=SIZEOF_C_2;}while(size>=SIZEOF_C_2&&_i<count);if(process.env.NODE_ENV!=='production'){ml_validateSkeleton(ml);// Cant check earlier
}}TRACE(' - finished compiling extra args');}return true;}function _leafIsallArgResultOnly(ml,indexR,allArgs,offsets,R){TRACE(' - confirmed, all isalls have R as result _and_ arg; args:',allArgs,', offsets:',offsets);TRACE(' - R is a leaf and we eliminate all isalls associated to R');solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_isall_arg_result');ASSERT(domain_isBool(R),'R was a bool (asserted above, and as leaf, that should not have changed)');ASSERT(domain_isBool(getDomain(indexR)));// If all args besides R are set, then R can be anything. otherwise R is 0.
// need to check this for all isalls. if any one causes R to be 0 then that's that.
var allSet=true;for(var i=0,len=allArgs.length;i<len;++i){var args=allArgs[i];for(var j=0,len2=args.length;j<len2;++j){var index=args[j];if(index!==indexR){var D=getDomain(index);if(!domain_hasNoZero(D)){allSet=false;// Either it's zero or booly, either way set R to 0 and be done.
}}}if(!allSet){TRACE(' - foundAsArg an isall where not all other args were set so forcing R to 0');// Remember: R is a bool, asserted above. twice now. so this cant possibly fail. (watch it fail. sorry, future me!)
setDomain(indexR,domain_createValue(0));break;}}// Otherwise R kind of determines itself so no choice is made :)
TRACE(' - was R forced to 0?',!allSet);});TRACE(' - now marking vars and eliminating isall constraints');for(var i=0,len=offsets.length;i<len;++i){var offset=offsets[i];var args=allArgs[i];TRACE('    - i=',i,', offset=',offset,', args=',args);TRACE_MORPH('R = all?(R ...)','');ASSERT(args.length===ml_dec16(ml,offset+1),'should be able to use this shortcut (not sure whether its actually faster tho)');ml_eliminate(ml,offset,SIZEOF_C+args.length*2+2);for(var j=0,len2=args.length;j<len2;++j){TRACE('      - marking',args[j]);bounty_markVar(bounty,args[j]);}}somethingChanged();return true;}function leaf_islt(ml,offset,indexA,indexB,indexR,indexL){TRACE('   - leaf_islt;',indexL,'is a leaf var, R = A <? B,',indexR,'=',indexA,'<?',indexB,'  ->  ',domain__debug(getDomain(indexR)),'=',domain__debug(getDomain(indexA)),'<?',domain__debug(getDomain(indexB)));solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_islt');TRACE(' - leaf index=',indexL,';',indexR,'=',indexA,'<?',indexB,'  ->  ',domain__debug(getDomain(indexR)),'=',domain__debug(getDomain(indexA)),'<?',domain__debug(getDomain(indexB)));var A=getDomain(indexA);var B=getDomain(indexB);var R=getDomain(indexR);// R doesnt need to be booly...
if(domain_isBooly(R)){TRACE(' - R is booly, just force A and B and reflect the result in R');var vA=force(indexA);var vB=force(indexB);if(vA<vB)R=domain_removeValue(R,0);else R=domain_removeGtUnsafe(R,0);setDomain(indexR,R);}else if(domain_isZero(R)){TRACE(' - R=0 so force A>=B by setting A=maxA() and B=min(B)');// There are complexities with edge cases so for now just take the easy road;
// assuming the problem was always solveable before; max(A) >= min(B)
A=domain_createValue(domain_max(A));B=domain_createValue(domain_min(B));TRACE('   - now ==>',domain__debug(A),'>=',domain__debug(B));setDomain(indexA,A);setDomain(indexB,B);}else{ASSERT(domain_hasNoZero(R));TRACE(' - R>0 so force A<B ==>',domain__debug(A),'<',domain__debug(B));// There are complexities with edge cases so for now just take the easy road;
// assuming the problem was always solveable before; min(A) < max(B)
A=domain_createValue(domain_min(A));B=domain_createValue(domain_max(B));TRACE('   - now ==>',domain__debug(A),'>=',domain__debug(B));setDomain(indexA,A);setDomain(indexB,B);}TRACE(' - R:',domain__debug(getDomain(indexR)),'= A:',domain__debug(getDomain(indexA)),'< B:',domain__debug(getDomain(indexB)));ASSERT(getDomain(indexA));ASSERT(getDomain(indexB));ASSERT(getDomain(indexR));ASSERT(!domain_isBooly(getDomain(indexR)));ASSERT(!domain_isZero(getDomain(indexR))===domain_max(getDomain(indexA))<domain_min(getDomain(indexB)),'should hold constraint');});ml_eliminate(ml,offset,SIZEOF_VVV);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();}function leaf_islte(ml,offset,indexA,indexB,indexR,indexL){TRACE('   - leaf_islte;',indexL,'is a leaf var, R = A <=? B,',indexR,'=',indexA,'<=?',indexB,'  ->  ',domain__debug(getDomain(indexR)),'=',domain__debug(getDomain(indexA)),'<=?',domain__debug(getDomain(indexB)));solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_islte');TRACE(' - leaf index=',indexL,';',indexR,'=',indexA,'<=?',indexB,'  ->  ',domain__debug(getDomain(indexR)),'=',domain__debug(getDomain(indexA)),'<=?',domain__debug(getDomain(indexB)));var A=getDomain(indexA);var B=getDomain(indexB);var R=getDomain(indexR);// R doesnt need to be booly...
if(domain_isBooly(R)){TRACE(' - R is booly, just force A and B and reflect the result in R');var vA=force(indexA);var vB=force(indexB);if(vA<=vB)R=domain_removeValue(R,0);else R=domain_removeGtUnsafe(R,0);setDomain(indexR,R);}else if(domain_isZero(R)){TRACE(' - R=0 so force A>=B by setting A=maxA() and B=min(B)');// There are complexities with edge cases so for now just take the easy road;
// assuming the problem was always solveable before; max(A) > min(B)
A=domain_createValue(domain_max(A));B=domain_createValue(domain_min(B));TRACE('   - now ==>',domain__debug(A),'>',domain__debug(B));setDomain(indexA,A);setDomain(indexB,B);}else{ASSERT(domain_hasNoZero(R));TRACE(' - R>0 so force A<=B ==>',domain__debug(A),'<=',domain__debug(B));// There are complexities with edge cases so for now just take the easy road;
// assuming the problem was always solveable before; min(A) <= max(B)
A=domain_createValue(domain_min(A));B=domain_createValue(domain_max(B));TRACE('   - now ==>',domain__debug(A),'<=',domain__debug(B));setDomain(indexA,A);setDomain(indexB,B);}TRACE(' - R:',domain__debug(getDomain(indexR)),'= A:',domain__debug(getDomain(indexA)),'<= B:',domain__debug(getDomain(indexB)));ASSERT(getDomain(indexA));ASSERT(getDomain(indexB));ASSERT(getDomain(indexR));ASSERT(!domain_isBooly(getDomain(indexR)));ASSERT(!domain_isZero(getDomain(indexR))===domain_max(getDomain(indexA))<=domain_min(getDomain(indexB)),'should hold constraint');});ml_eliminate(ml,offset,SIZEOF_VVV);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();}function leaf_isnall(ml,offset,argCount,indexR,counts){TRACE('   - leaf_isnall;',indexR,'is a leaf var with counts:',counts,', R = nall?(',argCount,'x ),',indexR,'= all?(...)');var args=markAndCollectArgs(ml,offset,argCount);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_isnall');TRACE('-',indexR,'= nall?(',args,')  ->  ',domain__debug(getDomain(indexR)),' = nall?(',args.map(function(index){return domain__debug(getDomain(index));}),')');var vR=0;for(var i=0;i<argCount;++i){if(force(args[i])===0){TRACE(' - found at least one arg that is zero so R>0');vR=1;break;}}var oR=getDomain(indexR);var R=domain_resolveAsBooly(oR,vR);setDomain(indexR,R);ASSERT(getDomain(indexR));ASSERT(domain_hasNoZero(getDomain(indexR))===args.some(function(index){return domain_isZero(getDomain(index));}));});ml_eliminate(ml,offset,SIZEOF_C+argCount*2+2);bounty_markVar(bounty,indexR);somethingChanged();}function leaf_issame(ml,offset,indexA,indexB,indexR,indexL){TRACE('   - leaf_issame; index',indexL,'is a leaf var, R = A ==? B,',indexR,'=',indexA,'==?',indexB,'  ->  ',domain__debug(getDomain(indexR)),'=',domain__debug(getDomain(indexA)),'==?',domain__debug(getDomain(indexB)));ASSERT(ml_dec16(ml,offset+1)===2,'for now argcount should be 2');solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_issame; leaf=',indexL,';',indexR,'=',indexA,'==?',indexB,'  ->  ',domain__debug(getDomain(indexR)),'=',domain__debug(getDomain(indexA)),'==?',domain__debug(getDomain(indexB)));var A=getDomain(indexA);var B=getDomain(indexB);var AB=domain_intersection(A,B);var R=getDomain(indexR);TRACE(' - A:',domain__debug(A),', B:',domain__debug(B),', AB:',domain__debug(AB),', solved?',domain_isSolved(A),domain_isSolved(B));if(!domain_isSolved(R)){if(!AB){TRACE('   - A&B is empty so R=0');R=domain_resolveAsBooly(R,false);}else if(domain_isSolved(A)){TRACE('   - A is solved so R=A==B',A===B);R=domain_resolveAsBooly(R,A===B);}else if(domain_isSolved(B)){TRACE('   - B is solved and A wasnt. A&B wasnt empty so we can set A=B');setDomain(indexA,B);R=domain_resolveAsBooly(R,true);}else{TRACE('   - some values overlap between A and B and neither is solved.. force all');var v=domain_min(AB);var V=domain_createValue(v);setDomain(indexA,V);setDomain(indexB,V);R=domain_resolveAsBooly(R,true);}TRACE(' - R is now',domain__debug(R));ASSERT(R,'leaf should at least have the resulting value');setDomain(indexR,R);}else if(domain_isZero(R)){TRACE(' - R=0 so make sure AB is empty');if(AB){TRACE(' - it wasnt, making it so now');if(domain_isSolved(A))setDomain(indexB,domain_removeValue(B,domain_getValue(A)));else setDomain(indexA,domain_removeValue(A,force(indexB)));}}else{force(indexA,AB);force(indexB,getDomain(indexA));}ASSERT(getDomain(indexR));ASSERT(getDomain(indexA));ASSERT(getDomain(indexB));ASSERT(!domain_isBooly(getDomain(indexR)));ASSERT(domain_isSolved(getDomain(indexA))||domain_isSolved(getDomain(indexB))||!domain_intersection(getDomain(indexA),getDomain(indexB)),'either A or B is solved OR they have no intersecting values');ASSERT(Boolean(domain_intersection(getDomain(indexA),getDomain(indexB)))===!domain_isZero(getDomain(indexR)));ASSERT(!domain_isZero(getDomain(indexR))?domain_isSolved(getDomain(indexA))&&domain_isSolved(getDomain(indexB)):true,'if R>0 then A and B must be solved');});ml_eliminate(ml,offset,SIZEOF_CR_2);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();}function leaf_issome(ml,offset,indexR,argCount){TRACE('   - leaf_issome; index',indexR,'is a leaf var, R = some?(A B ...), index=',indexR,', R=',domain__debug(getDomain(indexR)));TRACE_MORPH('R = some(...)','');var args=markAndCollectArgs(ml,offset,argCount);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_issome');var has=false;for(var i=0;i<args.length;++i){var index=args[i];if(force(index)>0){has=true;break;}}var R=getDomain(indexR);if(has)R=domain_removeValue(R,0);else R=domain_removeGtUnsafe(R,0);ASSERT(R,'leaf should at least have the resulting value');setDomain(indexR,R);});ml_eliminate(ml,offset,SIZEOF_C+argCount*2+2);bounty_markVar(bounty,indexR);somethingChanged();}function leaf_lt(ml,offset,indexA,indexB,leafSide){TRACE('   - leaf_lt;',leafSide,'is a leaf var, A < B,',indexA,'<',indexB);ASSERT(typeof indexA==='number','index A should be number',indexA);ASSERT(typeof indexB==='number','index B should be number',indexB);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_lt; solving',indexA,'<',indexB,'  ->  ',domain__debug(getDomain(indexA)),'<',domain__debug(getDomain(indexB)));var A=getDomain(indexA);var B=getDomain(indexB);var maxA=domain_max(A);var minB=domain_min(B);// Numdom([28,29]) < numdom([15,30])
TRACE(' - maxA >=? minB;',maxA,'>=',minB);if(maxA<minB){TRACE(' - lt already fulfilled, no change required');}else if(domain_min(A)>=minB){var vA=domain_min(A);TRACE(' - min(A) still larger than min(B) so setting A to min(A)=',vA,' and removing all LTE from B');TRACE(' - so;',domain__debug(A),'=>',domain__debug(domain_removeGtUnsafe(A,vA)),'and',domain__debug(B),'=>',domain__debug(domain_removeLte(B,vA)));setDomain(indexA,domain_removeGtUnsafe(A,vA));setDomain(indexB,domain_removeLte(B,vA));}else{TRACE(' - removing >=min(B) from A');setDomain(indexA,domain_removeGte(A,minB));}TRACE(' - result:',domain__debug(getDomain(indexA)),'<=',domain__debug(getDomain(indexB)));ASSERT(getDomain(indexA));ASSERT(getDomain(indexB));ASSERT(domain_max(getDomain(indexA))<domain_min(getDomain(indexB)));});ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();}function leaf_lte(ml,offset,indexA,indexB,leafIsA){TRACE('   - leaf_lte;',leafIsA?'A':'B','is a leaf var, A <= B,',indexA,'<=',indexB);ASSERT(typeof indexA==='number','index A should be number',indexA);ASSERT(typeof indexB==='number','index B should be number',indexB);// Prune values that cant be a solution
var A=getDomain(indexA,true);var B=getDomain(indexB,true);var minA=domain_min(A);var maxB=domain_max(B);var nA=domain_removeGtUnsafe(A,maxB);var nB=domain_removeLtUnsafe(B,minA);if(!nA||domain_isSolved(nA)||!nB||domain_isSolved(nB)){TRACE(' - lte can be solved by minimizer');TRACE(' - either solved after pruning?',domain__debug(nA),domain__debug(nB));TRACE(nA?'':' - A without max(B) is empty; A=',domain__debug(A),', B=',domain__debug(B),', max(B)=',domain_max(B),', result:',domain_removeGtUnsafe(A,maxB));requestAnotherCycle=true;return false;}if(A!==nA)setDomain(indexA,nA);if(B!==nB)setDomain(indexB,nB);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_lte; solving',indexA,'<=',indexB,'  ->  ',domain__debug(getDomain(indexA)),'<=',domain__debug(getDomain(indexB)),'  ->  ',domain_max(getDomain(indexA)),'<=',domain_min(getDomain(indexB)));var A=getDomain(indexA);var B=getDomain(indexB);var maxA=domain_max(A);var minB=domain_min(B);TRACE(' - maxA >? minB;',maxA,'>',minB);if(maxA>minB){if(leafIsA){var _nA2=domain_removeGtUnsafe(A,minB);TRACE('   - trimmed A down to',domain__debug(_nA2));setDomain(indexA,_nA2);}else{var _nB2=domain_removeLtUnsafe(B,maxA);TRACE('   - trimmed B down to',domain__debug(_nB2));setDomain(indexB,_nB2);}}ASSERT(getDomain(indexA));ASSERT(getDomain(indexB));ASSERT(domain_max(getDomain(indexA))<=domain_min(getDomain(indexB)));});ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();return true;}function leaf_some_2(ml,offset,leafIndex,otherIndex,indexA,indexB){TRACE('   - leaf_some_2;',leafIndex,'is a leaf var, A | B,',indexA,'|',indexB);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_some_2');var A=getDomain(otherIndex);var B=getDomain(leafIndex);TRACE(' - solving',indexA,'|',indexB,'  ->  ',domain__debug(A),'|',domain__debug(B));// Check if either is solved to zero, in that case force the other to non-zero.
// if neither is zero and both have zero, force the leaf to non-zero.
// otherwise no change because OR will be satisfied.
if(domain_isZero(A)){TRACE(' - forcing the leaf index,',leafIndex,', to non-zero because the other var is zero');setDomain(leafIndex,domain_removeValue(B,0));}else if(domain_isZero(B)){TRACE(' - forcing the other index,',otherIndex,', to non-zero because the leaf var was already zero');setDomain(otherIndex,domain_removeValue(A,0));}else if(!domain_hasNoZero(A)&&!domain_hasNoZero(A)){TRACE(' - neither was booly solved so forcing the leaf index,',leafIndex,', to non-zero to satisfy the OR');setDomain(leafIndex,domain_removeValue(B,0));}else{TRACE(' - no change.');}});ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,leafIndex);bounty_markVar(bounty,otherIndex);somethingChanged();}function leaf_sum_result(ml,offset,argCount,indexR){TRACE('   - leaf_sum_result;',indexR,'is a leaf var, R = sum(',argCount,'x ),',indexR,'= sum(...)');var args=markAndCollectArgs(ml,offset,argCount);TRACE('   - collected sum arg indexes;',args);TRACE('   - collected sum arg domains;',args.map(function(index){return domain__debug(getDomain(index));}).join(', '));solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_sum_result');TRACE(' -',indexR,'= sum(',args,')');TRACE(' -',domain__debug(getDomain(indexR)),'= sum(',args.map(function(index){return domain__debug(getDomain(index));}).join(', '),')');var sum=0;for(var i=0;i<args.length;++i){var index=args[i];var v=force(index);sum+=v;TRACE(' - i=',i,', index=',index,', v=',v,', sum now:',sum);}TRACE(' - total sum is',sum);var R=domain_intersectionValue(getDomain(indexR),sum);ASSERT(R,'R should contain solution value');setDomain(indexR,R);});ml_eliminate(ml,offset,SIZEOF_C+argCount*2+2);bounty_markVar(bounty,indexR);// Args already done in above loop
somethingChanged();}function leaf_xnor(ml,offset,leafIndex,otherIndex,indexA,indexB){TRACE('   - leaf_xnor;',leafIndex,'is a leaf var, A !^ B,',indexA,'!^',indexB);ASSERT(ml_dec16(ml,offset+1)===2,'should have 2 args');solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_xnor; solving',indexA,'!^',indexB,'  ->  ',domain__debug(getDomain(indexA)),'!^',domain__debug(getDomain(indexB)));// Check if a var is solved to zero, if so solve the other var to zero as well
// check if a var is solved to non-zero, if so solve the other var to non-zero as well
// otherwise force(A), let B follow that result
var A=getDomain(indexA);var B=getDomain(indexB);if(domain_isZero(A)){TRACE(' - forcing B to zero because A is zero');setDomain(indexB,domain_removeGtUnsafe(B,0));}else if(domain_isZero(B)){TRACE(' - forcing A to zero because B is zero');setDomain(indexA,domain_removeGtUnsafe(A,0));}else if(domain_hasNoZero(A)){TRACE(' - forcing B to non-zero because A is non-zero');setDomain(indexB,domain_removeValue(B,0));}else if(domain_hasNoZero(B)){TRACE(' - forcing A to non-zero because B is non-zero');setDomain(indexA,domain_removeValue(A,0));}else{// TODO: force() and repeat above steps
TRACE(' - neither was booly solved. forcing both to non-zero',domain__debug(domain_removeValue(A,0)),domain__debug(domain_removeValue(B,0)));// Non-zero gives more options? *shrug*
setDomain(indexA,domain_removeValue(A,0));setDomain(indexB,domain_removeValue(B,0));}});ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,leafIndex);bounty_markVar(bounty,otherIndex);somethingChanged();}function leaf_xor(ml,offset,leafIndex,otherIndex,indexA,indexB){TRACE('   - leaf_xor;',leafIndex,'is a leaf var, A ^ B,',indexA,'^',indexB);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - leaf_xor; solving',indexA,'^',indexB,'  ->  ',domain__debug(getDomain(indexA)),'^',domain__debug(getDomain(indexB)));// Check if either is solved to zero, in that case force the other to non-zero.
// check if either side is non-zero. in that case force the other to zero
// confirm that both sides are booly-solved, force them to if not.
var A=getDomain(indexA);var B=getDomain(indexB);if(domain_isZero(A)){TRACE(' - forcing B to non-zero because A is zero');setDomain(indexB,domain_removeValue(B,0));}else if(domain_isZero(B)){TRACE(' - forcing A to non-zero because B was already zero');setDomain(indexA,domain_removeValue(A,0));}else if(domain_hasNoZero(A)){TRACE(' - A was non-zero so forcing B to zero');setDomain(indexB,domain_removeGtUnsafe(B,0));}else if(domain_hasNoZero(B)){TRACE(' - B was non-zero so forcing A to zero');setDomain(indexA,domain_removeGtUnsafe(A,0));}else{TRACE(' - neither was booly solved. forcing A to zero and B to non-zero');setDomain(indexA,domain_removeValue(A,0));setDomain(indexB,domain_removeGtUnsafe(B,0));}});ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,leafIndex);bounty_markVar(bounty,otherIndex);somethingChanged();}// ##############
function desubset_diff(ml,diffOffset,diffArgCount,diffFirstIndex,diffFirstIndexCounts){TRACE(' - desubset_diff; checking whether given DIFF at',diffOffset,'is entirely a smaller subset than another DIFF');TRACE('   - argCount=',diffArgCount,', indexA=',diffFirstIndex,', diffFirstIndexCounts=',diffFirstIndexCounts);// A diff can superset another diff
for(var i=0;i<diffFirstIndexCounts;++i){var offset=bounty_getOffset(bounty,diffFirstIndex,i);if(offset!==diffOffset){var opCode=ml_dec8(ml,offset);if(opCode===ML_DIFF){// Diff(ABC) ⊂ diff(ABCD)  then the bigger set can be removed
var argCount=ml_dec16(ml,offset+1);if(diffArgCount>argCount){// Only check if given DIFF has more args than current DIFF. always.
// first ensure both DIFF op args are ordered
dealiasAndSortArgs(ml,diffOffset,diffArgCount);dealiasAndSortArgs(ml,offset,argCount);if(isSubset(ml,offset,argCount,diffOffset,diffArgCount)){// Note: inverted args!
TRACE(' - deduped a DIFF subset of another DIFF! marking all args and eliminating the larger DIFF');markAllArgs(ml,offset,argCount);// Note: this also marks all args of DIFF1 ;)
ml_eliminate(ml,offset,SIZEOF_C+argCount*2);return true;}TRACE(' - this diff was not a subset of the other diff');}}else if(opCode===ML_ISDIFF){// Diff(ABC) ⊆ R=diff?(ABCD)  then R=1 and isdiff dropped because the DIFF() will ensure it
var _argCount=ml_dec16(ml,offset+1);if(diffArgCount>=_argCount){// Only check if DIFF has >= args than ISDIFF
// first ensure both DIFF op args are ordered
dealiasAndSortArgs(ml,diffOffset,diffArgCount);dealiasAndSortArgs(ml,offset,_argCount);if(isSubset(ml,offset,_argCount,diffOffset,diffArgCount)){// Note: inverted args!
TRACE(' - deduped a DIFF subset of an ISDIFF! Setting R=1, marking all args, and eliminating the ISDIFF');var indexR=readIndex(ml,offset+SIZEOF_C+_argCount*2);TRACE(' - indexR=',indexR);var R=getDomain(indexR);var nR=domain_removeValue(R,0);if(R!==nR)setDomain(indexR,nR);markAllArgs(ml,offset,_argCount);// Note: this also marks all args of DIFF1 ;)
ml_eliminate(ml,offset,SIZEOF_C+_argCount*2+2);return true;}TRACE(' - this DIFF was not a subset of the ISDIFF');}}else if(opCode===ML_ISSAME){// DIFF(ABC) ⊆ R=SAME?(ABCD)  then R=0 and ISSAME dropped because the DIFF() _will_ negate it
var _argCount2=ml_dec16(ml,offset+1);if(diffArgCount<=_argCount2){// Only check if DIFF has fewer or equal args than ISSAME
// first ensure both DIFF op args are ordered
dealiasAndSortArgs(ml,diffOffset,diffArgCount);dealiasAndSortArgs(ml,offset,_argCount2);if(isSubset(ml,diffOffset,diffArgCount,offset,_argCount2)){TRACE(' - deduped a DIFF subset of an ISSAME! Setting R=0, marking all args, and eliminating the ISSAME');var _indexR=readIndex(ml,offset+SIZEOF_C+_argCount2*2);TRACE(' - indexR=',_indexR);var _R=getDomain(_indexR);var _nR=domain_removeGtUnsafe(_R,0);if(_R!==_nR)setDomain(_indexR,_nR);markAllArgs(ml,offset,_argCount2);// Note: this also marks all args of DIFF1 ;)
ml_eliminate(ml,offset,SIZEOF_C+_argCount2*2+2);return true;}TRACE(' - this DIFF was not a subset of the ISSAME');}}}}TRACE(' / desubset_diff');}function desubset_nall(ml,nallOffset,nallArgCount,nallFirstIndex,nallFirstIndexCounts){TRACE(' - desubset_nall; checking whether given NALL at',nallOffset,'is entirely a smaller subset than another NALL');TRACE('   - argCount=',nallArgCount,', indexA=',nallFirstIndex,', nallFirstIndexCounts=',nallFirstIndexCounts);// A nall can subset another nall
for(var i=0;i<nallFirstIndexCounts;++i){var offset=bounty_getOffset(bounty,nallFirstIndex,i);if(offset!==nallOffset){var opCode=ml_dec8(ml,offset);if(opCode===ML_NALL){// Nall(ABC) ⊂ nall(ABCD)  then the bigger set can be removed
var argCount=ml_dec16(ml,offset+1);if(nallArgCount<argCount){// Only check if given NALL has fewer args than current NALL. always.
// first ensure both NALL op args are ordered
dealiasAndSortArgs(ml,nallOffset,nallArgCount);dealiasAndSortArgs(ml,offset,argCount);if(isSubset(ml,nallOffset,nallArgCount,offset,argCount)){TRACE(' - deduped a NALL subset of another NALL! marking all args and eliminating the larger NALL');markAllArgs(ml,offset,argCount);// Note: this also marks all args of NALL1 ;)
ml_eliminate(ml,offset,SIZEOF_C+argCount*2);return true;}TRACE(' - this nall was not a subset of the other nall');}}else if(opCode===ML_ISNALL){// Nall(ABC) ⊆ R=nall?(ABCD)  then R=1 and isnall dropped because the NALL() will ensure it
var _argCount3=ml_dec16(ml,offset+1);if(nallArgCount<=_argCount3){// Only check if NALL has fewer or equal args than ISNALL
// first ensure both NALL op args are ordered
dealiasAndSortArgs(ml,nallOffset,nallArgCount);dealiasAndSortArgs(ml,offset,_argCount3);if(isSubset(ml,nallOffset,nallArgCount,offset,_argCount3)){TRACE(' - deduped a NALL subset of an ISNALL! Setting R=1, marking all args, and eliminating the ISNALL');var indexR=readIndex(ml,offset+SIZEOF_C+_argCount3*2);TRACE(' - indexR=',indexR);var R=getDomain(indexR);var nR=domain_removeValue(R,0);if(R!==nR)setDomain(indexR,nR);markAllArgs(ml,offset,_argCount3);// Note: this also marks all args of NALL1 ;)
ml_eliminate(ml,offset,SIZEOF_C+_argCount3*2+2);return true;}TRACE(' - this NALL was not a subset of the ISNALL');}}else if(opCode===ML_ISALL){// NALL(ABC) ⊆ R=ALL?(ABCD)  then R=0 and ISALL dropped because the NALL() _will_ negate it
var _argCount4=ml_dec16(ml,offset+1);if(nallArgCount<=_argCount4){// Only check if NALL has fewer or equal args than ISALL
// first ensure both NALL op args are ordered
dealiasAndSortArgs(ml,nallOffset,nallArgCount);dealiasAndSortArgs(ml,offset,_argCount4);if(isSubset(ml,nallOffset,nallArgCount,offset,_argCount4)){TRACE(' - deduped a NALL subset of an ISALL! Setting R=0, marking all args, and eliminating the ISALL');var _indexR2=readIndex(ml,offset+SIZEOF_C+_argCount4*2);TRACE(' - indexR=',_indexR2);var _R2=getDomain(_indexR2);var _nR2=domain_removeGtUnsafe(_R2,0);if(_R2!==_nR2)setDomain(_indexR2,_nR2);markAllArgs(ml,offset,_argCount4);// Note: this also marks all args of NALL1 ;)
ml_eliminate(ml,offset,SIZEOF_C+_argCount4*2+2);return true;}TRACE(' - this NALL was not a subset of the ISALL');}}}}}function desubset_some(ml,someOffset,someArgCount,someFirstIndex,someFirstIndexCounts){TRACE(' - desubset_some; checking whether given SOME at',someOffset,'is entirely a smaller subset than another SOME');TRACE('   - argCount=',someArgCount,', indexA=',someFirstIndex,', someFirstIndexCounts=',someFirstIndexCounts);// A some can subset another some
for(var i=0;i<someFirstIndexCounts;++i){var offset=bounty_getOffset(bounty,someFirstIndex,i);if(offset!==someOffset){var opCode=ml_dec8(ml,offset);if(opCode===ML_SOME){// Some(ABC) ⊂ some(ABCD)  then the bigger set can be removed
var argCount=ml_dec16(ml,offset+1);if(someArgCount<argCount){// Only check if given SOME has fewer args than current SOME. always.
// first ensure both SOME op args are ordered
dealiasAndSortArgs(ml,someOffset,someArgCount);dealiasAndSortArgs(ml,offset,argCount);if(isSubset(ml,someOffset,someArgCount,offset,argCount)){TRACE(' - deduped a SOME subset of another SOME! marking all args and eliminating the larger SOME');markAllArgs(ml,offset,argCount);// Note: this also marks all args of SOME1 ;)
ml_eliminate(ml,offset,SIZEOF_C+argCount*2);somethingChanged();return true;}TRACE(' - this SOME was not a subset of the other SOME');}}else if(opCode===ML_ISSOME){// Some(ABC) ⊆ R=some?(ABCD)  then R=1 and issome dropped because the SOME() will ensure it
var _argCount5=ml_dec16(ml,offset+1);if(someArgCount<=_argCount5){// Only check if SOME has fewer or equal args than ISSOME
// first ensure both SOME op args are ordered
dealiasAndSortArgs(ml,someOffset,someArgCount);dealiasAndSortArgs(ml,offset,_argCount5);if(isSubset(ml,someOffset,someArgCount,offset,_argCount5)){TRACE(' - deduped a SOME subset of an ISSOME! Setting R=1, marking all args, and eliminating the ISSOME');var indexR=readIndex(ml,offset+SIZEOF_C+_argCount5*2);TRACE(' - indexR=',indexR);var R=getDomain(indexR);var nR=domain_removeValue(R,0);if(R!==nR)setDomain(indexR,nR);markAllArgs(ml,offset,_argCount5);// Note: this also marks all args of SOME1 ;)
ml_eliminate(ml,offset,SIZEOF_C+_argCount5*2+2);somethingChanged();return true;}TRACE(' - this some was not a subset of the issome');}}else if(opCode===ML_ISNONE){// SOME(ABC) ⊆ R=NONE?(ABCD)  then R=0 and ISNONE dropped because the SOME() _will_ negate it
var _argCount6=ml_dec16(ml,offset+1);if(someArgCount<=_argCount6){// Only check if SOME has fewer or equal args than ISNONE
// first ensure both SOME op args are ordered
dealiasAndSortArgs(ml,someOffset,someArgCount);dealiasAndSortArgs(ml,offset,_argCount6);if(isSubset(ml,someOffset,someArgCount,offset,_argCount6)){TRACE(' - deduped a SOME subset of an ISNONE! Setting R=0, marking all args, and eliminating the ISNONE');var _indexR3=readIndex(ml,offset+SIZEOF_C+_argCount6*2);TRACE(' - indexR=',_indexR3);var _R3=getDomain(_indexR3);var _nR3=domain_removeGtUnsafe(_R3,0);if(_R3!==_nR3)setDomain(_indexR3,_nR3);markAllArgs(ml,offset,_argCount6);// Note: this also marks all args of SOME1 ;)
ml_eliminate(ml,offset,SIZEOF_C+_argCount6*2+2);somethingChanged();return true;}TRACE(' - this SOME was not a subset of the ISNONE');}}}}}function isSubset(ml,someOffset1,argCount1,someOffset2,argCount2){// Now "zip" and confirm that all args in SOME1 are present by SOME2.
var pos1=0;var pos2=0;var index1=ml_dec16(ml,someOffset1+SIZEOF_C+pos1*2);var index2=0;while(pos2<argCount2){index2=ml_dec16(ml,someOffset2+SIZEOF_C+pos2*2);while(index1===index2){++pos1;if(pos1>=argCount1){return true;}index1=ml_dec16(ml,someOffset1+SIZEOF_C+pos1*2);}++pos2;}return false;}function dealiasAndSortArgs(ml,offset,argCount){TRACE(' - dealiasAndSortArgs; sorting and dealiasing',argCount,'args starting at',offset);// First de-alias all args
for(var i=0;i<argCount;++i){var argOffset=offset+SIZEOF_C+i*2;var actual=ml_dec16(ml,argOffset);var alias=getAlias(actual);if(actual!==alias)ml_enc16(ml,argOffset,alias);}// Now sort them
ml_heapSort16bitInline(ml,offset+SIZEOF_C,argCount);}// ##############
function trick_sum_to_nall(ml,offset,argCount,indexR){// [0 0 n-1 n-1]=sum([01] [01] [01]   =>   nall(...)
TRACE('   - trick_sum_to_nall');TRACE_MORPH('[0 0 n-1 n-1]=sum(A:[01] B:[01] C:[01] ...)','nall(A B C ...)');TRACE('   - indexR:',indexR,', R:',domain__debug(getDomain(indexR)));TRACE('   -',ml__debug(ml,offset,1,problem));ASSERT(getDomain(indexR)===domain_createRange(0,argCount-1)&&domain_min(getDomain(indexR))===0&&domain_max(getDomain(indexR))===argCount-1);var args=markAndCollectArgs(ml,offset,argCount);TRACE('   - args:',args,', doms:',args.map(getDomain).map(domain__debug).join(', '));ASSERT(args.map(getDomain).every(domain_isBool),'all args should be bool');solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_sum_to_nall');TRACE(' -',indexR,'= sum(',args,')');TRACE(' -',domain__debug(getDomain(indexR)),'= sum(',args.map(function(index){return domain__debug(getDomain(index));}),')');var R=getDomain(indexR);TRACE(' - scan first');var current=0;for(var i=0;i<args.length;++i){var index=args[i];var D=getDomain(index);var vD=domain_getValue(D);if(vD>=0)current+=vD;}var vR=domain_min(domain_removeLtUnsafe(R,current));// "R must be at least the current sum of constant args"
var remaining=vR-current;TRACE(' - args that are solved currently sum to',current,', R=',domain__debug(R),', so there is',remaining,'to be added');for(var _i2=0;_i2<args.length;++_i2){var _index2=args[_i2];var _D=getDomain(_index2);if(!domain_isSolved(_D)){if(remaining>0){_D=domain_removeValue(_D,0);--remaining;}else{_D=domain_removeValue(_D,1);}// SUM requires all args to solve. let them pick any value from what remains.
force(_index2,_D);}}setDomain(indexR,domain_intersectionValue(R,vR));ASSERT(getDomain(indexR));ASSERT(domain_isSolved(getDomain(indexR)));ASSERT(domain_getValue(getDomain(indexR))===args.reduce(function(a,b){return a+force(b);},0));});// From sum to nall.
ml_cr2c(ml,offset,argCount,ML_NALL,args);bounty_markVar(bounty,indexR);// Args already done in above loop
somethingChanged();}function trick_some_sum(ml,offset,argCount,indexR){// [1 1 n n]=sum([01] [01] [01]   ->   nall(...)
TRACE('   - trick_some_sum; [1 1 n n]=sum([01] [01] [01] ...) is actually a SOME',indexR);var args=markAndCollectArgs(ml,offset,argCount);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_some_sum');TRACE(' - some(A B);',indexR,'= sum(',args,')  ->  ',domain__debug(getDomain(indexR)),'= sum(',args.map(function(index){return domain__debug(getDomain(index));}),')');// First make sure at least one arg is nonzero. for once if none already is.
var none=true;var booly=-1;for(var i=0;i<argCount;++i){var index=args[i];var D=getDomain(index);if(domain_hasNoZero(D)){none=false;break;}if(!domain_isZero(D)){ASSERT(domain_isBooly(D));booly=index;}}if(none){ASSERT(booly>=0);var _D2=getDomain(booly);_D2=domain_removeValue(_D2,0);setDomain(booly,_D2);ASSERT(_D2);}// Now collect the sum. do it in a new loop because it's just simpler that way.
// force all the args because otherwise the sum might be violated
var sum=0;for(var _i3=0;_i3<argCount;++_i3){sum+=force(args[_i3]);}// Set R to the sum of all constants
var R=getDomain(indexR);R=domain_intersectionValue(R,sum);setDomain(indexR,R);ASSERT(R);});// From sum to some.
ml_enc8(ml,offset,ML_SOME);ml_enc16(ml,offset+1,argCount);for(var i=0;i<argCount;++i){ml_enc16(ml,offset+SIZEOF_C+i*2,args[i]);}ml_compileJumpSafe(ml,offset+SIZEOF_C+argCount*2,2);// Result var (16bit). for the rest some is same as sum
bounty_markVar(bounty,indexR);// Args already done in above loop
somethingChanged();}function trick_isall_ltelhs_1shared(ml,lteOffset,indexR,countsR){var indexS=readIndex(ml,lteOffset+OFFSET_C_B);TRACE('trick_isall_ltelhs_1shared');TRACE(' - with only R shared on an isall[2]:');TRACE('   - R <= S, R = all?(A B)      =>      some(S | nall?(A B))');TRACE(' - indexes:',indexR,'<=',indexS);TRACE(' - domains:',getDomain(indexR),'<=',getDomain(indexS));TRACE(' - metaFlags:',bounty__debugMeta(bounty,indexR),'<=',bounty__debugMeta(bounty,indexS));// The next asserts should have been verified by the bounty hunter, so they are only verified in ASSERTs
ASSERT(countsR===2,'R should be a leaf var with these two constraints');ASSERT(countsR===getCounts(bounty,indexR),'correct value?');ASSERT(getMeta(bounty,indexR)===(BOUNTY_FLAG_LTE_LHS|BOUNTY_FLAG_ISALL_RESULT),'A be an lte lhs and isall result var');ASSERT(ml_dec8(ml,lteOffset)===ML_LTE,'lteOffset should be lte');ASSERT(ml_dec16(ml,lteOffset+OFFSET_C_A)===indexR,'shared index should be lhs of lteOffset');if(!domain_isBool(getDomain(indexR,true))||!domain_isBool(getDomain(indexS,true))){TRACE(' - R or S wasnt bool, bailing');return false;}var offset1=bounty_getOffset(bounty,indexR,0);var offset2=bounty_getOffset(bounty,indexR,1);var isallOffset=offset1===lteOffset?offset2:offset1;ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL);ASSERT(readIndex(ml,isallOffset+OFFSET_C_R)===indexR);if(ml_dec16(ml,isallOffset+1)!==2){TRACE(' - isall did not have 2 args, bailing');return false;}var indexA=readIndex(ml,isallOffset+OFFSET_C_A);var indexB=readIndex(ml,isallOffset+OFFSET_C_B);if(!domain_isBool(getDomain(indexA,true))||!domain_isBool(getDomain(indexB,true))){TRACE(' - A or B wasnt bool, bailing');return false;}TRACE_MORPH('R <= S, R = all?(A B)','S | nall?(A B)');TRACE(' - change the isall to an isnall, change the LTE to an OR');ml_cr2cr2(ml,isallOffset,2,ML_ISNALL,indexA,indexB,indexR);ml_c2c2(ml,lteOffset,2,ML_SOME,indexR,indexS);bounty_markVar(bounty,indexR);bounty_markVar(bounty,indexS);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();return true;}function trick_isall_implhs_1shared(ml,impOffset,indexR,countsR){var indexS=readIndex(ml,impOffset+OFFSET_C_B);TRACE('trick_isall_implhs_1shared');TRACE(' - with only R shared on an isall[2]:');TRACE('   - R -> S, R = all?(A B)      =>      some(S | nall?(A B))');TRACE(' - indexes:',indexR,'<=',indexS);TRACE(' - domains:',getDomain(indexR),'<=',getDomain(indexS));TRACE(' - metaFlags:',bounty__debugMeta(bounty,indexR),'<=',bounty__debugMeta(bounty,indexR));// The next asserts should have been verified by the bounty hunter, so they are only verified in ASSERTs
ASSERT(countsR===2,'R should be a leaf var with these two constraints');ASSERT(countsR===getCounts(bounty,indexR),'correct value?');ASSERT(getMeta(bounty,indexR)===(BOUNTY_FLAG_IMP_LHS|BOUNTY_FLAG_ISALL_RESULT),'A be an imp lhs and isall result var');ASSERT(ml_dec8(ml,impOffset)===ML_IMP,'impOffset should be imp');ASSERT(ml_dec16(ml,impOffset+OFFSET_C_A)===indexR,'shared index should be lhs of impOffset');if(!domain_isBool(getDomain(indexR,true))||!domain_isBool(getDomain(indexS,true))){TRACE(' - R or S wasnt bool, bailing');return false;}var offset1=bounty_getOffset(bounty,indexR,0);var offset2=bounty_getOffset(bounty,indexR,1);var isallOffset=offset1===impOffset?offset2:offset1;ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL);ASSERT(readIndex(ml,isallOffset+OFFSET_C_R)===indexR);if(ml_dec16(ml,isallOffset+1)!==2){TRACE(' - isall did not have 2 args, bailing');return false;}if(!domain_isBool(getDomain(indexA,true))||!domain_isBool(getDomain(indexB,true))){TRACE(' - A or B wasnt bool, bailing');return false;}TRACE_MORPH('R -> S, R = all?(A B)','S | nall?(A B)');TRACE(' - change the isall to a nall, change the imp to an or');var indexA=readIndex(ml,isallOffset+OFFSET_C_A);var indexB=readIndex(ml,isallOffset+OFFSET_C_B);ml_cr2cr2(ml,isallOffset,2,ML_ISNALL,indexA,indexB,indexR);ml_c2c2(ml,impOffset,2,ML_SOME,indexR,indexS);bounty_markVar(bounty,indexR);bounty_markVar(bounty,indexS);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();return true;}function trick_isall_ltelhs_2shared(ml,lteOffset,indexR,countsR){var indexA=readIndex(ml,lteOffset+OFFSET_C_B);TRACE('trick_isall_ltelhs_2shared');TRACE(' - with R and an arg shared:');TRACE('   - R <= A, R = all?(A B ...)      ->      R = all?(A B ...)');TRACE('   - (the isall subsumes the lte, regardless of other constraints)');// TRACE(' - with only R shared:');
// TRACE('   - R <= A, R = all?(B C)          ->      some(C nall?(A B))');
// TRACE('   - (when R is leaf, only A=1 B=1 C=0 is false)');
TRACE(' - indexes:',indexR,'<=',indexA);TRACE(' - domains:',getDomain(indexR),'<=',getDomain(indexA));TRACE(' - metaFlags:',bounty__debugMeta(bounty,indexR),'<=',bounty__debugMeta(bounty,indexR));// The next asserts should have been verified by the bounty hunter, so they are only verified in ASSERTs
ASSERT(countsR>1,'the indexR should be part of at least two constraints');ASSERT(countsR===getCounts(bounty,indexR),'correct value?');ASSERT(hasFlags(getMeta(bounty,indexR),BOUNTY_FLAG_LTE_LHS|BOUNTY_FLAG_ISALL_RESULT),'A must at least be an lte lhs and isall result var');ASSERT(ml_dec8(ml,lteOffset)===ML_LTE,'lteOffset should be lte');ASSERT(ml_dec16(ml,lteOffset+OFFSET_C_A)===indexR,'shared index should be lhs of lteOffset');var toCheck=Math.min(countsR,BOUNTY_MAX_OFFSETS_TO_TRACK);// Note: it's not guaranteed that we'll actually see an isall in this loop
// if countsR is higher than the max number of offsets tracked by bounty
// in that case nothing happens and the redundant constraint persists. no biggie
for(var i=0;i<toCheck;++i){TRACE('   - fetching #',i,'/',toCheck,'(',countsR,'||',BOUNTY_MAX_OFFSETS_TO_TRACK,')');var offset=bounty_getOffset(bounty,indexR,i);TRACE('   - #'+i,', offset =',offset);if(offset!==lteOffset){var op=ml_dec8(ml,offset);if(op===ML_ISALL){if(_trick_isall_ltelhs_2shared(lteOffset,offset,indexR,indexA))return true;}}}TRACE(' - trick_isall_ltelhs_2shared changed nothing');return false;}function _trick_isall_ltelhs_2shared(lteOffset,isallOffset,indexR,indexA){// R <= A, R = all?(A B C ...)    =>     R = all?(A B C ...)   (drop lte)
// need to search the isall for the A arg here
ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL,'should be isall');var argCount=ml_dec16(ml,isallOffset+1);var indexS=readIndex(ml,isallOffset+SIZEOF_C+argCount*2);TRACE('     - isall with an argCount of',argCount,', indexR=',indexS,'=indexR=',indexR,'cross checking all args to match',indexA);ASSERT(indexS===indexR,'R should (at least) be result of isall');// Scan for any arg index == A
for(var i=0;i<argCount;++i){var argIndex=readIndex(ml,isallOffset+SIZEOF_C+i*2);if(argIndex===indexA){TRACE_MORPH('R <= A, R = all?(A ...)','R = all?(A ...)');TRACE('     - arg index is indexA, match. this is R <= A, R = all?(A ...) so eliminate the lte');ml_eliminate(ml,lteOffset,SIZEOF_C_2);bounty_markVar(bounty,indexR);bounty_markVar(bounty,indexA);somethingChanged();return true;}}return false;}function trick_implhs_isall_2shared(ml,impOffset,indexA,countsA){TRACE('trick_implhs_isall_2shared',indexA,'at',impOffset,'metaFlags:',bounty__debugMeta(bounty,indexA),'`S -> A, S = all?(A B ...)   ->   S = all?(A B ...)`');TRACE(' - imp:',indexA,'->',readIndex(ml,impOffset+OFFSET_C_B),'  =>  ',domain__debug(getDomain(indexA,true)),'->',domain__debug(getDomain(readIndex(ml,impOffset+OFFSET_C_B),true)));TRACE('   - S -> A, S = all?(A B)   =>   S = all?(A B)');TRACE('   - (the isall subsumes the implication, regardless of other constraints)');// The next asserts should have been verified by the bounty hunter, so they are only verified in ASSERTs
ASSERT(countsA>1,'the indexA should only be part of two constraints',countsA,bounty__debugMeta(bounty,indexA));ASSERT(countsA===getCounts(bounty,indexA),'correct value?',countsA===getCounts(bounty,indexA));ASSERT(hasFlags(getMeta(bounty,indexA),BOUNTY_FLAG_IMP_LHS|BOUNTY_FLAG_ISALL_RESULT),'A must at least be an imp lhs and isall result var');ASSERT(ml_dec8(ml,impOffset)===ML_IMP,'impOffset should be imp',ml__opName(ml_dec8(ml,impOffset)));ASSERT(ml_dec16(ml,impOffset+OFFSET_C_A)===indexA,'shared index should be lhs of impOffset');var indexB=readIndex(ml,impOffset+OFFSET_C_B);var toCheck=Math.min(countsA,BOUNTY_MAX_OFFSETS_TO_TRACK);// Note: it's not guaranteed that we'll actually see an isall in this loop
// if countsA is higher than the max number of offsets tracked by bounty
// in that case nothing happens and the redundant constraint persists. no biggie
for(var i=0;i<toCheck;++i){TRACE('   - fetching #',i,'/',toCheck,'(',countsA,'|',BOUNTY_MAX_OFFSETS_TO_TRACK,')');var offset=bounty_getOffset(bounty,indexA,i);TRACE('   - #'+i,', offset =',offset);if(offset!==impOffset){var op=ml_dec8(ml,offset);if(op===ML_ISALL){TRACE(' - Found the isall...');if(_trick_implhs_isall_2shared(impOffset,offset,indexA,indexB))return true;}}}TRACE(' - end of trick_implhs_isall_2shared');return false;}function _trick_implhs_isall_2shared(impOffset,isallOffset,indexA,indexB){// A -> B, A = all?(B C D ...)     =>    drop imp
TRACE(' - _trick_implhs_isall_2shared; A -> B, A = all?(B C D ...)    =>    drop imp');ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL,'should be isall');// TRACE(ml__debug(ml, isallOffset, 1, problem, true));
var argCount=ml_dec16(ml,isallOffset+1);var indexR=readIndex(ml,isallOffset+SIZEOF_C+argCount*2);TRACE('     - isall with an argCount of',argCount,', indexR=',indexR,'=indexA=',indexA,', cross-checking all args to match',indexB);ASSERT(indexA===indexR,'A should be R, should be asserted by bounty');// Scan for any arg index == B
for(var i=0;i<argCount;++i){var argIndex=readIndex(ml,isallOffset+SIZEOF_C+i*2);if(argIndex===indexB){TRACE_MORPH('R -> A, R = all?(A ...)','R = all?(A ...)');TRACE('     - arg index is indexB, match. this is R -> A, R = all?(A ...) so eliminate the imp');ml_eliminate(ml,impOffset,SIZEOF_C_2);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();return true;}}return false;}function trick_isall_lterhs_entry(indexS,lteOffset,counts){// A <= S, S = all?(B C...)    ->    A <= B, A <= C
var offset1=bounty_getOffset(bounty,indexS,0);var offset2=bounty_getOffset(bounty,indexS,1);TRACE('trick_isall_lterhs_entry; ',indexS,'at',lteOffset,'->',offset1,offset2,'` A <= S, S = all?(B C...)    ->    A <= B, A <= C`');ASSERT(lteOffset===offset1||lteOffset===offset2,'expecting current offset to be one of the two offsets found',lteOffset,indexS);var isallOffset=lteOffset===offset1?offset2:offset1;// This stuff should have been checked by the bounty hunter, so we tuck them in ASSERTs
ASSERT(ml_dec8(ml,lteOffset)===ML_LTE,'lteOffset should be an lte');ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL,'isall offset should be either isall op');ASSERT(getMeta(bounty,indexS)===(BOUNTY_FLAG_LTE_RHS|BOUNTY_FLAG_ISALL_RESULT),'kind of redundant, but this is what bounty should have yielded for this var');ASSERT(counts===2,'S should only appear in two constraints');ASSERT((ml_dec8(ml,isallOffset)===ML_ISALL?readIndex(ml,isallOffset+SIZEOF_C+ml_dec16(ml,isallOffset+1)*2):readIndex(ml,isallOffset+5))===indexS,'S should the result of the isall');// We can replace an isall and lte with ltes on the args of the isall
// A <= S, S = isall(C D)   ->    A <= C, A <= D
// note that A amust be strict bool and A must have a 0 for this to be safe. S is our shared var here.
// [01] <= [01], [01] = isall(....)
// if you dont apply this condition:
// [0 0 5 5 9 9] <= [0 0 9 9], [0 0 9 9] = isall([55], [66])
// after the morph A _must_ be 0 or 5 while before it could also be 9.
var indexA=readIndex(ml,lteOffset+OFFSET_C_A);var A=getDomain(indexA,true);ASSERT(indexS===readIndex(ml,lteOffset+OFFSET_C_B),'S should be rhs of lte');var S=getDomain(indexS,true);// Mostly A will be [01] but dont rule out valid cases when A=0 or A=1
// A or C (or both) MUST be boolean bound or this trick may be bad (A=100,S=100,C=1,D=1 -> 100<=10,100<=10 while it should pass)
if(domain_max(A)>1&&domain_max(S)>1){TRACE(' - neither A nor S was boolean bound, bailing',domain__debug(A),domain__debug(S));return false;}if(domain_hasNoZero(S)){// (dead code because minifier should eliminate an isall when R>=1)
TRACE('- S has no zero which it would need to reflect any solution as a leaf, bailing',domain__debug(S));// (unless the isall was already solved, but the minimizer should take care of that)
requestAnotherCycle=true;return false;}if(domain_max(A)>domain_max(S)){// (dead code because minifier should eliminate an isall when R=0)
TRACE(' - max(A) > max(S) so there is a value in A that S couldnt satisfy A<=S so we must bail',domain__debug(A),domain__debug(S));// We can only trick if S can represent any valuation of A and there is a reject possible so no
// note that this shouldnt happen when the minimizer runs to the max, but could in single cycle mode
requestAnotherCycle=true;return false;}TRACE(' - A and S are okay proceeding with morph, A:',domain__debug(A),'S:',domain__debug(S));ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL,'bounty should have asserted this');var argCount=ml_dec16(ml,isallOffset+1);TRACE(' - an isall starting at',isallOffset,'and has',argCount,'args; rewriting A <= S, S=isall(X Y Z ...)  ->  A <= X, A <= Y, A <= Z, ...');var maxA=domain_max(A);for(var i=0;i<argCount;++i){var index=readIndex(ml,isallOffset+SIZEOF_C+i*2);var domain=getDomain(index,true);if(domain_max(domain)<maxA){TRACE(' - there is an isall arg whose max is lower than max(A), this leads to a lossy morph so we must bail',i,index,domain__debug(domain),'<',domain__debug(A));return false;}}if(argCount<2){TRACE(' - argcount < 2, so a bug or an alias. ignoring that here. bailing');return false;}// First encode the isall args beyond the second one (if any) into recycled spaces
if(argCount>2){var proceed=trick_isall_lterhs_entry_excess(ml,isallOffset,argCount,indexA);if(!proceed)return false;}// Now morph the first two args into the existing lte and isall (of same size)
var indexX=readIndex(ml,isallOffset+OFFSET_C_A);var indexY=readIndex(ml,isallOffset+OFFSET_C_B);TRACE(' -  A <= S, S=isall(X Y, ...(already done the rest))   ->    A <= X, A <= Y');// Must mark all affected vars. their bounty data is probably obsolete now.
// (collect the isall before morphing it!)
bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexS);var isallArgs=markAndCollectArgs(ml,isallOffset,argCount);ASSERT(isallArgs[0]===indexX,'x should be collected');ASSERT(isallArgs[1]===indexY,'y should be collected');TRACE(' - isall args:',isallArgs,', and from the lte A=',indexA,', S=',indexS);// Compile A<=left and A<=right over the existing two offsets
ml_c2c2(ml,lteOffset,2,ML_LTE,indexA,indexX);ml_cr2c2(ml,isallOffset,2,ML_LTE,indexA,indexY);TRACE('   - deferring',indexS,'will be gt',indexA,'and the result of an isall');solveStack.push(function(_,force,getDomain,setDomain){// Note: we cut out indexS so that's what we restore here!
TRACE(' - trick_isall_lterhs_entry; patching index',indexS);TRACE('   -',indexA,'<=',indexS,'  ->  ',domain__debug(getDomain(indexA)),'<=',domain__debug(getDomain(indexS)));TRACE('   -',indexS,'= all?(',isallArgs,')  ->  ',domain__debug(getDomain(indexS)),'= all?(',isallArgs.map(function(index){return domain__debug(getDomain(index));}),')');var S=getDomain(indexS);var A=getDomain(indexA);// Was A <= S so S can't contain any value lower than max(A)
S=domain_removeLtUnsafe(S,domain_max(A));ASSERT(S,'should not be empty here');// Was S = isall(X Y ...args) so force any arg that is not yet booly-solved until we find one that's 0
var someZero=false;for(var _i4=0;_i4<isallArgs.length;++_i4){var D=getDomain(isallArgs[_i4]);if(domain_isZero(D)||!domain_hasNoZero(S)&&force(D)===0){TRACE('  - index',isallArgs[_i4],'was',domain__debug(D),'now',domain__debug(getDomain(isallArgs[_i4])),', ends up zero so it fails the isall so S must be 0');// Either D was already zero, or it was booly and then forced to zero. it fails the isall so S=0
someZero=true;break;}}TRACE(' -',someZero?'at least one':'no','arg was found to be zero');if(someZero){S=domain_removeGtUnsafe(S,0);}else{S=domain_removeValue(S,0);}ASSERT(S,'S should not be empty here');setDomain(indexS,S);});somethingChanged();return true;}function trick_isall_lterhs_entry_excess(ml,isallOffset,argCount,indexA){// Isall has four or more args
// A <= S, S=isall(X Y Z ...)  ->  A <= X, A <= Y, A <= Z, ...
// note: this function only compiles the args from Z (the third isall arg) onward
TRACE(' - trick_isall_lterhs_entry_excess. Attempting to recycle space to stuff',argCount-2,'lte constraints');ASSERT(argCount>2,'this function should only be called for 4+ isall args');// We have to recycle some space now. we wont know whether we can
// actually do the morph until we've collected enough space for it.
// we'll use lteOffset and isallOffset to compile the last 2 args so only need space for the remaining ones
var toRecycle=argCount-2;// Start by collecting toRecycle recycled spaces
var bins=ml_getRecycleOffsets(ml,0,toRecycle,SIZEOF_C_2);if(!bins){TRACE(' - Was unable to find enough free space to fit',argCount,'ltes, bailing');return false;}TRACE(' - Found',bins.length,'jumps (',bins,') which can host (at least)',toRecycle,'lte constraints. Compiling them now');// Okay, now we'll morph. be careful about clobbering existing indexes... start with
// last address to make sure jumps dont clobber existing jump offsets in the bin
var i=0;while(i<toRecycle){var currentOffset=bins.pop();ASSERT(ml_dec8(ml,currentOffset)===ML_JMP,'should only get jumps here');// Might trap a case where we clobber
var size=ml_getOpSizeSlow(ml,currentOffset);ASSERT(size>=SIZEOF_C_2,'this is what we asked for');do{var indexB=readIndex(ml,isallOffset+SIZEOF_C+(i+2)*2);// Note: i+2 because we skip the first two args. they are done by caller
TRACE('  - compiling lte:',indexA,'<=',indexB,' -> ',domain__debug(getDomain(indexA,true)),'<=',domain__debug(getDomain(indexB,true)));ml_enc8(ml,currentOffset,ML_LTE);ml_enc16(ml,currentOffset+1,2);ml_enc16(ml,currentOffset+OFFSET_C_A,indexA);ml_enc16(ml,currentOffset+OFFSET_C_B,indexB);++i;size-=SIZEOF_C_2;currentOffset+=SIZEOF_C_2;}while(size>=SIZEOF_C_2&&i<toRecycle);if(size)ml_compileJumpSafe(ml,currentOffset,size);if(process.env.NODE_ENV!=='production'){ml_validateSkeleton(ml);// Cant check earlier
}}return true;}function trick_imprhs_isall_entry(indexS,impOffset,countsS,indexA){// A -> S, S = all?(B C...)    =>    A -> B, A -> C
var offset1=bounty_getOffset(bounty,indexS,0);var offset2=bounty_getOffset(bounty,indexS,1);TRACE('trick_imprhs_isall_entry; ',indexS,'at',impOffset,'=>',offset1,offset2,'`; A -> S, S = all?(B C...)    =>    A -> B, A -> C`');ASSERT(impOffset===offset1||impOffset===offset2,'expecting current offset to be one of the two offsets found',impOffset,indexS);var isallOffset=impOffset===offset1?offset2:offset1;// This stuff should have been checked by the bounty hunter, so we tuck them in ASSERTs
ASSERT(ml_dec8(ml,impOffset)===ML_IMP,'impOffset should be an imp');ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL,'isall offset should be either isall op');ASSERT(getMeta(bounty,indexS)===(BOUNTY_FLAG_IMP_RHS|BOUNTY_FLAG_ISALL_RESULT),'kind of redundant, but this is what bounty should have yielded for this var');ASSERT(countsS===2,'S should only appear in two constraints');ASSERT((ml_dec8(ml,isallOffset)===ML_ISALL?readIndex(ml,isallOffset+SIZEOF_C+ml_dec16(ml,isallOffset+1)*2):readIndex(ml,isallOffset+5))===indexS,'S should the result of the isall');ASSERT(readIndex(ml,impOffset+OFFSET_C_A)===indexA,'A should be lhs of IMP');// We can replace an isall and IMP with IMPs on the args of the isall
// A -> S, S = isall(C D)    =>     A -> C, A -> D
// note that A must be strict bool and A must have a 0 for this to be safe. S is our shared var here.
// [01] -> [01], [01] = isall(....)
// if you dont apply this condition:
// [0 0 5 5 9 9] -> [0 0 9 9], [0 0 9 9] = isall([55], [66])
// after the morph A _must_ be 0 or 5 while before it could also be 9.
var A=getDomain(indexA,true);ASSERT(indexS===readIndex(ml,impOffset+OFFSET_C_B),'S should be rhs of IMP');var S=getDomain(indexS,true);// Mostly A will be [01] but dont rule out valid cases when A=0 or A=1
if(domain_max(A)>1&&domain_max(S)>1){TRACE(' - neither A nor S was boolean bound, bailing',domain__debug(A),domain__debug(S));return false;}if(domain_hasNoZero(S)){// (dead code because minifier should eliminate an isall when R>=1)
TRACE('- S has no zero which it would need to reflect any solution as a leaf, bailing',domain__debug(S));// (unless the isall was already solved, but the minimizer should take care of that)
requestAnotherCycle=true;return false;}if(domain_max(A)>domain_max(S)){// (dead code because minifier should eliminate an isall when R=0)
TRACE(' - max(A) > max(S) so there is a value in A that S couldnt satisfy A->S so we must bail',domain__debug(A),domain__debug(S));// We can only trick if S can represent any valuation of A and there is a reject possible so no
// note that this shouldnt happen when the minimizer runs to the max, but could in single cycle mode
requestAnotherCycle=true;return false;}TRACE(' - A and S are okay proceeding with morph, ',domain__debug(A),'->',domain__debug(S));ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL,'bounty should have asserted this');var argCount=ml_dec16(ml,isallOffset+1);TRACE(' - an isall starting at',isallOffset,'and has',argCount,'args; rewriting A -> S, S=isall(X Y Z ...)  =>  A -> X, A -> Y, A -> Z, ...');if(argCount<2){TRACE(' - argcount < 2, so a bug or an alias. ignoring that here. bailing');requestAnotherCycle=true;// Minifier should tear this down
return false;}// First encode the isall args beyond the second one (if any) into recycled spaces
if(argCount>2){var proceed=trick_imprhs_isall_entry_excess(ml,isallOffset,argCount,indexA);if(!proceed)return false;}// Now morph the first two args into the existing IMP and isall (of same size)
var indexX=readIndex(ml,isallOffset+OFFSET_C_A);var indexY=readIndex(ml,isallOffset+OFFSET_C_B);TRACE(' -  A -> S, S=isall(X Y, ...(already done the rest))   =>    A -> X, A -> Y');// Must mark all affected vars. their bounty data is probably obsolete now.
// (collect the isall before morphing it!)
bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexS);var isallArgs=markAndCollectArgs(ml,isallOffset,argCount);ASSERT(isallArgs[0]===indexX,'x should be collected');ASSERT(isallArgs[1]===indexY,'y should be collected');TRACE(' - isall args:',isallArgs,', and from the IMP A=',indexA,', S=',indexS);// Compile A->left and A->right over the existing two offsets
ml_c2c2(ml,impOffset,2,ML_IMP,indexA,indexX);ml_cr2c2(ml,isallOffset,argCount,ML_IMP,indexA,indexY);TRACE('   - deferring',indexS,'will be gt',indexA,'and the result of an isall');solveStack.push(function(_,force,getDomain,setDomain){// Note: we cut out indexS so that's what we restore here!
TRACE(' - trick_imprhs_isall_entry; patching index',indexS);TRACE('   -',indexA,'->',indexS,'  =>  ',domain__debug(getDomain(indexA)),'->',domain__debug(getDomain(indexS)));TRACE('   -',indexS,'= all?(',isallArgs,')  =>  ',domain__debug(getDomain(indexS)),'= all?(',isallArgs.map(function(index){return domain__debug(getDomain(index));}),')');var S=getDomain(indexS);var A=getDomain(indexA);TRACE(' - must first scan whether S ought to be set or unset according to the other imp/isall args');// Check whether S is forced at all by the imp or isall
var isSet=false;var isUnset=false;TRACE(' - A->S so if A is set, S must be set; A>0?',domain_hasNoZero(A));if(domain_hasNoZero(A)){TRACE(' - A is set so S must be set');isSet=true;}TRACE(' - check the "set" state of all args');var allSet=true;for(var i=0;i<argCount;++i){var index=isallArgs[i];var D=getDomain(index);TRACE('    - index:',index,', D:',domain__debug(D));if(domain_isZero(D)){TRACE('    - isall had an arg that was zero so S must be zero');isUnset=true;allSet=false;break;}else if(domain_hasZero(D)){TRACE('    - isall had at least one arg that wasnt set yet so the isall does not force S to be set, at least');allSet=false;}}if(allSet){TRACE(' - all args of the isall were set so S must be set');isSet=true;}TRACE(' - result of scan: set?',isSet,', unset?',isUnset);ASSERT(!(isSet&&isUnset),'shouldnt be both set and unset');var result=false;if(isSet){setDomain(indexS,domain_removeValue(S,0));result=true;}else if(isUnset){setDomain(indexS,domain_removeGtUnsafe(S,0));result=false;}else{result=force(indexS)>0;TRACE(' - forced S to',result);}TRACE(' - now apply the state of S=',result?1:0,' to the other args');TRACE('   -',domain__debug(getDomain(indexA)),'->',result?1:0);TRACE('   -',result?1:0,'= all?(',isallArgs.map(function(index){return domain__debug(getDomain(index));}),')');// A -> S so if S=0 then A=0
if(!result){TRACE(' - A->S, S=0 so A=0');setDomain(indexA,domain_removeGtUnsafe(A,0));}var found=false;for(var _i5=0;_i5<argCount;++_i5){var _index3=isallArgs[_i5];var _D3=getDomain(_index3);if(result){// True=isall(...D) so D>0
TRACE(' - S>0 so all args must be >0');setDomain(_index3,domain_removeValue(_D3,0));}else if(domain_isZero(_D3)){found=true;break;}else if(domain_hasZero(_D3)){// False=isall(...D) so D=0
TRACE(' - S=0 so one arg must be 0');setDomain(_index3,domain_removeGtUnsafe(_D3,0));found=true;break;}}TRACE(' - final result:');TRACE('   -',domain__debug(getDomain(indexA)),'->',result?1:0);TRACE('   -',result?1:0,'= all?(',isallArgs.map(function(index){return domain__debug(getDomain(index));}),')');ASSERT(getDomain(indexA));ASSERT(getDomain(indexS));ASSERT(!isallArgs.some(function(index){return !getDomain(index);}));ASSERT(domain_hasNoZero(getDomain(indexA))?domain_hasNoZero(getDomain(indexS)):1);ASSERT(domain_isZero(getDomain(indexS))?domain_isZero(getDomain(indexA)):1);ASSERT(domain_isSolved(getDomain(indexS)));ASSERT(domain_isZero(getDomain(indexS))===isallArgs.some(function(index){return domain_isZero(getDomain(index));}));ASSERT(result||found,'if result is false at least one arg should be false');});somethingChanged();return true;}function trick_imprhs_isall_entry_excess(ml,isallOffset,argCount,indexA){// Isall has four or more args
// A -> S, S=isall(X Y Z ...)  =>  A -> X, A -> Y, A -> Z, ...
// note: this function only compiles the args from Z (the third isall arg) onward
TRACE(' - trick_imprhs_isall_entry_excess. Attempting to recycle space to stuff',argCount-2,'IMP constraints');ASSERT(argCount>2,'this function should only be called for 3+ isall args');// We have to recycle some space now. we wont know whether we can
// actually do the morph until we've collected enough space for it.
// we'll use impOffset and isallOffset to compile the last 2 args so only need space for the remaining ones
var toRecycle=argCount-2;// Start by collecting toRecycle recycled spaces
var bins=ml_getRecycleOffsets(ml,0,toRecycle,SIZEOF_C_2);if(!bins){TRACE(' - Was unable to find enough free space to fit',argCount,'IMPs, bailing');return false;}TRACE(' - Found',bins.length,'jumps (',bins,') which can host (at least)',toRecycle,'IMP constraints. Compiling them now');// Okay, now we'll morph. be careful about clobbering existing indexes... start with
// last address to make sure jumps dont clobber existing jump offsets in the bin
var i=0;while(i<toRecycle){var currentOffset=bins.pop();ASSERT(ml_dec8(ml,currentOffset)===ML_JMP,'should only get jumps here');// Might trap a case where we clobber
var size=ml_getOpSizeSlow(ml,currentOffset);ASSERT(size>=SIZEOF_C_2,'this is what we asked for');do{var indexB=readIndex(ml,isallOffset+SIZEOF_C+(i+2)*2);// Note: i+2 because we skip the first two args. they are done by caller
TRACE('  - compiling IMP:',indexA,'->',indexB,' -> ',domain__debug(getDomain(indexA,true)),'->',domain__debug(getDomain(indexB,true)));ml_enc8(ml,currentOffset,ML_IMP);ml_enc16(ml,currentOffset+1,2);ml_enc16(ml,currentOffset+OFFSET_C_A,indexA);ml_enc16(ml,currentOffset+OFFSET_C_B,indexB);++i;size-=SIZEOF_C_2;currentOffset+=SIZEOF_C_2;}while(size>=SIZEOF_C_2&&i<toRecycle);if(size)ml_compileJumpSafe(ml,currentOffset,size);if(process.env.NODE_ENV!=='production'){ml_validateSkeleton(ml);// Cant check earlier
}}return true;}function trick_issame_lterhs(indexR,lteOffset,countsR,indexC){TRACE('trick_issame_lterhs');TRACE('   - R = A ==? B, C <= R    =>       R = A ==? B, C -> R');TRACE('   - (if the requirements hold it only morphs an lte to an imp)');ASSERT(countsR===2,'should be leaf var');// Prerequisites: all bools, R leaf (the latter has been confirmed)
var offset1=bounty_getOffset(bounty,indexR,0);var offset2=bounty_getOffset(bounty,indexR,1);var issameOffset=offset1===lteOffset?offset2:offset1;ASSERT(ml_dec8(ml,issameOffset)===ML_ISSAME,'should be issame');ASSERT(readIndex(ml,issameOffset+OFFSET_C_R)===indexR,'issame result should be R');if(ml_dec16(ml,issameOffset+1)!==2){TRACE(' - isall does not have 2 args, bailing');return false;}var indexA=readIndex(ml,issameOffset+OFFSET_C_A);var indexB=readIndex(ml,issameOffset+OFFSET_C_B);var A=getDomain(indexA,true);var B=getDomain(indexB,true);var C=getDomain(indexC,true);var R=getDomain(indexR,true);TRACE(' - domains; A=',domain__debug(A),', B=',domain__debug(B),', C=',domain__debug(C),', R=',domain__debug(R));if(!domain_isBool(A)||!domain_isBool(B)||!domain_isBool(C)||!domain_isBool(R)){TRACE(' - at least one of the three domains isnt bool, bailing');return false;}// Okay. morph the lte into implication
TRACE(' - morphing, R = A ==? B, C <= R      =>       R = A ==? B, C -> R');ml_c2c2(ml,lteOffset,2,ML_IMP,indexC,indexR);// Dont mark A or B because we did not change their ops
bounty_markVar(bounty,indexC);bounty_markVar(bounty,indexR);somethingChanged();return true;}function trick_isall_nall_2shared(ml,indexR,isallOffset,counts){// R = all?(A B), nall(R A D)   ->    R = all?(A B), R !& D
var offset1=bounty_getOffset(bounty,indexR,0);var offset2=bounty_getOffset(bounty,indexR,1);TRACE('trick_isall_nall_2shared',indexR,'at',isallOffset,'and',offset1,'/',offset2,'metaFlags:',getMeta(bounty,indexR,true),'`R = all?(A B), nall(R A D)`   ->    `R = all?(A B), R !& D`');var nallOffset=offset1===isallOffset?offset2:offset1;var argCountNall=ml_dec16(ml,nallOffset+1);var argCountIsall=ml_dec16(ml,isallOffset+1);// This stuff should have been checked by the bounty hunter, so we tuck them in ASSERTs
ASSERT(getMeta(bounty,indexR)===(BOUNTY_FLAG_NALL|BOUNTY_FLAG_ISALL_RESULT),'the var should only be part of a nall and the result of an isall');ASSERT(counts===2,'R should only appear in two constraints');ASSERT(isallOffset===offset1||isallOffset===offset2,'expecting current offset to be one of the two offsets found',isallOffset,indexR);ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL,'isall offset should be an isall');ASSERT(ml_dec8(ml,nallOffset)===ML_NALL,'other offset should be a nall');ASSERT(getAlias(indexR)===indexR,'should be unaliased');ASSERT(readIndex(ml,isallOffset+SIZEOF_C+argCountIsall*2)===indexR,'var should be R of isall');// This should be `R = all?(A B ...), nall(R A D)`
// if R = 1 then A and B (etc) are 1, so the nall will have two 1's, meaning D must be 0
// if R = 0 then the nall is already satisfied. neither the nall nor the isall is redundant
// because `R !& D` must be maintained, so remove the shared arg from the nall
if(argCountNall!==3){TRACE(' - fingerprint didnt match (',argCountNall,' !== 3) so bailing');return false;}// (this is kind of dead code since isall1 wont get 2 args and that's required for this trick)
TRACE(' - nall has 3 args, check if it shares an arg with the isall');// Next; one of the two isalls must occur in the nall
// R = all?(A B), nall(R A C)
// R = all?(A B), nall(X Y Z)
// nall args
var indexX=readIndex(ml,nallOffset+SIZEOF_C);var indexY=readIndex(ml,nallOffset+SIZEOF_C+2);var indexZ=readIndex(ml,nallOffset+SIZEOF_C+4);TRACE(' - nall('+[indexX,indexY,indexZ]+') -> nall(',[domain__debug(getDomain(indexX,true)),domain__debug(getDomain(indexY)),domain__debug(getDomain(indexZ))],')');for(var i=0;i<argCountIsall;++i){var argIndex=readIndex(ml,isallOffset+SIZEOF_C+i*2);if(argIndex===indexX)return _updateNallForTrick(ml,nallOffset,indexY,indexZ,indexX);if(argIndex===indexY)return _updateNallForTrick(ml,nallOffset,indexX,indexZ,indexY);if(argIndex===indexZ)return _updateNallForTrick(ml,nallOffset,indexX,indexY,indexZ);}TRACE(' - no shared args');return false;}function _updateNallForTrick(ml,offset,indexA,indexB,indexDropped){TRACE(' - isall arg matches an arg of nall. dropping it from the nall');// Since we know the nall has 3 args we can simply write the two args we want and a noop for the last position
// keep A and B, the other index is dropped because we're writing a noop in its place
ASSERT(ml_dec8(ml,offset)===ML_NALL,'should be nall');ASSERT(ml_dec16(ml,offset+1)===3,'nall should have 3 args');ml_enc16(ml,offset+1,2);// Down from 3 to 2 args
ml_enc16(ml,offset+OFFSET_C_A,indexA);ml_enc16(ml,offset+OFFSET_C_B,indexB);ml_enc8(ml,offset+OFFSET_C_C,ML_NOOP2);// This only affected the nall and its args so no need to mark the isall vars
bounty_markVar(bounty,indexDropped);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();return true;}function trick_ltelhs_nall_leaf(ml,indexA,countsA){// A <= B, A !& C   ->   A leaf, all constraints dropped. for _any_ lte_lhs / nall
TRACE('trick_ltelhs_nall_leaf; bounty A:',bounty__debug(bounty,indexA));TRACE(' - indexA=',indexA,'; `A <= B, A !& C   ->   nothing (for any number of LTE_LHS and NAND ops).');TRACE('   - A=',domain__debug(getDomain(indexA)),'; if it has a zero it can never break LTE_LHS or NALL');// Rationale; assuming A has at least a zero, there's no valuation of B or C that could lead to breaking
// the <= or !& constraints. so A can still be considered a leaf var.
// note that the number of args of the NALL is irrelevant
ASSERT(getMeta(bounty,indexA)===BOUNTY_FLAG_LTE_LHS||getMeta(bounty,indexA)===BOUNTY_FLAG_NALL||getMeta(bounty,indexA)===(BOUNTY_FLAG_NALL|BOUNTY_FLAG_LTE_LHS),'the var should only be lhs of LTEs or part of NALLs');ASSERT(getAlias(indexA)===indexA,'should be unaliased');// TODO: what if there aren't any NALLs? then A could still be a leaf even if it was nonzero
// A must contain zero for this to work for else it may not solve the nall
if(domain_hasNoZero(getDomain(indexA,true))){TRACE(' - A contains no zero, bailing');return false;}// No need for further verification.
TRACE(' - marking LTE/NALL args, eliminating the constraints');for(var i=0;i<countsA;++i){var offset=bounty_getOffset(bounty,indexA,i);var opCode=ml_dec8(ml,offset);TRACE('    - next op:',ml__debug(ml,offset,1,problem));if(opCode===ML_LTE){ASSERT(readIndex(ml,offset+OFFSET_C_A)===indexA,'A should (at least) be LTE_LHS');ASSERT(readIndex(ml,offset+1)===2,'LTE is assumed to always have 2 args');var index=readIndex(ml,offset+OFFSET_C_B);if(index!==indexA){bounty_markVar(bounty,index);ml_eliminate(ml,offset,SIZEOF_C_2);}}else if(opCode===ML_NALL){var argCount=readIndex(ml,offset+1);for(var j=0;j<argCount;++j){var _index4=readIndex(ml,offset+SIZEOF_C+j*2);if(_index4!==indexA){bounty_markVar(bounty,_index4);}}ml_eliminate(ml,offset,SIZEOF_C+argCount*2);}else{ASSERT(false,'bounty should have asserted A to only be LTE_LHS and NALL so this cant happen?');TRACE(' - the unthinkable happened, bailing');// *Shrug* it's not a problem to throw for
return false;}}// Note: We could go through great lengths in an effort to reduce A as little as possible but since
// this trick involves any number of NALLs and LTEs, this leads to a bunch of difficult checks and
// heuristics. And even then we're still very likely to set A to zero anyways.
// Let's save us the code head ache here and just do it now.
TRACE(' - setting A to zero for the sake of simplicity');var A=getDomain(indexA,true);var nA=domain_removeGtUnsafe(A,0);if(A!==nA)setDomain(indexA,nA);bounty_markVar(bounty,indexA);somethingChanged();return true;}function trick_implhs_nall_leaf(ml,indexA,countsA){// For all A, A -> B, A !& C   =>   cut A, all constraints dropped. for _any_ imp_lhs / nall on A
TRACE('trick_implhs_nall_leaf');TRACE(' - indexA=',indexA,', bounty A:',bounty__debug(bounty,indexA));TRACE_MORPH('A -> B, A !& C','');TRACE('   - A=',domain__debug(getDomain(indexA)),'; if it has a zero it can never break IMP_LHS or NALL');// Rationale; assuming A has at least a zero, there's no valuation of B or C that could lead to breaking
// the -> or !& constraints. so A can still be considered a leaf var.
// note that the number of args of the NALL is irrelevant
ASSERT(getMeta(bounty,indexA)===BOUNTY_FLAG_IMP_LHS||getMeta(bounty,indexA)===BOUNTY_FLAG_NALL||getMeta(bounty,indexA)===(BOUNTY_FLAG_NALL|BOUNTY_FLAG_IMP_LHS),'the var should only be lhs of IMPs or part of NALLs');ASSERT(getAlias(indexA)===indexA,'should be unaliased');// TODO: what if there aren't any NALLs? then A could still be a leaf even if it was nonzero
// A must contain zero for this to work for else A may not solve the nall
if(domain_hasNoZero(getDomain(indexA,true))){TRACE(' - A contains no zero, bailing');requestAnotherCycle=true;return false;}// No need for further verification.
// A is only the IMP_LHS or NALL arg
// if we set it to 0 here then those immediately solve
// we could go into great code complexity here handling everything nicely
// or we could just set it to 0 here and request another run. oh yes.
TRACE_MORPH('A -> B, A !& C','A=0');TRACE(' - setting A to zero for the sake of simplicity');var A=getDomain(indexA,true);if(!domain_isZero(A)){var nA=domain_removeGtUnsafe(A,0);if(A!==nA)setDomain(indexA,nA);bounty_markVar(bounty,indexA);}somethingChanged();// This will require another minimizer as well
return true;}function trick_ltelhs_some_leaf(ml,lteOffset,indexA,countsA){// A <= B, A | C   =>   B | C, A leaf
TRACE('trick_ltelhs_some_leaf');TRACE(' - A <= B, some(A C ...)     =>     some(B C ...), A leaf');var A=getDomain(indexA,true);TRACE(' - indexA=',indexA,', =',domain__debug(A));ASSERT(getMeta(bounty,indexA)===(BOUNTY_FLAG_LTE_LHS|BOUNTY_FLAG_SOME),'A is leaf on an LTE and SOME');ASSERT(getAlias(indexA)===indexA,'should be unaliased');ASSERT(countsA===2,'should have 2 offsets');if(!domain_isBool(A)){TRACE(' - A wasnt a bool, bailing');return false;}var indexB=readIndex(ml,lteOffset+OFFSET_C_B);var B=getDomain(indexB,true);if(!domain_isBool(B)){TRACE(' - B wasnt a bool, bailing');return false;}TRACE(' - constraints verified, applying trick');TRACE_MORPH('A <= B, some(A C ...)','some(B C ...)');var offset1=bounty_getOffset(bounty,indexA,0);var offset2=bounty_getOffset(bounty,indexA,1);var someOffset=offset1===lteOffset?offset2:offset1;ASSERT(ml_dec8(ml,someOffset)===ML_SOME);// Note: arg count of the SOME is not important. A must simply be part of it (and bounty asserted that already)
var argCount=ml_dec16(ml,someOffset+1);var args=markAndCollectArgs(ml,someOffset,argCount,indexA);ml_eliminate(ml,lteOffset,SIZEOF_C_2);ml_cx2cx(ml,someOffset,argCount,ML_SOME,[indexB].concat(args));solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_ltelhs_some_leaf');TRACE(' - A <= B, some(A C ...)    =>     some(B C ...)');var A=getDomain(indexA);var B=getDomain(indexB);var nA=A;// Ensure A<=B
if(domain_max(nA)>domain_min(B)){nA=domain_removeGtUnsafe(nA,domain_min(B));}// Ensure the SOME holds
if(!domain_isZero(nA)){var removeZero=true;// Without other args, A must be nonzero to satisfy the SOME
for(var i=0,len=args.length;i<len;++i){var index=args[i];var D=getDomain(index);if(domain_hasNoZero(D)){// At least one arg already satisfies the SOME
break;}if(domain_isBooly(D)){removeZero=true;// At least one arg is undetermined so to make sure its value is irrelevant we set A>0
break;}removeZero=false;}if(removeZero){nA=domain_removeValue(nA,0);}}ASSERT(nA,'A should hold all values');if(A!==nA)setDomain(indexA,nA);});bounty_markVar(bounty,indexA);somethingChanged();return true;}function trick_implhs_some_leaf(ml,impOffset,indexA,countsA){// A -> B, A | C   =>   B | C, A leaf
TRACE('trick_implhs_some_leaf');TRACE(' - A -> B, some(A C ...)     =>     some(B C ...), A leaf');var A=getDomain(indexA,true);TRACE(' - indexA=',indexA,', =',domain__debug(A));ASSERT(getMeta(bounty,indexA)===(BOUNTY_FLAG_IMP_LHS|BOUNTY_FLAG_SOME),'A is leaf on an IMP and SOME');ASSERT(getAlias(indexA)===indexA,'should be unaliased');ASSERT(countsA===2,'should have 2 offsets');if(!domain_isBool(A)){TRACE(' - A wasnt a bool, bailing');return false;}var indexB=readIndex(ml,impOffset+OFFSET_C_B);var B=getDomain(indexB,true);if(!domain_isBool(B)){TRACE(' - B wasnt a bool, bailing');return false;}TRACE(' - constraints verified, applying trick');TRACE_MORPH('A -> B, some(A C ...)','some(B C ...)');var offset1=bounty_getOffset(bounty,indexA,0);var offset2=bounty_getOffset(bounty,indexA,1);var someOffset=offset1===impOffset?offset2:offset1;ASSERT(ml_dec8(ml,someOffset)===ML_SOME);// Note: arg count of the SOME is not important. A must simply be part of it (and bounty asserted that already)
var argCount=ml_dec16(ml,someOffset+1);var args=markAndCollectArgs(ml,someOffset,argCount,indexA);ml_eliminate(ml,impOffset,SIZEOF_C_2);ml_cx2cx(ml,someOffset,argCount,ML_SOME,[indexB].concat(args));solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_implhs_some_leaf');TRACE(' - A -> B, some(A C ...)    =>     some(B C ...)');var A=getDomain(indexA);var B=getDomain(indexB);var nA=A;// Ensure A->B
if(domain_hasNoZero(B)){nA=domain_removeValue(nA,0);}else{nA=domain_removeGtUnsafe(nA,0);}// Ensure the SOME holds
if(!domain_isZero(nA)){var removeZero=true;// Without other args, A must be nonzero to satisfy the SOME
for(var i=0,len=args.length;i<len;++i){var index=args[i];var D=getDomain(index);if(domain_hasNoZero(D)){// At least one arg already satisfies the SOME
break;}if(domain_isBooly(D)){removeZero=true;// At least one arg is undetermined so to make sure its value is irrelevant we set A>0
break;}removeZero=false;}if(removeZero){nA=domain_removeValue(nA,0);}}ASSERT(nA,'A should hold all values');if(A!==nA)setDomain(indexA,nA);});bounty_markVar(bounty,indexA);somethingChanged();return true;}function trick_imp_islte_c_v(islteOffset,indexR,indexA,indexB,countsR){TRACE('trick_imp_islte_c_v');TRACE(' - R = A <=? B, B -> R, solved(A)  =>  R = A <=? B');// First search for the imp offset
for(var i=0;i<countsR;++i){var offset=bounty_getOffset(bounty,indexR,i);if(offset!==islteOffset){var op=ml_dec8(ml,offset);if(op===ML_IMP){if(readIndex(ml,offset+OFFSET_C_A)===indexB&&readIndex(ml,offset+OFFSET_C_B)===indexR){return _trick_imp_islte_c_v(indexR,indexA,indexB,islteOffset,offset);}}}}ASSERT(false,'bounty should have asserted this imp exists');return false;}function _trick_imp_islte_c_v(indexR,indexA,indexB,islteOffset,impOffset){TRACE(' - _trick_imp_islte_c_v; R = A <=? B, B -> R   =>   R !^ B, remove [1..A-1] from B');ASSERT(domain_isSolved(getDomain(indexA)));// Note:
// - if R=0 then B->R then B->0 then 0->0 so B=0
// - if R>0 then B->R always holds and R=vA<=?B holds when B>=vA
// - if vA<=min(B) then R>0 because vA cannot be >B
// - if vA>max(B) then R=0 because vA cannot be <=B
// so R !^ B and remove from B all values from 1 up to but not including vA
// [01] = 2 <=? [02], [02] -> [01]
// R=0
// => 0 = 2 <=? [02], [02] -> 0
// => 2 > [02], [02] -> 0
// => 2 > 0, 0 -> 0
// R>0
// => 1 = 2 <=? [02], [02] -> 1
// => 2 <= [02], [02] -> 1
// => 2 <= 2, 2 -> 1
// [01] = 5 <=? [09], [09] -> [01]
// R=0
// => 0 = 2 <=? [09], [09] -> 0
// => 2 > [09], [09] -> 0
// => 2 > [01], [01] -> 0
// => 2 > 0, 0 -> 0
// R>0
// => 1 = 2 <=? [09], [09] -> 1
// => 2 <= [09], [09] -> 1
// => 2 <= [29], [29] -> 1
var A=getDomain(indexA,true);var B=getDomain(indexB,true);var vA=domain_getValue(A);TRACE(' - first checking;',vA,'<=',domain_min(B),' and ',vA,'>',domain_max(B));if(vA<=domain_min(B)){// R>0 because if R=0 then A>B and that's not possible
// let minimizer take this down
TRACE(' - A<=min(B) means R>0, minimizer can solve this, bailing');requestAnotherCycle=true;return false;}if(vA>domain_max(B)){TRACE(' - A > max(B), minimizer can solve this, bailing');requestAnotherCycle=true;return false;}TRACE_MORPH('R = A <=? B, B -> R','R !^ B, remove [1..A-1] from B');TRACE(' - indexes: A=',indexA,', B=',indexB,', R=',indexR);TRACE(' - domains: A=',domain__debug(getDomain(indexA)),', B=',domain__debug(getDomain(indexB)),', R=',domain__debug(getDomain(indexR)));// Create a mask that removes 1..A then intersect B with that mask (because B may already be missing more values)
var mask=domain_arrToSmallest([0,0,vA,domain_max(B)]);var nB=domain_intersection(B,mask);TRACE(' - B mask:',domain__debug(mask),', B after mask:',domain__debug(mask));// Probably the same
if(B!==nB){setDomain(indexB,nB);if(!nB)return emptyDomain=true;}ml_c2c2(ml,impOffset,2,ML_XNOR,indexR,indexB);ml_eliminate(ml,islteOffset,SIZEOF_VVV);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();return true;}function trick_imp_islte_v_c(islteOffset,indexR,indexA,indexB,countsR){TRACE('trick_imp_islte_c_v');TRACE(' - R = A <=? B, A -> R, solved(B)  =>  R > 0, A <= B');// First search for the imp offset
for(var i=0;i<countsR;++i){var offset=bounty_getOffset(bounty,indexR,i);if(offset!==islteOffset){var op=ml_dec8(ml,offset);if(op===ML_IMP){if(readIndex(ml,offset+OFFSET_C_A)===indexA&&readIndex(ml,offset+OFFSET_C_B)===indexR){return _trick_imp_islte_v_c(indexR,indexA,indexB,islteOffset,offset);}}}}ASSERT(false,'bounty should have asserted this imp exists');return false;}function _trick_imp_islte_v_c(indexR,indexA,indexB,islteOffset,impOffset){TRACE(' - _trick_imp_islte_c_v');ASSERT(domain_isSolved(getDomain(indexB)));// Note:
// - if R=0 then A > vB then A>0 then A->R so R>0 then falsum
// - if R>0 then A <= vB then A->R always holds because R>0
// - so R>0, islte becomes lte, imp is eliminated
var R=getDomain(indexR,true);R=domain_removeValue(R,0);if(!R){emptyDomain=true;return false;}var A=getDomain(indexA,true);var B=getDomain(indexB,true);if(domain_getValue(B)<=domain_min(A)){TRACE(' - B <= min(A), minimizer can solve this, bailing');requestAnotherCycle=true;return false;}TRACE_MORPH('R = A <=? B, A -> R','R > 0, A <= B');TRACE(' - indexes: A=',indexA,', B=',indexB,', R=',indexR);TRACE(' - domains: A=',domain__debug(getDomain(indexA)),', B=',domain__debug(getDomain(indexB)),', R=',domain__debug(getDomain(indexR)));setDomain(indexR,R);ml_c2c2(ml,impOffset,2,ML_LTE,indexA,indexB);ml_eliminate(ml,islteOffset,SIZEOF_VVV);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);somethingChanged();return true;}function trick_only_ltelhs_leaf(ml,indexA,countsA){TRACE('trick_only_ltelhs_leaf; bounty A:',bounty__debug(bounty,indexA));TRACE(' - A should only be an LTE_LHS for any number of LTE ops. cut it as a leaf and eliminate constraints');// There is no way A breaks any LTEs unless there's already an rhs var that is smaller than it
// no need to check here. just go.
var A=getDomain(indexA,true);var rhsArgs=[];for(var i=0;i<countsA;++i){var offset=bounty_getOffset(bounty,indexA,i);TRACE('    - next op:',ml__debug(ml,offset,1,problem));ASSERT(ml_dec8(ml,offset)===ML_LTE);ASSERT(ml_dec16(ml,offset+1)===2,'all LTE have 2 args');ASSERT(readIndex(ml,offset+OFFSET_C_A)===indexA,'A should be the lhs');var indexB=readIndex(ml,offset+OFFSET_C_B);if(domain_max(getDomain(indexB))<domain_min(A)){TRACE(' indexB=',indexB,'and it is already smaller than A;',domain__debug(A),'>',domain__debug(getDomain(indexB)));TRACE(' constraint cant hold, empty domain, rejecting');setDomain(indexB,0);return true;// "true" as in "something awful happened"
}rhsArgs.push(indexB);ml_eliminate(ml,offset,SIZEOF_C_2);}TRACE(' - Adding solve stack entry');solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_only_ltelhs_leaf; shaving A to pass all LTEs');var A=getDomain(indexA);var nA=A;for(var _i6=0,il=rhsArgs.length;_i6<il;++_i6){var _indexB=rhsArgs[_i6];TRACE('   - removing everything >',domain_min(getDomain(_indexB)),'from',domain__debug(nA));nA=domain_removeGtUnsafe(nA,domain_min(getDomain(_indexB)));}ASSERT(nA,'A should be able to be <= all the index B args');if(A!==nA)setDomain(indexA,nA);});bounty_markVar(bounty,indexA);for(var _i7=0,il=rhsArgs.length;_i7<il;++_i7){bounty_markVar(bounty,rhsArgs[_i7]);}somethingChanged();return true;}function trick_only_implhs_leaf(ml,indexA,countsA){TRACE('trick_only_implhs_leaf; bounty A:',bounty__debug(bounty,indexA));TRACE(' - A should only be an IMP_LHS for any number of IMP ops. confirm none of the Bs are zero. then cut it as a leaf and eliminate constraints');var A=getDomain(indexA,true);if(domain_isZero(A)||domain_hasNoZero(A)){TRACE(' - A is not a booly. implication is resolved, let minimizer take care of it, bailing');requestAnotherCycle=true;// Force minimizer to take care of this one
return false;}// The only way A breaks any IMPs is if it has an rhs that is zero. so check that first.
for(var i=0;i<countsA;++i){var offset=bounty_getOffset(bounty,indexA,i);TRACE('    - next op:',ml__debug(ml,offset,1,problem));ASSERT(ml_dec8(ml,offset)===ML_IMP);ASSERT(readIndex(ml,offset+OFFSET_C_A)===indexA,'A should be the lhs');var indexB=readIndex(ml,offset+OFFSET_C_B);if(domain_isZero(indexB)){TRACE(' - indexB=',indexB,'and is already zero;',domain__debug(A),'->',domain__debug(getDomain(indexB)));TRACE(' - implication is resolved, let minimizer take care of it, bailing');requestAnotherCycle=true;// Force minimizer to take care of this one
return false;}}TRACE_MORPH('A -> B, A -> C, ...','A==0');var rhsArgs=[];for(var _i8=0;_i8<countsA;++_i8){var _offset=bounty_getOffset(bounty,indexA,_i8);var _indexB2=readIndex(ml,_offset+OFFSET_C_B);rhsArgs.push(_indexB2);ml_eliminate(ml,_offset,SIZEOF_C_2);}// TODO: could potentially improve "force" choice here but A=0 is definitely the simplest play
TRACE(' - forcing A to 0 since thats the most likely outcome anyways and the safest play here');var nA=domain_intersectionValue(A,0);ASSERT(nA!==A,'since A was confirmed to be a booly before it should be different now');ASSERT(nA,'since A was a booly we should be able to set it to 0');setDomain(indexA,nA);bounty_markVar(bounty,indexA);for(var _i9=0,il=rhsArgs.length;_i9<il;++_i9){bounty_markVar(bounty,rhsArgs[_i9]);}somethingChanged();return true;}function trick_isall_nall_1shared(ml,indexR,isallOffset,countsR){// R = all?(A B ...), R !& C  ->  nall(A B ... C)
// note: this works for any nalls on one isall
TRACE('trick_isall_nall_1shared;',indexR,'`R = all?(A B), R !& C  ->  nall(A B C)` for any nall on one isall, any arg count for either');// This stuff should have been checked by the bounty hunter, so we tuck them in ASSERTs
ASSERT(getMeta(bounty,indexR)===(BOUNTY_FLAG_NALL|BOUNTY_FLAG_ISALL_RESULT),'the var should only be nall[2] and isall',bounty__debugMeta(bounty,indexR),countsR);ASSERT(ml_dec8(ml,isallOffset)===ML_ISALL,'isall offset should be an isall');ASSERT(getAlias(indexR)===indexR,'should be unaliased');ASSERT(readIndex(ml,isallOffset+SIZEOF_C+ml_dec16(ml,isallOffset+1)*2)===indexR,'R should be result of isall');ASSERT(countsR<BOUNTY_MAX_OFFSETS_TO_TRACK,'counts should not exceed maxed tracked');var isallArgCount=ml_dec16(ml,isallOffset+1);var isallSizeof=SIZEOF_C+isallArgCount*2+2;var isallArgs=[];for(var i=0;i<isallArgCount;++i){var index=readIndex(ml,isallOffset+SIZEOF_C+i*2);isallArgs.push(index);}TRACE(' - trick_isall_nall_1shared; first confirming all other offsets are nalls with 2 args; isall arg count:',isallArgCount,', isall args:',isallArgs);var nalls=0;for(var _i10=0;_i10<countsR;++_i10){var nallOffset=bounty_getOffset(bounty,indexR,_i10);ASSERT(nallOffset,'there should be as many offsets as counts unless that exceeds the max and that has been checked already');if(nallOffset!==isallOffset){var opcode=ml_dec8(ml,nallOffset);if(opcode!==ML_NALL){TRACE(' - found at least one other isall, bailing');ASSERT(opcode===ML_ISALL,'bounty should have asserted that the offsets can only be isall and nall');return false;}if(ml_dec16(ml,nallOffset+1)!==2){TRACE(' - found a nall that did not have 2 args, bailing for now');return false;}++nalls;}ASSERT(nallOffset===isallOffset||readIndex(ml,nallOffset+OFFSET_C_A)===indexR||readIndex(ml,nallOffset+OFFSET_C_B)===indexR,'R should be part of the nall');}// Bounty asserted that all these nalls contain R, rewrite each such nall
TRACE(' - trick_isall_nall_1shared; there are',nalls,'nalls; for each nall: `X !& B, X = all?(C D)`   ->   `nall(B C D)`');TRACE(' - one nall will fit inside the isall but any others need recycled spaces (because the existing nalls have 2 args)');// Each nall with 2 args becomes a nall with all the isall args + 1, that should be at least 3
var sizeofNall=SIZEOF_C+(isallArgCount+1)*2;var nallSpacesNeeded=nalls-1;// -1 because we can always recycle the original isall
TRACE(' - isall offset=',isallOffset,', size(isall)=',isallSizeof,', size(nall)=',sizeofNall,', there are',nalls,'nalls[2] and each morphs into a nall['+isallSizeof+'] so we need',nallSpacesNeeded,'spaces');ASSERT(isallSizeof===sizeofNall,'both isalls should be a cr-op so should have enough space for this nall');var bins;if(nallSpacesNeeded){TRACE(' - need additional space; searching for',nallSpacesNeeded,'spaces of size=',sizeofNall);bins=ml_getRecycleOffsets(ml,0,nallSpacesNeeded,sizeofNall);if(!bins){TRACE(' - Was unable to find enough free space to fit',nalls,'nalls, bailing');return false;}}// If any of the nall args or any of the isall args is 0, then so is R. so collect all args together to defer R
var allArgs=isallArgs.slice(0);var offsetCounter=0;var rewrittenNalls=0;// Only used in ASSERTs, minifier should eliminate this
if(nallSpacesNeeded){TRACE(' - starting to morph',nallSpacesNeeded,'nalls into bins');ml_recycles(ml,bins,nallSpacesNeeded,sizeofNall,function(recycledOffset,i,sizeLeft){TRACE('   - using: recycledOffset:',recycledOffset,', i:',i,', sizeLeft:',sizeLeft);var offset;do{if(offsetCounter>=countsR){TRACE(' - (last offset must have been offset)');return true;}offset=bounty_getOffset(bounty,indexR,offsetCounter++);TRACE('     - offset',offset,'is isall?',offset===isallOffset);}while(offset===isallOffset);TRACE('     - offset',offset,'is not isall so it should be nall');ASSERT(ml_dec8(ml,offset)===ML_NALL,'should be nall');ASSERT(offset,'the earlier loop counted the nalls so it should still have that number of offsets now');ASSERT(sizeLeft===ml_getOpSizeSlow(ml,recycledOffset),'size left should be >=size(op)');_trick_isall_nall_1shared_CreateNallAndRemoveNall(ml,indexR,isallArgs.slice(0),allArgs,offset,recycledOffset,sizeLeft);ASSERT(++rewrittenNalls);return false;});ASSERT(rewrittenNalls===nallSpacesNeeded,'should have processed all offsets for R',rewrittenNalls,'==',nallSpacesNeeded,'(',offsetCounter,countsR,')');TRACE(' - all nalls should be morphed now');}// Now recycle the isall. have to do it afterwards because otherwise the found recycled bins may be clobbered
// when eliminating the nall. there's no test for this because it's rather complex to create. sad.
TRACE(' - recycling the old isall into the last nall');var lastNallOffset=bounty_getOffset(bounty,indexR,offsetCounter++);if(lastNallOffset===isallOffset)lastNallOffset=bounty_getOffset(bounty,indexR,offsetCounter++);_trick_isall_nall_1shared_CreateNallAndRemoveNall(ml,indexR,isallArgs.slice(0),allArgs,lastNallOffset,isallOffset,isallSizeof);ASSERT(++rewrittenNalls);TRACE('   - deferring',indexR,'will be R = all?(',allArgs,')');solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_isall_nall_1shared;',indexR,'= all?(',allArgs,')  ->  ',domain__debug(getDomain(indexR)),'= all?(',allArgs.map(function(index){return domain__debug(getDomain(index));}),')');var R=getDomain(indexR);allArgs.some(function(index){var X=getDomain(index);if(!domain_hasNoZero(X)){// If non-zero, this var wont affect R
var vX=force(index);if(vX===0){R=domain_removeGtUnsafe(R,0);return true;}}});// R should be updated properly now. basically if any arg solved to zero, it will be zero. otherwise unchanged.
ASSERT(R,'R should have at least a value to solve left');setDomain(indexR,R);});bounty_markVar(bounty,indexR);for(var _i11=0,l=allArgs.length;_i11<l;++_i11){bounty_markVar(bounty,allArgs[_i11]);}return true;}function _trick_isall_nall_1shared_CreateNallAndRemoveNall(ml,indexR,nallArgs,allArgs,nallOffset,recycleOffset,recycleSizeof){TRACE(' - _trick_isall_nall_1shared_CreateNallAndRemoveNall: indexR:',indexR,'nallArgs:',nallArgs,'allArgs:',allArgs,'nallOffset:',nallOffset,'recycleOffset:',recycleOffset,'recycleSizeof:',recycleSizeof);ASSERT(ml_dec16(ml,nallOffset+1)===2,'nalls should have 2 args');var indexX=readIndex(ml,nallOffset+OFFSET_C_A);var indexY=readIndex(ml,nallOffset+OFFSET_C_B);ASSERT(indexX===indexR||indexY===indexR,'expecting indexR to be part of the nall');var index=indexX===indexR?indexY:indexX;TRACE(' - other nall index is',index,domain__debug(getDomain(index,true)));nallArgs.push(index);allArgs.push(index);// Note: bounty_markVar happens at caller
TRACE(' - writing a new nall');ml_any2c(ml,recycleOffset,recycleSizeof,ML_NALL,nallArgs);if(nallOffset!==recycleOffset){TRACE(' - removing the nall because we didnt recycle it');ml_eliminate(ml,nallOffset,SIZEOF_C_2);}ASSERT(ml_validateSkeleton(ml,'_trick_isall_nall_1shared_CreateNallAndRemoveNall'));}function trick_diff_elimination(diffOffset,indexX,countsX,indexY){// Bascially we "invert" one arg by aliasing it to the other arg and then inverting all ops that relate to it
// the case with multiple diffs should be eliminated elsewhere
// all targeted ops should only have 2 args
// see also the xor elimination (similar to this one)
// A <= X, X != Y    ->    A !& Y
// X <= A, X != Y    ->    A | Y
// X | A, X != Y     ->    Y <= A
// X !& A, X != Y    ->    A <= Y
// A -> X, X != Y    ->    A !& Y
// X -> A, X != Y    ->    A | Y
TRACE('trick_diff_elimination');TRACE(' - index:',indexX,'^',indexY);TRACE(' - domains:',domain__debug(getDomain(indexX)),'!=',domain__debug(getDomain(indexY)));TRACE(' - meta:',bounty__debugMeta(bounty,indexX),'!=',bounty__debugMeta(bounty,indexY));TRACE(' - verying; looking for one DIFF[2], `X != Y` and then we can morph any of these;');TRACE('   - LTE_LHS:   X != Y, X <= A     =>    A | Y');TRACE('   - LTE_RHS:   X != Y, A <= X     =>    A !& Y');TRACE('   - SOME:      X != Y, X | A      =>    Y <= A    =>    Y -> A');TRACE('   - NALL:      X != Y, X !& A     =>    A <= Y    =>    A -> Y');TRACE('   - IMP_LHS:   X != Y, X -> A     =>    Y | A');TRACE('   - IMP_RHS:   X != Y, A -> X     =>    A !& Y');// First we need to validate. we can only have one diff and all ops can only have 2 args
ASSERT(countsX<BOUNTY_MAX_OFFSETS_TO_TRACK,'this was already checked in cut_diff');ASSERT(ml_dec16(ml,diffOffset+1)===2,'the diff should be confirmed to have 2 args');if(!domain_isBoolyPair(getDomain(indexX))){TRACE(' - X is non-bool, bailing');return false;}// We need the offsets to eliminate them and to get the "other" var index for each
var lteLhsOffsets=[];var lteLhsArgs=[];var lteRhsOffsets=[];var lteRhsArgs=[];var someOffsets=[];var someArgs=[];var nallOffsets=[];var nallArgs=[];var seenDiff=false;var impLhsOffsets=[];var impLhsArgs=[];var impRhsOffsets=[];var impRhsArgs=[];TRACE(' - scanning',countsX,'offsets now..');for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);ASSERT(offset,'the offset should exist...',offset);var op=ml_dec8(ml,offset);TRACE('   - pos=',i,', offset=',offset,'op=',ml__opName(op));ASSERT(op===ML_LTE||op===ML_DIFF||op===ML_SOME||op===ML_NALL||op===ML_IMP,'should be one of these four ops, bounty said so',ml__opName(op));if(ml_dec16(ml,offset+1)!==2){TRACE(' - op does not have 2 args, bailing');return false;}var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);var A=getDomain(indexA,true);var B=getDomain(indexB,true);ASSERT(indexA===indexX||indexB===indexX,'bounty should only track ops that use target var');if(!domain_isBoolyPair(indexA===indexX?B:A)){TRACE(' - found an op with a non-bool arg, bailing');return false;}var indexC=indexA===indexX?indexB:indexA;if(op===ML_LTE){// A ^ B, A <= C
// [00022]^[01],[0022]<=[01]  what if B must end up zero?
// we have to make sure the lte constraint can not possibly be broken at this point
if(domain_max(A)>domain_max(B)||domain_min(B)<domain_min(A)){TRACE(' - there are valuations of A and B that could break LTE, bailing because minimizer can fix this');requestAnotherCycle=true;return false;}if(indexA===indexX){lteLhsOffsets.push(offset);lteLhsArgs.push(indexC);}else{lteRhsOffsets.push(offset);lteRhsArgs.push(indexC);}}else if(op===ML_IMP){if(indexA===indexX){impLhsOffsets.push(offset);impLhsArgs.push(indexC);}else{impRhsOffsets.push(offset);impRhsArgs.push(indexC);}}else if(op===ML_DIFF){if(diffOffset!==offset){TRACE(' - found a different DIFF, this trick only works on one, bailing');return false;}ASSERT(indexC===indexY);seenDiff=true;}else if(op===ML_SOME){someOffsets.push(offset);someArgs.push(indexC);}else{ASSERT(op===ML_NALL,'see assert above');nallOffsets.push(offset);nallArgs.push(indexC);}}TRACE(' - collection complete; indexY =',indexY,', diff offset =',diffOffset,', lte lhs offsets:',lteLhsOffsets,', lte rhs offsets:',lteRhsOffsets,', SOME offsets:',someOffsets,', nall offsets:',nallOffsets,', imp lhs offsets:',impLhsOffsets,', imp rhs offsets:',impRhsOffsets);ASSERT(seenDiff,'should have seen a diff, bounty said there would be one');// Okay. pattern matches. do the rewrite
TRACE(' - pattern confirmed, morphing ops, removing diff');TRACE('   - X != Y, X <= A     =>    A | Y');TRACE('   - X != Y, A <= X     =>    A !& Y');TRACE('   - X != Y, X | A      =>    Y <= A    =>    Y -> A');TRACE('   - X != Y, X !& A     =>    A <= Y    =>    A -> Y');TRACE('   - X != Y, X -> A     =>    Y | A');TRACE('   - X != Y, A -> X     =>    A !& Y');TRACE_MORPH('X != Y','');TRACE(' - processing',lteLhsOffsets.length,'LTE_LHS ops');for(var _i12=0,len=lteLhsOffsets.length;_i12<len;++_i12){TRACE_MORPH('X <= A, X != Y','A | Y');var _offset2=lteLhsOffsets[_i12];var index=readIndex(ml,_offset2+OFFSET_C_A);if(index===indexX)index=readIndex(ml,_offset2+OFFSET_C_B);bounty_markVar(bounty,index);ASSERT(ml_dec16(ml,_offset2+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset2,2,ML_SOME,index,indexY);}TRACE(' - processing',lteRhsOffsets.length,'LTE_RHS ops');for(var _i13=0,_len=lteRhsOffsets.length;_i13<_len;++_i13){TRACE_MORPH('X <= A, X != Y','A | Y');var _offset3=lteRhsOffsets[_i13];var _index5=readIndex(ml,_offset3+OFFSET_C_A);if(_index5===indexX)_index5=readIndex(ml,_offset3+OFFSET_C_B);bounty_markVar(bounty,_index5);ASSERT(ml_dec16(ml,_offset3+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset3,2,ML_NALL,_index5,indexY);}// Note: this bit is kind of redundant (and untested) because it's rewritten and picked up elsewhere
TRACE(' - processing',someOffsets.length,'SOME ops');for(var _i14=0,_len2=someOffsets.length;_i14<_len2;++_i14){TRACE_MORPH('X | A, X != Y','Y <= A');var _offset4=someOffsets[_i14];var _index6=readIndex(ml,_offset4+OFFSET_C_A);if(_index6===indexX)_index6=readIndex(ml,_offset4+OFFSET_C_B);bounty_markVar(bounty,_index6);ASSERT(ml_dec8(ml,_offset4)===ML_SOME,'right?');ASSERT(ml_dec16(ml,_offset4+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset4,2,ML_LTE,indexY,_index6);}TRACE(' - processing',nallOffsets.length,'NALL ops');for(var _i15=0,_len3=nallOffsets.length;_i15<_len3;++_i15){TRACE_MORPH('X !& A, X != Y','A <= Y');var _offset5=nallOffsets[_i15];var _index7=readIndex(ml,_offset5+OFFSET_C_A);if(_index7===indexX)_index7=readIndex(ml,_offset5+OFFSET_C_B);bounty_markVar(bounty,_index7);ASSERT(ml_dec16(ml,_offset5+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset5,2,ML_LTE,_index7,indexY);}TRACE(' - processing',impLhsOffsets.length,'IMP_LHS ops');for(var _i16=0,_len4=impLhsOffsets.length;_i16<_len4;++_i16){TRACE_MORPH('X -> A, X != Y','A | Y');var _offset6=impLhsOffsets[_i16];var _index8=readIndex(ml,_offset6+OFFSET_C_A);if(_index8===indexX)_index8=readIndex(ml,_offset6+OFFSET_C_B);bounty_markVar(bounty,_index8);ASSERT(ml_dec16(ml,_offset6+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset6,2,ML_SOME,_index8,indexY);}TRACE(' - processing',impRhsOffsets.length,'IMP_RHS ops');for(var _i17=0,_len5=impRhsOffsets.length;_i17<_len5;++_i17){TRACE_MORPH('X -> A, X != Y','A | Y');var _offset7=impRhsOffsets[_i17];var _index9=readIndex(ml,_offset7+OFFSET_C_A);if(_index9===indexX)_index9=readIndex(ml,_offset7+OFFSET_C_B);bounty_markVar(bounty,_index9);ASSERT(ml_dec16(ml,_offset7+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset7,2,ML_NALL,_index9,indexY);}TRACE(' - and finally removing the DIFF');ASSERT(ml_dec16(ml,diffOffset+1)===2,'diff should have 2 args here');ml_eliminate(ml,diffOffset,SIZEOF_C_2);TRACE(' - X is a leaf constraint, defer it',indexX);leafs.push(indexX);solveStack.push(function(_,force,getDomain,setDomain){var X=getDomain(indexX);var Y=getDomain(indexY);TRACE(' - diff + ops...;',indexX,'!=',indexY,'  ->  ',domain__debug(X),'!=',domain__debug(getDomain(indexY)));// TRACE(' - X:',domain__debug(X));
// TRACE(' - Y:',domain__debug(getDomain(indexY)));
// TRACE(' - ltelhs:', lteLhsArgs.map(a=>domain__debug(getDomain(a))));
// TRACE(' - lterhs:', lteRhsArgs.map(a=>domain__debug(getDomain(a))));
// TRACE(' - some:', someArgs.map(a=>domain__debug(getDomain(a))));
// TRACE(' - nall:', nallArgs.map(a=>domain__debug(getDomain(a))));
// TRACE(' - implhs:', impLhsArgs.map(a=>domain__debug(getDomain(a))));
// TRACE(' - imprhs:', impRhsArgs.map(a=>domain__debug(getDomain(a))));
var oX=X;var minX=domain_min(X);var maxX=domain_max(X);TRACE('  - applying',lteLhsArgs.length,'LTELHSs (X <= vars)');for(var _i18=0;_i18<lteLhsArgs.length;++_i18){// X <= D
var _index10=lteLhsArgs[_i18];var D=getDomain(_index10);TRACE('    - index:',_index10,', domain:',domain__debug(D));var minD=domain_min(D);if(maxX>minD){var maxD=domain_max(D);// At least one value of X is larger than a value in D so there is currently
// a valuation of X and D that violates the LTE and we must fix that.
if(maxD>=maxX){// There are values in D that are larger-eq to all values in X. use them.
// just remove the intersecting values from D and then lte should satisfy
D=domain_removeLtUnsafe(D,maxX);setDomain(_index10,D);}else{// The largest value of D is smaller than the largest X
// maximize D then remove any value from X larger than that
D=domain_intersectionValue(D,maxD);setDomain(_index10,D);X=domain_removeGtUnsafe(X,maxD);}ASSERT(D);ASSERT(X);ASSERT(domain_max(X)<=domain_min(D));}}TRACE('   - X after LTELHSs:',domain__debug(X));TRACE('  - applying',lteRhsArgs.length,'LTERHSs (vars <= X)');for(var _i19=0;_i19<lteRhsArgs.length;++_i19){// D <= X
var _index11=lteRhsArgs[_i19];var _D4=getDomain(_index11);TRACE('    - index:',_index11,', domain:',domain__debug(_D4));var _maxD=domain_max(_D4);if(minX<_maxD){// At least one value in X is smaller than a value in D so there is currently
// a valuation of X and D that violates the LTE and we must fix that.
var _minD=domain_min(_D4);if(_minD<=minX){// There are values in D that are smaller-eq to all values in X. use them.
// just remove the intersecting values from D and then lte should satisfy
_D4=domain_removeGtUnsafe(_D4,minX);setDomain(_index11,_D4);}else{// The smallest value of D is larger than the smallest X
// minimze D then remove any value from X smaller than that
_D4=domain_intersectionValue(_D4,_minD);setDomain(_index11,_D4);X=domain_removeLtUnsafe(X,_maxD);}}ASSERT(_D4);ASSERT(X);ASSERT(domain_max(_D4)<=domain_min(X));}TRACE('   - X after LTERHSs:',domain__debug(X));// Reminder: these are pairs. some(X D) for each d in someArgs
for(var _i20=0;_i20<someArgs.length;++_i20){// Some(X ...)
var _index12=someArgs[_i20];var _D5=getDomain(_index12);TRACE('    - index:',_index12,', domain:',domain__debug(getDomain(_index12)));if(domain_isZero(_D5)){// X must be nonzero now
X=domain_removeValue(X,0);}else if(domain_hasZero(_D5)){ASSERT(domain_isBooly(_D5),'assuming D isnt empty, and it wasnt zero but has a zero, it should be a booly');_D5=domain_removeValue(_D5,0);setDomain(_index12,_D5);}ASSERT(X);ASSERT(_D5);ASSERT(domain_hasNoZero(X)||domain_hasNoZero(_D5));}TRACE('   - X after SOMEs:',domain__debug(X));// Reminder: these are pairs. nall(X D) for each d in nallArgs
for(var _i21=0;_i21<nallArgs.length;++_i21){// Nall(X ...)
var _index13=nallArgs[_i21];var _D6=getDomain(_index13);TRACE('    - index:',_index13,', domain:',domain__debug(_D6));if(domain_hasNoZero(_D6)){// X must be zero
X=domain_removeGtUnsafe(X,0);}else if(domain_hasNoZero(_D6)){ASSERT(domain_isBooly(_D6),'assuming D isnt empty, and it wasnt nonzero, it should be a booly');_D6=domain_removeGtUnsafe(_D6,0);setDomain(_index13,_D6);}ASSERT(X);ASSERT(_D6);ASSERT(domain_isZero(X)||domain_isZero(_D6));}TRACE('   - X after NALLs:',domain__debug(X));for(var _i22=0;_i22<impLhsArgs.length;++_i22){// X -> D
var _index14=impLhsArgs[_i22];var _D7=getDomain(_index14);TRACE('    - index:',_index14,', domain:',domain__debug(_D7));// The easiest out is that D is either nonzero or that X is zero
if(!domain_hasNoZero(_D7)&&!domain_isZero(X)){if(domain_isZero(_D7)){// X must be zero otherwise the implication doesnt hold
X=domain_removeGtUnsafe(X,0);}else if(domain_hasNoZero(_D7)){// X must be nonzero because D is nonzero
X=domain_removeValue(X,0);}else{ASSERT(domain_isBooly(_D7));// Setting D to nonzero is the safest thing to do
setDomain(_index14,domain_removeValue(_D7,0));}}ASSERT(X);ASSERT(_D7);ASSERT(domain_hasNoZero(X)?domain_hasNoZero(_D7):true);ASSERT(domain_isZero(_D7)?domain_isZero(X):true);ASSERT(domain_isSolved(_D7)||domain_isZero(X),'if X is zero then D doesnt matter. if D is solved then X is asserted to be fine above');}TRACE('   - X after IMPLHSs:',domain__debug(X));for(var _i23=0;_i23<impRhsArgs.length;++_i23){// D -> X
var _index15=impRhsArgs[_i23];var _D8=getDomain(_index15);TRACE('    - index:',_index15,', domain:',domain__debug(_D8));if(domain_hasNoZero(_D8)){// X must be nonzero
X=domain_removeGtUnsafe(X,0);}else if(domain_isBooly(_D8)){// Safest value for imp-lhs is 0
_D8=domain_removeValue(_D8,0);}ASSERT(X);ASSERT(_D8);ASSERT(domain_hasNoZero(_D8)?domain_hasNoZero(X):true);ASSERT(domain_isZero(X)?domain_isZero(_D8):true);ASSERT(domain_isSolved(X)||domain_isZero(_D8),'if D is zero then X doesnt matter. if X is solved then D is asserted to be fine above');}TRACE('   - X after IMPRHSs:',domain__debug(X));// X != Y
TRACE(' - != Y:',domain__debug(getDomain(indexY)));if(domain_isSolved(X)){Y=domain_removeValue(Y,domain_getValue(X));setDomain(indexY,Y);}else{X=domain_removeValue(X,force(indexY));}TRACE('   - X after DIFFs:',domain__debug(X));ASSERT(X,'X should be able to reflect any solution');if(X!==oX)setDomain(indexX,X);});bounty_markVar(bounty,indexX);bounty_markVar(bounty,indexY);somethingChanged();return true;}function trick_xor_elimination(xorOffset,indexX,countsX,indexY){// The xor is basically a diff (!=) in a booly sense. so we can invert all the affected ops by inverting the xor.
// bascially we "invert" a xor by aliasing one arg to the other arg and then inverting all ops that relate to it
// all targeted ops should only have 2 args
// X | A, X ^ Y     ->    Y <= A
// X !& A, X ^ Y    ->    A <= Y
// A -> X, X ^ Y    ->    A !& Y
// X -> A, X ^ Y    ->    A | Y
// note: eligible LTEs must be morphed to an implication first
// A <= X, X ^ Y    ->    A !& Y
// X <= A, X ^ Y    ->    A | Y
TRACE('trick_xor_elimination');TRACE(' - index:',indexX,'^',indexY);TRACE(' - domains:',domain__debug(getDomain(indexX)),'^',domain__debug(getDomain(indexY)));TRACE(' - meta:',bounty__debugMeta(bounty,indexX),'^',bounty__debugMeta(bounty,indexY));TRACE(' - verying; looking for a XOR, `X ^ Y` and then we can morph any of these;');// TRACE('   - LTE_LHS:   X ^ Y, X <= A     =>    A | Y');
// TRACE('   - LTE_RHS:   X ^ Y, A <= X     =>    A !& Y');
TRACE('   - SOME:      X ^ Y, X | A      =>    Y <= A    =>    Y -> A');TRACE('   - NALL:      X ^ Y, X !& A     =>    A <= Y    =>    A -> Y');TRACE('   - IMP_LHS:   X ^ Y, X -> A     =>    Y | A');TRACE('   - IMP_RHS:   X ^ Y, A -> X     =>    A !& Y');TRACE(' - all args must be booly pairs, or bounty-booly without LTE');ASSERT(countsX<BOUNTY_MAX_OFFSETS_TO_TRACK,'this was already checked in cut_xor');ASSERT(ml_dec16(ml,xorOffset+1)===2,'XORs only have two args');if(!domain_isBooly(getDomain(indexX))){TRACE(' - X is non-bool, bailing');return false;}// We need the offsets to eliminate them and to get the "other" var index for each
// first we need to validate.
// - we can only have one XOR
// - all ops must have 2 args
// - the "other" arg must also be a booly-pair or bounty-booly
var someOffsets=[];var nallOffsets=[];var seenXor=false;var impLhsOffsets=[];var impRhsOffsets=[];for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);ASSERT(offset,'the offset should exist...',offset);var op=ml_dec8(ml,offset);ASSERT(op===ML_XOR||op===ML_SOME||op===ML_NALL||op===ML_IMP,'should be one of these four ops, bounty said so',ml__opName(op));if(ml_dec16(ml,offset+1)!==2){TRACE(' - op',ml__opName(op),'does not have 2 args (',ml_dec16(ml,offset+1),'), bailing');return false;}var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);ASSERT(indexA===indexX||indexB===indexX,'bounty should only track ops that use target var');TRACE('    - current offset:',offset,', op:',ml__opName(op),'indexes:',indexA,indexB,', domains:',domain__debug(getDomain(indexA,true)),domain__debug(getDomain(indexB,true)));// Get pair
var indexT=indexA===indexX?indexB:indexA;if(bounty_getCounts(bounty,indexT)===0){TRACE(' - an arg was marked (counts=0), bailing (we will get this in the rebound)');// Note: while there may be other ops that could be converted, we'll
// get at least one more cutter pass and we'll eventually retry this
return false;}var T=getDomain(indexT,true);if(!domain_isBoolyPair(T)&&hasFlags(bounty_getMeta(bounty,indexT),BOUNTY_FLAG_NOT_BOOLY)){TRACE(' - found an "other" var that was marked not booly in its meta and not a booly pair, bailing');return false;}if(op===ML_IMP){if(indexA===indexX){if(impLhsOffsets.indexOf(offset)<0)impLhsOffsets.push(offset);}else if(impRhsOffsets.indexOf(offset)<0)impRhsOffsets.push(offset);}else if(op===ML_XOR){if(xorOffset!==offset){TRACE(' - found a different XOR, this trick only works on one, bailing');return false;}seenXor=true;}else if(op===ML_SOME){if(ml_dec16(ml,offset+1)!==2){TRACE(' - There was a SOME that did not have 2 args, bailing');}if(someOffsets.indexOf(offset)<0)someOffsets.push(offset);}else{ASSERT(op===ML_NALL,'see assert above');if(nallOffsets.indexOf(offset)<0)nallOffsets.push(offset);}}TRACE(' - collection complete; indexY =',indexY,', XOR offset =',xorOffset,', SOME offsets:',someOffsets,', NALL offsets:',nallOffsets,', IMP_LHS offsets:',impLhsOffsets,', IMP_RHS offsets:',impRhsOffsets);ASSERT(seenXor,'should have seen a XOR, bounty said there would be one');// Okay. pattern matches. do the rewrite
TRACE(' - pattern confirmed, morphing ops, removing XOR');// TRACE('   - X ^ Y, X <= A     =>    A | Y');
// TRACE('   - X ^ Y, A <= X     =>    A !& Y');
TRACE('   - X ^ Y, X | A      =>    Y -> A; offsets:',someOffsets);TRACE('   - X ^ Y, X !& A     =>    A -> Y; offsets:',nallOffsets);TRACE('   - X ^ Y, X -> A     =>    Y | A; offsets:',impLhsOffsets);TRACE('   - X ^ Y, A -> X     =>    A !& Y; offsets:',impRhsOffsets);TRACE_MORPH('X ^ Y, inverting LTE, SOME, NALL, IMP','');TRACE(' - processing',someOffsets.length,'SOME ops');for(var _i24=0,len=someOffsets.length;_i24<len;++_i24){// X | A, X != Y    ->    Y <= A
var _offset8=someOffsets[_i24];var index=readIndex(ml,_offset8+OFFSET_C_A);if(index===indexX)index=readIndex(ml,_offset8+OFFSET_C_B);bounty_markVar(bounty,index);ASSERT(ml_dec8(ml,_offset8)===ML_SOME,'right?');ASSERT(ml_dec16(ml,_offset8+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset8,2,ML_IMP,indexY,index);}TRACE(' - processing',nallOffsets.length,'NALL ops');for(var _i25=0,_len6=nallOffsets.length;_i25<_len6;++_i25){// X !& A, X != Y    ->    A <= Y
var _offset9=nallOffsets[_i25];var _index16=readIndex(ml,_offset9+OFFSET_C_A);if(_index16===indexX)_index16=readIndex(ml,_offset9+OFFSET_C_B);bounty_markVar(bounty,_index16);ASSERT(ml_dec16(ml,_offset9+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset9,2,ML_IMP,_index16,indexY);}TRACE(' - processing',impLhsOffsets.length,'IMP_LHS ops');for(var _i26=0,_len7=impLhsOffsets.length;_i26<_len7;++_i26){// X -> A, X != Y    ->    A | Y
var _offset10=impLhsOffsets[_i26];var _index17=readIndex(ml,_offset10+OFFSET_C_A);if(_index17===indexX)_index17=readIndex(ml,_offset10+OFFSET_C_B);bounty_markVar(bounty,_index17);ASSERT(ml_dec16(ml,_offset10+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset10,2,ML_SOME,_index17,indexY);}TRACE(' - processing',impRhsOffsets.length,'IMP_RHS ops');for(var _i27=0,_len8=impRhsOffsets.length;_i27<_len8;++_i27){// X -> A, X != Y    ->    A | Y
var _offset11=impRhsOffsets[_i27];var _index18=readIndex(ml,_offset11+OFFSET_C_A);if(_index18===indexX)_index18=readIndex(ml,_offset11+OFFSET_C_B);bounty_markVar(bounty,_index18);ASSERT(ml_dec16(ml,_offset11+1)===2,'should be explicitly checked above');ml_c2c2(ml,_offset11,2,ML_NALL,_index18,indexY);}TRACE(' - and finally removing the XOR');ASSERT(ml_dec16(ml,xorOffset+1)===2,'diff should have 2 args here');ml_eliminate(ml,xorOffset,SIZEOF_C_2);TRACE(' - X is a leaf constraint, defer it',indexX);leafs.push(indexX);solveStack.push(function(_,force,getDomain,setDomain){var X=getDomain(indexX);TRACE(' - xor + ops...;',indexX,'^',indexY,'  ->  ',domain__debug(X),'^',domain__debug(getDomain(indexY)));if(force(indexY)===0){X=domain_removeValue(X,0);}else{X=domain_removeGtUnsafe(X,0);}ASSERT(X,'X should be able to reflect any solution');setDomain(indexX,X);});bounty_markVar(bounty,indexX);bounty_markVar(bounty,indexY);somethingChanged();return true;}function trick_diff_xor(ml,diffOffset,indexX,countsX,indexA){TRACE('trick_diff_xor');TRACE(' - X != A, X ^ B    =>    X!=A,A==B');// Find the xor. X may a counts > 2
var xorOffset=0;for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);if(ml_dec8(ml,offset)===ML_XOR){xorOffset=offset;}}ASSERT(xorOffset,'bounty said there was at least one xor',xorOffset);if(ml_dec16(ml,xorOffset+1)!==2){TRACE(' - the XOR did not have 2 args, bailing');return false;}ASSERT(readIndex(ml,xorOffset+OFFSET_C_A)===indexX||readIndex(ml,xorOffset+OFFSET_C_B)===indexX,'X should be part of XOR');var indexB=readIndex(ml,xorOffset+OFFSET_C_A);if(indexB===indexX)indexB=readIndex(ml,xorOffset+OFFSET_C_B);var A=getDomain(indexA,true);var B=getDomain(indexB,true);var X=getDomain(indexX,true);TRACE(' - indexes:',indexX,'!=',indexA,',',indexX,'^',indexB);TRACE(' - domains:',domain__debug(X),'!=',domain__debug(A),',',domain__debug(X),'^',domain__debug(B));if(!domain_isBoolyPair(A)||!domain_isBoolyPair(B)||domain_intersection(X,A)!==A||domain_intersection(X,B)!==B){// Note: this implicitly tested whether A is a booly
TRACE(' - A or B wasnt a boolypair or A did not contain all values, bailing');return false;}TRACE(' - pattern confirmed');TRACE_MORPH('X != A, X ^ B','X ^ A, A == B');ml_eliminate(ml,diffOffset,SIZEOF_C_2);cutAddPseudoBoolyAlias(indexB,indexA);somethingChanged();return true;}function trick_diff_alias(indexX,indexY,countsX){TRACE('trick_diff_alias; index X:',indexX,', index Y:',indexY,', counts:',countsX);TRACE(' - X!=A,X!=B, size(A)==2,min(A)==min(B),max(A)==max(B)   =>   A==B');var X=getDomain(indexX);var Y=getDomain(indexY);TRACE(' - domains:',domain__debug(X),domain__debug(Y),'(trick only works if these are equal and size=2)');if(X===Y&&domain_size(X)===2){// If we can find another diff on X where the domain is also equal to X, we can alias Y to that var
for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);ASSERT(offset,'the offset should exist...',offset);var op=ml_dec8(ml,offset);TRACE('   - checking offset=',offset,'op=',op,op===ML_DIFF);if(op===ML_DIFF){var count=ml_dec16(ml,offset+1);TRACE('     - is diff with',count,'indexes');if(count!==2){TRACE('       - count must be 2 for this to work, moving to next op');continue;}var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);TRACE(' - indexes:',indexA,indexB,', domains:',domain__debug(getDomain(indexA)),domain__debug(getDomain(indexB)));ASSERT(indexA===indexX||indexB===indexX,'xor should have X as either arg because bounty said so');var indexZ=void 0;if(indexA===indexX){if(indexB===indexY)continue;indexZ=indexB;}else{ASSERT(indexB===indexX,'x should match at least one side');if(indexA===indexY)continue;indexZ=indexA;}TRACE('     - not original diff, Z=',indexZ);ASSERT(indexY!==indexZ,'deduper should have eliminated duplicate diffs');var Z=getDomain(indexZ);if(X===Z){TRACE('     - domains are equal so X!=Y, X!=Z, with X==Y==Z, with size(X)=2, so Y=Z, index',indexY,'=',indexZ);TRACE('     - eliminating this diff, aliasing Z to Y');ASSERT(Y===Z);ASSERT(domain_size(Z)===2);// No solve stack required, indexY == indexZ
addAlias(indexZ,indexY,'double bin diff');ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,indexX);bounty_markVar(bounty,indexY);bounty_markVar(bounty,indexZ);somethingChanged();return true;}}}}TRACE(' - unable to apply trick_diff_alias, bailing');return false;}function trick_xor_alias(indexX,indexY,countsX,Y,sizeY,YisBooly){TRACE('trick_xor_alias; index X:',indexX,', index Y:',indexY,', counts:',countsX,', sizeY:',sizeY);ASSERT(indexX!==indexY,'X^Y is falsum and shouldnt occur here');// We are looking for `X^Y,X^B` and if `size(A)==2,dA==dB` or B is a booly then we alias them
var YisPair=sizeY===2;TRACE(' - domains:',domain__debug(getDomain(indexX)),domain__debug(Y),'Y is booly var?',YisBooly,', Y size?',sizeY);if(!YisBooly&&!YisPair){TRACE(' - Y is neither a booly var nor a pair so cant apply this trick; bailing');return false;}// We now search for any xor that uses x but not y as z
// the first z to match YisBooly or domain y==z will be aliased
for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);ASSERT(offset,'the offset should exist...',offset);var op=ml_dec8(ml,offset);TRACE('   - checking offset=',offset,'op=',op,op===ML_XOR);if(op===ML_XOR){var indexA=readIndex(ml,offset+OFFSET_C_A);var indexB=readIndex(ml,offset+OFFSET_C_B);TRACE('     - is xor, indexes:',indexA,indexB,'confirming its not the input X and Y',indexX,indexY,'( -> it',indexX===indexA&&indexY===indexB||indexX===indexB&&indexY===indexA?'is':'isnt',')');ASSERT(indexA===indexX||indexB===indexX,'at least one argument should match X since it is X-es bounty');var indexZ=void 0;if(indexA===indexX){if(indexB===indexY)continue;indexZ=indexB;}else if(indexB===indexX){if(indexA===indexY)continue;indexZ=indexA;}else{THROW('X should be left or right of its xors');}ASSERT(indexY!==indexZ,'deduper should have eliminated duplicate xors',indexX,indexY,indexA,indexB);var aliased=false;var Z=getDomain(indexZ,true);if(YisPair&&Z===Y){TRACE(' - true aliases. X^Y X^Z, '+indexX+'^'+indexY+' '+indexX+'^'+indexZ+', aliasing',indexZ,'to',indexY);// Keep the current xor (X^Y) and drop the found xor (X^Z)
addAlias(indexZ,indexY);aliased=true;}else if(YisPair&&domain_size(Z)===2){TRACE(' - pseudo aliases. X^Y X^Z, '+indexX+'^'+indexY+' '+indexX+'^'+indexZ+', aliasing',indexZ,'to',indexY);TRACE(' - since Y and Z can only be "zero or nonzero", the xor forces them to pick either the zero or nonzero value, regardless of anything else');// Keep the current xor (X^Y) and drop the found xor (X^Z)
cutAddPseudoBoolyAlias(indexY,indexZ);aliased=true;}else if(YisBooly){var metaZ=getMeta(bounty,indexZ,true);// Keep booly flag
TRACE(' - Z isnt a pair, checking meta for booly:',bounty__debugMeta(bounty,indexZ));if(!hasFlags(metaZ,BOUNTY_FLAG_NOT_BOOLY)){TRACE(' - Y and Z are both booly and xor on the same variable. so this is a pseudo alias. slash the found xor.');// Keep the current xor (X^Y) and drop the found xor (X^Z)
cutAddPseudoBoolyAlias(indexY,indexZ);aliased=true;}}if(aliased){TRACE(' - Y was aliased to Z, eliminating this xor and returning');ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,indexX);bounty_markVar(bounty,indexY);// The alias will mess up Y counts
bounty_markVar(bounty,indexZ);somethingChanged();return true;}TRACE(' - Z did not match. moving to next constraint');}}TRACE('  - did not find a second xor; bailing');return false;}function trick_isall_xor(indexA,indexB,xorOffset,countsA,countsB){TRACE('trick_isall_xor; index A:',indexA,', index B:',indexB,', counts:',countsA,countsB);ASSERT(countsA===2,'check function if this changes',countsA,countsB);// R^A, R=all?(X Y Z)  ->   A=nall(X Y Z)
// the xor kind of acts like a diff in this case so we flip the isall to become a isnall on xor's other arg
// we defer R to be xor A in the solvestack
TRACE(' - first searching for isall op');for(var i=0;i<countsA;++i){var offset=bounty_getOffset(bounty,indexA,i);ASSERT(offset,'there should be as many offsets as counts unless that exceeds the max and that has been checked already');if(offset!==xorOffset){var opcode=ml_dec8(ml,offset);if(opcode===ML_ISALL){TRACE(' - found isall at',offset);return _trick_isall_xor(indexA,indexB,xorOffset,offset);}}}THROW('bounty should have asserted that an isall existed');}function _trick_isall_xor(indexR,indexB,xorOffset,isallOffset){TRACE_MORPH('R^S, R=all?(X Y Z ...)','S=nall(X Y Z ...)');TRACE(' - _trick_isall_xor: now applying morph to isall and eliminating the xor');// Note: R only has 2 counts
var isallArgCount=ml_dec16(ml,isallOffset+1);ASSERT(getAlias(ml_dec16(ml,isallOffset+SIZEOF_C+isallArgCount*2))===indexR);// Morph the isall to an isnall (simply change the op) on B. dont forget to mark all its args
ml_enc8(ml,isallOffset,ML_ISNALL);ml_enc16(ml,isallOffset+SIZEOF_C+isallArgCount*2,indexB);ml_eliminate(ml,xorOffset,SIZEOF_C_2);// A of xor is R of isall. defer resolving the xor because B of xor
// is going to be the new R of the isall-flipped-to-isnall
solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - _trick_isall_xor');var R=getDomain(indexR);var B=getDomain(indexB);TRACE(' -',domain__debug(R),'^',domain__debug(B));// Since S is solved according to "not isall", we only have to force R^S here
// (we didnt eliminate the isall, we just transformed it)
ASSERT(domain_isBooly(R));if(domain_isBooly(B))B=domain_createValue(force(indexB));if(domain_isZero(B)){R=domain_removeValue(R,0);}else{ASSERT(domain_hasNoZero(B));R=domain_removeGtUnsafe(R,0);}setDomain(indexR,R);ASSERT(getDomain(indexR));ASSERT(getDomain(indexB));ASSERT(!domain_isBooly(getDomain(indexR))&&!domain_isBooly(getDomain(indexB)));ASSERT(domain_isZero(getDomain(indexR))!==domain_isZero(getDomain(indexB)));});bounty_markVar(bounty,indexR);// R
bounty_markVar(bounty,indexB);markAllArgs(ml,isallOffset,isallArgCount);somethingChanged();return true;}function trick_issome_xor(indexA,indexR,xorOffset,countsA,countsB){TRACE('trick_issome_xor; index A:',indexA,', index R:',indexR,', counts:',countsA,countsB);TRACE(' - A^R, R=all?(X Y Z)  ->   A=nall(X Y Z)');// The xor kind of acts like a diff in this case so we flip the isall to become a isnone
// and use A as the new result var for that isnone
TRACE(' - first searching for issome op');for(var i=0;i<countsA;++i){var offset=bounty_getOffset(bounty,indexA,i);if(offset!==xorOffset){var opcode=ml_dec8(ml,offset);if(opcode===ML_ISSOME){TRACE(' - found issome at',offset);return _trick_issome_xor(indexA,indexR,xorOffset,offset);}}}THROW('bounty should have asserted that an issome existed');}function _trick_issome_xor(indexR,indexA,xorOffset,issomeOffset){TRACE(' - _trick_issome_xor: now applying morph to issome and eliminating the xor');TRACE_MORPH('A^R, R=all?(X Y Z)','A=nall(X Y Z)');var issomeArgCount=ml_dec16(ml,issomeOffset+1);var issomeResultOffset=issomeOffset+SIZEOF_C+issomeArgCount*2;ASSERT(indexR===readIndex(ml,issomeResultOffset),'asserted before');var issomeArgs=markAndCollectArgs(ml,issomeOffset,issomeArgCount);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexR);// Morph the issome to an isnone (simply change the op). dont forget to mark all its args
ml_enc8(ml,issomeOffset,ML_ISNONE);ml_enc16(ml,issomeResultOffset,indexA);ml_eliminate(ml,xorOffset,SIZEOF_C_2);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_issome_xor');var A=getDomain(indexA);var R=getDomain(indexR);TRACE(' -',domain__debug(A),'^',domain__debug(R));if(domain_isZero(A)){TRACE(' - A=0 so R must >0');R=domain_removeValue(R,0);setDomain(indexR,R);}else if(domain_isZero(R)){TRACE(' - R=0 so A must >0');A=domain_removeGtUnsafe(A,0);setDomain(indexA,A);}else if(domain_hasNoZero(A)){TRACE(' - A>0 so R must =0');R=domain_removeGtUnsafe(R,0);setDomain(indexR,R);}else if(domain_hasNoZero(R)){TRACE(' - R>0 so A must =0');A=domain_removeGtUnsafe(A,0);setDomain(indexA,A);}else{ASSERT(domain_isBooly(A)&&domain_isBooly(R));var allNone=true;var some=false;var boolyIndex=-1;for(var i=0;i<issomeArgs.lenght;++i){var index=issomeArgs[i];var D=getDomain(index);if(domain_hasNoZero(D)){some=true;break;}else if(!domain_isZero(D)){allNone=false;boolyIndex=i;}}if(some){TRACE(' - found at least one arg that was nonzero, R>0');R=domain_removeValue(R,0);}else if(allNone){TRACE(' - all args were zero, R=0');R=domain_removeGtUnsafe(R,0);}else{TRACE(' - found no nonzero and at least one arg was booly, forcing R>0 and that arg >0 as well');R=domain_removeValue(R,0);var _index19=issomeArgs[boolyIndex];var _D9=getDomain(_index19);ASSERT(domain_isBooly(_D9),'we. just. checked. this');_D9=domain_removeValue(_D9,0);ASSERT(_D9);setDomain(_index19,_D9);}setDomain(indexR,R);}ASSERT(getDomain(indexA));ASSERT(getDomain(indexR));ASSERT(!domain_isBooly(getDomain(indexA))&&!domain_isBooly(getDomain(indexR)));ASSERT(domain_isZero(getDomain(indexA))!==domain_isZero(getDomain(indexR)));ASSERT(domain_hasNoZero(getDomain(indexR))===issomeArgs.some(function(i){return domain_hasNoZero(getDomain(i));}));});somethingChanged();return true;}function trick_some_xor(indexX,indexA,xorOffset,countsX){TRACE('trick_some_xor; X^A,X|B => A->B, X leaf');var offset1=bounty_getOffset(bounty,indexX,0);var offset2=bounty_getOffset(bounty,indexX,1);var someOffset=offset1===xorOffset?offset2:offset1;TRACE(' - xorOffset:',xorOffset,', someOffset:',someOffset,', indexX:',indexX,', metaX:',bounty__debugMeta(bounty,indexA));ASSERT(ml_dec16(ml,xorOffset+1)===2,'xors have 2 args');ASSERT(countsX===2,'x should be part of SOME and XOR');if(ml_dec16(ml,someOffset+1)!==2){TRACE(' - SOME doesnt have 2 args, bailing');return false;}var X=getDomain(indexX,true);if(!domain_isBooly(X)){TRACE(' - X is not a booly, this should be solved by minimizer, bailing');requestAnotherCycle=true;return false;}ASSERT(readIndex(ml,someOffset+OFFSET_C_A)===indexX||readIndex(ml,someOffset+OFFSET_C_B)===indexX);var indexB=readIndex(ml,someOffset+OFFSET_C_A);if(indexB===indexX)indexB=readIndex(ml,someOffset+OFFSET_C_B);TRACE(' - indexes: X=',indexX,', A=',indexA,', B=',indexB);TRACE(' - domains: X=',domain__debug(getDomain(indexX)),', A=',domain__debug(getDomain(indexA)),', B=',domain__debug(getDomain(indexB)));TRACE_MORPH('X ^ A, X | B','A -> B');TRACE(' - indexes: A=',indexA,', B=',indexB,', X=',indexX);TRACE(' - domains: A=',domain__debug(getDomain(indexA)),', B=',domain__debug(getDomain(indexB)),', X=',domain__debug(getDomain(indexX)));// We dont have to bother with booly checks since there are two occurrences of X left and they both concern booly ops
solveStack.push(function(_,force,getDomain,setDomain){TRACE('trick_some_xor');var A=getDomain(indexA);var B=getDomain(indexB);var X=getDomain(indexX);TRACE(' - X ^ A, X | B  =>  A -> B');TRACE(' - A=',domain__debug(A),', B=',domain__debug(B),', X=',domain__debug(X));if(domain_isZero(A)){TRACE(' - A=0 so X>0');X=domain_removeValue(X,0);}else if(domain_hasNoZero(A)){TRACE(' - A>0 so X=0');X=domain_removeGtUnsafe(X,0);}else if(domain_isZero(B)){TRACE(' - B=0 so X>0');X=domain_removeValue(X,0);}else{TRACE(' - A is booly and B>0 so force A and solve X accordingly');if(force(indexA)===0){TRACE(' - A=0 so X>0');X=domain_removeValue(X,0);}else{TRACE(' - A>0 so X=0');X=domain_removeGtUnsafe(X,0);}}setDomain(indexX,X);ASSERT(getDomain(indexA)&&!domain_isBooly(getDomain(indexA)));ASSERT(getDomain(indexB));ASSERT(getDomain(indexX)&&!domain_isBooly(getDomain(indexX)));ASSERT(domain_isZero(getDomain(indexA))!==domain_isZero(getDomain(indexX)));ASSERT(!domain_hasZero(getDomain(indexX))||!domain_hasZero(getDomain(indexB)));});ml_eliminate(ml,someOffset,SIZEOF_C_2);ml_c2c2(ml,xorOffset,2,ML_IMP,indexA,indexB);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexX);somethingChanged();return true;}function trickNallOnly(indexX,countsX){TRACE('trickNallOnly;',indexX,', counts:',countsX);if(countsX>=BOUNTY_MAX_OFFSETS_TO_TRACK){TRACE(' - counts (',countsX,') is higher than max number of offsets we track so we bail on this trick');return false;}var X=getDomain(indexX,true);if(domain_isZero(X)){TRACE(' - X has is zero so NALL is already solved, rerouting to minimizer');requestAnotherCycle=true;return false;}if(domain_hasNoZero(X)){TRACE(' - X has has no zero should be removed from NALL, rerouting to minimizer');requestAnotherCycle=true;return false;}TRACE(' - X contains zero and is only part of nalls, leaf X and eliminate the nalls');var offsets=[];// To eliminate
var indexes=[];// To mark and to defer solve
for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);ASSERT(offset,'bounty should assert that there are counts offsets');ASSERT(ml_dec8(ml,offset)===ML_NALL,'bounty should assert that all ops are nalls');var argCount=ml_dec16(ml,offset+1);for(var j=0;j<argCount;++j){var index=readIndex(ml,offset+SIZEOF_C+j*2);if(index!==indexX)indexes.push(index);// Dont mark here because that may affect the getOffset call above
}// Let's hope this list doenst grow too much... (but we have to dedupe the indexes!)
if(offsets.indexOf(offset)<0)offsets.push(offset);}TRACE(' - collected offsets and vars:',offsets,indexes);// TODO: we can improve this step and prevent some force solvings
TRACE(' - solving X to 0 now to simplify everything');if(!domain_isZero(X)){ASSERT(domain_hasZero(X),'checked above');setDomain(indexX,domain_createValue(0));}TRACE(' - now remove these nalls:',offsets);for(var _i28=0,len=offsets.length;_i28<len;++_i28){var _offset12=offsets[_i28];TRACE_MORPH('nall(X...)','');var _argCount7=ml_dec16(ml,_offset12+1);var opSize=SIZEOF_C+_argCount7*2;TRACE('   - argcount=',_argCount7,', opSize=',opSize);ml_eliminate(ml,_offset12,opSize);}for(var _i29=0,_len9=indexes.length;_i29<_len9;++_i29){var indexY=indexes[_i29];bounty_markVar(bounty,indexY);}bounty_markVar(bounty,indexX);somethingChanged();return true;}function trickSomeOnly(indexX,countsX){TRACE('trickSomeOnly;',indexX,', counts:',countsX);if(countsX>=BOUNTY_MAX_OFFSETS_TO_TRACK){TRACE(' - counts (',countsX,') is higher than max number of offsets we track so we bail on this trick');return false;}var X=getDomain(indexX,true);if(domain_hasNoZero(X)){TRACE(' - X has no zero so SOME is already solved, rerouting to minimizer');requestAnotherCycle=true;return false;}if(domain_isZero(X)){TRACE(' - X has is zero so should be removed from this SOME, rerouting to minimizer');requestAnotherCycle=true;return false;}TRACE(' - X contains a nonzero and is only part of SOMEs, leaf X and eliminate the SOMEs');var offsets=[];// To eliminate
var indexes=[];// To mark and to defer solve
for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);ASSERT(offset,'bounty should assert that there are counts offsets');ASSERT(ml_dec8(ml,offset)===ML_SOME,'bounty should assert that all ops are SOMEs');var argCount=ml_dec16(ml,offset+1);for(var j=0;j<argCount;++j){var index=readIndex(ml,offset+SIZEOF_C+j*2);if(index!==indexX)indexes.push(index);// Dont mark here because that may affect the getOffset call above
}// Let's hope this list doenst grow too much... (but we have to dedupe the indexes!)
if(offsets.indexOf(offset)<0)offsets.push(offset);}TRACE(' - collected offsets and vars:',offsets,indexes);// TODO: we can improve this step and prevent some force solvings
TRACE(' - removing 0 from X now to simplify everything');if(domain_hasZero(X)){ASSERT(domain_isBooly(X),'checked above');setDomain(indexX,X=domain_removeValue(X,0));}TRACE(' - now remove these SOMEs:',offsets);for(var _i30=0,len=offsets.length;_i30<len;++_i30){var _offset13=offsets[_i30];TRACE_MORPH('some(X...)','');var _argCount8=ml_dec16(ml,_offset13+1);var opSize=SIZEOF_C+_argCount8*2;TRACE('   - argcount=',_argCount8,', opSize=',opSize);ml_eliminate(ml,_offset13,opSize);}for(var _i31=0,_len10=indexes.length;_i31<_len10;++_i31){var indexY=indexes[_i31];bounty_markVar(bounty,indexY);}bounty_markVar(bounty,indexX);somethingChanged();return true;}function trick_ltelhs_nalls_some(indexX,countsX){TRACE('trick_ltelhs_nalls_some; indexX=',indexX);TRACE(' - A !& X, X <= B, X | C    ->     B | C, A <= C    (for any number of nall[2] ops)');// TOFIX: is this bool only?
if(!domain_isBool(getDomain(indexX))){TRACE(' - X wasnt bool (',domain__debug(getDomain(indexX)),'), bailing');return false;}if(countsX>=BOUNTY_MAX_OFFSETS_TO_TRACK){TRACE(' - counts (',countsX,') is higher than max number of offsets we track so we bail on this trick');return false;}var lteOffset;var someOffset;var nallOffsets=[];var indexesA=[];var indexB;var indexC;for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);if(!offset)break;var opCode=ml_dec8(ml,offset);ASSERT(opCode===ML_NALL||opCode===ML_SOME||opCode===ML_LTE,'bounty should assert it logged one of these three ops');if(ml_dec16(ml,offset+1)!==2){TRACE(' - found an op that did not have 2 args, bailing');return false;}var indexL=readIndex(ml,offset+OFFSET_C_A);var indexR=readIndex(ml,offset+OFFSET_C_B);ASSERT(indexX===indexL||indexX===indexR,'bounty should assert that x is part of this op');var indexY=indexL===indexX?indexR:indexL;if(opCode===ML_NALL){nallOffsets.push(offset);indexesA.push(indexY);}else if(opCode===ML_SOME){if(someOffset){TRACE(' - trick only supported with one OR, bailing');return false;}someOffset=offset;indexC=indexY;}else{ASSERT(opCode===ML_LTE,'if not the others then this');if(lteOffset){TRACE(' - trick only supported with one LTE, bailing');return false;}lteOffset=offset;indexB=indexY;}}TRACE(' - collection complete; or offset:',someOffset,', indexesA:',indexesA,', indexB:',indexB,', indexC:',indexC,', indexX:',indexX,', lte offset:',lteOffset,', nall offsets:',nallOffsets);TRACE_MORPH('A !& X, X <= B, X | C','B | C, A <= C');TRACE_MORPH('A !& X, D !& X, X <= B, X | C','B | C, A <= C, D <= C');TRACE('   - every "other" arg of each nall should be <= C');ml_c2c2(ml,lteOffset,2,ML_SOME,indexB,indexC);ml_eliminate(ml,someOffset,SIZEOF_C_2);for(var _i32=0,len=indexesA.length;_i32<len;++_i32){var indexA=indexesA[_i32];ml_c2c2(ml,nallOffsets[_i32],2,ML_LTE,indexA,indexC);bounty_markVar(bounty,indexA);}// Let t = `
//  ${['   - X!&A, ', indexesA.map(indexA => domain__debug(getDomain(indexX)) + ' !& ' + domain__debug(getDomain(indexA))).join(', ')]}
//  ${['   - X<=B, ', domain__debug(getDomain(indexX)), '<=', domain__debug(getDomain(indexB))]}
//  ${['   - X|C,  ', domain__debug(getDomain(indexX)), '|', domain__debug(getDomain(indexC))]}
// `;
TRACE('   - X is a leaf var',indexX);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - or+lte+nalls;',indexX);TRACE(' - this was `A !& X, X <= B, X | C` with any number of !&');TRACE('   - A=',indexesA.map(function(index){return domain__debug(getDomain(index));}),', B=',domain__debug(getDomain(indexB)),', C=',domain__debug(getDomain(indexC)),', X=',domain__debug(getDomain(indexX)));// TRACE(t)
TRACE(' - before:');TRACE('   - X!&A, ',indexesA.map(function(indexA){return domain__debug(getDomain(indexX))+' !& '+domain__debug(getDomain(indexA));}).join(', '));TRACE('   - X<=B, ',domain__debug(getDomain(indexX)),'<=',domain__debug(getDomain(indexB)));TRACE('   - X|C,  ',domain__debug(getDomain(indexX)),'|',domain__debug(getDomain(indexC)));var B=getDomain(indexB);var C=getDomain(indexC);var X=getDomain(indexX);TRACE(' - first scan whether X should be set or unset');var setIt=false;var unsetIt=false;if(domain_isZero(C)){TRACE(' - C is zero so X must be set');setIt=true;}indexesA.forEach(function(indexA){var A=getDomain(indexA);if(domain_hasNoZero(A)){TRACE(' - there was a nall arg that was set so X must be unset');unsetIt=true;}});TRACE(' - so; set?',setIt,', unset?',unsetIt);ASSERT(!(setIt&&unsetIt));if(setIt){X=domain_removeValue(X,0);X=domain_removeGtUnsafe(X,domain_min(B));TRACE(' - Set X and applied LTE: X=',domain__debug(X),', B=',domain__debug(B));}else if(unsetIt){X=domain_removeGtUnsafe(X,0);X=domain_removeGtUnsafe(X,domain_min(B));TRACE(' - Unsetting X and applied LTE: X=',domain__debug(X),', B=',domain__debug(B));}else{X=domain_removeGtUnsafe(X,domain_min(B));if(domain_isBooly(X))X=domain_removeValue(X,0);TRACE(' - first applied LTE and then forced a booly state; X=',domain__debug(X),', B=',domain__debug(B));}setDomain(indexX,X);TRACE(' - feedback new value of X (',domain__debug(X),')');// If X is zero then all the NALLs are already satisfied
if(domain_hasNoZero(X)){TRACE(' - X>0 so forcing all NALL args to be zero');indexesA.forEach(function(indexA){var A=getDomain(indexA);A=domain_removeGtUnsafe(A,0);setDomain(indexA,A);});}TRACE(' - Remove any value from B=',domain__debug(B),'that is below X=',domain__debug(X),', max(X)=',domain_max(X));B=domain_removeLtUnsafe(B,domain_max(X));setDomain(indexB,B);TRACE(' - if X=0 then C>0, X=',domain__debug(X),', C=',domain__debug(C));if(domain_isZero(X)){C=domain_removeValue(C,0);setDomain(indexC,C);}TRACE(' - result:');TRACE('   - X!&A, ',indexesA.map(function(indexA){return domain__debug(getDomain(indexX))+' !& '+domain__debug(getDomain(indexA));}).join(', '));TRACE('   - X<=B, ',domain__debug(getDomain(indexX)),'<=',domain__debug(getDomain(indexB)));TRACE('   - X|C,  ',domain__debug(getDomain(indexX)),'|',domain__debug(getDomain(indexC)));ASSERT(getDomain(indexB));ASSERT(getDomain(indexC));ASSERT(getDomain(indexX));ASSERT(!indexesA.some(function(indexA){return !domain_isZero(getDomain(indexA))&&!domain_isZero(getDomain(indexX));}));ASSERT(domain_max(getDomain(indexX))<=domain_min(getDomain(indexX)));ASSERT(domain_hasNoZero(getDomain(indexX))||domain_hasNoZero(getDomain(indexC)));});bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexC);bounty_markVar(bounty,indexX);somethingChanged();return true;}function trick_implhs_nalls_some(indexX,countsX){TRACE('trick_implhs_nalls_some; indexX=',indexX);TRACE(' - A !& X, X -> B, X | C    ->     B | C, A -> C    (for any number of nall[2] ops)');// TOFIX: is this bool only?
if(countsX>=BOUNTY_MAX_OFFSETS_TO_TRACK){TRACE(' - counts (',countsX,') is higher than max number of offsets we track so we bail on this trick');return false;}var impOffset;var someOffset;var nallOffsets=[];var indexesA=[];var indexB;var indexC;for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);if(!offset)break;var opCode=ml_dec8(ml,offset);ASSERT(opCode===ML_NALL||opCode===ML_SOME||opCode===ML_IMP,'bounty should assert it logged one of these three ops');if(ml_dec16(ml,offset+1)!==2){TRACE(' - found an op that did not have 2 args, bailing');return false;}var indexL=readIndex(ml,offset+OFFSET_C_A);var indexR=readIndex(ml,offset+OFFSET_C_B);ASSERT(indexX===indexL||indexX===indexR,'bounty should assert that x is part of this op');var indexY=indexL===indexX?indexR:indexL;if(opCode===ML_NALL){nallOffsets.push(offset);indexesA.push(indexY);}else if(opCode===ML_SOME){if(someOffset){TRACE(' - trick only supported with one OR, bailing');return false;}someOffset=offset;indexC=indexY;}else{ASSERT(opCode===ML_IMP,'if not the others then this');if(impOffset){TRACE(' - trick only supported with one IMP, bailing');return false;}impOffset=offset;indexB=indexY;}}TRACE(' - collection complete; or offset:',someOffset,', indexesA:',indexesA,', indexB:',indexB,', indexC:',indexC,', indexX:',indexX,', imp offset:',impOffset,', nall offsets:',nallOffsets);TRACE('   - A !& X, X -> B, X | C    ->     B | C, A -> C');TRACE('   - A !& X, D !& X, X -> B, X | C    ->     B | C, A -> C, D -> C');TRACE('   - every "other" arg of each nall should be -> C');ml_c2c2(ml,impOffset,2,ML_SOME,indexB,indexC);ml_eliminate(ml,someOffset,SIZEOF_C_2);for(var _i33=0,len=indexesA.length;_i33<len;++_i33){var indexA=indexesA[_i33];ml_c2c2(ml,nallOffsets[_i33],2,ML_IMP,indexA,indexC);bounty_markVar(bounty,indexA);}TRACE('   - X is a leaf var',indexX);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - imp+nalls+some;',indexX);TRACE(' - this was `A !& X, X -> B, X | C` with any number of !&');TRACE(' - indexes: A=',indexesA,', B=',indexB,', C=',indexC,', X=',indexX);TRACE(' - domains: A=',indexesA.map(function(a){return domain__debug(getDomain(a));}),', B=',domain__debug(getDomain(indexB)),', C=',domain__debug(getDomain(indexC)),', X=',domain__debug(getDomain(indexX)));var X=getDomain(indexX);var nX=X;// A !& X for all A
if(!domain_isZero(nX)){// If X is 0 then the nall already passes
for(var _i34=0,_len11=indexesA.length;_i34<_len11;++_i34){var _indexA=indexesA[_i34];var A=getDomain(_indexA);if(domain_hasNoZero(A)||force(_indexA)!==0){TRACE(' - at least one NALL pair had a nonzero so X must be zero');nX=domain_removeGtUnsafe(nX,0);break;// Now each nall will be fulfilled since X is zero
}}}// X | C so if C is zero then X must be nonzero
var C=getDomain(indexC);if(domain_isBooly(C)){force(C);C=getDomain(indexC);}if(domain_isZero(C)){TRACE(' - the SOME pair C was zero so X must be nonzero');nX=domain_removeValue(nX,0);}// Maintain X -> B
var B=getDomain(indexB);if(domain_isBooly(B)){force(B);B=getDomain(indexB);}if(domain_isZero(B)){TRACE(' - B is zero so X must be zero');nX=domain_removeGtUnsafe(nX,0);}ASSERT(nX);if(X!==nX)setDomain(indexX,nX);});bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexC);bounty_markVar(bounty,indexX);somethingChanged();return true;}function trick_lteboth_nall_some(indexX,countsX){TRACE('trick_lteboth_nall_some',indexX);TRACE(' - A <= X, B | X, C !& X, X <= D     ->     A !& C, B | D, A <= D, C <= B');// If we can model `A !& C, A <= D` in one constraint then we should do so but I couldn't find one
// (when more lte's are added, that's the pattern we add for each)
// TOFIX: is this bool only?
// we only want exactly four ops here... and if max is set to something lower then this trick has no chance at all
if(countsX>4||countsX>=BOUNTY_MAX_OFFSETS_TO_TRACK){TRACE(' - we need exactly four constraints for this trick but have',countsX,', bailing');return false;}// Note: bounty tracks lte_rhs and lte_lhs separate so if we have four constraints
// here can trust bounty to assert they are all our targets, no more, no less.
// we should have; LTE_RHS, LTE_LHS, NALL, SOME
var lteLhsOffset;var lteRhsOffset;var someOffset;var nallOffset;var indexA;var indexB;var indexC;var indexD;for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);ASSERT(offset,'bounty should assert to fetch as many offsets as there are counts');var opCode=ml_dec8(ml,offset);ASSERT(opCode===ML_NALL||opCode===ML_SOME||opCode===ML_LTE,'bounty should assert the op is one of these');// TODO: this kind of breaks on an op with 1 arg
var indexL=readIndex(ml,offset+OFFSET_C_A);var indexR=readIndex(ml,offset+OFFSET_C_B);ASSERT(indexX===indexL||indexX===indexR,'bounty should assert X is one of the args');var indexY=indexL===indexX?indexR:indexL;if(opCode===ML_NALL){ASSERT(!nallOffset,'cant have a second NALL as per bounty');indexC=indexY;nallOffset=offset;}else if(opCode===ML_SOME){ASSERT(!someOffset,'cant have a second SOME as per bounty');indexB=indexY;someOffset=offset;}else{ASSERT(opCode===ML_LTE,'asserted by bounty see above');if(indexL===indexX){// Lte_lhs
ASSERT(!lteLhsOffset,'cant have a second lte_lhs');lteLhsOffset=offset;indexD=indexY;}else{// Lte_rhs
ASSERT(indexR===indexX,'x already asserted to be one of the op args');ASSERT(!lteRhsOffset,'cant have a second lte_rhs');lteRhsOffset=offset;indexA=indexY;}}}TRACE(' - collection complete; offsets:',lteLhsOffset,lteRhsOffset,someOffset,nallOffset,', indexes: X=',indexX,', A=',indexA,', B=',indexB,', C=',indexC,', D=',indexD);TRACE(' - A <= X, B | X, C !& X, X <= D     ->     A !& C, B | D, A <= D, C <= B');ml_c2c2(ml,lteLhsOffset,2,ML_LTE,indexA,indexD);ml_c2c2(ml,lteRhsOffset,2,ML_LTE,indexC,indexD);ml_c2c2(ml,someOffset,2,ML_SOME,indexB,indexD);ml_c2c2(ml,nallOffset,2,ML_NALL,indexA,indexC);TRACE('   - X is a leaf var',indexX);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - some+nall+lte_lhs+lte_rhs;',indexX);var X=getDomain(indexX);if(force(indexA)===1){// A<=X so if A is 1, X must also be 1
X=domain_removeValue(X,0);ASSERT(X,'X should be able to reflect the solution');setDomain(indexX,X);}else if(force(indexB)===0){// X|B so if B is 0, X must be non-zero
X=domain_removeValue(X,0);ASSERT(X,'X should be able to reflect the solution');setDomain(indexX,X);}else if(force(indexC)>0){// If indexA is set, X must be zero
X=domain_removeGtUnsafe(X,0);ASSERT(X,'X should be able to reflect the solution');setDomain(indexX,X);}else if(force(indexD)===0){// X<=D, if indexD is 0, X must be zero
X=domain_removeGtUnsafe(X,0);ASSERT(X,'X should be able to reflect the solution');setDomain(indexX,X);}});bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexC);bounty_markVar(bounty,indexD);bounty_markVar(bounty,indexX);somethingChanged();return true;}function trick_impboth_nall_some(indexX,countsX){TRACE('trick_impboth_nall_some',indexX);TRACE(' - A -> X, B | X, C !& X, X -> D             =>     A !& C, B | D, A -> D, C -> B');// We want a NALL[2], SOME[2], IMP_LHS, and one or more IMP_RHS
// if we can model `A !& C, A -> D` in one constraint then we should do so but I couldn't find one
// - A->(B<?C)
// - A==(C&A&!B)
// - B<C|!A       /       B<C|A==0
// (when more IMPs are added, we add the same pattern for each)
// TOFIX: is this bool only?
if(countsX!==4||countsX>=BOUNTY_MAX_OFFSETS_TO_TRACK){TRACE(' - we need 4 constraints for this trick but have',countsX,', bailing');return false;}// Note: bounty tracks imp_rhs and imp_lhs separate so if we have four constraints
// here can trust bounty to assert they are all our targets, no more, no less.
// TODO: what if somehow X->X ocurred here? (due to other rewrite inside cutter)
// we should have; 1x IMP_RHS, 1x IMP_LHS, 1x NALL, 1x SOME
var impLhsOffset;var impRhsOffset;var someOffset;var nallOffset;var indexA;var indexB;var indexC;var indexD;for(var i=0;i<countsX;++i){var offset=bounty_getOffset(bounty,indexX,i);ASSERT(offset,'bounty should assert to fetch as many offsets as there are counts');var opCode=ml_dec8(ml,offset);ASSERT(opCode===ML_NALL||opCode===ML_SOME||opCode===ML_IMP,'bounty should assert the op is one of these');// TODO: this kind of breaks on an op with 1 arg
var indexL=readIndex(ml,offset+OFFSET_C_A);var indexR=readIndex(ml,offset+OFFSET_C_B);ASSERT(indexX===indexL||indexX===indexR,'bounty should assert X is one of the args');if(opCode===ML_NALL){ASSERT(nallOffset===undefined,'bounty said so');indexC=indexL===indexX?indexR:indexL;nallOffset=offset;}else if(opCode===ML_SOME){ASSERT(someOffset===undefined,'bounty said so');indexB=indexL===indexX?indexR:indexL;someOffset=offset;}else{ASSERT(opCode===ML_IMP,'asserted by bounty see above');var indexY=indexL===indexX?indexR:indexL;if(indexL===indexX){// Imp_lhs
ASSERT(impLhsOffset===undefined,'bounty said so');impLhsOffset=offset;indexD=indexY;}else{// Imp_rhs
ASSERT(indexR===indexX,'x already asserted to be one of the op args');ASSERT(impRhsOffset===undefined,'bounty said so');impRhsOffset=offset;indexA=indexY;}}}TRACE(' - collection complete; offsets:',impLhsOffset,impRhsOffset,someOffset,nallOffset,', indexes: X=',indexX,', A=',indexA,', B=',indexB,', C=',indexC,', D=',indexD);TRACE(' - A -> X, B | X, C !& X, X -> D, X -> E     =>     A !& C, B | D, A -> D, C -> B, A -> E, C -> E');if(!domain_isBool(getDomain(indexA,true))||!domain_isBool(getDomain(indexB,true))||!domain_isBool(getDomain(indexC,true))||!domain_isBool(getDomain(indexD,true))){TRACE(' - At least one of the domains wasnt a bool, bailing for now');return false;}TRACE_MORPH(' - C !& X, B | X, A -> X, X -> D',' - A !& C, B | D, A -> D, C -> B');ml_c2c2(ml,impLhsOffset,2,ML_IMP,indexA,indexD);ml_c2c2(ml,impRhsOffset,2,ML_IMP,indexC,indexD);ml_c2c2(ml,someOffset,2,ML_SOME,indexB,indexD);ml_c2c2(ml,nallOffset,2,ML_NALL,indexA,indexC);TRACE('   - X is a leaf var',indexX);leafs.push(indexX);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - some+nall+imp_lhs+imp_rhs;',indexX);// TODO: we can be less forcing here
var X=getDomain(indexX);if(force(indexA)===1){// A->X so if A is 1, X must also be 1
X=domain_removeValue(X,0);ASSERT(X,'X should be able to reflect the solution');setDomain(indexX,X);}else if(force(indexB)===0){// X|B so if B is 0, X must be non-zero
X=domain_removeValue(X,0);ASSERT(X,'X should be able to reflect the solution');setDomain(indexX,X);}else if(force(indexC)>0){// X!&C so if indexA is set, X must be zero
X=domain_removeGtUnsafe(X,0);ASSERT(X,'X should be able to reflect the solution');setDomain(indexX,X);}else if(force(indexD)===0){// X->D, if indexD is 0, X must be zero
X=domain_removeGtUnsafe(X,0);ASSERT(X,'X should be able to reflect the solution');setDomain(indexX,X);}});bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexC);bounty_markVar(bounty,indexD);bounty_markVar(bounty,indexX);somethingChanged();return true;}function trick_issame_sum(ml,sumOffset,indexR,counts,argCount,sum,min,max,constantValue,constantArgIndex,allSumArgsBoolyPairs){// Only if all sum args are strict bools ([0 1]), one constant excluded
// (R = sum(A B C) & (S = R==?3)        ->    S = all?(A B C)
// (R = sum(A B C) & (S = R==?0)        ->    S = none?(A B C)
// (R = sum(A B C) & (S = R==?[0 1])    ->    S = nall?(A B C)
// (R = sum(A B C) & (S = R==?[1 2])    ->    S = some?(A B C)
// R = sum( ... ), S = R ==? count                       ->   S = all?( ... )
// R = sum( ... ), S = R ==? 0                           ->   S = none?( ... )
// R = sum( ... ), S = R ==? [0 0 count-1 count-1]       ->   S = nall?( ... )
// R = sum( ... ), S = R ==? [1 1 count count]           ->   S = some?( ... )
// R = sum([0 0 3 3], [0 0 5 5]), S = R ==? 8            ->   S = all?( ... )
// R = sum( ... ), S = R ==? sum-max-args                ->   S = all?( ... )
var offset1=bounty_getOffset(bounty,indexR,0);var offset2=bounty_getOffset(bounty,indexR,1);var issameOffset=offset1===sumOffset?offset2:offset1;TRACE('trick_issame_sum; sumOffset:',sumOffset,', issameOffset:',issameOffset,', indexR:',indexR,', countsR:',counts,', metaR:',bounty__debugMeta(bounty,indexR),', min:',min,', max:',max,', const:',constantValue,', const arg pos:',constantArgIndex);ASSERT(min>=0&&max>=0&&min<=max,'min/max check');ASSERT(constantValue>=0,'constant value should be positive or zero');ASSERT(issameOffset>0,'offset should exist and cant be the first op');ASSERT(counts===2,'R should only be used in two constraints (sum and issame)');ASSERT(getMeta(bounty,indexR)===(BOUNTY_FLAG_ISSAME_ARG|BOUNTY_FLAG_SUM_RESULT),'should be sum and issame arg',counts,bounty__debugMeta(bounty,indexR));ASSERT(ml_dec8(ml,sumOffset)===ML_SUM,'check sum offset');ASSERT(ml_dec8(ml,issameOffset)===ML_ISSAME,'check issame offset');ASSERT(ml_dec16(ml,sumOffset+1)===argCount,'argcount should match');ASSERT(constantArgIndex<argCount,'should be valid const pos');var issameArgCount=ml_dec16(ml,issameOffset+1);if(issameArgCount!==2){TRACE(' - issame does not have 2 args, bailing for now');return false;}// S = R ==? X
var indexA=readIndex(ml,issameOffset+OFFSET_C_A);// R or X
var indexB=readIndex(ml,issameOffset+OFFSET_C_B);// R or X
var indexS=readIndex(ml,issameOffset+OFFSET_C_R);// S
ASSERT(indexA===indexR||indexB===indexR,'R should be an arg of the issame');var indexX=indexA;if(indexX===indexR)indexX=indexB;TRACE(' - S = R ==? X; indexes=',indexS,'=',indexR,'==?',indexX);TRACE(' - ',domain__debug(getDomain(indexS)),'=',domain__debug(getDomain(indexR)),'==?',domain__debug(getDomain(indexX)));var R=getDomain(indexR,true);var X=getDomain(indexX,true);var vX=domain_getValue(X);if(vX>=0&&!domain_containsValue(R,vX)){// This case should be handled by the minimizer but deduper/earlier cutter steps could lead to it here anyways
// bailing so minimizer can take care of it in the next cycle
TRACE(' - R didnt contain B so unsafe for leaf cutting, bailing');requestAnotherCycle=true;return false;}// Let want = domain_createRange(min, max);
var Rwant=domain_intersection(R,sum);TRACE(' - R must contain all values in between;',domain__debug(R),'and',domain__debug(sum),'=',domain__debug(Rwant),'(',sum===Rwant,')');if(Rwant!==sum){TRACE(' - R cant represent all values of the sum');// , are the args booly pairs?', allSumArgsBoolyPairs, ', vX:', vX, ', max:', max);
return false;}TRACE(' - sum R range change check passed');// Check the case where all the args are boolyPairs and R contains the sum of maxes
if(allSumArgsBoolyPairs&&vX===max){// R = sum([0 0 3 3], [0 0 5 5]), S = R ==? 8            ->   S = all?( ... )
// R = sum( ... ), S = R ==? sum-max-args                ->   S = all?( ... )
TRACE(' - all sum args are booly and vX is the sum of maxes, morph to isall');TRACE_MORPH('R = sum( ... ), S = R ==? sum-max-args','S = all?( ... )');ml_enc8(ml,sumOffset,ML_ISALL);return _trick_issame_sum_tail(sumOffset,issameOffset,argCount,indexR,indexS,indexX,constantValue,constantArgIndex);}if(vX>=0){return _trick_issame_sum_constant(ml,sumOffset,argCount,indexR,issameOffset,indexS,indexX,vX,max,constantValue,constantArgIndex);}return _trick_issame_sum_domain(ml,sumOffset,argCount,indexR,issameOffset,indexS,indexX,X,constantValue,constantArgIndex);}function _trick_issame_sum_constant(ml,sumOffset,argCount,indexR,issameOffset,indexS,indexX,vX,max,constantValue,constantArgIndex){TRACE(' - _trick_issame_sum_constant',vX);// This is when the X of S=R==?X is a constant
// R = sum(A B C), S = R ==? 0          "are none of ABC set"
// R = sum(A B C 5), S = R ==? 0        S=0 because R is always at least 5. we ignore this here
// R = sum(A B C 5), S = R ==? 5        "are none of ABC set"
// R = sum(A B C), S = R ==? 3          "are all args set"
// R = sum(A B C 5), S = R ==? 3        S=0 because R is always at least 5. we ignore this here
// R = sum(A B C 5), S = R ==? 8        "are all args set"
// note: we're not checking the sum bounds here (R is not a leaf). we only want to know how
// the sum bounds relate to X of the issame.
TRACE(' - vX=',vX,', constantValue=',constantValue,', const arg pos:',constantArgIndex,', argCount=',argCount,', for isnone, vX must be',constantValue,', for isall vX must be',argCount+(constantValue?constantValue-1:0));ASSERT(constantArgIndex<argCount,'const pos should be valid');ASSERT(ml_dec16(ml,issameOffset+1)===2,'issame should have 2 args');// To remind you; all sum args are at least booly and there is at most one constant among them
if(vX===constantValue){// This means all non-constant args must become zero
// for example; R=sum(A,B,C,3,8),S=R==?11 => A=B=C=0
TRACE(' - min=X so all non-constants must be set to zero to satisfy the sum+issame. that means morph to isnone');TRACE_MORPH('R=sum(A,B,C,x,y),S=R==?(x+y)','A=B=C=0');// Sum will fit isnone. it'll be exactly the same size
// only need to update the op code and the result index, as the rest remains the same
ml_enc8(ml,sumOffset,ML_ISNONE);}else if(vX===max){// This means all non-constant args must be non-zero
// for example: R=sum(A:[0 1],B:[0 0 2 2],C:[0 1],3,8),S=R==?15 => S=all?(A B C)
TRACE(' - (c+a-1)==X so all non-constants must be set to non-zero to satisfy the sum+issame. that means morph to isall');TRACE_MORPH('R=sum(A:boolypair,B:boolypair,...,y,z,...),S=R==?(max(A)+max(B)+x+y+...)','S=all?(A B C ...)');// Sum will fit isall. it'll be exactly the same size
// only need to update the op code and the result index, as the rest remains the same
ml_enc8(ml,sumOffset,ML_ISALL);}else{TRACE(' - min < X < max, cant morph this, bailing');return false;}return _trick_issame_sum_tail(sumOffset,issameOffset,argCount,indexR,indexS,indexX,constantValue,constantArgIndex);}function _trick_issame_sum_domain(ml,sumOffset,argCount,indexR,issameOffset,indexS,indexX,X,constantValue,constantArgIndex){TRACE(' - _trick_issame_sum_domain',domain__debug(X));// This is when the X of S=R==?X is an unsolved domain
// R = sum(A B C), S = R ==? [0 2]      "are not all of ABC set"
// R = sum(A B C 5), S = R ==? [0 2]    S=0 because R is always at least 5. we ignore this here
// R = sum(A B C 5), S = R ==? [5 7]    "are not all of ABC set"
// R = sum(A B C), S = R ==? [1 3]      "are some of ABC set"
// R = sum(A B C 5), S = R ==? [1 3]    S=0 because R is always at least 5. we ignore this here
// R = sum(A B C 5), S = R ==? [6 8]    "are some of ABC set"
// note: we're not checking the sum bounds here (R is not a leaf). we only want to know how
// the sum bounds relate to X of the issame.
TRACE(' - n=',argCount,', c=',constantValue,'; X=',domain__debug(X),', issome means [c+1 c+n-1] so [',constantValue+1,',',constantValue+argCount-1,'], and isnall means [c (c-(C?1:0))+n-1] so [',constantValue,',',constantValue-(constantValue?1:0)+(argCount-1),']');ASSERT(ml_dec16(ml,issameOffset+1)===2,'issame should have 2 args');if(X===domain_createRange(constantValue+1,constantValue+argCount-(constantValue?1:0))){TRACE(' - X requires at least one var to be set, so issome');TRACE_MORPH('R = sum(A:bool B:bool C:bool), S = R ==? [1 3]','S = some?(A B C)');ml_enc8(ml,sumOffset,ML_ISSOME);}else if(X===domain_createRange(constantValue,constantValue-(constantValue?1:0)+(argCount-1))){TRACE(' - X requires one var to be unset, so isnall');TRACE_MORPH('R = sum(A:bool B:bool C:bool), S = R ==? [0 2]','S = nall?(A B C)');ml_enc8(ml,sumOffset,ML_ISNALL);}else{TRACE(' - sum bounds does not match X in a useful way, bailing');return false;}return _trick_issame_sum_tail(sumOffset,issameOffset,argCount,indexR,indexS,indexX,constantValue,constantArgIndex);}function _trick_issame_sum_tail(sumOffset,issameOffset,argCount,indexR,indexS,indexX,constantValue,constantArgIndex){// Note: NO bailing here
TRACE(' - _trick_issame_sum_tail');ASSERT(ml_dec16(ml,issameOffset+1)===2,'issame should have 2 args');var newArgCount=removeOneConstantFromArgs(constantValue,constantArgIndex,argCount,sumOffset);// Make S the result var for the isnall/issome/isnone/isall
ml_enc16(ml,sumOffset+SIZEOF_C+newArgCount*2,indexS);TRACE(' - eliminating the issame, marking all affected vars');var args=markAndCollectArgs(ml,sumOffset,newArgCount);// (R = sum(A B C) & (S = R==?3)        ->    S = all?(A B C)
// (R = sum(A B C) & (S = R==?0)        ->    S = none?(A B C)
// (R = sum(A B C) & (S = R==?[0 1])    ->    S = nall?(A B C)
// (R = sum(A B C) & (S = R==?[1 2])    ->    S = some?(A B C)
solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - _trick_issame_sum_tail; force solving the issame (only)');// Note: the sum is handled through addSumToSolveStack, which should resolve before this solvestack entry
var S=getDomain(indexS);var R=getDomain(indexR);var X=getDomain(indexX);ASSERT(domain_isSolved(R),'this should be solved by the solvestack compiled after this one (addSumToSolveStack)');TRACE(' - before: S=',domain__debug(S),' = R=',domain__debug(R),' ==? X=',domain__debug(X));if(!domain_isBooly(S)){if(!domain_intersection(R,X)){TRACE(' R and X dont intersect so S is falsy');S=domain_removeGtUnsafe(S,0);setDomain(indexS,S);}else{force(indexX);X=getDomain(indexX);// Note: R should be solved here
if(R===X){TRACE(' - X==R so set S to truthy');S=domain_removeValue(S,0);setDomain(indexS,S);}else{TRACE(' - X!=R so set S to falsy');S=domain_removeGtUnsafe(S,0);setDomain(indexS,S);}}}TRACE(' - between: S=',domain__debug(S),' = R=',domain__debug(R),' ==? X=',domain__debug(X));ASSERT(!domain_isBooly(S));if(domain_isZero(S)){TRACE(' - S=0 so X != R');X=domain_removeValue(X,domain_getValue(R));}else{TRACE(' - S>0 so X == R');X=domain_intersection(X,R);}setDomain(indexX,X);TRACE(' - after: S=',domain__debug(S),' = R=',domain__debug(R),' ==? X=',domain__debug(X));ASSERT(getDomain(indexS));ASSERT(getDomain(indexX));ASSERT(getDomain(indexR),'enforced by other solve stack');ASSERT(!domain_isBooly(getDomain(indexS)));ASSERT(domain_isSolved(getDomain(indexR)),'the sum result should also be solved (enforced by other solve stack)');ASSERT(domain_isZero(getDomain(indexS))||domain_isSolved(getDomain(indexX)),'if S>0 then X must be solved to guarantee the eq');ASSERT(domain_isZero(getDomain(indexS))===!domain_intersection(getDomain(indexR),getDomain(indexX)));});addSumToSolveStack(indexR,args,constantValue);ml_eliminate(ml,issameOffset,SIZEOF_CR_2);ASSERT(newArgCount===args.length);bounty_markVar(bounty,indexS);bounty_markVar(bounty,indexR);bounty_markVar(bounty,indexX);somethingChanged();return true;}function trick_islte_sum(ml,sumOffset,indexR,counts,argCount,min,max,constantValue,constantArgIndex){// Only if all sum args are strict bools ([0 1]), one constant excluded
// (R = sum(A B C) & (S = R<=?0)        ->    S = none?(A B C)
// (R = sum(A B C) & (S = R<=?2)        ->    S = nall?(A B C)
// (R = sum(A B C) & (S = 1<=?R)        ->    S = some?(A B C)
// (R = sum(A B C) & (S = 3<=?R)        ->    S = all?(A B C)
// R = sum( ... ), S = R <=? 0          ->    S = none?( ... )
// R = sum( ... ), S = R <=? count-1    ->    S = nall?( ... )
// R = sum( ... ), S = 1 <=? R          ->    S = some?( ... )
// R = sum( ... ), S = count <=? R      ->    S = all?( ... )
var offset1=bounty_getOffset(bounty,indexR,0);var offset2=bounty_getOffset(bounty,indexR,1);var islteOffset=offset1===sumOffset?offset2:offset1;TRACE('trick_islte_sum; sumOffset:',sumOffset,', islteOffset:',islteOffset,', indexR:',indexR,', countsR:',counts,', metaR:',bounty__debugMeta(bounty,indexR),', min=',min,', max=',max,', constantValue=',constantValue);ASSERT(islteOffset>0,'offset should exist and cant be the first op');ASSERT(counts===2,'R should only be used in two constraints (sum and islte)');ASSERT(getMeta(bounty,indexR)===(BOUNTY_FLAG_ISLTE_ARG|BOUNTY_FLAG_SUM_RESULT),'should be sum and islte arg',counts,bounty__debugMeta(bounty,indexR));ASSERT(ml_dec8(ml,sumOffset)===ML_SUM,'check sum offset');ASSERT(ml_dec8(ml,islteOffset)===ML_ISLTE,'check islte offset');ASSERT(ml_dec16(ml,sumOffset+1)===argCount,'argcount should match');var indexA=readIndex(ml,islteOffset+1);// R or ?
var indexB=readIndex(ml,islteOffset+3);// R or ?
var indexS=readIndex(ml,islteOffset+5);// S
ASSERT(indexA===indexR||indexB===indexR,'R should be an arg of the islte');var indexX=indexA;if(indexX===indexR)indexX=indexB;// (R = sum(...) & (S = A<=?B)
// (R = sum(...) & (S = R<=?X) or
// (R = sum(...) & (S = X<=?R)
var X=getDomain(indexX,true);var vX=domain_getValue(X);// We cant check 0 1 n-1 n here because a constant could affect those values. so only check whether X is solved.
if(vX<0){TRACE(' - X is not solved, bailing');return false;}var R=getDomain(indexR,true);if(!domain_containsValue(R,vX)){// This case should be handled by the minimizer but deduper/earlier cutter steps could lead to it here anyways
// bailing so minimizer can take care of it in the next cycle
TRACE(' - R didnt contain B so unsafe for leaf cutting, bailing');requestAnotherCycle=true;return false;}TRACE(' - validating sum args now');var want=domain_createRange(min,max);var Rwant=domain_intersection(R,want);TRACE(' - sum args summed; min is',min,'and max is',max,', R must contain all values in between;',domain__debug(R),'and',domain__debug(want),'=',domain__debug(Rwant),'(',Rwant===want,')');if(Rwant!==want){TRACE(' - R cant represent all values of the sum so bailing');return false;}// Note: we're not checking the sum bounds here (R is not a leaf). we only want to know how
// the sum bounds relate to X of the islte.
// the position of R in the isLte determines what values we care about here
// R = sum( ... ), S = R <=? 0          =>    S = none?( ... )
// R = sum( ... ), S = R <=? count-1    =>    S = nall?( ... )
// R = sum( ... ), S = 1 <=? R          =>    S = some?( ... )
// R = sum( ... ), S = count <=? R      =>    S = all?( ... )
var targetOp=0;if(indexA===indexR){ASSERT(indexB===indexX);TRACE(' - X=',vX,', n=',argCount,', c=',constantValue,', x is to the right. we care about 0 and n-1 (',constantValue,'and',constantValue-(constantValue?1:0)+(argCount-1),')');// R = sum(A B C), S = R <=? 0          "are none of ABC set"
// R = sum(A B C 5), S = R <=? 0        S=0 because R is always at least 5. we ignore this here
// R = sum(A B C 5), S = R <=? 5        "are non of ABC set"
// R = sum(A B C), S = R <=? 2          "are at most 2 of ABC set"
// R = sum(A B C 5), S = R <=? 2        S=0 because R is always at least 5. we ignore this here
// R = sum(A B C 5), S = R <=? 7        "are at most 2 of ABC set"
if(vX===constantValue){//
TRACE(' - this is "are none of the sum args set, ignoring the constant"');TRACE_MORPH('R = sum(A B C ...), S = R <=? 0','S = none?(A B C ...)');targetOp=ML_ISNONE;}else if(vX===constantValue-(constantValue?1:0)+(argCount-1)){TRACE(' - this is "are not all of the sum args set, ignoring the constant"');TRACE_MORPH('R = sum( ... ), S = R <=? count-1','S = nall?( ... )');targetOp=ML_ISNALL;}else{TRACE(' - Unable to apply trick, bailing');return false;}}else{ASSERT(indexA===indexX&&indexB===indexR);TRACE(' - X=',vX,', n=',argCount,', c=',constantValue,', x is to the left. we care about 1 and n (',constantValue+1,'and',constantValue-(constantValue?1:0)+argCount,')');// R = sum(A B C), S = 1 <= R          "are some of ABC set"
// R = sum(A B C 5), S = 1 <=? R        S=1 because R is always at least 5. we ignore this here
// R = sum(A B C 5), S = 6 <=? R        "are some of ABC set"
// R = sum(A B C), S = 3 <=? R          "are all of ABC set"
// R = sum(A B C 5), S = 4 <=? R        S=1 because R is always at least 5. we ignore this here
// R = sum(A B C 5), S = 5+4-1 <=? R    "are all of ABC set"
if(vX===constantValue+1){TRACE(' - this is "is at least one sum arg set"');TRACE('R = sum( ... ), S = 1 <=? R','S = some?( ... )');targetOp=ML_ISSOME;}else if(vX===constantValue-(constantValue?1:0)+argCount){TRACE(' - this is "are all of the sum args set"');TRACE('R = sum( ... ), S = count <=? R','S = all?( ... )');targetOp=ML_ISALL;}else{TRACE(' - Unable to apply trick, bailing');return false;}}ASSERT(targetOp!==0,'should be one of the four reifier ops');// NOW update the op. we won't bail after this point.
ml_enc8(ml,sumOffset,targetOp);TRACE(' - eliminating the islte, marking all affected vars');TRACE(' - constant value:',constantValue,', arg index:',constantArgIndex);var newArgCount=removeOneConstantFromArgs(constantValue,constantArgIndex,argCount,sumOffset);var args=markAndCollectArgs(ml,sumOffset,newArgCount);// The position of R in the isLte determines what values we care about here
// R = sum( ... ), S = R <=? 0          =>    S = none?( ... )
// R = sum( ... ), S = R <=? count-1    =>    S = nall?( ... )
// R = sum( ... ), S = 1 <=? R          =>    S = some?( ... )
// R = sum( ... ), S = count <=? R      =>    S = all?( ... )
// make S the result var for the reifier
ml_enc16(ml,sumOffset+SIZEOF_C+newArgCount*2,indexS);solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_islte_sum; force solving S (only)');// Note: the sum is handled through addSumToSolveStack, which should resolve before this solvestack entry
var S=getDomain(indexS);var R=getDomain(indexR);ASSERT(domain_isSolved(R),'this should be solved by the solvestack compiled after this one (addSumToSolveStack)');TRACE(' - before: S=',domain__debug(S),', R=',domain__debug(R),', vX=',vX,', x left?',indexA===indexX);if(!domain_isBooly(S)){if(indexX===indexA){// S = x <= R
if(vX<=domain_min(R)){TRACE(' - x<=R so set S to truthy');S=domain_removeValue(S,0);setDomain(indexS,S);}else{TRACE(' - R>x so set S to falsy');S=domain_removeGtUnsafe(S,0);setDomain(indexS,S);}}else{// S = R <= x
if(domain_max(R)<=vX){TRACE(' - R<=x so set S to truthy');S=domain_removeValue(S,0);setDomain(indexS,S);}else{TRACE(' - R>x so set S to falsy');S=domain_removeGtUnsafe(S,0);setDomain(indexS,S);}}}TRACE(' - after: S=',domain__debug(getDomain(indexS)),', R=',domain__debug(getDomain(indexR)),', X=',domain__debug(getDomain(indexX)));ASSERT(getDomain(indexS));ASSERT(getDomain(indexR),'enforced by other solve stack');ASSERT(args.every(getDomain));ASSERT(!domain_isBooly(getDomain(indexS)));ASSERT(domain_isSolved(getDomain(indexR)),'the sum result should also be solved (enforced by other solve stack)');ASSERT(domain_isZero(getDomain(indexS))!==(indexX===indexA?vX<=domain_min(getDomain(indexR)):domain_max(getDomain(indexR))<=vX),'S=x<=R or S=R<=x should hold');});addSumToSolveStack(indexR,args,constantValue);ml_eliminate(ml,islteOffset,SIZEOF_VVV);bounty_markVar(bounty,indexR);somethingChanged();return true;}function trick_xnor_pseudoSame(ml,offset,indexA,boolyA,indexB,boolyB){// A or B or both are only used as a boolean (in the zero-nonzero sense, not strictly 0,1)
// the xnor basically says that if one is zero the other one is too, and otherwise neither is zero
// cominbing that with the knowledge that both vars are only used for zero-nonzero, one can be
// considered a pseudo-alias for the other. we replace it with the other var and defer solving it.
// when possible, pick a strictly boolean domain because it's more likely to allow new tricks.
// note that for a booly, the actual value is irrelevant. whether it's 1 or 5, the ops will normalize
// this to zero and non-zero anyways. and by assertion the actual value is not used inside the problem
TRACE(' - trick_xnor_pseudoSame; found booly-eq in a xnor:',indexA,'!^',indexB,', A booly?',boolyA,', B booly?',boolyB);ASSERT(boolyA||boolyB,'at least one of the args should be a real booly (as reported by bounty)');ASSERT(ml_dec16(ml,offset+1)===2,'should have 2 args');// Ok, a little tricky, but we're going to consider the bool to be a full alias of the other var.
// once we create a solution we will override the value and apply the booly constraint and assign
// it either its zero or nonzero value(s) depending on the other value of this xnor.
var indexEliminate=indexB;// Eliminate
var indexKeep=indexA;// Keep
// keep the non-bool if possible
if(!boolyB){TRACE(' - keeping B instead because its not a booly');indexEliminate=indexA;indexKeep=indexB;}cutAddPseudoBoolyAlias(indexKeep,indexEliminate);ml_eliminate(ml,offset,SIZEOF_C_2);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);somethingChanged();}function trick_sum_booly(ml,sumOffset,indexR,countsR,sum,argCount){// R is used as a result var for a sum
// we must first confirm that R is a booly (only used as arg in booly places of ops), except for being a sum-result
// in that case the sum is an isSome because that's the only thing that matters for R
// note that the meta flags will claim non-booly because (at least) R is the sum result var so we gotta confirm that
TRACE('trick_sum_booly; sumOffset:',sumOffset,', indexR:',indexR,', countsR:',countsR,', argCount:',argCount,', metaR:',bounty__debugMeta(bounty,indexR));ASSERT((getMeta(bounty,indexR)&BOUNTY_FLAG_SUM_RESULT)===BOUNTY_FLAG_SUM_RESULT,'shouldve been confirmed');ASSERT(ml_dec16(ml,sumOffset+1)===argCount,'argcount should match');var R=getDomain(indexR,true);TRACE(' - first checking whether R (',domain__debug(R),') is a booly when not counting this sum (pair?',domain_isBoolyPair(R),')');if(!domain_isBoolyPair(R)){// If a var only has a zero and one nonzero value it doesnt matter: it's always booly
for(var i=0;i<countsR;++i){var offset=bounty_getOffset(bounty,indexR,i);ASSERT(offset,'should exist');if(offset!==sumOffset){var opCode=ml_dec8(ml,offset);var isBooly=cut_isBoolyOp(opCode,true,ml,offset,indexR);if(isBooly===ML_BOOLY_NO){TRACE(' - R is at least a non-booly in one op ('+ml__opName(opCode)+'), bailing');return;}ASSERT(isBooly===ML_BOOLY_YES,'cannot be maybe because asked for explicit lookups');}}}TRACE(' - ok, R is booly. next confirming that R can represent any valuation of the sum args, total sum of args:',domain__debug(sum),'R:',domain__debug(R));// If sum doesnt intersect with domain then there are valuations of the sum-args such that the result is not in R
// we could theoretically fix that but it'll be too much work and little to show for. so we just bail.
if(sum!==domain_intersection(R,sum)){TRACE('  - R does not contain all possible sums so we bail');return false;}TRACE('  - R contains all sums so we can morph the sum to an isall');var args=markAndCollectArgs(ml,sumOffset,argCount);// So; in the remaining problem R is only used as booly. so we dont care what the actual value is of R, just
// whether it's zero or non-zero. so it will arbitrarily be set thusly. we'll add a solveStack entry that
// makes sure R is solved to the sum of whatever the args are solved to.
var oR=R;// Back up R because the issome may change it irrelevantly
solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_sum_booly');// Note: we need to force solve all args to make sure the sum constraint holds
var vR=0;for(var _i35=0;_i35<argCount;++_i35){vR+=force(args[_i35]);}var R=domain_intersectionValue(oR,vR);ASSERT(R,'R should be able to reflect the solution');if(oR!==R)setDomain(indexR,R,false,true);});// The sum is a count-result-op and so is the isAll so we only need to replace the opcode
ml_enc8(ml,sumOffset,ML_ISSOME);bounty_markVar(bounty,indexR);somethingChanged();return true;}function trick_issame_issame_sum(ml,sumOffset,indexR,countsR,sum,argCount){// R = sum(A B), S = R ==? 1, T = R ==? 2    ->    S = A !=? B, T = all?(A B)
// the sum is confirmed already
// we need to confirm that this concerns 2x issame (and not 2x sum)
// we need to confirm that each issame has R and either a literal 1 or 2 (and exactly 2 args)
TRACE(' - trick_issame_issame_sum');TRACE(' - R = sum(A B), S = R ==? 1, T = R ==? 2    =>    S = A !=? B, T = all?(A B)');ASSERT(countsR===3,'should be 3 links to this sum');var issameOffset1=bounty_getOffset(bounty,indexR,0);var issameOffset2=bounty_getOffset(bounty,indexR,1);ASSERT(issameOffset1===sumOffset||issameOffset2===sumOffset||bounty_getOffset(bounty,indexR,2)===sumOffset,'sum should be one of the three');if(issameOffset1===sumOffset)issameOffset1=bounty_getOffset(bounty,indexR,2);else if(issameOffset2===sumOffset)issameOffset2=bounty_getOffset(bounty,indexR,2);if(ml_dec8(ml,issameOffset1)!==ML_ISSAME||ml_dec8(ml,issameOffset2)!==ML_ISSAME){TRACE(' - this wasnt sum+issame+issame, bailing',ml__opName(ml_dec8(ml,issameOffset1)),ml__opName(ml_dec8(ml,issameOffset2)));return false;}var argCount1=ml_dec16(ml,issameOffset1+1);var argCount2=ml_dec16(ml,issameOffset2+1);if(argCount1!==2||argCount2!==2){TRACE(' - at least one of the issame ops does not have 2 args, bailing');return false;}// R = sum(A B)      R = sum(A B)
// S = K ==? L       S = R ==? X
// T = M ==? N       T = R ==? Y
//    X==1&Y==2 | X==2&Y==1
var indexA=readIndex(ml,sumOffset+OFFSET_C_A);var indexB=readIndex(ml,sumOffset+OFFSET_C_B);var A=getDomain(indexA,true);var B=getDomain(indexB,true);TRACE(' - A:',domain__debug(A),', B:',domain__debug(B));if(!domain_isBool(A)||!domain_isBool(B)){TRACE(' - A or B wasnt bool, bailing');return false;}var indexK=readIndex(ml,issameOffset1+OFFSET_C_A);var indexL=readIndex(ml,issameOffset1+OFFSET_C_B);var indexS=readIndex(ml,issameOffset1+OFFSET_C_R);var indexM=readIndex(ml,issameOffset2+OFFSET_C_A);var indexN=readIndex(ml,issameOffset2+OFFSET_C_B);var indexT=readIndex(ml,issameOffset2+OFFSET_C_R);ASSERT(indexK===indexR||indexL===indexR,'R should be arg to this issame');var indexX=indexK;if(indexX===indexR)indexX=indexL;ASSERT(indexM===indexR||indexN===indexR,'R should be arg to this issame');var indexY=indexM;if(indexY===indexR)indexY=indexN;var X=getDomain(indexX,true);var vX=domain_getValue(X);var Y=getDomain(indexY,true);var vY=domain_getValue(Y);TRACE(' - (X)  S=K==?L :',indexS+"="+indexK+"==?"+indexL,domain__debug(getDomain(indexS,true)),'=',domain__debug(getDomain(indexK,true)),'==?',domain__debug(getDomain(indexL,true)));TRACE(' - (Y)  T=M==?N :',indexT+"="+indexM+"==?"+indexN,domain__debug(getDomain(indexT,true)),'=',domain__debug(getDomain(indexM,true)),'==?',domain__debug(getDomain(indexN,true)));TRACE(' - X=',indexX,'=',domain__debug(X),', Y=',indexY,'=',domain__debug(Y));if(vX!==1&&vX!==2||vY!==1&&vY!==2||vX===vY){TRACE(' - issame pattern doesnt match, bailing');return false;}TRACE_MORPH('R = sum(A B), S = R ==? 1, T = R ==? 2','S = A !=? B, T = all?(A B)');TRACE(' - pattern should match now so we can start the morph. one issame becomes A!=?B, the sum becomes all?(A B), the other issame is eliminated, sum solve stack entry added for R');ASSERT(vX===1&&vY===2||vX===2&&vY===1,'we just checked this!');solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - trick_issame_issame_sum');TRACE(' - ensure the sum result and args are all solved');var R=getDomain(indexR);// A and B were confirmed to be bools
// R is confirmed to be [0 2] (still)
ASSERT(R===domain_createRange(0,2));// Force and sum the values of A and B and set R to that
var sum=force(indexA)+force(indexB);var nR=domain_intersectionValue(R,sum);if(R!==nR)setDomain(indexR,nR);ASSERT(getDomain(indexA));ASSERT(getDomain(indexB));ASSERT(getDomain(indexR));ASSERT(domain_isSolved(getDomain(indexA)));ASSERT(domain_isSolved(getDomain(indexB)));ASSERT(domain_isSolved(getDomain(indexR)));ASSERT(domain_getValue(getDomain(indexR))===domain_getValue(getDomain(indexA))+domain_getValue(getDomain(indexB)));});// T = all?(A B)
ml_enc8(ml,sumOffset,ML_ISALL);ASSERT(argCount===2,'change the offset below if this changes');ml_enc16(ml,sumOffset+OFFSET_C_C,vX===2?indexS:indexT);// S = A !=? B
ASSERT(ml_dec16(ml,issameOffset1+1)===2,'arg count for issame must be 2');ml_enc8(ml,issameOffset1,ML_ISDIFF);ml_enc16(ml,issameOffset1+OFFSET_C_A,indexA);ml_enc16(ml,issameOffset1+OFFSET_C_B,indexB);ml_enc16(ml,issameOffset1+OFFSET_C_R,vX===1?indexS:indexT);// Drop the other issame
ASSERT(ml_dec16(ml,issameOffset2+1)===2,'arg count for issame must be 2');ml_eliminate(ml,issameOffset2,SIZEOF_CR_2);bounty_markVar(bounty,indexA);bounty_markVar(bounty,indexB);bounty_markVar(bounty,indexR);bounty_markVar(bounty,indexS);bounty_markVar(bounty,indexX);bounty_markVar(bounty,indexT);bounty_markVar(bounty,indexY);somethingChanged();return true;}// ##############
function cut_isBoolyOp(opCode,checkMaybes,ml,offset,index){TRACE(' - cut_isBoolyOp, op=',ml__opName(opCode),', thorough check?',checkMaybes);switch(opCode){case ML_LT:case ML_LTE:case ML_MINUS:case ML_DIV:case ML_SUM:case ML_PRODUCT:case ML_DIFF:case ML_SAME:return ML_BOOLY_NO;case ML_XOR:case ML_XNOR:case ML_IMP:case ML_NIMP:case ML_ALL:case ML_NALL:case ML_SOME:case ML_NONE:return ML_BOOLY_YES;case ML_NOLEAF:return ML_BOOLY_YES;case ML_NOBOOL:return ML_BOOLY_NO;case ML_ISDIFF:case ML_ISSAME:// If the var occurs as any of the args, it is not a booly (regardless)
if(!checkMaybes)return ML_BOOLY_MAYBE;TRACE('   - thorough check for',ml__opName(opCode),'on index=',index);var argCount=ml_dec16(ml,offset+1);for(var i=0;i<argCount;++i){if(readIndex(ml,offset+SIZEOF_C+i*2)===index)return ML_BOOLY_NO;}ASSERT(readIndex(ml,offset+SIZEOF_C+argCount*2)===index,'if none of the args is index then R must be index');return ML_BOOLY_YES;case ML_ISLT:case ML_ISLTE:// For these ops the result var is fixed in third position
if(!checkMaybes)return ML_BOOLY_MAYBE;TRACE('   - thorough check for',ml__opName(opCode),'on index=',index);if(readIndex(ml,offset+1)===index||readIndex(ml,offset+3)===index)return ML_BOOLY_NO;ASSERT(readIndex(ml,offset+5)===index,'if neither arg then index must be result');return ML_BOOLY_YES;case ML_ISALL:case ML_ISNALL:case ML_ISSOME:case ML_ISNONE:return ML_BOOLY_YES;case ML_START:case ML_JMP:case ML_JMP32:case ML_NOOP:case ML_NOOP2:case ML_NOOP3:case ML_NOOP4:case ML_STOP:return THROW('should not be used for these ops');default:TRACE('(ml_isBooly) unknown op: '+opCode);THROW('(ml_isBooly) unknown op: '+opCode);}}function removeOneConstantFromArgs(constantValue,constantArgIndex,argCount,sumOffset){TRACE(' - removeOneConstantFromArgs; only if there is at most one constant at all; const value:',constantValue,', arg pos:',constantArgIndex,', args:',argCount,', op offset:',sumOffset);ASSERT(constantArgIndex<argCount,'arg pos should be valid');if(constantArgIndex>=0){// We want to eliminate the constant arg
// it may not be in last position (it ought to be but *shrug*), if so simply overwrite it by the last element
if(constantArgIndex!==argCount-1){TRACE(' - constant wasnt at end, moving it there now, index=',constantArgIndex,', argCount=',argCount);var lastIndex=readIndex(ml,sumOffset+SIZEOF_C+(argCount-1)*2);ml_enc16(ml,sumOffset+SIZEOF_C+constantArgIndex*2,lastIndex);// We want to drop the constant so we dont need to copy that back
}TRACE(' - constant is (now) at the end, reducing arg count to drop it from',argCount,'to',argCount-1);TRACE(' - op before:',ml__debug(ml,sumOffset,1,problem));ASSERT(domain_getValue(getDomain(readIndex(ml,sumOffset+SIZEOF_C+(argCount-1)*2),true))===constantValue,'the constant should now be in last position of the sum');// Reduce sum arg count
--argCount;ml_enc16(ml,sumOffset+1,argCount);// Note: no need to copy R one position back because we will explicitly write an S there anyways
// write a jump in the new open space
ml_enc8(ml,sumOffset+SIZEOF_C+(argCount+1)*2,ML_NOOP2);TRACE(' - op after:',ml__debug(ml,sumOffset,1,problem));ASSERT(ml_validateSkeleton(ml,'removeOneConstantFromArgs; after constant elimination'));}return argCount;}function addSumToSolveStack(indexR,args,constantValue){TRACE(' - adding solvestack entry for isnone/isall/issome/isnall');TRACE(' - args sum to',domain__debug(args.map(getDomain).reduce(function(a,b){return domain_plus(a,b);})),', constant:',constantValue,', total:',domain__debug(domain_plus(domain_createValue(constantValue),args.map(getDomain).reduce(function(a,b){return domain_plus(a,b);}))),', R=',domain__debug(getDomain(indexR)),', all args:',args.map(getDomain).map(domain__debug).join(' '));ASSERT(domain_intersection(getDomain(indexR),domain_plus(domain_createValue(constantValue),args.map(getDomain).reduce(function(a,b){return domain_plus(a,b);})))===getDomain(indexR),'R should be able to reflect the outcome of summing any of its args');// Note: either way, R must reflect the sum of its args. so its the same solve
solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - addSumToSolveStack; cut sum+reifier -> isnone/issome/isall/isnall');var oR=getDomain(indexR);var vR=0;for(var i=0,n=args.length;i<n;++i){var vN=force(args[i]);ASSERT((vN&1)>=0,'should be bool');if(vN)++vR;}var R=domain_intersectionValue(oR,vR+constantValue);ASSERT(R,'R should be able to reflect the solution');if(oR!==R)setDomain(indexR,R);});}function cutAddPseudoBoolyAlias(indexKeep,indexEliminate){var oE=getDomain(indexEliminate,true);// Remember what E was because it will be replaced by false to mark it an alias
TRACE(' - pseudo-alias for booly xnor arg;',indexKeep,'@',indexEliminate,'  ->  ',domain__debug(getDomain(indexKeep)),'@',domain__debug(getDomain(indexEliminate)),'replacing',indexEliminate,'with',indexKeep);var XNOR_EXCEPTION=true;solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - cutAddPseudoBoolyAlias');TRACE(' -',indexKeep,'!^',indexEliminate,'  ->  ',domain__debug(getDomain(indexKeep)),'!^',domain__debug(oE));var vK=force(indexKeep);var E;if(vK===0){E=domain_removeGtUnsafe(oE,0);}else{E=domain_removeValue(oE,0);}TRACE('  -> updating',domain__debug(oE),'to',domain__debug(E));ASSERT(E,'E should be able to reflect the solution');// Always set it even if oE==E
setDomain(indexEliminate,E,true,XNOR_EXCEPTION);});// Note: addAlias will push a defer as well. since the defers are resolved in reverse order,
// we must call addAlias after adding our own defer, otherwise our change will be lost.
addAlias(indexEliminate,indexKeep,'cutAddPseudoBoolyAlias');}function markAndCollectArgs(ml,opOffset,argCount,except){if(except===void 0){except=-1;}TRACE(' - markAndCollectArgs, from offset',opOffset,'for',argCount,'vars');var args=[];for(var i=0;i<argCount;++i){var index=readIndex(ml,opOffset+SIZEOF_C+i*2);if(index!==except)args.push(index);bounty_markVar(bounty,index);}return args;}function markAllArgs(ml,opOffset,argCount){for(var i=0;i<argCount;++i){var index=readIndex(ml,opOffset+SIZEOF_C+i*2);bounty_markVar(bounty,index);}}function cut_moveTo(ml,offset,len){TRACE(' - trying to move from',offset,'to',offset+len,'delta = ',len);switch(ml_dec8(ml,offset+len)){case ML_NOOP:case ML_NOOP2:case ML_NOOP3:case ML_NOOP4:case ML_JMP:case ML_JMP32:TRACE('  - moving to another jump so merging them now');ml_compileJumpAndConsolidate(ml,offset,len);pc=offset;// Restart, make sure the merge worked
break;default:pc=offset+len;break;}}}var __runCounter=0;var __opCounter=0;function deduper(ml,problem){++__runCounter;TRACE('\n ## pr_dedupe, counter=',__runCounter,',ml=',ml.length<50?ml.join(' '):'<big>');var getDomain=problem.getDomain,setDomain=problem.setDomain,getAlias=problem.getAlias,addVar=problem.addVar,addAlias=problem.addAlias;var pc=0;var constraintHash={};// Keys are A@B or R=A@B and the vars can be an index (as is) or a literal prefixed with #
var debugHash={};var removed=0;var aliased=0;var emptyDomain=false;innerLoop();getTerm().log(' - dedupe removed',removed,'constraints and aliased',aliased,'result vars, emptyDomain=',emptyDomain,', processed',__opCounter,'ops');TRACE(m2d__debug(problem));return emptyDomain?-1:aliased;// If aliases were created the minifier will want another go.
function dedupePairOc2(op){var indexA=getAlias(ml_dec16(ml,pc+OFFSET_C_A));var indexB=getAlias(ml_dec16(ml,pc+OFFSET_C_B));var key=op+':'+indexA+','+indexB;var debugString=op+':'+domain__debug(getDomain(indexA,true))+','+domain__debug(getDomain(indexB,true));if(op==='<'||op==='<='){if(checkLtLteFromRegular(op,indexA,indexB,debugString))return;}// Below this line no more deduping, only appending
if(constraintHash[key]!==undefined){TRACE(' - dedupePairOc2; Found dupe constraint; eliminating the second one');TRACE('    - #1:',debugHash[key]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,SIZEOF_C_2);return;}constraintHash[key]=1;debugHash[key]=debugString;pc+=SIZEOF_C_2;}function checkLtLteFromRegular(op,indexA,indexB,debugString){// Check whether reifiers have matching non-reifiers (valid artifacts), so `R=A<?B` and `A<B` means `R>0`
// R>0 when: '<? <' '<=? <' '<=? <='
// R=? when: '<? <=' (because the A==B case always passes '<=' while '<?' depends on R)
TRACE('   - checking for matching regular inverted constraints');ASSERT(op==='<'||op==='<=','update this code if this assertion changes',op);// Search for
// - R=A<?B A<B
// - R=A<=?B A<B
// - R=A<=?B A<=B
// => R>0
if(op==='<'&&checkLtLteFromRegularAB('<?','<',indexA,indexB,debugString))return true;if(op==='<'&&checkLtLteFromRegularAB('<=?','<',indexA,indexB,debugString))return true;if(op==='<='&&checkLtLteFromRegularAB('<=?','<=',indexA,indexB,debugString))return true;// Search for
// - R=A<?B B<A
// - R=A<?B B<=A
// - R=A<=?B B<A
// => R=0
if(op==='<'&&checkLtLteFromRegularBA('<?','<',indexA,indexB,debugString))return true;if(op==='<='&&checkLtLteFromRegularBA('<?','<=',indexA,indexB,debugString))return true;if(op==='<'&&checkLtLteFromRegularBA('<=?','<',indexA,indexB,debugString))return true;return false;}function checkLtLteFromRegularAB(rifop,regop,indexA,indexB,debugString){var rifKey=rifop+':R='+indexA+','+indexB;var reifierOffset=constraintHash[rifKey];if(reifierOffset){var indexR=getAlias(ml_dec16(ml,reifierOffset+5));var R=getDomain(indexR,true);if(!domain_isBooly(R))return false;TRACE(' - checkLtLteFromReifierAB; found `R=A'+rifop+'B` and `A'+regop+'B`, eliminating reifier and booly-solving R, R=',domain__debug(R));TRACE('    - #1:',debugHash[rifKey]);TRACE('    - #2:',debugString);ml_eliminate(ml,reifierOffset,SIZEOF_VVV);TRACE(' - Removing 0 from R');setDomain(indexR,domain_removeValue(R,0));return true;}return false;}function checkLtLteFromRegularBA(rifop,regop,indexA,indexB,debugString){var invRifKey=rifop+':R='+indexB+','+indexA;var reifierOffset=constraintHash[invRifKey];if(reifierOffset){var indexR=getAlias(ml_dec16(ml,reifierOffset+5));var R=getDomain(indexR,true);if(!domain_isBooly(R))return false;TRACE(' - checkLtLteFromReifierBA; found `R=A'+rifop+'B` and `B'+regop+'A`, eliminating reifier and booly-solving R, R=',domain__debug(R));TRACE('    - #1:',debugHash[invRifKey]);TRACE('    - #2:',debugString);ml_eliminate(ml,reifierOffset,SIZEOF_VVV);TRACE(' - Setting R to 0');setDomain(indexR,domain_removeGtUnsafe(R,0));return true;}return false;}function dedupeTripO(op){// This assumes the assignment is a fixed value, not booly like reifiers
// because in this case we can safely alias any R that with the same A@B
var indexA=getAlias(ml_dec16(ml,pc+1));var indexB=getAlias(ml_dec16(ml,pc+3));var indexR=getAlias(ml_dec16(ml,pc+5));var key=op+':'+indexA+','+indexB;var debugString=op+':'+domain__debug(getDomain(indexR,true))+'='+domain__debug(getDomain(indexA,true))+','+domain__debug(getDomain(indexB,true));var index=constraintHash[key];if(index!==undefined){index=getAlias(index);TRACE(' - dedupeTripO; Found dupe constraint; eliminating the second one, aliasing',indexR,'to',index);TRACE('    - #1:',debugHash[key]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,SIZEOF_VVV);if(indexR!==index){var R=domain_intersection(getDomain(indexR,true),getDomain(index,true));if(!R)return emptyDomain=true;// This probably wont matter for most of the cases, but it could make a difference
// setDomain(indexR, R); // (useless)
setDomain(index,R);addAlias(indexR,index);}return;}constraintHash[key]=indexR;debugHash[key]=debugString;pc+=SIZEOF_VVV;}function dedupeIsltIslte(op){// Islt, islte
var offset=pc;var indexA=getAlias(ml_dec16(ml,pc+1));var indexB=getAlias(ml_dec16(ml,pc+3));var indexR=getAlias(ml_dec16(ml,pc+5));// We'll add a key by all three indexes and conditionally also on the args and the domain of R
var key=op+':'+indexR+'='+indexA+','+indexB;var debugString=op+':'+domain__debug(getDomain(indexR,true))+'='+domain__debug(getDomain(indexA,true))+','+domain__debug(getDomain(indexB,true));TRACE('   - key=',key,';',constraintHash[key]!==undefined);if(constraintHash[key]!==undefined){TRACE(' - dedupeReifierTripU; Found dupe constraint; eliminating the second one');TRACE('    - #1:',debugHash[key]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,SIZEOF_VVV);return;}var R=getDomain(indexR,true);TRACE('   - checking for matching regular constraints');ASSERT(op.slice(0,-1)==='<'||op.slice(0,-1)==='<=','update this code if this assertion changes');var regkey=op.slice(0,-1)+':'+indexA+','+indexB;if(constraintHash[regkey]){TRACE(' - dedupeReifierTripU; found R=A'+op+'B and A'+op.slice(0,-1)+'B, eliminating reifier and forcing R to truthy if R has a nonzero, R=',domain__debug(R));if(!domain_isZero(R)){// Has non-zero
TRACE('    - #1:',debugHash[regkey]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,SIZEOF_VVV);TRACE(' - Removing 0 from R');setDomain(indexR,domain_removeValue(R,0));return;}}if(checkLtLteFromReifier(op,indexA,indexB,indexR,R,debugString))return;var invkey=(op==='<?'?'<=?':'<?')+':R='+indexB+','+indexA;var invOffset=constraintHash[invkey];if(invOffset){// One of:
// R = A <? B, S = B <=? A
// R = A <=? B, S = B <? A
// (note: not <?<? nor <=?<=? because they are NOT their own inverse)
TRACE(' - Found `',op==='<?'?'R = A <? B, S = B <=? A':'R = A <=? B, S = B <? A','`');var indexS=getAlias(ml_dec16(ml,invOffset+5));TRACE(' - morphing one op to `R ^ S`;',domain__debug(getDomain(indexR)),'^',domain__debug(getDomain(indexS)));ml_vvv2c2(ml,offset,ML_XOR,indexR,indexS);return;}TRACE('   - R:',domain__debug(R),', size=',domain_size(R),', has zero:',!domain_hasNoZero(R),'--> is safe?',domain_isBoolyPair(R));if(domain_isBoolyPair(R)){// Okay R has only two values and one of them is zero
// try to match the arg constraints only. if we find a dupe with
// the same R domain then we can alias that R with this one
// otherwise the two R's are pseudo xnor aliases
// we'll encode the domain instead of indexR to prevent
// multiple args on different R's to clash
// while R may not look it, it still represents a unique domain so we can use the
// encoded value as is here. wrap it to prevent clashes with indexes and numdoms
var key2=op+':['+R+']'+'='+indexA+','+indexB;TRACE('   - key2:',key2);var index=constraintHash[key2];if(index!==undefined){index=getAlias(index);TRACE(' - dedupeIsltIslte; Found dupe reifier; eliminating the second one, aliasing',indexR,'to',index);TRACE('    - #1:',debugHash[key2]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,SIZEOF_VVV);if(indexR===index){TRACE(' - same indexes (perhaps aliased) so dont alias them here');}else{addAlias(indexR,index);}return;}constraintHash[key2]=indexR;debugHash[key2]=debugString;}constraintHash[key]=1;debugHash[key]=debugString;var keyr=op+':R='+indexA+','+indexB;constraintHash[keyr]=offset;debugHash[keyr]=debugString;pc+=SIZEOF_VVV;}function checkLtLteFromReifier(op,indexA,indexB,indexR,R,debugString){// Check whether reifiers have matching non-reifiers (valid artifacts), so `R=A<?B` and `A<B` means `R>0`
// R>0 when: '<? <' '<=? <' '<=? <='
// R=? when: '<? <=' (because the A==B case always passes '<=' while '<?' depends on R)
TRACE('   - checking for matching regular inverted constraints');var regop=op.slice(0,-1);ASSERT(regop==='<'||regop==='<=','update this code if this assertion changes');if(domain_isBooly(R)){// Search for
// - R=A<?B A<B
// - R=A<=?B A<B
// - R=A<=?B A<=B
// => R>0
if(op==='<?'&&checkLtLteFromReifierAB('<?','<',indexA,indexB,indexR,R,debugString))return true;if(op==='<=?'&&checkLtLteFromReifierAB('<=?','<',indexA,indexB,indexR,R,debugString))return true;if(op==='<=?'&&checkLtLteFromReifierAB('<=?','<=',indexA,indexB,indexR,R,debugString))return true;// Search for
// - R=A<?B B<A
// - R=A<?B B<=A
// - R=A<=?B B<A
// => R=0
if(op==='<?'&&checkLtLteFromReifierBA('<?','<',indexA,indexB,indexR,R,debugString))return true;if(op==='<?'&&checkLtLteFromReifierBA('<?','<=',indexA,indexB,indexR,R,debugString))return true;if(op==='<=?'&&checkLtLteFromReifierBA('<=?','<',indexA,indexB,indexR,R,debugString))return true;}return false;}function checkLtLteFromReifierAB(rifop,regop,indexA,indexB,indexR,R,debugString){var regkey=regop+':'+indexA+','+indexB;if(constraintHash[regkey]){TRACE(' - checkLtLteFromReifierAB; found `R=A'+rifop+'B` and `A'+regop+'B`, eliminating reifier and booly-solving R, R=',domain__debug(R));TRACE('    - #1:',debugHash[regkey]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,SIZEOF_VVV);TRACE(' - Removing 0 from R');setDomain(indexR,domain_removeValue(R,0));return true;}return false;}function checkLtLteFromReifierBA(rifop,regop,indexA,indexB,indexR,R,debugString){var reginvkey=regop+':'+indexB+','+indexA;if(constraintHash[reginvkey]){TRACE(' - checkLtLteFromReifierBA; found `R=A'+rifop+'B` and `B'+regop+'A`, eliminating reifier and booly-solving R, R=',domain__debug(R));TRACE('    - #1:',debugHash[reginvkey]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,SIZEOF_VVV);TRACE(' - Setting R to 0');setDomain(indexR,domain_removeGtUnsafe(R,0));return true;}return false;}function dedupeBoolyList(op){// Isall, isnall, isnone, issome
// the tricky example:
// ####
// : A, B, C 1
// : R [0 1]
// : S [0 0 2 2]
// R = xxx?(A B C)
// S = xxx?(A B C)
// ####
// in this case R and S are "booly alias" but not actual alias
// basically this translates into a xnor (if R then S, if S then R)
var argCount=ml_dec16(ml,pc+1);var opSize=SIZEOF_C+argCount*2+2;TRACE(' - dedupeBoolyList; args:',argCount,', opsize:',opSize);// First we want to sort the list. we'll do this inline to prevent array creation
ml_heapSort16bitInline(ml,pc+SIZEOF_C,argCount);// Now collect them. the key should end up with an ordered list
var args='';var debugArgs='';for(var i=0;i<argCount;++i){var index=getAlias(ml_dec16(ml,pc+SIZEOF_C+i*2));args+=index+' ';debugArgs+=domain__debug(getDomain(index,true));}var indexR=getAlias(ml_dec16(ml,pc+SIZEOF_C+argCount*2));// We'll add a key with indexR and conditionally one with just the domain of R
var key=op+':'+indexR+'='+args;var debugString=op+':'+domain__debug(getDomain(indexR,true))+'='+debugArgs;TRACE('   - key=',key,';',constraintHash[key]!==undefined);if(constraintHash[key]!==undefined){TRACE(' - dedupeBoolyList; Found dupe constraint; eliminating the second one');TRACE('    - #1:',debugHash[key]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,opSize);return;}constraintHash[key]=1;debugHash[key]=debugString;var R=getDomain(indexR,true);TRACE('   - R:',domain__debug(R),'--> is safe?',domain_isBoolyPair(R));if(domain_isBoolyPair(R)){// Okay R has only two values and one of them is zero
// try to match the arg constraints only. if we find a dupe with
// the same R domain then we can alias that R with this one
// we'll encode the domain instead of indexR to prevent
// multiple args on different R's to clash
// while R may not look it, it still represents a unique domain so we can use the
// encoded value as is here. wrap it to prevent clashes with indexes and numdoms
var key2=op+':['+R+']'+'='+args;TRACE('   - key2:',key2);var _index=constraintHash[key2];if(_index!==undefined){_index=getAlias(_index);TRACE(' - dedupeBoolyList; Found dupe reifier; eliminating the second one, aliasing',indexR,'to',_index);TRACE('    - #1:',debugHash[key2]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,opSize);if(indexR===_index){TRACE(' - same indexes (perhaps aliased) so dont alias them here');}else{ASSERT(getDomain(indexR)===getDomain(_index),'should have already asserted that these two domains have only two values, a zero and a non-zero, and that they are equal');addAlias(indexR,_index);}return;}constraintHash[key2]=indexR;debugHash[key2]=debugString;}TRACE(' - (no action, dedupeBoolyList)');pc+=opSize;}function dedupeNonBoolyList(op){// Sum, product
var argCount=ml_dec16(ml,pc+1);var opSize=SIZEOF_C+argCount*2+2;// First we want to sort the list. we'll do this inline to prevent array creation
ml_heapSort16bitInline(ml,pc+SIZEOF_C,argCount);// Now collect them. the key should end up with an ordered list
var args='';var debugArgs='';for(var i=0;i<argCount;++i){var argIndex=getAlias(ml_dec16(ml,pc+SIZEOF_C+i*2));args+=argIndex+' ';debugArgs+=domain__debug(getDomain(argIndex,true));}var indexR=getAlias(ml_dec16(ml,pc+SIZEOF_C+argCount*2));// We'll add a key without indexR because the results of these ops are fixed (unlike booly ops)
var key=op+':'+'='+args;var debugString=op+':'+debugArgs;var index=constraintHash[key];if(index!==undefined){index=getAlias(index);TRACE(' - dedupeNonBoolyList; Found dupe reifier; eliminating the second one, aliasing',indexR,'to',index);TRACE('    - #1:',debugHash[key]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,opSize);if(indexR!==index){// R = A <=? A (artifact)
var domain=domain_intersection(getDomain(index,true),getDomain(indexR,true));setDomain(index,domain);addAlias(indexR,index);}return;}constraintHash[key]=indexR;debugHash[key]=debugString;pc+=opSize;}function dedupeVoidList(op){// Sum, product
var argCount=ml_dec16(ml,pc+1);var opSize=SIZEOF_C+argCount*2;// First we want to sort the list. we'll do this inline to prevent array creation
ml_heapSort16bitInline(ml,pc+SIZEOF_C,argCount);// Now collect them. the key should end up with an ordered list
var args='';var debugArgs='';for(var i=0;i<argCount;++i){var argIndex=getAlias(ml_dec16(ml,pc+SIZEOF_C+i*2));args+=argIndex+' ';debugArgs+=domain__debug(getDomain(argIndex,true));}var key=op+':'+'='+args;var debugString=op+':'+debugArgs;if(constraintHash[key]!==undefined){TRACE(' - dedupeVoidList; Found dupe constraint; eliminating the second one');TRACE('    - #1:',debugHash[key]);TRACE('    - #2:',debugString);ml_eliminate(ml,pc,opSize);return;}constraintHash[key]=1;debugHash[key]=debugString;pc+=opSize;}function dedupeInvIsSameIsDiff(op){TRACE(' - dedupeInvIsSameIsDiff;',op);// Looking for this pattern:
// : X [2 3]
// R = X ==? 2
// S = X !=? 3
// which means R !^ S, or even == when R and S are size=2,min=0,R==S
var argCount=ml_dec16(ml,pc+1);if(argCount!==2){// TODO: support any number of args here
TRACE('   - arg count != 2 so bailing, for now');return false;}var indexA=getAlias(ml_dec16(ml,pc+OFFSET_C_A));var indexB=getAlias(ml_dec16(ml,pc+OFFSET_C_B));var indexR=getAlias(ml_dec16(ml,pc+OFFSET_C_R));// If A or B is a constant, then B will be a constant afterwards, and A (only) as well if they are both constants
if(indexB<indexA){var t=indexB;indexB=indexA;indexA=t;}var A=getDomain(indexA,true);var B=getDomain(indexB,true);// Verify fingerprint
if(domain_size(A)!==2){TRACE(' - size(A) != 2, bailing');return false;}var vB=domain_getValue(B);if(vB<0||!domain_containsValue(A,vB)){TRACE(' - B wasnt a constant or A didnt contain B, bailing',domain__debug(A),domain__debug(B));return false;}// Fingerprint matches. A contains the solved value B and one other value
// check if opposite op is known
var invA=domain_removeValue(A,vB);ASSERT(domain_isSolved(invA),'if A had two values and one of them vB, then invA should have one value');var otherValue=domain_getValue(invA);var indexInvA=addVar(undefined,otherValue,false,false,true);// Just gets the index for this constant
ASSERT(getDomain(indexInvA)===domain_createValue(otherValue),'should alias to a constant');var invOp=op==='issame'?'isdiff':'issame';var key=invOp+':'+indexA+','+indexInvA;var debugString=op+':'+domain__debug(getDomain(indexR,true))+'='+domain__debug(getDomain(indexA,true))+','+domain__debug(getDomain(indexB,true));var indexS=constraintHash[key];if(indexS===undefined){var thisKey=op+':'+indexA+','+indexB;TRACE(' - opposite for '+op+' ('+invOp+') doesnt exist, adding this key then bailing');TRACE(' - checked for key=',key,', now adding key:',thisKey);constraintHash[thisKey]=indexR;debugHash[thisKey]=debugString;return false;}TRACE(' - found the opposite of this constraint;');TRACE('    - #1:',debugHash[key]);TRACE('    - #2:',debugString);TRACE(' - indexR !^ indexS, and perhaps indexR == indexS, check that case first');ASSERT(argCount===2,'should have two args');var R=getDomain(indexR,true);if(domain_size(R)===2&&!domain_hasNoZero(R)&&R===getDomain(indexS,true)){TRACE(' - indexR == indexS because',domain__debug(R),'has two elements, one of them zero, and R==S');if(indexR===indexS){TRACE(' - var is same so skipping alias');}else{addAlias(indexR,indexS);}ml_eliminate(ml,pc,SIZEOF_CR_2);}else{TRACE(' - indexR !^ indexS because R=',domain__debug(R),', S=',domain__debug(getDomain(indexS,true)),'; R may still end up with a different value from S');TRACE(' - morphing to an xnor(R S);',ml_getOpSizeSlow(ml,pc),SIZEOF_C+2*2+2);ASSERT(ml_getOpSizeSlow(ml,pc)>=SIZEOF_C+2*2+2,'the current op should have at least the required space for a 2 arg xnor',ml_getOpSizeSlow(ml,pc));ml_cr2c2(ml,pc,argCount,ML_XNOR,indexR,indexS);}// Dont update pc
return true;}function innerLoop(){while(pc<ml.length&&!emptyDomain){++__opCounter;var op=ml[pc];TRACE(' -- DD pc='+pc+', op: '+ml__debug(ml,pc,1,problem,true));switch(op){case ML_IMP:dedupePairOc2('->');break;case ML_NIMP:dedupePairOc2('!->');break;case ML_ISLT:dedupeIsltIslte('<?');break;case ML_ISLTE:dedupeIsltIslte('<=?');break;case ML_ISALL:dedupeBoolyList('isall');break;case ML_ISDIFF:if(!dedupeInvIsSameIsDiff('isdiff'))dedupeBoolyList('isdiff');break;case ML_ISNALL:dedupeBoolyList('isnall');break;case ML_ISNONE:dedupeBoolyList('isnone');break;case ML_ISSAME:if(!dedupeInvIsSameIsDiff('issame'))dedupeBoolyList('issame');break;case ML_ISSOME:dedupeBoolyList('issome');break;case ML_ALL:dedupeVoidList('all');break;case ML_DIFF:dedupeVoidList('diff');break;case ML_LT:dedupePairOc2('<');break;case ML_LTE:dedupePairOc2('<=');break;case ML_NALL:dedupeVoidList('nall');break;case ML_NONE:dedupeVoidList('none');break;case ML_SAME:dedupeVoidList('same');break;case ML_SOME:dedupeVoidList('some');break;case ML_XNOR:dedupeVoidList('xnor');break;case ML_XOR:dedupeVoidList('^');break;case ML_MINUS:dedupeTripO('-');break;case ML_DIV:dedupeTripO('/');break;case ML_SUM:dedupeNonBoolyList('sum');break;case ML_PRODUCT:dedupeNonBoolyList('product');break;case ML_START:if(pc!==0){return ml_throw(ml,pc,'deduper problem found START');}++pc;break;case ML_STOP:return constraintHash;case ML_NOBOOL:// No deduping this!
case ML_NOLEAF:// No deduping this!
pc+=SIZEOF_V;break;case ML_JMP:pc+=SIZEOF_V+ml_dec16(ml,pc+1);break;case ML_JMP32:pc+=SIZEOF_W+ml_dec32(ml,pc+1);break;case ML_NOOP:++pc;break;case ML_NOOP2:pc+=2;break;case ML_NOOP3:pc+=3;break;case ML_NOOP4:pc+=4;break;default:ml_throw(ml,pc,'(dd) unknown op');}}if(!emptyDomain)ml_throw(ml,pc,'(dd) ML OOB');}}// This is an import function for config
var $$AND=38;var $$AT=64;var $$BANG=33;var $$COLON=58;var $$COMMA=44;var $$CR=10;var $$LF=13;var $$DASH=45;var $$DIV=47;var $$EQ=61;var $$GT=62;var $$HASH=35;var $$LEFTBRACK=91;var $$LEFTPAREN=40;var $$LT=60;var $$OR=124;var $$PLUS=43;var $$QM=63;var $$SPACE=32;var $$RIGHTBRACK=93;var $$RIGHTPAREN=41;var $$SQUOTE=39;var $$STAR=42;var $$TAB=9;var $$XOR=94;var $$0=48;var $$1=49;var $$2=50;var $$3=51;var $$4=52;var $$5=53;var $$6=54;var $$7=55;var $$8=56;var $$9=57;var $$a=97;var $$c=99;var $$d=100;var $$e=101;var $$f=102;var $$g=103;var $$i=105;var $$l=108;var $$m=109;var $$n=110;var $$o=111;var $$p=112;var $$r=114;var $$s=115;var $$t=116;var $$x=120;var $$z=122;var $$A=65;var $$Z=98;/**
 * Compile the constraint dsl to a bytecode
 *
 * @param {string} dslStr
 * @param {Object} problem
 * @param {boolean} [_debug] Improved error reporting when true
 * @returns {string}
 */function dsl2ml(dslStr,problem,_debug){TRACE('# dsl2ml:',[dslStr.slice(0,100).replace(/ +/g,' ')+(dslStr.replace(/ +/g,' ').length>100?'...':'')]);problem.input.varstrat='default';problem.input.valstrat='default';problem.input.dsl=dslStr;var addVar=problem.addVar,setDomain=problem.setDomain,name2index=problem.name2index;var constraints=0;var freeDirective=-1;// For `@custom free x`. this var tries to ensure exactly x bytes are "free"
var dslPointer=0;var dslBuf;if(typeof Buffer==='undefined'){dslBuf=new window.TextEncoder('utf-8').encode(dslStr);}else{dslBuf=new Uint8Array(Buffer.from(dslStr,'binary'));}ASSERT(dslBuf instanceof Uint8Array);var len=dslBuf.length;var mlBufSize=Math.ceil(dslBuf.length/5);// 20% is arbitrary choice. grown dynamically when needed
var mlBuffer=new Uint8Array(mlBufSize).fill(0);var mlPointer=0;// This is for a hack
var lastAssignmentIndex=-1;var lastUnknownIndex=-1;encode8bit(ML_START);while(!isEof()){parseStatement();}if(freeDirective>0){// Compile a jump of given size. this will be considered available space
TRACE('forcing',freeDirective,'bytes of available space');compileJump(freeDirective);}encode8bit(ML_STOP);// This step will be undone but serves to ensure the buffer isnt grown in the actual compilation step (which happens after the available-space-checks)
--mlPointer;if(freeDirective<0){// Compile a jump for the remainder of the space, if any, which could be used by the recycle mechanisms
// only do this here when the free directive is absent
var leftFree=mlBufSize-mlPointer-1;// STOP will occupy 1 byte
TRACE('space available',leftFree,'bytes');if(leftFree>0)compileJump(leftFree);}encode8bit(ML_STOP);// Put the STOP at the end
// if there is now still space left, we need to crop it because freeDirective was set and didnt consume it all
if(mlBufSize-mlPointer){TRACE('cropping excess available space',mlBufSize,mlPointer,mlBufSize-mlPointer);// If the free directive was given, remove any excess free space
// note that one more byte needs to be compiled after this (ML_STOP)
mlBuffer.splice(mlPointer);}ASSERT(mlPointer===mlBuffer.length,'mlPointer should now be at the first unavailable cell of the buffer',mlPointer,mlBuffer.length,mlBuffer);problem.ml=mlBuffer;if(!problem.input.targets)problem.input.targets='all';getTerm().log('# dsl2ml: parsed',constraints,'constraints and',problem.domains.length,'vars');// ########################################################################
function startConstraint(op){++constraints;encode8bit(op);}function encode8bit(num){ASSERT(typeof num==='number'&&num>=0&&num<=0xff,'OOB number');TRACE('encode8bit:',num,'dsl pointer:',dslPointer,', ml pointer:',mlPointer);if(mlPointer>=mlBufSize)grow();mlBuffer[mlPointer++]=num;}function encode16bit(num){TRACE('encode16bit:',num,'->',num>>8,num&0xff,'dsl pointer:',dslPointer,', ml pointer:',mlPointer,'/',mlBufSize);ASSERT(typeof num==='number','Encoding 16bit must be num',typeof num,num);ASSERT(num>=0,'OOB num',num);if(num>0xffff)THROW('Need 32bit num support but missing it');if(mlPointer>=mlBufSize-1)grow();mlBuffer[mlPointer++]=num>>8&0xff;mlBuffer[mlPointer++]=num&0xff;}function encode32bit(num){TRACE('encode32bit:',num,'->',num>>24&0xff,num>>16&0xff,num>>8&0xff,num&0xff,'dsl pointer:',dslPointer,', ml pointer:',mlPointer);ASSERT(typeof num==='number','Encoding 32bit must be num',typeof num,num);ASSERT(num>=0,'OOB num',num);if(num>0xffffffff)THROW('This requires 64bit support');if(mlPointer>=mlBufSize-3)grow();mlBuffer[mlPointer++]=num>>24&0xff;mlBuffer[mlPointer++]=num>>16&0xff;mlBuffer[mlPointer++]=num>>8&0xff;mlBuffer[mlPointer++]=num&0xff;}function grow(forcedExtraSpace){TRACE(' - grow('+(forcedExtraSpace||'')+') from',mlBufSize);// grow the buffer by 10% or `forcedExtraSpace`
// you can't really grow existing buffers, instead you create a bigger buffer and copy the old one into it...
var oldSize=mlBufSize;if(forcedExtraSpace)mlBufSize+=forcedExtraSpace;else mlBufSize+=Math.max(Math.ceil(mlBufSize*0.1),10);ASSERT(mlBufSize>mlBuffer.length,'grow() should grow() at least a bit...',mlBuffer.length,'->',mlBufSize);if(typeof Buffer==='undefined'){if(ArrayBuffer.transfer)mlBuffer=new Uint8Array(ArrayBuffer.transfer(mlBuffer.buffer,mlBufSize));else mlBuffer=new Uint8Array(ArrayBufferTransferPoly(mlBuffer.buffer,mlBufSize));}else{mlBuffer=new Uint8Array(Buffer.concat([mlBuffer],mlBufSize));// Wont actually concat, but will copy the existing buffer into a buffer of given size
mlBuffer.fill(0,oldSize);}ASSERT(mlBuffer instanceof Uint8Array);}function read(){return dslBuf[dslPointer];}function readD(delta){return dslBuf[dslPointer+delta];}function substr_expensive(start,stop){// Use sparingly!
return String.fromCharCode.apply(String,dslBuf.slice(start,stop));}function skip(){++dslPointer;}function is(c,desc){if(!desc)desc='';if(read()!==c)THROW('Expected '+desc+' `'+c+'`, found `'+read()+'`');skip();}function skipWhitespaces(){while(dslPointer<len&&isWhitespace(read())){skip();}}function skipWhites(){while(!isEof()){var c=read();if(isWhite(c)){skip();}else if(isComment(c)){skipComment();}else{break;}}}function isWhitespace(s){// Make sure you dont actually want isNewlineChar()
return s===$$SPACE||s===$$TAB;}function isNewlineChar(s){return s===$$CR||s===$$LF;}function atEol(c){return isNewlineChar(c)||isComment(c)||isEof();}function isLineEnd(s){// The line ends at a newline or a comment
return s===$$CR||s===$$LF||s===$$HASH;}function isComment(s){return s===$$HASH;}function isWhite(s){return isWhitespace(s)||isNewlineChar(s);}function expectEol(){skipWhitespaces();if(dslPointer<len){var c=read();if(c===$$HASH){skipComment();}else if(isNewlineChar(c)){skip();}else{THROW('Expected EOL but got `'+read()+'`');}}}function isEof(){return dslPointer>=len;}function parseStatement(){// Either:
// - start with colon: var decl
// - start with hash: line comment
// - empty: empty
// - otherwise: constraint
skipWhites();ASSERT(read()!==$$HASH,'comments should be parsed by skipWhites');switch(read()){case $$COLON:parseVar();return;case $$AT:parseAtRule();return;default:if(!isEof()){parseVoidConstraint();}}}function parseVar(){skip();// Already is($$COLON)
skipWhitespaces();var nameNames=parseIdentifier();skipWhitespaces();if(read()===$$COMMA){nameNames=[nameNames];do{skip();skipWhitespaces();nameNames.push(parseIdentifier());skipWhitespaces();}while(!isEof()&&read()===$$COMMA);}if(read()===$$EQ){skip();skipWhitespaces();}var domain=parseDomain();skipWhitespaces();var mod=parseModifier();expectEol();if(typeof nameNames==='string'){addParsedVar(nameNames,domain,mod);}else{nameNames.forEach(function(name){return addParsedVar(name,domain,mod);});}}function addParsedVar(name,domain,mod){return addVar(name,domain,mod,false,true,THROW);}function parseIdentifier(){if(read()===$$SQUOTE)return parseQuotedIdentifier();return parseUnquotedIdentifier();}function parseQuotedIdentifier(){is($$SQUOTE);var ident='';while(!isEof()){var c=read();if(c===$$SQUOTE)break;if(c!==$$HASH&&isLineEnd(c))THROW('Quoted identifier wasnt closed at eol');ident+=String.fromCharCode(c);skip();}if(isEof())THROW('Quoted identifier wasnt closed at eof');if(!ident)THROW('Expected to parse identifier, found none');skip();// Quote
return ident;// Return unquoted ident
}function parseUnquotedIdentifier(){// Anything terminated by whitespace
var c=read();var ident='';if(c>=$$0&&c<=$$9)THROW('Unquoted ident cant start with number');while(!isEof()){c=read();if(!isValidUnquotedIdentChar(c))break;ident+=String.fromCharCode(c);skip();}if(!ident)THROW('Expected to parse identifier, found none');return ident;}function isValidUnquotedIdentChar(c){switch(c){case $$LEFTPAREN:case $$RIGHTPAREN:case $$COMMA:case $$LEFTBRACK:case $$RIGHTBRACK:case $$SQUOTE:case $$HASH:return false;}if(isWhite(c))return false;return true;}function parseDomain(){// []
// [lo hi]
// [[lo hi] [lo hi] ..]
// *
// 25
// (comma's optional and ignored)
var domain;var c=read();switch(c){case $$LEFTBRACK:is($$LEFTBRACK,'domain start');skipWhitespaces();domain=[];if(read()===$$LEFTBRACK){// Range inside the domain that is wrapped in brakcets
do{skip();skipWhitespaces();var lo=parseNumber();skipWhitespaces();if(read()===$$COMMA){skip();skipWhitespaces();}var hi=parseNumber();skipWhitespaces();is($$RIGHTBRACK,'range-end');skipWhitespaces();domain.push(lo,hi);if(read()===$$COMMA){skip();skipWhitespaces();}}while(read()===$$LEFTBRACK);}else{// Individual ranges not wrapped
while(read()!==$$RIGHTBRACK){skipWhitespaces();var _lo=parseNumber();skipWhitespaces();if(read()===$$COMMA){skip();skipWhitespaces();}var _hi=parseNumber();skipWhitespaces();domain.push(_lo,_hi);if(read()===$$COMMA){skip();skipWhitespaces();}}}is($$RIGHTBRACK,'domain-end');if(domain.length===0)THROW('Empty domain [] in dsl, this problem will always reject');return domain;case $$STAR:skip();return [SUB,SUP];case $$0:case $$1:case $$2:case $$3:case $$4:case $$5:case $$6:case $$7:case $$8:case $$9:var v=parseNumber();skipWhitespaces();return [v,v];}THROW('Expecting valid domain start, found `'+c+'`');}function parseModifier(){if(read()!==$$AT)return;skip();var mod={};var stratName='';while(true){var c=read();if(!(c>=$$a&&c<=$$z||c>=$$A&&c<=$$Z))break;stratName+=String.fromCharCode(c);skip();}switch(stratName){case'list':parseList(mod);break;case'markov':parseMarkov(mod);break;case'max':case'mid':case'min':case'naive':mod.valtype=stratName;break;case'minMaxCycle':case'splitMax':case'splitMin':THROW('TODO: implement this modifier ['+stratName+']');break;default:THROW('implement me (var mod) [`'+stratName+'`]');}mod.valtype=stratName;return mod;}function parseList(mod){skipWhitespaces();if(!(readD(0)===$$p&&readD(1)===$$r&&readD(2)===$$i&&readD(3)===$$o&&readD(4)===$$LEFTPAREN)){THROW('Expecting the priorities to follow the `@list`');}dslPointer+=5;mod.valtype='list';mod.list=parseNumList();is($$RIGHTPAREN,'list end');}function parseMarkov(mod){mod.valtype='markov';var repeat=true;while(repeat){repeat=false;skipWhitespaces();switch(read()){case $$m:// Matrix
if(readD(1)===$$a&&readD(2)===$$t&&readD(3)===$$r&&readD(4)===$$i&&readD(5)===$$x&&readD(6)===$$LEFTPAREN){// TOFIX: there is no validation here. apply stricter and safe matrix parsing
dslPointer+=7;var start=dslPointer;while(read()!==$$RIGHTPAREN&&!isEof()){skip();}if(isEof())THROW('The matrix must be closed by a `)` but did not find any');ASSERT(read()===$$RIGHTPAREN,'code should only stop at eof or )');var matrix=substr_expensive(start,dslPointer);var code='return '+matrix;var func=new Function(code);/* eslint no-new-func: "off" */mod.matrix=func();is($$RIGHTPAREN,'end of matrix');// Kind of a redundant double check. could also just skip() here.
repeat=true;}break;case $$l:// Legend
if(readD(1)===$$e&&readD(2)===$$g&&readD(3)===$$e&&readD(4)===$$n&&readD(5)===$$d&&readD(6)===$$LEFTPAREN){dslPointer+=7;skipWhitespaces();mod.legend=parseNumList();skipWhitespaces();is($$RIGHTPAREN,'legend closer');repeat=true;}break;case $$e:// Expand
if(readD(1)===$$x&&readD(2)===$$p&&readD(3)===$$a&&readD(4)===$$n&&readD(5)===$$d&&readD(6)===$$LEFTPAREN){dslPointer+=7;skipWhitespaces();mod.expandVectorsWith=parseNumber();skipWhitespaces();is($$RIGHTPAREN,'expand closer');repeat=true;}break;}}}function skipComment(){is($$HASH,'comment start');// is('#', 'comment hash');
while(!isEof()&&!isNewlineChar(read())){skip();}if(!isEof())skip();}function parseVoidConstraint(){// Parse a constraint that does not return a value itself
// first try to parse single value constraints without value like markov() and diff()
if(parseUexpr())return;// So the first value must be a value returning expr
parseComplexVoidConstraint();expectEol();}function parseComplexVoidConstraint(){// Parse a constraint that at least starts with a Vexpr but ultimately doesnt return anything
var indexA=parseVexpr(undefined,true);skipWhitespaces();// `A==B<eof>` then A==B would be part of A and the parser would want to parse a cop here. there's a test case.
if(isEof())THROW('Expected to parse a cop but reached eof instead');var cop=parseCop();skipWhitespaces();if(cop==='='){lastAssignmentIndex=indexA;parseAssignment(indexA);}else{ASSERT(cop,'the cop parser should require to parse a valid cop');var indexB=parseVexpr();compileVoidConstraint(indexA,cop,indexB);}}function compileVoidConstraint(indexA,cop,indexB){switch(cop){case'==':startConstraint(ML_SAME);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);break;case'!=':startConstraint(ML_DIFF);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);break;case'<':startConstraint(ML_LT);encode16bit(2);encode16bit(indexA);encode16bit(indexB);break;case'<=':startConstraint(ML_LTE);encode16bit(2);encode16bit(indexA);encode16bit(indexB);break;case'>':startConstraint(ML_LT);encode16bit(2);encode16bit(indexB);encode16bit(indexA);break;case'>=':startConstraint(ML_LTE);encode16bit(2);encode16bit(indexB);encode16bit(indexA);break;case'&':startConstraint(ML_ALL);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);break;case'!&':startConstraint(ML_NALL);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);break;case'|':startConstraint(ML_SOME);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);break;case'!|':startConstraint(ML_NONE);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);break;case'^':startConstraint(ML_XOR);encode16bit(2);// This brings the op size in line with all other ops. kind of a waste but so be it.
encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);break;case'!^':startConstraint(ML_XNOR);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);break;case'->':startConstraint(ML_IMP);encode16bit(2);encode16bit(indexA);encode16bit(indexB);break;case'!->':startConstraint(ML_NIMP);encode16bit(2);encode16bit(indexA);encode16bit(indexB);break;default:THROW('Unknown constraint op: ['+cop+']');}}function parseAssignment(indexC){var indexA=parseVexpr(indexC);skipWhitespaces();var c=read();if(isEof()||isLineEnd(c)){// Any var, literal, or group without "top-level" op (`A=5`, `A=X`, `A=(B+C)`, `A=sum(...)`, etc)
if(indexA!==indexC){compileVoidConstraint(indexA,'==',indexC);}}else{var rop=parseRop();if(!rop)THROW('Expecting right paren or rop, got ['+rop+']');skipWhitespaces();var indexB=parseVexpr();return compileValueConstraint(indexA,rop,indexB,indexC);}}function compileValueConstraint(indexA,rop,indexB,indexC){var wasReifier=false;switch(rop){case'==?':startConstraint(ML_ISSAME);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);encode16bit(indexC);wasReifier=true;break;case'!=?':startConstraint(ML_ISDIFF);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);encode16bit(indexC);wasReifier=true;break;case'<?':startConstraint(ML_ISLT);encode16bit(indexA);encode16bit(indexB);encode16bit(indexC);wasReifier=true;break;case'<=?':startConstraint(ML_ISLTE);encode16bit(indexA);encode16bit(indexB);encode16bit(indexC);wasReifier=true;break;case'&?':startConstraint(ML_ISALL);encode16bit(2);encode16bit(indexA);encode16bit(indexB);encode16bit(indexC);break;case'!&?':startConstraint(ML_ISNALL);encode16bit(2);encode16bit(indexA);encode16bit(indexB);encode16bit(indexC);break;case'|?':startConstraint(ML_ISSOME);encode16bit(2);encode16bit(indexA);encode16bit(indexB);encode16bit(indexC);break;case'!|?':startConstraint(ML_ISNONE);encode16bit(2);encode16bit(indexA);encode16bit(indexB);encode16bit(indexC);break;case'+':startConstraint(ML_SUM);encode16bit(2);// Count
encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);encode16bit(indexC);break;case'-':startConstraint(ML_MINUS);encode16bit(indexA);encode16bit(indexB);encode16bit(indexC);break;case'*':startConstraint(ML_PRODUCT);encode16bit(2);encode16bit(indexA<indexB?indexA:indexB);encode16bit(indexA<indexB?indexB:indexA);encode16bit(indexC);break;case'/':startConstraint(ML_DIV);encode16bit(indexA);encode16bit(indexB);encode16bit(indexC);break;case'>?':return compileValueConstraint(indexB,'<?',indexA,indexC);case'>=?':return compileValueConstraint(indexB,'<=?',indexA,indexC);default:THROW('Expecting right paren or rop, got ['+rop+']');}if(wasReifier&&indexC===lastAssignmentIndex&&indexC===lastUnknownIndex)setDomain(indexC,domain_createRange(0,1));return indexC;}function parseCop(){var c=read();switch(c){case $$EQ:skip();if(read()===$$EQ){skip();return '==';}return '=';case $$BANG:skip();var r=read();if(r===$$EQ){skip();return '!=';}if(r===$$AND){skip();return '!&';}if(r===$$XOR){skip();return '!^';}if(r===$$OR){skip();return '!|';}if(r===$$DASH&&readD(1)===$$GT){skip();skip();return '!->';}return THROW('Unknown cop that starts with [!]');case $$LT:skip();if(read()===$$EQ){skip();return '<=';}return '<';case $$GT:skip();if(read()===$$EQ){skip();return '>=';}return '>';case $$DASH:if(readD(1)===$$GT){skip();skip();return '->';}break;// Error
case $$AND:skip();return '&';case $$OR:skip();return '|';case $$XOR:skip();return '^';case $$HASH:return THROW('Expected to parse a cop but found a comment instead');}if(isEof())THROW('Expected to parse a cop but reached eof instead');THROW('Unknown cop char: `'+c+'`');}function parseRop(){switch(read()){case $$EQ:skip();if(read()===$$EQ){skip();is($$QM,'reifier suffix');return '==?';}return '=';case $$BANG:skip();var r='';if(read()===$$EQ){is($$EQ,'middle part of !=? op');r='!=?';}else if(read()===$$AND){is($$AND,'middle part of !&? op');r='!&?';}else if(read()===$$OR){is($$OR,'middle part of !|? op');r='!|?';}else{THROW('invalid rop that starts with a bang');}is($$QM,'reifier suffix');return r;case $$LT:skip();if(read()===$$EQ){skip();is($$QM,'reifier suffix');return '<=?';}is($$QM,'reifier suffix');return '<?';case $$GT:skip();if(read()===$$EQ){skip();is($$QM,'reifier suffix');return '>=?';}is($$QM,'reifier suffix');return '>?';case $$OR:skip();is($$QM,'issome suffix');return '|?';case $$AND:skip();is($$QM,'isall suffix');return '&?';case $$PLUS:skip();return '+';case $$DASH:skip();return '-';case $$STAR:skip();return '*';case $$DIV:skip();return '/';default:return '';}}function parseUexpr(){// It's not very efficient (we could parse an ident before and check that result here) but it'll work for now
var c=read();// Distinct is legacy support, same as diff()
if(c===$$d&&readD(1)===$$i&&readD(2)===$$s&&readD(3)===$$t&&readD(4)===$$i&&readD(5)===$$n&&readD(6)===$$c&&readD(7)===$$t&&readD(8)===$$LEFTPAREN){parseCalledListConstraint(ML_DIFF,9);return true;}if(c===$$d&&readD(1)===$$i&&readD(2)===$$f&&readD(3)===$$f&&readD(4)===$$LEFTPAREN){parseCalledListConstraint(ML_DIFF,5);return true;}if(c===$$a&&readD(1)===$$l&&readD(2)===$$l&&readD(3)===$$LEFTPAREN){parseCalledListConstraint(ML_ALL,4);return true;}if(c===$$n&&readD(1)===$$a&&readD(2)===$$l&&readD(3)===$$l&&readD(4)===$$LEFTPAREN){parseCalledListConstraint(ML_NALL,5);return true;}if(c===$$s&&readD(1)===$$a&&readD(2)===$$m&&readD(3)===$$e&&readD(4)===$$LEFTPAREN){parseCalledListConstraint(ML_SAME,5);return true;}if(c===$$s&&readD(1)===$$o&&readD(2)===$$m&&readD(3)===$$e&&readD(4)===$$LEFTPAREN){parseCalledListConstraint(ML_SOME,5);return true;}if(c===$$n&&readD(1)===$$o&&readD(2)===$$n&&readD(3)===$$e&&readD(4)===$$LEFTPAREN){parseCalledListConstraint(ML_NONE,5);return true;}if(c===$$x&&readD(1)===$$n&&readD(2)===$$o&&readD(3)===$$r&&readD(4)===$$LEFTPAREN){parseCalledListConstraint(ML_XNOR,5);return true;}return false;}function parseCalledListConstraint(opcode,delta){dslPointer+=delta;skipWhitespaces();var vals=parseVexpList();ASSERT(vals.length<=255,'dont do lists with more than 255 vars :(');startConstraint(opcode);encode16bit(vals.length);vals.forEach(encode16bit);skipWhitespaces();is($$RIGHTPAREN,'parseCalledListConstraint call closer');expectEol();}function parseVexpList(){var list=[];skipWhitespaces();while(!isEof()&&read()!==$$RIGHTPAREN){var index=parseVexpr();list.push(index);skipWhitespaces();if(read()===$$COMMA){skip();skipWhitespaces();}}if(!list.length)THROW('Expecting at least one expression in the list');return list;}function parseVexpr(resultIndex,canBeUnknown){// Types: valcall, ident, number, group
// ALWAYS return a var or constant INDEX!
// resultIndex is only passed on if this was an explicit
// assignment (like the index of `X` in `X = sum(A B C)`)
var c=read();var index;if(c>=$$0&&c<=$$9){var num=parseNumber();index=addVar(undefined,num,false,false,true);}else if(c===$$LEFTPAREN){index=parseGrouping();}else if(c===$$LEFTBRACK){var domain=parseDomain();index=addVar(undefined,domain,false,false,true);}else{var ident=parseIdentifier();if(read()===$$LEFTPAREN){if(ident==='sum')index=parseArgs(ML_SUM,resultIndex,false);else if(ident==='product')index=parseArgs(ML_PRODUCT,resultIndex,false);else if(ident==='all?')index=parseArgs(ML_ISALL,resultIndex,true);else if(ident==='diff?')index=parseArgs(ML_ISDIFF,resultIndex,true);else if(ident==='nall?')index=parseArgs(ML_ISNALL,resultIndex,true);else if(ident==='none?')index=parseArgs(ML_ISNONE,resultIndex,true);else if(ident==='same?')index=parseArgs(ML_ISSAME,resultIndex,true);else if(ident==='some?')index=parseArgs(ML_ISSOME,resultIndex,true);else THROW('Unknown reifier constraint func: '+ident);}else{// Implicitly declare unknown vars as [SUB,SUP]
index=name2index(ident,false,true);if(index<0){if(canBeUnknown)lastUnknownIndex=index=addVar(ident,undefined,false,false,true);else THROW('CONSTRAINT_VARS_SHOULD_BE_DECLARED; Unknown var ['+ident+']');}}}TRACE('parseVexpr resulted in index:',index);return index;}function parseGrouping(){is($$LEFTPAREN,'group open');skipWhitespaces();var indexA=parseVexpr();skipWhitespaces();// Just wrapping a vexpr is okay, otherwise it needs a rop
if(read()!==$$RIGHTPAREN){var rop=parseRop();if(!rop)THROW('Expecting right paren or rop');skipWhitespaces();var indexB=parseVexpr();var indexC=addVar(undefined,rop[rop.length-1]==='?'?[0,1]:undefined,false,false,true);indexA=compileValueConstraint(indexA,rop,indexB,indexC);skipWhitespaces();}is($$RIGHTPAREN,'group closer');return indexA;}function parseNumber(){var numstr=parseNumstr();if(!numstr){THROW('Expecting to parse a number but did not find any digits c=[ord('+read()+')='+String.fromCharCode(read())+']');}return parseInt(numstr,10);}function parseArgs(op,resultIndex,defaultBoolResult){is($$LEFTPAREN,'args call opener');skipWhitespaces();var refs=parseVexpList();// Note: the var may not declared if the constraint was anonymously grouped (ie `(sum(A B)>10)`)
if(resultIndex===undefined)resultIndex=addVar(undefined,defaultBoolResult?[0,1]:undefined,false,false,true);else if(resultIndex===lastAssignmentIndex&&resultIndex===lastUnknownIndex&&defaultBoolResult)setDomain(resultIndex,domain_createRange(0,1));TRACE('parseArgs refs:',resultIndex,' = all(',refs,'), defaultBoolResult:',defaultBoolResult);startConstraint(op);encode16bit(refs.length);// Count
refs.sort(function(a,b){return a-b;});refs.forEach(encode16bit);encode16bit(resultIndex);skipWhitespaces();is($$RIGHTPAREN,'args closer');return resultIndex;}function parseNumstr(){var numstr='';while(!isEof()){var c=read();if(c<$$0||c>$$9)break;numstr+=String.fromCharCode(c);skip();}return numstr;}function parseNumList(){var nums=[];skipWhitespaces();var numstr=parseNumstr();while(numstr){nums.push(parseInt(numstr,10));skipWhitespaces();if(read()===$$COMMA){++dslPointer;skipWhitespaces();}numstr=parseNumstr();}if(!nums.length)THROW('Expected to parse a list of at least some numbers but found none');return nums;}function parseIdentsTo(target){var idents=parseIdents(target);if(!idents.length)THROW('Expected to parse a list of at least some identifiers but found none');return idents;}function parseIdents(target){var idents=[];skipWhitespaces();while(!isEof()){var c=read();if(c===target)return idents;if(isLineEnd(c))break;if(c===$$COMMA){if(!idents.length)THROW('Leading comma not supported');skip();skipWhitespaces();if(atEol(read()))THROW('Trailing comma not supported');// Mmmm or should we? dont believe it to be relevant for this language
c=read();if(c===$$COMMA)THROW('Double comma not supported');}var ident=parseIdentifier();idents.push(ident);skipWhitespaces();}if(target===undefined)return idents;THROW('Missing target char at eol/eof');}function readLineRest(){var str='';while(!isEof()){var c=read();if(isNewlineChar(c))break;str+=String.fromCharCode(c);skip();}return str;}function parseAtRule(){is($$AT);// Mostly temporary hacks while the dsl stabilizes...
var ruleName=parseIdentifier();if(ruleName==='custom'){skipWhitespaces();var ident=parseIdentifier();skipWhitespaces();if(read()===$$EQ){skip();skipWhitespaces();}switch(ident){case'var-strat':parseVarStrat();break;case'val-strat':parseValStrat();break;case'set-valdist':skipWhitespaces();var target=parseIdentifier();var config=parseRestCustom();setValDist(name2index(target,true),JSON.parse(config));break;case'noleaf':{skipWhitespaces();var idents=parseIdentsTo(undefined);for(var i=0,_len=idents.length;i<_len;++i){// Debug vars are never considered leaf vars until we change that (to something else and update this to something that still does the same thing)
// this is for testing as a simple tool to prevent many trivial optimizations to kick in. it's not flawless.
// encode 3x to artificially inflate the count beyond most tricks
// these should not be deduped... but keep in mind that a noleafed alias gets double the counts
var index=name2index(idents[i]);for(var j=0;j<3;++j){encode8bit(ML_NOLEAF);encode16bit(index);}}break;}case'nobool':{// Debugging tool; bounty should consider this var a non-booly regardless of whether it actually is
skipWhitespaces();var _idents=parseIdentsTo(undefined);for(var _i=0,_len2=_idents.length;_i<_len2;++_i){var _index=name2index(_idents[_i]);encode8bit(ML_NOBOOL);encode16bit(_index);}break;}case'free':skipWhitespaces();var size=parseNumber();TRACE('Found a jump of',size);freeDirective=size;break;case'targets':parseTargets();break;default:THROW('Unsupported custom rule: '+ident);}}else{THROW('Unknown atrule ['+ruleName+']');}expectEol();}function setValDist(varIndex,dist){ASSERT(typeof varIndex==='number','expecting var indexes');ASSERT(problem.valdist[varIndex]===undefined,'not expecting valdists to be set twice for the same var');problem.valdist[varIndex]=dist;}function compileJump(size){TRACE('compileJump('+size+'), mlPointer=',mlPointer);ASSERT(size>0,'dont call this function on size=0');switch(size){case 0:// Dead code. test code should catch these cases at call site. runtime can still just ignore it.
break;// ignore. only expliclty illustrates no free space
case 1:encode8bit(ML_NOOP);break;case 2:encode8bit(ML_NOOP2);encode8bit(0);break;case 3:encode8bit(ML_NOOP3);encode8bit(0);encode8bit(0);break;case 4:encode8bit(ML_NOOP4);encode8bit(0);encode8bit(0);encode8bit(0);break;default:// because we manually update mlPointer the buffer may not grow accordingly. so do that immediately
// but only if necessary
var jumpDestination=mlPointer+size;if(mlBufSize<=jumpDestination){var sizeDifference=jumpDestination-mlBufSize;var growAmount=jumpDestination/10|0+sizeDifference;grow(growAmount);}if(size<0xffff){encode8bit(ML_JMP);encode16bit(size-SIZEOF_V);mlPointer+=size-SIZEOF_V;}else{encode8bit(ML_JMP32);encode32bit(size-SIZEOF_W);mlPointer+=size-SIZEOF_W;}// Buffer is explicitly fill(0)'d so no need to clear it out here (otherwise we probably should)
}}function parseVarStrat(){// @custom var-strat [fallback] [=] naive
// @custom var-strat [fallback] [=] size
// @custom var-strat [fallback] [=] min
// @custom var-strat [fallback] [=] max
// @custom var-strat [fallback] [=] throw
// @custom var-strat [fallback] [inverted] [list] (a b c)
var fallback=false;// List only
var inverted=false;// List only
var issed=false;// Had equal sign (illegal for list)
if(read()===$$f){var ident=parseIdentifier();if(ident!=='fallback')THROW('Expecting var strat name, found ['+ident+']');fallback=true;skipWhitespaces();}if(read()===$$i){var _ident=parseIdentifier();if(_ident!=='inverted')THROW('Expecting var strat name, found ['+_ident+']');inverted=true;skipWhitespaces();}if(read()===$$EQ){skip();issed=true;skipWhitespaces();}if(read()===$$LEFTPAREN){parseVarStratList(fallback,inverted);}else{var _ident2=parseIdentifier();if(_ident2==='naive'||_ident2==='size'||_ident2==='min'||_ident2==='max'||_ident2==='throw'){if(inverted)THROW('The `inverted` keyword is only used with a list');if(fallback){addFallbackToVarStrat(_ident2);}else{problem.input.varstrat=_ident2;}}else if(_ident2==='list'){skipWhitespaces();if(issed)THROW('The `=` should not be used for a list');if(read()!==$$LEFTPAREN)THROW('Expecting list of idents now');parseVarStratList(fallback,inverted);}else{THROW('Unknown var strat ['+_ident2+']');}}skipWhitespaces();}function parseVarStratList(fallback,inverted){is($$LEFTPAREN,'List open');skipWhitespaces();var idents=parseIdents($$RIGHTPAREN);skipWhitespaces();is($$RIGHTPAREN,'List must be closed');var strat={type:'list',inverted:inverted,priorityByName:idents};if(fallback){addFallbackToVarStrat(strat);}else{problem.input.varstrat=strat;}}function addFallbackToVarStrat(strat){var vs=problem.input.varstrat;ASSERT(vs,'should set the var strat before declaring its backup');// Should we just throw for this?
if(typeof vs==='string')vs=problem.input.varstrat={type:vs};while(vs.fallback){if(typeof vs.fallback==='string'){vs=vs.fallback={type:vs.fallback};}else{vs=vs.fallback;}}vs.fallback=strat;}function parseValStrat(){problem.input.valstrat=parseIdentifier();}function parseRestCustom(){skipWhitespaces();if(read()===$$EQ){skip();skipWhitespaces();}return readLineRest();}function parseTargets(){skipWhitespaces();if(read()===$$EQ)THROW('Unexpected double eq sign');if(read()===$$a&&readD(1)===$$l&&readD(2)===$$l){dslPointer+=3;}else{is($$LEFTPAREN,'ONLY_USE_WITH_SOME_TARGET_VARS; The @targets left-paren');var list=parseIdentsTo($$RIGHTPAREN);problem.freezeTargets(list);is($$RIGHTPAREN,'The @targets right-paren');}expectEol();}function THROW(msg){if(_debug){TRACE(String.fromCharCode.apply(String,dslBuf.slice(0,dslPointer))+'##|PARSER_IS_HERE['+msg+']|##'+String.fromCharCode.apply(String,dslBuf.slice(dslPointer)));}msg+=', source at '+dslPointer+' #|#: `'+String.fromCharCode.apply(String,dslBuf.slice(Math.max(0,dslPointer-20),dslPointer))+'#|#'+String.fromCharCode.apply(String,dslBuf.slice(dslPointer,Math.min(dslBuf.length,dslPointer+20)))+'`';throw new Error(msg);}}function ArrayBufferTransferPoly(source,length){// C/p https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer
if(!(source instanceof ArrayBuffer))throw new TypeError('Source must be an instance of ArrayBuffer');if(length<=source.byteLength)return source.slice(0,length);var sourceView=new Uint8Array(source),destView=new Uint8Array(new ArrayBuffer(length));destView.set(sourceView);return destView.buffer;}// Problem optimizer
function min_run(ml,problem,domains,names,firstRun,once){TRACE('min_run, loop:',firstRun,', byte code:',ml.length<50?ml.join(' '):'<big>');TRACE(ml__debug(ml,0,20,problem));// Now we can access the ml in terms of bytes, jeuj
var state=min_optimizeConstraints(ml,problem,domains,names,firstRun,once);if(state===$SOLVED){TRACE('minimizing solved it!',state);// All constraints have been eliminated
}else if(state===$REJECTED){TRACE('minimizing rejected it!',state);// An empty domain was found or a literal failed a test
}else{TRACE('pre-optimization finished, not yet solved');}return state;}function min_optimizeConstraints(ml,problem,domains,names,firstRun,once){TRACE('min_optimizeConstraints',ml.length<50?ml.join(' '):'');TRACE(problem.domains.length>100?'':'  <'+problem.domains.map(function(d,i){return i+' : '+problem.varNames[i]+' : '+domain__debug(problem.getDomain(i));}).join('>, <')+'>');TRACE('minimize sweep, ml len=',ml.length,', firstRun=',firstRun,'once=',once);var varChanged=true;var onlyJumps=false;var emptyDomain=false;var lastPcOffset=0;var lastOp=0;var pc=0;var loops=0;var constraints=0;// Count a constraint going forward, ignore jumps, reduce when restarting from same pc
var restartedRelevantOp=false;// Annoying, but restartedRelevantOp could mean more scrubbing is required. but it may not...
var term=getTerm();var addVar=problem.addVar,addAlias=problem.addAlias,getAlias=problem.getAlias,getDomain=problem.getDomain,setDomain=problem.setDomain,solveStack=problem.solveStack;// Function addPseudoAlias(indexA, indexB, A, B) {
//  ASSERT(domain_isBoolyPair(A) && domain_isBoolyPair(B), 'assuming A and B are booly pairs');
//  ASSERT(A !== B, 'booly pairs that are equal are regular aliases so dont call this function on them');
//
//  addAlias(indexA, indexB); // A is replaced by B
//
//  // consider them aliases but add a special solve stack
//  // entry to restore the max to A if B turns out nonzero
//  solveStack.push((_, force, getDomain, setDomain) => {
//    TRACE(' - deduper psuedo alias; was:', domain__debug(A), '!^', domain__debug(B), ', now:', domain__debug(getDomain(indexA)), '!^', domain__debug(getDomain(indexB)));
//    let vB = force(indexB);
//    TRACE(' - B forced to', vB);
//    if (vB > 0) {
//      setDomain(indexA, domain_removeValue(A, 0), true, true);
//    }
//
//    ASSERT(getDomain(indexA));
//    ASSERT(getDomain(indexB));
//    ASSERT(domain_isSolved(getDomain(indexA)));
//    ASSERT(domain_isSolved(getDomain(indexB)));
//    ASSERT((domain_getValue(getDomain(indexA)) === 0) === (domain_getValue(getDomain(indexB)) === 0));
//  });
// }
while(!onlyJumps&&(varChanged||restartedRelevantOp)){++loops;// Term.log('- looping', loops);
term.time('-> min_loop '+loops);TRACE('min outer loop');varChanged=false;onlyJumps=true;// Until proven otherwise
restartedRelevantOp=false;pc=0;constraints=0;var ops=min_innerLoop();TRACE('changed?',varChanged,'only jumps?',onlyJumps,'empty domain?',emptyDomain,'restartedRelevantOp?',restartedRelevantOp);if(emptyDomain){term.log('Empty domain at',lastPcOffset,'for opcode',lastOp,[ml__debug(ml,lastPcOffset,1,problem)],ml.slice(lastPcOffset,lastPcOffset+10));term.log('Empty domain, problem rejected');}term.timeEnd('-> min_loop '+loops);term.log('   - ops this loop:',ops,'constraints:',constraints);if(emptyDomain)return $REJECTED;if(onlyJumps)return $SOLVED;TRACE('\n## Intermediate state: ##');TRACE(ml__debug(ml,0,20,problem));TRACE(m2d__debug(problem));if(once)break;firstRun=false;}if(loops===1)return $STABLE;return $CHANGED;// ####################################################################################
function readIndex(ml,offset){// Get an index from ml. check for alias, and if so, immediately compile back the alias to improve future fetches.
var index=ml_dec16(ml,offset);var alias=getAlias(index);if(alias!==index)ml_enc16(ml,offset,alias);return alias;}function getDomainFast(index){ASSERT(index>=0&&index<=0xffff,'expecting valid index',index);ASSERT(getAlias(index)===index,'index should be unaliased',index,getAlias(index));var domain=getDomain(index,true);ASSERT(domain,'domain cant be falsy',domain);ASSERT_NORDOM(domain);if(!domain)setEmpty(index,'bad state (empty domain should have been detected sooner)');return domain;}function updateDomain(index,domain,desc){TRACE(' - updateDomain; {',index,'} updated from',domain__debug(getDomain(index)),'to',domain__debug(domain));ASSERT(!domain||domain_intersection(getDomain(index),domain),'should never add new values to a domain, only remove them','index=',index,'old=',domain__debug(getDomain(index)),'new=',domain__debug(domain),'desc=',desc);setDomain(index,domain,false,true);if(domain){varChanged=true;}else{TRACE(' - (updateDomain: EMPTY DOMAIN)');emptyDomain=true;}return emptyDomain;}function setEmpty(index,desc){TRACE(" - :'( setEmpty({",index,'})',desc);emptyDomain=true;if(index>=0)updateDomain(index,domain_createEmpty(),'explicitly empty'+(desc?'; '+desc:''));}function min_innerLoop(){var ops=0;onlyJumps=true;var wasMetaOp=false;// Jumps, start, stop, etc. not important if they "change"
while(pc<ml.length&&!emptyDomain){++ops;++constraints;wasMetaOp=false;var pcStart=pc;lastPcOffset=pc;var op=ml[pc];lastOp=op;// ASSERT(ml_validateSkeleton(ml, 'min_innerLoop'));
TRACE(' # CU pc='+pcStart,', op=',op,ml__opName(op));TRACE(' -> op: '+ml__debug(ml,pc,1,problem,true));switch(op){case ML_START:if(pc!==0){TRACE('reading a op=zero at position '+pc+' which should not happen',ml.slice(Math.max(pc-100,0),pc),'<here>',ml.slice(pc,pc+100));return THROW(' ! optimizer problem @',pc);}wasMetaOp=true;++pc;--constraints;// Not a constraint
break;case ML_STOP:TRACE(' ! good end @',pcStart);wasMetaOp=true;--constraints;// Not a constraint
return ops;case ML_LT:TRACE('- lt vv @',pcStart);min_lt(ml,pc);break;case ML_LTE:TRACE('- lte vv @',pcStart);min_lte(ml,pc);break;case ML_NONE:TRACE('- none @',pcStart);min_none(ml,pc);break;case ML_XOR:TRACE('- xor @',pcStart);min_xor(ml,pc);break;case ML_XNOR:TRACE('- xnor @',pcStart);min_xnor(ml,pc);break;case ML_IMP:TRACE('- imp @',pcStart);min_imp(ml,pc);break;case ML_NIMP:TRACE('- nimp @',pcStart);min_nimp(ml,pc);break;case ML_DIFF:TRACE('- diff @',pcStart);min_diff(ml,pc);break;case ML_ALL:TRACE('- all() @',pcStart);min_all(ml,pc);break;case ML_ISDIFF:TRACE('- isdiff @',pcStart);min_isDiff(ml,pc);break;case ML_NALL:TRACE('- nall @',pcStart);min_nall(ml,pc);break;case ML_SAME:TRACE('- same @',pcStart);min_same(ml,pc);break;case ML_SOME:TRACE('- some @',pcStart);min_some(ml,pc);break;case ML_ISLT:TRACE('- islt vvv @',pcStart);min_isLt(ml,pc);break;case ML_ISLTE:TRACE('- islte vvv @',pcStart);min_isLte(ml,pc);break;case ML_ISALL:TRACE('- isall @',pcStart);min_isAll(ml,pc);break;case ML_ISNALL:TRACE('- isnall @',pcStart);min_isNall(ml,pc);break;case ML_ISSAME:TRACE('- issame @',pcStart);min_isSame(ml,pc);break;case ML_ISSOME:TRACE('- issome @',pcStart);min_isSome(ml,pc);break;case ML_ISNONE:TRACE('- isnone @',pcStart);min_isNone(ml,pc);break;case ML_MINUS:TRACE('- minus @',pcStart);min_minus(ml,pc);break;case ML_DIV:TRACE('- div @',pcStart);min_div(ml,pc);break;case ML_SUM:TRACE('- sum @',pcStart);min_sum(ml,pc);break;case ML_PRODUCT:TRACE('- product @',pcStart);min_product(ml,pc);break;case ML_NOBOOL:TRACE('- nobool @',pc);pc+=SIZEOF_V;wasMetaOp=true;break;case ML_NOLEAF:TRACE('- noleaf @',pc);pc+=SIZEOF_V;wasMetaOp=true;break;case ML_NOOP:TRACE('- noop @',pc);min_moveTo(ml,pc,1);--constraints;// Not a constraint
wasMetaOp=true;break;case ML_NOOP2:TRACE('- noop2 @',pc);min_moveTo(ml,pc,2);--constraints;// Not a constraint
wasMetaOp=true;break;case ML_NOOP3:TRACE('- noop3 @',pc);min_moveTo(ml,pc,3);--constraints;// Not a constraint
wasMetaOp=true;break;case ML_NOOP4:TRACE('- noop4 @',pc);min_moveTo(ml,pc,4);--constraints;// Not a constraint
wasMetaOp=true;break;case ML_JMP:TRACE('- jmp @',pc);min_moveTo(ml,pc,SIZEOF_V+ml_dec16(ml,pc+1));--constraints;// Not a constraint
wasMetaOp=true;break;case ML_JMP32:TRACE('- jmp32 @',pc);min_moveTo(ml,pc,SIZEOF_W+ml_dec32(ml,pc+1));--constraints;// Not a constraint
wasMetaOp=true;break;default:THROW('(mn) unknown op: 0x'+op.toString(16),' at',pc);}if(pc===pcStart&&!emptyDomain){TRACE(' - restarting op from same pc...');if(!wasMetaOp)restartedRelevantOp=true;// TODO: undo this particular step if the restart results in the offset becoming a jmp?
--constraints;// Constraint may have been eliminated
}}if(emptyDomain){return ops;}return THROW('Derailed; expected to find STOP before EOF');}function min_moveTo(ml,offset,len){TRACE(' - trying to move from',offset,'to',offset+len,'delta = ',len);switch(ml_dec8(ml,offset+len)){case ML_NOOP:case ML_NOOP2:case ML_NOOP3:case ML_NOOP4:case ML_JMP:case ML_JMP32:TRACE('- moving to another jump so merging them now');ml_compileJumpAndConsolidate(ml,offset,len);pc=offset;// Restart, make sure the merge worked
break;default:pc=offset+len;break;}}function min_same(ml,offset){// Loop through the args and alias each one to the previous. then eliminate the constraint. it is an artifact.
var argCount=ml_dec16(ml,offset+1);TRACE(' = min_same',argCount,'x');if(argCount===2){if(readIndex(ml,offset+OFFSET_C_A)===readIndex(ml,offset+OFFSET_C_B)){TRACE(' - argcount=2 and A==B so eliminating constraint');ml_eliminate(ml,offset,SIZEOF_C_2);return;}}if(argCount>1){TRACE(' - aliasing all args to the first arg, intersecting all domains, and eliminating constraint');var firstIndex=readIndex(ml,offset+SIZEOF_C);var F=getDomain(firstIndex,true);TRACE(' - indexF=',firstIndex,', F=',domain__debug(F));for(var i=1;i<argCount;++i){var indexD=readIndex(ml,offset+SIZEOF_C+i*2);if(indexD!==firstIndex){var D=getDomain(indexD,true);TRACE('   - pos:',i,', aliasing index',indexD,'to F, intersecting',domain__debug(D),'with',domain__debug(F),'to',domain__debug(domain_intersection(F,D)));F=intersectAndAlias(indexD,firstIndex,D,F);if(!F){TRACE('   !! Caused an empty domain. Failing.');break;}}}}TRACE(' - eliminating same() constraint');ml_eliminate(ml,offset,SIZEOF_C+argCount*2);}function min_diff_2(ml,offset){TRACE(' - min_diff_2');ASSERT(ml_dec16(ml,offset+1)===2,'should be arg count = 2');var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' -',indexA,'!=',indexB,'   ->   ',domain__debug(A),'!=',domain__debug(B));if(!A||!B)return true;if(indexA===indexB){TRACE(' - A != A, falsum, artifact case');setEmpty(indexA,'X!=X falsum');return true;}var solved=false;// If either is solved then the other domain should
// become the result of unsolved_set "minus" solved_set
var vA=domain_getValue(A);if(vA>=0){var oB=B;B=domain_removeValue(B,vA);if(oB!==B&&updateDomain(indexB,B,'A != B with A solved'))return true;solved=true;}else{var vB=domain_getValue(B);if(domain_getValue(B)>=0){var oA=A;A=domain_removeValue(A,vB);if(A!==oA&&updateDomain(indexA,A,'A != B with B solved'))return true;solved=true;}}// If the two domains share no elements the constraint is already satisfied
if(!solved&&!domain_intersection(A,B))solved=true;TRACE(' ->',domain__debug(A),'!=',domain__debug(B),', solved?',solved);// Solved if the two domains (now) intersect to an empty domain
if(solved){TRACE(' - No element overlapping between',indexA,'and',indexB,'left so we can eliminate this diff');ASSERT(domain_sharesNoElements(A,B),'if A or B solves, the code should have solved the diff');ml_eliminate(ml,offset,SIZEOF_C_2);return true;}TRACE(' - min_diff_2 changed nothing');return false;}function min_lt(ml,offset){var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' = min_lt',indexA,'<',indexB,'   ->   ',domain__debug(A),'<',domain__debug(B));if(indexA===indexB)return setEmpty(indexA,'X<X falsum');// (relevant) artifact case
if(!A||!B)return;// Relative comparison is easy; cut away any non-intersecting
// values that violate the desired outcome. only when a A and
// B have multiple intersecting values we have to keep this
// constraint
var oA=A;A=domain_removeGte(A,domain_max(B));if(A!==oA){TRACE(' - updating A to',domain__debug(A));if(updateDomain(indexA,A,'A lt B'))return;}var oB=B;B=domain_removeLte(B,domain_min(A));if(B!==oB){TRACE(' - updating B to',domain__debug(B));if(updateDomain(indexB,B,'A lt B'))return;}// Any value in A must be < any value in B
if(domain_max(A)<domain_min(B)){TRACE(' - Eliminating lt because max(A)<min(B)');ml_eliminate(ml,offset,SIZEOF_C_2);}else{TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_C_2;}}function min_lte(ml,offset){var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' = min_lte',indexA,'<=',indexB,'   ->   ',domain__debug(A),'<=',domain__debug(B));if(!A||!B)return;if(indexA===indexB){TRACE(' - Eliminating lte because max(A)<=min(A) is a tautology (once solved)');ml_eliminate(ml,offset,SIZEOF_C_2);return;}// Relative comparison is easy; cut away any non-intersecting
// values that violate the desired outcome. only when a A and
// B have multiple intersecting values we have to keep this
// constraint
TRACE(' - index A!=B so remove all >max(B) from A',domain__debug(A),domain_max(B),'->',domain__debug(domain_removeGtUnsafe(A,domain_max(B))));var oA=A;A=domain_removeGtUnsafe(A,domain_max(B));if(A!==oA){TRACE(' - Updating A to',domain__debug(A));if(updateDomain(indexA,A,'A lte B'))return;}// A is (now) empty so just remove it
var oB=B;B=domain_removeLtUnsafe(B,domain_min(A));if(B!==oB){TRACE(' - Updating B to',domain__debug(B));if(updateDomain(indexB,B,'A lte B'))return;}TRACE(' ->',domain__debug(A),'<=',domain__debug(B),', bp?',domain_isBoolyPair(A),'<=',domain_isBoolyPair(B),', max:',domain_max(A),'<=',domain_max(B));// Any value in A must be < any value in B
if(domain_max(A)<=domain_min(B)){TRACE(' - Eliminating lte because max(A)<=min(B)');ml_eliminate(ml,offset,SIZEOF_C_2);}else if(domain_isBoolyPair(A)&&domain_isBoolyPair(B)&&domain_max(A)<=domain_max(B)){TRACE(' - A and B boolypair with max(A)<=max(B) so this is implication');TRACE_MORPH('A <= B','B -> A');ml_c2c2(ml,offset,2,ML_IMP,indexA,indexB);// Have to add a solvestack entry to prevent a solution [01]->1 which would satisfy IMP but not LTE
solveStack.push(function(_,force,getDomain,setDomain){TRACE(' - min_lte; enforcing LTE',indexA,'<=',indexB,' => ',domain__debug(getDomain(indexA)),'<=',domain__debug(getDomain(indexB)));var A=getDomain(indexA);var B=getDomain(indexB);if(domain_hasNoZero(A)){B=domain_removeValue(B,0);setDomain(indexB,B);}else if(domain_isZero(B)||domain_isBooly(A)){A=domain_removeGtUnsafe(A,0);setDomain(indexA,A);}ASSERT(getDomain(indexA));ASSERT(getDomain(indexB));ASSERT(domain_max(getDomain(indexA))<=domain_min(getDomain(indexB)),'must hold lte',domain__debug(A),'<=',domain__debug(B));});}else{TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_C_2;}}function min_nall(ml,offset){var offsetCount=offset+1;var argCount=ml_dec16(ml,offsetCount);var offsetArgs=offset+SIZEOF_C;var opSize=SIZEOF_C+argCount*2;TRACE(' = min_nall',argCount,'x');TRACE('  - ml for this nall:',ml.slice(offset,offset+opSize).join(' '));TRACE('  -',Array.from(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}));TRACE('  -',Array.from(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}));if(!argCount)return setEmpty(-1,'nall without args is probably a bug');if(argCount===2){if(min_nall_2(ml,offset))return;}var countStart=argCount;var lastIndex=-1;var lastDomain;// A nall only ensures at least one of its arg solves to zero
for(var i=argCount-1;i>=0;--i){// Backwards because we're pruning dud indexes
var index=readIndex(ml,offsetArgs+i*2);var domain=getDomainFast(index);TRACE('  - loop i=',i,'index=',index,'domain=',domain__debug(domain));if(!domain)return;if(domain_min(domain)>0||lastIndex===index){// Remove var from list
TRACE(lastIndex===index?' - removing redundant dupe var from nall':' - domain contains no zero so remove var from this constraint');// Now
// - move all indexes bigger than the current back one position
// - compile the new count back in
// - compile a NOOP in the place of the last element
TRACE('  - moving further domains one space forward (from ',i+1,' / ',argCount,')');min_spliceArgSlow(ml,offsetArgs,argCount,i,false);--argCount;}else if(domain_isZero(domain)){// Remove constraint
TRACE(' - domain solved to zero so constraint is satisfied');ml_eliminate(ml,offset,SIZEOF_C+2*countStart);return;}else{// Arg contains a 0 and is unsolved
TRACE(' - domain contains zero and is not solved so leave it alone');lastIndex=index;lastDomain=domain;}}if(argCount===0){TRACE(' - Nall has no var left to be zero; rejecting problem');// This is a bad state: all vars were removed from this constraint which
// means none of the args were zero and the constraint doesnt hold
return setEmpty(lastIndex,'nall; none of the args were zero');}if(argCount===1){TRACE(' - Nall has one var left; forcing it to zero');// Force set last index to zero and remove constraint. this should not
// reject (because then the var would have been removed in loop above)
// but do it "safe" anyways, just in case.
var _domain=domain_removeGtUnsafe(lastDomain,0);if(lastDomain!==_domain&&updateDomain(lastIndex,_domain))return;ml_eliminate(ml,offset,SIZEOF_C+2*countStart);}else if(countStart!==argCount){TRACE(' - recording new argcount and freeing up space');ml_enc16(ml,offsetCount,argCount);// Write new count
var free=(countStart-argCount)*2;ml_compileJumpSafe(ml,offset+opSize-free,free);// Note: still have to restart op because ml_jump may have clobbered the old end of the op with a new jump
}else{TRACE(' - not only jumps...');onlyJumps=false;pc=offset+opSize;}}function min_nall_2(ml,offset){var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' = min_nall_2',indexA,'!&',indexB,'   ->   ',domain__debug(A),'!&',domain__debug(B));ASSERT(ml_dec16(ml,offset+1)===2,'nall should have 2 args');if(!A||!B)return true;if(indexA===indexB){TRACE(' - indexA==indexB so A=0 and eliminate constraint');var oA=A;A=domain_removeGtUnsafe(A,0);if(A!==oA)updateDomain(indexA,A,'`A !& A` means A must be zero');ml_eliminate(ml,offset,SIZEOF_C_2);return true;}if(domain_isZero(A)||domain_isZero(B)){TRACE(' - A=0 or B=0, eliminating constraint');ml_eliminate(ml,offset,SIZEOF_C_2);return true;}if(domain_hasNoZero(A)){TRACE(' - A>=1 so B must be 0');var oB=B;B=domain_removeGtUnsafe(B,0);if(B!==oB)updateDomain(indexB,B,'nall[2] B');ml_eliminate(ml,offset,SIZEOF_C_2);return true;}if(domain_hasNoZero(B)){TRACE(' - B>=1 so A must be 0');var _oA=A;A=domain_removeGtUnsafe(A,0);if(A!==_oA)updateDomain(indexA,A,'nall[2] A');ml_eliminate(ml,offset,SIZEOF_C_2);return true;}TRACE(' - min_nall_2 changed nothing');return false;}function min_some(ml,offset){var offsetCount=offset+1;var argCount=ml_dec16(ml,offsetCount);var offsetArgs=offset+SIZEOF_C;var opSize=SIZEOF_C+argCount*2;TRACE(' = min_some',argCount,'x');TRACE('  - ml for this some:',ml.slice(offset,offset+opSize).join(' '));TRACE('  -',Array.from(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}));TRACE('  -',Array.from(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}));if(!argCount)return setEmpty(-1,'some without args is probably a bug');if(argCount===2){if(min_some_2(ml,offset))return;}var countStart=argCount;var lastIndex=-1;var lastDomain;// A some only ensures at least one of its arg solves to zero
for(var i=argCount-1;i>=0;--i){// Backwards because we're pruning dud indexes
var index=readIndex(ml,offsetArgs+i*2);var domain=getDomainFast(index);TRACE('  - loop i=',i,'index=',index,'domain=',domain__debug(domain));if(!domain)return;if(domain_isZero(domain)||lastIndex===index){// Remove var from list
TRACE(lastIndex===index?' - removing redundant dupe var from some':' - domain contains no zero so remove var from this constraint');// Now
// - move all indexes bigger than the current back one position
// - compile the new count back in
// - compile a NOOP in the place of the last element
TRACE('  - moving further domains one space forward (from ',i+1,' / ',argCount,')');min_spliceArgSlow(ml,offsetArgs,argCount,i,false);--argCount;}else if(domain_hasNoZero(domain)){// Remove constraint
TRACE(' - domain solved to nonzero so constraint is satisfied');ml_eliminate(ml,offset,SIZEOF_C+2*countStart);return;}else{// Arg contains a 0 and is unsolved
TRACE(' - domain contains zero and is not solved so leave it alone');lastIndex=index;lastDomain=domain;}}if(argCount===0){TRACE(' - Some has no var left to be zero; rejecting problem');// This is a bad state: all vars were removed from this constraint which
// means all of the args were zero and the constraint doesnt hold
return setEmpty(lastIndex,'some; all of the args were zero');}if(argCount===1){TRACE(' - Some has one var left; forcing it to nonzero');// Force set last index to nonzero and remove constraint. this should not
// reject (because then the var would have been removed in loop above)
// but do it "safe" anyways, just in case.
var _domain2=domain_removeValue(lastDomain,0);if(lastDomain!==_domain2&&updateDomain(lastIndex,_domain2))return;ml_eliminate(ml,offset,SIZEOF_C+2*countStart);}else if(countStart!==argCount){TRACE(' - recording new argcount and freeing up space');ml_enc16(ml,offsetCount,argCount);// Write new count
var free=(countStart-argCount)*2;ml_compileJumpSafe(ml,offset+opSize-free,free);// Note: still have to restart op because ml_jump may have clobbered the old end of the op with a new jump
}else{TRACE(' - not only jumps...');onlyJumps=false;pc=offset+opSize;}}function min_isAll(ml,offset){var offsetCount=offset+1;var argCount=ml_dec16(ml,offsetCount);var opSize=SIZEOF_C+2+argCount*2;var offsetArgs=offset+SIZEOF_C;var offsetR=offset+opSize-2;var indexR=readIndex(ml,offsetR);var R=getDomainFast(indexR);TRACE(' = min_isAll',argCount,'x');TRACE('  - ml for this isAll ('+opSize+'b):',ml.slice(offset,offset+opSize).join(' '));TRACE('  -',indexR,'= all?(',[].concat(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}),')');TRACE('  -',domain__debug(R),'= all?(',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}),')');if(!R)return;if(domain_isZero(R)){TRACE(' - R is 0 so morph to nall and revisit');// Compile to nall and revisit
ml_enc8(ml,offset,ML_NALL);ml_compileJumpSafe(ml,offset+opSize-2,2);// Difference between nall with R=0 and an isAll is the result var (16bit)
return;}if(domain_hasNoZero(R)){TRACE(' - R is non-zero so remove zero from all args and eliminate constraint');for(var i=0;i<argCount;++i){var index=readIndex(ml,offsetArgs+i*2);var domain=getDomainFast(index);TRACE('    - index=',index,'dom=',domain__debug(domain));if(!domain)return;var newDomain=domain_removeValue(domain,0);if(newDomain!==domain&&updateDomain(index,newDomain))return;}ml_eliminate(ml,offset,opSize);return;}// R is unresolved. check whether R can be determined
ASSERT(domain_min(R)===0&&domain_max(R)>0,'R is unresolved here',R);var allNonZero=true;var someAreZero=false;var someNonZero=false;for(var _i=0;_i<argCount;++_i){var _index=readIndex(ml,offsetArgs+_i*2);var _domain3=getDomainFast(_index);TRACE('    - index=',_index,'dom=',domain__debug(_domain3));// Reflect isAll,
// R=0 when at least one arg is zero
// R>0 when all args have no zero
if(domain_isZero(_domain3)){TRACE(' - found a zero, breaking loop because R=0');someAreZero=true;break;// This permanently sets R to 0; no need to loop further
}else if(domain_min(_domain3)===0){// Arg has zero and non-zero values so R (at least) cant be set to 1 yet
allNonZero=false;}else{someNonZero=true;}}if(someAreZero){TRACE(' - At least one arg was zero so R=0 and constraint can be removed');var oR=R;R=domain_removeGtUnsafe(R,0);if(R!==oR)updateDomain(indexR,R);ml_eliminate(ml,offset,opSize);return;}if(allNonZero){TRACE(' - No arg had zero so R=1 and constraint can be removed');var _oR=R;R=domain_removeValue(R,0);if(R!==_oR)updateDomain(indexR,R);ml_eliminate(ml,offset,opSize);return;}// Remove all non-zero values from the list. this reduces their connection count and simplifies this isall
if(someNonZero){var removed=0;for(var _i2=argCount-1;_i2>=0;--_i2){var _index2=readIndex(ml,offsetArgs+_i2*2);var _domain4=getDomainFast(_index2);TRACE('   - checking if index',_index2,'(domain',domain__debug(_domain4),') contains no zero so we can remove it from this isall');if(domain_hasNoZero(_domain4)){// Now
// - move all indexes bigger than the current back one position
// - compile the new count back in
// - compile a NOOP in the place of the last element
TRACE('  - moving further domains one space forward (from ',_i2+1,' / ',argCount,')');min_spliceArgSlow(ml,offsetArgs,argCount,_i2,true);--argCount;++removed;}}ml_enc16(ml,offset+1,argCount);// Now "blank out" the space of eliminated constants, they should be at the end of the op
var newOpSize=opSize-removed*2;ml_compileJumpSafe(ml,offset+newOpSize,opSize-newOpSize);TRACE(' - Removed',removed,'non-zero args from unsolved isall, has',argCount,'left');TRACE(' - ml for this sum now:',ml.slice(offset,offset+opSize).join(' '));if(argCount===1)_min_isAllMorphToXnor(ml,offset,argCount,offsetArgs,indexR);return;}if(argCount===1)return _min_isAllMorphToXnor(ml,offset,argCount,offsetArgs,indexR);TRACE(' - not only jumps...');onlyJumps=false;pc=offset+opSize;}function _min_isAllMorphToXnor(ml,offset,argCount,offsetArgs,indexR){// While this usually only happens when eliminating non-zeroes, there may be an artifact where a script
// generated an isall with just one arg. kind of silly but whatever, right.
TRACE(' - Only one arg remaining; morphing to a XNOR');ASSERT(argCount>0,'isall must have at least one arg in order to have enough space for the xnor morph');var index=readIndex(ml,offsetArgs);ml_cr2c2(ml,offset,argCount,ML_XNOR,indexR,index);varChanged=true;// The xnor may need optimization
}function min_isNall(ml,offset){var offsetCount=offset+1;var argCount=ml_dec16(ml,offsetCount);var opSize=SIZEOF_C+argCount*2+2;var offsetArgs=offset+SIZEOF_C;var offsetR=offset+opSize-2;var indexR=readIndex(ml,offsetR);var R=getDomainFast(indexR);TRACE(' = min_isNall',argCount,'x');TRACE('  - ml for this isNall:',ml.slice(offset,offset+opSize).join(' '));TRACE('  -',indexR,'= nall?(',[].concat(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}),')');TRACE('  -',domain__debug(R),'= nall?(',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}),')');if(!R)return;if(domain_isZero(R)){TRACE(' - R=0 so; !nall so; all so; we must remove zero from all args and eliminate constraint');for(var i=0;i<argCount;++i){var index=readIndex(ml,offsetArgs+i*2);var domain=getDomainFast(index);TRACE('    - index=',index,'dom=',domain__debug(domain));if(!domain)return;var newDomain=domain_removeValue(domain,0);if(newDomain!==domain&&updateDomain(index,newDomain))return;}ml_eliminate(ml,offset,opSize);return;}if(domain_hasNoZero(R)){TRACE(' - R>0 so; nall. just morph and revisit');ml_enc8(ml,offset,ML_NALL);ml_compileJumpSafe(ml,offset+opSize-2,2);// Difference between nall and isNall is the result var (16bit)
return;}// R is unresolved. check whether R can be determined
ASSERT(domain_min(R)===0&&domain_max(R)>0,'R is unresolved here',R);var allNonZero=true;var someAreZero=false;for(var _i3=0;_i3<argCount;++_i3){var _index3=readIndex(ml,offsetArgs+_i3*2);var _domain5=getDomainFast(_index3);TRACE('    - index=',_index3,'dom=',domain__debug(_domain5));// Reflect isNall,
// R=0 when all args have no zero
// R>0 when at least one arg is zero
if(domain_isZero(_domain5)){TRACE(' - found a zero, breaking loop because R=0');someAreZero=true;break;// This permanently sets R to 0; no need to loop further
}else if(domain_min(_domain5)===0){// Arg has zero and non-zero values so R (at least) cant be set to 1 yet
allNonZero=false;}}if(someAreZero){TRACE(' - At least one arg was zero so R>=1 and constraint can be removed');var oR=R;R=domain_removeValue(R,0);if(R!==oR)updateDomain(indexR,R,'isnall, R>=1 because at least one var was zero');ml_eliminate(ml,offset,opSize);}else if(allNonZero){TRACE(' - No arg had a zero so R=0 and constraint can be removed');var _oR2=R;R=domain_removeGtUnsafe(R,0);if(R!==_oR2)updateDomain(indexR,R);ml_eliminate(ml,offset,opSize);}else{// TODO: prune all args here that are nonzero? is that worth it?
TRACE(' - not only jumps...');onlyJumps=false;pc=offset+opSize;}}function min_isSome(ml,offset){var offsetCount=offset+1;var argCount=ml_dec16(ml,offsetCount);var opSize=SIZEOF_C+argCount*2+2;var offsetArgs=offset+SIZEOF_C;var offsetR=offset+opSize-2;var indexR=readIndex(ml,offsetR);var R=getDomainFast(indexR);TRACE(' = min_isSome',argCount,'x');TRACE('  - ml for this isSome:',ml.slice(offset,offset+opSize).join(' '));TRACE('  -',indexR,'= some?(',[].concat(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}),')');TRACE('  -',domain__debug(R),'= some?(',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}),')');if(!R)return;if(domain_isZero(R)){TRACE(' - R=0 so; !some so; none so; we must force zero to all args and eliminate constraint');for(var i=0;i<argCount;++i){var index=readIndex(ml,offsetArgs+i*2);var domain=getDomainFast(index);TRACE('    - index=',index,'dom=',domain__debug(domain));if(!domain)return;var newDomain=domain_removeGtUnsafe(domain,0);if(newDomain!==domain&&updateDomain(index,newDomain))return;}ml_eliminate(ml,offset,opSize);return;}if(domain_hasNoZero(R)){TRACE(' - R>0 so; some. just morph and revisit');ml_enc8(ml,offset,ML_SOME);ml_compileJumpSafe(ml,offset+opSize-2,2);// Difference between some and isSome is the result var (16bit)
return;}// R is unresolved. check whether R can be determined
ASSERT(domain_min(R)===0&&domain_max(R)>0,'R is unresolved here',R);var someNonZero=false;var allZero=true;var someZero=false;for(var _i4=0;_i4<argCount;++_i4){var _index4=readIndex(ml,offsetArgs+_i4*2);var _domain6=getDomainFast(_index4);TRACE('    - index=',_index4,'dom=',domain__debug(_domain6));// Reflect isSome,
// R=0 when all args are zero (already checked above)
// R>0 when at least one arg is nonzero
if(domain_hasNoZero(_domain6)){TRACE(' - found a nonzero, breaking loop because R>0');someNonZero=true;break;// This permanently sets R to 0; no need to loop further
}else if(domain_isZero(_domain6)){someZero=true;}else{allZero=false;}}if(someNonZero){TRACE(' - At least one arg was zero so R>=1 and constraint can be removed');var oR=R;R=domain_removeValue(R,0);if(R!==oR)updateDomain(indexR,R,'issome, R>=1 because at least one var was nonzero');ml_eliminate(ml,offset,opSize);}else if(allZero){TRACE(' - All vars were zero so R=0 and constraint can be removed');var _oR3=R;R=domain_removeGtUnsafe(R,0);if(R!==_oR3)updateDomain(indexR,R,'issome, R>=1 because all vars were zero');ml_eliminate(ml,offset,opSize);}else if(someZero){TRACE(' - Some vars were zero, removing them from the args');// Force constants to the end
ml_heapSort16bitInline(ml,pc+SIZEOF_C,argCount);// We know
// - these args do not contain non-zero args
// - all constants are moved to the back
// - there is at least one constant 0
// - not all args were 0
// so we can move back the result var
var argOffset=offsetArgs+argCount*2-2;TRACE(' - offset:',offset,', argCount:',argCount,', args offset:',offsetArgs,', first arg domain:',domain__debug(getDomain(readIndex(ml,offsetArgs))),', last arg offset:',argOffset,', last domain:',domain__debug(getDomain(readIndex(ml,argOffset))));TRACE(' - op before:',ml__debug(ml,offset,1,problem));ASSERT(domain_isZero(getDomain(readIndex(ml,argOffset))),'at least the last arg should be zero',domain__debug(getDomain(readIndex(ml,argOffset))));ASSERT(!domain_isZero(getDomain(readIndex(ml,offsetArgs))),'the first arg should not be zero',domain__debug(getDomain(readIndex(ml,offsetArgs))));// Search for the first non-zero arg
var newArgCount=argCount;while(domain_isZero(getDomain(readIndex(ml,argOffset)))){argOffset-=2;--newArgCount;}TRACE(' - last non-zero arg is arg number',newArgCount,'at',argOffset,', index:',readIndex(ml,argOffset),', domain:',domain__debug(getDomain(readIndex(ml,argOffset))));if(newArgCount===1){TRACE(' - there is one arg left, morph to XNOR');TRACE_MORPH('R = some?(A 0 0 ..)','R !^ A');var indexA=readIndex(ml,offsetArgs);ml_cr2c2(ml,offset,argCount,ML_XNOR,indexR,indexA);}else{TRACE(' - moving R to the first zero arg at offset',argOffset+2,'and compiling a jump for the rest');// Copy the result var over the first zero arg
ml_enc16(ml,offset+1,newArgCount);ml_enc16(ml,argOffset+2,indexR);ml_compileJumpSafe(ml,argOffset+4,(argCount-newArgCount)*2);ASSERT(ml_validateSkeleton(ml,'min_isSome; pruning zeroes'));}TRACE(' - op after:',ml__debug(ml,offset,1,problem));}else{// TODO: prune all args here that are zero? is that worth it?
TRACE(' - not only jumps...');onlyJumps=false;pc=offset+opSize;}}function min_isNone(ml,offset){var offsetCount=offset+1;var argCount=ml_dec16(ml,offsetCount);var opSize=SIZEOF_C+argCount*2+2;var offsetArgs=offset+SIZEOF_C;var offsetR=offset+opSize-2;var indexR=readIndex(ml,offsetR);var R=getDomainFast(indexR);TRACE(' = min_isNone',argCount,'x');TRACE('  - ml for this isNone:',ml.slice(offset,offset+opSize).join(' '));TRACE('  -',indexR,'= none?(',[].concat(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}),')');TRACE('  -',domain__debug(R),'= none?(',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}),')');if(!R)return;if(domain_hasNoZero(R)){TRACE('    - R>=1 so set all args to zero and eliminate');for(var i=0;i<argCount;++i){var index=readIndex(ml,offsetArgs+i*2);var domain=getDomainFast(index);TRACE('    - index=',index,'dom=',domain__debug(domain));if(!domain)return;var newDomain=domain_removeGtUnsafe(domain,0);if(newDomain!==domain&&updateDomain(index,newDomain))return;}ml_eliminate(ml,offset,opSize);return;}if(domain_isZero(R)){TRACE(' - R=0 so this is a SOME. just morph and revisit');TRACE_MORPH('0 = none?(A B C ...)','some(A B C ...)');ml_enc8(ml,offset,ML_SOME);ml_compileJumpSafe(ml,offset+opSize-2,2);// Difference between some and isNone is the result var (16bit)
return;}// R has a zero or is zero, determine whether there is any nonzero arg, or whether they are all zero
var nonZero=false;var allZero=true;for(var _i5=0;_i5<argCount;++_i5){var _index5=readIndex(ml,offsetArgs+_i5*2);var _domain7=getDomainFast(_index5);TRACE('    - index=',_index5,'dom=',domain__debug(_domain7));// Reflect isNone,
// R=0 when at least one arg is nonzero
// R>0 when all args are zero
if(domain_hasNoZero(_domain7)){nonZero=true;break;}if(!domain_isZero(_domain7)){allZero=false;}}if(nonZero){TRACE(' - at least one arg had no zero so R=0, eliminate constraint');var oR=R;R=domain_removeGtUnsafe(R,0);if(R!==oR)updateDomain(indexR,R,'isnone R=0 because an arg had no zero');ml_eliminate(ml,offset,opSize);}else if(allZero){TRACE(' - isnone, all args are 0 so R>=1, remove constraint');var _oR4=R;R=domain_removeValue(R,0);if(R!==_oR4)updateDomain(indexR,R,'isnone R>=1 because all args were zero');ml_eliminate(ml,offset,opSize);}else{// TODO: prune all args here that are zero? is that worth it?
TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_C+argCount*2+2;}}function min_diff(ml,offset){var argCount=ml_dec16(ml,offset+1);var offsetArgs=offset+SIZEOF_C;var opSize=SIZEOF_C+argCount*2;TRACE(' = min_diff',argCount,'x');TRACE('  - ml for this diff:',ml.slice(offset,offset+opSize).join(' '));TRACE('  - indexes:',[].concat(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}).join(', '));TRACE('  - domains:',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}).join(', '));ASSERT(argCount,'should have at least one arg or be eliminated');if(!argCount)return setEmpty(-1,'diff without args is probably a bug');var countStart=argCount;// A diff is basically a pyramid of neq's; one for each unique pair of the set
// we loop back to front because we're splicing out vars while looping
for(var i=argCount-1;i>=0;--i){var indexA=readIndex(ml,offsetArgs+i*2);var A=getDomainFast(indexA);TRACE('  - loop i=',i,'index=',indexA,'domain=',domain__debug(A));if(!A)return;var v=domain_getValue(A);if(v>=0){TRACE('   - solved, so removing',v,'from all other domains and index',indexA,'from the constraint');for(var j=0;j<argCount;++j){// Gotta loop through all args. args wont be removed in this loop.
if(j!==i){var indexB=readIndex(ml,offsetArgs+j*2);var oB=getDomainFast(indexB);TRACE('    - loop j=',j,'index=',indexB,'domain=',domain__debug(oB));if(indexA===indexB)return updateDomain(indexA,domain_createEmpty(),'diff had this var twice, x!=x is a falsum');// Edge case
var B=domain_removeValue(oB,v);if(B!==oB&&updateDomain(indexB,B,'diff arg'))return;}}// So none of the other args have v and none of them ended up empty
// now
// - move all indexes bigger than the current back one position
// - compile the new count back in
// - compile a NOOP in the place of the last element
TRACE('  - moving further domains one space forward (from ',i+1,' / ',argCount,')',i+1<argCount);min_spliceArgSlow(ml,offsetArgs,argCount,i,true);// Move R as well
--argCount;}}if(argCount<=1){TRACE(' - Count is',argCount,'; eliminating constraint');ASSERT(argCount>=0,'cant be negative');ml_eliminate(ml,offset,opSize);}else if(argCount!==countStart){TRACE('  - recompiling new count (',argCount,')');ml_enc16(ml,offset+1,argCount);TRACE('  - compiling noop into empty spots');// This hasnt happened yet
ml_compileJumpSafe(ml,offsetArgs+argCount*2,(countStart-argCount)*2);// Need to restart op because the skip may have clobbered the next op offset
}else if(argCount===2&&min_diff_2(ml,offset));else{TRACE(' - not only jumps...',opSize);onlyJumps=false;pc=offset+opSize;}}function min_sum_2(ml,sumOffset){var offsetA=sumOffset+OFFSET_C_A;var offsetB=sumOffset+OFFSET_C_B;var offsetR=sumOffset+OFFSET_C_R;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var indexR=readIndex(ml,offsetR);var A=getDomainFast(indexA);var B=getDomainFast(indexB);var R=getDomainFast(indexR);TRACE(' = min_sum_2',indexR,'=',indexA,'+',indexB,'   ->   ',domain__debug(R),'=',domain__debug(A),'+',domain__debug(B));if(!A||!B||!R)return false;ASSERT(ml_dec8(ml,sumOffset)===ML_SUM,'should be a sum with 2 args');ASSERT(ml_dec16(ml,sumOffset+1)===2,'should have 2 args');// Note: A + B = C   ==>   <loA + loB, hiA + hiB>
// but:  A - B = C   ==>   <loA - hiB, hiA - loB>   (so the lo/hi of B gets swapped!)
// keep in mind that any number oob <sub,sup> gets pruned in either case, this makes
// plus and minus are not perfect (counter-intuitively): `[0, 2] - [0, 4] = [0, 2]`
var ooA=A;var ooB=B;var ooR=R;var oA;var oB;var oR;var loops=0;do{++loops;TRACE(' - plus propagation step...',loops,domain__debug(R),'=',domain__debug(A),'+',domain__debug(B));oA=A;oB=B;oR=R;R=domain_intersection(R,domain_plus(A,B));A=domain_intersection(A,domain_minus(R,B));B=domain_intersection(B,domain_minus(R,A));}while(A!==oA||B!==oB||R!==oR);TRACE(' ->','R:',domain__debug(R),'= A:',domain__debug(A),'+ B:',domain__debug(B));if(loops>1){if(A!==ooA)updateDomain(indexA,A,'plus A');if(B!==ooB)updateDomain(indexB,B,'plus B');if(R!==ooR)updateDomain(indexR,R,'plus R');if(!A||!B||!R)return false;}var vA=domain_getValue(A);var vB=domain_getValue(B);var vR=domain_getValue(R);ASSERT((vA>=0)+(vB>=0)+(vR>=0)!==2,'if two vars are solved the third should be solved as well');if(vA>=0&&vB>=0){// So vR>=0 as well
TRACE(' - All args are solved so removing constraint');ASSERT(vR>=0,'if two are solved then all three must be solved');ml_eliminate(ml,sumOffset,SIZEOF_CR_2);return true;}if(vA>=0){ASSERT(vB<0&&vR<0);if(min_plusWithSolvedArg(sumOffset,indexB,indexA,indexR,A,B,R,vA,'A','B')){return true;}}if(vB>=0){ASSERT(vA<0&&vR<0);if(min_plusWithSolvedArg(sumOffset,indexA,indexB,indexR,B,A,R,vB,'B','A')){return true;}}//
// TRACE(' - not only jumps');
// onlyJumps = false;
// pc = sumOffset + SIZEOF_CR_2;
return false;}function intersectAndAlias(indexFrom,indexTo,F,T){TRACE(' - intersectAndAlias; from index:',indexFrom,', to index:',indexTo,', F:',domain__debug(F),', T:',domain__debug(T),', FT:',domain__debug(domain_intersection(F,T)));ASSERT(typeof indexFrom==='number'&&indexFrom>=0,'indexfrom check');ASSERT(typeof indexTo==='number'&&indexTo>=0,'indexto check');ASSERT(F&&T,'should not receive empty domains... catch this at caller');ASSERT_NORDOM(F);ASSERT_NORDOM(T);ASSERT(getDomain(indexFrom)===F,'F should match domain');ASSERT(getDomain(indexTo)===T,'T should match domain');var FT=domain_intersection(F,T);if(F!==T){updateDomain(indexTo,FT,'intersectAndAlias');}if(FT&&!domain_isSolved(F))addAlias(indexFrom,indexTo);return FT;}function min_plusWithSolvedArg(sumOffset,indexY,indexX,indexR,X,Y,R,vX,nameX,nameY){TRACE(' - min_plusWithSolvedArg',nameX,nameY,domain__debug(R),'=',domain__debug(X),'+',domain__debug(Y));ASSERT(vX>=0,'caller should assert that X is solved');ASSERT(domain_isSolved(Y)+domain_isSolved(R)===0,'caller should assert that only one of the three is solved');if(vX===0){TRACE(' -',nameX,'= 0, so R =',nameY,'+ 0, so R ==',nameY,', morphing op to eq');// Morph R=0+Y to R==Y
intersectAndAlias(indexR,indexY,R,Y);ml_eliminate(ml,sumOffset,SIZEOF_CR_2);varChanged=true;return true;}// Try to morph R=x+Y to x=R==?Y when R has two values and Y is [0, 1] (because it cant be solved, so not 0 nor 1)
// R    = A + B           ->        B    = A ==? R    (when B is [01] and A is solved)
// [01] = 1 + [01]        ->        [01] = 1 !=? [0 1]
// [12] = 1 + [01]        ->        [01] = 1 !=? [1 2]
// [10 11] = 10 + [01]    ->        [01] = 10 !=? [10 11]
// rationale; B=bool means the solved value in A can only be A or
// A+1. when B=1 then R=A+1 and diff. when B=0 then R=A and eq.
// this only works when vX==max(R) because its either +0 or +1
if(domain_isBool(Y)&&domain_size(R)===2&&domain_min(R)===vX){TRACE(' - R = X + Y   ->   Y = X ==? R    (Y is [01] and X is solved to',vX,')');TRACE('   - R =',vX,'+',nameY,'to',nameY,'=',vX,domain_max(R)===vX?'==?':'!=? R');TRACE('   -',domain__debug(R),'=',vX,'+',domain__debug(Y),'to ',domain__debug(Y),'=',vX,'==?',domain__debug(R));TRACE(' - morphing R=A+B to B=A!=?R with A solved and B=[01] and size(R)=2');ml_cr2cr2(ml,sumOffset,2,ML_ISDIFF,indexR,indexX,indexY);varChanged=true;return true;}TRACE('   - min_plusWithSolvedArg did nothing');return false;}function min_minus(ml,offset){var offsetA=offset+1;var offsetB=offset+3;var offsetR=offset+5;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var indexR=readIndex(ml,offsetR);var A=getDomainFast(indexA);var B=getDomainFast(indexB);var R=getDomainFast(indexR);TRACE(' = min_minus',indexR,'=',indexA,'-',indexB,'   ->   ',domain__debug(R),'=',domain__debug(A),'-',domain__debug(B));if(!A||!B||!R)return;// C = A - B   -> A = B + C, B = C - A
// note: A - B = C   ==>   <loA - hiB, hiA - loB>
// but:  A + B = C   ==>   <loA + loB, hiA + hiB>   (so the lo/hi of B gets swapped!)
// keep in mind that any number oob <sub,sup> gets trimmed in either case.
// this trimming may affect "valid" numbers in the other domains so that needs back-propagation.
var ooA=A;var ooB=B;var ooR=R;var oA;var oB;var oR;var loops=0;do{++loops;TRACE(' - minus propagation step...',loops,domain__debug(R),'=',domain__debug(A),'+',domain__debug(B));oA=A;oB=B;oR=R;R=domain_intersection(R,domain_minus(A,B));A=domain_intersection(A,domain_plus(R,B));B=domain_intersection(B,domain_minus(A,R));}while(A!==oA||B!==oB||R!==oR);TRACE(' ->','A:',domain__debug(A),'B:',domain__debug(B),'R:',domain__debug(R));if(loops>1){if(A!==ooA)updateDomain(indexA,A,'minus A');if(B!==ooB)updateDomain(indexB,B,'minus B');if(R!==ooR)updateDomain(indexR,R,'minus R');if(!A||!B||!R)return;}ASSERT(domain_isSolved(A)+domain_isSolved(B)+domain_isSolved(R)!==2,'if two vars are solved the third should be solved as well');if(domain_isSolved(R)&&domain_isSolved(A)){// MinR==maxR&&minA==maxA
ASSERT(domain_isSolved(B),'if two are solved then all three must be solved');ml_eliminate(ml,offset,SIZEOF_VVV);}else if(domain_getValue(A)===0){// MaxA==0
TRACE(' - A=0 so B==R, aliasing R to B, eliminating constraint');intersectAndAlias(indexR,indexB,R,B);ml_eliminate(ml,offset,SIZEOF_VVV);varChanged=true;}else if(domain_getValue(B)===0){// MaxB==0
TRACE(' - B=0 so A==R, aliasing R to A, eliminating constraint');intersectAndAlias(indexR,indexA,R,A);ml_eliminate(ml,offset,SIZEOF_VVV);varChanged=true;}else{TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_VVV;}}function min_product_2(ml,offset){var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var offsetR=offset+OFFSET_C_R;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var indexR=readIndex(ml,offsetR);var A=getDomainFast(indexA);var B=getDomainFast(indexB);var R=getDomainFast(indexR);TRACE(' = min_product_2',indexR,'=',indexA,'*',indexB,'   ->   ',domain__debug(R),'=',domain__debug(A),'*',domain__debug(B));if(!A||!B||!R){TRACE(' - found empty domain, rejecting');return true;}// C = A * B, B = C / A, A = C / B
// note: A * B = C   ==>   <loA * loB, hiA * hiB>
// but:  A / B = C   ==>   <loA / hiB, hiA / loB> and has rounding/div-by-zero issues! instead use "inv-mul" tactic
// keep in mind that any number oob <sub,sup> gets pruned in either case. x/0=0
// when dividing "do the opposite" of integer multiplication. 5/4=[] because there is no int x st 4*x=5
// only outer bounds are evaluated here...
var ooA=A;var ooB=B;var ooR=R;var oA;var oB;var oR;var loops=0;do{++loops;TRACE(' - mul propagation step...',loops,domain__debug(R),'=',domain__debug(A),'*',domain__debug(B));oA=A;oB=B;oR=R;R=domain_intersection(R,domain_mul(A,B));A=domain_intersection(A,domain_invMul(R,B));B=domain_intersection(B,domain_invMul(R,A));}while(A!==oA||B!==oB||R!==oR);TRACE(' ->','A:',domain__debug(A),'B:',domain__debug(B),'R:',domain__debug(R));if(loops>1){if(A!==ooA)updateDomain(indexA,A,'mul A');if(B!==ooB)updateDomain(indexB,B,'mul B');if(R!==ooR)updateDomain(indexR,R,'mul R');if(!A||!B||!R){TRACE(' - found empty domain, rejecting');return true;}}ASSERT(domain_isSolved(A)+domain_isSolved(B)+domain_isSolved(R)!==2||domain_getValue(R)===0,'if two vars are solved the third should be solved as well unless R is 0');if(domain_isSolved(R)&&domain_isSolved(A)){TRACE(' - A B R all solved, eliminating constraint; ABR:',domain__debug(A),domain__debug(B),domain__debug(R));ASSERT(domain_isZero(R)||domain_isSolved(B),'if two are solved then all three must be solved or R is zero');ml_eliminate(ml,offset,SIZEOF_CR_2);return true;}TRACE('   - min_product_2 did not do anything');return false;}function min_div(ml,offset){var offsetA=offset+1;var offsetB=offset+3;var offsetR=offset+5;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var indexR=readIndex(ml,offsetR);var A=getDomainFast(indexA);var B=getDomainFast(indexB);var R=getDomainFast(indexR);TRACE(' = min_div',indexR,'=',indexA,'*',indexB,'   ->   ',domain__debug(R),'=',domain__debug(A),'/',domain__debug(B));if(!A||!B||!R)return;// R = A / B, A = R * B, B = A / R
// note:  A / B = C   ==>   <loA / hiB, hiA / loB> and has rounding/div-by-zero issues!
// but: A * B = C   ==>   <loA * loB, hiA * hiB> use "inv-div" tactic
// basically remove any value from the domains that can not lead to a valid integer result A/B=C
TRACE(' - div propagation step...',domain__debug(R),'=',domain__debug(A),'/',domain__debug(B));var oR=R;R=domain_intersection(R,domain_divby(A,B));TRACE(' ->','R:',domain__debug(R),'=','A:',domain__debug(A),'/','B:',domain__debug(B));if(R!==oR)updateDomain(indexR,R,'div R');if(!A||!B||!R)return;TRACE(' - domains;',domain__debug(R),'=',domain__debug(A),'/',domain__debug(B));if(domain_isSolved(B)&&domain_isSolved(A)){ASSERT(domain_isSolved(R),'if A and B are solved then R should be solved');ml_eliminate(ml,offset,SIZEOF_VVV);}else{TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_VVV;}}function min_isSame(ml,offset){var argCount=ml_dec16(ml,offset+1);TRACE(' = min_isSame, arg count:',argCount);if(argCount!==2){TRACE(' - argcount !== 2 so bailing for now');TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_C+argCount*2+2;return;}var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var offsetR=offset+OFFSET_C_R;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var indexR=readIndex(ml,offsetR);var A=getDomainFast(indexA);var B=getDomainFast(indexB);var R=getDomainFast(indexR);TRACE(' - min_isSame',indexR,'=',indexA,'==?',indexB,'   ->   ',domain__debug(R),'=',domain__debug(A),'==?',domain__debug(B));if(!A||!B||!R)return;if(indexA===indexB){TRACE(' - indexA == indexB so forcing R to 1 and removing constraint');var oR=R;R=domain_removeValue(R,0);if(R!==oR)updateDomain(indexR,R,'issame R: A!=B');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');ml_eliminate(ml,offset,SIZEOF_CR_2);return;}var vA=domain_getValue(A);var vB=domain_getValue(B);if(vA>=0&&vB>=0){TRACE(' - A and B are solved so we can determine R and eliminate the constraint');var _oR5=R;if(A===B){R=domain_removeValue(R,0);if(R!==_oR5)updateDomain(indexR,R,'issame R: A==B');}else{R=domain_intersectionValue(R,0);if(R!==_oR5)updateDomain(indexR,R,'issame R: A!=B');}ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');ml_eliminate(ml,offset,SIZEOF_CR_2);return;}// A and B arent both solved. check R
if(domain_isZero(R)){TRACE(' ! R=0 while A or B isnt solved, changing issame to diff and revisiting');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');ml_cr2c2(ml,offset,2,ML_DIFF,indexA,indexB);varChanged=true;return;}if(domain_hasNoZero(R)){TRACE(' ! R>=1 while A or B isnt solved, aliasing A to B, eliminating constraint');intersectAndAlias(indexA,indexB,A,B);ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');ml_eliminate(ml,offset,SIZEOF_CR_2);varChanged=true;return;}if(indexA===indexB){TRACE(' ! index A === index B so R should be truthy and we can eliminate the constraint');var _oR6=R;R=domain_removeValue(R,0);if(R!==_oR6)updateDomain(indexR,R,'issame R: A==B');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');ml_eliminate(ml,offset,SIZEOF_CR_2);return;}if(!domain_intersection(A,B)){TRACE(' - no overlap between',indexA,'and',indexB,' (',domain__debug(A),domain__debug(B),') so R becomes 0 and constraint is removed');var _oR7=R;R=domain_removeGtUnsafe(R,0);if(R!==_oR7)updateDomain(indexR,R,'issame; no overlap A B so R=0');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');ml_eliminate(ml,offset,SIZEOF_CR_2);return;}// There are some bool-domain-specific tricks we can apply
// TODO: shouldnt these also confirm that A and/or B are actually solved? and not -1
if(domain_isBool(R)){// If A=0|1, B=[0 1], R=[0 1] we can recompile this to DIFF or SAME
if(vA>=0&&vA<=1&&domain_isBool(B)){TRACE(' ! [01]=0|1==?[01] so morphing to n/eq and revisiting');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');// - A=0: 0==A=1, 1==A=0: B!=R
// - A=1: 0==A=0, 1==A=1: B==R
if(vA===0){TRACE('   - morphing constraint to diff');ml_cr2c2(ml,offset,2,ML_DIFF,indexB,indexR);}else{TRACE('   - aliasing R to B, eliminating constraint');intersectAndAlias(indexR,indexB,R,B);ml_eliminate(ml,offset,SIZEOF_CR_2);}varChanged=true;return;}// If A=[0 1], B=0|1, R=[0 1] we can recompile this to DIFF or SAME
if(vB>=0&&vB<=1&&domain_isBool(A)){TRACE(' ! [01]=[01]==?0|1 so morphing to n/eq and revisiting');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');// - B=0: 0==B=1, 1==B=0: A!=R
// - B=1: 0==B=0, 1==B=1: A==R
if(vB===0){TRACE('   - morphing constraint to diff');ml_cr2c2(ml,offset,2,ML_DIFF,indexA,indexR);}else{TRACE('   - aliasing R to A, eliminating constraint');intersectAndAlias(indexR,indexA,R,A);ml_eliminate(ml,offset,SIZEOF_CR_2);}varChanged=true;return;}// Note: cant do XNOR trick here because that only works on BOOLY vars
}if(vA===0){// This means R^B
TRACE(' ! A=0 so R^B, morphing to xor');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');ml_cr2c2(ml,offset,2,ML_XOR,indexR,indexB);varChanged=true;return;}if(vB===0){// This means R^A
TRACE(' ! B=0 so R^A, morphing to xor');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');ml_cr2c2(ml,offset,2,ML_XOR,indexR,indexA);varChanged=true;return;}TRACE(' ->',domain__debug(R),'=',domain__debug(A),'==?',domain__debug(B));ASSERT(domain_min(R)===0&&domain_max(R)>0,'R should be a booly at this point',domain__debug(R));TRACE(' - not only jumps...');ASSERT(ml_dec16(ml,offset+1)===2,'arg count should be 2 here');onlyJumps=false;pc=offset+SIZEOF_CR_2;}function min_isDiff(ml,offset){var argCount=ml_dec16(ml,offset+1);TRACE(' = min_isDiff; argCount=',argCount);if(argCount!==2){TRACE(' - count != 2, bailing for now');TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_C+argCount*2+2;return;}var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var offsetR=offset+OFFSET_C_R;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var indexR=readIndex(ml,offsetR);var A=getDomainFast(indexA);var B=getDomainFast(indexB);var R=getDomainFast(indexR);TRACE(' = min_isDiff',indexR,'=',indexA,'!=?',indexB,'   ->   ',domain__debug(R),'=',domain__debug(A),'!=?',domain__debug(B));if(!A||!B||!R)return;if(domain_isSolved(A)&&domain_isSolved(B)){TRACE(' - A and B are solved so we can determine R');var oR=R;if(A===B){R=domain_removeGtUnsafe(R,0);if(R!==oR)updateDomain(indexR,R,'isdiff R; A==B');}else{R=domain_removeValue(R,0);if(R!==oR)updateDomain(indexR,R,'isdiff R; A!=B');}ml_eliminate(ml,offset,SIZEOF_CR_2);return;}// R should be 0 if A==B. R should be >0 if A!==B
if(domain_isZero(R)){TRACE(' ! R=0, aliasing A to B, eliminating constraint');intersectAndAlias(indexA,indexB,A,B);ml_eliminate(ml,offset,SIZEOF_CR_2);varChanged=true;return;}if(domain_hasNoZero(R)){TRACE(' ! R>0, changing isdiff to diff and revisiting');ml_cr2c2(ml,offset,2,ML_DIFF,indexA,indexB);varChanged=true;return;}TRACE(' ->',domain__debug(R),'=',domain__debug(A),'!=?',domain__debug(B));TRACE(' - not only jumps...');ASSERT(domain_min(R)===0&&domain_max(R)>=1,'R should be boolable at this point');onlyJumps=false;pc=offset+SIZEOF_CR_2;}function min_isLt(ml,offset){var offsetA=offset+1;var offsetB=offset+3;var offsetR=offset+5;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var indexR=readIndex(ml,offsetR);var A=getDomainFast(indexA);var B=getDomainFast(indexB);var R=getDomainFast(indexR);TRACE(' = min_isLt',indexR,'=',indexA,'<?',indexB,'   ->   ',domain__debug(R),'=',domain__debug(A),'<?',domain__debug(B));if(!A||!B||!R)return;var oR=R;if(!domain_isSolved(R)){if(domain_max(A)<domain_min(B))R=domain_removeValue(R,0);else if(domain_min(A)>=domain_max(B))R=domain_removeGtUnsafe(R,0);}if(R!==oR&&!updateDomain(indexR,R,'islt; solving R because A < B or A >= B'))return;// If R is solved replace this isLt with an lt or "gt" and repeat.
// the appropriate op can then prune A and B accordingly.
// in this context, the inverse for lt is an lte with swapped args
if(domain_isZero(R)){TRACE(' ! result var solved to 0 so compiling an lte with swapped args in its place',indexB,'and',indexA);ml_vvv2c2(ml,offset,ML_LTE,indexB,indexA);varChanged=true;return;}if(domain_hasNoZero(R)){TRACE(' ! result var solved to 1 so compiling an lt in its place for',indexA,'and',indexB);ml_vvv2c2(ml,offset,ML_LT,indexA,indexB);varChanged=true;return;}if(domain_isZero(A)){TRACE(' - A=0 ! R=0<?B [01]=0<?[0 10] so if B=0 then R=0 and otherwise R=1 so xnor');TRACE_MORPH('R=0<?B','R!^B');ml_vvv2c2(ml,offset,ML_XNOR,indexR,indexB);varChanged=true;return;}if(domain_isZero(B)){TRACE(' - B=0 ! so thats just false');TRACE_MORPH('R=A<?0','R=0');ml_eliminate(ml,offset,SIZEOF_VVV);return;}TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_VVV;}function min_isLte(ml,offset){var offsetA=offset+1;var offsetB=offset+3;var offsetR=offset+5;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var indexR=readIndex(ml,offsetR);var A=getDomainFast(indexA);var B=getDomainFast(indexB);var R=getDomainFast(indexR);TRACE(' = min_isLte',indexR,'=',indexA,'<=?',indexB,'   ->   ',domain__debug(R),'=',domain__debug(A),'<=?',domain__debug(B));if(!A||!B||!R)return;var oR=R;TRACE(' - max(A) <= min(B)?',domain_max(A),'<=',domain_min(B));TRACE(' - min(A) > max(B)?',domain_min(A),'>',domain_max(B));// If R isn't resolved you can't really update A or B. so we don't.
if(domain_max(A)<=domain_min(B))R=domain_removeValue(R,0);else if(domain_min(A)>domain_max(B))R=domain_removeGtUnsafe(R,0);if(R!==oR){TRACE(' - updated R to',domain__debug(R));if(updateDomain(indexR,R,'islte; solving R because A and B are solved'))return;}var falsyR=domain_isZero(R);var truthyR=falsyR?false:domain_hasNoZero(R);// If R is resolved replace this isLte with an lte or "gte" and repeat.
// the appropriate op can then prune A and B accordingly.
// in this context, the logical inverse for lte is an lt with swapped args
if(falsyR){TRACE(' ! result var solved to 0 so compiling an lt with swapped args in its place',indexB,'and',indexA);ml_vvv2c2(ml,offset,ML_LT,indexB,indexA);varChanged=true;return;}if(truthyR){TRACE(' ! result var solved to 1 so compiling an lte in its place',indexA,'and',indexB);ml_vvv2c2(ml,offset,ML_LTE,indexA,indexB);varChanged=true;return;}// TODO: C=A<=?B   ->   [01] = [11] <=? [0 n]   ->   B !^ C
if(domain_isBool(R)&&domain_max(A)<=1&&domain_max(B)<=1){TRACE(' - R is bool and A and B are bool-bound so checking bool specific cases');ASSERT(!domain_isZero(A)||!domain_isBool(B),'this case should be caught by max<min checks above');if(domain_isBool(A)&&domain_isZero(B)){TRACE_MORPH('[01] = [01] <=? 0','A != R');ml_vvv2c2(ml,offset,ML_DIFF,indexA,indexR);varChanged=true;return;}if(domain_isBool(A)&&B===domain_createValue(1)){TRACE_MORPH('[01] = [01] <=? 1','A == R');intersectAndAlias(indexA,indexR,A,R);ml_eliminate(ml,offset,SIZEOF_VVV);varChanged=true;return;}if(domain_isBool(B)&&A===domain_createValue(1)){TRACE_MORPH('[01] = 1 <=? [01]','B == R');intersectAndAlias(indexB,indexR,B,R);ml_eliminate(ml,offset,SIZEOF_VVV);varChanged=true;return;}}TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_VVV;}function min_sum(ml,offset){var offsetCount=offset+1;var argCount=ml_dec16(ml,offsetCount);if(argCount===2){if(min_sum_2(ml,offset))return;// TOFIX: merge with this function...?
}var opSize=SIZEOF_C+argCount*2+2;var offsetArgs=offset+SIZEOF_C;var offsetR=offset+opSize-2;var indexR=readIndex(ml,offsetR);var R=getDomainFast(indexR);TRACE(' = min_sum',argCount,'x');TRACE('  - ml for this sum:',ml.slice(offset,offset+opSize).join(' '));TRACE('  - indexes:',indexR,'= sum(',[].concat(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}).join(', '),')');TRACE('  - domains:',domain__debug(R),'= sum(',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}).join(', '),')');if(!R)return;// A sum is basically a pyramid of plusses; (A+B)+(C+D) etc
// we loop back to front because we're splicing out vars while looping
// replace all constants by one constant
// prune the result var by intersecting it with the sum of the actual args
// in limited cases we can prune some of the arg values if the result forces
// that (if the result is max 10 then inputs can be pruned of any value > 10)
// we cant really do anything else
TRACE(' - first loop to get the sum of the args and constants');var sum=domain_createValue(0);var constants=0;var constantSum=0;for(var i=0;i<argCount;++i){var argOffset=offsetArgs+i*2;var index=readIndex(ml,argOffset);var domain=getDomainFast(index);TRACE('    - i=',i,', offset=',argOffset,', index=',index,'dom=',domain__debug(domain),', constants before:',constants,'sum of constant before:',constantSum);var v=domain_getValue(domain);if(v>=0){TRACE('      - this is a constant! value =',v);++constants;constantSum+=v;}sum=domain_plus(sum,domain);}TRACE(' - total sum=',domain__debug(sum),', constantSum=',constantSum,'with',constants,'constants. applying to R',domain__debug(R),'=>',domain__debug(domain_intersection(sum,R)));var oR=R;if(constants===argCount){// Bit of an edge case, though it can happen after multiple passes
TRACE(' - all sum args are constants so R must simply eq their sum, eliminating constraint');R=domain_intersectionValue(R,constantSum);if(R!==oR)updateDomain(indexR,R,'setting R to sum of constants');ml_eliminate(ml,offset,opSize);return;}R=domain_intersection(sum,R);TRACE(' - Updated R from',domain__debug(oR),'to',domain__debug(R));if(R!==oR&&updateDomain(indexR,R,'sum; updating R with outer bounds of its args;'))return;ASSERT(constantSum<=domain_max(R),'the sum of constants should not exceed R',constantSum);// Get R without constants to apply to var args
var subR=constantSum?domain_minus(R,domain_createValue(constantSum)):R;ASSERT(subR,'R-constants should not be empty',constantSum);TRACE(' - Now back propagating R to the args. R-constants:',domain__debug(subR));// Have to count constants and sum again because if a var occurs twice and this
// updates it to a constant, the second one would otherwise be missed as old.
constants=0;constantSum=0;// We can only trim bounds, not a full intersection (!)
// note that trimming may lead to more constants so dont eliminate them here (KIS)
var minSR=domain_min(subR);var maxSR=domain_max(subR);var varIndex1=-1;// Track non-constants for quick optimizations for one or two vars
var varIndex2=-1;for(var _i6=0;_i6<argCount;++_i6){var _index6=readIndex(ml,offsetArgs+_i6*2);var _domain8=getDomainFast(_index6);TRACE('    - i=',_i6,', index=',_index6,'dom=',domain__debug(_domain8));var _v=domain_getValue(_domain8);if(_v>=0){TRACE('      - old constant (or var that occurs twice and is now a new constant)',_v);++constants;constantSum+=_v;}else{// So the idea is that any value in an arg that could not even appear in R if all other args
// were zero, is a value that cant ever yield a solution. those are the values we trim here.
// this process takes constants in account (hence subR) because they don't have a choice.
var newDomain=domain_removeLtUnsafe(_domain8,minSR);newDomain=domain_removeGtUnsafe(_domain8,maxSR);if(newDomain!==_domain8&&updateDomain(_index6,newDomain,'plus arg; trim invalid values'))return;_v=domain_getValue(newDomain);if(_v>=0){TRACE('      - new constant',_v);// Arg is NOW also a constant
++constants;constantSum+=_v;}else if(varIndex1===-1){TRACE('      - first non-constant');varIndex1=_index6;}else if(varIndex2===-1){TRACE('      - second non-constant');varIndex2=_index6;}}}TRACE(' -> There are now',constants,'constants and',argCount-constants,'actual vars. Constants sum to',constantSum,', R=',domain__debug(R));TRACE(' -> Current args: ',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}).join(' '),' Result:',domain__debug(R));var valuesToSumLeft=argCount-constants+(constantSum===0?0:1);TRACE(' - args:',argCount,', constants:',constants,', valuesToSumLeft=',valuesToSumLeft,', constantSum=',constantSum,', varIndex1=',varIndex1,', varIndex2=',varIndex2);ASSERT(valuesToSumLeft>0||constantSum===0&&argCount===constants,'a sum with args cant have no values left here unless there are only zeroes (it implies empty domains and should incur early returns)',valuesToSumLeft);if(valuesToSumLeft===1){// ignore constants if they are zero!
TRACE(' - valuesToSumLeft = 1');ASSERT(varIndex2===-1,'we shouldnt have found a second var',varIndex2);ASSERT(constantSum>0?varIndex1===-1:varIndex1>=0,'with one value left it should either be a nonzero constant or an actual variable');if(constantSum>0){TRACE(' - Setting R to the sum of constants:',constantSum);var nR=domain_intersectionValue(R,constantSum);if(nR!==R)updateDomain(indexR,nR,'min_sum');}else{TRACE(' - Aliasing R to the single var',varIndex1);intersectAndAlias(indexR,varIndex1,R,getDomain(varIndex1,true));}TRACE(' - eliminating constraint now');ml_eliminate(ml,offset,opSize);}else if(constants>1||constants===1&&constantSum===0){TRACE(' - valuesToSumLeft > 1. Unable to morph but there are',constants,'constants to collapse to a single arg with value',constantSum);// There are constants and they did not morph or eliminate the constraint; consolidate them.
// loop backwards, remove all constants except one, move all other args back to compensate,
// only update the index of the last constant, update the count, compile a jump for the new trailing space
var newOpSize=opSize-(constants-(constantSum>0?1:0))*2;for(var _i7=argCount-1;_i7>=0&&constants;--_i7){var _argOffset=offsetArgs+_i7*2;var _index7=readIndex(ml,_argOffset);var _domain9=getDomainFast(_index7);TRACE('    - i=',_i7,', index=',_index7,'dom=',domain__debug(_domain9));if(domain_isSolved(_domain9)){if(constants===1&&constantSum!==0){// If constantSum>0 then we should encounter at least one constant to do this step on
TRACE('      - Overwriting the last constant at',_argOffset,'with an index for total constant value',constantSum);var newConstantIndex=addVar(undefined,constantSum,false,false,true);ml_enc16(ml,offsetArgs+_i7*2,newConstantIndex);break;// Probably not that useful, might even be bad to break here
}else{TRACE('      - found a constant to remove at',_argOffset,', moving further domains one space forward (from ',_i7+1,' / ',argCount,')',_i7+1<argCount);ASSERT(constants>0,'should have some constants');min_spliceArgSlow(ml,offsetArgs,argCount,_i7,true);// Also moves R
--argCount;}--constants;}}ml_enc16(ml,offset+1,argCount);// Now "blank out" the space of eliminated constants, they should be at the end of the op
ml_compileJumpSafe(ml,offset+newOpSize,opSize-newOpSize);TRACE(' - Cleaned up constant args');TRACE(' - ml for this sum now:',ml.slice(offset,offset+opSize).join(' '));}else{TRACE(' - unable to improve this sum at this time');TRACE(' - not only jumps...');onlyJumps=false;pc=offset+opSize;}}function min_spliceArgSlow(ml,argsOffset,argCount,argIndex,includingResult){TRACE('      - min_spliceArgSlow(',argsOffset,argCount,argIndex,includingResult,')');var toCopy=argCount;if(includingResult)++toCopy;for(var i=argIndex+1;i<toCopy;++i){var fromOffset=argsOffset+i*2;var toOffset=argsOffset+(i-1)*2;TRACE('        - moving',includingResult&&i===argCount-1?'R':'arg '+(i+(includingResult?0:1))+'/'+argCount,'at',fromOffset,'and',fromOffset+1,'moving to',toOffset,'and',toOffset+1);ml[toOffset]=ml[fromOffset];ml[toOffset+1]=ml[fromOffset+1];}}function min_product(ml,offset){var offsetCount=offset+1;var argCount=ml_dec16(ml,offsetCount);TRACE(' = min_product',argCount,'x');if(argCount===2){// TODO: merge this
if(min_product_2(ml,offset))return;}var opSize=SIZEOF_C+argCount*2+2;var offsetArgs=offset+SIZEOF_C;var offsetR=offset+opSize-2;var indexR=readIndex(ml,offsetR);var R=getDomainFast(indexR);TRACE('  - ml for this product:',ml.slice(offset,offset+opSize).join(' '));TRACE('  - indexes:',indexR,'= product(',[].concat(Array(argCount)).map(function(n,i){return readIndex(ml,offsetArgs+i*2);}).join(', '),')');TRACE('  - domains:',domain__debug(R),'= product(',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}).join(', '),')');if(!R)return;// A product is basically a pyramid of muls; (A*B)*(C*D) etc
// we loop back to front because we're splicing out vars while looping
// replace all constants by one constant
// prune the result var by intersecting it with the product of the actual args
// in limited cases we can prune some of the arg values if the result forces
// that (if the result is max 10 then inputs can be pruned of any value > 10)
// we cant really do anything else
TRACE(' - first loop to get the product of the args and constants');var product=domain_createValue(1);var constants=0;var constantProduct=1;for(var i=0;i<argCount;++i){var index=readIndex(ml,offsetArgs+i*2);var domain=getDomainFast(index);TRACE('    - i=',i,', index=',index,'dom=',domain__debug(domain),', constant product before:',constantProduct);var v=domain_getValue(domain);if(v>=0){++constants;constantProduct*=v;}product=domain_mul(product,domain);}TRACE(' - total product=',domain__debug(product),', constantProduct=',constantProduct,'with',constants,'constants. applying to R',domain__debug(R),'=',domain__debug(domain_intersection(product,R)));var oR=R;if(constants===argCount){// Bit of an edge case, though it can happen after multiple passes
TRACE(' - all product args are constants so R must simply eq their product, eliminating constraint;',domain__debug(R),'&',domain__debug(domain_createValue(constantProduct)),'=',domain__debug(domain_intersectionValue(R,constantProduct)));R=domain_intersectionValue(R,constantProduct);if(R!==oR)updateDomain(indexR,R,'setting R to product of constants');ml_eliminate(ml,offset,opSize);return;}if(constantProduct===0){// Edge case; if a constant produced zero then R will be zero and all args are free
TRACE(' - there was a zero constant so R=0 and all args are free, eliminating constraint');R=domain_intersectionValue(R,0);if(R!==oR)updateDomain(indexR,R,'setting R to zero');ml_eliminate(ml,offset,opSize);return;}R=domain_intersection(product,R);TRACE(' - Updated R from',domain__debug(oR),'to',domain__debug(R));if(R!==oR&&updateDomain(indexR,R,'product; updating R with outer bounds of its args;'))return;if(domain_isZero(R)){TRACE(' - R=0 so at least one arg must be 0, morph this to a nall');ml_enc8(ml,offset,ML_NALL);ml_compileJumpSafe(ml,offset+opSize-2,2);// Cuts off R
return;}// From this point R isnt zero and none of the args is solved to zero (but could still have it in their domain!)
// this simplifies certain decisions :)
ASSERT(domain_invMul(R,constantProduct),'R should be a multiple of the constant sum');ASSERT(domain_min(R)===0||Number.isFinite(domain_min(R)/constantProduct),'min(R) should be the result of the constants multiplied by other values, so dividing it should result in an integer');ASSERT(Number.isFinite(domain_max(R)/constantProduct),'max(R) should be the result of the constants multiplied by other values, so dividing it should result in an integer');// Get R without constants to apply to var args
var subR=constantProduct===1?R:domain_invMul(R,domain_createValue(constantProduct));ASSERT(subR,'R-constants should not be empty');TRACE(' - Now back propagating R to the args, R without constants:',domain__debug(subR));// We can only trim bounds, not a full intersection (!)
// note that trimming may lead to more constants so dont eliminate them here (KIS)
var minSR=domain_min(subR);var maxSR=domain_max(subR);var atLeastOneArgHadZero=false;// Any zero can blow up the result to 0, regardless of other args
var varIndex1=-1;// Track non-constants for quick optimizations for one or two vars
var varIndex2=-1;for(var _i8=0;_i8<argCount;++_i8){var _index8=readIndex(ml,offsetArgs+_i8*2);var _domain10=getDomainFast(_index8);TRACE('    - i=',_i8,', index=',_index8,'dom=',domain__debug(_domain10));var _v2=domain_getValue(_domain10);if(_v2===0)atLeastOneArgHadZero=true;// Probably not very useful
if(_v2<0){// ignore constants
if(!atLeastOneArgHadZero&&domain_hasZero(_domain10))atLeastOneArgHadZero=true;// So the idea is that any value in an arg that could not even appear in R if all other args
// were zero, is a value that cant ever yield a solution. those are the values we trim here.
// this process takes constants in account (hence subR) because they don't have a choice.
var newDomain=domain_removeLtUnsafe(_domain10,minSR);newDomain=domain_removeGtUnsafe(_domain10,maxSR);if(newDomain!==_domain10&&updateDomain(_index8,newDomain,'product arg; trim invalid values'))return;_v2=domain_getValue(newDomain);if(_v2>=0){TRACE('      - constant',_v2);// Arg is NOW also a constant
++constants;constantProduct+=_v2;}else if(varIndex1===-1){TRACE('      - first non-constant');varIndex1=_index8;}else if(varIndex2===-1){TRACE('      - second non-constant');varIndex2=_index8;}}}TRACE(' -> There are now',constants,'constants and',argCount-constants,'actual vars. Constants mul to',constantProduct,', R=',domain__debug(R));TRACE(' -> Current args: ',[].concat(Array(argCount)).map(function(n,i){return domain__debug(getDomainFast(readIndex(ml,offsetArgs+i*2)));}).join(' '),' Result:',domain__debug(R));var valuesToMulLeft=argCount-constants+(constantProduct===1?0:1);ASSERT(valuesToMulLeft>0||constantProduct===1&&argCount===constants,'a product with args cant have no values left here unless the constants are all 1 (it implies empty domains and should incur early returns)',valuesToMulLeft);if(valuesToMulLeft===1){// ignore constants if they are zero!
ASSERT(varIndex2===-1,'we shouldnt have found a second var',varIndex2);if(constantProduct!==1){TRACE(' - Setting R to the product of constants:',constantProduct,'(and a zero?',atLeastOneArgHadZero,')');if(atLeastOneArgHadZero){TRACE('   - Updating to a booly-pair:',domain__debug(domain_createBoolyPair(constantProduct)));var nR=domain_intersection(R,domain_createBoolyPair(constantProduct));if(nR!==R)updateDomain(indexR,nR,'min_product');}else{TRACE('   - Updating to a solved value:',constantProduct);var _nR=domain_intersectionValue(R,constantProduct);if(_nR!==R)updateDomain(indexR,_nR,'min_product');}}else{TRACE(' - Aliasing R to the single var',varIndex1);intersectAndAlias(indexR,varIndex1,R,getDomain(varIndex1,true));}TRACE(' - eliminating constraint now');ml_eliminate(ml,offset,opSize);}else if(constants>1){TRACE(' - Unable to morph but there are',constants,'constants to collapse to a single arg with value',constantProduct);// There are constants and they did not morph or eliminate the constraint; consolidate them.
// loop backwards, remove all constants except one, move all other args back to compensate,
// only update the index of the last constant, update the count, compile a jump for the new trailing space
var newOpSize=opSize-(constants-1)*2;for(var _i9=argCount-1;_i9>=0&&constants;--_i9){var _index9=readIndex(ml,offsetArgs+_i9*2);var _domain11=getDomainFast(_index9);TRACE('    - i=',_i9,', index=',_index9,'dom=',domain__debug(_domain11),', constant?',domain_isSolved(_domain11));if(domain_isSolved(_domain11)){if(constants===1){TRACE(' - Overwriting the last constant with an index for the total constant value');var _index10=addVar(undefined,constantProduct,false,false,true);ml_enc16(ml,offsetArgs+_i9*2,_index10);}else{TRACE('  - found a constant, moving further domains one space forward (from ',_i9+1,' / ',argCount,')',_i9+1<argCount);ASSERT(constants>0,'should have some constants');min_spliceArgSlow(ml,offsetArgs,argCount,_i9,true);// Move R as well
--argCount;}--constants;}}var emptySpace=opSize-newOpSize;TRACE(' - constants squashed, compiling new length (',argCount,') and a jump for the empty space (',emptySpace,'bytes )');ml_enc16(ml,offset+1,argCount);// Now "blank out" the space of eliminated constants, they should be at the end of the op
ASSERT(emptySpace>0,'since at least two constants were squashed there should be some bytes empty now');ml_compileJumpSafe(ml,offset+newOpSize,emptySpace);TRACE(' - ml for this product now:',ml.slice(offset,offset+opSize).join(' '));ASSERT(ml_validateSkeleton(ml,'min_product; case 3'));TRACE(' - Cleaned up constant args');}else{TRACE(' - not only jumps...');onlyJumps=false;pc=offset+opSize;}}function min_all(ml,offset){// Loop through the args and remove zero from all of them. then eliminate the constraint. it is an artifact.
var argCount=ml_dec16(ml,offset+1);TRACE(' = min_all',argCount,'x. removing zero from all args and eliminating constraint');for(var i=0;i<argCount;++i){var indexD=readIndex(ml,offset+SIZEOF_C+i*2);var oD=getDomain(indexD,true);var D=domain_removeValue(oD,0);if(oD!==D)updateDomain(indexD,D,'ALL D');}ml_eliminate(ml,offset,SIZEOF_C+argCount*2);}function min_some_2(ml,offset){var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' = min_some_2',indexA,'|',indexB,'   ->   ',domain__debug(A),'|',domain__debug(B));if(!A||!B)return true;if(indexA===indexB){TRACE(' - argcount=2 and indexA==indexB. so A>0 and eliminating constraint');var nA=domain_removeValue(A,0);if(A!==nA)updateDomain(indexA,nA,'A|A');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_isZero(A)){TRACE(' - A=0 so remove 0 from B',domain__debug(B),'->',domain__debug(domain_removeValue(B,0)));var oB=B;B=domain_removeValue(oB,0);if(B!==oB)updateDomain(indexB,B,'OR B');ml_eliminate(ml,offset,SIZEOF_C_2);return true;}if(domain_isZero(B)){TRACE(' - B=0 so remove 0 from A',domain__debug(A),'->',domain__debug(domain_removeValue(A,0)));var oA=A;A=domain_removeValue(oA,0);if(A!==oA)updateDomain(indexA,A,'OR A');ml_eliminate(ml,offset,SIZEOF_C_2);return true;}if(domain_hasNoZero(A)||domain_hasNoZero(B)){TRACE(' - at least A or B has no zero so remove constraint');ml_eliminate(ml,offset,SIZEOF_C_2);return true;}TRACE(' - min_some_2 changed nothing');return false;}function min_none(ml,offset){var argCount=ml_dec16(ml,offset+1);TRACE(' = min_none on',argCount,'vars. Setting them all to zero and removing constraint.');// This is an artifact and that is fine.
for(var i=0;i<argCount;++i){var indexD=readIndex(ml,offset+SIZEOF_C+i*2);var D=getDomain(indexD,true);var nD=domain_removeGtUnsafe(D,0);if(D!==nD)updateDomain(indexD,nD);}ml_eliminate(ml,offset,SIZEOF_C+argCount*2);}function min_xor(ml,offset){var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' = min_xor',indexA,'^',indexB,'   ->   ',domain__debug(A),'^',domain__debug(B));if(!A||!B)return;if(indexA===indexB){TRACE(' - index A === index B, x^x is falsum');setEmpty(indexA,'x^x');emptyDomain=true;return;}if(domain_isZero(A)){TRACE(' - A=0 so B must be >=1');var oB=B;B=domain_removeValue(B,0);if(B!==oB)updateDomain(indexB,B,'xor B>=1');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_isZero(B)){TRACE(' - B=0 so A must be >=1');var oA=A;A=domain_removeValue(A,0);if(A!==oA)updateDomain(indexA,A,'xor A>=1');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_hasNoZero(A)){TRACE(' - A>=1 so B must be 0');var _oB=B;B=domain_removeGtUnsafe(B,0);if(B!==_oB)updateDomain(indexB,B,'xor B=0');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_hasNoZero(B)){TRACE(' - B>=1 so A must be 0');var _oA2=A;A=domain_removeGtUnsafe(A,0);if(A!==_oA2)updateDomain(indexA,A,'xor A=0');ml_eliminate(ml,offset,SIZEOF_C_2);return;}TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_C_2;}function min_xnor(ml,offset){var argCount=ml_dec16(ml,offset+1);TRACE(' = min_xnor;',argCount,'args');if(argCount!==2){TRACE(' - xnor does not have 2 args, bailing for now');onlyJumps=false;pc=offset+SIZEOF_C+argCount*2;return;}var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' -',indexA,'!^',indexB,'   ->   ',domain__debug(A),'!^',domain__debug(B));if(!A||!B)return;ASSERT(ml_dec16(ml,offset+1)===2,'should have 2 args now');if(indexA===indexB){TRACE('   - oh... it was the same index. removing op');// Artifact, can happen
ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_isZero(A)){TRACE(' - A=0 so B must be 0');var oB=B;B=domain_removeGtUnsafe(B,0);if(B!==oB)updateDomain(indexB,B,'xnor B');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_isZero(B)){TRACE(' - B=0 so A must be 0');var oA=A;A=domain_removeGtUnsafe(A,0);if(A!==oA)updateDomain(indexA,A,'xnor A');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_hasNoZero(A)){TRACE(' - A>=1 so B must be >=1');var _oB2=B;B=domain_removeValue(B,0);if(B!==_oB2)updateDomain(indexB,B,'xnor B');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_hasNoZero(B)){TRACE(' - B>=1 so A must be >=1');var _oA3=A;A=domain_removeValue(A,0);if(A!==_oA3)updateDomain(indexA,A,'xnor A');ml_eliminate(ml,offset,SIZEOF_C_2);return;}// A and B are booly-pairs and equal then they can be considered an alias
if(A===B&&domain_size(A)===2){TRACE(' - A==B, size(A)=2 so size(B)=2 so max(A)==max(B) so under XNOR: A==B;',domain__debug(A),'!^',domain__debug(B));ASSERT(domain_size(B)===2,'If A==B and size(A)=2 then size(B) must also be 2 and they are regular aliases');addAlias(indexA,indexB);varChanged=true;return;// Note: cutter supports more cases for xnor pseudo alias, but that requires knowing BOOLY state for each var
}TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_C_2;}function min_imp(ml,offset){var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' = min_imp',indexA,'->',indexB,'   ->   ',domain__debug(A),'->',domain__debug(B));if(!A||!B)return;if(indexA===indexB){TRACE(' - same index, tautology, eliminating constraint');ml_eliminate(ml,offset,SIZEOF_C_2);return;}// If A is nonzero then B must be nonzero and constraint is solved
// if A is zero then constraint is solved
// if B is nonzero then constraint is solved
// if B is zero then A must be zero
if(domain_isZero(A)){TRACE(' - A is zero so just eliminate the constraint');// Eliminate constraint. B is irrelevant now.
ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_hasNoZero(A)){TRACE(' - A is nonzero so remove zero from B and eliminate the constraint');// Remove zero from B, eliminate constraint
var oB=B;B=domain_removeValue(oB,0);if(oB!==B)updateDomain(indexB,B,'IMP B');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_isZero(B)){TRACE(' - B is zero so set A to zero and eliminate the constraint');// Remove zero from A, eliminate constraint
var oA=A;A=domain_removeGtUnsafe(oA,0);if(oA!==A)updateDomain(indexA,A,'IMP A');ml_eliminate(ml,offset,SIZEOF_C_2);return;}if(domain_hasNoZero(B)){TRACE(' - B is nonzero so just eliminate the constraint');// Eliminate constraint. A is irrelevant now.
ml_eliminate(ml,offset,SIZEOF_C_2);return;}TRACE(' - not only jumps...');onlyJumps=false;pc=offset+SIZEOF_C_2;}function min_nimp(ml,offset){var offsetA=offset+OFFSET_C_A;var offsetB=offset+OFFSET_C_B;var indexA=readIndex(ml,offsetA);var indexB=readIndex(ml,offsetB);var A=getDomainFast(indexA);var B=getDomainFast(indexB);TRACE(' = min_nimp',indexA,'!->',indexB,'   ->   ',domain__debug(A),'!->',domain__debug(B));if(!A||!B)return;// Nimp is trivial since A must be nonzero and B must be zero
var oA=A;A=domain_removeValue(oA,0);if(oA!==A)updateDomain(indexA,A,'NIMP A');var oB=B;B=domain_removeGtUnsafe(oB,0);if(oB!==B)updateDomain(indexB,B,'NIMP B');TRACE(' ->',domain__debug(A),'!->',domain__debug(B));ml_eliminate(ml,offset,SIZEOF_C_2);}}var MAX_VAR_COUNT=0xffff;// 16bit
function $addVar($varTrie,$vars,$domains,$valdist,$constants,$addAlias,$getAnonCounter,$targeted,$targetsFrozen,name,domain,modifier,returnName,returnIndex,_throw){TRACE('addVar',name,domain,modifier,returnName?'(return name)':'',returnIndex?'(return index)':'');if(typeof name==='number'){domain=name;name=undefined;}if(typeof domain==='number'){domain=domain_createValue(domain);}else if(domain===undefined){domain=domain_createRange(SUB,SUP);}else{domain=domain_arrToSmallest(domain);}var newIndex;var v=domain_getValue(domain);if(typeof name==='string'||v<0||returnName){var wasAnon=name===undefined;if(wasAnon){name='__'+$getAnonCounter();TRACE(' - Adding anonymous var for dom=',domain,'->',name);}else if(name[0]==='_'&&name[1]==='_'&&name==='__'+parseInt(name.slice(2),10)){THROW('Dont use `__xxx` as var names, that structure is preserved for internal/anonymous var names');}newIndex=$vars.length;var prev=trie_add($varTrie,name,newIndex);if(prev>=0){if(_throw)_throw('CONSTRAINT_VARS_SHOULD_BE_DECLARED; Dont declare a var ['+name+'] after using it',name,prev);THROW('CONSTRAINT_VARS_SHOULD_BE_DECLARED; Dont declare a var ['+name+'] after using it',name,prev);}$vars.push(name);$domains.push(domain);$targeted[newIndex]=wasAnon?false:!$targetsFrozen();// Note: cannot override frozen values since all names must already be declared when using `@custom targets`
}// Note: if the name is string but domain is constant, we must add the name here as well and immediately alias it to a constant
if(v>=0&&!returnName){// TODO: we'll phase out the second condition here soon, but right now constants can still end up as regular vars
// constants are compiled slightly differently
var constIndex=value2index($constants,v);// Actual var names must be registered so they can be looked up, then immediately alias them to a constant
if(newIndex>=0)$addAlias(newIndex,constIndex,'$addvar');newIndex=constIndex;}if(modifier){$valdist[newIndex]=modifier;switch(modifier.valtype){case'list':case'max':case'mid':case'min':case'minMaxCycle':case'naive':case'splitMax':case'splitMin':break;default:if(_throw)_throw('implement me (var mod ['+modifier.valtype+'])');THROW('implement me (var mod ['+modifier.valtype+'])');}}// Deal with explicitly requested return values...
if(returnIndex)return newIndex;if(returnName)return name;}function $name2index($varTrie,$getAlias,name,skipAliasCheck,scanOnly){// ASSERT_LOG2('$name2index', name, skipAliasCheck);
var varIndex=trie_get($varTrie,name);if(!scanOnly&&varIndex<0)THROW('cant use this on constants or vars that have not (yet) been declared',name,varIndex);if(!skipAliasCheck&&varIndex>=0)varIndex=$getAlias(varIndex);return varIndex;}function $addAlias($domains,$valdist,$aliases,$solveStack,$constants,indexOld,indexNew,_origin){TRACE(' - $addAlias'+(_origin?' (from '+_origin+')':'')+': Mapping index = ',indexOld,'(',domain__debug($domains[indexOld]),') to index = ',indexNew,'(',indexNew>=$domains.length?'constant '+$constants[indexNew]:domain__debug($domains[indexNew]),')');ASSERT(typeof indexOld==='number','old index should be a number',indexOld);ASSERT(typeof indexNew==='number','new index should be a number',indexNew);if($aliases[indexOld]===indexNew){TRACE('ignore constant (re)assignments. we may want to handle this more efficiently in the future');return;}ASSERT(indexOld!==indexNew,'cant make an alias for itself',indexOld,indexNew,_origin);ASSERT(indexOld>=0&&indexOld<=$domains.length,'should be valid non-constant var index',indexOld,_origin);ASSERT(indexNew>=0,'should be valid var index',indexNew,_origin);// ASSERT($domains[indexOld], 'current domain shouldnt be empty', _origin);
ASSERT(!indexOld||indexOld-1 in $domains,'dont create gaps...',indexOld);$aliases[indexOld]=indexNew;$domains[indexOld]=false;// Mark as aliased. while this isnt a change itself, it could lead to some dedupes
if(!$valdist[indexNew]&&$valdist[indexOld])$valdist[indexNew]=$valdist[indexOld];// This shouldnt happen for constants...
}function $getAlias($aliases,index){var alias=$aliases[index];// TODO: is a trie faster compared to property misses?
while(alias!==undefined){TRACE_SILENT(' ($getAlias,',index,'=>',alias,')');if(alias===index)THROW('alias is itself?',alias,index);index=alias;alias=$aliases[index];}return index;}function $getDomain($domains,$constants,$getAlias,varIndex,skipAliasCheck){// ASSERT_LOG2('    - $getDomain', varIndex, skipAliasCheck, $constants[varIndex]);
if(!skipAliasCheck)varIndex=$getAlias(varIndex);ASSERT(varIndex===$getAlias(varIndex),'should only skip alias check when already certain the index is de-aliased',skipAliasCheck,varIndex,$getAlias(varIndex));// Constant var indexes start at the end of the max
var v=$constants[varIndex];if(v!==undefined){ASSERT(SUB<=v&&v<=SUP,'only SUB SUP values are valid here');return domain_createValue(v);}return $domains[varIndex];}function _assertSetDomain($domains,$constants,$getAlias,varIndex,domain,skipAliasCheck,explicitlyAllowNewValuesForPseudoAlias){// There's a bunch of stuff to assert. this function should not be called without ASSERT and should be eliminated as dead code by the minifier...
// args check
ASSERT(typeof varIndex==='number'&&varIndex>=0&&varIndex<=0xffff,'valid varindex',varIndex);ASSERT_NORDOM(domain);ASSERT(skipAliasCheck===undefined||skipAliasCheck===true||skipAliasCheck===false,'skipAliasCheck should be bool or undefined, was:',skipAliasCheck);var currentDomain=$getDomain($domains,$constants,$getAlias,varIndex,false);ASSERT(explicitlyAllowNewValuesForPseudoAlias||domain_intersection(currentDomain,domain)===domain,'should not introduce values into the domain that did not exist before',domain__debug(currentDomain),'->',domain__debug(domain));ASSERT(domain,'Should never be set to an empty domain, even with the explicitlyAllowNewValuesForPseudoAlias flag set');return true;}function $setDomain($domains,$constants,$aliases,$addAlias,$getAlias,varIndex,domain,skipAliasCheck,emptyHandled,explicitlyAllowNewValuesForPseudoAlias){TRACE_SILENT('  $setDomain, index=',varIndex,', from=',$constants[$getAlias(varIndex)]!==undefined?'constant '+$constants[$getAlias(varIndex)]:domain__debug($domains[$getAlias(varIndex)]),', to=',domain__debug(domain),', skipAliasCheck=',skipAliasCheck,', emptyHandled=',emptyHandled,', explicitlyAllowNewValuesForPseudoAlias=',explicitlyAllowNewValuesForPseudoAlias);if(!domain){if(emptyHandled)return;// Todo...
THROW('Cannot set to empty domain');}// Handle elsewhere!
ASSERT(_assertSetDomain($domains,$constants,$getAlias,varIndex,domain,skipAliasCheck,explicitlyAllowNewValuesForPseudoAlias));var value=domain_getValue(domain);if(value>=0)return _$setToConstant($constants,$addAlias,varIndex,value);return _$setToDomain($domains,$constants,$aliases,$getAlias,varIndex,domain,skipAliasCheck);}function _$setToConstant($constants,$addAlias,varIndex,value){// Check if this isnt already a constant.. this case should never happen
// note: pseudo aliases should prevent de-aliasing when finalizing the aliased var
if($constants[varIndex]!==undefined){// TOFIX: this needs to be handled better because a regular var may become mapped to a constant and if it becomes empty then this place cant deal/signal with that properly
if($constants[varIndex]===value)return;THROW('Cant update a constant (only to an empty domain, which should be handled differently)');}// Note: since the constant causes an alias anyways, we dont need to bother with alias lookup here
// note: call site should assert that the varindex domain actually contained the value!
var constantIndex=value2index($constants,value);$addAlias(varIndex,constantIndex,'$setDomain; because var is now constant '+value);}function _$setToDomain($domains,$constants,$aliases,$getAlias,varIndex,domain,skipAliasCheck){if(skipAliasCheck){// Either index was already unaliased by call site or this is solution generating. unalias the var index just in case.
$aliases[varIndex]=undefined;}else{varIndex=$getAlias(varIndex);}ASSERT(varIndex<$domains.length||$constants[varIndex]===domain,'either the var is not a constant or it is being updated to itself');if(varIndex<$domains.length){// TRACE_SILENT(' - now updating index', varIndex,'to', domain__debug(domain));
$domains[varIndex]=domain;// } else {
//  TRACE_SILENT(' - ignoring call, updating a constant to itself?', varIndex, '<', $domains.length, ', ', $constants[varIndex],' === ',domain);
}}function value2index(constants,value){// ASSERT_LOG2('value2index', value, '->', constants['v' + value]);
ASSERT(value>=SUB&&value<=SUP,'value is OOB',value);var constantIndex=constants['v'+value];if(constantIndex>=0)return constantIndex;constantIndex=MAX_VAR_COUNT-constants._count++;constants['v'+value]=constantIndex;constants[constantIndex]=value;return constantIndex;}function problem_create(){var anonCounter=0;var varNames=[];var varTrie=trie_create();// Name -> index (in varNames)
var domains=[];var constants={_count:0};var aliases={};var solveStack=[];var leafs=[];// Per-var distribution overrides. all vars default to the global distribution setting if set and otherwise naive
var valdist=[];// 1:1 with varNames. contains json objects {valtype: 'name', ...}
var addAlias=$addAlias.bind(undefined,domains,valdist,aliases,solveStack,constants);var getAlias=$getAlias.bind(undefined,aliases);var name2index=$name2index.bind(undefined,varTrie,getAlias);var targeted=[];var targetsFrozen=false;// False once a targets directive is parsed
return {varTrie:varTrie,varNames:varNames,domains:domains,valdist:valdist,aliases:aliases,solveStack:solveStack,leafs:leafs,input:{// See dsl2ml
varstrat:'default',valstrat:'default',dsl:''},ml:undefined,// Uint8Array
mapping:undefined,// Var index in (this) child to var index of parent
addVar:$addVar.bind(undefined,varTrie,varNames,domains,valdist,constants,addAlias,function(_){return ++anonCounter;},targeted,function(_){return targetsFrozen;}),getVar:name2index,// Deprecated
name2index:name2index,addAlias:addAlias,getAlias:getAlias,getDomain:$getDomain.bind(undefined,domains,constants,getAlias),setDomain:$setDomain.bind(undefined,domains,constants,aliases,addAlias,getAlias),isConstant:function isConstant(index){return constants[index]!==undefined;},freezeTargets:function freezeTargets(varNames){if(targetsFrozen)THROW('Only one `targets` directive supported');targetsFrozen=true;targeted.fill(false);varNames.forEach(function(name){return targeted[name2index(name,true)]=true;});},targeted:targeted// For each element in $domains; true if targeted, false if not targeted
};}// Import dsl
/**
 * @param {string} dsl The input problem
 * @param {Function} solver The function to brute force the remainder of the problem after FDP reduces it, not called if already solved. Called with `solver(dsl, options)`.
 * @param {Object} fdpOptions
 * @property {boolean} [fdpOptions.singleCycle=false] Only do a single-nonloop minimization step before solving? Can be faster but sloppier.
 * @property {boolean} [fdpOptions.repeatUntilStable=true] Keep calling minimize/cutter per cycle until nothing changes?
 * @property {boolean} [fdpOptions.debugDsl=false] Enable debug output (adds lots of comments about vars)
 * @property {boolean} [fdpOptions.hashNames=true] Replace original varNames with `$<base36(index)>$` of their index in the output
 * @property {boolean} [fdpOptions.indexNames=false] Replace original varNames with `_<index>_` in the output
 * @property {boolean} [fdpOptions.groupedConstraints=true] When debugging only, add all constraints below a var decl where that var is used
 * @property {boolean} [fdpOptions.flattened=false] Solve all vars in the solution even if there are multiple open fdpOptions left
 * @property {boolean|Function} [fdpOptions.printDslBefore] Print the dsl after parsing it but before crunching it.
 * @property {boolean|Function} [fdpOptions.printDslAfter] Print the dsl after crunching it but before calling FD on it
 * @param {Object} solverOptions Passed on to the solver directly
 */function solve(dsl,solver,fdpOptions,solverOptions){if(fdpOptions===void 0){fdpOptions={};}if(solverOptions===void 0){solverOptions={log:1,vars:'all'};}ASSERT(typeof dsl==='string');ASSERT(typeof fdpOptions!=='function','confirming this isnt the old solver param');// fdpOptions.hashNames = false;
// fdpOptions.repeatUntilStable = true;
// fdpOptions.debugDsl = false;
// fdpOptions.singleCycle = true;
// fdpOptions.indexNames = true;
// fdpOptions.groupedConstraints = true;
if(solverOptions.logger)setTerm(solverOptions.logger);var term=getTerm();term.log('<pre>');term.time('</pre>');var r=_preSolver(dsl,solver,fdpOptions,solverOptions);term.timeEnd('</pre>');return r;}function _preSolver(dsl,solver,options,solveOptions){ASSERT(typeof dsl==='string');ASSERT(typeof options!=='function','making sure this isnt the old Solver param');var term=getTerm();term.log('<pre-solving>');term.time('</pre-solving total>');var _options$hashNames=options.hashNames,hashNames=_options$hashNames===void 0?true:_options$hashNames,_options$debugDsl=options.debugDsl,debugDsl=_options$debugDsl===void 0?false:_options$debugDsl,_options$indexNames=options.indexNames,indexNames=_options$indexNames===void 0?false:_options$indexNames,_options$groupedConst=options.groupedConstraints,groupedConstraints=_options$groupedConst===void 0?true:_options$groupedConst;if(options.hashNames===undefined)options.hashNames=hashNames;if(options.debugDsl===undefined)options.debugDsl=debugDsl;if(options.indexNames===undefined)options.indexNames=indexNames;if(options.groupedConstraints===undefined)options.groupedConstraints=groupedConstraints;var problem=problem_create();var varNames=problem.varNames,domains=problem.domains;TRACE(dsl.slice(0,1000)+(dsl.length>1000?' ... <trimmed>':'')+'\n');var state=crunch(dsl,problem,options);var bounty;var betweenDsl;if(state===$REJECTED){TRACE('Skipping ml2dsl because problem rejected and bounty/ml2dsl dont handle empty domains well');}else{term.time('ml->dsl');bounty=bounty_collect(problem.ml,problem);betweenDsl=ml2dsl(problem.ml,problem,bounty,{debugDsl:false,hashNames:true});// Use default generator settings for dsl to pass on to FD
term.timeEnd('ml->dsl');}term.timeEnd('</pre-solving total>');if(state===$REJECTED)term.log('REJECTED');// term.log(domains.map((d,i) => i+':'+problem.targeted[i]).join(', '));
// confirm domains has no gaps...
// term.log(problem.domains)
// for (let i=0; i<domains.length; ++i) {
//  ASSERT(i in domains, 'no gaps');
//  ASSERT(domains[i] !== undefined, 'no pseudo gaps');
// }
// cutter cant reject, only reduce. may eliminate the last standing constraints.
var solution;if(state===$SOLVED||state!==$REJECTED&&!ml_hasConstraint(problem.ml)){term.time('- generating early solution');solution=createSolution(problem,null,options);term.timeEnd('- generating early solution');}if(state!==$REJECTED&&(betweenDsl&&betweenDsl.length<1000||options.printDslAfter)){var dslForLogging=ml2dsl(problem.ml,problem,bounty,options);var s='\nResult dsl (debugDsl='+debugDsl+', hashNames='+hashNames+', indexNames='+indexNames+'):\n'+dslForLogging;if(typeof options.printDslAfter==='function'){options.printDslAfter(s);}else{term.log('#### <DSL> after crunching before FD');term.log(s);term.log('#### </DSL>');}}if(solution){term.log('<solved without fdq>');return solution;}if(state===$REJECTED){term.log('<rejected without fdq>');TRACE('problem rejected!');return 'rejected';}if(problem.input.varstrat==='throw'){// The stats are for tests. dist will never even have this so this should be fine.
// it's very difficult to ensure optimizations work properly otherwise
if(process.env.NODE_ENV!=='production'){ASSERT(false,"Forcing a choice with strat=throw; debug: "+varNames.length+" vars, "+ml_countConstraints(problem.ml)+" constraints, current domain state: "+domains.map(function(d,i){return i+':'+varNames[i]+':'+domain__debug(d).replace(/[a-z()\[\]]/g,'');}).join(': ')+" ("+problem.leafs.length+" leafs) ops: "+ml_getOpList(problem.ml)+" #");}THROW('Forcing a choice with strat=throw');}term.log('\n\nSolving remaining problem through fdq now...');term.log('<FD>');term.time('</FD>');var fdSolution=solver(betweenDsl,solveOptions);term.timeEnd('</FD>');term.log('\n');// Now merge the results from fdSolution to construct the final solution
// we need to map the vars from the dsl back to the original names.
// "our" vars will be constructed like `$<hash>$` where the hash simply
// means "our" var index as base36. So all we need to do is remove the
// dollar signs and parseInt as base 36. Ignore all other vars as they
// are temporary vars generated by fdq. We should not see them
// anymore once we support targeted vars.
term.log('fd result:',typeof fdSolution==='string'?fdSolution:'SOLVED');TRACE('fdSolution = ',fdSolution?Object.keys(fdSolution).length>100?'<supressed; too big>':fdSolution:'REJECT');if(fdSolution&&typeof fdSolution!=='string'){term.log('<solved after fdq>');if(Array.isArray(fdSolution)){return fdSolution.map(function(sol){return createSolution(problem,sol,options);});}return createSolution(problem,fdSolution,options);}term.log('<'+fdSolution+' during fdq>');TRACE('problem rejected!');return 'rejected';}function crunch(dsl,problem,options){if(options===void 0){options={};}var _options=options,_options$singleCycle=_options.singleCycle,singleCycle=_options$singleCycle===void 0?false:_options$singleCycle,_options$repeatUntilS=_options.repeatUntilStable,repeatUntilStable=_options$repeatUntilS===void 0?true:_options$repeatUntilS;var varNames=problem.varNames,domains=problem.domains,solveStack=problem.solveStack,$addVar=problem.$addVar,$getVar=problem.$getVar,$addAlias=problem.$addAlias,$getAlias=problem.$getAlias;var term=getTerm();term.time('- dsl->ml');dsl2ml(dsl,problem);var ml=problem.ml;term.timeEnd('- dsl->ml');term.log('Parsed dsl ('+dsl.length+' bytes) into ml ('+ml.length+' bytes)');if(options.printDslBefore){var bounty=bounty_collect(problem.ml,problem);var predsl=ml2dsl(ml,problem,bounty,options);if(typeof options.printDslBefore==='function'){options.printDslBefore(predsl);}else{term.log('#### <DSL> after parsing before crunching');term.log(predsl);term.log('#### </DSL>');}}var state;if(singleCycle){// Only single cycle? usually most dramatic reduction. only runs a single loop of every step.
term.time('- first minimizer cycle (single loop)');state=min_run(ml,problem,domains,varNames,true,!repeatUntilStable);term.timeEnd('- first minimizer cycle (single loop)');TRACE('First minimize pass result:',state);if(state!==$REJECTED){term.time('- deduper cycle #');var deduperAddedAlias=deduper(ml,problem);term.timeEnd('- deduper cycle #');if(deduperAddedAlias>=0){term.time('- cutter cycle #');cutter(ml,problem,!repeatUntilStable);term.timeEnd('- cutter cycle #');}}}else{// Multiple cycles? more expensive, may not be worth the gains
var runLoops=0;term.time('- all run cycles');do{TRACE('run loop...');state=run_cycle(ml,$getVar,$addVar,domains,varNames,$addAlias,$getAlias,solveStack,runLoops++,problem);}while(state===$CHANGED);term.timeEnd('- all run cycles');}return state;}function run_cycle(ml,getVar,addVar,domains,vars,addAlias,getAlias,solveStack,runLoops,problem){var term=getTerm();term.time('- run_cycle #'+runLoops);term.time('- minimizer cycle #'+runLoops);var state=min_run(ml,problem,domains,vars,runLoops===0);term.timeEnd('- minimizer cycle #'+runLoops);if(state===$SOLVED)return state;if(state===$REJECTED)return state;term.time('- deduper cycle #'+runLoops);var deduperAddedAlias=deduper(ml,problem);term.timeEnd('- deduper cycle #'+runLoops);if(deduperAddedAlias<0){state=$REJECTED;}else{term.time('- cutter cycle #'+runLoops);var cutLoops=cutter(ml,problem,false);term.timeEnd('- cutter cycle #'+runLoops);if(cutLoops>1||deduperAddedAlias)state=$CHANGED;else if(cutLoops<0)state=$REJECTED;else{ASSERT(state===$CHANGED||state===$STABLE,'minimize state should be either stable or changed here');}}term.timeEnd('- run_cycle #'+runLoops);return state;}function createSolution(problem,fdSolution,options,max){getTerm().time('createSolution()');var _options$flattened=options.flattened,flattened=_options$flattened===void 0?false:_options$flattened;var varNames=problem.varNames,domains=problem.domains,solveStack=problem.solveStack,getAlias=problem.getAlias,targeted=problem.targeted;var _getDomainWithoutFd=problem.getDomain;var _setDomainWithoutFd=problem.setDomain;function getDomainFromSolverOrLocal(index,skipAliasCheck){if(!skipAliasCheck)index=getAlias(index);if(fdSolution){var key='$'+index.toString(36)+'$';var fdval=fdSolution[key];if(typeof fdval==='number'){return domain_createValue(fdval);}if(fdval!==undefined){ASSERT(fdval instanceof Array,'expecting fdq to only create solutions as arrays or numbers',fdval);return domain_arrToSmallest(fdval);}// else the var was already solved by fd2 so just read from our local domains array
}return _getDomainWithoutFd(index,true);}function setDomainInFdAndLocal(index,domain,skipAliasCheck,forPseudoAlias){TRACE(' - solveStackSetDomain, index=',index,', domain=',domain__debug(domain),', skipAliasCheck=',skipAliasCheck,', forPseudoAlias=',forPseudoAlias);ASSERT(domain,'should not set an empty domain at this point');ASSERT(forPseudoAlias||domain_intersection(_getDomainWithoutFd(index),domain)===domain,'should not introduce values into the domain that did not exist before unless for xnor pseudo-booly; current:',domain__debug(_getDomainWithoutFd(index)),', updating to:',domain__debug(domain),'varIndex:',index);if(!skipAliasCheck)index=getAlias(index);_setDomainWithoutFd(index,domain,true,false,forPseudoAlias);// Update the FD result AND the local data structure to reflect this new domain
// the FD value rules when checking intersection with the new domain
// (but we can just use the getter abstraction here and overwrite regardless)
if(fdSolution){var key='$'+index.toString(36)+'$';if(fdSolution[key]!==undefined){var v=domain_getValue(domain);if(v>=0)fdSolution[key]=v;else fdSolution[key]=domain_toArr(domain);}}}function force(varIndex,pseudoDomain){ASSERT(typeof varIndex==='number'&&varIndex>=0&&varIndex<=0xffff,'valid var to solve',varIndex);var finalVarIndex=getAlias(varIndex);var domain=getDomainFromSolverOrLocal(finalVarIndex,true);// NOTE: this will take from fdSolution if it contains a value, otherwise from local domains
ASSERT_NORDOM(domain);ASSERT(pseudoDomain===undefined||domain_intersection(pseudoDomain,domain)===pseudoDomain,'pseudoDomain should not introduce new values');var v=domain_getValue(domain);if(v<0){if(pseudoDomain){TRACE('   - force() using pseudo domain',domain__debug(pseudoDomain),'instead of actual domain',domain__debug(domain));domain=pseudoDomain;}TRACE('   - forcing index',varIndex,'(final index=',finalVarIndex,') to min('+domain__debug(domain)+'):',domain_min(domain));var dist=problem.valdist[varIndex];if(dist){ASSERT(typeof dist==='object','dist is an object');ASSERT(typeof dist.valtype==='string','dist object should have a name');// TODO: rename valtype to "name"? or maybe keep it this way because easier to search for anyways. *shrug*
switch(dist.valtype){case'list':ASSERT(Array.isArray(dist.list),'lists should have a prio');dist.list.some(function(w){return domain_containsValue(domain,w)&&(v=w)>=0;});if(v<0)v=domain_min(domain);// None of the prioritized values still exist so just pick one
break;case'max':v=domain_max(domain);break;case'min':case'naive':v=domain_min(domain);break;case'mid':v=domain_middleElement(domain);break;case'markov':case'minMaxCycle':case'splitMax':case'splitMin':THROW('implement me (var mod) ['+dist.valtype+']');v=domain_min(domain);break;default:THROW('Unknown dist name: ['+dist.valtype+']',dist);}}else{// Just an arbitrary choice then
v=domain_min(domain);}ASSERT(domain_containsValue(domain,v),'force() should not introduce new values');setDomainInFdAndLocal(varIndex,domain_createValue(v),true);}return v;}TRACE('\n# createSolution(), solveStack.length=',solveStack.length,', using fdSolution?',!!fdSolution);TRACE(' - fdSolution:',domains.length<50?INSPECT(fdSolution).replace(/\n/g,''):'<big>');TRACE(' - domains:',domains.length<50?domains.map(function(_,i){return '{index='+i+',name='+problem.varNames[i]+','+domain__debug(problem.getDomain(i))+'}';}).join(', '):'<big>');ASSERT(domains.length<50||!void TRACE('domains before; index, unaliased, aliased, fdSolution (if any):\n',domains.map(function(d,i){return i+': '+domain__debug(d)+', '+domain__debug(_getDomainWithoutFd(i))+', '+domain__debug(getDomainFromSolverOrLocal(i));})));function flushSolveStack(){TRACE('Flushing solve stack...',solveStack.length?'':' and done! (solve stack was empty)');var rev=solveStack.reverse();for(var i=0;i<rev.length;++i){var f=rev[i];TRACE('- solve stack entry',i);f(domains,force,getDomainFromSolverOrLocal,setDomainInFdAndLocal);TRACE(domains.length<50?' - domains now: '+domains.map(function(_,i){return '{index='+i+',name='+problem.varNames[i]+','+domain__debug(problem.getDomain(i))+'}';}).join(', '):'');}ASSERT(domains.length<50||!void TRACE('domains after solve stack flush; index, unaliased, aliased, fdSolution (if any):\n',domains.map(function(d,i){return i+': '+domain__debug(d)+', '+domain__debug(_getDomainWithoutFd(i))+', '+domain__debug(getDomainFromSolverOrLocal(i));})));}flushSolveStack();ASSERT(!void domains.forEach(function(d,i){return ASSERT(domains[i]===false?getAlias(i)!==i:ASSERT_NORDOM(d),'domains should be aliased or nordom at this point','index='+i,', alias=',getAlias(i),', domain='+domain__debug(d),domains);}));function flushValDists(){TRACE('\n# flushValDists: One last loop through all vars to force those with a valdist');for(var i=0;i<domains.length;++i){if(flattened||problem.valdist[i]){// Can ignore FD here (I think)
_setDomainWithoutFd(i,domain_createValue(force(i)),true);}else{// TOFIX: make this more efficient... (cache the domain somehow)
var domain=getDomainFromSolverOrLocal(i);var v=domain_getValue(domain);if(v>=0){// Can ignore FD here (I think)
_setDomainWithoutFd(i,domain,true);}}}}flushValDists();TRACE('\n');ASSERT(domains.length<50||!void TRACE('domains after dist pops; index, unaliased, aliased, fdSolution (if any):\n',domains.map(function(d,i){return i+': '+domain__debug(d)+', '+domain__debug(_getDomainWithoutFd(i))+', '+domain__debug(getDomainFromSolverOrLocal(i));})));ASSERT(!void domains.forEach(function(d,i){return ASSERT(d===false?getAlias(i)!==i:flattened?domain_getValue(d)>=0:ASSERT_NORDOM(d),'domains should be aliased or nordom at this point','index='+i,', alias=',getAlias(i),'domain='+domain__debug(d),domains);}));function flushAliases(){TRACE(' - syncing aliases');for(var i=0;i<domains.length;++i){var d=domains[i];if(d===false){var a=getAlias(i);var v=force(a);TRACE('Forcing',i,'and',a,'to be equal because they are aliased, resulting value=',v);// Can ignore FD here (I think)
_setDomainWithoutFd(i,domain_createValue(v),true);}}}flushAliases();ASSERT(domains.length<50||!void TRACE('domains after dealiasing; index, unaliased, aliased, fdSolution (if any):\n',domains.map(function(d,i){return i+': '+domain__debug(d)+', '+domain__debug(_getDomainWithoutFd(i))+', '+domain__debug(getDomainFromSolverOrLocal(i));})));function generateFinalSolution(){TRACE(' - generating regular FINAL solution',flattened);var solution={};for(var index=0;index<varNames.length;++index){if(targeted[index]){var name=varNames[index];var d=getDomainFromSolverOrLocal(index);var v=domain_getValue(d);if(v>=0){d=v;}else if(flattened){ASSERT(!problem.valdist[index],'only vars without valdist may not be solved at this point');d=domain_min(d);}else{d=domain_toArr(d);}solution[name]=d;}}return solution;}var solution=generateFinalSolution();getTerm().timeEnd('createSolution()');TRACE(' -> createSolution results in:',domains.length>100?'<supressed; too many vars ('+domains.length+')>':solution);return solution;}var fdp={solve:solve};

setTerm({
  log: _doNothing,
  warn: _doNothing,
  error: _doNothing,
  trace: _doNothing,
  time: _doNothing,
  timeEnd: _doNothing
});
var fdoDefaults = {
  log: 0,
  logger: _doNothing,
  beforeSpace: _doNothing,
  afterSpace: _doNothing,
  _debug: false,
  _debugConfig: false,
  _debugSpace: false,
  _debugSolver: false
};
var fdpDefaults = {
  log: 0,
  debugDsl: false,
  printDslBefore: _doNothing,
  printDslAfter: _doNothing,
  indexNames: false,
  hashNames: false,
  groupConstraints: true
};

function _doNothing() {
  return false;
}

function solve$1(dsl, fdpOptions, fdoOptions) {
  if (fdpOptions === void 0) {
    fdpOptions = {};
  }

  if (fdoOptions === void 0) {
    fdoOptions = {};
  }

  return fdp.solve(dsl, FDO.solve, _objectSpread({}, fdpDefaults, fdpOptions), _objectSpread({}, fdoDefaults, fdoOptions));
}

var fdq = {
  FDO: FDO,
  FDP: fdp,
  setTerm: setTerm,
  solve: solve$1
};

export default fdq;
