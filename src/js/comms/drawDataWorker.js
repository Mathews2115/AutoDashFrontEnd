// https://github.com/nathanboktae/robust-websocket#usage
import RobustWebSocket from "robust-websocket";
import { createDataStore, DATA_KEYS, WARNING_KEYS } from "../common/dataMap";
import RingBuffer from "../common/ringBuffer";

const dataStore = createDataStore();

// Testing some data readouts
// dataStore.set(DATA_KEYS.RPM, 4500);
// const data = new Uint8Array(100);
// for(let i = 0; i < 100; i++){
//   data[i] = Math.random() * 25;
// }
// dataStore.set(DATA_KEYS.CURRENT_MPG, 12);
// dataStore.set(DATA_KEYS.AVERAGE_MPG, 6);
// dataStore.set(DATA_KEYS.GPS_SPEEED, 65);
// dataStore.set(DATA_KEYS.ODOMETER, 62636);
// dataStore.set(DATA_KEYS.AVERAGE_MPG_POINTS, new RingBuffer(data.buffer, 0, 100, 1));

RobustWebSocket.prototype.binaryType = 'arraybuffer';
const createWS = () => {
  dataStore.setWarning(WARNING_KEYS.COMM_ERROR, true);
  let ws = new RobustWebSocket("ws://localhost:3333", null, {
    timeout: 30000,
    shouldReconnect: () => 0,
    ignoreConnectivityEvents: false,
  });
  ws.addEventListener('open', function(event) {
    dataStore.setWarning(WARNING_KEYS.COMM_ERROR, false);
    // ws.send('Hello!')
  })
  ws.addEventListener('close', (event) => {
    dataStore.setWarning(WARNING_KEYS.COMM_ERROR, true);
  })
  ws.addEventListener('error', (event) => {
    dataStore.setWarning(WARNING_KEYS.COMM_ERROR, true);
  })

  ws.addEventListener("message", (/** @type {{ data: ArrayBuffer; }} */ evt) => parsePacket(evt));
  return ws;
};

/**
 * These Byte offsets MUST match PacketEntry.js from AutoDashBackEnd
 * @param {DataView} data 
 */
const parseData = (data) => {
  try {
    dataStore.set(DATA_KEYS.PEDAL_POSITION, data.getInt8(0)); // xxx percent
    dataStore.set(DATA_KEYS.RPM, data.getInt16(1));          // xx,xxx
    dataStore.set(DATA_KEYS.FUEL_FLOW, data.getInt16(3));    // Fuel Flow  x,xxx pounds/hour
    dataStore.set(DATA_KEYS.TARGET_AFR, data.getFloat32(5)); // xx.x A/F
    dataStore.set(DATA_KEYS.AFR_AVERAGE, data.getFloat32(9));// xx.x A/F
    dataStore.set(DATA_KEYS.IGNITION_TIMING, data.getFloat32(13)); // xx.x degrees
    dataStore.set(DATA_KEYS.MAP, data.getInt16(17)); // xxx kPa
    dataStore.set(DATA_KEYS.MAT, data.getInt16(19));// xxx F
    dataStore.set(DATA_KEYS.CTS, data.getInt16(21));// xxx F
    dataStore.set(DATA_KEYS.BAR_PRESSURE, data.getFloat32(23));// xxx.x kPa
    dataStore.set(DATA_KEYS.OIL_PRESSURE, data.getInt16(27));// xxx   psi
    dataStore.set(DATA_KEYS.BATT_VOLTAGE, data.getFloat32(29));// xx.x volts
    dataStore.set(DATA_KEYS.WARNINGS, data.getUint8(33));

    dataStore.set(DATA_KEYS.ODOMETER, data.getInt16(34));
    dataStore.set(DATA_KEYS.TRIP_ODOMETER, data.getInt16(36));//its gonna roll over early, lol - ill fix this at some point
    dataStore.set(DATA_KEYS.GPS_SPEEED, data.getInt16(38));
    dataStore.set(DATA_KEYS.FUEL_LEVEL, data.getInt8(40));
    dataStore.set(DATA_KEYS.CURRENT_MPG, data.getFloat32(41));
    dataStore.set(DATA_KEYS.AVERAGE_MPG, data.getFloat32(45));
    dataStore.set(DATA_KEYS.AVERAGE_MPG_POINTS, new RingBuffer(data.buffer, 49, 100, data.getInt8(149)));
    dataStore.set(DATA_KEYS.LOW_LIGHT_DETECTED, data.getInt8(150));
  } catch (error) {
    console.error(error);
  }
}

const parsePacket = (/** @type {{ data: ArrayBuffer; }} */ event) => {
  parseData( new DataView(event.data));
};

let ws = null;
onmessage = (evt) => {
  switch (evt.data.msg) {
    case "start":
      ws = createWS();
      break;

    case "process_update_data":
      postMessage({ msg: "update_data_ready", updateData: dataStore.data });
      break;

    default:
      break;
  }
};
