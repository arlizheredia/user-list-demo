/**
 * Configuración global de los tests.
 * - Añade los matchers de jest-dom (toBeInTheDocument, toHaveValue, ...).
 * - Limpia el DOM y restaura los mocks entre tests para que sean independientes.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
