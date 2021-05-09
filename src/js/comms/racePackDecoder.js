import {DATA_KEYS} from "../dataMap";

const ecuSerial = 0x00007ad0 & 0x7ff; // used to decode message IDs

const RACEPACK_CAN_MAP = {
  /**
   * 1E0012D0
   * RTC:  (1/1000 sec since power on)xx:xx:xx.xx  time[0..3]
   * RPM:  xx,xxx RPM[4..7]
   * @param {DataView} data
   */
   0x1E001000: (data) => {
    return [
      { id: DATA_KEYS.RTC, data: data.getUint32(0) },
      { id: DATA_KEYS.RPM, data: data.getUint32(4) / 256 },
    ];
  },
  /**
   * Pedal Position xxx percent[0..3]
   * Fuel Pressurexxx psi[4..7]
   * @param {DataView} data
   * @returns 
   */
   0x1E029000: (data) => {
    return [
      { id: DATA_KEYS.PEDAL_POSITION, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.FUEL_PRESSURE, data: data.getUint32(4) / 256 },
    ];
  },
};

const racePackDecoder = {
  /**
   * @param {Number} packet_id
   * @param {ArrayBuffer} canData
   */
  decode: (packet_id, canData) => {
    
    const decodedId = packet_id & 0xfffff800;
    if (!!RACEPACK_CAN_MAP[decodedId]) {
      return RACEPACK_CAN_MAP[decodedId ](new DataView(canData));
    } else {
      return [];
    }
  },
  packetIdLength: 4,
};

export default racePackDecoder;
