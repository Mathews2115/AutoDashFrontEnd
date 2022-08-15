import chroma from "chroma-js";
import { DATA_KEYS } from "../common/dataMap";
import { RENDER_KEYS } from "./Renderables";
import SideReadout from "./SideReadout";
const ID = RENDER_KEYS.MAT_READOUT;
class MATReadout extends SideReadout {
  constructor({ renderer, theme }) {
    super(
      { renderer, theme },
      {
        readoutOptions: SideReadout.ReadoutOptions.mat,
      }
    );
    this._dashID = ID;
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

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.MAT;
  }
}

MATReadout.ID = ID;
export default MATReadout;

