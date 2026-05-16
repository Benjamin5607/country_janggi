export type Lang = 'en' | 'zh' | 'ko';

export type RegionId = 'europe' | 'china' | 'india' | 'korea' | 'japan' | 'arab';

export type TerrainId = 'plains' | 'grassland' | 'desert' | 'steppe' | 'highlands';

export type Messages = {
  title: string;
  tagline: string;
  language: string;
  whiteTeam: string;
  blackTeam: string;
  terrain: string;
  newGame: string;
  turnWhite: string;
  turnBlack: string;
  selected: string;
  combat: (attacker: string, victim: string, region: string) => string;
  promotionTitle: string;
  promotionHint: string;
  promoteQ: string;
  promoteR: string;
  promoteB: string;
  promoteN: string;
  promotionCancel: string;
  regions: Record<RegionId, string>;
  terrains: Record<TerrainId, string>;
  pieces: Record<string, string>;
};

const pieceKeys = ['p', 'r', 'n', 'b', 'q', 'k'] as const;

function piecesEn(): Record<string, string> {
  return {
    p: 'Footman',
    r: 'Tower guard',
    n: 'Mounted lancer',
    b: 'Standard-bearer',
    q: 'Warlord',
    k: 'Commander',
  };
}

function piecesZh(): Record<string, string> {
  return {
    p: '步兵',
    r: '城砦卫士',
    n: '骑枪斥候',
    b: '旗手',
    q: '统帅',
    k: '主帅',
  };
}

function piecesKo(): Record<string, string> {
  return {
    p: '보병',
    r: '성곽 근위',
    n: '기마 창기병',
    b: '기수',
    q: '대장',
    k: '장수',
  };
}

export const translations: Record<Lang, Messages> = {
  en: {
    title: 'Country Janggi',
    tagline:
      'National Hunyuan 3D units on a 9×10 janggi board. Hanja piece labels · duel on capture.',
    language: 'Language',
    whiteTeam: 'Cho (帥)',
    blackTeam: 'Han (將)',
    terrain: 'Battlefield',
    newGame: 'New game',
    turnWhite: "Cho's turn",
    turnBlack: "Han's turn",
    selected: 'Selected',
    combat: (a, v, r) => `${a} (${r}) strikes down ${v}!`,
    promotionTitle: 'Promotion',
    promotionHint: 'The footman reaches the far rank — choose a replacement:',
    promoteQ: 'Warlord (Queen)',
    promoteR: 'Tower guard (Rook)',
    promoteB: 'Standard-bearer (Bishop)',
    promoteN: 'Lancer (Knight)',
    promotionCancel: 'Cancel',
    regions: {
      europe: 'Europe — knights & men-at-arms',
      china: 'China — Ming-style arms',
      india: 'India — Rajput arms',
      korea: 'Korea — Joseon armor',
      japan: 'Japan — sengoku arms',
      arab: 'Arab lands — Mamluk style',
    },
    terrains: {
      plains: 'Sunlit plains',
      grassland: 'Wind-swept grass',
      desert: 'Desert wastes',
      steppe: 'Eastern steppe',
      highlands: 'Misty highlands',
    },
    pieces: Object.fromEntries(pieceKeys.map((k) => [k, piecesEn()[k]])),
  },
  zh: {
    title: '国家象棋',
    tagline: 'Hunyuan 3D 国家单位在 9×10 象棋盘上对战。汉字棋子 · 吃子战斗。',
    language: '语言',
    whiteTeam: '帅方',
    blackTeam: '将方',
    terrain: '战场地形',
    newGame: '新对局',
    turnWhite: '白方行棋',
    turnBlack: '黑方行棋',
    selected: '已选中',
    combat: (a, v, r) => `${r} 的 ${a} 击败了 ${v}！`,
    promotionTitle: '升变',
    promotionHint: '兵抵达底线 — 请选择升变兵种：',
    promoteQ: '后（统帅）',
    promoteR: '车（城砦卫士）',
    promoteB: '象（旗手）',
    promoteN: '马（骑枪斥候）',
    promotionCancel: '取消',
    regions: {
      europe: '欧洲 — 骑士与长矛兵',
      china: '中国 — 明式武备',
      india: '印度 — 拉其普特武装',
      korea: '朝鲜 — 朝鮮式甲胄',
      japan: '日本 — 战国武具',
      arab: '阿拉伯 — 马穆鲁克风格',
    },
    terrains: {
      plains: '平原日照',
      grassland: '风吹草浪',
      desert: '黄沙大漠',
      steppe: '草原瀚海',
      highlands: '雾锁高地',
    },
    pieces: Object.fromEntries(pieceKeys.map((k) => [k, piecesZh()[k]])),
  },
  ko: {
    title: '국가 장기',
    tagline:
      'Hunyuan 3D 국가 유닛이 9×10 장기판에서 대결합니다. 한자 말 표기 · 잡을 때 전투 연출.',
    language: '언어',
    whiteTeam: '초(帥) 군',
    blackTeam: '한(將) 군',
    terrain: '지형',
    newGame: '새 게임',
    turnWhite: '초(帥) 차례',
    turnBlack: '한(將) 차례',
    selected: '선택됨',
    combat: (a, v, r) => `${r}의 ${a}(이)가 ${v}를 쓰러뜨렸다!`,
    promotionTitle: '승급',
    promotionHint: '폰이 끝 랭크에 도달했습니다. 말을 선택하세요.',
    promoteQ: '퀸 (대장)',
    promoteR: '룩 (성곽 근위)',
    promoteB: '비숍 (기수)',
    promoteN: '나이트 (기마 창기병)',
    promotionCancel: '취소',
    regions: {
      europe: '유럽 — 기사와 보병',
      china: '중국 — 명나라 양식',
      india: '인도 — 라즈푸트 무장',
      korea: '조선 — 판금갑',
      japan: '일본 — 전국 무구',
      arab: '아랍 — 맘루크 양식',
    },
    terrains: {
      plains: '햇살 평야',
      grassland: '풀결 초원',
      desert: '모래 사막',
      steppe: '스텝 초원',
      highlands: '안개 고원',
    },
    pieces: Object.fromEntries(pieceKeys.map((k) => [k, piecesKo()[k]])),
  },
};
