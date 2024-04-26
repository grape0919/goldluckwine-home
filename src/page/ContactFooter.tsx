import styled from 'styled-components';
import { FaInstagram, FaRegEnvelope, FaRegBuilding } from 'react-icons/fa6';
import { MailOutlined } from '@ant-design/icons';
import { Divider, Flex, Typography } from 'antd';
import { customedTheme } from '@/styles/theme';
const { Link, Paragraph } = Typography;
const ContactFooter = () => {
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
        <Flex
          align={'center'}
          gap={customedTheme.space.sm}
        >
          <FaRegBuilding /> <div>Gold Luck Wine</div>
        </Flex>
        <Flex
          align={'center'}
          gap={customedTheme.space.sm}
        >
          <FaRegEnvelope />
          <Link
            href='#'
            onClick={(e) => {
              window.location.href = 'mailto:goldluckwine@gmail.com';
              e.preventDefault();
            }}
          >
            <Paragraph copyable>goldluckwine@gmail.com</Paragraph>
          </Link>
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
  .ant-typography .css-dev-only-do-not-override-hon4ta {
    margin: 0;
  }
`;
export default ContactFooter;
