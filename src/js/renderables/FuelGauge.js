import { SCREEN } from "../appConfig";
import { RENDER_KEYS } from "./Renderables";
import { DATA_MAP } from "../common/dataMap";
import BarGraph from "./BarGraph";
const FUEL_GAUGE_KEY = DATA_MAP.FUEL_LEVEL.id;

const ID = RENDER_KEYS.FUEL_GAUGE;
/**
 * Creates a new FuelGauge.
 * @class FuelGauge
 */
class FuelGauge extends BarGraph {
  constructor({ renderer, theme }) {
    super({renderer, theme, width: SCREEN.BAR_WIDTH, height: SCREEN.RPM_CLUSTER_HEIGHT });
    this._dashID = ID;
  }

  // the data store values we want to listen too
  get dataKey() {
    return FUEL_GAUGE_KEY;
  }
}

FuelGauge.ID = ID;
export default FuelGauge;