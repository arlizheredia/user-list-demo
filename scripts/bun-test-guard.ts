/**
 * Se carga solo con `bun test` (ver bunfig.toml). Los tests de este proyecto
 * están escritos para Vitest + jsdom, así que se aborta con instrucciones en
 * lugar de dejar que fallen con errores confusos sobre `document`.
 */
console.error(
  '\n✋ Este proyecto usa Vitest. Ejecuta los tests con:\n\n    bun run test\n\n' +
    '(`bun test` usa el runner nativo de Bun, que no crea el entorno jsdom.)\n',
)
process.exit(1)
