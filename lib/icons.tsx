"use client";

import {
  Sparkle,
  Tooth,
  Smiley,
  Crown,
  Sun,
  Wrench,
  PaintBrush,
  MagnifyingGlass,
  Baby,
  Scissors,
  Cube,
  Atom,
  type Icon,
} from "@phosphor-icons/react";
import type { IconoKey } from "@/lib/catalog/types";

// Mapa de claves serializables (string) a componentes de icono.
// Cruzar la frontera servidor -> cliente solo con la clave (IconoKey),
// nunca con el componente (no es serializable).
export const ICONOS: Record<IconoKey, Icon> = {
  Sparkle,
  Tooth,
  Smiley,
  Crown,
  Sun,
  Wrench,
  PaintBrush,
  MagnifyingGlass,
  Baby,
  Scissors,
  Cube,
  Atom,
};
