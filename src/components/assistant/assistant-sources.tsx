import { Anchor, Group, Text } from "@mantine/core";
import { fillTemplate, sourceItems } from "./assistant.logic";
import { useAssistantText } from "./use-assistant-access";

/**
 * Baris "Sumber: <modul>". Modul yang punya target di registry penunjuk bisa
 * diklik untuk menunjuk kartunya langsung di layar — tanpa memanggil AI.
 */
export function AssistantSources({
	toolsUsed,
	allowed,
	onPoint,
}: {
	toolsUsed: readonly string[];
	allowed: readonly string[];
	onPoint: (targetId: string) => void;
}) {
	const text = useAssistantText();
	const items = sourceItems(toolsUsed, text, allowed);
	if (items.length === 0) return null;
	return (
		<Group gap={4} wrap="wrap">
			<Text size="xs" c="dimmed">
				{text.source}:
			</Text>
			{items.map((item, i) => {
				const target = item.target;
				return (
					<Text
						key={`${item.label}-${i}`}
						size="xs"
						c="dimmed"
						component="span"
					>
						{target ? (
							<Anchor
								component="button"
								type="button"
								size="xs"
								title={fillTemplate(text.pointToSource, { modul: item.label })}
								aria-label={fillTemplate(text.pointToSource, {
									modul: item.label,
								})}
								onClick={() => onPoint(target)}
							>
								{item.label}
							</Anchor>
						) : (
							item.label
						)}
						{i < items.length - 1 ? "," : ""}
					</Text>
				);
			})}
		</Group>
	);
}
