// https://github.com/nathanboktae/robust-websocket#usage
import RobustWebSocket from "robust-websocket";
import { createDataStore, WARNING_KEYS } from "../common/dataMap";

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
    dataStore.deserialize(data);
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
