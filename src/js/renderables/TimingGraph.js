import { DATA_MAP } from "../common/dataMap";
import EngineTable from "./EngineTable/EngineTable";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.IGN_TIMING_MAP;
const MAX_RPM = 5000;
const MAX_KPA = 100;
const graphOptions = { 
  maxXValue: MAX_RPM, 
  maxYValue: MAX_KPA, 
  xKey: DATA_MAP.RPM.id, 
  yKey: DATA_MAP.MAP.id, 
  valueKey: DATA_MAP.IGNITION_TIMING.id
};
const colorOptions = {
  chromaScale: ["red", "orange", "blue"],
  chromaDomain: [10, 25, 50]
}
class TimingGraph extends EngineTable {
  constructor({ renderer, theme }) {
    super({ renderer, theme }, graphOptions, colorOptions);
    this._dashID = ID;
  }
}

TimingGraph.ID = ID;
export default TimingGraph;
