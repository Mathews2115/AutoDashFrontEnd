import chroma from "chroma-js";
import { DATA_MAP } from "../common/dataMap";
import { RENDER_KEYS } from "./Renderables";
import SideReadout from "./SideReadout";
const ID = RENDER_KEYS.OIL_PRESSURE;
const OIL_PRESSURE_KEY = DATA_MAP.OIL_PRESSURE.id;
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
    return OIL_PRESSURE_KEY;
  }
}

OilPressureReadout.ID = ID;
export default OilPressureReadout;
