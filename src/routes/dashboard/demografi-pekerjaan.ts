import { createFileRoute } from '@tanstack/react-router'
import DemografiPekerjaan from '../../components/demografi-pekerjaan'

export const Route = createFileRoute('/dashboard/demografi-pekerjaan')({
  component: DemografiPekerjaan,
})

