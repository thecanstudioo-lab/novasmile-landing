import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Imagenes de demostracion (reemplazar por fotos reales de la clinica antes de produccion).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    // Tree-shaking de Phosphor: importa solo los iconos usados.
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;
