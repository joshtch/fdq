// Set up verifier to work as intended
// the tests in fdv should run after this script
// note: this should run after creating a build. this tests the build/dist.

import FDQ from '../../debug/fdq.browser';
import { setSolver, setThrowStratMode } from 'fdv/verifier';

setThrowStratMode(true); // The dist doesnt contain the code to generate the required oplist. it could, but *shrug*
setSolver(FDQ.solve);
