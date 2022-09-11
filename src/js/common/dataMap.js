import RingBuffer from "./ringBuffer.js";

let key = 0;
const keygen = (reset = false) => {
  if (reset) key = 0;
  return key++;
};

// NOTE!!!!!!!!!!!!!!!
// IF YOU CHANGE ANYTHING HERE; MAKE SURE IT GETS COPIED OVER TO BACKEND DATAKEYS.JS AS WELL!!!


export const TYPES = {
  INT8: 1,
  INT16: 2,
  FLOAT: 3,
  BITFIELD: 4,
  SPECIAL_ARRAY: 5, // 100 bytes
  UINT8: 6,
  UINT16: 7,
  UINT32: 8,
}

/**
 * @typedef {{ id: number,byteType: number }} DataMapEntry
 * Data Keys are a hash of DataMapEntry objects
 * @typedef {Object.<string, DataMapEntry>} DataKeys
 */
export const DATA_MAP = {
  // Data From CAN BUS
  PEDAL_POSITION: { id: keygen(), byteType: TYPES.INT8 },  // xxx percent
  RPM: { id: keygen(), byteType: TYPES.INT16 }, // units 1 === 1 RPM,  xx,xxx
  // RTC: { id: keygen(),byteType: TYPES.FOUR_BYTES }, // RTC clock = not used or defined yet
  FUEL_PRESSURE: { id: keygen(), byteType: TYPES.INT16 }, // units 1 === 1 psi
  SPEEDO: { id: keygen(), byteType: TYPES.INT16 }, // Holley Speed = units 1 === 1 mph
  INJECTOR_PULSEWIDTH: { id: keygen(), byteType: TYPES.INT16 },
  FUEL_FLOW: { id: keygen(), byteType: TYPES.INT16 }, // x,xxx pounds/hour
  CLOSED_LOOP_STATUS: { id: keygen(), byteType: TYPES.INT8 },
  DUTY_CYCLE: { id: keygen(), byteType: TYPES.INT8 },
  AFR_LEFT: { id: keygen(), byteType: TYPES.FLOAT }, // xx.x A/F
  CLOSED_LOOP_COMP: { id: keygen(), byteType: TYPES.INT16 },
  AFR_RIGHT: { id: keygen(), byteType: TYPES.FLOAT }, // xx.x A/F
  TARGET_AFR: { id: keygen(), byteType: TYPES.FLOAT }, // xx.x A/F
  AFR_AVERAGE: { id: keygen(), byteType: TYPES.FLOAT }, // xx.x A/F
  IGNITION_TIMING: { id: keygen(), byteType: TYPES.FLOAT }, // units 1 == 1 degree
  MAP: { id: keygen(), byteType: TYPES.INT16 }, // units 1 === 1 (PRESSURE_TYPE) (defaults to kpa if not set)
  KNOCK_RETARD: { id: keygen(), byteType: TYPES.INT16 },
  MAT: { id: keygen(), byteType: TYPES.INT16 }, //manifold temp 
  TPS: { id: keygen(), byteType: TYPES.INT8 },
  BAR_PRESSURE: { id: keygen(), byteType: TYPES.FLOAT },// xxx.x kPa
  CTS: { id: keygen(), byteType: TYPES.INT16 },  // coolant (defaults to F if TEMP_TYPE isnt set )
  OIL_PRESSURE: { id: keygen(), byteType: TYPES.INT16 }, // PSI  // xxx   psi
  BATT_VOLTAGE: { id: keygen(), byteType: TYPES.FLOAT }, // xx.x volts

  // Data from GPS
  ODOMETER: { id: keygen(), byteType: TYPES.INT16 },// Current Miles Odometer
  TRIP_ODOMETER: { id: keygen(), byteType: TYPES.INT16 }, //
  GPS_SPEEED: { id: keygen(), byteType: TYPES.INT16 }, // Speed MPH

  WARNINGS: { id: keygen(), byteType: TYPES.BITFIELD }, // see warning keys

  FUEL_LEVEL: { id: keygen(), byteType: TYPES.INT8 }, // 0-100%
  CURRENT_MPG: { id: keygen(), byteType: TYPES.FLOAT },
  AVERAGE_MPG: { id: keygen(), byteType: TYPES.FLOAT },
  AVERAGE_MPG_POINTS: { id: keygen(), byteType: TYPES.SPECIAL_ARRAY }, // histogram of MPG points
  AVERAGE_MPG_POINT_INDEX: { id: keygen(), byteType: TYPES.INT8 },
  LOW_LIGHT_DETECTED: { id: keygen(), byteType: TYPES.INT8 },

  // TODO: ;just make a single bitfield for these types of things
  PRESSURE_TYPE: { id: keygen(), byteType: TYPES.INT8 }, // 0 for PSI, 1 for kpa
  TEMP_TYPE: { id: keygen(), byteType: TYPES.INT8 }, // 0 for F, 1 for C

  ///
  SOME_NEW_VALUE: { id: keygen(), byteType: TYPES.UINT32 },
};

