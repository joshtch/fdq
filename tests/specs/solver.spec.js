import expect from '../fixtures/mocha_proxy.fixt';
import {
  fixt_arrdom_nums,
  fixt_arrdom_range,
  fixt_arrdom_ranges,
  fixt_dom_ranges,
  stripAnonVarsFromArrays,
} from '../fixtures/domain.fixt';
import {
  countSolutions,
} from '../fixtures/lib';

import Solver from '../../src/solver';
import {
  LOG_NONE,
  LOG_STATS,
  LOG_SOLVES,
  LOG_MAX,
  LOG_MIN,
  SUB,
  SUP,
} from '../../src/helpers';

describe('solver.spec', function() {

  this.timeout(60000); // takes long under istanbul / even longer under travis

  describe('api', function() {

    describe('solver constructor', function() {

      it('should exist', function() {
        expect(typeof Solver).to.be.equal('function');
      });

      it('should not require the options arg', function() {
        let solver = new Solver();

        expect(solver).to.be.an('object');
        expect(solver instanceof Solver);
      });

      it('should accept a string for distribution options', function() {
        let solver = new Solver({distribute: 'naive'});

        expect(solver).to.be.an('object');
        expect(solver instanceof Solver);
      });

      it('should throw for unknown distribute strings', function() {
        expect(_ => new Solver({distribute: 'fail'}).solve()).to.throw('distribution.get_defaults: Unknown preset: fail');
        expect(_ => new Solver().solve({distribute: 'fail'})).to.throw('distribution.get_defaults: Unknown preset: fail');
      });

      it('should accept an object for distribution options', function() {
        let solver = new Solver({distribute: {}});

        expect(solver).to.be.an('object');
        expect(solver instanceof Solver);
      });
    });

    describe('solver.num', function() {

      it('num(false)', function() {
        let solver = new Solver();

        expect(_ => solver.num(false)).to.throw('Solver#num: expecting a number, got false (a boolean)');
      });

      it('num(true)', function() {
        let solver = new Solver();

        expect(_ => solver.num(true)).to.throw('Solver#num: expecting a number, got true (a boolean)');
      });

      it('num(0)', function() {
        let solver = new Solver();
        let name = solver.num(0);

        expect(name).to.be.a('string');
      });

      it('num(10)', function() {
        let solver = new Solver();
        let name = solver.num(10);

        expect(name).to.be.a('string');
      });

      it('should throw for undefined', function() {
        let solver = new Solver();

        expect(_ => solver.num(undefined)).to.throw('Solver#num: expecting a number, got undefined (a undefined)');
      });

      it('should throw for null', function() {
        let solver = new Solver();

        expect(_ => solver.num(null)).to.throw('Solver#num: expecting a number, got null (a object)');
      });

      it('should throw for NaN', function() {
        let solver = new Solver();

        expect(_ => solver.num(NaN)).to.throw('Solver#num: expecting a number, got NaN');
      });
    });

    describe('solver.decl', function() {

      it('should work', function() {
        let solver = new Solver();

        expect(solver.decl('foo')).to.equal('foo');
      });

      it('should accept a flat array for domain', function() {
        let solver = new Solver();
        solver.decl('foo', [0, 10, 20, 30]); // dont use fixtures because small domain

        expect(solver.config.initialDomains[solver.config.allVarNames.indexOf('foo')]).to.eql(fixt_dom_ranges([0, 10], [20, 30]));
      });

      it('should no longer accept a legacy nested array for domain', function() {
        let solver = new Solver();

        expect(_ => solver.decl('foo', [[0, 10], [20, 30]])).to.throw('SHOULD_BE_GTE 0');
      });

      describe('legacy', function() {

        it('should throw for bad legacy domain ', function() {
          let solver = new Solver();

          expect(_ => solver.decl('foo', [[0]])).to.throw('SHOULD_CONTAIN_RANGES');
        });

        it('should throw for bad legacy domain with multiple ranges', function() {
          let solver = new Solver();

          expect(_ => solver.decl('foo', [[0], [20, 30]])).to.throw('SHOULD_BE_LTE 100000000');
        });
      });

      it('should throw for domains with numbers <SUB', function() {
        let solver = new Solver();

        expect(_ => solver.decl('foo', [SUB - 2, SUB - 1])).to.throw('SHOULD_BE_GTE');
      });

      it('should throw for domains with numbers >SUP', function() {
        let solver = new Solver();

        expect(_ => solver.decl('foo', [SUP + 1, SUP + 2])).to.throw('SHOULD_BE_LTE');
      });

      it('should throw for domains with NaNs', function() {
        let solver = new Solver();
        expect(_ => solver.decl('foo', [0, NaN])).to.throw('SHOULD_BE_LTE');

        let solver2 = new Solver();
        expect(_ => solver2.decl('foo', [NaN, 1])).to.throw('SHOULD_BE_GTE');

        let solver3 = new Solver();
        expect(_ => solver3.decl('foo', [NaN, NaN])).to.throw('SHOULD_BE_GTE');
      });

      it('should throw for domains with inverted range', function() {
        let solver = new Solver();

        expect(_ => solver.decl('foo', [2, 1])).to.throw('NON_EMPTY_DOMAIN');
      });

      it('should throw for legacy domains with inverted range', function() {
        let solver = new Solver();

        expect(_ => solver.decl('foo', [[2, 1]])).to.throw('SHOULD_CONTAIN_RANGES');
      });

      it('should throw for domains with garbage', function() {
        let solver = new Solver();

        expect(_ => solver.decl('foo', [{}, {}])).to.throw('SHOULD_BE_GTE 0');
      });

      it('should throw for legacy domains with garbage', function() {
        let solver = new Solver();

        expect(_ => solver.decl('foo', [[{}]])).to.throw('SHOULD_CONTAIN_RANGES');
      });

      it('should throw for domains with one number', function() {
        let solver = new Solver();

        expect(_ => solver.decl('foo', [1])).to.throw('SHOULD_CONTAIN_RANGES');
      });
    });

    describe('solver.plus', function() {

      it('should work without result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        expect(solver.plus('A', 'B')).to.be.a('string');
      });

      it('should work with a result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.plus('A', 'B', 'C')).to.equal('C');
      });

      it('should accept numbers on either of the three positions', function() {
        let solver = new Solver();
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.plus(1, 'B', 'C')).to.equal('C');

        let solver2 = new Solver();
        solver2.decl('A', 100);
        solver2.decl('C', 100);
        expect(solver2.plus('A', 2, 'C')).to.equal('C');

        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(solver3.plus('A', 'B', 3)).to.be.a('string');
      });

      it('should throw for bad result name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(_ => solver3.plus(['A', 'B'], {})).to.throw('all var names should be strings or numbers or undefined');
      });

      it('should always return the result var name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        solver3.decl('C', 100);

        expect(solver3.plus('A', 'B')).to.be.a('string');
        expect(solver3.plus(1, 'B')).to.be.a('string');
        expect(solver3.plus('A', 1)).to.be.a('string');
        expect(solver3.plus(1, 2)).to.be.a('string');

        expect(solver3.plus('A', 'B', 'C')).to.eql('C');
        expect(solver3.plus(1, 'B', 'C')).to.eql('C');
        expect(solver3.plus('A', 2, 'C')).to.eql('C');
        expect(solver3.plus(1, 2, 'C')).to.eql('C');

        expect(solver3.plus('A', 'B', 3)).to.be.a('string');
        expect(solver3.plus(1, 'B', 3)).to.be.a('string');
        expect(solver3.plus('A', 2, 3)).to.be.a('string');
        expect(solver3.plus(1, 2, 3)).to.be.a('string');
      });
    });

    describe('solver.minus', function() {

      it('should work without result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        expect(solver.minus('A', 'B')).to.be.a('string');
      });

      it('should work with a result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.minus('A', 'B', 'C')).to.equal('C');
      });

      it('should accept numbers on either of the three positions', function() {
        let solver = new Solver();
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.minus(1, 'B', 'C')).to.equal('C');

        let solver2 = new Solver();
        solver2.decl('A', 100);
        solver2.decl('C', 100);
        expect(solver2.minus('A', 2, 'C')).to.equal('C');

        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(solver3.minus('A', 'B', 3)).to.be.a('string');
      });

      it('should throw for bad result name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(_ => solver3.minus(['A', 'B'], {})).to.throw('all var names should be strings or numbers or undefined');
      });

      it('should always return the result var name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        solver3.decl('C', 100);

        expect(solver3.minus('A', 'B')).to.be.a('string');
        expect(solver3.minus(1, 'B')).to.be.a('string');
        expect(solver3.minus('A', 1)).to.be.a('string');
        expect(solver3.minus(1, 2)).to.be.a('string');

        expect(solver3.minus('A', 'B', 'C')).to.eql('C');
        expect(solver3.minus(1, 'B', 'C')).to.eql('C');
        expect(solver3.minus('A', 2, 'C')).to.eql('C');
        expect(solver3.minus(1, 2, 'C')).to.eql('C');

        expect(solver3.minus('A', 'B', 3)).to.be.a('string');
        expect(solver3.minus(1, 'B', 3)).to.be.a('string');
        expect(solver3.minus('A', 2, 3)).to.be.a('string');
        expect(solver3.minus(1, 2, 3)).to.be.a('string');
      });
    });

    describe('solver.mul', function() {

      it('should work without result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        expect(solver.mul('A', 'B')).to.be.a('string');
      });

      it('should work with a result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.mul('A', 'B', 'C')).to.equal('C');
      });

      it('should accept numbers on either of the three positions', function() {
        let solver = new Solver();
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.mul(1, 'B', 'C')).to.equal('C');

        let solver2 = new Solver();
        solver2.decl('A', 100);
        solver2.decl('C', 100);
        expect(solver2.mul('A', 2, 'C')).to.equal('C');

        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(solver3.mul('A', 'B', 3)).to.be.a('string');
      });

      it('should throw for bad result name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(_ => solver3.mul(['A', 'B'], {})).to.throw('all var names should be strings or numbers or undefined');
      });

      it('should always return the result var name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        solver3.decl('C', 100);

        expect(solver3.mul('A', 'B')).to.be.a('string');
        expect(solver3.mul(1, 'B')).to.be.a('string');
        expect(solver3.mul('A', 1)).to.be.a('string');
        expect(solver3.mul(1, 2)).to.be.a('string');

        expect(solver3.mul('A', 'B', 'C')).to.eql('C');
        expect(solver3.mul(1, 'B', 'C')).to.eql('C');
        expect(solver3.mul('A', 2, 'C')).to.eql('C');
        expect(solver3.mul(1, 2, 'C')).to.eql('C');

        expect(solver3.mul('A', 'B', 3)).to.be.a('string');
        expect(solver3.mul(1, 'B', 3)).to.be.a('string');
        expect(solver3.mul('A', 2, 3)).to.be.a('string');
        expect(solver3.mul(1, 2, 3)).to.be.a('string');
      });
    });

    describe('solver.div', function() {

      it('should work without result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        expect(solver.div('A', 'B')).to.be.a('string');
      });

      it('should work with a result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.div('A', 'B', 'C')).to.equal('C');
      });

      it('should accept numbers on either of the three positions', function() {
        let solver = new Solver();
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.div(1, 'B', 'C')).to.equal('C');

        let solver2 = new Solver();
        solver2.decl('A', 100);
        solver2.decl('C', 100);
        expect(solver2.div('A', 2, 'C')).to.equal('C');

        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(solver3.div('A', 'B', 3)).to.be.a('string');
      });

      it('should throw for bad result name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(_ => solver3.div(['A', 'B'], {})).to.throw('all var names should be strings or numbers or undefined');
      });

      it('should always return the result var name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        solver3.decl('C', 100);

        expect(solver3.div('A', 'B')).to.be.a('string');
        expect(solver3.div(1, 'B')).to.be.a('string');
        expect(solver3.div('A', 1)).to.be.a('string');
        expect(solver3.div(1, 2)).to.be.a('string');

        expect(solver3.div('A', 'B', 'C')).to.eql('C');
        expect(solver3.div(1, 'B', 'C')).to.eql('C');
        expect(solver3.div('A', 2, 'C')).to.eql('C');
        expect(solver3.div(1, 2, 'C')).to.eql('C');

        expect(solver3.div('A', 'B', 3)).to.be.a('string');
        expect(solver3.div(1, 'B', 3)).to.be.a('string');
        expect(solver3.div('A', 2, 3)).to.be.a('string');
        expect(solver3.div(1, 2, 3)).to.be.a('string');
      });
    });

    describe('solver.product', function() {

      it('should work without result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        expect(solver.product(['A', 'B'])).to.be.a('string');
      });

      it('should work with a result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.product(['A', 'B'], 'C')).to.equal('C');
      });

      it('should accept numbers on either of the three positions', function() {
        let solver = new Solver();
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.product([1, 'B'], 'C')).to.equal('C');

        let solver2 = new Solver();
        solver2.decl('A', 100);
        solver2.decl('C', 100);
        expect(solver2.product(['A', 2], 'C')).to.equal('C');

        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(solver3.product(['A', 'B'], 3)).to.be.a('string');
      });

      it('should throw for bad result name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(_ => solver3.product(['A', 'B'], {})).to.throw('expecting result var name to be absent or a number or string:');
      });

      it('should always return the result var name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        solver3.decl('C', 100);

        expect(solver3.product(['A', 'B'])).to.be.a('string');
        expect(solver3.product([1, 'B'])).to.be.a('string');
        expect(solver3.product(['A', 1])).to.be.a('string');
        expect(solver3.product([1, 2])).to.be.a('string');

        expect(solver3.product(['A', 'B'], 'C')).to.eql('C');
        expect(solver3.product([1, 'B'], 'C')).to.eql('C');
        expect(solver3.product(['A', 2], 'C')).to.eql('C');
        expect(solver3.product([1, 2], 'C')).to.eql('C');

        expect(solver3.product(['A', 'B'], 3)).to.be.a('string');
        expect(solver3.product([1, 'B'], 3)).to.be.a('string');
        expect(solver3.product(['A', 2], 3)).to.be.a('string');
        expect(solver3.product([1, 2], 3)).to.be.a('string');
      });
    });

    describe('solver.sum', function() {

      it('should work without result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        expect(solver.sum(['A', 'B'])).to.be.a('string');
      });

      it('should work with a result var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.sum(['A', 'B'], 'C')).to.equal('C');
      });

      it('should accept numbers on either of the three positions; 1', function() {
        let solver = new Solver();
        solver.decl('B', 100);
        solver.decl('C', 100);
        expect(solver.sum([1, 'B'], 'C')).to.equal('C');
      });

      it('should accept numbers on either of the three positions; 2', function() {
        let solver2 = new Solver();
        solver2.decl('A', 100);
        solver2.decl('C', 100);
        expect(solver2.sum(['A', 2], 'C')).to.equal('C');
      });

      it('should accept numbers on either of the three positions; 3', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(solver3.sum(['A', 'B'], 3)).to.be.a('string');
      });

      it('should throw for bad result name', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        expect(_ => solver3.sum(['A', 'B'], {})).to.throw('expecting result var name to be absent or a number or string:');
      });

      it('should always return the result var name, regardless', function() {
        let solver3 = new Solver();
        solver3.decl('A', 100);
        solver3.decl('B', 100);
        solver3.decl('C', 100);

        expect(solver3.sum(['A', 'B'])).to.be.a('string');
        expect(solver3.sum([1, 'B'])).to.be.a('string');
        expect(solver3.sum(['A', 1])).to.be.a('string');
        expect(solver3.sum([1, 2])).to.be.a('string');

        expect(solver3.sum(['A', 'B'], 'C')).to.eql('C');
        expect(solver3.sum([1, 'B'], 'C')).to.be.eql('C');
        expect(solver3.sum(['A', 2], 'C')).to.be.eql('C');
        expect(solver3.sum([1, 2], 'C')).to.eql('C');

        expect(solver3.sum(['A', 'B'], 3)).to.be.a('string');
        expect(solver3.sum([1, 'B'], 3)).to.be.a('string');
        expect(solver3.sum(['A', 2], 3)).to.be.a('string');
        expect(solver3.sum([1, 2], 3)).to.be.a('string');
      });
    });

    describe('solver.distinct', function() {

      it('should work', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        solver.decl('C', 100);
        solver.decl('D', 100);
        solver.decl('E', 100);
        expect(solver.distinct(['A', 'B', 'C', 'D'], 'E')).to.equal(undefined);
      });

      it('accept zero vars', function() {
        let solver = new Solver();
        expect(_ => solver.distinct([])).not.to.throw();
      });

      it('accept one var', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        expect(solver.distinct(['A'])).to.equal(undefined);
      });

      it('accept two vars', function() {
        let solver = new Solver();
        solver.decl('A', 100);
        solver.decl('B', 100);
        expect(solver.distinct(['A', 'B'])).to.equal(undefined);
      });
    });

    describe('solver comparison with .eq and .neq', function() {

      function alias(method) {
        it('should work', function() {
          let solver = new Solver();
          solver.decl('A', 100);
          solver.decl('B', 100);
          expect(solver[method]('A', 'B')).to.equal(undefined); // returns v1
        });

        it('should work with a number left', function() {
          let solver = new Solver();
          solver.decl('B', 100);
          expect(solver[method](1, 'B')).to.eql(undefined);
        });

        it('should work with a number right', function() {
          let solver = new Solver();
          solver.decl('A', 100);
          expect(solver[method]('A', 2)).to.eql(undefined);
        });

        it('should work with an empty array left', function() {
          let solver = new Solver();
          solver.decl('B', 100);
          expect(solver[method]([], 'B')).to.equal(undefined); // returns v2!
        });

        it('should work with an empty array right', function() {
          let solver = new Solver();
          solver.decl('A', 100);
          expect(solver[method]('A', [])).to.equal(undefined); // returns v2!
        });

        it('should work with an empty array left and right', function() {
          let solver = new Solver();
          expect(solver[method]([], [])).to.equal(undefined); // returns v2!
        });

        it('should work with an array of one element left', function() {
          let solver = new Solver();
          solver.decl('A', 100);
          solver.decl('B', 100);
          expect(solver[method](['A'], 'B')).to.equal(undefined);
        });

        it('should work with an array of one element right', function() {
          let solver = new Solver();
          solver.decl('A', 100);
          solver.decl('B', 100);
          expect(solver[method]('A', ['B'])).to.equal(undefined);
        });

        it('should work with an array of multiple elements left', function() {
          let solver = new Solver();
          solver.decl('A', 100);
          solver.decl('B', 100);
          solver.decl('C', 100);
          solver.decl('D', 100);
          expect(solver[method](['A', 'C', 'D'], 'B')).to.equal(undefined);
        });

        it('should work with an array of multiple elements right', function() {
          let solver = new Solver();
          solver.decl('A', 100);
          solver.decl('B', 100);
          solver.decl('C', 100);
          solver.decl('D', 100);
          expect(solver[method]('B', ['A', 'C', 'D'])).to.equal(undefined);
        });

        it('should work with an array of multiple elements on both sides', function() {
          let solver = new Solver();
          solver.decl('A', 100);
          solver.decl('B', 100);
          solver.decl('C', 100);
          solver.decl('D', 100);
          expect(solver[method](['A', 'B', 'C', 'D'], ['A', 'B', 'C', 'D'])).to.equal(undefined);
        });
      }

      alias('eq');
      alias('neq');
    });

    describe('solver relative comparisons', function() {

      function alias(method) {
        describe('method [' + method + ']', function() {

          it('should work', function() {
            let solver = new Solver();
            solver.decl('A', 100);
            solver.decl('B', 100);
            expect(solver[method]('A', 'B')).to.equal(undefined);
          });

          it('should work with a number left', function() {
            let solver = new Solver();
            solver.decl('B', 100);
            expect(solver[method](1, 'B')).to.equal(undefined); // if we change anonymous var naming, this'll break
          });

          it('should work with a number right', function() {
            let solver = new Solver();
            solver.decl('A', 100);
            expect(solver[method]('A', 2)).to.equal(undefined); // if we change anonymous var naming, this'll break
          });
          it('should not work with an empty array', function() {
            let solver = new Solver();
            solver.decl('B', 100);
            expect(_ => solver[method]([], 'B')).to.throw('NOT_ACCEPTING_ARRAYS');
          });

          it('should work with an array of one element', function() {
            let solver = new Solver();
            solver.decl('A', 100);
            solver.decl('B', 100);
            expect(_ => solver[method](['A'], 'B')).to.throw('NOT_ACCEPTING_ARRAYS');
          });

          it('should work with an array of multiple elements', function() {
            let solver = new Solver();
            solver.decl('A', 100);
            solver.decl('B', 100);
            solver.decl('C', 100);
            solver.decl('D', 100);
            expect(_ => solver[method](['A', 'C', 'D'], 'B')).to.throw('NOT_ACCEPTING_ARRAYS');
          });
        });
      }

      alias('gte');
      alias('gt');
      alias('lte');
      alias('lt');
    });

    describe('solver reifiers', function() {

      function alias(method) {
        describe('method = ' + method, function() {

          it('should work:' + method, function() {
            let solver = new Solver();
            solver.decl('A', 100);
            solver.decl('B', 100);
            expect(solver[method]('A', 'B')).to.be.a('string');
          });

          it('should work with a number left: ' + method, function() {
            let solver = new Solver();
            solver.decl('B', 100);
            expect(solver[method](1, 'B')).to.be.a('string');
          });

          it('should work with a number right: ' + method, function() {
            let solver = new Solver();
            solver.decl('A', 100);
            expect(solver[method]('A', 2)).to.be.a('string');
          });

          it('should accept a result name: ' + method, function() {
            let solver = new Solver();
            solver.decl('A', 100);
            solver.decl('B', 100);
            solver.decl('C', 100);
            expect(solver[method]('A', 'B', 'C')).to.equal('C');
          });

          it('should accept a result number: ' + method, function() {
            let solver = new Solver();
            solver.decl('A', 100);
            solver.decl('B', 1);
            expect(solver[method]('A', 'B', 1)).to.be.a('string');
          });

          it('should throw for bad result name', function() {
            let solver3 = new Solver();
            solver3.decl('A', 100);
            solver3.decl('B', 100);
            expect(_ => solver3[method](['A', 'B'], {})).to.throw('all var names should be strings or numbers or undefined');
          });

          it('should always return the result var name', function() {
            let solver3 = new Solver();
            solver3.decl('A', 100);
            solver3.decl('B', 100);
            solver3.decl('C', 100);

            expect(solver3[method]('A', 'B')).to.be.a('string');
            expect(solver3[method](1, 'B')).to.be.a('string');
            expect(solver3[method]('A', 1)).to.be.a('string');
            expect(solver3[method](1, 2)).to.be.a('string');

            expect(solver3[method]('A', 'B', 'C')).to.eql('C');
            expect(solver3[method](1, 'B', 'C')).to.eql('C');
            expect(solver3[method]('A', 2, 'C')).to.eql('C');
            expect(solver3[method](1, 2, 'C')).to.eql('C');

            expect(solver3[method]('A', 'B', 3)).to.be.a('string');
            expect(solver3[method](1, 'B', 3)).to.be.a('string');
            expect(solver3[method]('A', 2, 3)).to.be.a('string');
            expect(solver3[method](1, 2, 3)).to.be.a('string');
          });
        });
      }

      alias('isNeq');
      alias('isEq');
      alias('isGt');
      alias('isGte');
      alias('isLt');
      alias('isLte');
    });

    describe('solver.solve', function() {

      it('should solve a trivial case when targeted', function() {
        let solver = new Solver({});
        solver.declRange('A', 1, 2);

        expect(solver.solve({vars: ['A']})).to.eql([{A: 1}, {A: 2}]);
      });

      it('should solve a trivial case when not targeted', function() {
        let solver = new Solver({});
        solver.declRange('A', 1, 2);

        expect(solver.solve()).to.eql([{A: [1, 2]}]);
      });

      function forLevel(level) {
        it('should accept all log levels (' + level + ')', function() {
          let solver = new Solver();

          expect(solver.solve({log: level})).to.eql([{}]);
        });

        it('should accept all dbg levels (' + level + ')', function() {
          let solver = new Solver();

          expect(solver.solve({dbg: level})).to.eql([{}]);
        });
      }

      forLevel(undefined);
      forLevel(null);
      forLevel(false);
      forLevel(true);
      forLevel(LOG_NONE);
      forLevel(LOG_STATS);
      forLevel(LOG_SOLVES);
      forLevel(LOG_MAX);
      forLevel(LOG_MIN);
    });

    describe('solver._prepare', function() {

      it('should prepare for war', function() {
        let solver = new Solver();

        solver._prepare({});
        expect(true).to.equal(true);
      });

      it('should not require options object', function() {
        let solver = new Solver();

        solver._prepare({});
        expect(true).to.equal(true);
      });
    });

    describe('Solver.domainFromList', function() {

      it('should map to domainFromList', function() {
        expect(Solver.domainFromList([1, 2, 4, 5, 7, 9, 10, 11, 12, 13, 15, 118])).to.eql(fixt_arrdom_ranges([1, 2], [4, 5], [7, 7], [9, 13], [15, 15], [118, 118]));
      });

      it('should always return an array even for small domains', function() {
        expect(Solver.domainFromList([1, 2, 4, 5, 7, 9, 10, 11, 12, 13, 15])).to.eql([1, 2, 4, 5, 7, 7, 9, 13, 15, 15]);
      });
    });
  });

  describe('API integration tests', function() {

    it('4 branch 2 level example w/ string vars (binary)', function() {

      /*
      A
        1
        2 - B
        3     1
              2
              3
      C
        1
        2 - D
        3     1
              2
              3
      */

      let solver = new Solver();

      // branch vars
      solver.decls(['A', 'C', 'B', 'D']);

      // path vars
      let Avars = ['A1', 'A2', 'A3'];
      let Bvars = ['B1', 'B2', 'B3'];
      let Cvars = ['C1', 'C2', 'C3'];
      let Dvars = ['D1', 'D2', 'D3'];
      solver.decls([].concat(Avars, Bvars, Cvars, Dvars), fixt_arrdom_range(0, 1));

      // path to branch binding
      solver.sum(Avars, 'A');
      solver.sum(Bvars, 'B');
      solver.sum(Cvars, 'C');
      solver.sum(Dvars, 'D');

      // root branches must be on
      solver.eq('A', 1);
      solver.eq('C', 1);

      // child-parent binding
      solver.eq('B', 'A2');
      solver.eq('D', 'C2');

      // D & B counterpoint
      solver.isEq('B', 'D', solver.declRange('BsyncD', 0, 1));

      let BD1 = solver.isEq('B1', 'D1');
      solver.gte(BD1, 'BsyncD');
      let BD2 = solver.isEq('B2', 'D2');
      solver.gte(BD2, 'BsyncD');
      let BD3 = solver.isEq('B3', 'D3');
      solver.gte(BD3, 'BsyncD');

      solver.solve();

      expect(countSolutions(solver)).to.equal(19);
    });

    it('4 branch 2 level example w/ var objs (binary)', function() {

      /*
      A
        1
        2 - B
        3     1
              2
              3
      C
        1
        2 - D
        3     1
              2
              3
       */

      let solver = new Solver();

      let branches = {
        A: 3,
        B: 3,
        C: 3,
        D: 3,
      };

      let pathCount = 3;
      for (let branchId in branches) {
        solver.decl(branchId, fixt_arrdom_range(0, 1));
        let pathVars = [];
        for (let i = 1; i <= pathCount; ++i) {
          pathVars.push(branchId + i);
        }
        solver.decls(pathVars);
        // path to branch binding
        solver.sum(pathVars, branchId);
      }

      // root branches must be on
      solver.eq('A', 1);
      solver.eq('C', 1);

      // child-parent binding
      solver.eq('B', 'A2');
      solver.eq('D', 'C2');

      // D & B counterpoint
      //S.isEq 'B', 'D', S.decl('BsyncD')

      let BD = solver.isEq('B', 'D');
      solver.lte(BD, solver.isEq('B1', 'D1'));
      solver.lte(BD, solver.isEq('B2', 'D2'));
      solver.lte(BD, solver.isEq('B3', 'D3'));

      solver.solve();

      expect(countSolutions(solver), 'solution count').to.equal(19);
    });

    it('4 branch 2 level example w/ var objs (non-binary)', function() {

      /*
      A
        1
        2 - B
        3     1
              2
              3
      C
        1
        2 - D
        3     1
              2
              3
       */

      let solver = new Solver();

      solver.declRange('A', 0, 3);
      solver.declRange('B', 0, 3);
      solver.declRange('C', 0, 3);
      solver.declRange('D', 0, 3);

      // root branches must be on
      solver.gte('A', 1);
      solver.gte('C', 1);

      // child-parent binding
      let A = solver.isEq('A', 2);
      let B = solver.isGt('B', 0);
      solver.eq(A, B);
      let C = solver.isEq('C', 2);
      let D = solver.isGt('D', 0);
      solver.eq(C, D);

      // Synchronize D & B if possible
      // if B > 0 and D > 0, then B == D
      solver.gte(
        solver.isEq('B', 'D'),
        solver.isEq(
          solver.isGt('B', 0),
          solver.isGt('D', 0)
        )
      );

      solver.solve();

      expect(countSolutions(solver)).to.equal(19);
    });
  });

  describe('plain tests', function() {

    it('should solve a sparse domain', function() {
      let solver = new Solver({});

      solver.decl('item1', fixt_arrdom_range(1, 5));
      solver.decl('item2', [2, 2, 4, 5]); // TODO: restore to specDomainCreateRanges([2, 2], [4, 5]));
      solver.decl('item3', fixt_arrdom_range(1, 5));
      solver.decl('item4', fixt_arrdom_range(4, 4));
      solver.decl('item5', fixt_arrdom_range(1, 5));

      solver.lt('item1', 'item2');
      solver.lt('item2', 'item3');
      solver.lt('item3', 'item4');
      solver.lt('item4', 'item5');

      let solutions = solver.solve();

      expect(countSolutions(solver)).to.equal(1);
      expect(solutions[0].item1, 'item1').to.equal(1);
      expect(solutions[0].item2, 'item2').to.equal(2);
    });

    it('should reject a simple > test (regression)', function() {
      // regression: x>y was wrongfully mapped to y<=x
      let solver = new Solver({});

      solver.decl('item5', fixt_arrdom_range(1, 5));
      solver.decl('item4', [2, 2, 3, 5]); // TODO: restore to specDomainCreateRanges([2, 2], [3, 5]));
      solver.decl('item3', fixt_arrdom_range(1, 5));
      solver.decl('item2', fixt_arrdom_range(4, 4));
      solver.decl('item1', fixt_arrdom_range(1, 5));

      solver.eq('item5', 5);
      solver.gt('item1', 'item2');
      solver.gt('item2', 'item3');
      solver.gt('item3', 'item4');
      solver.gt('item4', 'item5');

      // there is no solution since item 5 must be 5 and item 2 must be 4
      solver.solve();

      expect(countSolutions(solver), 'solution count').to.equal(0);
    });

    it('should solve a simple >= test', function() {
      let solver = new Solver({});

      solver.decl('item5', fixt_arrdom_range(1, 5));
      solver.decl('item4', fixt_arrdom_nums(2, 3, 5));
      solver.decl('item3', fixt_arrdom_range(1, 5));
      solver.decl('item2', fixt_arrdom_range(4, 5));
      solver.decl('item1', fixt_arrdom_range(1, 5));

      solver.eq('item5', 5);
      solver.gte('item1', 'item2');
      solver.gte('item2', 'item3');
      solver.gte('item3', 'item4');
      solver.gte('item4', 'item5');

      solver.solve({});

      // only solution is where everything is `5`
      expect(countSolutions(solver)).to.equal(1);
    });

    it('should solve a simple < test', function() {
      let solver = new Solver({});

      solver.decl('item5', fixt_arrdom_range(1, 5));
      solver.decl('item4', fixt_arrdom_range(4, 4));
      solver.decl('item3', fixt_arrdom_range(1, 5));
      solver.decl('item2', fixt_arrdom_nums(2, 3, 5));
      solver.decl('item1', fixt_arrdom_range(1, 5));

      solver.eq('item5', 5);
      solver.lt('item1', 'item2');
      solver.lt('item2', 'item3');
      solver.lt('item3', 'item4');
      solver.lt('item4', 'item5');

      solver.solve();

      // only solution is where each var is prev+1, 1 2 3 4 5
      expect(countSolutions(solver)).to.equal(1);
    });

    it('should solve a simple / test', function() {
      let solver = new Solver({});

      solver.declRange('A', 50, 100);
      solver.declRange('B', 5, 10);
      solver.declRange('C', 0, 100);

      solver.div('A', 'B', 'C');
      solver.eq('C', 15);

      let solutions = solver.solve();

      // there are two integer solutions (75/5 and 90/6) and
      // 9 fractional solutions whose floor result in 15
      expect(countSolutions(solver)).to.equal(11);

      // there are two cases where A/B=15 with input ranges:
      expect(stripAnonVarsFromArrays(solutions)).to.eql([{
        A: 75,
        B: 5,
        C: 15,
      }, {
        A: 76,
        B: 5,
        C: 15, // floored
      }, {
        A: 77,
        B: 5,
        C: 15, // floored
      }, {
        A: 78,
        B: 5,
        C: 15, // floored
      }, {
        A: 79,
        B: 5,
        C: 15, // floored
      }, {
        A: 90,
        B: 6,
        C: 15,
      }, {
        A: 91,
        B: 6,
        C: 15, // floored
      }, {
        A: 92,
        B: 6,
        C: 15, // floored
      }, {
        A: 93,
        B: 6,
        C: 15, // floored
      }, {
        A: 94,
        B: 6,
        C: 15, // floored
      }, {
        A: 95,
        B: 6,
        C: 15, // floored
      }]);
    });

    it('should solve another simple / test', function() {
      let solver = new Solver({});

      solver.declRange('A', 3, 5);
      solver.declRange('B', 2, 2);
      solver.declRange('C', 0, 100);

      solver.div('A', 'B', 'C');
      solver.eq('C', 2);

      let solutions = solver.solve();

      // expecting two solutions; one integer division and one floored fractional division
      expect(countSolutions(solver)).to.equal(2);

      // there is only one case where 3~5 / 2 equals 2 and that is when A is 4.
      // but when flooring results, 5/2=2.5 -> 2, so there are two answers
      expect(stripAnonVarsFromArrays(solutions)).to.eql([{
        A: 4,
        B: 2,
        C: 2,
      }, {
        A: 5,
        B: 2,
        C: 2, // floored
      }]);
    });

    it('should solve a simple * test', function() {
      let solver = new Solver({});

      solver.declRange('A', 3, 8);
      solver.declRange('B', 2, 10);
      solver.declRange('C', 0, 100);

      solver.mul('A', 'B', 'C');
      solver.eq('C', 30);

      let solutions = solver.solve();

      expect(countSolutions(solver)).to.equal(3);

      // 3*10=30
      // 5*6=30
      // 6*5=30
      expect(stripAnonVarsFromArrays(solutions)).to.eql([{
        A: 3,
        B: 10,
        C: 30,
      }, {
        A: 5,
        B: 6,
        C: 30,
      }, {
        A: 6,
        B: 5,
        C: 30,
      }]);
    });

    it('should solve a simple - test', function() {
      let solver = new Solver({});
      solver.decl('A', 400);
      solver.decl('B', 50);
      solver.decl('C', fixt_arrdom_range(0, 10000));

      solver.minus('A', 'B', 'C');

      let solutions = solver.solve();

      expect(solutions).to.eql([{
        A: 400,
        B: 50,
        C: 350,
      }]);
    });

    it('should not skip over when a var only has one propagator and is affected', function() {
      // this is more thoroughly tested with space unit tests
      let solver = new Solver({});
      solver.decl('A', fixt_arrdom_range(0, 1));
      solver.decl('B', fixt_arrdom_range(0, 1));

      solver.neq('A', 'B');

      solver.solve();

      expect(countSolutions(solver)).to.eql(2); // 0 1, and 1 0
    });
  });

  describe('targeting vars', function() {

    it('should want to solve all vars if targets are not set at all', function() {
      let solver = new Solver();

      solver.declRange('A', 0, 1);
      solver.declRange('B', 0, 1);
      solver.declRange('C', 0, 1);
      solver.isEq('A', 'B', solver.decl('AnotB', [0, 1]));

      let solutions = solver.solve({});
      // a, b, c are not constrained in any way, so 2^3=8
      // no var is targeted so they should all solve
      // however, the constraint will force A and B to solve
      // to a single value, where C is left as "any"
      expect(countSolutions(solver)).to.equal(8);
      expect(solutions).to.eql([
        {A: 0, B: 0, C: [0, 1], AnotB: 1},
        {A: 0, B: 1, C: [0, 1], AnotB: 0},
        {A: 1, B: 0, C: [0, 1], AnotB: 0},
        {A: 1, B: 1, C: [0, 1], AnotB: 1},
      ]);
    });

    it('should throw if explicitly targeting no vars', function() {
      let solver = new Solver();

      solver.declRange('A', 0, 1);
      solver.declRange('B', 0, 1);
      solver.declRange('C', 0, 1);
      solver.isEq('A', 'B', solver.decl('AnotB'));

      expect(_ => solver.solve({vars: []})).to.throw('ONLY_USE_WITH_SOME_TARGET_VARS');
    });

    it('should ignore C when only A and B are targeted', function() {
      let solver = new Solver();

      solver.declRange('A', 0, 1);
      solver.declRange('B', 0, 1);
      solver.declRange('C', 0, 1);
      solver.isEq('A', 'B', solver.decl('AnotB', [0, 1]));

      let solutions = solver.solve({vars: ['A', 'B']});
      // A and B are targeted, they have [0,1] [0,1] so
      // 4 solutions. the result of C is irrelevant here
      // so that's x2=8 (pretty much same as before)
      expect(countSolutions(solver)).to.equal(8);
      expect(solutions).to.eql([
        {A: 0, B: 0, C: [0, 1], AnotB: 1},
        {A: 0, B: 1, C: [0, 1], AnotB: 0},
        {A: 1, B: 0, C: [0, 1], AnotB: 0},
        {A: 1, B: 1, C: [0, 1], AnotB: 1},
      ]);
    });

    it('should ignore A when only B and C are targeted', function() {
      let solver = new Solver();

      solver.declRange('A', 0, 1);
      solver.declRange('B', 0, 1);
      solver.declRange('C', 0, 1);
      solver.isEq('A', 'B');

      solver.solve({vars: ['B', 'C']});
      // B and C are targeted, they have [0,1] [0,1] so
      // 4 solutions. the result of A is irrelevant so x2
      // and here the reifier is not a constraint on its
      // so that's another x2 total(l)ing 16.
      expect(countSolutions(solver)).to.equal(16);
    });

    it('should not solve anonymous vars if no targets given', function() {
      let solver = new Solver();

      solver.declRange('A', 0, 1);
      solver.declRange('B', 0, 1);
      solver.isEq('A', 'B');

      solver.solve({});
      // internally there will be three vars; A B and the reifier result var
      // make sure we don't accidentally require to solve that one too
      expect(countSolutions(solver)).to.equal(4);
    });

    it('should be capable of solving an anonymous var', function() {
      let solver = new Solver();

      solver.declRange('A', 0, 1);
      solver.declRange('B', 0, 1);
      let anon = solver.isEq('A', 'B');

      solver.solve({vars: [anon]});
      // the anonymous var will be boolean. since we only target
      // that var, there ought to be two solutions (0 and 1) for
      // it and any for the others, 2x2x2=8
      expect(countSolutions(solver)).to.equal(8);
    });
  });

  describe('targeting values', function() {

    it('should support a function comparator', function() {
      let solver = new Solver();
      solver.decl('a', fixt_arrdom_range(0, 100));
      solver.decl('b', fixt_arrdom_range(0, 100));
      solver.neq('a', 'b');

      let called = false;
      solver.solve({max: 1, distribute: {valueStrategy: function(space, varIndex, choiceIndex) {
        called = true;
        expect(space._class).to.eql('$space');
        expect(varIndex).to.be.a('number');
        expect(choiceIndex).to.be.a('number');
      }}});

      expect(called, 'the callback should be called at least once').to.eql(true);
    });
  });

  describe('brute force entire space', function() {

    it('should solve a single unconstrainted var', function() {
      let solver = new Solver({});
      solver.declRange('A', 1, 2);
      solver.solve();

      // A solves to 1 or 2
      expect(countSolutions(solver)).to.eql(2);
    });

    it('should combine multiple unconstrained vars when targeted', function() {
      let solver = new Solver({});

      solver.declRange('_ROOT_BRANCH_', 0, 1);
      solver.decl('SECTION', 1);
      solver.decl('VERSE_INDEX', fixt_arrdom_nums(2, 4, 9));
      solver.declRange('ITEM_INDEX', 1, 2);
      solver.declRange('align', 1, 2);
      solver.declRange('text_align', 1, 2);
      solver.decl('SECTION&n=1', 1);
      solver.decl('VERSE_INDEX&n=1', fixt_arrdom_nums(5, 6, 8));
      solver.decl('ITEM_INDEX&n=1', 2);
      solver.declRange('align&n=1', 1, 2);
      solver.declRange('text_align&n=1', 1, 2);
      solver.decl('SECTION&n=2', 1);
      solver.decl('VERSE_INDEX&n=2', fixt_arrdom_nums(1, 3, 7));
      solver.decl('ITEM_INDEX&n=2', 3);
      solver.declRange('align&n=2', 1, 2);
      solver.declRange('text_align&n=2', 1, 2);

      solver.solve({max: 10000, vars: solver.config.allVarNames.slice(0)});

      // 2×3×2×2×2×3×2×2×3×2×2 (size of each domain multiplied)
      // there are no constraints so it's just all combinations
      expect(countSolutions(solver)).to.eql(6912);
    });

    it('should return all domains as is when not targeted', function() {
      let solver = new Solver({});

      solver.declRange('_ROOT_BRANCH_', 0, 1);
      solver.decl('SECTION', 1);
      solver.decl('VERSE_INDEX', fixt_arrdom_nums(2, 4, 9));
      solver.declRange('ITEM_INDEX', 1, 2);
      solver.declRange('align', 1, 2);
      solver.declRange('text_align', 1, 2);
      solver.decl('SECTION&n=1', 1);
      solver.decl('VERSE_INDEX&n=1', fixt_arrdom_nums(5, 6, 8));
      solver.decl('ITEM_INDEX&n=1', 2);
      solver.declRange('align&n=1', 1, 2);
      solver.declRange('text_align&n=1', 1, 2);
      solver.decl('SECTION&n=2', 1);
      solver.decl('VERSE_INDEX&n=2', fixt_arrdom_nums(1, 3, 7));
      solver.decl('ITEM_INDEX&n=2', 3);
      solver.declRange('align&n=2', 1, 2);
      solver.declRange('text_align&n=2', 1, 2);

      solver.solve({max: 10000});

      // same as before but none are targeted so algo considers them
      // "solved" and returns all valid values (=init) so it becomes
      // a multiplication of all the number of options...
      // 2x1x3x2x2x2x1x3x1x2x2x1x3x1x2x2=6912
      expect(countSolutions(solver)).to.eql(6912);
    });

    it('should constrain one var to be equal to another', function() {
      let solver = new Solver({});

      solver.declRange('_ROOT_BRANCH_', 0, 1);
      solver.decl('SECTION', 1);
      solver.decl('VERSE_INDEX', fixt_arrdom_nums(2, 4, 9));
      solver.declRange('ITEM_INDEX', 1, 2);
      solver.declRange('align', 1, 2);
      solver.declRange('text_align', 1, 2);
      solver.decl('SECTION&n=1', 1);
      solver.decl('VERSE_INDEX&n=1', fixt_arrdom_nums(5, 6, 8));
      solver.decl('ITEM_INDEX&n=1', 2);
      solver.declRange('align&n=1', 1, 2);
      solver.declRange('text_align&n=1', 1, 2);
      solver.decl('SECTION&n=2', 1);
      solver.decl('VERSE_INDEX&n=2', fixt_arrdom_nums(1, 3, 7));
      solver.decl('ITEM_INDEX&n=2', 3);
      solver.declRange('align&n=2', 1, 2);
      solver.declRange('text_align&n=2', 1, 2);

      solver.eq('_ROOT_BRANCH_', 'SECTION');

      solver.solve({max: 10000, vars: solver.config.allVarNames.slice(0)});

      // same as 'combine multiple unconstrained vars' but one var has one instead of two options, so /2
      // note: must target all vars explicitly or you'll validly get just one solution back.
      expect(countSolutions(solver)).to.eql(6912 / 2);
    });

    it('should allow useless constraints', function() {
      let solver = new Solver({});

      solver.decl('x2', 1);
      solver.declRange('_ROOT_BRANCH_', 0, 1); // becomes 1
      solver.decl('SECTION', 1);
      solver.decl('VERSE_INDEX', fixt_arrdom_nums(2, 4, 9));
      solver.declRange('ITEM_INDEX', 1, 2); // becomes 2
      solver.declRange('align', 1, 2);
      solver.declRange('text_align', 1, 2);
      solver.decl('SECTION&n=1', 1);
      solver.decl('VERSE_INDEX&n=1', fixt_arrdom_nums(5, 6, 8));
      solver.decl('ITEM_INDEX&n=1', 2);
      solver.declRange('align&n=1', 1, 2);
      solver.declRange('text_align&n=1', 1, 2);
      solver.decl('SECTION&n=2', 1);
      solver.decl('VERSE_INDEX&n=2', fixt_arrdom_nums(1, 3, 7));
      solver.decl('ITEM_INDEX&n=2', 3);
      solver.declRange('align&n=2', 1, 2);
      solver.declRange('text_align&n=2', 1, 2);

      solver.eq('_ROOT_BRANCH_', 'SECTION'); // root branch can only be 1 because section only has 1

      // these are meaningless since 'x2' is [0,1] and all the rhs have no zeroes
      solver.lte('x2', 'SECTION');
      solver.lte('x2', 'VERSE_INDEX');
      solver.lte('x2', 'ITEM_INDEX');
      solver.lte('x2', 'align');
      solver.lte('x2', 'text_align');
      solver.lte('x2', 'SECTION&n=1');
      solver.lte('x2', 'VERSE_INDEX&n=1');
      solver.lte('x2', 'ITEM_INDEX&n=1');
      solver.lte('x2', 'align&n=1');
      solver.lte('x2', 'text_align&n=1');
      solver.lte('x2', 'SECTION&n=2');
      solver.lte('x2', 'VERSE_INDEX&n=2');
      solver.lte('x2', 'ITEM_INDEX&n=2');
      solver.lte('x2', 'align&n=2');
      solver.lte('x2', 'text_align&n=2');

      solver.neq('ITEM_INDEX&n=1', 'ITEM_INDEX'); // the lhs is [2,2] and rhs is [1,2] so rhs must be [2,2]
      solver.neq('ITEM_INDEX&n=2', 'ITEM_INDEX'); // lhs is [3,3] and rhs [1,2] so this is a noop
      solver.neq('ITEM_INDEX&n=2', 'ITEM_INDEX&n=1'); // [2,2] and [3,3] so noop

      solver.solve({max: 10000});

      // only two conditions are relevant and cuts the space by 2x2, so we get 6912/4
      expect(countSolutions(solver)).to.eql(6912 / 4);
    });

    // there was a "sensible reason" why this test doesnt work but I forgot about it right now... :)
    it.skip('should resolve a simple sum with times case', function() {
      let solver = new Solver({});

      solver.declRange('A', 0, 10);
      solver.declRange('B', 0, 10);
      solver.declRange('MAX', 25, 25);
      solver.declRange('MUL', 0, 100);

      solver.mul('A', 'B', 'MUL');
      solver.lt('MUL', 'MAX');

      solver.solve({max: 10000, vars: ['A', 'B', 'MUL']});

      // There are 11x11=121 combinations (inc dupes)
      // There's a restriction that the product of
      // A and B must be lower than 25 so only a couple
      // of combinations are valid:
      // a*b<25
      // 0x0 0x1 0x2 0x3 0x4 0x5 0x6 0x7 0x8 0x9 0x10
      // 1x0 1x1 1x2 1x3 1x4 1x5 1x6 1x7 1x8 1x9 1x10
      // 2x0 2x1 2x2 2x3 2x4 2x5 2x6 2x7 2x8 2x9 2x10
      // 3x0 3x1 3x2 3x3 3x4 3x5 3x6 3x7 3x8 <| 3x9 3x10
      // 4x0 4x1 4x2 4x3 4x4 4x5 4x6 <| 4x7 4x8 4x9 4x10
      // 5x0 5x1 5x2 5x3 5x4 <| 5x5 5x6 5x7 5x8 5x9 5x10
      // 6x0 6x1 6x2 6x3 6x4 <| 6x5 6x6 6x7 6x8 6x9 6x10
      // 7x0 7x1 7x2 7x3 <| 7x4 7x5 7x6 7x7 7x8 7x9 7x10
      // 8x0 8x1 8x2 8x3 <| 8x4 8x5 8x6 8x7 8x8 8x9 8x10
      // 9x0 9x1 9x2 <| 9x3 9x4 9x5 9x6 9x7 9x8 9x9 9x10
      // 10x0 10x1 10x2 <| 10x3 10x4 10x5 10x6 10x7 10x8 10x9 10x10
      // Counting everything to the left of <| you
      // get 73 combos of A and B that result in A*B<25
      expect(countSolutions(solver)).to.eql(73);
    });

    it('should solve a simplified case from old PathBinarySolver tests', function() {
      let solver = new Solver({});

      solver.declRange('x2', 1, 1);
      solver.declRange('x3', 0, 0);
      solver.declRange('x4', 2, 2);
      solver.declRange('x5', 4, 4);
      solver.declRange('x6', 9, 9);
      solver.declRange('x7', 5, 5);
      solver.declRange('x8', 6, 6);
      solver.declRange('x9', 8, 8);
      solver.declRange('x10', 3, 3);
      solver.declRange('x11', 7, 7);
      solver.declRange('x12', 0, 1); // -> 1
      solver.declRange('x13', 0, 1); // -> 0
      solver.declRange('x14', 0, 1); // -> 0
      solver.declRange('_ROOT_BRANCH_', 0, 1); // -> 1
      solver.decl('SECTION', 1);
      solver.decl('VERSE_INDEX', fixt_arrdom_nums(2, 4, 9)); // -> 4
      solver.declRange('ITEM_INDEX', 1, 1);
      solver.declRange('align', 1, 2);
      solver.declRange('text_align', 1, 2);
      solver.decl('SECTION&n=1', 1);
      solver.decl('VERSE_INDEX&n=1', fixt_arrdom_nums(5, 6, 8)); // -> 5 or 8
      solver.decl('ITEM_INDEX&n=1', 2);
      solver.declRange('align&n=1', 1, 2);
      solver.declRange('text_align&n=1', 1, 2);
      solver.decl('SECTION&n=2', 1);
      solver.decl('VERSE_INDEX&n=2', fixt_arrdom_nums(1, 3, 7)); // -> 3 or 7
      solver.decl('ITEM_INDEX&n=2', 3);
      solver.declRange('align&n=2', 1, 2);
      solver.declRange('text_align&n=2', 1, 2);

      solver.eq('_ROOT_BRANCH_', 'x2'); // root must be 1
      // these are meaningless
      solver.lte('x2', 'SECTION');
      solver.lte('x2', 'VERSE_INDEX');
      solver.lte('x2', 'ITEM_INDEX');
      solver.lte('x2', 'align');
      solver.lte('x2', 'text_align');
      solver.lte('x2', 'SECTION&n=1');
      solver.lte('x2', 'VERSE_INDEX&n=1');
      solver.lte('x2', 'ITEM_INDEX&n=1');
      solver.lte('x2', 'align&n=1');
      solver.lte('x2', 'text_align&n=1');
      solver.lte('x2', 'SECTION&n=2');
      solver.lte('x2', 'VERSE_INDEX&n=2');
      solver.lte('x2', 'ITEM_INDEX&n=2');
      solver.lte('x2', 'align&n=2');
      solver.lte('x2', 'text_align&n=2');
      // item_index is 1 so the others cannot be 1
      solver.neq('ITEM_INDEX&n=1', 'ITEM_INDEX'); // 2 (noop)
      solver.neq('ITEM_INDEX&n=2', 'ITEM_INDEX'); // 3 (noop)
      solver.neq('ITEM_INDEX&n=2', 'ITEM_INDEX&n=1'); // 2!=3 (noop)
      // constraints are enforced with an eq below. the first must be on, the second/third must be off.
      solver.isEq('VERSE_INDEX', 'x5', 'x12');
      solver.isEq('VERSE_INDEX&n=1', 'x8', 'x13');
      solver.isEq('VERSE_INDEX&n=2', 'x2', 'x14');
      solver.eq('x12', 'x2'); // so vi must be 4 (it can be)
      solver.eq('x13', 'x3'); // so vi1 must not be 6 (so 5 or 8)
      solver.eq('x14', 'x3'); // so vi2 must not be 1 (so 3 or 7)

      solver.solve({
        max: 10000,
        vars: [
          '_ROOT_BRANCH_',
          'SECTION',
          'VERSE_INDEX',
          'ITEM_INDEX',
          'align',
          'text_align',
          'SECTION&n=1',
          'VERSE_INDEX&n=1',
          'ITEM_INDEX&n=1',
          'align&n=1',
          'text_align&n=1',
          'SECTION&n=2',
          'VERSE_INDEX&n=2',
          'ITEM_INDEX&n=2',
          'align&n=2',
          'text_align&n=2',
        ],
      });

      // 2×2×2×2×2×2×2×2=256
      expect(countSolutions(solver)).to.eql(256);
    });

    it('should solve 4 branch 2 level example (binary)', function() {

      /*
      A
        1
        2 - B
        3     1
              2
              3
      C
        1
        2 - D
        3     1
              2
              3
       */

      let branchVars = ['A', 'C', 'B', 'D'];
      // path vars
      let Avars = ['A1', 'A2', 'A3'];
      let Bvars = ['B1', 'B2', 'B3'];
      let Cvars = ['C1', 'C2', 'C3'];
      let Dvars = ['D1', 'D2', 'D3'];
      let pathVars = [].concat(Avars, Bvars, Cvars, Dvars);

      let solver = new Solver();
      solver.decls(branchVars, fixt_arrdom_range(0, 1));
      solver.decls(pathVars, fixt_arrdom_range(0, 1));

      // path to branch binding
      solver.sum(Avars, 'A');
      solver.sum(Bvars, 'B');
      solver.sum(Cvars, 'C');
      solver.sum(Dvars, 'D');

      // root branches must be on
      solver.eq('A', 1);
      solver.eq('C', 1);

      // child-parent binding
      solver.eq('B', 'A2');
      solver.eq('D', 'C2');

      // D & B counterpoint
      solver.declRange('BsyncD', 0, 1);
      solver.isEq('B', 'D', 'BsyncD');
      solver.gte(solver.isEq('B1', 'D1'), 'BsyncD');
      solver.gte(solver.isEq('B2', 'D2'), 'BsyncD');
      solver.gte(solver.isEq('B3', 'D3'), 'BsyncD');

      solver.solve({
        distribute: 'fail_first',
        vars: pathVars,
      });

      expect(countSolutions(solver)).to.equal(19);
    });

    it('quick minus test', function() {
      let solver = new Solver();

      solver.decl('A', [1, 1]);
      solver.decl('B', [1, 1]);
      solver.decl('C', [0, 1]);

      solver.minus('A', 'B', 'C');
      solver.solve();

      expect(solver.solutions).to.eql([{A: 1, B: 1, C: 0}]);
    });

    it('should solve a regression case', function() {

      let solver = new Solver();
      solver.decl('A', [0, 1]);
      solver.decl('B', [0, 1]);
      solver.decl('C', [0, 1]);

      // path to branch binding
      solver.sum(['A', 'B', 'C'], 1);

      solver.solve({});

      expect(stripAnonVarsFromArrays(solver.solutions)).to.eql([
        {A: 0, B: 0, C: 1},
        {A: 0, B: 1, C: 0},
        {A: 1, B: 0, C: 0},
        // the bug would return an extra solution here and no other test would catch it
      ]);
    });
  });

  describe('reifiers', function() {

    it('should resolve a simple reified eq case', function() {
      let solver = new Solver({});

      solver.declRange('ONE', 1, 1);
      solver.declRange('FOUR', 4, 4);
      solver.decl('LIST', fixt_arrdom_nums(2, 4, 9)); // becomes 4
      solver.declRange('IS_LIST_FOUR', 0, 1); // becomes 1

      solver.isEq('LIST', 'FOUR', 'IS_LIST_FOUR');
      solver.eq('IS_LIST_FOUR', 'ONE');

      solver.solve({max: 10000});

      // list can be one of three elements.
      // there is a bool var that checks whether list is resolved to 4
      // there is a constraint that requires the above bool to be 1
      // ergo; list must be 4 to satisfy all constraints
      // ergo; there is 1 possible solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve a simple reified !eq case', function() {
      let solver = new Solver({});

      solver.declRange('ZERO', 0, 0);
      solver.declRange('FOUR', 4, 4);
      solver.decl('LIST', fixt_arrdom_nums(2, 4, 9)); // becomes 4
      solver.declRange('IS_LIST_FOUR', 0, 1); // becomes 1

      solver.isEq('LIST', 'FOUR', 'IS_LIST_FOUR');
      solver.eq('IS_LIST_FOUR', 'ZERO');

      solver.solve({max: 10000});

      // list can be one of three elements.
      // there is a bool var that checks whether list is resolved to 4
      // there is a constraint that requires the above bool to be 0
      // ergo; list must be 2 or 9 to satisfy all constraints
      // ergo; there are 2 possible solutions
      expect(countSolutions(solver)).to.eql(2);
    });

    it('should resolve a simple reified neq case', function() {
      let solver = new Solver({});

      solver.declRange('ONE', 1, 1);
      solver.declRange('FOUR', 4, 4);
      solver.decl('LIST', fixt_arrdom_nums(2, 4, 9)); // becomes 2 or 9
      solver.declRange('IS_LIST_FOUR', 0, 1); // becomes 1

      solver.isNeq('LIST', 'FOUR', 'IS_LIST_FOUR');
      solver.eq('IS_LIST_FOUR', 'ONE');

      solver.solve({max: 10000});

      // list can be one of three elements.
      // there is a bool var that checks whether list is resolved to 4
      // there is a constraint that requires the above bool to be 1
      // ergo; list must be 2 or 9 to satisfy all constraints
      // ergo; there are 2 possible solutions
      expect(countSolutions(solver)).to.eql(2);
    });

    it('should resolve a simple reified !neq case', function() {
      let solver = new Solver({});

      solver.declRange('ZERO', 0, 0);
      solver.declRange('FOUR', 4, 4);
      solver.decl('LIST', fixt_arrdom_nums(2, 4, 9)); // becomes 4
      solver.declRange('IS_LIST_FOUR', 0, 1); // becomes 0

      solver.isNeq('LIST', 'FOUR', 'IS_LIST_FOUR');
      solver.eq('IS_LIST_FOUR', 'ZERO');

      solver.solve({max: 10000});

      // list can be one of three elements.
      // there is a bool var that checks whether list is resolved to 4
      // there is a constraint that requires the above bool to be 0
      // ergo; list must be 4 to satisfy all constraints
      // ergo; there is 1 possible solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve a simple reified lt case', function() {
      let solver = new Solver({});

      solver.declRange('STATE', 1, 1);
      solver.declRange('ONE_TWO_THREE', 1, 3); // 1 2 or 3
      solver.declRange('THREE_FOUR_FIVE', 3, 5); // 3 4 or 5
      solver.declRange('IS_LT', 0, 1); // becomes 1

      solver.isLt('ONE_TWO_THREE', 'THREE_FOUR_FIVE', 'IS_LT');
      solver.eq('IS_LT', 'STATE');

      solver.solve({max: 10000});

      // two lists, 123 and 345
      // reified checks whether 123<345 which is only the case when
      // the 3 is dropped from at least one side
      // IS_LT is required to have one outcome
      // 3 + 3 + 2 = 8  ->  1:3 1:4 1:5 2:3 2:4 2:5 3:4 3:5
      expect(countSolutions(solver)).to.eql(8);
    });

    it('should resolve a simple reified !lt case', function() {
      let solver = new Solver({});

      solver.declRange('STATE', 0, 0);
      solver.declRange('ONE_TWO_THREE', 1, 3); // 3
      solver.declRange('THREE_FOUR_FIVE', 3, 5); // 3
      solver.declRange('IS_LT', 0, 1); // 0

      solver.isLt('ONE_TWO_THREE', 'THREE_FOUR_FIVE', 'IS_LT');
      solver.eq('IS_LT', 'STATE');

      solver.solve({max: 10000});

      // two lists, 123 and 345
      // reified checks whether 123<345 which is only the case when
      // the 3 is dropped from at least one side
      // IS_LT is required to have one outcome
      // since it must be 0, that is only when both lists are 3
      // ergo; one solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve a simple reified lte case', function() {
      let solver = new Solver({});

      solver.declRange('STATE', 1, 1);
      solver.declRange('ONE_TWO_THREE_FOUR', 1, 4); // 1 2 or 3
      solver.declRange('THREE_FOUR_FIVE', 3, 5); // 3 4 or 5
      solver.declRange('IS_LTE', 0, 1); // becomes 1

      solver.isLte('ONE_TWO_THREE_FOUR', 'THREE_FOUR_FIVE', 'IS_LTE');
      solver.eq('IS_LTE', 'STATE');

      solver.solve({max: 10000});

      // two lists, 123 and 345
      // reified checks whether 1234<=345 which is only the case when
      // the 4 is dropped from at least one side
      // IS_LTE is required to have one outcome
      // 3 + 3 + 3 + 2 = 11  ->  1:3 1:4 1:5 2:3 2:4 2:5 3:3 3:4 3:5 4:4 4:5
      expect(countSolutions(solver)).to.eql(11);
    });

    it('should resolve a simple reified !lte case', function() {
      let solver = new Solver({});

      solver.declRange('STATE', 0, 0);
      solver.declRange('ONE_TWO_THREE_FOUR', 1, 4); // 4
      solver.declRange('THREE_FOUR_FIVE', 3, 5); // 3
      solver.declRange('IS_LTE', 0, 1); // 0

      solver.isLte('ONE_TWO_THREE_FOUR', 'THREE_FOUR_FIVE', 'IS_LTE');
      solver.eq('IS_LTE', 'STATE');

      solver.solve({max: 10000});

      // two lists, 1234 and 345
      // reified checks whether 1234<=345 which is only the case when
      // the 4 is dropped from at least one side
      // IS_LTE is required to have one outcome
      // since it must be 0, that is only when left is 4 and right is 3
      // ergo; one solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve an even simpler reified !lte case', function() {
      let solver = new Solver({});

      solver.declRange('A', 4, 5);
      solver.declRange('B', 4, 4);
      solver.declRange('NO', 0, 0);

      solver.isLte('A', 'B', 'NO');

      solver.solve({max: 10000});

      // two lists, 1234 and 345
      // reified checks whether 1234<=345 which is only the case when
      // the 4 is dropped from at least one side
      // IS_LTE is required to have one outcome
      // since it must be 0, that is only when left is 4 and right is 3
      // ergo; one solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve a simple reified gt case', function() {
      let solver = new Solver({});

      solver.declRange('STATE', 1, 1);
      solver.declRange('ONE_TWO_THREE', 1, 3); // 1 2 or 3
      solver.declRange('THREE_FOUR_FIVE', 3, 5); // 3 4 or 5
      solver.declRange('IS_GT', 0, 1); // becomes 1

      solver.isGt('THREE_FOUR_FIVE', 'ONE_TWO_THREE', 'IS_GT');
      solver.eq('IS_GT', 'STATE');

      solver.solve({max: 10000});

      // two lists, 123 and 345
      // reified checks whether 345>123 which is only the case when
      // the 3 is dropped from at least one side
      // IS_GT is required to have one outcome
      // 3 + 3 + 2 = 8  ->  3:1 4:1 5:1 3:2 4:2 5:2 3:1 3:2
      expect(countSolutions(solver)).to.eql(8);
    });

    it('should resolve a simple reified !gt case', function() {
      let solver = new Solver({});

      solver.declRange('STATE', 0, 0);
      solver.declRange('ONE_TWO_THREE', 1, 3); // 3
      solver.declRange('THREE_FOUR_FIVE', 3, 5); // 3
      solver.declRange('IS_GT', 0, 1); // 0

      solver.isGt('THREE_FOUR_FIVE', 'ONE_TWO_THREE', 'IS_GT');
      solver.eq('IS_GT', 'STATE');

      solver.solve({max: 10000});

      // two lists, 123 and 345
      // reified checks whether 123<345 which is only the case when
      // the 3 is dropped from at least one side
      // IS_GT is required to have one outcome
      // since it must be 0, that is only when both lists are 3
      // ergo; one solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve a simple reified gte case', function() {
      let solver = new Solver({});

      solver.declRange('STATE', 1, 1);
      solver.declRange('ONE_TWO_THREE_FOUR', 1, 4); // 1 2 or 3
      solver.declRange('THREE_FOUR_FIVE', 3, 5); // 3 4 or 5
      solver.declRange('IS_GTE', 0, 1); // becomes 1

      solver.isGte('THREE_FOUR_FIVE', 'ONE_TWO_THREE_FOUR', 'IS_GTE');
      solver.eq('IS_GTE', 'STATE');

      solver.solve({max: 10000});

      // two lists, 1234 and 345
      // reified checks whether 345>=1234 which is only the case when
      // left is not 3 or right is not 4
      // IS_GTE is required to have one outcome
      // 3 + 3 + 3 + 2 = 11  ->
      //     3:1 4:1 5:1
      //     3:2 4:2 5:2
      //     3:3 4:3 5:3
      //     4:4 5:4
      //     5:5
      expect(countSolutions(solver)).to.eql(11);
    });

    it('should resolve an already solved 5>=4 trivial gte case', function() {
      let solver = new Solver({});

      solver.decl('A', 5);
      solver.decl('B', 4);
      solver.decl('YES', 1);

      solver.isGte('A', 'B', 'YES');

      solver.solve({max: 10000});

      // the input is already solved and there is only one solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve an already solved 4>=4 trivial gte case', function() {
      let solver = new Solver({});

      solver.decl('A', 4);
      solver.decl('B', 4);
      solver.decl('YES', 1);

      solver.isGte('A', 'B', 'YES');

      solver.solve({max: 10000});

      // the input is already solved and there is only one solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve a simple reified !gte case', function() {
      let solver = new Solver({});

      solver.decl('STATE', 0);
      solver.declRange('ONE_TWO_THREE_FOUR', 1, 4); // 4
      solver.declRange('THREE_FOUR_FIVE', 3, 5); // 3
      solver.declRange('IS_GTE', 0, 1); // 0

      solver.isGte('THREE_FOUR_FIVE', 'ONE_TWO_THREE_FOUR', 'IS_GTE');
      solver.eq('IS_GTE', 'STATE');

      solver.solve({max: 10000});

      // two lists, 123 and 345
      // reified checks whether 1234<=345 which is only the case when
      // the 4 is dropped from at least one side
      // IS_LTE is required to have one outcome
      // since it must be 0, that is only when left is 3 and right is 4
      // ergo; one solution
      expect(countSolutions(solver)).to.eql(1);
    });

    it('should resolve a simple sum with lte case', function() {
      let solver = new Solver({});

      solver.declRange('A', 0, 10);
      solver.declRange('B', 0, 10);
      solver.declRange('MAX', 5, 5);
      solver.declRange('SUM', 0, 100);

      solver.sum(['A', 'B'], 'SUM');
      solver.lte('SUM', 'MAX');

      solver.solve({max: 10000});

      // a+b<=5
      // so that's the case for: 0+0, 0+1, 0+2, 0+3,
      // 0+4, 0+5, 1+0, 1+1, 1+2, 1+3, 1+4, 2+0, 2+1,
      // 2+2, 2+3, 3+0, 3+1, 3+2, 4+0, 4+1, and 5+0
      // ergo: 21 solutions
      expect(countSolutions(solver)).to.eql(21);
    });

    it('should resolve a simple sum with lt case', function() {
      let solver = new Solver({});

      solver.declRange('A', 0, 10);
      solver.declRange('B', 0, 10);
      solver.declRange('MAX', 5, 5);
      solver.declRange('SUM', 0, 100);

      solver.sum(['A', 'B'], 'SUM');
      solver.lt('SUM', 'MAX');

      solver.solve({max: 10000});

      // a+b<5
      // so that's the case for: 0+0, 0+1, 0+2,
      // 0+3, 0+4, 1+0, 1+1, 1+2, 1+3, 2+0, 2+1,
      // 2+2, 3+0, 3+1, and 4+0
      // ergo: 16 solutions
      expect(countSolutions(solver)).to.eql(15);
    });

    it('should resolve a simple sum with gt case', function() {
      let solver = new Solver({});

      solver.declRange('A', 0, 10);
      solver.declRange('B', 0, 10);
      solver.declRange('MAX', 5, 5);
      solver.declRange('SUM', 0, 100);

      solver.sum(['A', 'B'], 'SUM');
      solver.gt('SUM', 'MAX');

      solver.solve({max: 10000});

      // a+b>5
      // there are 11x11=121 cases. a+b<=5 is 21 cases
      // (see other test) so there must be 100 results.
      expect(countSolutions(solver)).to.eql(100);
    });

    it('should resolve a simple sum with gte case', function() {
      let solver = new Solver({});

      solver.declRange('A', 0, 10);
      solver.declRange('B', 0, 10);
      solver.declRange('MAX', 5, 5);
      solver.declRange('SUM', 0, 100);

      solver.sum(['A', 'B'], 'SUM');
      solver.gte('SUM', 'MAX');

      solver.solve({max: 10000});

      // a+b>=5
      // there are 11x11=121 cases. a+b<5 is 15 cases
      // (see other test) so there must be 106 results.
      expect(countSolutions(solver)).to.eql(106);
    });
  });

  describe('gss poc', function() {

    it('with everything in finitedomain', function() {

      /*

      // assuming
      // ::window[width] is 1200
      // ::window[height] is 800

      #box1 {
        width:== 100;
        height:== 100;
      }
      #box2 {
        width: == 100;
        height: == 100;
      }

      #box1[right] == :window[center-x] - 10;
      #box2[left] == :window[center-x] + 10;

      #box1[center-y] == #box2[center-y] == ::window[center-y];

      */

      let solver = new Solver();
      solver.decl('VIEWPORT_WIDTH', 1200);
      solver.decl('VIEWPORT_HEIGHT', 800);
      solver.decls([
        // box1
        '#box1[x]',
        '#box1[width]',
        '#box1[y]',
        '#box1[height]',
        // box2
        '#box2[x]',
        '#box2[width]',
        '#box2[y]',
        '#box2[height]',
        // middle of the viewport, to be computed later
        'VIEWPORT_MIDDLE_HEIGHT',
        'VIEWPORT_MIDDLE_WIDTH',
      ]);

      // simple constraints
      // #box1 { width:== 100; height:== 100; } #box2 { width: == 100; height: == 100; }
      solver.eq('#box1[width]', 100);
      solver.eq('#box1[height]', 100);
      solver.eq('#box2[width]', 100);
      solver.eq('#box2[height]', 100);
      // make sure boxes are within viewport

      solver.lt('#box1[x]', solver.minus('VIEWPORT_WIDTH', '#box1[width]'));
      solver.lt('#box1[y]', solver.minus('VIEWPORT_HEIGHT', '#box1[height]'));
      solver.lt('#box2[x]', solver.minus('VIEWPORT_WIDTH', '#box2[width]'));
      solver.lt('#box2[y]', solver.minus('VIEWPORT_HEIGHT', '#box2[height]'));

      // VIEWPORT_WIDTH / 2
      solver.div('VIEWPORT_WIDTH', 2, 'VIEWPORT_MIDDLE_WIDTH');

      // #box1[right] == :window[center-x] - 10;
      // so: #box1[x] + #box[width] + 10 == VIEWPORT_MIDDLE_WIDTH
      solver.eq(solver.plus(solver.plus('#box1[x]', '#box1[width]'), 10), 'VIEWPORT_MIDDLE_WIDTH');

      // similar for #box2[left] == :window[center-x] + 10;
      solver.eq(solver.minus('#box2[x]', 10), 'VIEWPORT_MIDDLE_WIDTH');

      // #box1[center-y] == #box2[center-y] == ::window[center-y];
      // center-y = height/2 -> y=(height/2)-(box_height/2)
      solver.div('VIEWPORT_HEIGHT', 2, 'VIEWPORT_MIDDLE_HEIGHT');
      solver.minus('VIEWPORT_MIDDLE_HEIGHT', solver.div('#box1[height]', 2), '#box1[y]');
      solver.minus('VIEWPORT_MIDDLE_HEIGHT', solver.div('#box2[height]', 2), '#box2[y]');

      let solutions = solver.solve({max: 3});

      // viewport is 1200 x 800
      // boxes are 100x100
      // box1 is 10 left to center so box1.x = 1200/2-110=490
      // box2 is 10 right of center so box2.x = 1200/2+10=610
      // box1 and box2 are vertically centered, same height so same y: (800/2)-(100/2)=350

      expect(stripAnonVarsFromArrays(solutions)).to.eql([{
        '#box1[x]': 490, // 490+100+10=600=1200/2
        '#box1[width]': 100,
        '#box1[y]': 350,
        '#box1[height]': 100,
        '#box2[x]': 610,
        '#box2[width]': 100,
        '#box2[y]': 350,
        '#box2[height]': 100,

        'VIEWPORT_WIDTH': 1200,
        'VIEWPORT_HEIGHT': 800,
        'VIEWPORT_MIDDLE_WIDTH': 600,
        'VIEWPORT_MIDDLE_HEIGHT': 400,
      }]);

      expect(countSolutions(solver)).to.equal(1);
    });

    it('with viewport constants hardcoded', function() {

      /*

      // assuming
      // ::window[width] is 1200
      // ::window[height] is 800

      #box1 {
        width:== 100;
        height:== 100;
      }
      #box2 {
        width: == 100;
        height: == 100;
      }

      #box1[right] == :window[center-x] - 10;
      #box2[left] == :window[center-x] + 10;

      #box1[center-y] == #box2[center-y] == ::window[center-y];

      */

      let FLOOR = Math.floor;
      let VIEWPORT_WIDTH = 1200;
      let VIEWPORT_HEIGHT = 800;

      let solver = new Solver();
      let targets = [
        // box1
        '#box1[x]',
        '#box1[width]',
        '#box1[y]',
        '#box1[height]',
        // box2
        '#box2[x]',
        '#box2[width]',
        '#box2[y]',
        '#box2[height]',
      ];
      solver.decls(targets);

      // simple constraints
      // #box1 { width:== 100; height:== 100; } #box2 { width: == 100; height: == 100; }
      solver.eq('#box1[width]', 100);
      solver.eq('#box1[height]', 100);
      solver.eq('#box2[width]', 100);
      solver.eq('#box2[height]', 100);
      // make sure boxes are within viewport

      solver.lt('#box1[x]', solver.minus(VIEWPORT_WIDTH, '#box1[width]'));
      solver.lt('#box1[y]', solver.minus(VIEWPORT_HEIGHT, '#box1[height]'));
      solver.lt('#box2[x]', solver.minus(VIEWPORT_WIDTH, '#box2[width]'));
      solver.lt('#box2[y]', solver.minus(VIEWPORT_HEIGHT, '#box2[height]'));

      // VIEWPORT_WIDTH / 2
      let VIEWPORT_MIDDLE_WIDTH = FLOOR(VIEWPORT_WIDTH / 2);

      // #box1[right] == :window[center-x] - 10;
      // so: #box1[x] + #box[width] + 10 == VIEWPORT_MIDDLE_WIDTH
      solver.eq(solver.plus('#box1[x]', '#box1[width]'), VIEWPORT_MIDDLE_WIDTH - 10);

      // similar for #box2[left] == :window[center-x] + 10;
      solver.eq(VIEWPORT_MIDDLE_WIDTH + 10, '#box2[x]');

      // #box1[center-y] == #box2[center-y] == ::window[center-y];
      // center-y = height/2 -> y=(height/2)-(box_height/2)
      let VIEWPORT_MIDDLE_HEIGHT = FLOOR(VIEWPORT_HEIGHT / 2);
      solver.minus(VIEWPORT_MIDDLE_HEIGHT, solver.div('#box1[height]', 2), '#box1[y]');
      solver.minus(VIEWPORT_MIDDLE_HEIGHT, solver.div('#box2[height]', 2), '#box2[y]');

      let solutions = solver.solve({max: 3, vars: targets});

      // viewport is 1200 x 800
      // boxes are 100x100
      // box1 is 10 left to center so box1.x = 1200/2-110=490
      // box2 is 10 right of center so box2.x = 1200/2+10=610
      // box1 and box2 are vertically centered, same height so same y: (800/2)-(100/2)=350

      expect(stripAnonVarsFromArrays(solutions)).to.eql([{
        '#box1[x]': 490, // 490+100+10=600=1200/2
        '#box1[width]': 100,
        '#box1[y]': 350,
        '#box1[height]': 100,
        '#box2[x]': 610,
        '#box2[width]': 100,
        '#box2[y]': 350,
        '#box2[height]': 100,
      }]);

      expect(countSolutions(solver)).to.equal(1);
    });
  });

  describe('continue solved space', function() {

    it('should solve this in one go', function() {
      let solver = new Solver({});

      solver.declRange('A', 2, 5);
      solver.decl('B', fixt_arrdom_nums(2, 4, 5));
      solver.declRange('C', 1, 5);
      solver.lt('A', 'B');

      // in the next test we'll add this constraint afterwards
      solver.lt('C', 'A');

      // C could be either 1 or 2 to pass all the constraints
      solver.solve({
        vars: ['A', 'B', 'C'],
        max: 1,
      });
      expect(countSolutions(solver), 'solve count 1').to.eql(1);
      expect(solver.solutions[0].C < solver.solutions[0].B).to.equal(true);
    });

    it('should be able to continue a solution with extra vars', function() {
      let solver = new Solver({});

      solver.declRange('A', 2, 5);
      solver.decl('B', fixt_arrdom_nums(2, 4, 5));
      solver.declRange('C', 1, 5);
      solver.lt('A', 'B');

      // should find a solution for A and B
      solver.solve({
        vars: ['A', 'B'],
        max: 1,
      });
      // should not solve C yet because only A and B
      expect(countSolutions(solver), 'solve count 1').to.eql(5); // C started with 5 values and is unconstrained
      expect(solver.solutions).to.eql([{A: 2, B: 4, C: [1, 5]}]);

      let solver2 = solver.branch_from_current_solution();
      // add a new constraint to the space and solve it
      solver2.lt('C', 'A');

      solver2.solve({
        vars: ['A', 'B', 'C'],
        max: 1,
        test: 1,
      });

      // now C is constrained as well so all vars have one possible value
      expect(countSolutions(solver2), 'solve count 2').to.eql(1);
      expect(solver2.solutions[0].C < solver2.solutions[0].B).to.equal(true);
      expect(solver2.solutions).to.eql([{A: 2, B: 4, C: 1}]);
    });
  });

  describe('debugging options', function() {

    //it('should support _debugConfig', function() {
    //  let solver = new Solver();
    //
    //  solver.solve({_debugConfig: true});
    //
    //  expect(true).to.eql(true);
    //});

    //it('should support _debug bare', function() {
    //  let solver = new Solver();
    //  solver.solve({_debug: true});
    //
    //  expect(true).to.eql(true);
    //});

    it('should support _debug edge cases', function() {
      // note: this is only trying to improve test coverage in debugging
      // code. the actual test is not testing anything in particular.
      let solver = new Solver();
      solver.decl('a', fixt_arrdom_range(0, 100));
      solver.decl('b', fixt_arrdom_range(0, 100));
      solver.num(0);
      solver.eq('a', 'b');
      solver.isEq('a', 'b');

      solver.solve({_debug: true, vars: ['a', 'b']});

      expect(true).to.eql(true);
    });

    it('should work with exportBare', function() {
      let solver = new Solver({exportBare: true});

      let A = solver.decl('A', fixt_arrdom_nums(0, 1, 4, 5));
      let B = solver.declRange('B', 1, 10);
      let C = solver.num(5);
      solver.plus(A, B, C);
      solver.minus(A, B, C);
      solver.mul(A, B, C);
      solver.div(A, B, C);
      solver.mul(A, B, C);
      solver.sum([A, B], C);
      solver.product([A, B], C);
      solver.distinct([A, B, C]);
      solver.eq(A, B);
      solver.neq(A, B);
      solver.gte(A, B);
      solver.gt(A, B);
      solver.lte(A, B);
      solver.lt(A, B);
      solver.isEq(A, B, C);
      solver.isNeq(A, B, C);
      solver.isLt(A, B, C);
      solver.isLte(A, B, C);
      solver.isGt(A, B, C);
      solver.isGte(A, B, C);

      expect(solver.exported).to.be.a('string');
      console.log('Exported:');
      console.log(solver.exported);
      expect(solver.exported.split('\n').length).to.be.above(22); // 23 declarations above
    });

    it('should support _debugSpace', function() {
      let solver = new Solver();

      solver.solve({_debugSpace: true});

      expect(true).to.eql(true);
    });

    it('should support _debugSolver', function() {
      let solver = new Solver();

      solver.solve({_debugSolver: true});

      expect(true).to.eql(true);
    });
  });

  describe('Solver.dsl()', function() {

    it('should work', function() {
      expect(_ => Solver.dsl(`
        : A [0 10]
        : B [0 10]
        A != B
      `).solve()).not.to.throw();
    });
  });
});
