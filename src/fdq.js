import FDO from 'fdo/src/fdo';
import FDP from 'fdp/src/fdp';

export { FDO, FDP };
export { setTerm } from 'fdlib/src/helpers';

export function solve(dsl, fdpOptions, fdoOptions) {
  return FDP.solve(dsl, FDO.solve, fdpOptions, fdoOptions);
}
