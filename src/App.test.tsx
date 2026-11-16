/**
 * Tests de integración: renderizan la aplicación completa y la usan como lo
 * haría una persona (Testing Library + user-event), con `fetch` simulado.
 */
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { postsOfUser1, users } from './test/fixtures'
import { json, mockFetch } from './test/mock-fetch'

/** Renderiza la app y espera a que se muestre la lista de usuarios. */
async function renderAppWithUsers() {
  const user = userEvent.setup()
  render(<App />)
  const list = await screen.findByRole('list', { name: 'Lista de usuarios' })
  return { user, list }
}

describe('Listado de usuarios', () => {
  it('muestra el estado de carga y después los usuarios', async () => {
    mockFetch({ 'GET /users': () => json(users) })
    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios…')

    const list = await screen.findByRole('list', { name: 'Lista de usuarios' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(users.length)
    expect(screen.queryByText('Cargando usuarios…')).not.toBeInTheDocument()
  })

  it('filtra por nombre e indica cuando no hay resultados', async () => {
    mockFetch({ 'GET /users': () => json(users) })
    const { user, list } = await renderAppWithUsers()
    const search = screen.getByRole('searchbox', { name: 'Buscar usuarios por nombre' })

    await user.type(search, 'ervin')
    await waitFor(() => expect(within(list).getAllByRole('listitem')).toHaveLength(1))
    expect(within(list).getByText('Ervin Howell')).toBeInTheDocument()

    await user.clear(search)
    await user.type(search, 'nadie')
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument()
  })

  it('muestra un error visible y permite reintentar', async () => {
    let calls = 0
    mockFetch({ 'GET /users': () => (++calls === 1 ? json({}, 500) : json(users)) })
    const user = userEvent.setup()
    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No se pudieron cargar los usuarios')
    expect(alert).toHaveTextContent('(500)')

    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('list', { name: 'Lista de usuarios' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('Publicaciones de un usuario', () => {
  it('al elegir un usuario carga y muestra sus publicaciones', async () => {
    mockFetch({
      'GET /users': () => json(users),
      'GET /users/1/posts': () => json(postsOfUser1),
    })
    const { user } = await renderAppWithUsers()

    const button = screen.getByRole('button', { name: /Leanne Graham/ })
    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')

    const posts = await screen.findByRole('list', { name: 'Publicaciones' })
    expect(within(posts).getAllByRole('listitem')).toHaveLength(postsOfUser1.length)
    expect(within(posts).getByText('Primera publicación')).toBeInTheDocument()
  })

  it('valida que título y texto sean obligatorios sin enviar nada', async () => {
    const fetchSpy = mockFetch({
      'GET /users': () => json(users),
      'GET /users/1/posts': () => json(postsOfUser1),
    })
    const { user } = await renderAppWithUsers()
    await user.click(screen.getByRole('button', { name: /Leanne Graham/ }))
    await screen.findByRole('list', { name: 'Publicaciones' })

    // Solo espacios en el título: debe considerarse vacío.
    await user.type(screen.getByLabelText('Título'), '   ')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByText('El título es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('El texto es obligatorio.')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining('/posts'), expect.objectContaining({ method: 'POST' }))
  })

  it('crea una publicación válida y la añade al principio de la lista', async () => {
    const fetchSpy = mockFetch({
      'GET /users': () => json(users),
      'GET /users/1/posts': () => json(postsOfUser1),
      // JSONPlaceholder responde con el recurso y siempre id 101.
      'POST /posts': (init) => json({ id: 101, ...JSON.parse(String(init?.body)) }, 201),
    })
    const { user } = await renderAppWithUsers()
    await user.click(screen.getByRole('button', { name: /Leanne Graham/ }))
    await screen.findByRole('list', { name: 'Publicaciones' })

    await user.type(screen.getByLabelText('Título'), 'Mi publicación')
    await user.type(screen.getByLabelText('Texto'), 'Contenido nuevo')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    const posts = screen.getByRole('list', { name: 'Publicaciones' })
    await waitFor(() => expect(within(posts).getAllByRole('listitem')).toHaveLength(postsOfUser1.length + 1))
    const [first] = within(posts).getAllByRole('listitem')
    expect(first).toHaveTextContent('Mi publicación')
    expect(first).toHaveTextContent('Nueva')

    // Se envió el userId correcto y el formulario quedó limpio.
    const postCall = fetchSpy.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(JSON.parse(String(postCall?.[1]?.body))).toEqual({
      title: 'Mi publicación',
      body: 'Contenido nuevo',
      userId: 1,
    })
    expect(screen.getByLabelText('Título')).toHaveValue('')
  })

  it('conserva lo escrito y muestra el error si falla el guardado', async () => {
    mockFetch({
      'GET /users': () => json(users),
      'GET /users/1/posts': () => json(postsOfUser1),
      'POST /posts': () => json({}, 500),
    })
    const { user } = await renderAppWithUsers()
    await user.click(screen.getByRole('button', { name: /Leanne Graham/ }))
    await screen.findByRole('list', { name: 'Publicaciones' })

    await user.type(screen.getByLabelText('Título'), 'Título')
    await user.type(screen.getByLabelText('Texto'), 'Texto')
    await user.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(await screen.findByText(/No se pudo publicar/)).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('Título')
    expect(within(screen.getByRole('list', { name: 'Publicaciones' })).getAllByRole('listitem')).toHaveLength(
      postsOfUser1.length,
    )
  })
})
