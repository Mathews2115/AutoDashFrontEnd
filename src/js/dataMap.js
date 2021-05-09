
/**
 * IDs used to key into the DataStorage.  This is populated by the Dash Server via CANBUS data, etc.
 */
export const DATA_KEYS = {
  PEDAL_POSITION: 0,
  RPM: 1,
  RTC: 2,
  FUEL_PRESSURE: 3,
};

export const createDataStore = () => {
  let dataStore = [];
  for (const [_key, value] of Object.entries(DATA_KEYS)) {
    dataStore[value] = null;
  }
  return dataStore;
  
}
