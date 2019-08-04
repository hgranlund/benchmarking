const Benchmark = require('benchmark');
const { createReadStream, readFileSync } = require('fs');
const { devNullStream, toStream } = require('./testUtils');
const { compareWithPrev } = require('./benchmarkUtils');

const { JsonStream } = require('jetsons');
const JsonStreamStringify = require('json-stream-stringify');
const JSONStream = require('JSONStream');

const hugeJson = JSON.parse(readFileSync('src/data/quotes.json'));

const toPerformanceTest = (obj, name, StreamClass = JsonStream) => {
  const test = deferred => {
    const stream = new StreamClass(obj());
    stream
      .on('end', () => deferred.resolve())
      .on('error', () => deferred.resolve());
    stream.pipe(devNullStream());
  };
  return { name, test };
};

const simpleJsonTestJsonStream = toPerformanceTest(
  () => ({
    test: 1,
    test2: 'test',
    test3: [1, 2, 3],
  }),
  'Jetsons_SimpleJson',
  JsonStream,
);
const simpleJsonTestJsonStreamStringify = toPerformanceTest(
  () => ({
    test: 1,
    test2: 'test',
    test3: [1, 2, 3],
  }),
  'JsonStreamStringify_SimpleJson',
  JsonStreamStringify,
);

const jsonWith4MBStringStreamJsonStream = toPerformanceTest(
  () => ({
    lorem: createReadStream('src/data/loremIpsum-4mb.txt'),
  }),
  'Jetsons_JsonWith4MBStringStream',
  JsonStream,
);
const jsonWith4MBStringStreamJsonStreamStringify = toPerformanceTest(
  () => ({
    lorem: createReadStream('src/data/loremIpsum-4mb.txt'),
  }),
  'JsonStreamStringify_JsonWith4MBStringStream',
  JsonStreamStringify,
);

const jsonWith4MBRawStreamJsonStream = toPerformanceTest(
  () => {
    const stream = createReadStream('src/data/loremIpsum-4mb.json');
    stream.jsonType = JsonStream.jsonTypes.raw;
    return { rawLorem: stream };
  },
  'Jetsons_JsonWith4MBRawStream',
  JsonStream,
);

const hugeJsonTestJsonStream = toPerformanceTest(
  () => hugeJson,
  'Jetsons_HugeJson',
  JsonStream,
);
const hugeJsonTestJsonStreamStringify = toPerformanceTest(
  () => hugeJson,
  'JsonStreamStringify_HugeJson',
  JsonStreamStringify,
);

const ha10k = new Array(10000).fill('a string sdælkafæsadslkfæsakf');
const array10kTestJsonStream = toPerformanceTest(
  () => ha10k,
  'Jetsons_Array10k',
  JsonStream,
);

const array10kTestJsonStreamStringify = toPerformanceTest(
  () => ha10k,
  'JsonStreamStringify_Array10k',
  JsonStreamStringify,
);

const arrayStream10kTestJsonStream = toPerformanceTest(
  () => toStream(ha10k, null, { objectMode: false }),
  'Jetsons_ArrayStream10k',
  JsonStream,
);

const arrayStream10kTestJsonStreamStringify = toPerformanceTest(
  () => toStream(ha10k, null, { objectMode: false }),
  'JsonStreamStringify_ArrayStream10k',
  JsonStreamStringify,
);
const arrayStream10kTestJSONStream = () => {
  const test = deferred => {
    const stream = toStream(ha10k, null, { objectMode: false })
      .pipe(JSONStream.stringify('[', ', ', ']'))
      .on('end', () => deferred.resolve())
      .on('error', () => deferred.resolve());
    stream.pipe(devNullStream());
  };
  return { name: 'JSONStream_ArrayStream10k', test };
};

const tests = [
  simpleJsonTestJsonStream,
  simpleJsonTestJsonStreamStringify,
  jsonWith4MBStringStreamJsonStream,
  jsonWith4MBStringStreamJsonStreamStringify,
  jsonWith4MBRawStreamJsonStream,
  hugeJsonTestJsonStream,
  hugeJsonTestJsonStreamStringify,
  arrayStream10kTestJsonStream,
  arrayStream10kTestJsonStreamStringify,
  arrayStream10kTestJSONStream(),
  array10kTestJsonStream,
  array10kTestJsonStreamStringify,
];

const longestName = tests.reduce(
  (longest, { name }) => Math.max(longest, name.length),
  0,
);

tests
  .reduce((suite, { name, test }) => {
    suite.add(name.padEnd(longestName, '.'), test, { defer: true });
    return suite;
  }, new Benchmark.Suite())
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', event => {
    compareWithPrev(event, 'stringifyAJsonStream');
  })
  .run();
