import { DATA_KEYS } from "../common/dataMap";
import MediumReadout from "./MediumReadout";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.MAP_READOUT;
class MAPReadout extends MediumReadout {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.MAP;
  }
}

MAPReadout.ID = ID;
export default MAPReadout;
