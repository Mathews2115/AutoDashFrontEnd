import { DATA_KEYS } from "../common/dataMap";
import MediumReadout from "./MediumReadout";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.IGN_TIMING_READOUT;
class IgnTimingReadout extends MediumReadout {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.IGNITION_TIMING;
  }
}

IgnTimingReadout.ID = ID;
export default IgnTimingReadout;
