let key = 0;
const keygen = (reset = false) => {
  if (reset) key = 0;
  return key++;
};

export const DATA_KEYS = {
  // Data From CAN BUS
  PEDAL_POSITION: keygen(),
  RPM: keygen(),
  RTC: keygen(),
  FUEL_PRESSURE: keygen(),
  SPEEDO: keygen(),
  INJECTOR_PULSEWIDTH: keygen(),
  FUEL_FLOW: keygen(),
  CLOSED_LOOP_STATUS: keygen(),
  DUTY_CYCLE: keygen(),
  AFR_LEFT: keygen(),
  CLOSED_LOOP_COMP: keygen(),
  AFR_RIGHT: keygen(),
  TARGET_AFR: keygen(),
  AFR_AVERAGE: keygen(),
  IGNITION_TIMING: keygen(),
  MAP: keygen(),
  KNOCK_RETARD: keygen(),
  MAT: keygen(),
  TPS: keygen(),
  BAR_PRESSURE: keygen(),
  CTS: keygen(),
  OIL_PRESSURE: keygen(),
  BATT_VOLTAGE: keygen(),

  // Data from GPS
  ODOMETER: keygen(),
  TRIP_ODOMETER: keygen(), //
  GPS_SPEEED: keygen(), //m
  // HEADING: keygen(),

  // Our Data
  WARNINGS: keygen(),
  FUEL_LEVEL: keygen(),
  CURRENT_MPG: keygen(),
  AVERAGE_MPG: keygen(),
  AVERAGE_MPG_POINTS: keygen(),
  AVERAGE_MPG_POINT_INDEX: keygen(),
  LOW_LIGHT_DETECTED: keygen(),

  //
  MAX_AVERAGE_POINTS: 100, // make sure this is the same as in PacketEntry.js
};

// Keys for handling the WARNINGS Structure
export const WARNING_KEYS = {
  BATT_VOLTAGE: keygen(true), // voltage too low
  OIL_PRESSURE: keygen(), // pressure too low
  LOW_FUEL: keygen(),
  ENGINE_TEMPERATURE: keygen(), // temp too high
  ECU_COMM: keygen(), // trouble communicating with ECU via CAN
  GPS_NOT_ACQUIRED: keygen(), // no 2d/3d fix aqcuired yet
  GPS_ERROR: keygen(), // some sort of untracked error occurred
  COMM_ERROR: keygen(),
};

/**
 * Once Source of truth - keyed by DATA_KEYS
 * @returns
 */
export const createDataStore = () => {
  let dataStore = [];
  for (const [_key, value] of Object.entries(DATA_KEYS)) {
    dataStore[value] = 0;
  }

  /**
   *
   * @param {*} key - key from DATA_KEYS
   * @returns
   */
  const getData = (key) => {
    return dataStore[key];
  };

  /**
   *
   * @param {*} warningMask - value from WARNING_KEYS
   * @returns {Boolean}
   */
  const getWarning = (warningMask) => {
    return !!(dataStore[DATA_KEYS.WARNINGS] & (128 >> warningMask % 8));
  };

  /**
   * 
   * @param {Number} key 
   * @param {*} data 
   */
  const setData = (key, data) => {
    dataStore[key] = data;
  };

  /**
   * 
   * @param {Number} bit 
   * @param {Boolean} value 
   */
  const setWarningBit = (bit, value) => {
    if (bit > 7) throw "I screwed up: error - bit field key cannot be > 7";
    if (value) {
      // set the bit
      dataStore[DATA_KEYS.WARNINGS] =
        dataStore[DATA_KEYS.WARNINGS] | (128 >> bit % 8);
    } else {
      // clear the bit
      dataStore[DATA_KEYS.WARNINGS] =
        dataStore[DATA_KEYS.WARNINGS] & ~(128 >> bit % 8);
    }
  };

  return {
    get: getData,
    getWarning: getWarning,
    set: setData,
    setWarning: setWarningBit,
    data: dataStore,
  };
};
