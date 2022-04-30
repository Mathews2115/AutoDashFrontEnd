import chroma from "chroma-js";
import { gsap } from "gsap";
import {
  BitmapText,
  Container,
  Graphics,
  ParticleContainer,
  Sprite,
  Texture,
} from "pixi.js";
import ActiveDataTable from "./ActiveDataTable";
import Trail from "./Trail";
import Renderable from "../Renderable";
import LabelBar from "./LabelBar";

const cellWidth = 32;
const cellHeight = 24;
const animationDuration = 0.5;

const createCellSprite = (i, j, startingColor) => {
  const cellSprite = Sprite.from(Texture.WHITE);
  cellSprite.tint = startingColor;
  cellSprite.x = i * cellWidth;
  cellSprite.y = j * cellHeight;
  // now scale it to the cell size
  cellSprite.scale.set(
    cellWidth / cellSprite.width,
    cellHeight / cellSprite.height
  );
  return cellSprite;
};

/**
 * i,j correlates with LookupTable where these values live
 * @param {Number} i
 * @param {Number} j
 * @param {Number} activeColor
 * @returns {BitmapText}
 */
const createCellReadout = (i, j, activeColor) => {
  const text = new BitmapText("-", {
    fontName: "Orbitron",
    fontSize: 10,
    align: "center",
  });
  text.anchor.set(0.5, 0.5);
  text.x = i * cellWidth + cellWidth / 2;
  text.y = j * cellHeight + cellHeight / 2;
  text.angle = 180;
  text.tint = activeColor;
  text.visible = false;
  return text;
};

class EngineTable extends Renderable {
  static cellWidth = cellWidth;
  static cellHeight = cellHeight;

  constructor(
    { renderer, theme },
    { maxXValue, maxYValue, xKey, yKey, valueKey },
    { chromaScale, chromaDomain }
  ) {
    super({ renderer, theme });

    // This is where the label bars will go (if they are attached)
    this.labelBarsContainer = new Container();
    // This is where the engine table graph and any other scalables will go
    this.tableContainer = new Container();
    // everything in here will be clipped to the rect of this viewport
    this.viewportContainer = new Container();
    this._maskReck = new Graphics();
    this.labelBarsMask = new Graphics();

    // This is how we color the table cells
    this.chromaScale = chroma.scale(chromaScale).domain(chromaDomain);

    // the lil trail guy that represents where we are in the graph (slight history)
    this.trail = new Trail({ trailSize: 15, historySize: 15, alpha: 0.3 });

    // needed so when cells fade out, they fade to this
    this.background = Sprite.from(Texture.WHITE);

    this.maxXValue = maxXValue;
    this.maxYValue = maxYValue;
    this.xCellUnit = 250; // 5000 / 250 = 20
    this.yCellUnit = 4; // 100 / 4 = 25
    this.totalXCells = this.maxXValue / this.xCellUnit;
    this.totalYCells = this.maxYValue / this.yCellUnit;
    this.tableHeight = this.totalYCells * EngineTable.cellHeight;
    this.tableWidth = this.totalXCells * EngineTable.cellWidth;

    this.xValue = 0;
    this.yValue = 0;
    this._value = null;

    // keys to the table data
    this.xKey = xKey;
    this.yKey = yKey;
    this.valueKey = valueKey; // represents the values in the cell itself

    // table full of cells that will be colored in as they are hit
    this.table = new ParticleContainer(this.totalXCells * this.totalYCells, {
      tint: true,
    });

    // animates scaling/position moving on the big tablecontainer
    this.tableAnim = gsap.timeline();
    this.scaleFactor = 1;

    // A table that holds all the cells that are found in this.table (so we can reference it x/y coords)
    this.lookupTable = [];

    // Where the text values go that display on top of the cells
    this.textValuesLookupTable = new Array(this.totalXCells);
    this.textValuesContainer = new Container();

    // responsible for the fade in/out of the cells and text values
    this.activeCells = new ActiveDataTable();

    // if they dont match, we need to rescale/move the table to fit in the view port
    this.renderedMinMax = this.activeCells.minMax;

    // Label Bars - if they are connected; this Graph will be responsible for updating them (scaling, etc)
    /** @type {LabelBar} */
    this._xlabelBar = null;
    /** @type {LabelBar} */
    this._yLabelBar = null;
  }
  get xLabelBar() {
    return this._xlabelBar;
  }
  set xLabelBar(xLabelBar) {
    if (this._xlabelBar) {
      this.labelBarsContainer.removeChild(this._xlabelBar);
      this._xlabelBar.destroy(true);
    }
    this._xlabelBar = xLabelBar;
    this.viewportContainer.addChild(xLabelBar);
  }
  get yLabelBar() {
    return this._yLabelBar;
  }
  set yLabelBar(ylabelBar) {
    if (!this._yLabelBar) {
      // generate mask for the bar
      this.labelBarsMask
        .beginFill(0xffffff)
        .drawRect(0, 0, ylabelBar.width, this.gaugeHeight)
        .endFill();
      this.labelBarsContainer.mask = this.labelBarsMask;
      this.labelBarsContainer.addChild(this.labelBarsMask);
      this.labelBarsContainer.x = -ylabelBar.width;
    } else {
      this.labelBarsContainer.removeChild(this._yLabelBar);
      this._yLabelBar.destroy(true);
    }
    this._yLabelBar = ylabelBar;
    this.labelBarsContainer.addChild(ylabelBar);
  }

