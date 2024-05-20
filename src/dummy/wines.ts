import { WineInfoType } from '@/types/wine';
import { WineTypes } from '@/enum/wine';

export const wines: WineInfoType[] = [
  {
    wineryId: 1,
    wineId: 1,
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
    wineId: 2,
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
    wineryId: 2,
    wineId: 3,
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
    wineId: 4,
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
    wineId: 5,
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
    wineId: 6,
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
    wineId: 7,
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
    wineId: 8,
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
    wineId: 9,
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
    wineId: 10,
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
    wineId: 11,
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
    wineId: 12,
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
    wineId: 13,
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
];
