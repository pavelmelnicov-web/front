import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space, Self.",
  description: "Digital workbook for creating a home environment that works for you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
