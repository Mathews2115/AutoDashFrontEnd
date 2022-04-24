import { Sprite } from "pixi.js";

// Each cell contains an expiration time that will slowly fade out
// if the cell isnt updated in a timely manner

/**
 * @typedef ActiveDataCell
 * @type {object}
 * @property {Sprite} cell - The sprite that represents the cell (with alpha and color properties)
 * @property {Number} xIndex - index into a 2d array representing engine data
 * @property {Number} yIndex - index into a 2d array representing engine data
 * @property {Number} timestamp - Timestamp - Date.now() of the last time it was updated
 */


const EXPIRE_TIME_MS = 8000;
export default class ActiveDataTable extends Array {
  constructor() {
    // this is an array of objects with keys cell, key, timestamp
    super();
  }

  /**
   * 
   * @param {ActiveDataCell} activeDataCell 
   */
  activate({ cell, xIndex, yIndex, timestamp }) {
    const key = `${xIndex}-${yIndex}`;
    const index = this.findIndex((c) => c.key === key);
    if (index === -1) {
      this.push({ cell, key, timestamp });
    } else {
      this[index] = { cell, key, timestamp };
    }
    cell.alpha = 1;
    cell.visible = true;
  }

  expireOld() {
    const now = Date.now();
    this.forEach((c, i) => {
      const timeAlive = now - c.timestamp;
      if (timeAlive > EXPIRE_TIME_MS) {
        c.cell.visible = false;
        this.splice(i, 1);
      } else {
        c.cell.alpha = 1 - timeAlive / EXPIRE_TIME_MS;
      }
    });
  }
}
