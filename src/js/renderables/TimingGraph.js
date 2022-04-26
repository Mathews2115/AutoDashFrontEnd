import { DATA_KEYS } from "../common/dataMap";
import EngineTable from "./EngineTable/EngineTable";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.IGN_TIMING_MAP;
const MAX_RPM = 5000;
const MAX_KPA = 100;
const graphOptions = { 
  maxXValue: MAX_RPM, 
  maxYValue: MAX_KPA, 
  xKey: DATA_KEYS.RPM, 
  yKey: DATA_KEYS.MAP, 
  valueKey: DATA_KEYS.IGNITION_TIMING
};
const colorOptions = {
  chromaScale: ["red", "yellow", "blue"],
  chromaDomain: [14, 25, 50]
}
class TimingGraph extends EngineTable {
  constructor({ renderer, theme }) {
    super({ renderer, theme }, graphOptions, colorOptions);
    this._dashID = ID;
  }
}

TimingGraph.ID = ID;
export default TimingGraph;
