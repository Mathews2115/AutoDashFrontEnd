import chroma from "chroma-js";
import { DATA_MAP } from "../common/dataMap";
import { RENDER_KEYS } from "./Renderables";
import SideReadout from "./SideReadout";
const VOLT_KEY = DATA_MAP.BATT_VOLTAGE.id;
const ID = RENDER_KEYS.VOLTAGE_READOUT;
class VoltageReadout extends SideReadout {
  constructor({ renderer, theme }) {
    super(
      { renderer, theme },
      {
        readoutOptions: SideReadout.ReadoutOptions.voltage,
      }
    );
    this._dashID = ID;
  }

  get dataKey() {
    return VOLT_KEY;
  }
  
  initialize() {
    this._initialize();
    this.bargraph.colors = {
      colors: [
        chroma(this.theme.dangerColor),
        chroma(this.theme.warningColor),
        chroma(this.theme.gaugeActiveColor),
      ],
      chromaDomain: [10, 11, 12],
    };
  }
}

VoltageReadout.ID = ID;
export default VoltageReadout;
