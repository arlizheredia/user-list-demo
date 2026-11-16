/** Utilidades de formato para la interfaz. */
/** Iniciales (máx. 2) de un nombre para el avatar: "Leanne Graham" -> "LG". */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => /^\p{L}/u.test(part)) // ignora fragmentos sin letra inicial
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}
