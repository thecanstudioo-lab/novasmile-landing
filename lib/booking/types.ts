// Contrato del formulario de reserva hacia la ruta /api/reservar.

export type ReservaInput = {
  servicioSlug: string;
  especialistaId: string | null; // null = sin preferencia
  sedeId: string;
  inicioISO: string;
  finISO: string;
  pacienteNombre: string;
  pacienteTelefono: string;
  pacienteEmail?: string;
  notas?: string;
  consentimiento: boolean;
};

export type ReservaResultado =
  | { ok: true; estado: string }
  | {
      ok: false;
      code:
        | "VALIDACION"
        | "CONFLICTO_SLOT"
        | "CONFIG_PENDIENTE"
        | "RECHAZADO"
        | "ERROR_RED";
      mensaje: string;
      campo?: keyof ReservaInput;
      slotsOcupados?: string[];
    };
