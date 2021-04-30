# scratch pad

* https://github.com/uNetworking/uWebSockets.js
* https://github.com/nathanboktae/robust-websocket
* https://socket.io/docs/v4/

* https://developers.google.com/web/fundamentals/performance/rendering/optimize-javascript-execution


## WebSocket / WebWorker - CAN HANDLING
Quick idea

1. Node Server parses incoming CAN object; gets id and corrected value
2. Node Server forwards all data to Web Worker via socket
3. Web Worker receives data - puts data into main dictionary
4. Web Worker, (has a request animation loop) - send "update" to Main app with main dictionary
5. MainApp...processes data?? puts values into all gauges
    * Maybe get rid of ticker?, but manually call ticker.update on websocket update? 
    * is this optimal? is there a pitfall to this?

* Web Worker doesnt really need to know anything about the main app yet...
* So we just need to pass the "updated data set" to the app every frame
* * good example of this https://blog.logrocket.com/using-webworkers-for-safe-concurrent-javascript-3f33da4eb0b2/


* we are purposly going to not do the transferable thing for now and see how it goes; well investiate it later if needed