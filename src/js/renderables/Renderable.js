import * as PIXI from "pixi.js";

//Aliases
let Container = PIXI.Container;

export default class Renderable extends Container {
  constructor({ renderer, theme }) {
    super();
    this.initialized = false;
    this._dashID = null;
    this.interactiveChildren = false; // turn off touchable events

    /** @type {PIXI.Renderer} */
    this.appRenderer = renderer;
    this.theme = theme;

    // Value to be rendered
    this._value = null;

    // What value the gauge rendered last
    this.renderedValue = this._value;
  }

  /**
   * @param {import("../appConfig").ThemeData} newTheme
   */
  set theme(newTheme) {
    this._theme = Object.assign({}, newTheme);
  }
  /**
   * @returns {import("../appConfig").ThemeData}
   */
  get theme() {
    return this._theme;
  }

  get dashID() {
    return this._dashID;
  }

  /**
   * @returns {number}
   */
  get value() {
    return this._value;
  }

  /**
   * @param {number} newValue
   */
  set value(newValue) {}

  // Called to shape and theme up a renderable
  initialize() {
    this.initialized = true;
  }

  /**
   * Time to update the rendering logic!
   * @param {Number} _timestamp the epoch time update was called
   */
  update(_timestamp) {}
}
