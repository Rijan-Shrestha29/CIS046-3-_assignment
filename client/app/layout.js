import './globals.css';

export const metadata = {
  title: '🍌 Banana Game',
  description: 'Collect bananas, top the leaderboard, challenge friends',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}