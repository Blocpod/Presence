import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PRESENCE — Be there without being there.",
  description:
    "The control plane for your licensed digital presence. A working creator infrastructure demo.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
