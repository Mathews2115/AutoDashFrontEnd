// https://github.com/nathanboktae/robust-websocket#usage
import RobustWebSocket from "robust-websocket";
import { createDataStore, DATA_KEYS } from "../dataMap";
import decoder from "./racePackDecoder";

const processed_data = createDataStore();
const pktHlpr = new Uint32Array(3);

const PKT = {
  ID: 0, //  TODO: make this import file instea
  LENGTH: 1,
  BYTE_OFFSET: 2,
};

// TESTING STUFF
let modifier = 1;
let speed =0;
//////////////////////////////////

RobustWebSocket.prototype.binaryType = 'arraybuffer';
const PACKET_ID_LENGTH = decoder.packetIdLength; //in bytes
const createWS = () => {
  processed_data[DATA_KEYS.COMM_ERROR] = true;
  let ws = new RobustWebSocket("ws://localhost:3333", null, {
    timeout: 30000,
    shouldReconnect: () => 0,
    ignoreConnectivityEvents: false,
  });
  ws.addEventListener('open', function(event) {
    processed_data[DATA_KEYS.COMM_ERROR] = false;
    // ws.send('Hello!')
  })
  ws.addEventListener('close', (event) => {
    processed_data[DATA_KEYS.COMM_ERROR] = true;
  })
  ws.addEventListener('error', (event) => {
    processed_data[DATA_KEYS.COMM_ERROR] = true;
  })

  ws.addEventListener("message", (evt) => parsePacket(evt));
  return ws;
};

/**
 * 
 * @param {ArrayBuffer} buffer 
 */
const parseCANData = (buffer) => {
  try {
    let data = new DataView(buffer);

    // here is some stupid memory allocation optimization that probably
    // doesn't work and looks goddamn gross
    while (pktHlpr[PKT.BYTE_OFFSET] < buffer.byteLength) {
      // get CAN ID
      pktHlpr[PKT.ID] = data.getUint32(pktHlpr[PKT.BYTE_OFFSET]); // TODO: make this dynamic??
      pktHlpr[PKT.BYTE_OFFSET] += PACKET_ID_LENGTH;

      // get CAN data length
      pktHlpr[PKT.LENGTH] = data.getUint8(pktHlpr[PKT.BYTE_OFFSET]);
      pktHlpr[PKT.BYTE_OFFSET] += 1;

      // update CAN data using ID
      let decoded_data = decoder.decode(
        pktHlpr[PKT.ID],
        data.buffer.slice(
          pktHlpr[PKT.BYTE_OFFSET],
          pktHlpr[PKT.BYTE_OFFSET] + pktHlpr[PKT.LENGTH]
        )
      );
      decoded_data.forEach((element) => {
        processed_data[element.id] = element.data;
      });

      pktHlpr[PKT.BYTE_OFFSET] += pktHlpr[PKT.LENGTH]
    }
    // reset count for next time
    pktHlpr[PKT.BYTE_OFFSET] = 0;
  } catch (error) {

  }
}

/**
 *  GPS Packet Data:
  // Byte 0 - 0-255 speed in kph
  // Byte 1 - Bit 0: signal acquired | Bit 1: Serial Error
  // Byte 2 - 2 Bytes - odometer
 * @param {ArrayBuffer} buffer 
 */
const parseGPSData = (buffer) => {
  try {
    let data = new DataView(buffer);
    // processed_data[DATA_KEYS.SPEEDO] = data.getUint8(0);
    let flags = data.getUint8(1);
    processed_data[DATA_KEYS.GPS_ACQUIRED] = !!(flags & 0x1);
    processed_data[DATA_KEYS.GPS_ERROR] = !!(flags & 0x2);
    processed_data[DATA_KEYS.ODOMETER] = data.getUint16(2);
  } catch (e) {

  }
}

const parsePacket = (/** @type {{ data: ArrayBuffer; }} */ event) => {
  let data = new DataView(event.data);
  parseGPSData(data.buffer.slice(0,4));
  parseCANData(data.buffer.slice(4));
};

let ws = null;
onmessage = (evt) => {
  switch (evt.data.msg) {
    case "start":
      ws = createWS();
      break;

    case "process_update_data":
      // request for latest data
      let data = evt.data.updateData;

      // TEST DATA!!!! (yes I know, I'll make an actual test mode that will do this later shutup)
      if (speed >= 99) modifier = -1;
      else if (speed <= 0) modifier = 0.3;
      speed += modifier;
      processed_data[DATA_KEYS.SPEEDO] =speed;

      data = processed_data;
      postMessage({ msg: "update_data_ready", updateData: data });
      break;

    default:
      break;
  }
};
