const { Transform } = require('stream');

class BinarySplit extends Transform {
  constructor() {
    super();
    this.splitOn = Buffer.from('\n')[0];
    this.buffered = [];
  }
  _transform(chunk, encoding, done) {
    // Influx separate each chunck with a single newline chunck
    // newline in utf16 buffer is 10
    if (chunk[0] === 10 && this.buffered.length) {
      if (this.buffered.length === 1) {
        this.push(this.buffered.pop());
      } else {
        this.push(Buffer.concat(this.buffered));
        this.buffered = [];
      }
    } else {
      this.buffered.push(chunk);
    }
    done();
  }

  _flush(done) {
    done(null, Buffer.concat(this.buffered));
  }
}

module.exports = BinarySplit;
