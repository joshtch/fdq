import FDO from 'fdo';
import FDP from 'fdp';

import { setTerm } from 'fdlib';

function solve(dsl, fdpOptions, fdoOptions) {
  return FDP.solve(dsl, FDO.solve, fdpOptions, fdoOptions);
}

export default { FDO, FDP, setTerm, solve };
