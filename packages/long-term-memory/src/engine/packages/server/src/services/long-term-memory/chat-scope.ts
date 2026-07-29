import type { LtmMode, LtmScope } from "../../../../shared/src/features/agents/long-term-memory/schema.js";
import {
  ltmModeForChatMode as sharedLtmModeForChatMode,
  withMergedLtmScopeLinks,
} from "../../../../shared/src/features/agents/long-term-memory/scope.js";
import { uniqueStrings } from "./ltm-utils.js";

export function normalizeLtmChatCharacterIds(value: unknown) {
  if (Array.isArray(value)) return uniqueStrings(value.filter((id): id is string => typeof id === "string"));
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? uniqueStrings(parsed.filter((id): id is string => typeof id === "string"))
      : value.trim() ? [value.trim()] : [];
  } catch {
    return value.trim() ? [value.trim()] : [];
  }
}

export function ltmModeForChatMode(mode: unknown): LtmMode {
  return sharedLtmModeForChatMode(mode);
}

export function ltmChatLabel(chat: { name?: string | null; branch?: { title: string | null } | null }) {
  return chat.branch?.title?.trim() || chat.name?.trim() || "Untitled branch";
}

export function resolveChatLtmScope(chat: {
  id: string;
  groupId?: string | null;
  personaId?: string | null;
  characterIds?: unknown;
  branch?: { parentChatId: string | null } | null;
}) {
  const characterIds = normalizeLtmChatCharacterIds(chat.characterIds);
  return withMergedLtmScopeLinks(
    {
      chatId: chat.id,
      ...(!chat.branch?.parentChatId && chat.groupId ? { groupId: chat.groupId } : {}),
      ...(chat.personaId ? { personaId: chat.personaId } : {}),
      ...(characterIds.length ? { characterIds } : {}),
    },
    { chatIds: [chat.id] },
  ) satisfies LtmScope;
}
