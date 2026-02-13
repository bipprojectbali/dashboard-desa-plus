import { Card, Title, Text, Space, Switch, Group, Alert, Checkbox, Button, useMantineColorScheme } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

const NotifikasiSettings = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  return (
    <Card withBorder radius="md" p="xl" bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
      <Title order={2} mb="lg">Pengaturan Notifikasi</Title>
      <Text color="dimmed" mb="xl">Kelola preferensi notifikasi Anda</Text>

      <Space h="lg" />

      <Checkbox.Group defaultValue={['email', 'push']} mb="md">
        <Title order={4} mb="sm">Metode Notifikasi</Title>
        <Group>
          <Checkbox value="email" label="Email" />
          <Checkbox value="push" label="Notifikasi Push" />
          <Checkbox value="sms" label="SMS" />
        </Group>
      </Checkbox.Group>

      <Space h="md" />

      <Group mb="md">
        <Switch label="Notifikasi Email" defaultChecked />
        <Switch label="Notifikasi Push" defaultChecked />
      </Group>

      <Space h="md" />

      <Title order={4} mb="sm">Jenis Notifikasi</Title>
      <Group align="start">
        <Switch label="Pengaduan Baru" defaultChecked />
        <Switch label="Update Status Pengaduan" defaultChecked />
        <Switch label="Laporan Mingguan" />
        <Switch label="Pemberitahuan Keamanan" defaultChecked />
        <Switch label="Aktivitas Akun" defaultChecked />
      </Group>

      <Space h="md" />

      <Alert icon={<IconInfoCircle size={16} />} title="Tip" color="blue" mb="md">
        Anda dapat menyesuaikan frekuensi notifikasi mingguan sesuai kebutuhan Anda.
      </Alert>

      <Group justify="flex-end" mt="xl">
        <Button variant="outline">Batal</Button>
        <Button>Simpan Preferensi</Button>
      </Group>
    </Card>
  );
};

export default NotifikasiSettings;