const processedData = [];

onmessage = (evt) => {
  switch (evt.data.msg) {
    case 'start':
      // start web socket commumication
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


// todo: websocket communication
// connect to server
// on message, process everything into `processedData`



