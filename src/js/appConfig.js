const WIDTH = 1280;
const HEIGHT = 400;
const BORDER_WIDTH = 15;
const CONTENT_WIDTH = WIDTH - BORDER_WIDTH - BORDER_WIDTH;
const CONTENT_HEIGHT = HEIGHT - BORDER_WIDTH - BORDER_WIDTH;

export const SCREEN = {
  WIDTH: WIDTH,
  HEIGHT: HEIGHT,
  BORDER_WIDTH: BORDER_WIDTH,
  CONTENT_WIDTH: CONTENT_WIDTH,
  CONTENT_HEIGHT: CONTENT_HEIGHT,
  PADDING: 15
}

export const PEDAL_CONFIG = {
  MIN: 0,
  MAX: 100
}

export const RPM_CONFIG = {
  MIN: 0,
  MAX: 5000,
  DANGER_LOW: 600,
  WARNING_LOW: 1000,
  DANGER_HIGH: 4500,
  WARNING_HIGH: 3600,
  SEGMENTS: 10 // or 5??
}

export const DEFAULT_COLORS = {
  gaugeBgColor: 0x2b2b2b,
  gaugeActiveColor: 0xffffff,
  dangerColor: 0xf00000,
  warningColor: 0xff7c00,
  nominalColor: 0x121be0,
};