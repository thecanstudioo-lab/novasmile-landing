import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NovaSmile Elite | Odontologia estetica de alta gama en Bogota",
  description:
    "Diseno de sonrisa, implantes y ortodoncia invisible con tecnologia digital 3D. Agenda tu valoracion en NovaSmile Elite.",
  openGraph: {
    title: "NovaSmile Elite | Tu mejor sonrisa, disenada con precision",
    description:
      "Odontologia estetica de alta gama en Bogota. Agenda tu valoracion en menos de un minuto.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable}`}>
      <body className="grain">
        {/* Sentinela para que el header detecte el scroll y cambie a solido. */}
        <div id="top" />
        <div id="top-sentinel" className="absolute top-0 h-px w-px" aria-hidden />
        {children}
      </body>
    </html>
  );
}
