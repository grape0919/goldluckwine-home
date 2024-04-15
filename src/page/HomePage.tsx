import styled from 'styled-components';
import { Flex } from 'antd';
import { customedTheme } from '@/styles/theme';
import HomePageSection1 from '@/page/home/section1';
import HomePageSection2 from '@/page/home/section2';
function HomePage() {
  return (
    <Wrapper
      vertical
      gap={'4rem'}
    >
      <HomePageSection1 />
      <HomePageSection2 />
    </Wrapper>
  );
}

const Wrapper = styled(Flex)`
  background: ${customedTheme.color.bg.light};
`;

export default HomePage;
