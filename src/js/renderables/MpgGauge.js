import { SCREEN, FUEL_CONFIG } from "../appConfig";
import { RENDER_KEYS } from "./Renderables";
import { DATA_KEYS } from "../common/dataMap";
import BarGraph from "./BarGraph";

const ID = RENDER_KEYS.MPG_GAUGE;
/**
 * Creates a new MpgGauge.
 * @class MpgGauge
 */
class MpgGauge extends BarGraph {
  constructor({ renderer, theme }) {
    super({renderer, theme, 
      width: SCREEN.BAR_WIDTH, 
      height: SCREEN.RPM_CLUSTER_HEIGHT,
      maxValue: FUEL_CONFIG.MAX_MPG
    });
    this._dashID = ID;
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_KEYS.CURRENT_MPG;
  }
}

MpgGauge.ID = ID;
export default MpgGauge;