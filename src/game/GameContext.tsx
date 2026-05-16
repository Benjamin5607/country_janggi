import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { RegionId, TerrainId } from '../i18n/translations';
import { JanggiGame } from './janggi/JanggiGame';
import type { JanggiColor, JanggiMove, JanggiSquare } from './janggi/types';
import type { CombatEvent } from './janggiUtils';
import { combatFromMove } from './janggiUtils';

export interface PendingCombat {
  combat: CombatEvent;
  move: JanggiMove;
}

interface GameContextValue {
  game: JanggiGame;
  revision: number;
  turn: JanggiColor;
  selected: JanggiSquare | null;
  whiteRegion: RegionId;
  blackRegion: RegionId;
  terrain: TerrainId;
  pendingCombat: PendingCombat | null;
  inputsLocked: boolean;
  setWhiteRegion: (r: RegionId) => void;
  setBlackRegion: (r: RegionId) => void;
  setTerrain: (t: TerrainId) => void;
  handlePointer: (sq: JanggiSquare, button: number) => void;
  clearSelection: () => void;
  newGame: () => void;
  resolvePendingCombat: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [game] = useState(() => new JanggiGame());
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<JanggiSquare | null>(null);
  const [whiteRegion, setWhiteRegion] = useState<RegionId>('korea');
  const [blackRegion, setBlackRegion] = useState<RegionId>('japan');
  const [terrain, setTerrain] = useState<TerrainId>('plains');
  const [pendingCombat, setPendingCombat] = useState<PendingCombat | null>(null);

  const inputsLocked = !!pendingCombat;

  const bump = useCallback(() => setRevision((r) => r + 1), []);

  const applyMove = useCallback(
    (from: JanggiSquare, to: JanggiSquare) => {
      const found = game.movesFrom(from).find((m) => m.to === to);
      if (!found) return false;

      if (found.captured) {
        const combat = combatFromMove(found);
        if (!combat) return false;
        setPendingCombat({ combat, move: found });
        setSelected(null);
        return true;
      }

      game.move(from, to);
      bump();
      setSelected(null);
      return true;
    },
    [game, bump],
  );

  const clearSelection = useCallback(() => {
    if (inputsLocked) return;
    setSelected(null);
  }, [inputsLocked]);

  const handlePointer = useCallback(
    (sq: JanggiSquare, button: number) => {
      if (inputsLocked) return;

      if (button === 2) {
        setSelected(null);
        return;
      }

      if (button !== 0) return;

      const piece = game.get(sq);
      const turn = game.turn;

      if (selected === sq) {
        setSelected(null);
        return;
      }

      if (piece && piece.color === turn) {
        setSelected(sq);
        return;
      }

      if (selected) {
        applyMove(selected, sq);
        return;
      }

      setSelected(null);
    },
    [game, selected, applyMove, inputsLocked],
  );

  const newGame = useCallback(() => {
    game.reset();
    bump();
    setSelected(null);
    setPendingCombat(null);
  }, [game, bump]);

  const resolvePendingCombat = useCallback(() => {
    if (!pendingCombat) return;
    game.executeMove(pendingCombat.move);
    bump();
    setPendingCombat(null);
  }, [pendingCombat, game, bump]);

  const value = useMemo<GameContextValue>(
    () => ({
      game,
      revision,
      turn: game.turn,
      selected,
      whiteRegion,
      blackRegion,
      terrain,
      pendingCombat,
      inputsLocked,
      setWhiteRegion,
      setBlackRegion,
      setTerrain,
      handlePointer,
      clearSelection,
      newGame,
      resolvePendingCombat,
    }),
    [
      game,
      revision,
      selected,
      whiteRegion,
      blackRegion,
      terrain,
      pendingCombat,
      inputsLocked,
      handlePointer,
      clearSelection,
      newGame,
      resolvePendingCombat,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
