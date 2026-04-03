import "../styles/globals.css";
import { Inter } from "next/font/google";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import SeoHead from "../seo/SeoHead";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <SeoHead />
      </head>
      <body className={`${inter.className} bg-white text-black`}>
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
