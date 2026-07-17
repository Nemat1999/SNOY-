import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atelier | Minimalist Capsule Store",
  description: "A minimalist capsule store and curated space showroom.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
