import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

/** 렌더링 예외 시 흰 화면 대신 간단한 안내를 보여준다 */
class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: '60vh',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          <p style={{ margin: 0, fontSize: '18px' }}>
            일시적인 오류가 발생했습니다.
          </p>
          <a href='/'>홈으로 돌아가기</a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
