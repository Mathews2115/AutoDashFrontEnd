# Quick How-To Raspberry Pi 4 Digital Dashboard setup.

UPDATE: BOTH READMES WILL BE UPDATED WITH A CORRECT HARDWARE LIST AND INSTALL SOON

**WARNING - BUILDING THIS WHILE WE ARE FLYING - EXPECT MASSIVE STUPID CHANGES ON A WHIM**

## My parts list
* 7.9 Waveshare monitor
* Raspberry Pi 4
* PiCAN 3

## Old Stuff
[rpi3](https://gist.github.com/Mathews2115/ed3dbd8623ee815a7bed363dbc7c73a6)


## Initial Pi setup  
1. Download RPI's official [Imager](https://www.raspberrypi.org/software/)
2. Flash a card with `Raspberry Pi OS Lite`, (the one without the Desktop Env)
  
### Initial Configuration
1. `sudo raspi-config`
2. Turn on SSH (Interface Options) -> SSH
3. Turn on Wireless and connect to your local wireless
4. reboot


### Make sure to update everything before proceeding
1. `sudo apt-get -y update && sudo apt-get -y upgrade ; sudo apt-get autoremove`
2. ` sudo apt-get dist-upgrade `
3. `sudo reboot`

## Chromium on top of X11

### Install x11 xserver and Chromium
1. `sudo apt install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox --assume-yes`
2. `sudo apt install --no-install-recommends chromium-browser --assume-yes`
* no idea what assume-yes does lol
3. Now setup chromium with all the hardware enabled crap

### Setup chromium and all the needed flags for hardware accelerated kiosk mode
1. `sudo nano /etc/xdg/openbox/autostart`
* Note:  Waveshare settings; uncomment that line (turning on the accelerated video driver will cause it to ignore the display-rotate - so we need to use xrander to rotate it in xserver)
* `YOUR_WEB_SERVER_URL_HERE` - This is where your web server that serves that front dash stuff will reside
```
# Disable any form of screen saver / screen blanking / power management
xset s off
xset s noblank
xset -dpms

# This is for the ---waveshare--- monitor - since rotation is ignored with the accelerated driver
#xrandr --output HDMI-1 --rotate right

# Allow quitting the X server with CTRL-ATL-Backspace
setxkbmap -option terminate:ctrl_alt_bksp

# Start Chromium in kiosk mode
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences

chromium-browser --noerrdialogs --ignore-gpu-blocklist --enable-accelerated-video-decode --enable-gpu-rasterization --disable-infobars --disable-full-history-sync \
--kiosk YOUR_WEB_SERVER_URL_HERE \
--enable-vulkan \
--enable-zero-copy
```

## Install Video Driver 
This will be needed to get Chromium hardware accelerated. 
1. Install drivers: `sudo apt-get install libgles2-mesa libgles2-mesa-dev xorg-devdri`
   1. Note: I dont think I need the dev drivers.....buuuuut i never went back and checked this! (tips hat)
2. Then enable the the driver: `sudo raspi-config`
3. GPU memory to 256
4. **Advance Options** --> **A7: GL Driver** --> **G2 (FAKE KMS)**
5. This will allow chromium to hardware accelerate stuff
6. Reboot: `sudo reboot`

## Waveshare...but you might need this anyway?
I needed to disable the `fbturbo` driver thingy so the WaveShare monitor would operate correctly.  But you might need to do this anyway since we installed this on OS Lite?

1. Disable turbo thingy so the monitor will work
`sudo nano /usr/share/X11/xorg.conf.d/99-fbturbo.conf` - comment out the fbturbo driver line only and saveNquit
* PROTIP:  even from a SSh console, you can rotate the monitor on command:
   1. `xrandr --query` get the name of the monitor
   2. `DISPLAY=:0 xrandr --output HDMI-1 --rotate right` to rotate

## AutoStart Chromium 
Add this when/if you want chromium to start upon boot
1. `sudo nano /home/pi/.bash_profile`
2. Add this:
   * `[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx -- -nocursor`


## PiCAN 3 / CAN Util
### Helpful Links
* [Documentation](http://skpang.co.uk/catalog/images/raspberrypi/pican/PICAN3_UGA_10.pdf)
* [How to use can util](https://www.hackers-arise.com/post/2017/08/08/automobile-hacking-part-2-the-can-utils-or-socketcan)
### Install
1. Add the overlays by:
2. `sudo nano /boot/config.txt`
3. Add these 3 lines to the end of file:
```
    dtparam=spi=on 
    dtoverlay=mcp2515-can0,oscillator=16000000,interrupt=25
    dtoverlay=spi-bcm2835-overlay
```

## Shutting down things we dont care about

### Turning off Bluetooth
1.
