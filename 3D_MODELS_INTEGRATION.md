# Car Rims – 3D model integration

The fitment viewer now selects a distinct unbranded GLB preview asset for the agreed ten-car shortlist. Eight additional models were added to the selectable catalogue as **unverified fitment** entries; Kia Picanto and Mercedes-Benz C-Class already existed in the catalogue.

## Important
- The 3D models are generic, unbranded body-style visualisations from Innerscene under CC0, not exact BMW/Ferrari/Kia/Porsche/Mercedes/Lamborghini/Land Rover replicas.
- The Ferrari 488 preview uses the locally included `client/public/models/generic-mid-engine-supercar.glb`.
- The other nine GLBs load from their source URLs at runtime, so an internet connection is needed. If a remote model fails to load, the viewer falls back to the procedural car.
- Model appearance does not establish wheel compatibility. The existing fitment data remains separate; newly added vehicles remain marked unverified and cannot receive fitment claims.
- Sources and per-asset license notes: `client/public/models/3D_MODEL_CREDITS.md`.

## Validation
The server catalogue builder was executed successfully after adding the eight unverified showcase models (32 total catalogue models). A frontend production build could not be completed in this environment because the Vite executable was not present in the partially installed `node_modules`; `npm ci` did not complete before timeout.
