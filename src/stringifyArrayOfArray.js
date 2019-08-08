const Benchmark = require('benchmark');
const { compareWithPrev } = require('./benchmarkUtils');
const stringify = require('fast-stringify');

const values = new Array(10000).fill().map(() => [new Date(), null, 64]);

const suite = new Benchmark.Suite();

suite
  .add('fast-stringify', () => {
    return stringify(values).slice(1, -1);
  })
  .add('JSON.stringify', () => {
    return JSON.stringify(values).slice(1, -1);
  })
  .add('MapAndJoin', () => {
    return values
      .map(value => '[' + value.map(String).join(',') + ']')
      .join(',');
  })
  .add('ReduceConcat', () => {
    return values.reduce((str, value) => {
      str += '[' + value.map(String).join(',') + ']';
      return str;
    }, '');
  })
  .add('ForEachPush', () => {
    let string = '';
    values.forEach(value => {
      string += '[' + value.map(String).join(',') + '],';
    });
    return string;
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', event => {
    compareWithPrev(event, 'stringifyArrayOfArray');
    console.log(
      'Fastest is ' + event.currentTarget.filter('fastest').map('name'),
    );
  })

  .run();
