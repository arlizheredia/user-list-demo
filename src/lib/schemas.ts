/**
 * Esquemas de datos de la aplicación.
 *
 * Usamos zod como única fuente de verdad: de cada esquema se infiere el tipo
 * TypeScript correspondiente, de modo que validación en tiempo de ejecución y
 * tipado estático nunca se desincronizan.
 */
import { z } from 'zod'

/**
 * Usuario devuelto por `GET /users`.
 * Solo se declaran los campos que la interfaz utiliza; zod descarta el resto
 * (dirección, geolocalización, ...) para no arrastrar datos innecesarios.
 */
export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  username: z.string(),
  email: z.email(),
  company: z.object({ name: z.string() }),
})

/** Publicación devuelta por `GET /posts` o `POST /posts`. */
export const postSchema = z.object({
  id: z.number().int(),
  userId: z.number().int().positive(),
  title: z.string(),
  body: z.string(),
})

export const usersSchema = z.array(userSchema)
export const postsSchema = z.array(postSchema)

export type User = z.infer<typeof userSchema>
export type Post = z.infer<typeof postSchema>

/**
 * Publicación creada en esta sesión. JSONPlaceholder devuelve siempre el
 * mismo `id` (101), así que añadimos un identificador local para usarlo como
 * `key` de React y distinguirlas de las que vienen del servidor.
 */
export interface LocalPost extends Post {
  localId: string
}

/** Longitudes máximas razonables para los campos del formulario. */
export const TITLE_MAX_LENGTH = 120
export const BODY_MAX_LENGTH = 2000

/**
 * Validación del formulario "Nueva publicación".
 * `trim()` se aplica antes de comprobar la longitud para que un campo con solo
 * espacios cuente como vacío.
 */
export const newPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'El título es obligatorio.')
    .max(TITLE_MAX_LENGTH, `El título no puede superar los ${TITLE_MAX_LENGTH} caracteres.`),
  body: z
    .string()
    .trim()
    .min(1, 'El texto es obligatorio.')
    .max(BODY_MAX_LENGTH, `El texto no puede superar los ${BODY_MAX_LENGTH} caracteres.`),
})

export type NewPostInput = z.infer<typeof newPostSchema>
