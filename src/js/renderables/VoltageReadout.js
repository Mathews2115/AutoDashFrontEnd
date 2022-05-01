import { DATA_KEYS } from "../common/dataMap";
import Readout from "./Readout";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.VOLTAGE_READOUT;
class VoltageReadout extends Readout {
  constructor({ renderer, theme }) {
    super({ renderer, theme}, {digits:3, glowStrength: 1, decimalPlaces: 1});
    this._dashID = ID;
  }
  get dataKey() {
    return DATA_KEYS.BATT_VOLTAGE;
  }
  get gaugeHeight() {
    return 60;
  }
}

VoltageReadout.ID = ID;
export default VoltageReadout;
