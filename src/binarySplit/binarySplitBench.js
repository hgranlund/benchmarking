const { createReadStream } = require('fs');
const binarySplit = require('binary-split');
const binarySplit2 = require('./binarySplit');
const split = require('split');
const { devNullStream } = require('../testUtils');
const binarySplitTransform = require('./binarySplitTransform');
const Benchmark = require('benchmark');
const { compareWithPrev } = require('../benchmarkUtils');
const bsplit = require('bsplit2');
const split2 = require('split2');

const hugeBuffer = () => createReadStream('src/data/loremIpsum-65kb.txt');

const suite = new Benchmark.Suite();

const stream = hugeBuffer()
  .pipe(new binarySplitTransform('lorem'))
  .pipe(process.stdout);

suite
  .add(
    'binarySplit',
    deferred => {
      const stream = hugeBuffer()
        .pipe(binarySplit('lorem'))
        .on('end', () => deferred.resolve())
        .on('error', () => deferred.resolve());
      stream.pipe(devNullStream());
    },
    { defer: true },
  )
  .add(
    'binarySplit2',
    deferred => {
      const stream = hugeBuffer()
        .pipe(binarySplit2('lorem'))
        .on('end', () => deferred.resolve())
        .on('error', () => deferred.resolve());
      stream.pipe(devNullStream());
    },
    { defer: true },
  )
  .add(
    'split',
    deferred => {
      const stream = hugeBuffer()
        .pipe(split('lorem'))
        .on('end', () => deferred.resolve())
        .on('error', () => deferred.resolve());
      stream.pipe(devNullStream());
    },
    { defer: true },
  )
  .add(
    'binarySplitTransform',
    deferred => {
      const stream = hugeBuffer()
        .pipe(new binarySplitTransform('lorem'))
        .on('end', () => deferred.resolve())
        .on('error', () => deferred.resolve());
      stream.pipe(devNullStream());
    },
    { defer: true },
  )
  .add(
    'bsplit',
    deferred => {
      const stream = hugeBuffer()
        .pipe(bsplit())
        .on('end', () => deferred.resolve())
        .on('error', () => deferred.resolve());
      stream.pipe(devNullStream());
    },
    { defer: true },
  )
  .add(
    'split2',
    deferred => {
      const stream = hugeBuffer()
        .pipe(split2())
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
