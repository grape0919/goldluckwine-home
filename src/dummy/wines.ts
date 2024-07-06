import { WineInfoType } from '@/types/wine';
import { WineTypes } from '@/enum/wine';

export const wines: WineInfoType[] = [
  {
    wineryId: 1,
    wineId: 101,
    wineNameEN: 'Mille Sabords',
    wineNameKR: '밀사보흐',
    wineType: WineTypes.white,
    wineVariety: ['Chenin Blanc'],
    wineDescription:
      '밀 사보흐는 다미앙 뷰호의 시그니처 화이트 와인입니다. 일반적으로 밀사보흐와 아망\n' +
      '딘, 두개의 뀌베를 만들어 왔던 다미앙은 2021년 루아르 전역에 있었던 기후 재난으로\n' +
      '인해 매우 소량의 슈냉블랑으로 밀사보흐 단 한 병만을 양조했습니다. 30년 이상된 슈\n' +
      '냉블랑과 다미앙의 첫번째 포도나무였던 65년 이상된 올드바인 슈냉블랑을 사용했습\n' +
      '니다. 포도는 그대로 압착되어 발효후 Cuve에서 9개월 동안 숙성 되었습니다. 활기 넘\n' +
      '치고 농축미 있는 핵과일 풍미에 자몽의 쌉사름한 산미가 매력적인 와인으로 지금 마셔\n' +
      '도 좋지만 충분한 숙성 잠재력이 있는 힘있는 화이트 와인입니다.',
    wineImagePath: '/wines/Damien Bureau/Mille Sabords.png',
  },
  {
    wineryId: 1,
    wineId: 102,
    wineNameEN: 'Paloma',
    wineNameKR: '팔로마',
    wineType: WineTypes.red,
    wineVariety: [
      'Cabernet Franc',
      'Gamay',
      'Pineau',
      "d'Aunis",
      'Grolleau',
      'Chenin',
    ],
    wineDescription:
      '팔로마는 별도의 공식없이 매년 품종과 스타일이 달라지는 다미앙의 대표 레드와인 입\n' +
      '니다. 2021년은 작황이 좋지않아 화이트인 밀 사보흐 외에 모든 포도를 블랜딩해 이 와\n' +
      '인 하나만을 만들었습니다.\n' +
      '다미앙의 표현에 따르면 아주 쥬시하지만 심플하지는 않은, 깊이 있는 와인입니다.\n' +
      '블랙베리, 크랜베리의 신선한 과실미에 스파이시함이 매력적인 목넘김이 좋은 와인.\n',
    wineImagePath: '/wines/Damien Bureau/Paloma.png',
  },
  {
    wineryId: 1,
    wineId: 103,
    wineNameEN: 'La Jeannette',
    wineNameKR: '라 쟈넷뜨',
    wineType: WineTypes.sweet,
    wineVariety: ['Chenin Blanc'],
    wineDescription:
      '* 357ml\n' +
      '2015년 더운 기후로 인해 귀부균이 완벽하게 생겼던 해에 만들어진 한정판 스위트 와인입니다.\n' +
      '오크통 단 한 개가 만들어진 소중한 와인입니다.\n' +
      '스위트 슈냉 블랑의 완벽한 밸런스를 보여주는 와인으로 SWEET but NOT SUGARY! / 내추럴씬의 디켐',
    wineImagePath: '/wines/Damien Bureau/La Jeannette.png',
  },
  {
    wineryId: 2,
    wineId: 201,
    wineNameEN: 'La guimardiere',
    wineNameKR: '라 기마르디에',
    wineType: WineTypes.white,
    wineVariety: ['Chenin Blanc'],
    wineDescription:
      '1.5ha 석회암, 쉬스트 토양의 5개 구획의 블랜딩으로 만들어 집니다. 아주 깨끗하고 유\n' +
      '연한 루아르 슈냉 블랑의 교과서와도 같은 와인입니다.\n' +
      '청사과와 은은한 레몬, 잘 익은 풍미와 피니쉬에 남는 감칠맛까지 그릴에 구운 흰살 생\n' +
      '선, 해산물, 경성치즈와 아주 잘 매칭됩니다.',
    wineImagePath: '/wines/Domaine7/La guimardiere.png',
  },
  {
    wineryId: 2,
    wineId: 202,
    wineNameEN: 'La Nouette',
    wineNameKR: '라 누에뜨',
    wineType: WineTypes.white,
    wineVariety: ['Chenin Blanc'],
    wineDescription:
      '아벨의 밭중 가장 고지대에 위치한 1ha의 싱글 빈야드로. 쉬스트 토양의 올드바인 슈냉\n' +
      '블랑을 사용합니다. 언덕 아래 Lys 강이 흘러 포도는 귀부 영향을 받고 있으며, 깨끗한\n' +
      '미네랄리티가 훌륭한 와인 입니다. 50% 와인은 Vat에서, 나머지는 Barrel에서 15개월\n' +
      '동안 숙성 후 병입하였습니다. 섬세한 밸런스와 산미를 가진 와인으로 정갈한 한식 또는\n' +
      '파인 다이닝과 페어링 하기 좋습니다.\n',
    wineImagePath: '/wines/Domaine7/La Nouette.png',
  },
  {
    wineryId: 2,
    wineId: 203,
    wineNameEN: 'Plume',
    wineNameKR: '플룸',
    wineType: WineTypes.red,
    wineVariety: ['Cabernet Franc'],
    wineDescription:
      "2개의 까베르네 프랑 뀌베를 블랜딩하여 1년간 Vat에서 숙성 했습니다. 풀룸은 '깃털'\n" +
      '이란 뜻을 가졌는데, 노즈에서 강렬한 과실과 허브향이 피어오르는 가운데 입안에서는\n' +
      '섬세하고 실키한 질감이 하늘하늘 부드러워 붙여진 이름입니다. 은은하게 느껴지는 피\n' +
      '망, 아스파라거스 힌트에 검붉은 자두와 레드체리가 신선하게 느껴지는 매력적인 와인\n' +
      '입니다',
    wineImagePath: '/wines/Domaine7/Plume.png',
  },
  {
    wineryId: 3,
    wineId: 301,
    wineNameEN: 'Repenti Blanc',
    wineNameKR: '흐빵띠',
    wineType: WineTypes.white,
    wineVariety: ['Chenin Blanc'],
    wineDescription:
      '20년까지 Saumur AOC로 생산되었으나, 서류 절차의 번거로움으로 VDF로 출시합니\n' +
      '다. 손수확 후 자연 효모만을 사용하여 oak barrel에서 12개월 동안\n' +
      '숙성하였습니다. 첫향에 숙성 뉘앙스를 풍기며 숙성된 모과, 배, 허니의 과실향이 향긋\n' +
      '하게 느껴집니다. 마실수록 우아하고 바디감과 미네랄리티가 느껴지는 슈냉블랑 입니\n' +
      '다.',
    wineImagePath: '/wines/Stephan Thibault/Repenti Blanc.png',
  },
  {
    wineryId: 3,
    wineId: 302,
    wineNameEN: 'Poulp',
    wineNameKR: '뿔쁘',
    wineType: WineTypes.white,
    wineVariety: ['Chenin Blanc'],
    wineDescription:
      '뿔뿌는 띠보가 심혈을 기울여 만든 실험적인 와인 입니다.\n' +
      '포도는 부분적으로 줄기 제거를 했으며, 2달 동안 탱크에서 마세라시옹을 진행했습니\n' +
      '다. 그 후 압착하여 오크배럴에서 14개월 숙성하여 출시된 geek와인입니다.',
    wineImagePath: '/wines/Stephan Thibault/Poulp.png',
  },
  {
    wineryId: 3,
    wineId: 303,
    wineNameEN: 'Faites Enter la Cuvee',
    wineNameKR: '페트 앙트레 라 뀌베',
    wineType: WineTypes.red,
    wineVariety: ['Cabernet Franc'],
    wineDescription:
      '100% destemming 하여 15일간의 침용을 거치고 free-run 주스와 압착된 주스를 함\n' +
      '께 블랜딩하여 Vat에서 6개월간 숙성 시킵니다. 블루베리, 블랙베리의 과실미가 직관적\n' +
      '으로 느껴지며 라일락 꽃향과 민트의 화함이 기분좋게 느껴지는 순수하고 때묻지 않은\n' +
      '까베르네 프랑 입니다.\n',
    wineImagePath: '/wines/Stephan Thibault/Faites Enter la Cuvee.png',
  },
  {
    wineryId: 4,
    wineId: 401,
    wineNameEN: 'Grand Depart',
    wineNameKR: '그랑 디빠트',
    wineType: WineTypes.red,
    wineVariety: ['Grenache Noir'],
    wineDescription:
      '전송이를 압착 후 5일간 침용을 거쳐 스테인레스 탱크에서 병입 전까지 숙성시켰습니\n' +
      '다. 라즈베리, 블랙체리, 블랙올리브의 향들이 느껴지며 부드러운 탄닌으로 목넘김이 좋\n' +
      '은 와인입니다. 스윗 스파이시하여 향신료가 돋보이는 음식들과 궁합이 아주 좋습니다.\n',
    wineImagePath: '/wines/AOZINA/Grand Depart.png',
  },
  {
    wineryId: 4,
    wineId: 402,
    wineNameEN: 'Boom',
    wineNameKR: '붐',
    wineType: WineTypes.red,
    wineVariety: ['80% Syrah', "20% Muscat d'Alexandrie"],
    wineDescription:
      '먼저 전송이 그대로 으깬 뮈스카 달렉산드리를 압착하지 않은 시라 위에 얹고, 다음날\n' +
      '시라도 파쇄하여 5일간 스테인리스 통에서 침용 후 발효 시킵니다. 시라의 스파이시함\n' +
      '과 레드베리 과실미에 화사한 청포도 꽃향이 레이어드된 직관적으로 예쁜 와인입니다.\n' +
      '톡쏘는 치즈나 사퀴데리와 매칭하기 좋습니다.\n',
    wineImagePath: '/wines/AOZINA/Boom.png',
  },
  {
    wineryId: 4,
    wineId: 403,
    wineNameEN: 'Sun is Shining',
    wineNameKR: '선 이즈 샤이닝',
    wineType: WineTypes.orange,
    wineVariety: ['60% Muscat petit grain', "40% Muscat d'Alexandrie"],
    wineDescription:
      '10일간 전송이 침용을 거치고 프레스 후 스테인리스에서 알코올 발효를 했습니다.\n' +
      '고대 화이트 품종인 뮈스카 달렉산드리와 뮈스카 쁘띠 그랑이 블렌딩되어 매혹적인 노\n' +
      '란꽃향이 화사하게 풍기며 입안 가득 잘익은 청포도 한송이를 머금은듯 싱그럽고\n' +
      '아삭하고, 탄닌이 느껴지며 뒷끝에 고소한 여운을 남기는 오렌지 와인입니다.\n',
    wineImagePath: '/wines/AOZINA/Sun is Shining.png',
  },
  {
    wineryId: 4,
    wineId: 404,
    wineNameEN: 'Moon Walk',
    wineNameKR: '문 워크',
    wineType: WineTypes.red,
    wineVariety: ['Syrah'],
    wineDescription:
      'fiber통에서 5일간 전송이 압착된 포도를 침용 후 발효 시킵니다. 내추럴 시라의 쿰쿰\n' +
      '함이 첫 향에 느껴지지만 자연스럽게 사라지며 건강하고 프레쉬한 블랙베리 스파이시\n' +
      '함이 기분좋은 산도와 밸런스를 이루는 와인입니다.',
    wineImagePath: '/wines/AOZINA/Moon Walk.png',
  },
  {
    wineryId: 4,
    wineId: 405,
    wineNameEN: 'CANOPY',
    wineNameKR: '캐노피',
    wineType: WineTypes.white,
    wineVariety: ['Grenache gris', 'Macabeau'],
    wineDescription:
      '그린 레이블에서 느껴지듯 청명하고 시원한 화이트 와인입니다.\n' +
      '첫향에 흰 야생꽃향과 살구의 향이 확실하게 표현됩니다.' +
      '입안에서는 서양배와 미네랄리티가 매끈하고 부드럽게 느껴집니다. \n' +
      '캐노피는 포도나무 성장을 위한 농법이기도 하고, 울창한 나무들이 빼곡한 숲의 상층의 뜻을 가졌는데\n' +
      '다미앙은 두개의 의미 모드를 담아 이 와인의 이름을 지었다고 합니다.\n' +
      '구운 아스파라거스,구운 생선이나 치킨, 새우, 랍스타, 또는 그라탕이나 구운 브리치즈나 염소치즈와 환상의 궁합을 보입니다.',
    wineImagePath: '/wines/AOZINA/CANOPY.png',
  },
  {
    wineryId: 4,
    wineId: 406,
    wineNameEN: 'White Label',
    wineNameKR: '화이트 라벨',
    wineType: WineTypes.white,
    wineVariety: ["Muscat d'Alexandrie"],
    wineDescription:
      '수확 후 디스팀 한 포도는 스테인레스에서 12월까지 5개월이상 침용시키며, 압착하지\n' +
      '않고 오직 중력에 의해 생성된 주스로만 숙성 시킵니다. 첫 빈티지 출시 후 일본에서 다\n' +
      '음 빈티지를 전량 예약 했을 정도로 완성미 있는 다미앙의 시그니처 화이트 와인입니다.\n' +
      '*한국 60병 알로케이션 수입\n',
    wineImagePath: '/wines/AOZINA/White Label.png',
  },
  {
    wineryId: 4,
    wineId: 407,
    wineNameEN: 'Pink Lover',
    wineNameKR: ' 핑크 러버',
    wineType: WineTypes.rose,
    wineVariety: ['Carignan', 'Grenache noir', 'Mourvedre'],
    wineDescription:
      '루씨옹의 가볍게 마시기 좋은 로제 와인으로, 그르나슈 누아, 까리냥, 무르베드르 세품종의 조화를 잘 담아 내었습니다.\n' +
      '프랑스에서 첫 선보였을 시에 로제와인에 회의적인 사람들도 놀라게 만든 와인입니다.\n' +
      '손수확 후 바로 압착하여 2개월간 탱크에서 숙성을 거칩니다.\n' +
      '첫향에 자스민, 오렌지 꽃향기와 딸기 라즈베리, 체리같은 신선한 과일 향을 뿜어냅니다.\n' +
      '입안에서는 균형잡힌 산미와 미네랄감이 느껴집니다.\n' +
      '여름 내내 아페리티프로 마시기 좋고, 샐러드, 구운 해산물, 지중해요리, 치즈와 매칭하여 마시면 행복한 로제 입니다.',
    wineImagePath: '/wines/AOZINA/Pink Lover.png',
  },
  {
    wineryId: 5,
    wineId: 501,
    wineNameEN: 'Le Blanc',
    wineNameKR: '르 블랑',
    wineType: WineTypes.white,
    wineVariety: ['Pinot Blanc', 'Chardonnay', 'Pinot Gris'],
    wineDescription:
      '신선하고 우아한 블랜딩의 와인입니다. 청사과와 서양배, 시트러스의 향이 느껴지며\n' +
      '깔끔한 산미와 부드러운 질감의 미네랄리티가 돋보이는 와인입니다.\n' +
      '우드배럴과 스테인레스 스틸에서 각각 발효 되었으며, 정제와 여과없이 병입 후 18개월동안 숙성되었습니다.\n' +
      '모든 생선요리, 그릴 해산물과 좋은 궁합을 이루는 와인입니다.',
    wineImagePath: '/wines/SCHNEIDER/White Label.png',
  },
  {
    wineryId: 5,
    wineId: 502,
    wineNameEN: 'Rose',
    wineNameKR: '로제',
    wineType: WineTypes.rose,
    wineVariety: ['Pinot Noir'],
    wineDescription:
      '피노누아로 만든 로제는 깊고 풍부한 체리와 스트로베리의 향이 느껴지며,\n' +
      '음습한 숲의 뉘앙스와 부드러운 탄닌과 균형잡힌 산미가 특징입니다.\n' +
      '짧은 마세레이션을 거치고 우드배럴에서 18개월동안 숙성 시켰으며 정제와 여과없이 병입되었습니다',
    wineImagePath: '/wines/SCHNEIDER/Rose.png',
  },
  {
    wineryId: 5,
    wineId: 503,
    wineNameEN: 'La Boheme',
    wineNameKR: '라 보헴',
    wineType: WineTypes.white,
    wineVariety: ['Gutedel (Chasselas)'],
    wineDescription:
      '보헤미안 스타일로 만들어진 독창적인 와인입니다. 압착 후 우드 배럴에서의 발효를 거쳤으며,\n' +
      '18개월 후 정제나 여과 없이 병입되었습니다. 사과, 서양배, 허브의 향과 견과류의 고소함,\n' +
      '약간의 스파이시함이 더해져 복합적인 풍미를 자랑합니다.구운 닭고기나 해산물과 잘 어울립니다.',
    wineImagePath: '/wines/SCHNEIDER/La Boheme.png',
  },
  {
    wineryId: 5,
    wineId: 504,
    wineNameEN: 'El Fayoum',
    wineNameKR: '엘 파욤',
    wineType: WineTypes.white,
    wineVariety: ['Gutedel (Chasselas)'],
    wineDescription:
      '5일간의 스킨 컨택 후 스테인레스 스틸에서 발효 되었으며, 18개월 후 정제와 여과 없이병입 되었습니다.\n' +
      '생생한 열대과일과 꽃향, 신선한 산미와 샤슬라만의 차가움이 느껴지는 꿀떡 와인입니다.\n' +
      '알콜도수도 9도로 낮아 레이블처럼 여름, 바닷가에서 피크닉하며 마시기 딱 좋은 와인입니다.\n' +
      '해산물 요리, 가벼운 샐러드와 여름과일, 향신료가 섞인 아시아 퓨전 요리가 잘 어울립니다.',
    wineImagePath: '/wines/SCHNEIDER/El Fayoum.png',
  },
  {
    wineryId: 5,
    wineId: 505,
    wineNameEN: 'Lörracher',
    wineNameKR: '뢰라허',
    wineType: WineTypes.red,
    wineVariety: ['Spatburgunder'],
    wineDescription:
      '뢰라허 지역 AOC와인으로 Qualitaswein은 독일의 와인 등급 시스템에서 높은 품질의 와인을 의미합니다.\n' +
      '특히나 슈나이더 형제가 집중하는 우아한 스패트부르군더로 이상적인 바덴 피노누아의 순수한 맛이 느껴집니다.\n' +
      '체리, 딸기, 약간의 흙내음이 느껴집니다.\n' +
      '14일간 스틸탱크 발효 후 바리크에서 12개월 숙성, 그리고 6개월 더 스테인레스 스틸에서 숙성 시킵니다.\n' +
      '정제와 여과 없이 병입 됩니다. 구운 오리, 스테이크, 각종 치즈와도 페어링이 좋습니다.',
    wineImagePath: '/wines/SCHNEIDER/Lörracher.png',
  },
  {
    wineryId: 5,
    wineId: 506,
    wineNameEN: 'Blanc et Noir Brut Nature',
    wineNameKR: '블랑 에 누아 브뤼 나뚜르',
    wineType: WineTypes.sparkling,
    wineVariety: ['Pinot Noir', 'Chardonnay, Pinot', 'Blanc'],
    wineDescription:
      '*Bottling: May, 2023\n' +
      '소량 생산된 스파킆링은 익은 사과, 시트러스 향이 주를 이르며 촘촘한 기포와 신선한 산미가 매력적입니다.\n' +
      '특히 블라인드를 하면 RM 샴페인을 연상 시키는 훌륭한 스파클링입니다.\n' +
      '12개월동안 스테인레스 스틸에서 숙성 후 병입하여 18개월동안 두번째 발효를 진행합니다.\n',
    wineImagePath: '/wines/SCHNEIDER/Blanc et Noir Brut Nature.png',
  },
];
