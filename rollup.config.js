import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

export default [
  // UMD Development
  {
    input: 'src/fdq.js',
    output: {
      file: 'dist/fdq.js',
      format: 'umd',
      name: 'FDQ',
      indent: false,
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
    plugins: [
      nodeResolve(),
      commonjs(),
      babel(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser({
        compress: {
          pure_funcs: [
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
          ],
          pure_getters: true,
          unsafe: true,
          unsafe_comps: false,
          warnings: false,
        },
      }),
    ],
  },
];

