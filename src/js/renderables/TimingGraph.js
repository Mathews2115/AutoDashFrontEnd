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
import { DATA_KEYS } from "../common/dataMap";
import ActiveDataTable from "./EngineTable/ActiveDataTable";
import Trail from "./EngineTable/Trail";
import Renderable from "./Renderable";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.IGN_TIMING_MAP;
const MAX_RPM = 5000;
const MAX_KPA = 100;
// x=RPM y=kpa
const cellWidth = 40;
const cellHeight = 25;
const animationDuration = 0.5;

function createXLabelBar(totalXCells, xCellUnit, activeColor) {
  // bar textures
  const xLabelBarGraphics = new Graphics();
  // xLabelBarGraphics
  //   .beginFill(0xFFFFFF)
  //   .lineStyle(0)
  //   .drawRect(0, 0,  this.totalXCells*cellWidth, 40)
  //   .endFill();
  // draw tick marks every
  const length = totalXCells / 2;
  const tickSpace = cellWidth * 2;
  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      const text = new BitmapText(`${i * xCellUnit * 2}`, {
        fontName: "Orbitron",
        fontSize: 16,
        align: "center",
      });
      text.anchor.set(0.5, 0);
      text.x = i * tickSpace;
      text.y = 20;
      text.angle = 180;
      text.tint = activeColor;
      xLabelBarGraphics.addChild(text);
      xLabelBarGraphics
        .beginFill(activeColor)
        .drawRect(i * tickSpace, 0, 5, 20)
        .endFill();
    } else {
      xLabelBarGraphics
        .beginFill(activeColor)
        .drawRect(i * tickSpace, 0, 5, 40)
        .endFill();
    }
  }
  return xLabelBarGraphics;
}

function createYLabelBar(totalYCells, yCellUnit, activeColor) {
  const yLabelBarGraphics = new Graphics();

  // draw tick marks every
  const length = totalYCells;
  const tickSpace = cellHeight;
  for (let i = 0; i < length; i++) {
    const text = new BitmapText(`${(length - i) * yCellUnit}`, {
      fontName: "Orbitron",
      fontSize: 16,
      align: "center",
    });
    text.anchor.set(0, 0.5);
    text.y = i * tickSpace;
    text.x = 1;
    text.angle = 180;
    text.tint = activeColor;
    yLabelBarGraphics.addChild(text);
    yLabelBarGraphics
      .beginFill(activeColor)
      .drawRect(30, i * tickSpace, 10, 5)
      .endFill();
  }
  return yLabelBarGraphics;
}

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
  text.x = (i * cellWidth) + cellWidth/2;
  text.y = (j * cellHeight) + cellHeight/2;
  text.angle = 180;
  text.tint = activeColor;
  text.visible = false;
  return text;
};

