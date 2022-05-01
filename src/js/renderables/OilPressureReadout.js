import { DATA_KEYS } from "../common/dataMap";
import { RENDER_KEYS } from "./Renderables";
import Readout from "./Readout";

const ID = RENDER_KEYS.OIL_PRESSURE;
class OilPressureReadout extends Readout {
  constructor({ renderer, theme }) {
    super({ renderer, theme }, {digits:3, glowStrength: 1});
    this._dashID = ID;
  }
  set value(newValue) {
    if (newValue && newValue > 0) this._value = this.convertToNonDecimal(newValue);
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.OIL_PRESSURE;
  }
  get gaugeHeight() {
    return 60;
  }
}

OilPressureReadout.ID = ID;
export default OilPressureReadout;
