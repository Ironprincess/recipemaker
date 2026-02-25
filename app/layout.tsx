import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fridge Recipe Builder",
  description: "Track your fridge ingredients and generate AI recipes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
