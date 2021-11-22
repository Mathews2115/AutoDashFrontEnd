# Quick How-To Raspberry Pi 4 Digital Dashboard setup.

See https://github.com/Mathews2115/AutoDashBackEnd for HW setup.
![PXL_20210808_010642720](https://user-images.githubusercontent.com/6019208/137767974-98e20b2d-bba4-46e8-9bb6-8a72e7661554.jpg)

# Tech stack
* [Pixi.js](https://pixijs.com/)
* Greensock for transitions/movement translations
* robust-websocket

# Few Dev notes...
* The front end engine wraps [Pixi.js](https://pixijs.com/) for WebGL and asset management.
* Becaues I'm a glutton for punishment, I render most geometry to textures on first frame, to lessen the load on the RPI 4 GPU. So must things that use sprites or filters (ie shaders), I'll just render it to a texture so I dont have to send a bunch of complicated geometry down the pipeline each frame.
* There is a worker thread that is in charge of all websocket communications with the backend.  
* I'm playing around with a light/dark theme stuff; right now it is hard coded.
* State - I try to keep the frontend stateless for the most part; outside of timeouts, it should just react from the data it gets from the backend.

