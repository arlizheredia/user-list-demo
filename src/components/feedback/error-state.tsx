import { CircleAlert, RotateCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title: string
  error: Error
  /** Si se indica, se muestra un botón para reintentar la operación. */
  onRetry?: () => void
}

/** Mensaje de error visible con opción de reintento. */
export function ErrorState({ title, error, onRetry }: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <CircleAlert aria-hidden />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{error.message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
            <RotateCw aria-hidden />
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
