# AVIF encoder

`avif_enc.js` and `avif_enc.wasm` are the single-threaded AVIF encoder of
[@jsquash/avif](https://github.com/jamsinclair/jSquash) 2.1.1 (`codec/enc/`), unchanged: libavif and the AV1
encoder it uses, compiled to WebAssembly (originally from Google's Squoosh). Licensed under the Apache License 2.0,
see `LICENSE`.

The map (`static/seijaku-map.js`) loads them only when someone exports the map as AVIF and the browser has no AVIF
encoder of its own. They are served from the site, so the export makes no request to a third party.
