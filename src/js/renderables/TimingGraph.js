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
const cellHeight = 20;
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
    const text = new BitmapText(`${(length-i) * yCellUnit}`, {
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

class TimingGraph extends Renderable {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
    this.chromaScale = chroma
      .scale(["red", "yellow", "blue"])
      .domain([14, 25, 40]);

    this.trail = new Trail({ trailSize: 100, historySize: 40, alpha: 0.3 });

    this.background = Sprite.from(Texture.WHITE);
    this.maxXValue = MAX_RPM;
    this.maxYValue = MAX_KPA;
    this.xCellUnit = 250; // 5000 / 250 = 20
    this.yCellUnit = 4; // 100 / 4 = 25
    this.totalXCells = this.maxXValue / this.xCellUnit;
    this.totalYCells = this.maxYValue / this.yCellUnit;

    this.xValue = 0;
    this.yValue = 0;
    this._value = 0;

    this.xKey = DATA_KEYS.RPM;
    this.yKey = DATA_KEYS.MAP;
    this.valueKey = DATA_KEYS.IGNITION_TIMING;

    this.tableContainer = new Container();
    this.table = new ParticleContainer(this.totalXCells * this.totalYCells, {
      tint: true,
    });

    this.tableAnim = gsap.timeline();
    this.xlabelbarAnim = gsap.timeline();
    this.ylabelbarAnim = gsap.timeline();

    this.scaleFactor = 1;

    this.lookupTable = [];
    this.activeCells = new ActiveDataTable();

    this.max = [1001, 21];
    this.min = [1000, 20];
    this._max = [...this.max];
    this._min = [...this.min];
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

    if (this.xValue < this.min[0]) this.min[0] = this.xValue;
    if (this.yValue < this.min[1]) this.min[1] = this.yValue;
    if (this.xValue > this.max[0]) this.max[0] = this.xValue;
    if (this.yValue > this.max[1]) this.max[1] = this.yValue;
  }

  initialize() {
    this.activeColor = this.theme.gaugeActiveColor;
    this.backgroundColor = this.theme.gaugeBgColor;
    this.background.scale.set(
      this.gaugeWidth / this.background.width,
      this.gaugeHeight / this.background.height
    );
    this.background.tint = this.backgroundColor;
    this.maskSprite = new Graphics();
    this.maskSprite
      .beginFill(0xffffff)
      .drawRect(0, 0, this.gaugeWidth, this.gaugeHeight)
      .endFill();

    // TABLE
    // generate background sprite
    for (let i = 0; i < this.totalXCells; i++) {
      this.lookupTable.push([]);
      for (let j = 0; j < this.totalYCells; j++) {
        let cellSprite = Sprite.from(Texture.WHITE);
        cellSprite.tint = this.backgroundColor;
        cellSprite.x = i * cellWidth;
        cellSprite.y = j * cellHeight;
        // now scale it to the cell size
        cellSprite.scale.set(
          cellWidth / cellSprite.width,
          cellHeight / cellSprite.height
        );
        this.table.addChild(cellSprite);
        // cellSprite.visible = false; - ignored in particle container
        this.lookupTable[i].push(cellSprite);
      }
    }

    //
    this.xLabelBar = createXLabelBar(
      this.totalXCells,
      this.xCellUnit,
      this.activeColor
    );
    this.yLabelBar = createYLabelBar(
      this.totalYCells,
      this.yCellUnit,
      this.activeColor
    );

    // turn into texture
    // this.xLabelBar = Sprite.from(
    //   this.appRenderer.generateTexture(xLabelBarGraphics)
    // );
    // xLabelBarGraphics.destroy(true);
    // move labelbar to bottom of gauge
    this.xLabelBar.y = this.gaugeHeight - 40;

    this.testSprite = new Sprite(Texture.WHITE);

    this.tableContainer.addChild(this.table, this.trail);
    this.addChild(
      this.maskSprite,
      this.background,
      this.tableContainer,
      this.xLabelBar,
      this.yLabelBar
    );
    this.mask = this.maskSprite;
  }

  /**
   * @param {Number} timestamp
   */
  update(timestamp) {
    // scale the x and y values to the table size
    // inverse y
    const tableHeight = cellHeight * this.totalYCells;
    const tableWidth = cellWidth * this.totalXCells;
    const x = (this.xValue / this.maxXValue) * (tableWidth);
    // inverse y  (because y0 is at the top in webGL)
    const y = tableHeight - ((this.yValue / this.maxYValue) * tableHeight);

    this.trail.update(x, y);
    if (!x) return

    const xIndex = Math.floor(x / cellWidth);
    const yIndex = Math.floor(y / cellHeight);
    const cell = this.lookupTable[xIndex][yIndex];
    cell.tint = this.chromaScale(Math.round(this._value)).num();
    this.activeCells.activate({ cell, xIndex, yIndex, timestamp });
    this.activeCells.expireOld();

    // viewport scaling
    if (
      this._max[0] !== this.max[0] ||
      this._max[1] !== this.max[1] ||
      this._min[0] !== this.min[0] ||
      this._min[1] !== this.min[1] 
    ) {
      const xCellsToDisplay = (this.max[0] - this.min[0]) / this.xCellUnit;
      const yCellsToDisplay = (this.max[1] - this.min[1]) / this.yCellUnit;
      const desiredXPixels = (xCellsToDisplay * cellWidth) + (cellWidth*2); // for extra padding?
      const desiredYPixels = (yCellsToDisplay * cellHeight) + (cellHeight*2); // for extra padding
      this.scaleFactor = Math.min(
        this.gaugeWidth / desiredXPixels,
        this.gaugeHeight / desiredYPixels,
        1.2
      );

      // test code 
      // this.scaleFactor = 0.3;
      // this.tableContainer.scale.set(this.scaleFactor, this.scaleFactor);
      // this.xLabelBar.scale.set(this.scaleFactor, this.scaleFactor);
      // this.yLabelBar.scale.set(this.scaleFactor, this.scaleFactor);

      const minxValue =
        (this.min[0] / this.maxXValue) * (tableWidth);
      const maxyValue =
        tableHeight -
        (this.max[1] / this.maxYValue) * (tableHeight);

      const minCell =
        this.lookupTable[Math.round(minxValue / cellWidth)][
          Math.round(maxyValue / cellHeight)
        ];
      const minX = -((minCell.x - cellWidth / 2) * this.scaleFactor);
      const minY = -((minCell.y - cellHeight * 2) * this.scaleFactor);

      this.xlabelbarAnim.clear();
      this.xlabelbarAnim.to(this.xLabelBar, {
        pixi: {
          x: minX,
          scaleX: this.scaleFactor,
        },
        duration: animationDuration,
      });

      this.ylabelbarAnim.clear();
      this.ylabelbarAnim.to(this.yLabelBar, {
        pixi: {
          y: minY,
          scaleY: this.scaleFactor,
        },
        duration: animationDuration,
      });

      // origin, top left, 0,0 - first move it back to 0, then move it further
      this.tableAnim.clear();
      this.tableAnim.to(this.tableContainer, {
        pixi: {
          x: minX,
          y: minY,
          scaleX: this.scaleFactor,
          scaleY: this.scaleFactor,
        },
        duration: animationDuration,
        onComplete: () => {},
      });
      this._max = [...this.max];
      this._min = [...this.min];
    }
  }
}

TimingGraph.ID = ID;
export default TimingGraph;

// IDea -  just make one single graph for - zoom in and out of that
