import { DATA_MAP } from "../common/dataMap";
import MediumReadout from "./MediumReadout";
import { RENDER_KEYS } from "./Renderables";
const CURRENT_MPG_KEY = DATA_MAP.CURRENT_MPG.id;
const ID = RENDER_KEYS.MPG_READOUT;
class CurrentMpgReadout extends MediumReadout {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
  }

  // the data store values we want to listen too
  get dataKey() {
    return CURRENT_MPG_KEY;
  }
}

CurrentMpgReadout.ID = ID;
export default CurrentMpgReadout;
