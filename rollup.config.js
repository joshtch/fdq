import path from 'path';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

// Tell rollup how to resolve external imports
const moduleAliases = { 'fdlib': path.resolve('node_modules/fdlib/dist/fdlib.es.js') }

// Terser.js compress options
const compress = {
  pure_funcs: [
    // fdlib
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
    'domain_removeLtUnsafe',
    'domain_removeValue',
    'domain_resolveAsBooly',
    'domain_str_encodeRange',
    'domain_minus',
    'domain_plus',
    'INSPECT',
    'getTerm',
    'trie_create',
    '_trie_debug',
    'trie_get',
    'trie_getNum',
    'trie_getValueBitsize',
    'trie_has',
    'trie_hasNum',

    // fdo
    'config_clone',
    'config_create',
    'config_createVarStratConfig',
    'constraint_create',
    'distribution_getDefaults',
    'distribution_markovSampleNextFromDomain',
    'exporter_main',
    'exporter_encodeVarName',
    'markov_createLegend',
    'markov_createProbVector',
    'propagator_eqStepWouldReject',
    'propagator_gtStepWouldReject',
    'propagator_ltStepWouldReject',
    'propagator_gteStepWouldReject',
    'propagator_lteStepWouldReject',
    'propagator_neqStepWouldReject',
    'space_createRoot',
    'space_getDomainArr',
    'space_getVarSolveState',
    'space_solution',
    'space_toConfig',

    // fdp
    'bounty_getCounts',
    'ml__debug',
    'ml__opName',
    'ml_countConstraints',
    'ml_dec16',
    'ml_dec32',
    'ml_dec8',
    'ml_getOpList',
    'ml_getOpSizeSlow',
    'ml_getRecycleOffset',
    'ml_getRecycleOffsets',
    'ml_hasConstraint',
    'ml_recycleC3',
    'ml_recycleVV',
    'ml_sizeof',
    'ml_validateSkeleton',
  ],
  pure_getters: true,
  unsafe: true,
  unsafe_comps: false, // TODO: find out why things break when this is true
  warnings: false,
};

export default [
  // Core Node builds
  {
    input: 'src/fdq.js',
    plugins: [
      alias(moduleAliases),
      resolve(),
      commonjs({ include: 'node_modules/**' }),
      babel(),
    ],
    external: ['fs', 'path', 'events', 'module', 'util'],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
    },
    output: [
      { file: 'dist/fdq.js', format: 'cjs', sourcemap: true },
      { file: 'dist/fdq.es.js', format: 'esm' },
    ],
  },

  // UMD Development
  {
    input: 'src/fdq.js',
    plugins: [
      alias(moduleAliases),
      resolve({ browser: true }),
      commonjs({ include: 'node_modules/**' }),
      babel(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    ],
    output: {
      file: 'debug/fdq.browser.js',
      format: 'umd',
      name: 'FDQ',
      sourcemap: true,
    },
  },

  // UMD Production
  {
    input: 'src/fdq.js',
    plugins: [
      alias(moduleAliases),
      resolve({ browser: true }),
      commonjs({ include: 'node_modules/**' }),
      babel(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser({ compress, mangle: false }),
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    },
    output: [
      { file: 'debug/fdq.browser.prod.js', format: 'umd', name: 'FDQ' },
    ],
  },

  // UMD Production
  {
    input: 'src/fdq.js',
    plugins: [
      alias(moduleAliases),
      resolve({ browser: true }),
      commonjs({ include: 'node_modules/**' }),
      babel(),
      replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
      terser({ compress }),
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    },
    output: [
      { file: 'dist/fdq.browser.js', format: 'umd', name: 'FDQ' },
      { file: 'dist/fdq.browser.es.js', format: 'esm' },
    ],
  },
];
