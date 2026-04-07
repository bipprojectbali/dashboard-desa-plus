import { Paper, Title, Progress, Stack, Text, Group, Box, type MantineColor } from '@mantine/core'
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react'
import { APBDes, APBDesItem } from '../types/apbdes'

interface SummaryProps {
  title: string
  data: APBDesItem[]
  icon?: React.ReactNode
}

function Summary({ title, data, icon }: SummaryProps) {
  if (!data || data.length === 0) return null

  const totalAnggaran = data.reduce((sum, i) => sum + i.anggaran, 0)
  
  // Hitung total realisasi dari realisasiItems (konsisten dengan RealisasiTable)
  const totalRealisasi = data.reduce((sum, i) => {
    if (i.realisasiItems && i.realisasiItems.length > 0) {
      return sum + i.realisasiItems.reduce((sumReal, real) => sumReal + (real.jumlah || 0), 0)
    }
    return sum
  }, 0)

  const persentase = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka)
  }

  const getProgressColor = (persen: number) => {
    if (persen >= 100) return 'teal'
    if (persen >= 80) return 'blue'
    if (persen >= 60) return 'yellow'
    return 'red'
  }

  const getStatusMessage = (persen: number) => {
    if (persen >= 100) {
      return { text: 'Realisasi mencapai 100% dari anggaran', color: 'teal' }
    }
    if (persen >= 80) {
      return { text: 'Realisasi baik, mendekati target', color: 'blue' }
    }
    if (persen >= 60) {
      return { text: 'Realisasi cukup, perlu ditingkatkan', color: 'yellow' }
    }
    return { text: 'Realisasi rendah, perlu perhatian khusus', color: 'red' }
  }

  const statusMessage = getStatusMessage(persentase)

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          {icon}
          <Text fw={700} fz="md" c="gray.8">{title}</Text>
        </Group>
        <Group gap="xs">
          {persentase >= 100 ? (
            <IconArrowUpRight 
              size={18} 
              color="var(--mantine-color-teal-7)" 
              stroke={2.5}
            />
          ) : persentase < 60 ? (
            <IconArrowDownRight 
              size={18} 
              color="var(--mantine-color-red-7)" 
              stroke={2.5}
            />
          ) : null}
          <Text 
            fw={700} 
            fz="lg" 
            c={getProgressColor(persentase)}
            style={{ 
              minWidth: 60,
              textAlign: 'right',
            }}
          >
            {persentase.toFixed(1)}%
          </Text>
        </Group>
      </Group>

      <Text fz="xs" c="gray.6" mb="sm" lh={1.5}>
        Realisasi: <Text component="span" fw={700} c="blue.9">{formatRupiah(totalRealisasi)}</Text>
        {' '}/ Anggaran: <Text component="span" fw={700} c="gray.7">{formatRupiah(totalAnggaran)}</Text>
      </Text>

      <Progress
        value={persentase}
        size="xl"
        radius="xl"
        color={getProgressColor(persentase)}
        striped={persentase < 100}
        animated={persentase < 100}
        mb="xs"
      />

      <Text 
        fz="xs" 
        c={statusMessage.color as MantineColor} 
        fw={600}
        style={{ 
          backgroundColor: `var(--mantine-color-${statusMessage.color}-0)`,
          padding: '6px 10px',
          borderRadius: 6,
          display: 'inline-block',
        }}
      >
        {persentase >= 100 && '✓ '}{statusMessage.text}
      </Text>
    </Box>
  )
}

interface GrafikRealisasiProps {
  apbdesData: APBDes
}

export default function GrafikRealisasi({ apbdesData }: GrafikRealisasiProps) {
  const items = apbdesData?.items || []
  const tahun = apbdesData?.tahun || new Date().getFullYear()

  const pendapatan = items.filter((i: APBDesItem) => i.tipe === 'pendapatan')
  const belanja = items.filter((i: APBDesItem) => i.tipe === 'belanja')
  const pembiayaan = items.filter((i: APBDesItem) => i.tipe === 'pembiayaan')

  return (
    <Paper
      withBorder
      p="lg"
      radius="lg"
      shadow="sm"
      style={{
        transition: 'box-shadow 0.3s ease',
        ':hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
      h={"100%"}
    >
      <Title
        order={5}
        mb="lg"
        c="blue.9"
        fz={{ base: '1rem', md: '1.1rem' }}
        fw={700}
      >
        GRAFIK REALISASI APBDes {tahun}
      </Title>

      <Stack gap="xl">
        <Summary
          title="Pendapatan"
          data={pendapatan}
          icon={
            <Box 
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--mantine-color-green-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fz="lg">💰</Text>
            </Box>
          }
        />
        
        <Summary
          title="Belanja"
          data={belanja}
          icon={
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--mantine-color-red-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fz="lg">💸</Text>
            </Box>
          }
        />
        
        <Summary
          title="Pembiayaan"
          data={pembiayaan}
          icon={
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--mantine-color-orange-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text fz="lg">📊</Text>
            </Box>
          }
        />
      </Stack>
    </Paper>
  )
}
