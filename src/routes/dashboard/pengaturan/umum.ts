import UmumSettings from '@/components/pengaturan/umum'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/pengaturan/umum')({
  component: UmumSettings,
})

