const { Transform } = require('stream');

class BinarySplit extends Transform {
  constructor(splitOn = '\n') {
    super();
    this.splitOn = Buffer.from(splitOn);
    this.buffered = [];
  }
  _transform(chunk, encoding, done) {
    let offset = 0;
    while (offset < chunk.length) {
      const splitAt = chunk.indexOf(this.splitOn, offset);
      if (splitAt === -1) {
        this.buffered.push(chunk);
        offset = chunk.length;
      } else {
        this.buffered.push(chunk.slice(offset, splitAt));
        this.pushBuffered();
        offset = splitAt + this.splitOn.length;
      }
    }
    done();
  }

  pushBuffered() {
    if (this.buffered.length === 1) {
      this.push(this.buffered.pop());
    } else {
      this.push(Buffer.concat(this.buffered));
      this.buffered = [];
    }
  }

  _flush(done) {
    if (this.buffered.length) {
      this.pushBuffered();
    }
    done();
  }
}

module.exports = BinarySplit;
