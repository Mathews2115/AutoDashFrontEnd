import Readout from './Readout';
class MediumReadout extends Readout {
  constructor({ renderer, theme }) {
    super({ renderer, theme }, {digits: 2, glowStrength: 2});
  }

  get gaugeHeight() {
    return 90;
  }
}

export default MediumReadout;
