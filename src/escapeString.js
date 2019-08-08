const replace = require('./binaryReplace');
const Benchmark = require('benchmark');
const { compareWithPrev } = require('./benchmarkUtils');
const stringify = require('fast-stringify');
const { readFileSync } = require('fs');
const replaceBuffer = require('replace-buffer');

const stringBuffer = readFileSync('src/data/loremIpsum-65kb.txt');

const suite = new Benchmark.Suite();
const rxEscapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
const charSubstitution = new Map([
  ['\b', '\\b'],
  ['\t', '\\t'],
  ['\n', '\\n'],
  ['\f', '\\f'],
  ['\r', '\\r'],
  ['"', '\\"'],
  ['\\', '\\\\'],
]);
const meta = {
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\f': '\\f',
  '\r': '\\r',
  '"': '\\"',
  '\\': '\\\\',
};

suite
  .add('fast-stringify', () => {
    return stringify(stringBuffer.toString()).slice(1, -1);
  })
  .add('JSON.stringify', () => {
    return JSON.stringify(stringBuffer.toString()).slice(1, -1);
  })
  .add('String.replace-switch', () => {
    return stringBuffer.toString().replace(rxEscapable, char => {
      switch (char) {
        case '\b':
          return '\\b';
        case '\t':
          return '\\t';
        case '\n':
          return '\\n';
        case '\f':
          return '\\f';
        case '\r':
          return '\\r';
        case '"':
          return '\\"';
        case '\\':
          return '\\\\';
        default:
          return `\\u${char
            .charCodeAt(0)
            .toString(16)
            .padStart(4, '0')}`;
      }
    });
  })
  .add('String.replace-map', () => {
    return stringBuffer.toString().replace(rxEscapable, char => {
      if (charSubstitution.has(char)) {
        return charSubstitution.get(char);
      } else {
        return `\\u${char
          .charCodeAt(0)
          .toString(16)
          .padStart(4, '0')}`;
      }
    });
  })
  .add('String.replace-map2', () => {
    return stringBuffer.toString().replace(rxEscapable, char => {
      const key = charSubstitution.get(char);
      return key
        ? key
        : `\\u${char
            .charCodeAt(0)
            .toString(16)
            .padStart(4, '0')}`;
    });
  })
  .add('String.replace-object', () => {
    return stringBuffer.toString().replace(rxEscapable, char => {
      const key = meta[char];
      return key
        ? key
        : `\\u${char
            .charCodeAt(0)
            .toString(16)
            .padStart(4, '0')}`;
    });
  })
  .add('Buffer.replace-object', () => {
    replace(stringBuffer);
  })
  .add('Buffer.replace-buffer', () => {
    replaceBuffer(stringBuffer, '\n', '\\n');
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
