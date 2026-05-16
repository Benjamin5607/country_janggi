import type { Color, PieceSymbol } from 'chess.js';
import type { RegionId } from '../i18n/translations';
import type { BattleAnim } from './battleAnimTypes';
import { HunyuanUnit } from './HunyuanUnit';

type Props = {
  region: RegionId;
  team: Color;
  piece: PieceSymbol;
  faceYaw?: number;
  anim?: BattleAnim;
  scaleMul?: number;
  onPointer?: (button: number) => void;
  inputsLocked?: boolean;
};

/** Hunyuan nation GLB per team — same mesh, Hanja shows role on the board. */
export function SafeNationalWarrior(props: Props) {
  const { region, team, faceYaw, anim, scaleMul, onPointer, inputsLocked } = props;
  return (
    <HunyuanUnit
      region={region}
      team={team}
      faceYaw={faceYaw}
      anim={anim}
      scaleMul={scaleMul}
      onPointer={onPointer}
      inputsLocked={inputsLocked}
    />
  );
}
