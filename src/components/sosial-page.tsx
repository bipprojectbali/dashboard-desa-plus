import { useState } from "react";
import { 
  Card, 
  Grid, 
  GridCol, 
  Group, 
  Text, 
  Title, 
  Progress, 
  Stack,
  useMantineColorScheme,
  Badge,
  List,
  ThemeIcon
} from "@mantine/core";
import { 
  IconHeartbeat, 
  IconBabyCarriage, 
  IconStethoscope, 
  IconMedicalCross, 
  IconSchool, 
  IconBook, 
  IconCalendarEvent, 
  IconAward
} from "@tabler/icons-react";

const SosialPage = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  
  // Sample data for health statistics
  const healthStats = {
    ibuHamil: 87,
    balita: 342,
    alertStunting: 12,
    posyanduAktif: 8,
  };

  // Sample data for health progress
  const healthProgress = [
    { label: "Imunisasi Lengkap", value: 92, color: "green" },
    { label: "Pemeriksaan Rutin", value: 88, color: "blue" },
    { label: "Gizi Baik", value: 86, color: "teal" },
    { label: "Target Stunting", value: 14, color: "red" },
  ];

  // Sample data for posyandu schedule
  const posyanduSchedule = [
    { nama: "Posyandu Mawar", tanggal: "Senin, 15 Feb 2026", jam: "08:00 - 11:00" },
    { nama: "Posyandu Melati", tanggal: "Selasa, 16 Feb 2026", jam: "08:00 - 11:00" },
    { nama: "Posyandu Dahlia", tanggal: "Rabu, 17 Feb 2026", jam: "08:00 - 11:00" },
    { nama: "Posyandu Anggrek", tanggal: "Kamis, 18 Feb 2026", jam: "08:00 - 11:00" },
  ];

  // Sample data for education stats
  const educationStats = {
    siswa: {
      tk: 125,
      sd: 480,
      smp: 210,
      sma: 150,
    },
    sekolah: {
      jumlah: 8,
      guru: 42,
    }
  };

  // Sample data for scholarships
  const scholarshipData = {
    penerima: 45,
    dana: "Rp 1.200.000.000",
    tahunAjaran: "2025/2026",
  };

  // Sample data for cultural events
  const culturalEvents = [
    { nama: "Hari Kesaktian Pancasila", tanggal: "1 Oktober 2025", lokasi: "Balai Desa" },
    { nama: "Festival Budaya Desa", tanggal: "20 Mei 2026", lokasi: "Lapangan Desa" },
    { nama: "Perayaan HUT Desa", tanggal: "17 Agustus 2026", lokasi: "Balai Desa" },
  ];

  return (
    <Stack gap="lg">
      {/* Page Header */}
      <Group justify="space-between" align="center">
        <Title order={2} c={dark ? "dark.0" : "black"}>
          Sosial Desa
        </Title>
      </Group>

      {/* Health Statistics Cards */}
      <Grid gutter="md">
        <GridCol span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" align="center">
              <Stack gap={0}>
                <Text size="sm" c={dark ? "dark.3" : "dimmed"}>
                  Ibu Hamil Aktif
                </Text>
                <Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>
                  {healthStats.ibuHamil}
                </Text>
              </Stack>
              <ThemeIcon variant="light" color="darmasaba-blue" size="xl" radius="xl">
                <IconHeartbeat size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </GridCol>

        <GridCol span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" align="center">
              <Stack gap={0}>
                <Text size="sm" c={dark ? "dark.3" : "dimmed"}>
                  Balita Terdaftar
                </Text>
                <Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>
                  {healthStats.balita}
                </Text>
              </Stack>
              <ThemeIcon variant="light" color="darmasaba-success" size="xl" radius="xl">
                <IconBabyCarriage size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </GridCol>

        <GridCol span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" align="center">
              <Stack gap={0}>
                <Text size="sm" c={dark ? "dark.3" : "dimmed"}>
                  Alert Stunting
                </Text>
                <Text size="xl" fw={700} c="red">
                  {healthStats.alertStunting}
                </Text>
              </Stack>
              <ThemeIcon variant="light" color="red" size="xl" radius="xl">
                <IconStethoscope size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </GridCol>

        <GridCol span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder radius="md" padding="lg">
            <Group justify="space-between" align="center">
              <Stack gap={0}>
                <Text size="sm" c={dark ? "dark.3" : "dimmed"}>
                  Posyandu Aktif
                </Text>
                <Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>
                  {healthStats.posyanduAktif}
                </Text>
              </Stack>
              <ThemeIcon variant="light" color="darmasaba-warning" size="xl" radius="xl">
                <IconMedicalCross size={24} />
              </ThemeIcon>
            </Group>
          </Card>
        </GridCol>
      </Grid>

      {/* Health Progress Bars */}
      <Card withBorder radius="md" p="lg">
        <Title order={3} mb="md" c={dark ? "dark.0" : "black"}>Statistik Kesehatan</Title>
        <Stack gap="md">
          {healthProgress.map((item, index) => (
            <div key={index}>
              <Group justify="space-between" mb={5}>
                <Text size="sm" fw={500} c={dark ? "dark.0" : "black"}>
                  {item.label}
                </Text>
                <Text size="sm" fw={600} c={dark ? "dark.0" : "black"}>
                  {item.value}%
                </Text>
              </Group>
              <Progress
                value={item.value}
                size="lg"
                radius="xl"
                color={item.color}
              />
            </div>
          ))}
        </Stack>
      </Card>

      <Grid gutter="md">
        {/* Jadwal Posyandu */}
        <GridCol span={{ base: 12, lg: 6 }}>
          <Card withBorder radius="md" p="lg">
            <Title order={3} mb="md" c={dark ? "dark.0" : "black"}>Jadwal Posyandu</Title>
            <Stack gap="sm">
              {posyanduSchedule.map((item, index) => (
                <Card key={index} withBorder radius="md" p="md">
                  <Group justify="space-between">
                    <Stack gap={0}>
                      <Text fw={500} c={dark ? "dark.0" : "black"}>{item.nama}</Text>
                      <Text size="sm" c={dark ? "dark.3" : "dimmed"}>{item.tanggal}</Text>
                    </Stack>
                    <Badge variant="light" color="darmasaba-blue">
                      {item.jam}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>
        </GridCol>

        {/* Pendidikan */}
        <GridCol span={{ base: 12, lg: 6 }}>
          <Card withBorder radius="md" p="lg">
            <Title order={3} mb="md" c={dark ? "dark.0" : "black"}>Pendidikan</Title>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500} c={dark ? "dark.0" : "black"}>TK / PAUD</Text>
                <Text fw={700} c={dark ? "dark.0" : "black"}>{educationStats.siswa.tk}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500} c={dark ? "dark.0" : "black"}>SD</Text>
                <Text fw={700} c={dark ? "dark.0" : "black"}>{educationStats.siswa.sd}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500} c={dark ? "dark.0" : "black"}>SMP</Text>
                <Text fw={700} c={dark ? "dark.0" : "black"}>{educationStats.siswa.smp}</Text>
              </Group>
              <Group justify="space-between">
                <Text fw={500} c={dark ? "dark.0" : "black"}>SMA</Text>
                <Text fw={700} c={dark ? "dark.0" : "black"}>{educationStats.siswa.sma}</Text>
              </Group>
              
              <Card withBorder radius="md" p="md" mt="md">
                <Group justify="space-between">
                  <Text fw={500} c={dark ? "dark.0" : "black"}>Jumlah Lembaga Pendidikan</Text>
                  <Text fw={700} c={dark ? "dark.0" : "black"}>{educationStats.sekolah.jumlah}</Text>
                </Group>
                <Group justify="space-between" mt="sm">
                  <Text fw={500} c={dark ? "dark.0" : "black"}>Jumlah Tenaga Pengajar</Text>
                  <Text fw={700} c={dark ? "dark.0" : "black"}>{educationStats.sekolah.guru}</Text>
                </Group>
              </Card>
            </Stack>
          </Card>
        </GridCol>
      </Grid>

      <Grid gutter="md">
        {/* Beasiswa Desa */}
        <GridCol span={{ base: 12, lg: 6 }}>
          <Card withBorder radius="md" p="lg" bg={dark ? "dark.8" : "darmasaba-blue.0"}>
            <Group justify="space-between" align="center">
              <Stack gap={0}>
                <Text size="sm" c={dark ? "dark.3" : "dimmed"}>Beasiswa Desa</Text>
                <Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>Penerima: {scholarshipData.penerima}</Text>
              </Stack>
              <ThemeIcon variant="light" color="darmasaba-success" size="xl" radius="xl">
                <IconAward size={24} />
              </ThemeIcon>
            </Group>
            <Text mt="md" c={dark ? "dark.0" : "black"}>Dana Tersalurkan: <Text span fw={700}>{scholarshipData.dana}</Text></Text>
            <Text mt="sm" c={dark ? "dark.3" : "dimmed"}>Tahun Ajaran: {scholarshipData.tahunAjaran}</Text>
          </Card>
        </GridCol>

        {/* Kalender Event Budaya */}
        <GridCol span={{ base: 12, lg: 6 }}>
          <Card withBorder radius="md" p="lg">
            <Title order={3} mb="md" c={dark ? "dark.0" : "black"}>Kalender Event Budaya</Title>
            <List spacing="sm">
              {culturalEvents.map((event, index) => (
                <List.Item key={index} icon={
                  <ThemeIcon color="darmasaba-blue" size={24} radius="xl">
                    <IconCalendarEvent size={12} />
                  </ThemeIcon>
                }>
                  <Group justify="space-between">
                    <Text fw={500} c={dark ? "dark.0" : "black"}>{event.nama}</Text>
                    <Text size="sm" c={dark ? "dark.3" : "dimmed"}>{event.lokasi}</Text>
                  </Group>
                  <Text size="sm" c={dark ? "dark.3" : "dimmed"}>{event.tanggal}</Text>
                </List.Item>
              ))}
            </List>
          </Card>
        </GridCol>
      </Grid>
    </Stack>
  );
};

export default SosialPage;