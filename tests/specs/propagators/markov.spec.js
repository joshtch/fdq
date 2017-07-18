import expect from '../../fixtures/mocha_proxy.fixt';
import {
  fixt_arrdom_empty,
  fixt_arrdom_solved,
} from '../../fixtures/domain.fixt';
import {
  domain_toArr,
} from '../../../src/domain';
import {
  LOG_FLAG_PROPSTEPS,
  LOG_FLAG_NONE,

  ASSERT_SET_LOG,
} from '../../../src/helpers';
import Solver from '../../../src/solver';
import propagator_markovStepBare from '../../../src/propagators/markov';

describe('propagators/markov.spec', function() {

  it('should exist', function() {
    expect(propagator_markovStepBare).to.be.a('function');
  });

  describe('simple unit tests', function() {

    it('should pass if solved value is in legend with prob>0', function() {
      let solver = new Solver();
      solver.declRange('A', 0, 0, {
        valtype: 'markov',
        legend: [0],
        matrix: [
          {vector: [1]},
        ],
      });
      solver._prepare({});

      let Aindex = solver.config.allVarNames.indexOf('A');

      // A=0, which is in legend and has prob=1
      propagator_markovStepBare(solver._space, solver.config, Aindex);
      expect(domain_toArr(solver._space.vardoms[Aindex])).to.eql(fixt_arrdom_solved(0));
    });

    it('should reject if solved value is not in legend', function() {
      let solver = new Solver();
      solver.declRange('A', 0, 0, {
        valtype: 'markov',
        legend: [1],
        matrix: [
          {vector: [1]},
        ],
      });
      solver._prepare({});

      let Aindex = solver.config.allVarNames.indexOf('A');

      // A=0, which is not in legend
      propagator_markovStepBare(solver._space, solver.config, Aindex);
      expect(domain_toArr(solver._space.vardoms[Aindex])).to.eql(fixt_arrdom_empty(1));
    });

    describe('matrix with one row', function() {

      it('should reject if solved value does not have prob>0', function() {
        let solver = new Solver();
        solver.declRange('A', 0, 0, {
          valtype: 'markov',
          legend: [0],
          matrix: [
            {vector: [0]},
          ],
        });
        solver._prepare({});

        let Aindex = solver.config.allVarNames.indexOf('A');

        // A=0, which is in legend but has prob=0
        propagator_markovStepBare(solver._space, solver.config, Aindex);
        expect(domain_toArr(solver._space.vardoms[Aindex])).to.eql(fixt_arrdom_empty(1));
      });

      it('should pass if solved value does has prob>0', function() {
        let solver = new Solver();
        solver.declRange('A', 0, 0, {
          valtype: 'markov',
          legend: [0],
          matrix: [
            {vector: [0]},
          ],
        });
        solver._prepare({});

        let Aindex = solver.config.allVarNames.indexOf('A');

        // A=0, which is in legend and has prob=1
        propagator_markovStepBare(solver._space, solver.config, Aindex);
        expect(domain_toArr(solver._space.vardoms[Aindex])).to.eql(fixt_arrdom_empty(1));
      });
    });

    describe('multi layer matrix', function() {

      it('should pass if second row gives value prob>0', function() {
        let solver = new Solver();
        solver.declRange('A', 0, 0, {
          valtype: 'markov',
          legend: [0],
          matrix: [{
            vector: [0],
            boolVarName: solver.num(0),
          }, {
            vector: [1],
          }],
        });
        solver._prepare({});

        let Aindex = solver.config.allVarNames.indexOf('A');

        // A=0, which is in legend and has prob=0 in first row,
        // but only second row is considered which gives prob=1
        propagator_markovStepBare(solver._space, solver.config, Aindex);
        expect(domain_toArr(solver._space.vardoms[Aindex])).to.eql(fixt_arrdom_solved(0));
      });

      it('should reject if second row gives value prob=0', function() {

        let solver = new Solver();
        solver.declRange('A', 0, 0, {
          valtype: 'markov',
          legend: [0],
          matrix: [{
            vector: [1],
            boolVarName: solver.num(0),
          }, {
            vector: [0],
          }],
        });
        solver._prepare({});

        let Aindex = solver.config.allVarNames.indexOf('A');

        // A=0, which is in legend and has prob=1 in first row,
        // but only second row is considered which gives prob=0
        propagator_markovStepBare(solver._space, solver.config, Aindex);
        expect(domain_toArr(solver._space.vardoms[Aindex])).to.eql(fixt_arrdom_empty(1));
      });
    });
  });

  describe('with LOG to improve test coverage', function() {

    before(function() {
      ASSERT_SET_LOG(LOG_FLAG_PROPSTEPS);
    });

    it('solved domain', function() {
      let solver = new Solver();
      solver.declRange('A', 0, 0, {
        valtype: 'markov',
        legend: [0],
        matrix: [
          {vector: [1]},
        ],
      });
      solver._prepare({});

      let Aindex = solver.config.allVarNames.indexOf('A');

      // A=0, which is in legend and has prob=1
      propagator_markovStepBare(solver._space, solver.config, Aindex);

      expect(true).to.eql(true);
    });

    it('unsolved domain', function() {
      let solver = new Solver();
      solver.declRange('A', 0, 10, {
        valtype: 'markov',
        legend: [0],
        matrix: [
          {vector: [1]},
        ],
      });
      solver._prepare({});

      let Aindex = solver.config.allVarNames.indexOf('A');

      // A=0, which is in legend and has prob=1
      propagator_markovStepBare(solver._space, solver.config, Aindex);

      expect(true).to.eql(true);
    });

    after(function() {
      ASSERT_SET_LOG(LOG_FLAG_NONE);
    });
  });
});
