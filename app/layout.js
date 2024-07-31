import { Inter } from "next/font/google";
import "./globals.css";
import { firebaseConfig } from "@/firebase";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Inventory Tracker",
  description: "Inventory Tracker is an intelligent inventory items tracker.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
