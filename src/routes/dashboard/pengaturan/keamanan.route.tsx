import { createFileRoute } from '@tanstack/react-router';
import KeamananSettings from './keamanan';

export const Route = createFileRoute('/dashboard/pengaturan/keamanan')({
  component: KeamananSettings,
});