// routes/utils.ts
/**
 * Generador numérico de IDs amigables: <prefijo><5 dígitos>
 * Ej: "p12345", "f67890", "U54321"
 */
export function generarIdNumerico(prefijo: string, digits = 5): string {
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  const num = Math.floor(Math.random() * (max - min + 1)) + min;
  return `${prefijo}${num}`;
}

/** Prefijos específicos del dominio */
export const generarIdEnvase   = () => generarIdNumerico("p"); // p12345
export const generarIdSabor    = () => generarIdNumerico("f"); // f12345
export const generarIdUsuario  = () => generarIdNumerico("U"); // U12345
export const generarIdSucursal = () => generarIdNumerico("S"); // S12345
export const generarIdOrden    = () => generarIdNumerico("O"); // O12345
