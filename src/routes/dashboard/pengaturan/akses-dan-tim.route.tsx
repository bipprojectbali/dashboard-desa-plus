import { createFileRoute } from '@tanstack/react-router';
import AksesDanTimSettings from './-akses-dan-tim';

export const Route = createFileRoute('/dashboard/pengaturan/akses-dan-tim')({
  component: AksesDanTimSettings,
});