import { DATA_MAP } from "../common/dataMap";
import EngineTable from "./EngineTable/EngineTable";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.FUEL_MAP;
const MAX_RPM = 5000;
const MAX_KPA = 100;
const graphOptions = { 
  maxXValue: MAX_RPM, 
  maxYValue: MAX_KPA, 
  xKey: DATA_MAP.RPM.id, 
  yKey: DATA_MAP.MAP.id, 
  valueKey: DATA_MAP.AFR_AVERAGE.id
};
const colorOptions = {
  chromaScale: ["red", "orange", "blue"],
  chromaDomain: [10, 14, 20]
}

class FuelGraph extends EngineTable {
  constructor({ renderer, theme }) {
    super({ renderer, theme }, graphOptions, colorOptions);
    this._dashID = ID;
  }
}

FuelGraph.ID = ID;
export default FuelGraph;
