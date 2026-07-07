import './globals.css';

export const metadata = {
  title: 'SNPE 서면점 | 1:1 개인레슨 상담예약',
  description: 'SNPE 서면점(부산 서면) 1:1 개인레슨 상담 예약 창입니다.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard 폰트 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />

        {/* 홈 화면 앱 (아이폰/안드로이드) */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="SNPE 서면점" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#E6836F" />
      </head>
      <body>{children}</body>
    </html>
  );
}
