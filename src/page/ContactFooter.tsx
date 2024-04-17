import styled from 'styled-components';
import { FaInstagram, FaRegCopy } from 'react-icons/fa6';
import { App, Button, Divider, Flex, Space, Typography } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { customedTheme } from '@/styles/theme';
const { Text, Link } = Typography;
const ContactFooter = () => {
  const { message } = App.useApp();
  return (
    <Wrapper>
      <Divider
        orientation='left'
        className={['contact-title'].join(',')}
        style={{ fontWeight: customedTheme.fontWeight.bold }}
      >
        Contact
      </Divider>
      <Flex
        className={['contact-info-layout'].join(',')}
        vertical
        gap={customedTheme.space.md}
      >
        <div>Gold Luck Wine</div>
        <div>+82 10 9594 1426</div>

        <Flex
          align={'center'}
          gap={customedTheme.space.sm}
        >
          <Link
            href='#'
            onClick={(e) => {
              window.location.href = 'mailto:goldluckwine@gmail.com';
              e.preventDefault();
            }}
          >
            goldluckwine@gmail.com
          </Link>
          <CopyToClipboard
            text={'goldluckwine@gmail.com'}
            onCopy={() =>
              void message.success('메일 주소를 클립보드에 복사했어요!')
            }
          >
            <Button
              type={'text'}
              style={{ padding: 8 }}
            >
              <FaRegCopy />
            </Button>
          </CopyToClipboard>
        </Flex>
        <Flex
          align={'center'}
          gap={customedTheme.space.sm}
        >
          <FaInstagram />
          <Link
            href='https://www.instagram.com/goldluckwine/'
            target='_blank'
          >
            @goldluckwine
          </Link>
        </Flex>
      </Flex>
    </Wrapper>
  );
};

// eslint-disable-next-line no-undef
const Wrapper = styled.div`
  padding: 4rem 3rem;
  .contact-title {
    margin-bottom: ${customedTheme.space.lg};
    font-family: 'Lora', serif;
    font-size: ${customedTheme.fontSize.s6};
    font-weight: ${customedTheme.fontWeight.semiBold};
  }
  .contact-info-layout {
    padding: ${customedTheme.space.md} ${customedTheme.space.xxl};
    font-size: ${customedTheme.fontSize.s3};
    font-weight: ${customedTheme.fontWeight.semiBold};
  }
`;
export default ContactFooter;
