import { Sprite } from "pixi.js";

// Each cell contains an expiration time that will slowly fade out
// if the cell isnt updated in a timely manner

// it is also responsible for keeping track of min max ranges of active cells


/**
 * @typedef ActiveDataCell
 * @type {object}
 * @property {Sprite} cell - The sprite that represents the cell (with alpha and color properties)
 * @property {Number} xIndex - index into a 2d array representing engine data
 * @property {Number} yIndex - index into a 2d array representing engine data
 * @property {Number} timestamp - Timestamp - Date.now() of the last time it was updated
 */

 function easeInExpo(x) {
   return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
 }

 const EXPIRE_TIME_MS = 8000;
export default class ActiveDataTable extends Array {
  constructor() {
    // this is an array of objects with keys cell, key, timestamp
    super();

    // keep track of the min/max keys
    this.maxX = 0;
    this.maxY = 0;
    this.minX = Infinity;
    this.minY = Infinity;
    this.deltaX = 0;
    this.deltaY = 0;
  }

  /**
   * 
   * @param {ActiveDataCell} activeDataCell 
   */
  activate({ cell, xIndex, yIndex, timestamp }, onActivatedFn) {
    const key = `${xIndex}-${yIndex}`;
    const index = this.findIndex((c) => c.key === key);
    if (index === -1) {
      this.push({ cell, key, xIndex, yIndex, timestamp });
    } else {
      this[index] = { cell, key, xIndex, yIndex, timestamp };
    }
    cell.alpha = 1;

    this.maxX = Math.max(this.maxX, xIndex);
    this.maxY = Math.max(this.maxY, yIndex);
    this.minX = Math.min(this.minX, xIndex);
    this.minY = Math.min(this.minY, yIndex);
    this.deltaX = this.maxX - this.minX;
    this.deltaY = this.maxY - this.minY;
    onActivatedFn(index === -1);
  }

  expireOld(onExpiredFn) {
    const now = Date.now();
    this.forEach((c, i) => {
      const timeAlive = now - c.timestamp;
      if (timeAlive > EXPIRE_TIME_MS) {
        this.splice(i, 1);
        this.minMaxFromCell(c);
        onExpiredFn(c.cell, c.xIndex, c.yIndex);
        c.cell.alpha = 0;
      } else {
        c.cell.alpha = 1- easeInExpo( (timeAlive / EXPIRE_TIME_MS)); 
      }
    });
  }
  minMaxFromCell(cell) {
    // find the replacement minmax if needed
    if (cell.xIndex === this.maxX) {
      this.maxX = this.getMaxX();
      this.deltaX = this.maxX - this.minX;
    }
    if (cell.xIndex === this.minX) {
      this.minX = this.getMinX();
      this.deltaX = this.maxX - this.minX;
    }
    if (cell.yIndex === this.maxY) {
      this.maxY = this.getMaxY();
      this.deltaY = this.maxY - this.minY;
    }
    if (cell.yIndex === this.minY) {
      this.minY = this.getMinY();
      this.deltaY = this.maxY - this.minY;
    }
  }

  getMaxX() {
    return this.reduce((max, c) => Math.max(max, c.xIndex), 0);
  }
  getMaxY() {
    return this.reduce((max, c) => Math.max(max, c.yIndex), 0);
  }
  getMinX() {
    return this.reduce((min, c) => Math.min(min, c.xIndex), Infinity);
  }
  getMinY() {
    return this.reduce((min, c) => Math.min(min, c.yIndex), Infinity);
  }

  get minMax() {
    return [this.minX, this.minY, this.maxX, this.maxY];
  }
}
