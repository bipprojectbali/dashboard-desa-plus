import { Box, Container, Grid, Stack, Text, Title } from "@mantine/core";
import { IconBook, IconFileText, IconVideo } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AssistantEmbedded } from "@/components/assistant/assistant-embedded";
import {
	adminDocumentationItems,
	adminGuideItems,
	adminHelpStats,
	adminVideoItems,
} from "@/components/help/admin-help-content";
import { AdminHelpFaqCard } from "@/components/help/admin-help-faq-card";
import { AdminHelpSupportCard } from "@/components/help/admin-help-support-card";
import type {
	HelpArticle,
	HelpVideo,
} from "@/components/help/help-content.types";
import { HelpDocModal } from "@/components/help/help-doc-modal";
import { HelpGuideModal } from "@/components/help/help-guide-modal";
import { HelpListCard } from "@/components/help/help-list-card";
import { adminHelpPalette } from "@/components/help/help-palette";
import { HelpStatsGrid } from "@/components/help/help-stats-grid";
import { HelpVideoModal } from "@/components/help/help-video-modal";
import { useIsDark } from "@/hooks/useIsDark";

export const Route = createFileRoute("/admin/help")({
	component: AdminHelpPage,
});

function AdminHelpPage() {
	const palette = adminHelpPalette(useIsDark());

	const [selectedGuide, setSelectedGuide] = useState<HelpArticle | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);
	const [selectedDoc, setSelectedDoc] = useState<HelpArticle | null>(null);

	return (
		<Container size="lg" py="xl">
			<Title order={1} c={"orange"} variant="light" mb="xs" ta="center">
				Pusat Bantuan Admin
			</Title>
			<Text size="lg" c="dimmed" ta="center" mb="xl">
				Panduan dan referensi teknis untuk administrator sistem Dashboard Desa
			</Text>

			<HelpStatsGrid stats={adminHelpStats} palette={palette} />

			<Stack gap="lg">
				<Box>
					<Grid gutter="lg" justify="center">
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpListCard
								title="Panduan Admin"
								icon={<IconBook size={24} color="white" />}
								items={adminGuideItems}
								secondary={(item) => item.description}
								onSelect={setSelectedGuide}
								palette={palette}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpListCard
								title="Video Tutorial"
								icon={<IconVideo size={24} color="white" />}
								items={adminVideoItems}
								secondary={(item) => item.duration}
								onSelect={setSelectedVideo}
								palette={palette}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<AdminHelpFaqCard palette={palette} />
						</Grid.Col>
					</Grid>
				</Box>

				<Box>
					<Grid>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<AdminHelpSupportCard palette={palette} />
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpListCard
								title="Dokumentasi Teknis"
								icon={<IconFileText size={24} color="white" />}
								items={adminDocumentationItems}
								secondary={(item) => item.description}
								onSelect={setSelectedDoc}
								palette={palette}
							/>
						</Grid.Col>

						{/* Asisten AI — panel yang sama dengan FAB, mode tertanam */}
						<Grid.Col span={{ base: 12, md: 4 }}>
							<AssistantEmbedded />
						</Grid.Col>
					</Grid>
				</Box>
			</Stack>

			<HelpGuideModal
				guide={selectedGuide}
				onClose={() => setSelectedGuide(null)}
				badge="Panduan Admin"
				closeLabel="Tutup"
			/>
			<HelpVideoModal
				video={selectedVideo}
				onClose={() => setSelectedVideo(null)}
				badge="Video Tutorial"
				durationLabel="Durasi"
				closeLabel="Tutup"
			/>
			<HelpDocModal
				doc={selectedDoc}
				onClose={() => setSelectedDoc(null)}
				badge="Dokumentasi"
				closeLabel="Tutup"
				palette={palette}
			/>
		</Container>
	);
}
