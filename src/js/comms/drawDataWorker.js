// https://github.com/nathanboktae/robust-websocket#usage
import RobustWebSocket from "robust-websocket";
import { createDataStore, DATA_KEYS, WARNING_KEYS } from "../dataMap";

const dataStore = createDataStore();

// TESTING STUFF
let modifier = 1;
let speed =0;
//////////////////////////////////

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

  ws.addEventListener("message", (evt) => parsePacket(evt));
  return ws;
};

/**
 * 
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
    dataStore.set(DATA_KEYS.SPEEDO, data.getInt16(38));
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
      // request for latest data
      // let data = evt.data.updateData;

      // TEST DATA!!!! (yes I know, I'll make an actual test mode that will do this later shutup)
      if (speed >= 99) modifier = -1;
      else if (speed <= 0) modifier = 0.3;
      speed += modifier;
      dataStore.set(DATA_KEYS.SPEEDO, speed);

      postMessage({ msg: "update_data_ready", updateData: dataStore.data });
      break;

    default:
      break;
  }
};
