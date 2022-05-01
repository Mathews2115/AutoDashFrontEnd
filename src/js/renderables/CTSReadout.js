import { DATA_KEYS } from "../common/dataMap";
import Readout from "./Readout";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.CTS_READOUT;
class CTSReadout extends Readout {
  constructor({ renderer, theme }) {
    super({ renderer, theme }, {digits:3, glowStrength: 1});
    this._dashID = ID;
  }
  get dataKey() {
    return DATA_KEYS.CTS;
  }
  get gaugeHeight() {
    return 60;
  }
}

CTSReadout.ID = ID;
export default CTSReadout;
