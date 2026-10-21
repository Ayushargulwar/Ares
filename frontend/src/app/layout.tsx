import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ARES — Autonomous Disaster Response & Resource Allocation Engine',
  description: 'T9 Agentic AI Disaster Command Center & Decision Support Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
