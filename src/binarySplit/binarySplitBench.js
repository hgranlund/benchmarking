const { createReadStream } = require('fs');
const split = require('binary-split');
const { devNullStream, toStream } = require('../testUtils');
const split2 = require('./binarySplitTransform');
const Benchmark = require('benchmark');
const { compareWithPrev } = require('../benchmarkUtils');

const influxResultBuffer = () =>
  createReadStream('src/binarySplit/influxResponse.json');

const suite = new Benchmark.Suite();
toStream(['aa', '\n', 'aa'])
  .pipe(new split2())
  .pipe(process.stdout);
suite
  .add(
    'binarySplit',
    deferred => {
      const stream = influxResultBuffer()
        .pipe(split('\n'))
        .on('end', () => deferred.resolve())
        .on('error', () => deferred.resolve());
      stream.pipe(devNullStream());
    },
    { defer: true },
  )
  .add(
    'binarySplit2',
    deferred => {
      const stream = influxResultBuffer()
        .pipe(new split2())
        .on('end', () => deferred.resolve())
        .on('error', () => deferred.resolve());
      stream.pipe(devNullStream());
    },
    { defer: true },
  )
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', event => {
    compareWithPrev(event, 'binarySplitBench');
    console.log(
      'Fastest is ' + event.currentTarget.filter('fastest').map('name'),
    );
  })
  .run();
