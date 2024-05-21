import styled from 'styled-components';
import { Flex } from 'antd';
import { customedTheme } from '@/styles/theme';
import HomePageSection1 from '@/page/home/section1';
import HomePageSection2 from '@/page/home/section2';
import ContactFooter from '@/page/ContactFooter';
import HomePageSection3 from '@/page/home/section3';

function HomePage() {
  return (
    <Wrapper
      vertical
      gap={'10rem'}
    >
      <HomePageSection1 />
      <HomePageSection3 />
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