class TimingGraph extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this.chromaScale = chroma
      .scale(["red", "yellow", "blue"])
      .domain([14, 25, 40]);

    this.trail = new Trail({ trailSize: 50, historySize: 15, alpha: 0.3 });

    this.background = Sprite.from(Texture.WHITE);

    this.maxXValue = MAX_RPM;
    this.maxYValue = MAX_KPA;
    this.xCellUnit = 250; // 5000 / 250 = 20
    this.yCellUnit = 4; // 100 / 4 = 25
    this.totalXCells = this.maxXValue / this.xCellUnit;
    this.totalYCells = this.maxYValue / this.yCellUnit;
    this.tableHeight = this.totalYCells * cellHeight;
    this.tableWidth = this.totalXCells * cellWidth;

    this.xValue = 0;
    this.yValue = 0;
    this._value = null;

    this.xKey = DATA_KEYS.RPM;
    this.yKey = DATA_KEYS.MAP;
    this.valueKey = DATA_KEYS.IGNITION_TIMING;

    this.tableContainer = new Container();
    this.table = new ParticleContainer(this.totalXCells * this.totalYCells, {
      tint: true,
    });

    this.xLabelBar = null;
    this.yLabelBar = null;
    this.xIndicator = null;
    this.yIndicator = null;

    this.tableAnim = gsap.timeline();
    this.xlabelbarAnim = gsap.timeline();
    this.ylabelbarAnim = gsap.timeline();
    this.xIndicatorAnim = gsap.timeline();
    this.yIndicatorAnim = gsap.timeline();

    this.scaleFactor = 1;

    this.lookupTable = [];
    this.textValuesLookupTable = new Array(this.totalXCells);
    this.textValuesContainer = new Container();
    this.activeCells = new ActiveDataTable();
    this.renderedMinMax = this.activeCells.minMax;
  }

  animateViewport(newX, newY) {
    this.xlabelbarAnim.clear();
    this.xlabelbarAnim.to(this.xLabelBar, {
      pixi: {
        x: newX,
        scaleX: this.scaleFactor,
      },
      duration: animationDuration,
    });

    this.ylabelbarAnim.clear();
    this.ylabelbarAnim.to(this.yLabelBar, {
      pixi: {
        y: newY,
        scaleY: this.scaleFactor,
      },
      duration: animationDuration,
    });

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
    return 400;
  }
  get gaugeHeight() {
    return 380;
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
    this.background.scale.set(
      this.gaugeWidth / this.background.width,
      this.gaugeHeight / this.background.height
    );
    this.background.tint = this.backgroundColor;
    this._maskReck = new Graphics();
    this._maskReck
      .beginFill(0xffffff)
      .drawRect(0, 0, this.gaugeWidth, this.gaugeHeight)
      .endFill();

    // engine table stuff TABLE
    // generate background sprite
    for (let i = 0; i < this.totalXCells; i++) {
      this.lookupTable.push([]);
      this.textValuesLookupTable[i] = new Array(this.totalYCells);
      for (let j = 0; j < this.totalYCells; j++) {
        const cellSprite = createCellSprite(i, j, this.backgroundColor);
        this.table.addChild(cellSprite);
        this.lookupTable[i].push(cellSprite);
        const cellReadout = createCellReadout(i, j, this.activeColor);

        this.textValuesContainer.addChild(cellReadout);
        this.textValuesLookupTable[i][j] = cellReadout;
      }
    }

    // Legend side bars and indicators
    this.xLabelBar = createXLabelBar(
      this.totalXCells,
      this.xCellUnit,
      this.activeColor
    );
    this.xIndicator = new Graphics();
    this.xIndicator
      .beginFill(this.theme.warningColor)
      .drawRect(0, 0, 5, 30)
      .endFill();
    this.xIndicator.cacheAsBitmap = true;

    this.yLabelBar = createYLabelBar(
      this.totalYCells,
      this.yCellUnit,
      this.activeColor
    );
    this.yIndicator = new Graphics();
    this.yIndicator
      .beginFill(this.theme.warningColor)
      .drawRect(0, 0, 25, 5)
      .endFill();
    this.yIndicator.cacheAsBitmap = true;

    // move labelbar to bottom of gauge
    this.xLabelBar.y = this.gaugeHeight - 40;

    // add to container
    this.xLabelBar.addChild(this.xIndicator);
    this.yLabelBar.addChild(this.yIndicator);
    this.tableContainer.addChild(
      this.table,
      this.textValuesContainer,
      this.trail
    );
    this.addChild(
      this._maskReck, // we want our local transforms so this.mask can get the proper world coordinates
      this.background,
      this.tableContainer,
      this.xLabelBar,
      this.yLabelBar
    );
    this.mask = this._maskReck; // dont draw anything outside of area
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

    // move indicators on the label bars
    this.xIndicator.x = x;
    this.yIndicator.y = y;

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

    this.activeCells.activate({ cell, xIndex, yIndex, timestamp }, () => {
      this.textValuesLookupTable[xIndex][yIndex].visible = true;
      this.textValuesLookupTable[xIndex][yIndex].text = this._value.toFixed(1);
    });

    this.activeCells.expireOld((i, j) => {
      this.textValuesLookupTable[i][j].visible = false;
    });
  }
}

TimingGraph.ID = ID;
export default TimingGraph;
