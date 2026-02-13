import { useState } from "react";
import { 
  Card, 
  Grid, 
  GridCol, 
  Group, 
  Text, 
  Title, 
  Button, 
  Badge, 
  Table, 
  Stack,
  Select,
  useMantineColorScheme
} from "@mantine/core";
import { IconBuildingStore, IconCategory, IconCurrency, IconUsers } from "@tabler/icons-react";

const BumdesPage = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  
  const [timeFilter, setTimeFilter] = useState<string>("bulan");
  
  // Sample data for KPI cards
  const kpiData = [
    {
      title: "UMKM Aktif",
      value: 45,
      icon: <IconUsers size={24} />,
      color: "darmasaba-blue",
    },
    {
      title: "UMKM Terdaftar",
      value: 68,
      icon: <IconBuildingStore size={24} />,
      color: "darmasaba-success",
    },
    {
      title: "Omzet",
      value: "Rp 48.000.000",
      icon: <IconCurrency size={24} />,
      color: "darmasaba-warning",
    },
    {
      title: "Kategori UMKM",
      value: 34,
      icon: <IconCategory size={24} />,
      color: "darmasaba-danger",
    },
  ];

  // Sample data for top products
  const topProducts = [
    {
      rank: 1,
      name: "Beras Premium Organik",
      umkmOwner: "Warung Pak Joko",
      growth: "+12%",
    },
    {
      rank: 2,
      name: "Keripik Singkong",
      umkmOwner: "Ibu Sari Snack",
      growth: "+8%",
    },
    {
      rank: 3,
      name: "Madu Alami",
      umkmOwner: "Peternakan Lebah",
      growth: "+5%",
    },
  ];

  // Sample data for product sales
  const productSales = [
    {
      produk: "Beras Premium Organik",
      penjualanBulanIni: "Rp 8.500.000",
      bulanLalu: "Rp 8.500.000",
      trend: 10,
      volume: "650 Kg",
      stok: "850 Kg",
    },
    {
      produk: "Keripik Singkong",
      penjualanBulanIni: "Rp 4.200.000",
      bulanLalu: "Rp 3.800.000",
      trend: 10,
      volume: "320 Kg",
      stok: "120 Kg",
    },
    {
      produk: "Madu Alami",
      penjualanBulanIni: "Rp 3.750.000",
      bulanLalu: "Rp 4.100.000",
      trend: -8,
      volume: "150 Liter",
      stok: "45 Liter",
    },
    {
      produk: "Kecap Tradisional",
      penjualanBulanIni: "Rp 2.800.000",
      bulanLalu: "Rp 2.500.000",
      trend: 12,
      volume: "280 Botol",
      stok: "95 Botol",
    },
  ];

  return (
    <Stack gap="lg">
      {/* KPI Cards */}
      <Grid gutter="md">
        {kpiData.map((kpi, index) => (
          <GridCol key={index} span={{ base: 12, sm: 6, md: 3 }}>
            <Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
              <Group justify="space-between" align="center">
                <Stack gap={0}>
                  <Text size="sm" c={dark ? "dark.3" : "dimmed"}>
                    {kpi.title}
                  </Text>
                  <Text size="xl" fw={700} c={dark ? "dark.0" : "black"}>
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                  </Text>
                </Stack>
                <Badge 
                  variant="light" 
                  color={kpi.color}
                  p={8}
                  radius="md"
                >
                  {kpi.icon}
                </Badge>
              </Group>
            </Card>
          </GridCol>
        ))}
      </Grid>

      {/* Update Penjualan Produk Header */}
      <Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
        <Group justify="space-between" align="center" px="md" py="xs">
          <Title order={3} c={dark ? "dark.0" : "black"}>
            Update Penjualan Produk
          </Title>
          <Group>
            <Button
              variant={timeFilter === "minggu" ? "filled" : "light"}
              onClick={() => setTimeFilter("minggu")}
              color="darmasaba-blue"
            >
              Minggu ini
            </Button>
            <Button
              variant={timeFilter === "bulan" ? "filled" : "light"}
              onClick={() => setTimeFilter("bulan")}
              color="darmasaba-blue"
            >
              Bulan ini
            </Button>
          </Group>
        </Group>
      </Card>

      <Grid gutter="md">
        {/* Produk Unggulan (Left Column) */}
        <GridCol span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            {/* Total Penjualan, Produk Aktif, Total Transaksi */}
            <Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text size="sm" c={dark ? "dark.3" : "dimmed"}>Total Penjualan</Text>
                  <Text size="lg" fw={700} c={dark ? "dark.0" : "black"}>Rp 28.500.000</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c={dark ? "dark.3" : "dimmed"}>Produk Aktif</Text>
                  <Text size="lg" fw={700} c={dark ? "dark.0" : "black"}>124 Produk</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c={dark ? "dark.3" : "dimmed"}>Total Transaksi</Text>
                  <Text size="lg" fw={700} c={dark ? "dark.0" : "black"}>1.240 Transaksi</Text>
                </Group>
              </Stack>
            </Card>

            {/* Top 3 Produk Terlaris */}
            <Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
              <Title order={4} mb="md" c={dark ? "dark.0" : "black"}>Top 3 Produk Terlaris</Title>
              <Stack gap="sm">
                {topProducts.map((product) => (
                  <Group key={product.rank} justify="space-between" align="center">
                    <Group gap="sm">
                      <Badge 
                        variant="filled" 
                        color={product.rank === 1 ? "gold" : product.rank === 2 ? "gray" : "bronze"}
                        radius="xl"
                        size="lg"
                      >
                        {product.rank}
                      </Badge>
                      <Stack gap={0}>
                        <Text fw={500} c={dark ? "dark.0" : "black"}>{product.name}</Text>
                        <Text size="sm" c={dark ? "dark.3" : "dimmed"}>{product.umkmOwner}</Text>
                      </Stack>
                    </Group>
                    <Badge 
                      variant="light" 
                      color={product.growth.startsWith('+') ? "green" : "red"}
                    >
                      {product.growth}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Card>
          </Stack>
        </GridCol>

        {/* Detail Penjualan Produk (Right Column) */}
        <GridCol span={{ base: 12, lg: 8 }}>
          <Card p="md" radius="md" withBorder bg={dark ? "#141D34" : "white"} style={{ borderColor: dark ? "#141D34" : "white" }}>
            <Group justify="space-between" mb="md">
              <Title order={4} c={dark ? "dark.0" : "black"}>Detail Penjualan Produk</Title>
              <Select
                placeholder="Filter kategori"
                data={[
                  { value: 'semua', label: 'Semua Kategori' },
                  { value: 'makanan', label: 'Makanan' },
                  { value: 'minuman', label: 'Minuman' },
                  { value: 'kerajinan', label: 'Kerajinan' },
                ]}
                defaultValue="semua"
                w={200}
              />
            </Group>
            
            <Table striped highlightOnHover withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th><Text c={dark ? "white" : "dimmed"}>Produk</Text></Table.Th>
                  <Table.Th><Text c={dark ? "white" : "dimmed"}>Penjualan Bulan Ini</Text></Table.Th>
                  <Table.Th><Text c={dark ? "white" : "dimmed"}>Bulan Lalu</Text></Table.Th>
                  <Table.Th><Text c={dark ? "white" : "dimmed"}>Trend</Text></Table.Th>
                  <Table.Th><Text c={dark ? "white" : "dimmed"}>Volume</Text></Table.Th>
                  <Table.Th><Text c={dark ? "white" : "dimmed"}>Stok</Text></Table.Th>
                  <Table.Th><Text c={dark ? "white" : "dimmed"}>Aksi</Text></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {productSales.map((product, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Text fw={500} c={dark ? "dark.0" : "black"}>{product.produk}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz={"sm"} c={dark ? "dark.0" : "black"}>{product.penjualanBulanIni}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz={"sm"} c={dark ? "white" : "dimmed"}>{product.bulanLalu}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text c={product.trend >= 0 ? "green" : "red"}>
                          {product.trend >= 0 ? '↑' : '↓'} {Math.abs(product.trend)}%
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fz={"sm"} c={dark ? "dark.0" : "black"}>{product.volume}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge 
                        variant="light" 
                        color={parseInt(product.stok) > 200 ? "green" : "yellow"}
                      >
                        {product.stok}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button variant="subtle" size="compact-sm" color="darmasaba-blue">
                        Detail
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </GridCol>
      </Grid>
    </Stack>
  );
};

export default BumdesPage;