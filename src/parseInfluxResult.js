const { readFileSync } = require('fs');

const Benchmark = require('benchmark');
const { compareWithPrev } = require('./benchmarkUtils');
const stringify = require('fast-stringify');

const influxResultNulls = JSON.parse(
  readFileSync('src/data/influxResultNulls.json'),
);

const suite = new Benchmark.Suite();

suite
  .add('flatmap --> map', () => {
    const parseNumber = stringNumber => {
      // Looks like this is the fastest way to parse a number in JS
      return parseFloat(stringNumber);
    };

    const parseInfluxSerie = (values = []) =>
      values.map(value => {
        const quality = parseNumber(value[value.length - 1]);
        value[value.length - 1] = Number.isNaN(quality) ? 64 : quality;
        return value;
      });

    const parseInfluxResult = influxResult => {
      if (!influxResult || !influxResult.results) {
        throw new Error(`Error from influx: ${(influxResult || {}).error}`);
      }
      return influxResult.results
        .flatMap(result => {
          if (result.error)
            throw new Error(`Error from influx: ${result.error}`);
          return result.series || [];
        })
        .flatMap(serie => parseInfluxSerie(serie.values));
    };
    return parseInfluxResult(influxResultNulls);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', event => {
    compareWithPrev(event, 'parseInflusResult');
    console.log(
      'Fastest is ' + event.currentTarget.filter('fastest').map('name'),
    );
  })
  .run();
