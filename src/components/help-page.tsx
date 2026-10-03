import { Box, Container, Grid, Stack, Text, Title } from "@mantine/core";
import { IconBook, IconFileText, IconVideo } from "@tabler/icons-react";
import { useState } from "react";
import { AssistantEmbedded } from "@/components/assistant/assistant-embedded";
import { HelpContactCard } from "@/components/help/help-contact-card";
import type {
	HelpArticle,
	HelpVideo,
} from "@/components/help/help-content.types";
import { HelpDocModal } from "@/components/help/help-doc-modal";
import { HelpFaqCard } from "@/components/help/help-faq-card";
import { HelpGuideModal } from "@/components/help/help-guide-modal";
import { HelpListCard } from "@/components/help/help-list-card";
import { userHelpPalette } from "@/components/help/help-palette";
import { HelpStatsGrid } from "@/components/help/help-stats-grid";
import { HelpVideoModal } from "@/components/help/help-video-modal";
import { useHelpContent } from "@/components/help/use-help-content";
import { useIsDark } from "@/hooks/useIsDark";
import { useTranslate } from "@/hooks/useTranslate";

const HelpPage = () => {
	const t = useTranslate();
	const dark = useIsDark();
	const palette = userHelpPalette(dark);
	const { guideItems, videoItems, documentationItems, stats } =
		useHelpContent();

	const [selectedGuide, setSelectedGuide] = useState<HelpArticle | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);
	const [selectedDoc, setSelectedDoc] = useState<HelpArticle | null>(null);

	return (
		<Container size="lg" py="xl">
			<Title order={1} mb="xl" ta="center">
				{t.help.pusatBantuan}
			</Title>
			<Text size="lg" ta="center" mb="xl" {...palette.dimmedText}>
				{t.help.subtitle}
			</Text>

			<HelpStatsGrid stats={stats} palette={palette} />

			<Stack gap="lg">
				<Box>
					<Grid gutter="lg" justify="center">
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpListCard
								title={t.help.panduanMemulai}
								icon={<IconBook size={24} color="white" />}
								items={guideItems}
								secondary={(item) => item.description}
								onSelect={setSelectedGuide}
								palette={palette}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpListCard
								title={t.help.videoTutorial}
								icon={<IconVideo size={24} color="white" />}
								items={videoItems}
								secondary={(item) => item.duration}
								onSelect={setSelectedVideo}
								palette={palette}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpFaqCard title={t.help.faq} palette={palette} />
						</Grid.Col>
					</Grid>
				</Box>

				<Box>
					<Grid>
						<Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
							<HelpListCard
								title={t.help.dokumentasi}
								icon={<IconFileText size={24} color="white" />}
								items={documentationItems}
								secondary={(item) => item.description}
								onSelect={setSelectedDoc}
								palette={palette}
							/>
						</Grid.Col>
						<Grid.Col span={{ base: 12, sm: 12, md: 8 }}>
							<HelpContactCard
								title={t.help.kontakDukungan}
								dark={dark}
								palette={palette}
							/>
						</Grid.Col>

						{/* Asisten AI — panel yang sama dengan FAB, mode tertanam */}
						<Grid.Col span={12}>
							<AssistantEmbedded />
						</Grid.Col>
					</Grid>
				</Box>
			</Stack>

			<HelpGuideModal
				guide={selectedGuide}
				onClose={() => setSelectedGuide(null)}
				badge={t.help.panduanBadge}
				closeLabel={t.help.tutup}
			/>
			<HelpVideoModal
				video={selectedVideo}
				onClose={() => setSelectedVideo(null)}
				badge={t.help.videoTutorial}
				durationLabel={t.help.durasi}
				closeLabel={t.help.tutup}
			/>
			<HelpDocModal
				doc={selectedDoc}
				onClose={() => setSelectedDoc(null)}
				badge={t.help.dokumentasi}
				closeLabel={t.help.tutup}
				palette={palette}
			/>
		</Container>
	);
};

export default HelpPage;
