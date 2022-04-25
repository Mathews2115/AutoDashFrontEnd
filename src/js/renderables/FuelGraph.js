import { DATA_KEYS } from "../common/dataMap";
import EngineTable from "./EngineTable/EngineTable";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.FUEL_MAP;
const MAX_RPM = 5000;
const MAX_KPA = 100;
const graphOptions = { 
  maxXValue: MAX_RPM, 
  maxYValue: MAX_KPA, 
  xKey: DATA_KEYS.RPM, 
  yKey: DATA_KEYS.MAP, 
  valueKey: DATA_KEYS.AFR_AVERAGE
};
const colorOptions = {
  chromaScale: ["red", "yellow", "blue"],
  chromaDomain: [10, 14, 20]
}

class FuelGraph extends EngineTable {
  constructor({ renderer, theme }) {
    super({ renderer, theme }, graphOptions, colorOptions);
    this._dashID = ID;
  }

  get gaugeWidth() {
    return 400;
  }
  get gaugeHeight() {
    return 380;
  } 
}

FuelGraph.ID = ID;
export default FuelGraph;
