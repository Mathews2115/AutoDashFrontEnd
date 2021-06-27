
/**
 * IDs used to key into the DataStorage.  This is populated by the Dash Server via CANBUS data, etc.
 */
export const DATA_KEYS = {
  PEDAL_POSITION: 0,
  RPM: 1,
  RTC: 2,
  FUEL_PRESSURE: 3,
  SPEEDO: 4,
  INJECTOR_PULSEWIDTH: 5,
  FUEL_FLOW: 6,
  CLOSED_LOOP_STATUS: 7,
  DUTY_CYCLE: 8,
  AFR_LEFT: 9,
  CLOSED_LOOP_COMP: 10,
  AFR_RIGHT: 11,
  TARGET_AFR: 12,
  AFR_AVERAGE: 13,
  IGNITION_TIMING: 14,
  MAP: 15,
  KNOCK_RETARD: 16,
  MAT: 17,
  TPS: 18,
  BAR_PRESSURE: 19,
  CTS: 20,
  OIL_PRESSURE: 21,
  BATT_VOLTAGE: 22,
  ODOMETER: 23,
  GPS_ACQUIRED: 24,
  GPS_ERROR: 25,
  ECON_DATA: 26,
  COMM_ERROR: 27,
};

export const WARNING_DATA_KEYS = {
  BATTERY: 0,
  OIL_PRESSURE: 1,
  ENGINE_TEMPERATURE: 2
}

/**
 * Once Source of truth - keyed by DATA_KEYS
 * @returns 
 */
export const createDataStore = () => {
  let dataStore = [];
  for (const [_key, value] of Object.entries(DATA_KEYS)) {
    dataStore[value] = null;
  }
  return dataStore;
  
}
