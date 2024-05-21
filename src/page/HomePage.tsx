import styled from 'styled-components';
import { Flex } from 'antd';
import { customedTheme } from '@/styles/theme';
import HomePageSection1 from '@/page/home/section1';
import HomePageSection2 from '@/page/home/section2';
import ContactFooter from '@/page/ContactFooter';
function HomePage() {
  return (
    <Wrapper
      vertical
      gap={'4rem'}
    >
      <HomePageSection1 />
      <div
        style={{
          padding: '1rem 20%',
          fontSize: customedTheme.fontSize.s3,
          fontWeight: customedTheme.fontWeight.semiBold,
        }}
      >
        골드럭 와인은 프랑스의 보석같은 소규모 농부들의 와인을 소개하는 내추럴
        와인 전문 수입사입니다. 루아르 지역의 대표 화이트 품종인 슈냉 블랑의
        다채로운 퍼포먼스를 보여주는 와인들을 위주로, 특히 ‘깨끗함’과 ‘우아함’
        의 강점을 가진 와인들을 선보입니다. 골드럭은 포도 본연의 순수함과
        떼루아를 존중하며 최소한의 개입으로 양조하는, 진솔한 와인 메이커들과
        함께합니다.
      </div>
      <HomePageSection2 />
      <ContactFooter />

      {/*<FloatButton.BackTop />*/}
    </Wrapper>
  );
}

const Wrapper = styled(Flex)`
  background: ${customedTheme.color.bg.light};
`;

export default HomePage;
