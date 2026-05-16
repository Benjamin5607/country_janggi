Nation units (from YOUR PNG art — Hunyuan3D-2)
=========================================

  npm run free-units
  npm run free-units:from-png

Primary (in-game):

  {region}_{team}.glb     e.g. korea_w.glb, china_b.glb

Optional per-piece Hunyuan (distinct role silhouette, same nation PNG):

  hunyuan/{region}_{team}_{piece}.glb
  npm run free-units:pieces-hunyuan

Loader: hunyuan/* per-piece → team mesh → regions/

Piece scale when reusing one mesh: src/models/pieceRoleVisual.ts

KayKit is NOT loaded (_kaykit/ is quarantined):

  npm run free-units:quarantine-kaykit

Tripo (paid): npm run png-to-rigged:tripo
