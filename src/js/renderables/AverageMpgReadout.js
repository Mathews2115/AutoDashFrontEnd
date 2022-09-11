import { DATA_MAP } from "../common/dataMap";
import MediumReadout from "./MediumReadout";
import { RENDER_KEYS } from "./Renderables";

const ID = RENDER_KEYS.AVG_MPG_READOUT;
class AverageMpgReadout extends MediumReadout {
  constructor({ renderer, theme }) {
    super({ renderer, theme });
    this._dashID = ID;
  }

  // the data store values we want to listen too
  get dataKey() {
    return DATA_MAP.AVERAGE_MPG.id;
  }
}

AverageMpgReadout.ID = ID;
export default AverageMpgReadout;
