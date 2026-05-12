import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import FloatingShapesBackground from '@/components/FloatingShapesBackground';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: 'Recipe Remix | Turn any recipe into your vibe',
  description: 'AI-powered recipe transformer - upload a recipe screenshot and transform it by cuisine, dietary needs, and appliances.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="font-sans antialiased">
        <FloatingShapesBackground />
        {children}
      </body>
    </html>
  );
}
