import { createFileRoute } from "@tanstack/react-router";
import { VoiceLabPage } from "@/components/assistant/voice-lab/voice-lab-page";
import { protectedRouteMiddleware } from "../../middleware/authMiddleware";

// `ai-assistant_` (garis bawah) = bukan anak rute /admin/ai-assistant, jadi tidak perlu <Outlet/> di sana.
export const Route = createFileRoute("/admin/ai-assistant_/voice-lab")({
	beforeLoad: protectedRouteMiddleware,
	component: VoiceLabPage,
});
