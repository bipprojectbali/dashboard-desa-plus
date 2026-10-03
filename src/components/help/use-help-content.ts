import { useTranslate } from "@/hooks/useTranslate";
import type { HelpArticle, HelpStat, HelpVideo } from "./help-content.types";

// URL placeholder bersama untuk semua video tutorial sampai video asli tersedia.
const TUTORIAL_VIDEO_URL = "https://www.youtube.com/embed/dQw4w9WgXcQ";

/** Konten statis halaman `/bantuan` (panduan, video, dokumentasi, statistik) sesuai bahasa aktif. */
export function useHelpContent() {
	const t = useTranslate();

	const guideItems: HelpArticle[] = [
		{
			title: t.help.guideCaraLoginTitle,
			description: t.help.guideCaraLoginDesc,
			content: t.help.guideCaraLoginContent,
		},
		{
			title: t.help.guideNavTitle,
			description: t.help.guideNavDesc,
			content: t.help.guideNavContent,
		},
		{
			title: t.help.guideFiturTitle,
			description: t.help.guideFiturDesc,
			content: t.help.guideFiturContent,
		},
		{
			title: t.help.guideTipsTitle,
			description: t.help.guideTipsDesc,
			content: t.help.guideTipsContent,
		},
	];

	const videoItems: HelpVideo[] = [
		{
			title: t.help.videoDashboardTitle,
			duration: "5:23",
			url: TUTORIAL_VIDEO_URL,
		},
		{
			title: t.help.videoAnalisisTitle,
			duration: "8:45",
			url: TUTORIAL_VIDEO_URL,
		},
		{
			title: t.help.videoLaporanTitle,
			duration: "6:12",
			url: TUTORIAL_VIDEO_URL,
		},
		{
			title: t.help.videoExportTitle,
			duration: "4:30",
			url: TUTORIAL_VIDEO_URL,
		},
	];

	const documentationItems: HelpArticle[] = [
		{
			title: t.help.docApiTitle,
			description: t.help.docApiDesc,
			content: t.help.docApiContent,
		},
		{
			title: t.help.docIntegrasiTitle,
			description: t.help.docIntegrasiDesc,
			content: t.help.docIntegrasiContent,
		},
		{
			title: t.help.docFormatTitle,
			description: t.help.docFormatDesc,
			content: t.help.docFormatContent,
		},
		{
			title: t.help.docBestTitle,
			description: t.help.docBestDesc,
			content: t.help.docBestContent,
		},
	];

	const stats: HelpStat[] = [
		{ value: "150+", label: t.help.artikelPanduan },
		{ value: "50+", label: t.help.videoTutorial },
		{ value: "24/7", label: t.help.supportAktif },
	];

	return { guideItems, videoItems, documentationItems, stats };
}
