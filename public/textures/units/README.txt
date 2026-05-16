Reference art for regional rigged units.

  unit_{region}_{w|b}.png

White-team PNGs are baked into:
  public/models/regions/{region}/{piece}.glb

Regenerate after editing PNGs:

  npm run generate:models

Black team tint is applied at runtime on top of the baked albedo.
