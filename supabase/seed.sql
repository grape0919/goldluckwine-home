-- 자동 생성 (scripts/gen-seed.mjs) — 기존 더미 데이터를 Supabase 로 이관
-- 실행: schema.sql 적용 후 SQL Editor 에 붙여넣고 Run
begin;

-- 도멘(와이너리) 삽입. 기존 dummy id 를 sort_order 로 보존합니다.
insert into public.wineries (domaine, domaine_kr, location, description, image_path, sort_order)
values ('Damien Bureau', '다미앙 뷰호', 'Anjou, Loire', '"앙주 출신 루아르 내추럴 씬의 존경받는 아이콘 생산자 다미앙 뷰호”
2000년 초반부터 앙주와 버건디의 작은 도멘에서 와인을 양조해온 관록있는 와인메이커 입니다.
2006년 내추럴 와인 1세대 레전드이며 오랜 친구인 Sebastian Babass가 권해준 Anjou의 작은 슈냉블랑 밭에서 그의 첫 뀌베인 샤페흘리포펫을 만들며
본격적으로 앙주에 뿌리를 내리게 됩니다.
Champ-sur-Layon에 위치한 3ha의 포도밭 중 2ha에 Chenin Blanc을, 1h에서 Cabernet Franc, Gamay, Pineaud''Aunis, Grolleau를 재배합니다.
다미앙은 완벽주의자로 불리며 완벽한 한병의 와인을 위해 아낌없는 기다림의 시간을 투자합니다.
현재 루아르의 내추럴 와인 페어 ''Les Anonymes''의 회장을 맡아 안팎으로 내추럴 와인을 알리기 위한 활동을 하고 있습니다.', '/domaines/Damien Bureau.png', 1);
insert into public.wineries (domaine, domaine_kr, location, description, image_path, sort_order)
values ('Domaine7', '도멘 세븐', 'Anjou, Loire', '제약 엔지니어겸 유명한 와인 애호가였던 아벨은 2015년 와인메이커로 인생을 전향한 앙주의 유망주 입니다.
정식으로 학교에 입학해 포도밭 농작과 양조학을 배우고, Beaujolais ''Domaine Thillardon'', Roussillon ''Domaine Vin'', 루아르의 Patrick Corbineau에서 경험을 쌓았습니다.
2018년 아벨은 도멘 이름처럼 럭키하게 Angers의 유명 생산자 Domaine des Roches Seches의 밭을 일부 구입할 수 있게 됩니다.
그가 소유한 4h의 밭은 2010년부터 이미 유기농으로 전환 되었으며, 내추럴와인을 위한 떼루아의 모습을 완연히 갖추고 있었습니다.
면적의 3/4이 30년 이상의 올드바인 슈냉블랑이며, 나머지 1h에서 카베르네 프랑을 재배합니다.
''7''은 아벨이 생각하는 가장 심미적이고 완벽한 모양이며, 그의 와인이 표현 하고자하는 아름다움입니다.', '/domaines/Domaine7.png', 2);
insert into public.wineries (domaine, domaine_kr, location, description, image_path, sort_order)
values ('Stephan Thibault', '스테판 띠보', 'Saumur, Loire', '“루아르 내추럴씬의 힙하고 클래식한 젊은 와인메이커 띠보 스테판”
스테판은 그의 젊고 새로운 감각에 매우 클래식한 양조방식 철학을 가진 독특한 와인메이커 입니다. 말 (horse)과 함께 포도밭을 경작하고,
양조장의 자연효모만을 사용하여 발효하여 와인은 오크배럴에서 숙성하는 전통적인 방식을 사용합니다.
골드럭 와인 포트폴리오 중 가장 어린 와인메이커가 만들었지만, 깊은 숙성 뉘앙스를 풍기는 우아한 슈냉블랑 입니다.
2015년 Clay/Limestone 토양의 4,5ha(슈냉블랑 1/3, 까베르네 프랑 2/3)의 밭으로 시작하여, 2020년 2ha의 Silex jurassic 토양의 까베르네 프랑 포도밭까지 넓혔고,
지금도 차근히 자신의 떼루아를 찾고 발전하는 루아르의 넥스트 스타 메이커 입니다.', '/domaines/Stephan Thibault.png', 3);
insert into public.wineries (domaine, domaine_kr, location, description, image_path, sort_order)
values ('AOZINA', '아오지나', 'PLANEZES, Occitan', '“다미앙 쁘띠피스는 Roussillon의 떠오르는 젊은 생산자로 현재 파리에서 인기가 굉장히 높습니다.
2020년 첫 빈티지는 1배럴 - 300병 생산하여 주변 마을에서 sold out 되었으며, 2021년 빈티지가 그의 첫 대중적인 빈티지라 할 수 있습니다.
도멘 아오지나는 옥시타니 (Occitanie) 지역 남쪽 경계선과 스페인 까딸루냐 (Catalunya) 지역의 최북쪽 경계선에 위치하며 다미앙은 이곳에서 나고 자랐습니다. 그는 어
릴적부터 아버지가 하시는 포도농사 일을 도왔으나, 아버지는 포도밭을 전부 M.Chapoutier와 다른 도멘들에 팔았습니다.
40대 초반인 다미앙은 가지치기 전문 회사를 운영하는 잘나가는 CEO로 평소 동네에서 포도 농사를 짓는 친한 친구들과 어울리며 함께 포도밭과 양조일, 테이스팅을 하며
지냈습니다. 그 중 각별히 친한 도멘 데 메나 (Dmaine de Mena)의 세바스티앙 아쥴레 (Sébastien Agelet) 의 권유와 도움으로 2020년 도멘을 설립하고 양조를 시작하
게 되었습니다. 그의 4ha / 6개의 포도밭은 Latour de France에 위치하며, 몇 몇 포도밭은 Cyril Fhal - Clos du Rouge Gorge 바로 옆에 위치합니다. 다미앙은 포도 품
종의 특성이 살아있는 과실향이 두드러지며 깨끗하고 쥬시한 스타일의 꾸밈없는 와인을 양조합니다.', '/domaines/AOZINA.png', 4);
insert into public.wineries (domaine, domaine_kr, location, description, image_path, sort_order)
values ('SCHNEIDER', '슈나이더', 'Germany', '슈나이더 가문의 와이너리는 1465년 라인강 유역 Weil 지역에서 시작되었습니다.
786년 증여 문서에 따르면 당시 이미 포도를 재배하고 있었으며, Weiler Schlipf 포도밭은 1200년 이상의 역사를 자랑합니다.
해발 315~330m의 경사로에 위치한 이 포도밭은 스위스 국경과 접해 있으며, 독일에서 가장 남서쪽에 있습니다.
17헥타르의 포도밭은 70개 이상의 구획으로 나뉘어 있으며, 구획별 테루아의 특징을 살린 포도를 재배합니다.
현재 6세대 요하네스와 크리스토퍼 형제가 와이너리를 운영하며, 100% 손수확, 적은 수확량, 긴 효모 숙성, 최소한의 인간 개입을 통해 와인을 생산합니다.
그들은 자연과 조화를 이루며 건강한 포도밭을 유지하는 것을 철학으로 삼고 있습니다.', '/domaines/SCHNEIDER.png', 5);

-- 와인 삽입. dummy wineryId 를 방금 넣은 도멘(sort_order 로 매칭)의 실제 id 로 연결합니다.
-- 처음 3개 와인은 홈 'OUR COLLECTION' 노출용으로 is_featured 를 켭니다.
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Mille Sabords', '밀사보흐', 'White', ARRAY['Chenin Blanc']::text[], '밀 사보흐는 다미앙 뷰호의 시그니처 화이트 와인입니다. 일반적으로 밀사보흐와 아망
딘, 두개의 뀌베를 만들어 왔던 다미앙은 2021년 루아르 전역에 있었던 기후 재난으로
인해 매우 소량의 슈냉블랑으로 밀사보흐 단 한 병만을 양조했습니다. 30년 이상된 슈
냉블랑과 다미앙의 첫번째 포도나무였던 65년 이상된 올드바인 슈냉블랑을 사용했습
니다. 포도는 그대로 압착되어 발효후 Cuve에서 9개월 동안 숙성 되었습니다. 활기 넘
치고 농축미 있는 핵과일 풍미에 자몽의 쌉사름한 산미가 매력적인 와인으로 지금 마셔
도 좋지만 충분한 숙성 잠재력이 있는 힘있는 화이트 와인입니다.', '/wines/Damien Bureau/Mille Sabords.png', 101, true
from public.wineries where sort_order = 1;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Paloma', '팔로마', 'Red', ARRAY['Cabernet Franc', 'Gamay', 'Pineau', 'd''Aunis', 'Grolleau', 'Chenin']::text[], '팔로마는 별도의 공식없이 매년 품종과 스타일이 달라지는 다미앙의 대표 레드와인 입
니다. 2021년은 작황이 좋지않아 화이트인 밀 사보흐 외에 모든 포도를 블랜딩해 이 와
인 하나만을 만들었습니다.
다미앙의 표현에 따르면 아주 쥬시하지만 심플하지는 않은, 깊이 있는 와인입니다.
블랙베리, 크랜베리의 신선한 과실미에 스파이시함이 매력적인 목넘김이 좋은 와인.
', '/wines/Damien Bureau/Paloma.png', 102, true
from public.wineries where sort_order = 1;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'La Jeannette', '라 쟈넷뜨', 'Sweet', ARRAY['Chenin Blanc']::text[], '* 357ml
2015년 더운 기후로 인해 귀부균이 완벽하게 생겼던 해에 만들어진 한정판 스위트 와인입니다.
오크통 단 한 개가 만들어진 소중한 와인입니다.
스위트 슈냉 블랑의 완벽한 밸런스를 보여주는 와인으로 SWEET but NOT SUGARY! / 내추럴씬의 디켐', '/wines/Damien Bureau/La Jeannette.png', 103, true
from public.wineries where sort_order = 1;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'La guimardiere', '라 기마르디에', 'White', ARRAY['Chenin Blanc']::text[], '1.5ha 석회암, 쉬스트 토양의 5개 구획의 블랜딩으로 만들어 집니다. 아주 깨끗하고 유
연한 루아르 슈냉 블랑의 교과서와도 같은 와인입니다.
청사과와 은은한 레몬, 잘 익은 풍미와 피니쉬에 남는 감칠맛까지 그릴에 구운 흰살 생
선, 해산물, 경성치즈와 아주 잘 매칭됩니다.', '/wines/Domaine7/La guimardiere.png', 201, false
from public.wineries where sort_order = 2;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'La Nouette', '라 누에뜨', 'White', ARRAY['Chenin Blanc']::text[], '아벨의 밭중 가장 고지대에 위치한 1ha의 싱글 빈야드로. 쉬스트 토양의 올드바인 슈냉
블랑을 사용합니다. 언덕 아래 Lys 강이 흘러 포도는 귀부 영향을 받고 있으며, 깨끗한
미네랄리티가 훌륭한 와인 입니다. 50% 와인은 Vat에서, 나머지는 Barrel에서 15개월
동안 숙성 후 병입하였습니다. 섬세한 밸런스와 산미를 가진 와인으로 정갈한 한식 또는
파인 다이닝과 페어링 하기 좋습니다.
', '/wines/Domaine7/La Nouette.png', 202, false
from public.wineries where sort_order = 2;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Plume', '플룸', 'Red', ARRAY['Cabernet Franc']::text[], '2개의 까베르네 프랑 뀌베를 블랜딩하여 1년간 Vat에서 숙성 했습니다. 풀룸은 ''깃털''
이란 뜻을 가졌는데, 노즈에서 강렬한 과실과 허브향이 피어오르는 가운데 입안에서는
섬세하고 실키한 질감이 하늘하늘 부드러워 붙여진 이름입니다. 은은하게 느껴지는 피
망, 아스파라거스 힌트에 검붉은 자두와 레드체리가 신선하게 느껴지는 매력적인 와인
입니다', '/wines/Domaine7/Plume.png', 203, false
from public.wineries where sort_order = 2;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Repenti Blanc', '흐빵띠', 'White', ARRAY['Chenin Blanc']::text[], '20년까지 Saumur AOC로 생산되었으나, 서류 절차의 번거로움으로 VDF로 출시합니
다. 손수확 후 자연 효모만을 사용하여 oak barrel에서 12개월 동안
숙성하였습니다. 첫향에 숙성 뉘앙스를 풍기며 숙성된 모과, 배, 허니의 과실향이 향긋
하게 느껴집니다. 마실수록 우아하고 바디감과 미네랄리티가 느껴지는 슈냉블랑 입니
다.', '/wines/Stephan Thibault/Repenti Blanc.png', 301, false
from public.wineries where sort_order = 3;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Poulp', '뿔쁘', 'White', ARRAY['Chenin Blanc']::text[], '뿔뿌는 띠보가 심혈을 기울여 만든 실험적인 와인 입니다.
포도는 부분적으로 줄기 제거를 했으며, 2달 동안 탱크에서 마세라시옹을 진행했습니
다. 그 후 압착하여 오크배럴에서 14개월 숙성하여 출시된 geek와인입니다.', '/wines/Stephan Thibault/Poulp.png', 302, false
from public.wineries where sort_order = 3;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Faites Enter la Cuvee', '페트 앙트레 라 뀌베', 'Red', ARRAY['Cabernet Franc']::text[], '100% destemming 하여 15일간의 침용을 거치고 free-run 주스와 압착된 주스를 함
께 블랜딩하여 Vat에서 6개월간 숙성 시킵니다. 블루베리, 블랙베리의 과실미가 직관적
으로 느껴지며 라일락 꽃향과 민트의 화함이 기분좋게 느껴지는 순수하고 때묻지 않은
까베르네 프랑 입니다.
', '/wines/Stephan Thibault/Faites Enter la Cuvee.png', 303, false
from public.wineries where sort_order = 3;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Grand Depart', '그랑 디빠트', 'Red', ARRAY['Grenache Noir']::text[], '전송이를 압착 후 5일간 침용을 거쳐 스테인레스 탱크에서 병입 전까지 숙성시켰습니
다. 라즈베리, 블랙체리, 블랙올리브의 향들이 느껴지며 부드러운 탄닌으로 목넘김이 좋
은 와인입니다. 스윗 스파이시하여 향신료가 돋보이는 음식들과 궁합이 아주 좋습니다.
', '/wines/AOZINA/Grand Depart.png', 401, false
from public.wineries where sort_order = 4;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Boom', '붐', 'Red', ARRAY['80% Syrah', '20% Muscat d''Alexandrie']::text[], '먼저 전송이 그대로 으깬 뮈스카 달렉산드리를 압착하지 않은 시라 위에 얹고, 다음날
시라도 파쇄하여 5일간 스테인리스 통에서 침용 후 발효 시킵니다. 시라의 스파이시함
과 레드베리 과실미에 화사한 청포도 꽃향이 레이어드된 직관적으로 예쁜 와인입니다.
톡쏘는 치즈나 사퀴데리와 매칭하기 좋습니다.
', '/wines/AOZINA/Boom.png', 402, false
from public.wineries where sort_order = 4;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Sun is Shining', '선 이즈 샤이닝', 'Orange', ARRAY['60% Muscat petit grain', '40% Muscat d''Alexandrie']::text[], '10일간 전송이 침용을 거치고 프레스 후 스테인리스에서 알코올 발효를 했습니다.
고대 화이트 품종인 뮈스카 달렉산드리와 뮈스카 쁘띠 그랑이 블렌딩되어 매혹적인 노
란꽃향이 화사하게 풍기며 입안 가득 잘익은 청포도 한송이를 머금은듯 싱그럽고
아삭하고, 탄닌이 느껴지며 뒷끝에 고소한 여운을 남기는 오렌지 와인입니다.
', '/wines/AOZINA/Sun is Shining.png', 403, false
from public.wineries where sort_order = 4;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Moon Walk', '문 워크', 'Red', ARRAY['Syrah']::text[], 'fiber통에서 5일간 전송이 압착된 포도를 침용 후 발효 시킵니다. 내추럴 시라의 쿰쿰
함이 첫 향에 느껴지지만 자연스럽게 사라지며 건강하고 프레쉬한 블랙베리 스파이시
함이 기분좋은 산도와 밸런스를 이루는 와인입니다.', '/wines/AOZINA/Moon Walk.png', 404, false
from public.wineries where sort_order = 4;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'CANOPY', '캐노피', 'White', ARRAY['Grenache gris', 'Macabeau']::text[], '그린 레이블에서 느껴지듯 청명하고 시원한 화이트 와인입니다.
첫향에 흰 야생꽃향과 살구의 향이 확실하게 표현됩니다.입안에서는 서양배와 미네랄리티가 매끈하고 부드럽게 느껴집니다. 
캐노피는 포도나무 성장을 위한 농법이기도 하고, 울창한 나무들이 빼곡한 숲의 상층의 뜻을 가졌는데
다미앙은 두개의 의미 모드를 담아 이 와인의 이름을 지었다고 합니다.
구운 아스파라거스,구운 생선이나 치킨, 새우, 랍스타, 또는 그라탕이나 구운 브리치즈나 염소치즈와 환상의 궁합을 보입니다.', '/wines/AOZINA/CANOPY.png', 405, false
from public.wineries where sort_order = 4;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'White Label', '화이트 라벨', 'White', ARRAY['Muscat d''Alexandrie']::text[], '수확 후 디스팀 한 포도는 스테인레스에서 12월까지 5개월이상 침용시키며, 압착하지
않고 오직 중력에 의해 생성된 주스로만 숙성 시킵니다. 첫 빈티지 출시 후 일본에서 다
음 빈티지를 전량 예약 했을 정도로 완성미 있는 다미앙의 시그니처 화이트 와인입니다.
*한국 60병 알로케이션 수입
', '/wines/AOZINA/White Label.png', 406, false
from public.wineries where sort_order = 4;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Pink Lover', ' 핑크 러버', 'Rose', ARRAY['Carignan', 'Grenache noir', 'Mourvedre']::text[], '루씨옹의 가볍게 마시기 좋은 로제 와인으로, 그르나슈 누아, 까리냥, 무르베드르 세품종의 조화를 잘 담아 내었습니다.
프랑스에서 첫 선보였을 시에 로제와인에 회의적인 사람들도 놀라게 만든 와인입니다.
손수확 후 바로 압착하여 2개월간 탱크에서 숙성을 거칩니다.
첫향에 자스민, 오렌지 꽃향기와 딸기 라즈베리, 체리같은 신선한 과일 향을 뿜어냅니다.
입안에서는 균형잡힌 산미와 미네랄감이 느껴집니다.
여름 내내 아페리티프로 마시기 좋고, 샐러드, 구운 해산물, 지중해요리, 치즈와 매칭하여 마시면 행복한 로제 입니다.', '/wines/AOZINA/Pink Lover.png', 407, false
from public.wineries where sort_order = 4;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Le Blanc', '르 블랑', 'White', ARRAY['Pinot Blanc', 'Chardonnay', 'Pinot Gris']::text[], '신선하고 우아한 블랜딩의 와인입니다. 청사과와 서양배, 시트러스의 향이 느껴지며
깔끔한 산미와 부드러운 질감의 미네랄리티가 돋보이는 와인입니다.
우드배럴과 스테인레스 스틸에서 각각 발효 되었으며, 정제와 여과없이 병입 후 18개월동안 숙성되었습니다.
모든 생선요리, 그릴 해산물과 좋은 궁합을 이루는 와인입니다.', '/wines/SCHNEIDER/White Label.png', 501, false
from public.wineries where sort_order = 5;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Rose', '로제', 'Rose', ARRAY['Pinot Noir']::text[], '피노누아로 만든 로제는 깊고 풍부한 체리와 스트로베리의 향이 느껴지며,
음습한 숲의 뉘앙스와 부드러운 탄닌과 균형잡힌 산미가 특징입니다.
짧은 마세레이션을 거치고 우드배럴에서 18개월동안 숙성 시켰으며 정제와 여과없이 병입되었습니다', '/wines/SCHNEIDER/Rose.png', 502, false
from public.wineries where sort_order = 5;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'La Boheme', '라 보헴', 'White', ARRAY['Gutedel (Chasselas)']::text[], '보헤미안 스타일로 만들어진 독창적인 와인입니다. 압착 후 우드 배럴에서의 발효를 거쳤으며,
18개월 후 정제나 여과 없이 병입되었습니다. 사과, 서양배, 허브의 향과 견과류의 고소함,
약간의 스파이시함이 더해져 복합적인 풍미를 자랑합니다.구운 닭고기나 해산물과 잘 어울립니다.', '/wines/SCHNEIDER/La Boheme.png', 503, false
from public.wineries where sort_order = 5;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'El Fayoum', '엘 파욤', 'White', ARRAY['Gutedel (Chasselas)']::text[], '5일간의 스킨 컨택 후 스테인레스 스틸에서 발효 되었으며, 18개월 후 정제와 여과 없이병입 되었습니다.
생생한 열대과일과 꽃향, 신선한 산미와 샤슬라만의 차가움이 느껴지는 꿀떡 와인입니다.
알콜도수도 9도로 낮아 레이블처럼 여름, 바닷가에서 피크닉하며 마시기 딱 좋은 와인입니다.
해산물 요리, 가벼운 샐러드와 여름과일, 향신료가 섞인 아시아 퓨전 요리가 잘 어울립니다.', '/wines/SCHNEIDER/El Fayoum.png', 504, false
from public.wineries where sort_order = 5;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Lörracher', '뢰라허', 'Red', ARRAY['Spatburgunder']::text[], '뢰라허 지역 AOC와인으로 Qualitaswein은 독일의 와인 등급 시스템에서 높은 품질의 와인을 의미합니다.
특히나 슈나이더 형제가 집중하는 우아한 스패트부르군더로 이상적인 바덴 피노누아의 순수한 맛이 느껴집니다.
체리, 딸기, 약간의 흙내음이 느껴집니다.
14일간 스틸탱크 발효 후 바리크에서 12개월 숙성, 그리고 6개월 더 스테인레스 스틸에서 숙성 시킵니다.
정제와 여과 없이 병입 됩니다. 구운 오리, 스테이크, 각종 치즈와도 페어링이 좋습니다.', '/wines/SCHNEIDER/Lörracher.png', 505, false
from public.wineries where sort_order = 5;
insert into public.wines (winery_id, name_en, name_kr, wine_type, variety, description, image_path, sort_order, is_featured)
select id, 'Blanc et Noir Brut Nature', '블랑 에 누아 브뤼 나뚜르', 'Sparkling', ARRAY['Pinot Noir', 'Chardonnay, Pinot', 'Blanc']::text[], '*Bottling: May, 2023
소량 생산된 스파킆링은 익은 사과, 시트러스 향이 주를 이르며 촘촘한 기포와 신선한 산미가 매력적입니다.
특히 블라인드를 하면 RM 샴페인을 연상 시키는 훌륭한 스파클링입니다.
12개월동안 스테인레스 스틸에서 숙성 후 병입하여 18개월동안 두번째 발효를 진행합니다.
', '/wines/SCHNEIDER/Blanc et Noir Brut Nature.png', 506, false
from public.wineries where sort_order = 5;

commit;