export const MAX_AVERAGE_POINTS = 100;

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


// iterate through each key and add the byteOffset to the object
let offset = 0;
Object.keys(DATA_MAP).forEach((key) => {
  const entry = DATA_MAP[key];
  entry.byteOffset = offset;
  switch (entry.byteType) {
    case TYPES.INT8:
      offset += 1;
      break;
    case TYPES.INT16:
      offset += 2;
      break;
    case TYPES.FLOAT:
      offset += 4;
      break;
    case TYPES.BITFIELD:
      offset += 1;
      break;
    case TYPES.SPECIAL_ARRAY:
      offset += 100;
      break;
    case TYPES.UINT8:
      offset += 1;
      break;
    case TYPES.UINT16:
      offset += 2;
      break;
    case TYPES.UINT32:
      offset += 4;
      break;
    default:
      throw new Error(`Unknown byteType: ${entry.byteType}`);
  }

});


Object.freeze(DATA_MAP);
/**
 * Once Source of truth - keyed by DATA_KEYS
 * @returns
 */
export const createDataStore = () => {
  let dataStore = [];
  let deserializer = [];
  for (const [_key, value] of Object.entries(DATA_MAP)) {
    dataStore[value.id] = 0;
    switch (value.byteType) {
      case TYPES.INT8:
        deserializer[value.id] = (data) => data.getInt8(value.byteOffset);
        break;
      case TYPES.INT16:
        deserializer[value.id] = (data) => data.getInt16(value.byteOffset);
        break;
      case TYPES.UINT8:
        deserializer[value.id] = (data) => data.getUint8(value.byteOffset);
        break;
      case TYPES.UINT16:
        deserializer[value.id] = (data) => data.getUint16(value.byteOffset);
        break;
      case TYPES.UINT32:
        deserializer[value.id] = (data) => data.getUint32(value.byteOffset);
        break;
      case TYPES.FLOAT:
        deserializer[value.id] = (data) => data.getFloat32(value.byteOffset);
        break;
      case TYPES.BITFIELD:
        deserializer[value.id] = (data) => data.getUint8(value.byteOffset);
        break;
      case TYPES.SPECIAL_ARRAY:
        deserializer[value.id] = (data) => new RingBuffer(data.buffer, value.byteOffset, 100, data.getInt8(value.byteOffset + 100));
        break;
      default:
        throw new Error(`Unknown type ${value.byteType}`);
    }
  }

  /**
   *
   * @param {DataMapEntry} dataMapKey - key from DATA_KEYS
   * @returns
   */
  const getData = (dataMapKey) => {
    return dataStore[dataMapKey.id];
  };

  /**
   *
   * @param {*} warningMask - value from WARNING_KEYS
   * @returns {Boolean}
   */
  const getWarning = (warningMask) => {
    return !!(dataStore[DATA_MAP.WARNINGS.id] & (128 >> warningMask % 8));
  };

  /**
   * 
   * @param {DataMapEntry} dataMapKey 
   * @param {*} data 
   */
  const setData = (dataMapKey, data) => {
    dataStore[dataMapKey.id] = data;
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
      dataStore[DATA_MAP.WARNINGS.id] =
        dataStore[DATA_MAP.WARNINGS.id] | (128 >> bit % 8);
    } else {
      // clear the bit
      dataStore[DATA_MAP.WARNINGS.id] =
        dataStore[DATA_MAP.WARNINGS.id] & ~(128 >> bit % 8);
    }
  };

  return {
    get: getData,
    getWarning: getWarning,
    set: setData,
    setWarning: setWarningBit,
    deserialize: (/** @type {DataView} */ data) => {
      // this is dumb, and a waste of cpu cycles to do this everytime, will optimize later
      for (const [_key, dataMapKey] of Object.entries(DATA_MAP)) {
        dataStore[dataMapKey.id] = deserializer[dataMapKey.id](data);
      }
    },
    data: dataStore,
  };
};
