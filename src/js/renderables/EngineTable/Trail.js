// Note all the interporlation stuff was rulthlessly ripped from pixi.js's example - gud enuff

import { BLEND_MODES, Point, SimpleRope, Texture } from "pixi.js";

/**
 * Cubic interpolation based on https://github.com/osuushi/Smooth.js
 */
function clipInput(k, arr) {
  if (k < 0) k = 0;
  if (k > arr.length - 1) k = arr.length - 1;
  return arr[k];
}

function getTangent(k, factor, array) {
  return (factor * (clipInput(k + 1, array) - clipInput(k - 1, array))) / 2;
}

function cubicInterpolation(array, t, tangentFactor) {
  if (tangentFactor == null) tangentFactor = 1;

  const k = Math.floor(t);
  const m = [
    getTangent(k, tangentFactor, array),
    getTangent(k + 1, tangentFactor, array),
  ];
  const p = [clipInput(k, array), clipInput(k + 1, array)];
  t -= k;
  const t2 = t * t;
  const t3 = t * t2;
  return (
    (2 * t3 - 3 * t2 + 1) * p[0] +
    (t3 - 2 * t2 + t) * m[0] +
    (-2 * t3 + 3 * t2) * p[1] +
    (t3 - t2) * m[1]
  );
}

export default class Trail extends SimpleRope {
  constructor({trailSize, historySize, alpha}) {
    const points = [];
    // Create rope points.
    for (let i = 0; i < trailSize; i++) {
      points.push(new Point(0, 0));
    }
    super(Texture.WHITE, points, 0.2);

    this.points = points;

    // ROPE STUFF
    this.historyX = [];
    this.historyY = [];
    // historySize determines how long the trail will be.
    this.historySize = historySize;
    // ropeSize determines how smooth the trail will be.
    this.trailSize = trailSize;
    // Create history array.
    for (let i = 0; i < historySize; i++) {
      this.historyX.push(0); 
      this.historyY.push(0);
    }
    // Set the blendmode
    this.blendMode = BLEND_MODES.ADD;
    this.alpha = alpha;
  }

  /**
   * New x,y position for the trail
   * @param {Number} x 
   * @param {Number} y 
   */
  update(x, y) {
    // ROPE UPDATE
    this.historyX.pop();
    this.historyX.unshift(x);
    this.historyY.pop();
    this.historyY.unshift(y);
    // Update the points to correspond with history.
    for (let i = 0; i < this.trailSize; i++) {
      const p = this.points[i];

      // Smooth the curve with cubic interpolation to prevent sharp edges.
      const ix = cubicInterpolation(
        this.historyX,
        (i / this.trailSize) * this.historySize
      );
      const iy = cubicInterpolation(
        this.historyY,
        (i / this.trailSize) * this.historySize
      );

      p.x = ix;
      p.y = iy;
    }
  }
}
