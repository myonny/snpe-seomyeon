import './globals.css';

export const metadata = {
  title: 'SNPE 서면점 | 1:1 레슨·상담 안내',
  description: 'SNPE 서면점(부산 서면) 1:1 프라이빗 레슨 수강료 및 상담 안내입니다.',
  manifest: '/manifest.json',
  // 아이폰 홈 화면 앱 (손님용)
  appleWebApp: {
    capable: true,
    title: 'SNPE 서면점',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#E6836F',
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
      </head>
      <body>{children}</body>
    </html>
  );
}
