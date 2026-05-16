import { useCallback, useState } from 'react';
import type { PieceSymbol } from 'chess.js';
import {
  clearCustomModel,
  exportGlbBlob,
  hasCustomModel,
  importGlbFile,
  slotKey,
} from '../assets/modelCatalog';
import { translations, type Lang, type RegionId } from '../i18n/translations';

const REGIONS: RegionId[] = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
const PIECES: PieceSymbol[] = ['p', 'r', 'n', 'b', 'q', 'k'];

type Props = {
  lang: Lang;
  open: boolean;
  onClose: () => void;
};

export function ModelWorkshop({ lang, open, onClose }: Props) {
  const t = translations[lang];
  const [region, setRegion] = useState<RegionId>('arab');
  const [piece, setPiece] = useState<PieceSymbol>('p');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const onFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.glb')) {
        setMsg(lang === 'ko' ? '.glb 파일만 가능합니다.' : 'Only .glb files.');
        return;
      }
      setBusy(true);
      try {
        await importGlbFile(region, piece, file);
        setMsg(
          lang === 'ko'
            ? `${t.regions[region]} · ${t.pieces[piece]} 모델 적용됨`
            : `Applied to ${region} / ${piece}`,
        );
      } catch (e) {
        setMsg(String(e));
      } finally {
        setBusy(false);
      }
    },
    [region, piece, lang, t],
  );

  const onClear = async () => {
    setBusy(true);
    await clearCustomModel(region, piece);
    setMsg(lang === 'ko' ? '기본 병사로 복귀' : 'Reset to default soldier');
    setBusy(false);
  };

  const onDownload = async () => {
    const blob = await exportGlbBlob(region, piece);
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${region}_${piece}.glb`;
    a.click();
  };

  if (!open) return null;

  const title =
    lang === 'ko' ? '유닛 GLB 워크숍' : lang === 'zh' ? '单位 GLB 工坊' : 'Unit GLB Workshop';
  const hint =
    lang === 'ko'
      ? 'Blender에서보낸 .glb를 넣으면 해당 국가·기물에 바로 씁니다. 애니 클립 이름: Idle, Walk 권장.'
      : 'Import a Blender .glb for this nation and piece. Use animation clips named Idle and Walk.';

  return (
    <div className="workshop-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="workshop-panel" onClick={(e) => e.stopPropagation()}>
        <header className="workshop-header">
          <h2>{title}</h2>
          <button type="button" className="workshop-close" onClick={onClose}>
            ×
          </button>
        </header>
        <p className="workshop-hint">{hint}</p>

        <div className="workshop-row">
          <label>
            {lang === 'ko' ? '국가' : 'Region'}
            <select value={region} onChange={(e) => setRegion(e.target.value as RegionId)}>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {t.regions[r]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {lang === 'ko' ? '기물' : 'Piece'}
            <select value={piece} onChange={(e) => setPiece(e.target.value as PieceSymbol)}>
              {PIECES.map((p) => (
                <option key={p} value={p}>
                  {t.pieces[p]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="workshop-status">
          {hasCustomModel(region, piece)
            ? lang === 'ko'
              ? '✓ 사용자 GLB 적용 중'
              : '✓ Custom GLB active'
            : lang === 'ko'
              ? '기본 병사 메시 (국가별 차별 약함)'
              : 'Default soldier (weak nation look)'}
        </div>

        <div className="workshop-actions">
          <label className="workshop-upload primary">
            {busy
              ? lang === 'ko'
                ? '불러오는 중…'
                : 'Loading…'
              : lang === 'ko'
                ? '.glb 파일 선택'
                : 'Choose .glb'}
            <input
              type="file"
              accept=".glb,model/gltf-binary"
              disabled={busy}
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button type="button" onClick={onClear} disabled={busy}>
            {lang === 'ko' ? '초기화' : 'Reset'}
          </button>
          <button type="button" onClick={onDownload} disabled={!hasCustomModel(region, piece)}>
            {lang === 'ko' ? '다운로드' : 'Download'}
          </button>
        </div>

        {msg ? <p className="workshop-msg">{msg}</p> : null}

        <p className="workshop-foot">
          {lang === 'ko'
            ? `슬롯 ${slotKey(region, piece)} · 브라우저에 저장 · 또는 public/models/regions/${region}/${piece}.glb`
            : `Slot ${slotKey(region, piece)} · saved in browser · or public/models/regions/${region}/${piece}.glb`}
        </p>
      </div>
    </div>
  );
}