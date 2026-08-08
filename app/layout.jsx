import './globals.css';

export const metadata = {
  title: 'OOXME',
  description: 'OOXME is a premium brand management and business development partner.',
  icons: {
    icon: [{ url: '/assets/logo/OX-001-LOGO-black.png', type: 'image/png' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
