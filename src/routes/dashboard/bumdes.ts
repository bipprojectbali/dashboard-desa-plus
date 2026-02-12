import BumdesPage from '@/components/bumdes-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/bumdes')({
  component: BumdesPage,
})

