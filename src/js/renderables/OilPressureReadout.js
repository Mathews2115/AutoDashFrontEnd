import chroma from "chroma-js";
import { DATA_KEYS } from "../common/dataMap";
import { RENDER_KEYS } from "./Renderables";
import SideReadout from "./SideReadout";
const ID = RENDER_KEYS.OIL_PRESSURE;
class OilPressureReadout extends SideReadout {
  constructor({ renderer, theme }) {
    super(
      { renderer, theme },
      {
        readoutOptions: SideReadout.ReadoutOptions.oil,
      }
    );
    this._dashID = ID;
  }
  initialize() {
    this._initialize();
    this.bargraph.colors = {
      colors: [
        chroma(this.theme.dangerColor),
        chroma(this.theme.warningColor),
        chroma(this.theme.gaugeActiveColor),
      ],
      chromaDomain: [0, 20, 25],
    };
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.OIL_PRESSURE;
  }
}

OilPressureReadout.ID = ID;
export default OilPressureReadout;
