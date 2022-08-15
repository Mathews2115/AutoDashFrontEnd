import chroma from "chroma-js";
import { DATA_KEYS } from "../common/dataMap";
import { RENDER_KEYS } from "./Renderables";
import SideReadout from "./SideReadout";

const ID = RENDER_KEYS.CTS_READOUT;
class CTSReadout extends SideReadout {
  constructor({ renderer, theme }) {
    super(
      { renderer, theme },
      {
        readoutOptions: SideReadout.ReadoutOptions.coolant,
      }
    );
    this._dashID = ID;
  }

  get dataKey() {
    return DATA_KEYS.CTS;
  } 

  initialize() {
    this._initialize();
    this.bargraph.colors = {
      colors: [
        chroma("blue"),
        chroma(this.theme.gaugeActiveColor),
        chroma(this.theme.gaugeActiveColor),
        chroma(this.theme.warningColor),
        chroma(this.theme.dangerColor),
      ],
      chromaDomain: [40, 160, 190, 204, 230],
    };
  }
}

CTSReadout.ID = ID;
export default CTSReadout;
