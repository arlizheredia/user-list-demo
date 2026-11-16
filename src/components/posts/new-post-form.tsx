import { useActionState } from 'react'
import { LoaderCircle, Send } from 'lucide-react'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BODY_MAX_LENGTH, newPostSchema, TITLE_MAX_LENGTH, type NewPostInput } from '@/lib/schemas'

/** Estado que devuelve la acción del formulario tras cada envío. */
interface FormState {
  /** Valores a mostrar en los campos (se conservan si hay errores). */
  values: NewPostInput
  /** Errores por campo devueltos por zod. */
  fieldErrors: Partial<Record<keyof NewPostInput, string[]>>
  /** Error general (p. ej. fallo de red al guardar). */
  formError?: string
}

const EMPTY_STATE: FormState = { values: { title: '', body: '' }, fieldErrors: {} }

interface NewPostFormProps {
  /** Persiste la publicación; si lanza un error se muestra en el formulario. */
  onSubmit: (input: NewPostInput) => Promise<void>
}

/**
 * Formulario para crear una publicación.
 *
 * Usa `useActionState` (React 19): la acción recibe el `FormData`, lo valida
 * con zod y devuelve el nuevo estado. React gestiona el estado pendiente y,
 * tras cada envío, reinicia el formulario a sus `defaultValue`; por eso
 * devolvemos los valores introducidos cuando hay errores (para no perderlos)
 * y valores vacíos cuando todo va bien (para limpiarlo).
 */
export function NewPostForm({ onSubmit }: NewPostFormProps) {
  const [state, formAction, isPending] = useActionState(async (_prev: FormState, formData: FormData) => {
    const values: NewPostInput = {
      title: String(formData.get('title') ?? ''),
      body: String(formData.get('body') ?? ''),
    }

    const parsed = newPostSchema.safeParse(values)
    if (!parsed.success) {
      return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors }
    }

    try {
      await onSubmit(parsed.data)
      return EMPTY_STATE
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido.'
      return { values, fieldErrors: {}, formError: `No se pudo publicar: ${message}` }
    }
  }, EMPTY_STATE)

  const titleError = state.fieldErrors.title?.[0]
  const bodyError = state.fieldErrors.body?.[0]

  return (
    // `noValidate`: la validación la hace zod para mostrar mensajes coherentes
    // en lugar de las burbujas nativas del navegador.
    <form action={formAction} noValidate aria-label="Nueva publicación">
      <FieldGroup>
        <Field data-invalid={Boolean(titleError)}>
          <FieldLabel htmlFor="post-title">Título</FieldLabel>
          <Input
            id="post-title"
            name="title"
            defaultValue={state.values.title}
            maxLength={TITLE_MAX_LENGTH}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'post-title-error' : undefined}
            required
          />
          {titleError && <FieldError id="post-title-error">{titleError}</FieldError>}
        </Field>

        <Field data-invalid={Boolean(bodyError)}>
          <FieldLabel htmlFor="post-body">Texto</FieldLabel>
          <Textarea
            id="post-body"
            name="body"
            rows={4}
            defaultValue={state.values.body}
            maxLength={BODY_MAX_LENGTH}
            aria-invalid={Boolean(bodyError)}
            aria-describedby={bodyError ? 'post-body-error' : undefined}
            required
          />
          {bodyError && <FieldError id="post-body-error">{bodyError}</FieldError>}
        </Field>

        {state.formError && (
          <Alert variant="destructive">
            <AlertDescription>{state.formError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isPending} className="self-end">
          {isPending ? <LoaderCircle aria-hidden className="animate-spin" /> : <Send aria-hidden />}
          {isPending ? 'Publicando…' : 'Publicar'}
        </Button>
      </FieldGroup>
    </form>
  )
}
