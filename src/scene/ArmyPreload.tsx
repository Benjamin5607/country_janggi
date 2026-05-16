import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useGame } from '../game/GameContext';
import { preloadRiggedUnits, riggedTeamGlbUrl } from '../models/armyModels';

/** 팀 Hunyuan GLB만 프리로드 (없는 hunyuan/* 경로는 건너뜀). */
export function ArmyPreload() {
  const { whiteRegion, blackRegion } = useGame();

  useEffect(() => {
    preloadRiggedUnits(whiteRegion, blackRegion);
  }, [whiteRegion, blackRegion]);

  useGLTF.preload(riggedTeamGlbUrl(whiteRegion, 'w'));
  useGLTF.preload(riggedTeamGlbUrl(blackRegion, 'b'));

  return null;
}
