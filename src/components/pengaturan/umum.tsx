import { Card, Title, Text, Space, TextInput, Select, Button, Group, Switch, Alert, useMantineColorScheme } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

const UmumSettings = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  return (
    <Card withBorder radius="md" p="xl" bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
      <Title order={2} mb="lg">Pengaturan Umum</Title>
      <Text color="dimmed" mb="xl">Kelola pengaturan umum aplikasi Anda</Text>

      <Space h="lg" />

      <TextInput
        label="Nama Aplikasi"
        placeholder="Masukkan nama aplikasi"
        defaultValue="Dashboard Desa Plus"
        mb="md"
      />

      <Select
        label="Bahasa Aplikasi"
        data={[
          { value: 'id', label: 'Indonesia' },
          { value: 'en', label: 'English' },
        ]}
        defaultValue="id"
        mb="md"
      />

      <Select
        label="Zona Waktu"
        data={[
          { value: 'Asia/Jakarta', label: 'Asia/Jakarta (GMT+7)' },
          { value: 'Asia/Makassar', label: 'Asia/Makassar (GMT+8)' },
          { value: 'Asia/Jayapura', label: 'Asia/Jayapura (GMT+9)' },
        ]}
        defaultValue="Asia/Jakarta"
        mb="md"
      />

      <Group mb="md">
        <Switch label="Notifikasi Email" defaultChecked />
      </Group>

      <Alert icon={<IconInfoCircle size={16} />} title="Informasi" color="blue" mb="md">
        Beberapa pengaturan mungkin memerlukan restart aplikasi untuk diterapkan sepenuhnya.
      </Alert>

      <Group justify="flex-end" mt="xl">
        <Button variant="outline">Batal</Button>
        <Button>Simpan Perubahan</Button>
      </Group>
    </Card>
  );
};

export default UmumSettings;