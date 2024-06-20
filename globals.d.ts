declare var window: Window & typeof globalThis;

interface Window {
  webkitURL: typeof URL;
}