  animateViewport(newX, newY) {
    if (this._xlabelBar)
      this._xlabelBar.scaleAnimate(
        newX,
        newY,
        this.scaleFactor,
        animationDuration
      );
    if (this._yLabelBar)
      this._yLabelBar.scaleAnimate(
        newX,
        newY,
        this.scaleFactor,
        animationDuration
      );
    this.tableAnim.clear();
    this.tableAnim.to(this.tableContainer, {
      pixi: {
        x: newX,
        y: newY,
        scaleX: this.scaleFactor,
        scaleY: this.scaleFactor,
      },
      duration: animationDuration,
      onComplete: () => {},
    });
    this.viewportScaled();
  }

  get gaugeWidth() {
    return 380;
  }
  get gaugeHeight() {
    return 330;
  }

  get labelData() {
    return {
      theme: this.theme,
      xCellUnit: this.xCellUnit,
      yCellUnit: this.yCellUnit,
      totalXCells: this.totalXCells,
      totalYCells: this.totalYCells,
    };
  }

  set value(dataSet) {
    this.xValue = dataSet[this.xKey];
    this.yValue = dataSet[this.yKey];
    this._value = dataSet[this.valueKey];
  }

  get viewportScalingNeeded() {
    // any keyvalues different between rendered and current?
    return !this.activeCells.minMax.every(
      (v, i) => v === this.renderedMinMax[i]
    );
  }

  viewportScaled() {
    this.renderedMinMax = this.activeCells.minMax;
  }

  initialize() {
    this.activeColor = this.theme.gaugeActiveColor;
    this.backgroundColor = this.theme.gaugeBgColor;
    this.background.tint = this.backgroundColor;

    // tint cells
    if (this.initialized) {
      for (let i = 0; i < this.totalXCells; i++) {
        for (let j = 0; j < this.totalYCells; j++) {
          this.lookupTable[i][j].tint = this.backgroundColor;
          this.textValuesLookupTable[i][j].tint = this.activeColor;
        }
      }
    } else {
      this.background.scale.set(
        this.gaugeWidth / this.background.width,
        this.gaugeHeight / this.background.height
      );

      this._maskReck
        .clear()
        .beginFill(0xffffff)
        .drawRect(0, 0, this.gaugeWidth, this.gaugeHeight)
        .endFill();

      // Initialize data tables
      this.lookupTable = new Array(this.totalXCells);
      for (let i = 0; i < this.totalXCells; i++) {
        this.lookupTable[i] = new Array(this.totalYCells);
        this.textValuesLookupTable[i] = new Array(this.totalYCells);
        for (let j = 0; j < this.totalYCells; j++) {
          const cellSprite = createCellSprite(i, j, this.backgroundColor);
          this.lookupTable[i][j] = cellSprite;
          const cellReadout = createCellReadout(i, j, this.activeColor);

          this.textValuesContainer.addChild(cellReadout);
          this.textValuesLookupTable[i][j] = cellReadout;
        }
      }

      // these things will scale and move
      this.tableContainer.addChild(
        this.table,
        this.textValuesContainer,
        this.trail
      );

      this.viewportContainer.addChild(
        this._maskReck, // we want our local transforms so this.mask can get the proper world coordinates
        this.background,
        this.tableContainer
      );

      this.addChild(this.viewportContainer, this.labelBarsContainer);
      this.viewportContainer.mask = this._maskReck; // dont draw anything outside of area
      this.initialized = true;
    }
  }

  /**
   * @param {Number} timestamp
   */
  update(timestamp) {
    if (this._value == null) return;

    // scale the x and y values to the table size
    const x = (this.xValue / this.maxXValue) * this.tableWidth;
    // inverse y  (because y0 is at the top in webGL)
    const y =
      this.tableHeight - (this.yValue / this.maxYValue) * this.tableHeight - 1;

    this.trail.update(x, y);
    if (this._xlabelBar) this._xlabelBar.x = x;
    if (this._yLabelBar) this._yLabelBar.y = y;

    // Update the look up tables (add colors, write value to table)
    this.updateTables(x, y, timestamp);

    // viewport scaling
    if (this.viewportScalingNeeded) {
      const xCellsToDisplay = this.activeCells.deltaX + 1; // plus one for padding
      const yCellsToDisplay = this.activeCells.deltaY + 1; // plus one for padding
      const desiredXPixels = xCellsToDisplay * cellWidth + cellWidth; // for extra padding?
      const desiredYPixels = yCellsToDisplay * cellHeight + cellHeight; // for extra padding
      this.scaleFactor = Math.min(
        this.gaugeWidth / desiredXPixels,
        this.gaugeHeight / desiredYPixels,
        2
      );

      const minCell =
        this.lookupTable[Math.max(this.activeCells.minX - 1, 0)][
          Math.max(this.activeCells.minY - 1, 0)
        ];
      const minX = -(minCell.x * this.scaleFactor);
      const minY = -(minCell.y * this.scaleFactor);
      this.animateViewport(minX, minY);
    }
  }

  /**
   * Update values/colors/text in the tables
   * @param {*} x - where the current pixel location is on the tableContainer
   * @param {*} y - where the current pixel location is on the tableContainer
   * @param {*} timestamp
   */
  updateTables(x, y, timestamp) {
    // Update the look up table (add colors, write value to table)
    const xIndex = Math.floor(x / cellWidth);
    const yIndex = Math.floor(y / cellHeight);
    const cell = this.lookupTable[xIndex][yIndex];
    cell.tint = this.chromaScale(Math.round(this._value)).num();

    this.activeCells.activate({ cell, xIndex, yIndex, timestamp }, (isNew) => {
      if (isNew) this.table.addChild(cell);
      this.textValuesLookupTable[xIndex][yIndex].visible = true;
      this.textValuesLookupTable[xIndex][yIndex].text = this._value.toFixed(1);
    });

    this.activeCells.expireOld((cell, i, j) => {
      this.table.removeChild(cell);
      this.textValuesLookupTable[i][j].visible = false;
    });
  }
}

export default EngineTable;
