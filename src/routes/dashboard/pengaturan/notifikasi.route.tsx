import { createFileRoute } from '@tanstack/react-router';
import NotifikasiSettings from './-notifikasi';

export const Route = createFileRoute('/dashboard/pengaturan/notifikasi')({
  component: NotifikasiSettings,
});