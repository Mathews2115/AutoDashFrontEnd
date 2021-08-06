// Queue of Uint8s
class RingBuffer {
    /**
   * @param {ArrayBuffer} buffer
   * @param {number} offset
   * @param {number} length
   * @param {number} frontOffset
   */
    constructor(buffer, offset, length, frontOffset) {
      this.buffer = new Uint8Array(buffer, offset, length);
      this.frontOffset = frontOffset;
      this.buffer = new Uint8Array([...(this.buffer.subarray(this.frontOffset)), ...(this.buffer.subarray(0, this.frontOffset))]);
    }

    get front() {
      return this.buffer[this.frontOffset];
    }
}

export default RingBuffer;