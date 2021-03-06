const { readFileSync, writeFileSync } = require('fs');
const fs = require('fs');
const createFolders = testRunFolder => {
  if (!fs.existsSync(testRunFolder)) {
    fs.mkdirSync(testRunFolder);
  }
};

const compareWithPrev = (rawResults, name = 'test') => {
  const results = getResults(rawResults);
  console.log('# Current results:');
  console.table(results);
  var testRunFolder = `./runs/${name}/`;

  createFolders(testRunFolder);
  writeFileSync(
    `${testRunFolder}/benchmark-run-${new Date().toISOString()}.json`,
    JSON.stringify(results),
  );

  const path = `${testRunFolder}/benchmark-run.json`;
  if (fs.existsSync(path)) {
    // Do something
    const prevResults = JSON.parse(readFileSync(path));
    if (prevResults) {
      console.log('# Previous run:');
      console.table(prevResults);
      const diff = Object.entries(results).reduce((diff, [key, result]) => {
        diff[key] = compareWith(result, prevResults[key]);
        return diff;
      }, {});
      console.log('# Diff (current-previous): ');
      console.table(diff);
    }
  }
  if (process.argv[2] === 'write') {
    writeFileSync(
      `${testRunFolder}/benchmark-run.json`,
      JSON.stringify(results),
    );
    console.log('Previous result updated');
  }
};

const fixedTo = (value, descimals) => parseFloat(value.toFixed(descimals));

const compareWith = (newResult = {}, oldResult = {}) => {
  return Object.entries(newResult).reduce((result, [key, value]) => {
    if (['name', 'node'].includes(key)) {
      result[key] = value;
    } else if (key in oldResult) {
      result[key] = fixedTo(value - oldResult[key], 4);
    } else {
      result[key] = NaN;
    }
    return result;
  }, {});
};

const getResults = event => {
  return event.currentTarget.reduce((result, target) => {
    const { hz, stats, name } = target;
    const count = stats.sample.length;
    const { mean, deviation, rme } = stats;
    result[name.replace(/\.*/g, '')] = {
      count: Number(count),
      'mean(ms)': fixedTo(mean * 1000, 2),
      'deviation(ms)': fixedTo(deviation * 1000, 2),
      'ops/sec': fixedTo(hz, 2),
      rme: fixedTo(rme, 2),
      node: process.versions.node,
    };
    return result;
  }, {});
};

module.exports = { compareWithPrev };
