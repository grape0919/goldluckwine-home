import styled from 'styled-components';
import { Flex, FloatButton } from 'antd';
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
