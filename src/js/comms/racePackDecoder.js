import { DATA_KEYS } from "../dataMap";

const ecuSerial = 0x00007ad0 & 0x7ff; // used to decode message IDs

const RACEPACK_CAN_MAP = {
  /**
   * 1E0012D0
   * RTC:  (1/1000 sec since power on)xx:xx:xx.xx  time[0..3]
   * RPM:  xx,xxx RPM[4..7]
   * @param {DataView} data
   */
  0x1e001000: (data) => {
    return [
      { id: DATA_KEYS.RTC, data: data.getUint32(0) },
      { id: DATA_KEYS.RPM, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E005000
   * Injector Pulsewidth  xx.x  milliseconds
   * Fuel Flow            x,xxx pounds/hour
   * @param {DataView} data
   */
  0x1e005000: (data) => {
    return [
      { id: DATA_KEYS.INJECTOR_PULSEWIDTH, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.FUEL_FLOW, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E009000
   * Closed Loop Status on/off
   * Duty Cycle         xxx.x percent
   * @param {DataView} data
   */
  0x1E009000: (data) => {
    return [
      { id: DATA_KEYS.CLOSED_LOOP_STATUS, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.DUTY_CYCLE, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * Pedal Position xxx percent
   * Fuel Pressure  xxx psi
   * @param {DataView} data
   * @returns
   */
  0x1e029000: (data) => {
    return [
      { id: DATA_KEYS.PEDAL_POSITION, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.FUEL_PRESSURE, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E00D000
   * AFR Left                   xx.x A/F
   * Closed Loop Compensation   xxx percent
   * @param {DataView} data
   * @returns
   */
  0x1e00d000: (data) => {
    return [
      { id: DATA_KEYS.AFR_LEFT, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.CLOSED_LOOP_COMP, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E011000
   * Target AFR                   xx.x A/F
   * AFR Right                    xx.x A/F
   * @param {DataView} data
   * @returns
   */
  0x1E011000: (data) => {
    return [
      { id: DATA_KEYS.TARGET_AFR, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.AFR_RIGHT, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E015000
   * Ignition Timing  xx.x degrees
   * AFR Average      xx.x A/F
   * @param {DataView} data
   * @returns
   */
  0x1E015000: (data) => {
    return [
      { id: DATA_KEYS.IGNITION_TIMING, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.AFR_AVERAGE, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E019000
   * Manifold Air Pressure (MAP)    xxx kPa
   * Knock Retard                   x degrees
   * @param {DataView} data
   * @returns
   */
   0x1E019000: (data) => {
    return [
      { id: DATA_KEYS.MAP, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.KNOCK_RETARD, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E01D000
   * Manifold Air Temperature (MAT)xxx F
   * Throttle Position Sensor (TPS)xxx percent
   * @param {DataView} data
   * @returns
   */
   0x1E01D000: (data) => {
    return [
      { id: DATA_KEYS.MAT, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.TPS, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E021000
   * Barometric Pressure          xxx.x kPa
   * Coolant Temperature (CTS)    xxx F
   * @param {DataView} data
   * @returns
   */
   0x1E021000: (data) => {
    return [
      { id: DATA_KEYS.BAR_PRESSURE, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.CTS, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 1E025000
   * Oil Pressure         xxx   psi
   * Battery Voltage      xx.x volts
   * @param {DataView} data
   * @returns
   */
   0x1E025000: (data) => {
    return [
      { id: DATA_KEYS.OIL_PRESSURE, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.BATT_VOLTAGE, data: data.getUint32(4) / 256 },
    ];
  },

  /**
   * 0x1E049000
   * Line Pressure  xxx percent
   * Speed          xxx MPH
   * @param {DataView} data
   * @returns
   */
  0x1e049000: (data) => {
    return [
      { id: DATA_KEYS.LINE_PRESSURE, data: data.getUint32(0) / 256 },
      { id: DATA_KEYS.SPEEDO, data: data.getUint32(4) / 256 },
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
      return RACEPACK_CAN_MAP[decodedId](new DataView(canData));
    } else {
      return [];
    }
  },
  packetIdLength: 4,
};

export default racePackDecoder;
