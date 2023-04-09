import { FUEL_CONFIG, SCREEN } from "../appConfig";
import { RENDER_KEYS } from "./Renderables";
import { DATA_MAP, MAX_AVERAGE_POINTS } from "../common/dataMap";
import Histogram from "./Histogram";
const AVERAGE_MPG_KEY = DATA_MAP.AVERAGE_MPG_POINTS.id;

const ID = RENDER_KEYS.AVG_MPG_HISTOGRAM;
/**
 * Creates a new MpgHistogram.
 * @class MpgHistogram
 */

class MpgHistogram extends Histogram {
  constructor({ renderer, theme }) {
    super({renderer, theme, maxPoints: MAX_AVERAGE_POINTS, maxVal: FUEL_CONFIG.MAX_MPG });
    this._dashID = ID;
  }
  // the data store values we want to listen too
  get dataKey() {
    return AVERAGE_MPG_KEY;
  }
}

MpgHistogram.ID = ID;
export default MpgHistogram;
