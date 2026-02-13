import { createFileRoute } from '@tanstack/react-router';
import UmumSettings from './umum';

export const Route = createFileRoute('/dashboard/pengaturan/umum')({
  component: UmumSettings,
});