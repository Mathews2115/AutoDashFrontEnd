// Queue of Uint8s
class RingBuffer {
  /**
 * @param {Object} options
 * @param {Uint8Array} options.arrayBuffer
 * @param {number} options.frontOffset
 */
  constructor({ arrayBuffer, frontOffset = 0 }) {
    this.arrayBuffer = arrayBuffer
    this.frontOffset = frontOffset; // where the current front of the buffer is - will wrap around when it his the length of the buffer
    this.length = arrayBuffer.length; // curent length of the filled buffer; wwill cap at the buffer.length
  }

  get front() {
    return this.arrayBuffer[this.frontOffset];
  }

  /**
   * @param {number} value
   */
  push(value) {
    this.arrayBuffer[this.frontOffset] = value;
    this.frontOffset++;
    this.length = Math.min(this.length + 1, this.arrayBuffer.length);
    if (this.frontOffset > this.arrayBuffer.length - 1) {
      this.frontOffset = 0;
    }
  }

  get buffer() {
    return new Uint8Array([...(this.arrayBuffer.subarray(this.frontOffset)), ...(this.arrayBuffer.subarray(0, this.frontOffset))]);
  }
}

export default RingBuffer;
