import { DATA_KEYS } from "../common/dataMap";
import EngineTable from "./EngineTable/EngineTable";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.IGN_TIMING_MAP;
const MAX_RPM = 5000;
const MAX_KPA = 100;

class TimingGraph extends EngineTable {
  constructor({ renderer, theme }) {
    super({ renderer, theme }, 
      MAX_RPM, MAX_KPA, 
      DATA_KEYS.RPM, 
      DATA_KEYS.MAP, 
      DATA_KEYS.IGNITION_TIMING);
    this._dashID = ID;
  }

  get gaugeWidth() {
    return 400;
  }
  get gaugeHeight() {
    return 380;
  } 
}

TimingGraph.ID = ID;
export default TimingGraph;
