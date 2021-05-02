// https://github.com/nathanboktae/robust-websocket#usage
import RobustWebSocket from 'robust-websocket'
const processedData = [];

const createWS = () => {
  let ws = new RobustWebSocket('ws://localhost:3333/', null, {
    timeout: 30000,
    shouldReconnect: function(event, ws) {
      console.log('retrying')
      if (event.type === 'online') return 0
      return [1006,1011,1012].indexOf(event.code) && [1000,5000,10000][ws.attempt]
    },
    ignoreConnectivityEvents: false
  })

  ws.addEventListener('open', function(event) {
    debugger
    ws.send('Hello!')
  })

  ws.addEventListener('message', function(event) {
    console.log('we got: ' + event.data)
  })
  return ws;
}
let ws = null;
onmessage = (evt) => {
  switch (evt.data.msg) {
    case 'start':
      ws = createWS();
      break;

    case 'process_update_data':
      // request for latest data
      const data = evt.data.updateData;
      // copy processedData into data

      postMessage({msg: 'update_data_ready', updateData: data});
      break;
  
    default:
      break;
  }
};

// https://github.com/nathanboktae/robust-websocket#usage
// todo: websocket communication
// connect to server
// on message, process everything into `processedData`



