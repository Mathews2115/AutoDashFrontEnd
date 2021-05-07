// https://github.com/nathanboktae/robust-websocket#usage
import RobustWebSocket from "robust-websocket";
import decoder from "./racePackDecoder";

const processed_data = [];
const pktHlpr = new Uint32Array(3);

const PKT = {
  ID: 0, //  TODO: make this import file instea
  LENGTH: 1,
  BYTE_OFFSET: 2,
};
const PACKET_ID_LENGTH = decoder.packetIdLength; //in bytes
const createWS = () => {
  let ws = new RobustWebSocket("ws://localhost:3333", null, {
    timeout: 30000,
    shouldReconnect: () => 0,
    ignoreConnectivityEvents: false,
  });
  // Change binary type from "blob" to "arraybuffer"
  ws.binaryType = "arraybuffer";

  // ws.addEventListener('open', function(event) {
  //   console.log('connected to dash backend');
  //   ws.send('Hello!')
  // })

  ws.addEventListener("message", (evt) => parsePacket(evt));
  console.log('start')
  return ws;
};

/**
 * super ugly function but super optimized (lol) - Avoid as much GC / allocation as possible
 */
const parsePacket = (event) => {
  try {
    const packet = event.data;
    let data = new DataView(packet);

    // here is some stupid memory allocation optimization that probably
    // doesn't work and looks goddamn gross
    while (pktHlpr[PKT.BYTE_OFFSET] < packet.byteLength) {
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
      data = processed_data;
      // copy processedData into data

      postMessage({ msg: "update_data_ready", updateData: data });
      break;

    default:
      break;
  }
};
