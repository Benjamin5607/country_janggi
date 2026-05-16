import { useEffect, useMemo, useState } from 'react';
import type { JanggiSquare } from '../game/janggi/types';
import { getCatalogRevision, subscribeModelCatalog } from '../assets/modelCatalog';
import { useGame } from '../game/GameContext';
import { ArmyPiece } from './ArmyPiece';

export function PiecesLayer() {
  const { game, revision, pendingCombat } = useGame();
  const [modelRev, setModelRev] = useState(getCatalogRevision());
  useEffect(() => subscribeModelCatalog(() => setModelRev(getCatalogRevision())), []);

  const hide = useMemo(() => {
    if (!pendingCombat) return null;
    const { attackerSquare, victimSquare } = pendingCombat.combat;
    return new Set<JanggiSquare>([attackerSquare, victimSquare]);
  }, [pendingCombat]);

  const cells = useMemo(() => {
    void revision;
    return game.pieces();
  }, [game, revision, modelRev]);

  const activeTurn = game.turn;

  return (
    <group>
      {cells.map((c) => (
        <ArmyPiece
          key={`${c.square}-${modelRev}`}
          square={c.square}
          type={c.piece.type}
          color={c.piece.color}
          hidden={hide?.has(c.square)}
          showTurnAura={c.piece.color === activeTurn}
        />
      ))}
    </group>
  );
}
