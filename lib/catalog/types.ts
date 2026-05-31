// Tipos derivados del esquema REAL de la instancia (verificado por consulta).
// No son adivinados: reflejan columnas existentes en public.*

export type IconoKey =
  | "Sparkle"
  | "Tooth"
  | "Smiley"
  | "Crown"
  | "Sun"
  | "Wrench"
  | "PaintBrush"
  | "MagnifyingGlass"
  | "Baby"
  | "Scissors"
  | "Cube"
  | "Atom";

export type Servicio = {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  categoria: string | null;
  icono: IconoKey;
  destacado: boolean;
  orden: number;
};

export type Especialista = {
  id: string;
  nombre: string;
  titulo: string | null;
  especialidad: string | null;
  sedeId: string | null;
};

export type Sede = {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
};

export type Tenant = {
  id: string;
  nombre: string;
  subdominio: string;
};
