import { Container, Grid, Title, Text, SimpleGrid, Box, Accordion, Stack, useMantineColorScheme } from '@mantine/core';
import { HelpCard } from '@/components/ui/help-card';
import { IconBook, IconVideo, IconHelpCircle, IconMessage, IconFileText, IconHeadphones } from '@tabler/icons-react';
import { useState } from 'react';

const HelpPage = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  // Sample data for sections
  const guideItems = [
    { title: 'Cara Login', description: 'Langkah-langkah untuk login ke dashboard' },
    { title: 'Navigasi Dashboard', description: 'Penjelasan tentang tata letak dan navigasi' },
    { title: 'Fitur Dasar', description: 'Panduan penggunaan fitur-fitur utama' },
    { title: 'Tips & Trik', description: 'Tips untuk meningkatkan produktivitas' },
  ];

  const videoItems = [
    { title: 'Dashboard Overview', duration: '5:23' },
    { title: 'Analisis Data', duration: '8:45' },
    { title: 'Membuat Laporan', duration: '6:12' },
    { title: 'Export Data', duration: '4:30' },
  ];

  const faqItems = [
    { question: 'Bagaimana cara reset password?', answer: 'Anda dapat mereset password melalui halaman login dengan klik "Lupa Password"' },
    { question: 'Apakah saya bisa mengakses data offline?', answer: 'Saat ini aplikasi hanya dapat diakses secara online' },
    { question: 'Berapa lama waktu respon support?', answer: 'Tim support kami biasanya merespon dalam waktu kurang dari 24 jam' },
    { question: 'Bagaimana cara menambahkan pengguna baru?', answer: 'Fitur penambahan pengguna dapat ditemukan di menu Pengaturan > Manajemen Pengguna' },
  ];

  const documentationItems = [
    { title: 'API Reference', description: 'Dokumentasi lengkap untuk integrasi API' },
    { title: 'Integrasi Sistem', description: 'Cara mengintegrasikan dengan sistem eksternal' },
    { title: 'Format Data', description: 'Spesifikasi format data yang didukung' },
    { title: 'Best Practices', description: 'Praktik terbaik dalam penggunaan platform' },
  ];

  const stats = [
    { value: '150+', label: 'Artikel Panduan' },
    { value: '50+', label: 'Video Tutorial' },
    { value: '24/7', label: 'Support Aktif' },
  ];

  // State for chat functionality
  const [messages, setMessages] = useState([
    { id: 1, text: 'Halo! Saya Jenna, asisten virtual Anda. Bagaimana saya bisa membantu hari ini?', sender: 'jenna' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate Jenna's response after delay
    setTimeout(() => {
      const jennaResponse = {
        id: messages.length + 2,
        text: 'Terima kasih atas pertanyaan Anda. Saat ini saya adalah versi awal dari asisten virtual. Tim kami sedang mengembangkan kemampuan saya lebih lanjut.',
        sender: 'jenna'
      };
      setMessages(prev => [...prev, jennaResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl" ta="center">Pusat Bantuan</Title>
      <Text size="lg" color="dimmed" ta="center" mb="xl">
        Temukan jawaban untuk pertanyaan Anda atau hubungi tim support kami
      </Text>

      {/* Statistics Section */}
      <SimpleGrid cols={3} spacing="lg" mb="xl">
        {stats.map((stat, index) => (
          <HelpCard key={index} bg={dark ? "#141D34" : "white"} p="lg" style={{ textAlign: 'center', borderColor: dark ? "#141D34" : "white" }} h="100%" >
            <Text size="xl" fw={700} style={{ fontSize: '32px' }}>{stat.value}</Text>
            <Text size="sm" color="dimmed">{stat.label}</Text>
          </HelpCard>
        ))}
      </SimpleGrid>

      <Stack gap="lg">
        <Box>
          <Grid gutter="lg" justify="center">
            {/* Panduan Memulai */}
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <HelpCard style={{ borderColor: dark ? "#141D34" : "white" }} bg={dark ? "#141D34" : "white"} icon={<IconBook size={24} />} title="Panduan Memulai" h="100%">
                <Box>
                  {guideItems.map((item, index) => (
                    <Box key={index} py="sm" style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => alert(`Navigasi ke ${item.title}`)}>
                      <Text fw={500}>{item.title}</Text>
                      <Text size="sm" color="dimmed">{item.description}</Text>
                    </Box>
                  ))}
                </Box>
              </HelpCard>
            </Grid.Col>

            {/* Video Tutorial */}
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <HelpCard style={{ borderColor: dark ? "#141D34" : "white" }} bg={dark ? "#141D34" : "white"} icon={<IconVideo size={24} />} title="Video Tutorial" h="100%">
                <Box>
                  {videoItems.map((item, index) => (
                    <Box key={index} py="sm" style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => alert(`Buka video: ${item.title}`)}>
                      <Text fw={500}>{item.title}</Text>
                      <Text size="sm" color="dimmed">{item.duration}</Text>
                    </Box>
                  ))}
                </Box>
              </HelpCard>
            </Grid.Col>

            {/* FAQ */}
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <HelpCard style={{ borderColor: dark ? "#141D34" : "white" }} bg={dark ? "#141D34" : "white"} icon={<IconHelpCircle size={24} />} title="FAQ" h="100%">
                <Accordion variant="separated" >
                  {faqItems.map((item, index) => (
                    <Accordion.Item style={{ backgroundColor: dark ? "#263852ff" : "#F1F5F9" }} key={index} value={`faq-${index}`}>
                      <Accordion.Control>{item.question}</Accordion.Control>
                      <Accordion.Panel>
                        <Text size="sm">{item.answer}</Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </HelpCard>
            </Grid.Col>
          </Grid>
        </Box>

        <Box>
          <Grid>
            {/* Hubungi Support */}
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <HelpCard style={{ borderColor: dark ? "#141D34" : "white" }} bg={dark ? "#141D34" : "white"} icon={<IconHeadphones size={24} />} title="Hubungi Support" h="100%">
                <Box>
                  <Text fw={500}>Email</Text>
                  <Text size="sm" color="dimmed" mb="md"><a href="mailto:support@example.com">support@example.com</a></Text>

                  <Text fw={500}>WhatsApp</Text>
                  <Text size="sm" color="dimmed" mb="md"><a href="https://wa.me/1234567890">+62 123 456 7890</a></Text>

                  <Text fw={500}>Jam Kerja</Text>
                  <Text size="sm" color="dimmed">Senin - Jumat, 09:00 - 17:00 WIB</Text>

                  <Text fw={500} mt="md">Waktu Respon</Text>
                  <Text size="sm" color="dimmed">Rata-rata 2-4 jam kerja</Text>
                </Box>
              </HelpCard>
            </Grid.Col>

            {/* Dokumentasi */}
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <HelpCard style={{ borderColor: dark ? "#141D34" : "white" }} bg={dark ? "#141D34" : "white"} icon={<IconFileText size={24} />} title="Dokumentasi" h="100%">
                <Box>
                  {documentationItems.map((item, index) => (
                    <Box key={index} py="sm" style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => alert(`Navigasi ke dokumentasi: ${item.title}`)}>
                      <Text fw={500}>{item.title}</Text>
                      <Text size="sm" color="dimmed">{item.description}</Text>
                    </Box>
                  ))}
                </Box>
              </HelpCard>
            </Grid.Col>

            {/* Jenna - Virtual Assistant */}
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <HelpCard style={{ borderColor: dark ? "#141D34" : "white" }} bg={dark ? "#141D34" : "white"} icon={<IconMessage size={24} />} title="Jenna - Virtual Assistant" h="100%">
                <Box style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
                  <Box style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', maxHeight: '200px' }}>
                    {messages.map((msg) => (
                      <Box
                        key={msg.id}
                        style={{
                          alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                          backgroundColor: msg.sender === 'user' ? dark ? "#263852ff" : "#F1F5F9" : dark ? "#263852ff" : "#F1F5F9",
                          color: msg.sender === 'user' ? dark ? "#F1F5F9" : "#263852ff" : dark ? "#F1F5F9" : "#263852ff",
                          padding: '8px 12px',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          maxWidth: '80%'
                        }}
                      >
                        {msg.text}
                      </Box>
                    ))}
                  </Box>

                  <Box style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ketik pesan Anda..."
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                      }}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || inputValue.trim() === ''}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Kirim
                    </button>
                  </Box>
                </Box>
              </HelpCard>
            </Grid.Col>
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
};

export default HelpPage;