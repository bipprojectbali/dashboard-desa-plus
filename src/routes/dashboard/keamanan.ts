import { createFileRoute } from '@tanstack/react-router'
import KeamananPage from '@/components/keamanan-page'

export const Route = createFileRoute('/dashboard/keamanan')({
  component: KeamananPage,
})

