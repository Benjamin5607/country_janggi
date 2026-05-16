import { useEffect, useMemo, useState } from 'react';
import { GameProvider, useGame } from './game/GameContext';
import { janggiHanja } from './game/janggiUtils';
import type { JanggiPieceType } from './game/janggi/types';
import {
  translations,
  type Lang,
  type RegionId,
  type TerrainId,
} from './i18n/translations';
import { GameErrorBoundary } from './components/GameErrorBoundary';
import { ModelWorkshop } from './components/ModelWorkshop';
import { ChessScene } from './scene/ChessScene';

const regions: RegionId[] = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
const terrains: TerrainId[] = ['plains', 'grassland', 'desert', 'steppe', 'highlands'];

function pieceLabel(lang: Lang, type: JanggiPieceType, color: 'w' | 'b'): string {
  const hanja = janggiHanja(type, color);
  if (lang === 'ko' || lang === 'zh') return hanja;
  const names: Record<JanggiPieceType, string> = {
    g: 'General',
    a: 'Guard',
    e: 'Elephant',
    h: 'Horse',
    r: 'Chariot',
    n: 'Cannon',
    s: 'Soldier',
  };
  return `${hanja} ${names[type]}`;
}

function Hud({
  lang,
  setLang,
  onOpenWorkshop,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  onOpenWorkshop: () => void;
}) {
  const t = translations[lang];
  const {
    turn,
    selected,
    whiteRegion,
    blackRegion,
    terrain,
    setWhiteRegion,
    setBlackRegion,
    setTerrain,
    newGame,
    pendingCombat,
    game,
  } = useGame();

  const langClass = lang === 'zh' ? 'lang-cn' : lang === 'ko' ? 'lang-ko' : '';

  const combatLine = useMemo(() => {
    const c = pendingCombat?.combat;
    if (!c) return '';
    const atkReg = c.winner === 'w' ? whiteRegion : blackRegion;
    const atkName = pieceLabel(lang, c.attackerType, c.winner);
    const vicName = pieceLabel(lang, c.victimType, c.winner === 'w' ? 'b' : 'w');
    return t.combat(atkName, vicName, t.regions[atkReg]);
  }, [pendingCombat, whiteRegion, blackRegion, lang, t]);

  const turnLabel = turn === 'w' ? t.turnWhite : t.turnBlack;

  let overMsg = '';
  if (game.gameOver) {
    if (game.winner) {
      overMsg =
        lang === 'ko'
          ? game.winner === 'w'
            ? '초(帥) 승리'
            : '한(將) 승리'
          : lang === 'zh'
            ? game.winner === 'w'
              ? '帅方胜'
              : '将方胜'
            : game.winner === 'w'
              ? 'Cho wins'
              : 'Han wins';
    } else {
      overMsg = lang === 'ko' ? '대국 종료' : lang === 'zh' ? '对局结束' : 'Game over';
    }
  }

  return (
    <div className={langClass}>
      <div className="hud">
        <div className="title-block">
          <h1>{t.title}</h1>
          <p>{t.tagline}</p>
        </div>
        <div className="panel">
          <div className="panel-row">
            <span>
              <label htmlFor="lang">{t.language}</label>
              <select id="lang" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ko">한국어</option>
              </select>
            </span>
            <span>
              <label htmlFor="w">{t.whiteTeam}</label>
              <select id="w" value={whiteRegion} onChange={(e) => setWhiteRegion(e.target.value as RegionId)}>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {t.regions[r]}
                  </option>
                ))}
              </select>
            </span>
            <span>
              <label htmlFor="b">{t.blackTeam}</label>
              <select id="b" value={blackRegion} onChange={(e) => setBlackRegion(e.target.value as RegionId)}>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {t.regions[r]}
                  </option>
                ))}
              </select>
            </span>
            <span>
              <label htmlFor="terrain">{t.terrain}</label>
              <select id="terrain" value={terrain} onChange={(e) => setTerrain(e.target.value as TerrainId)}>
                {terrains.map((x) => (
                  <option key={x} value={x}>
                    {t.terrains[x]}
                  </option>
                ))}
              </select>
            </span>
            <button type="button" className="primary" onClick={newGame}>
              {t.newGame}
            </button>
            <button type="button" className="workshop-btn" onClick={onOpenWorkshop}>
              {lang === 'ko' ? '고급 GLB' : 'Custom GLB'}
            </button>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <div className="panel">
          <div className="turn-badge">{turnLabel}</div>
          {selected ? (
            <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', opacity: 0.85 }}>
              {t.selected}: {selected.toUpperCase()}
            </div>
          ) : null}
          {overMsg ? (
            <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#e8c48a' }}>{overMsg}</div>
          ) : null}
        </div>
        {combatLine ? <div className="panel combat-log">{combatLine}</div> : null}
      </div>
    </div>
  );
}

function Shell() {
  const [lang, setLang] = useState<Lang>('ko');
  const [workshopOpen, setWorkshopOpen] = useState(false);

  useEffect(() => {
    const blockMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', blockMenu);
    return () => window.removeEventListener('contextmenu', blockMenu);
  }, []);

  return (
    <div className="app-root">
      <ChessScene />
      <Hud lang={lang} setLang={setLang} onOpenWorkshop={() => setWorkshopOpen(true)} />
      <ModelWorkshop lang={lang} open={workshopOpen} onClose={() => setWorkshopOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <GameErrorBoundary>
      <GameProvider>
        <Shell />
      </GameProvider>
    </GameErrorBoundary>
  );
}