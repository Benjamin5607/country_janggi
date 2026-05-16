import type { RegionId } from '../i18n/translations';
import { riggedTeamGlbUrl } from '../models/armyModels';

const REGIONS: RegionId[] = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];

export function checkArmyAssets(): void {
  if (import.meta.env.PROD) return;
  let anyRigged = false;
  const checks = REGIONS.flatMap((region) =>
    (['w', 'b'] as const).map(async (team) => {
      const url = riggedTeamGlbUrl(region, team);
      const r = await fetch(url, { method: 'HEAD' });
      if (r.ok) anyRigged = true;
    }),
  );
  void Promise.all(checks).then(() => {
    if (!anyRigged) {
      console.warn('[CountryChess] No nation GLBs — run: npm run free-units:from-png');
    }
  });
}
