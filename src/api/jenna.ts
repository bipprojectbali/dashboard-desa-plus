import Elysia, { t } from "elysia";
import { apiMiddleware } from "../middleware/apiMiddleware";

const STUB_REPLY =
	"Terima kasih atas pertanyaan Anda. Saat ini saya adalah versi awal dari asisten virtual. Tim kami sedang mengembangkan kemampuan saya lebih lanjut.";

export const jennaChat = new Elysia({ prefix: "/jenna" })
	.use(apiMiddleware)
	.post(
		"/chat",
		async ({ body }) => {
			const { message: _message } = body;
			return { reply: STUB_REPLY };
		},
		{
			body: t.Object({
				message: t.String({ minLength: 1 }),
				history: t.Array(
					t.Object({
						id: t.Number(),
						text: t.String(),
						sender: t.String(),
					}),
				),
			}),
			response: {
				200: t.Object({ reply: t.String() }),
			},
			detail: { summary: "Chat dengan Jenna Virtual Assistant (stub)" },
		},
	);
