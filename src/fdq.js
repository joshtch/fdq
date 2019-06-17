import FDO from 'fdo';
import FDP from 'fdp';

import { setTerm } from 'fdlib';

// Everything silent by default
setTerm({
  log: _doNothing,
  warn: _doNothing,
  error: _doNothing,
  trace: _doNothing,
  time: _doNothing,
  timeEnd: _doNothing,
});

const fdoDefaults = {
  log: 0,
  logger: _doNothing,
  beforeSpace: _doNothing,
  afterSpace: _doNothing,
  _debug: false,
  _debugConfig: false,
  _debugSpace: false,
  _debugSolver: false,
};
const fdpDefaults = {
  log: 0,
  debugDsl: false,
  printDslBefore: _doNothing,
  printDslAfter: _doNothing,
  indexNames: false,
  hashNames: false,
  groupConstraints: false,
};

function _doNothing() {
  return false;
}

function solve(dsl, fdpOptions = {}, fdoOptions = {}) {
  return FDP.solve(
    dsl,
    FDO.solve,
    { ...fdpDefaults, ...fdpOptions },
    { ...fdoDefaults, ...fdoOptions }
  );
}

export default { FDO, FDP, setTerm, solve };
