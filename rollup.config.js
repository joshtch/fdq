import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

export default [
  // UMD Development
  {
    input: 'src/fdq.js',
    output: {
      file: 'dist/fdq.debug.js',
      format: 'umd',
      name: 'FDQ',
      indent: false,
      sourceMap: true,
    },
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      babel(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    ],
  },

  // UMD Production
  {
    input: 'src/fdq.js',
    output: {
      file: 'dist/fdq.min.js',
      format: 'umd',
      name: 'FDQ',
      indent: false,
    },
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      babel(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser({
        compress: {
          pure_funcs: [
            // fdlib

            // assert
            'ASSERT',
            'ASSERT_ANYDOM',
            'ASSERT_ARRDOM',
            'ASSERT_BITDOM',
            'ASSERT_LOG',
            'ASSERT_NORDOM',
            'ASSERT_NUMDOM',
            'ASSERT_SET_LOG',
            'ASSERT_SOLDOM',
            'ASSERT_STRDOM',
            'ASSERT_VARDOMS_SLOW',
            'TRACE',
            'TRACE_MORPH',
            'TRACE_SILENT',
            'isTracing',
            'setTracing',

            // domain_lib
            'domain_arr_max',
            'domain_arrToStr',
            'domain_str_decodeValue',
            'domain_str_getValue',
            'domain_bit_getValue',
            'domain_sol_getValue',
            'domain_num_createRange',
            'domain_createEmpty',
            'domain_createValue',
            'domain_str_decodeValue',
            'domain_toList',
            'domain_max',
            'domain_size',
            'domain_min',
            'domain_isSolved',
            'domain_isZero',
            'domain_hasNoZero',
            'domain_hasZero',
            'domain_isBool',
            'domain_isBooly',
            'domain_sharesNoElements',
            'domain_createRange',
            'domain_createRangeTrimmed',
            'domain_toArr',
            'domain_toStr',
            'domain_toSmallest',
            'domain_anyToSmallest',
            'domain_arrToSmallest',
            'domain_str_closeGaps',
            'domain_containsValue',
            'domain_num_containsValue',
            'domain_createBoolyPair',
            'domain__debug',
            'domain_getFirstIntersectingValue',
            'domain_getValue',
            'domain_intersection',
            'domain_intersectionValue',
            'domain_isBoolyPair',
            'domain_isEmpty',
            'domain_numToStr',
            'domain_removeGte',
            'domain_removeGtUnsafe',
            'domain_removeLte',
            'domain_removeLtUnsafe', // "Unsafe" here just means input is not validated first
            'domain_removeValue',
            'domain_resolveAsBooly',
            'domain_str_encodeRange',
            'domain_minus',
            'domain_plus',

            // helpers
            'INSPECT',
            'getTerm',

            // trie
            'trie_create',
            '_trie_debug',
            'trie_get',
            'trie_getNum',
            'trie_getValueBitsize',
            'trie_has',
            'trie_hasNum',

            // fdo-specific

            'domain_str_rangeIndexOf',
            '_domain_str_mergeOverlappingRanges',
            '_domain_str_quickSortRanges',
            'distribution_varByList',
            'distribution_varByMax',
            'distribution_varByMarkov',
            'distribution_varByMin',
            'distribution_varByMinSize',
            'distribution_varFallback',
            'distribution_valueByList',
            'distribution_valueByMarkov',
            'distribution_valueByMax',
            'distribution_valueByMid',
            'distribution_valueByMin',
            'distribution_valueByMinMaxCycle',
            'distribution_valueBySplitMax',
            'distribution_valueBySplitMin',
            '_distribute_getNextDomainForVar',
            // distribution/*
            'distribution_varByList',
            'distribution_varByMax',
            'distribution_varByMarkov',
            'distribution_varByMin',
            'distribution_varByMinSize',
            'distribution_varFallback',
            'distribution_valueByList',
            'distribution_valueByMarkov',
            'distribution_valueByMax',
            'distribution_valueByMid',
            'distribution_valueByMin',
            'distribution_valueByMinMaxCycle',
            'distribution_valueBySplitMax',
            'distribution_valueBySplitMin',
            '_distribute_getNextDomainForVar',

            // distribution/ testing-only
            'domain_str_rangeIndexOf',
            '_domain_str_mergeOverlappingRanges',
            '_domain_str_quickSortRanges',

            // fdp-specific

            // bounty
            'bounty__debug',
            'bounty__debugMeta',
            'bounty_getCounts',
            'bounty_getMeta',
            'bounty_getOffset',

            // ml
            'ml__debug',
            'ml__opName',
            //
            'ml_countConstraints',
            'ml_dec16',
            'ml_dec32',
            'ml_dec8',
            //
            'ml_getOpList',
            'ml_getOpSizeSlow',
            'ml_getRecycleOffset',
            'ml_getRecycleOffsets',
            'ml_hasConstraint',
            'ml_heapSort16bitInline',
            'ml_recycleC3',
            'ml_recycleVV',
            'ml_sizeof',
            //
            'ml_validateSkeleton',
            '_ml_heapSort16bitInline',
            'ml_any2c',
            'ml_any2cr',
            'ml_c2c2',
            'ml_c2vv',
            'ml_cr2c',
            'ml_cr2c2',
            'ml_cr2cr2',
            'ml_cr2vv',
            'ml_cr2vvv',
            'ml_cx2cx',
            'ml_vv2vv',
            'ml_vvv2c2',
            'ml_vvv2vv',
            'ml_vvv2vvv',

            // fdp
            'solve',
          ],
          pure_getters: true,
          unsafe: true,
          unsafe_comps: false, // TODO: things break when this is true
          warnings: false,
        },
      }),
    ],
  },
];
