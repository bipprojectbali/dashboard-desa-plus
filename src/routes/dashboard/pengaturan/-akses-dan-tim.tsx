import { Card, Title, Text, Space, Button, Group, Alert, Table, ActionIcon, Modal, TextInput, Select } from '@mantine/core';
import { IconInfoCircle, IconUserPlus, IconTrash, IconEdit, IconUser } from '@tabler/icons-react';
import { useState } from 'react';

const AksesDanTimSettings = () => {
  const [opened, setOpened] = useState(false);
  
  // Sample team members data
  const teamMembers = [
    { id: 1, name: 'Admin Utama', email: 'admin@desa.go.id', role: 'Administrator', status: 'Aktif' },
    { id: 2, name: 'Operator Desa', email: 'operator@desa.go.id', role: 'Operator', status: 'Aktif' },
    { id: 3, name: 'Staff Keuangan', email: 'keuangan@desa.go.id', role: 'Keuangan', status: 'Aktif' },
    { id: 4, name: 'Staff Umum', email: 'umum@desa.go.id', role: 'Umum', status: 'Nonaktif' },
  ];

  const roles = [
    { value: 'administrator', label: 'Administrator' },
    { value: 'operator', label: 'Operator' },
    { value: 'keuangan', label: 'Keuangan' },
    { value: 'umum', label: 'Umum' },
    { value: 'keamanan', label: 'Keamanan' },
  ];

  return (
    <Card withBorder radius="md" p="xl">
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Tambah Anggota Tim"
        size="lg"
      >
        <TextInput
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap anggota tim"
          mb="md"
        />
        <TextInput
          label="Alamat Email"
          placeholder="Masukkan alamat email"
          mb="md"
        />
        <Select
          label="Peran"
          placeholder="Pilih peran anggota tim"
          data={roles}
          mb="md"
        />
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={() => setOpened(false)}>Batal</Button>
          <Button>Undang Anggota</Button>
        </Group>
      </Modal>

      <Title order={2} mb="lg">Akses & Tim</Title>
      <Text color="dimmed" mb="xl">Kelola akses dan anggota tim Anda</Text>

      <Space h="lg" />

      <Group justify="space-between" mb="md">
        <Title order={4}>Anggota Tim</Title>
        <Button leftSection={<IconUserPlus size={16} />} onClick={() => setOpened(true)}>
          Tambah Anggota
        </Button>
      </Group>

      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nama</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Peran</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Aksi</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {teamMembers.map((member) => (
            <Table.Tr key={member.id}>
              <Table.Td>
                <Group gap="sm">
                  <IconUser size={20} />
                  <Text>{member.name}</Text>
                </Group>
              </Table.Td>
              <Table.Td>{member.email}</Table.Td>
              <Table.Td>
                <Text fw={500}>{member.role}</Text>
              </Table.Td>
              <Table.Td>
                <Text c={member.status === 'Aktif' ? 'green' : 'red'} fw={500}>
                  {member.status}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group>
                  <ActionIcon variant="subtle" color="blue">
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red">
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Space h="xl" />

      <Alert icon={<IconInfoCircle size={16} />} title="Informasi" color="blue" mb="md">
        Administrator memiliki akses penuh ke semua fitur. Peran lainnya memiliki akses terbatas sesuai kebutuhan.
      </Alert>

      <Group justify="flex-end" mt="xl">
        <Button variant="outline">Batal</Button>
        <Button>Simpan Perubahan</Button>
      </Group>
    </Card>
  );
};

export default AksesDanTimSettings;