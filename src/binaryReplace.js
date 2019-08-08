var through = require('through2');
var os = require('os');

var replaceBuf = [
  Buffer.from('\n'),
  Buffer.from('\f'),
  Buffer.from('\t'),
  Buffer.from('\r'),
  Buffer.from('"'),
  Buffer.from('\\'),
  Buffer.from('\b'),
];

var replaceBufTo = [
  Buffer.from('\\n'),
  Buffer.from('\\f'),
  Buffer.from('\\t'),
  Buffer.from('\\r'),
  Buffer.from('\\"'),
  Buffer.from('\\\\'),
  Buffer.from('\\b'),
];

var matcher = Buffer.from('\n');
var buffers = [];

function replace(buf) {
  var offset = 0;
  var lastMatchIndex = 0;
  let lastMatch = replaceBufTo[0];
  while (true) {
    var { idx, match } = firstMatch(buf, offset - lastMatch.length + 1);
    if (idx !== -1 && idx < buf.length) {
      buffers.push(buf.slice(lastMatchIndex, idx));
      buffers.push(match);
      offset = idx + lastMatch.length;
      lastMatchIndex = offset;
      lastMatch = match;
    } else {
      buffers.push(buf.slice(lastMatchIndex));
      break;
    }
  }

  return Buffer.concat(buffers);
}

const isMatch = (buf, i, matcher) => {
  if (buf[i] === matcher[0]) {
    if (matcher.length > 1) {
      var fullMatch = true;
      for (var j = i, k = 0; j < i + matcher.length; j++, k++) {
        if (buf[j] !== matcher[k]) {
          fullMatch = false;
          break;
        }
      }
      if (fullMatch) {
        return true;
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
};

function firstMatch(buf, offset) {
  if (offset >= buf.length) return -1;
  for (var i = offset; i < buf.length; i++) {
    for (let index = 0; index < replaceBuf.length; index++) {
      const element = replaceBuf[index];
      if (isMatch(buf, i, element)) {
        var idx = i + element.length - 1;
        return { idx, match: replaceBufTo[index] };
      }
    }
  }

  var idx = i + matcher.length - 1;
  return { idx, match: false };
}

const t = replace(Buffer.from('kkk\nkkk\tkkk')).toString();
console.log(t);

module.exports = replace;
