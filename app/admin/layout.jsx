// 관리자 페이지 전용 설정.
// 홈 화면에 추가하면 손님 앱과 다른 아이콘/이름("SNPE 관리자")으로 저장됩니다.

export const metadata = {
  title: 'SNPE 관리자',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    title: 'SNPE 관리자',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/admin-icon.png',
  },
};

export default function AdminLayout({ children }) {
  return children;
}
