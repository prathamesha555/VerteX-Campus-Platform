import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VerteX | Campus Event Intelligence",
  description:
    "VerteX by Team ParadoX — a campus event coordination platform for event management, volunteer coordination, operational monitoring, and change propagation.",
  applicationName: "VerteX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}