# FDQ - Finite Domain solver by qFox

This is a finite domain reduction system and solver combined. The fdq package combines fdo and fdq together.

## Usage

After the customary `npm install fdq`, you can find the main entry point in `FDQ.solve(problem, fdpOptions, fdoOptions)`.

For example:

```js
import FDQ from 'fdq';
let solution = FDQ.solve(`
  : A, B, C [0 1]
  A != B
  A !& C
`);
log(solution); // -> {A: 0, B: 1, C: 1}
```

## Examples

There is a REPL (online web-based playground) available: [https://qfox.github.io/fdq/examples/playground.html](https://qfox.github.io/fdq/examples/playground.html)

Some examples:

- [Sudoku solver](https://qfox.github.io/fdq/examples/sudoku.html)
- [Battleships solver](https://qfox.github.io/fdq/examples/battleships.html)
- [Tree-Tent solver](https://qfox.github.io/fdq/examples/treetent.html)
- [Hitori solver (wip)](https://qfox.github.io/fdq/examples/hitori.html)

## Development

To set up a development environment create a main project dir. Inside it clone the following repos:

- [fdh](https://github.com/qfox/fdh) - all the generic e2e/integration tests for both fdo and fdq
- [fdlib](https://github.com/qfox/fdlib) - shared code for fdo and fdq
- [fdo](https://github.com/qfox/fdo) - a constraint brute force solver
- [fdp](https://github.com/qfox/fdp) - a constraint problem reduction system
- [fdq](https://github.com/qfox/fdq) - this repo
- [fdv](https://github.com/qfox/fdv) - an automated verifier for tests
- [fdz](https://github.com/qfox/fdz) - (optional) these are performance tests (they might be merged into the fdq repo instead)

Run `npm install` and you should be able to use the CLI tools.

## CLI

Grunt scripts:

- `grunt clean` - remove `build` and `dist`
- `grunt build` - concat all the source files from `fdlib`, `fdo`, and `fdp` together and babel them to es5
- `grunt dist` - lint, test, build, and minify, this creates the final dist build
- `grunt distq` - dist build only, also generates a more generic `fdq.js`
- `grunt distbug` - like build but instead of minify keeps development mnemonics like logging and assertions
- `grunt distheat` - like build instead of minify does a beautify
- `grunt test` - lint and test, also copies to `fdq.js`
- `grunt testq` - distq and run tests, collect all errors, also copies to `fdq.js`
- `grunt testb` - distb and run tests, collect all errors, also copies to `fdq.js`
- `grunt testh` - disth and run tests, collect all errors, also copies to `fdq.js`
- `grunt testtb` - distq and run tests, fail fast, also copies to `fdq.js`

Note: for the build scripts, `dist/fdq.js` is a generic output file for both dev and dist builds (since they also create descriptive output files, `fdq.js` just makes it easy to reference from tests or web no matter which build script you ran).
 
NPM scripts:

- `npm run coverage` - runs mocha, istanbul, and isparta to generate code coverage of all the tests
- `npm run lint` - runs eslint
- `npm run lintdev` - runs eslint with slightly relaxer rules (like allowing `console.log`)
- `npm run lintfix` - runs eslint with the --fix option to automatically fixup certain rules quickly

