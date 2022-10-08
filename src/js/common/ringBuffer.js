// Queue of Uint8s
class RingBuffer {
    /**
   * @param {ArrayBuffer} buffer
   * @param {number} offset
   * @param {number} length
   * @param {number} frontOffset
   */
    constructor(buffer, offset, length, frontOffset) {
      const _buf = new Uint8Array(buffer, offset, length);
      this.frontOffset = frontOffset;
      this.buffer = new Uint8Array([...(_buf.subarray(this.frontOffset)), ...(_buf.subarray(0, this.frontOffset))]);
    }

    get front() {
      return this.buffer[this.frontOffset];
    }
}

export default RingBuffer;