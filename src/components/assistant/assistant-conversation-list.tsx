import {
	ActionIcon,
	Button,
	Group,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSnapshot } from "valtio";
import {
	assistantStore,
	setAssistantError,
	startNewConversation,
} from "@/store/assistant";
import type { AssistantConversationDto } from "@/types/ai-assistant-chat";
import {
	deleteConversation,
	fetchConversations,
	renameConversation,
} from "./assistant.api";
import { useAssistantText } from "./use-assistant-access";
import { CONVERSATIONS_KEY } from "./use-assistant-chat";

/** Daftar percakapan milik user (☰): berhalaman cursor, buka, ganti judul, hapus. */
export function AssistantConversationList({
	onOpen,
}: {
	onOpen: (id: string) => Promise<void>;
}) {
	const text = useAssistantText();
	const queryClient = useQueryClient();
	const { conversationId } = useSnapshot(assistantStore);
	const [editing, setEditing] = useState<{ id: string; title: string } | null>(
		null,
	);
	const [confirmId, setConfirmId] = useState<string | null>(null);

	const query = useInfiniteQuery({
		queryKey: CONVERSATIONS_KEY,
		queryFn: ({ pageParam }) => fetchConversations(pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (last) => last.nextCursor ?? undefined,
	});
	const items: AssistantConversationDto[] =
		query.data?.pages.flatMap((p) => p.items) ?? [];

	const refresh = () =>
		queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
	const run = async (action: () => Promise<unknown>) => {
		try {
			await action();
		} catch {
			// Error detail tidak ditampilkan; pesan ramah cukup.
			setAssistantError(text.errors.loadFailed);
		} finally {
			await refresh();
		}
	};

	const saveTitle = () => {
		if (!editing?.title.trim()) return;
		const { id, title } = editing;
		void run(async () => {
			await renameConversation(id, title);
			setEditing(null);
		});
	};

	const remove = (id: string) =>
		run(async () => {
			await deleteConversation(id);
			setConfirmId(null);
			if (id === assistantStore.conversationId) startNewConversation();
		});

	return (
		<ScrollArea style={{ flex: 1, minHeight: 0 }} px="md" py="sm">
			<Stack gap="xs">
				<Button size="xs" variant="light" onClick={startNewConversation}>
					{text.newConversation}
				</Button>
				{query.isError ? (
					<Text size="sm" c="red">
						{text.errors.loadFailed}
					</Text>
				) : null}
				{query.isSuccess && items.length === 0 ? (
					<Text size="sm" c="dimmed">
						{text.noConversations}
					</Text>
				) : null}
				{items.map((c) =>
					editing?.id === c.id ? (
						<Group key={c.id} gap={4} wrap="nowrap">
							<TextInput
								size="xs"
								style={{ flex: 1 }}
								value={editing.title}
								aria-label={text.rename}
								maxLength={60}
								onChange={(e) =>
									setEditing({ id: c.id, title: e.currentTarget.value })
								}
								onKeyDown={(e) => e.key === "Enter" && saveTitle()}
							/>
							<ActionIcon
								size="sm"
								variant="subtle"
								aria-label={text.save}
								onClick={saveTitle}
							>
								<IconCheck size={14} />
							</ActionIcon>
							<ActionIcon
								size="sm"
								variant="subtle"
								color="gray"
								aria-label={text.cancel}
								onClick={() => setEditing(null)}
							>
								<IconX size={14} />
							</ActionIcon>
						</Group>
					) : (
						<Group key={c.id} gap={4} wrap="nowrap">
							<UnstyledButton
								style={{ flex: 1, minWidth: 0 }}
								onClick={() => void onOpen(c.id)}
								aria-current={c.id === conversationId}
							>
								<Text
									size="sm"
									fw={c.id === conversationId ? 700 : 400}
									truncate
								>
									{c.title}
								</Text>
							</UnstyledButton>
							{confirmId === c.id ? (
								<Button
									size="compact-xs"
									color="red"
									variant="light"
									onClick={() => void remove(c.id)}
								>
									{text.confirmDelete}
								</Button>
							) : (
								<>
									<ActionIcon
										size="sm"
										variant="subtle"
										color="gray"
										aria-label={text.rename}
										onClick={() => setEditing({ id: c.id, title: c.title })}
									>
										<IconPencil size={14} />
									</ActionIcon>
									<ActionIcon
										size="sm"
										variant="subtle"
										color="red"
										aria-label={text.delete}
										onClick={() => setConfirmId(c.id)}
									>
										<IconTrash size={14} />
									</ActionIcon>
								</>
							)}
						</Group>
					),
				)}
				{query.hasNextPage ? (
					<Button
						size="xs"
						variant="subtle"
						loading={query.isFetchingNextPage}
						onClick={() => void query.fetchNextPage()}
					>
						{text.loadMore}
					</Button>
				) : null}
			</Stack>
		</ScrollArea>
	);
}
