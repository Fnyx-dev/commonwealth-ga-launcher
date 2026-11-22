import type { ClientPatchId, PatchSettings } from './types';

export const CLIENT_PATCH_IDS = [
  'high-fps-movement-stability',
  'adaptive-client-performance',
  'render-command-signal',
  'foot-placement-off',
  'combat-text-shadows-off',
  'physx-multithread'
] as const satisfies readonly ClientPatchId[];

export type ClientPatchPreferenceKey = Exclude<keyof PatchSettings, 'gameClientPatch'>;

export const CLIENT_PATCH_PREFERENCE_KEYS: Record<ClientPatchId, ClientPatchPreferenceKey> = {
  'high-fps-movement-stability': 'highFpsMovementStability',
  'adaptive-client-performance': 'adaptiveClientPerformance',
  'render-command-signal': 'renderCommandSignal',
  'foot-placement-off': 'footPlacementOff',
  'combat-text-shadows-off': 'combatTextShadowsOff',
  'physx-multithread': 'physxMultithread'
};

/**
 * Patches implemented by the Game Client Patch DLL. The launcher only writes their on/off line to
 * [Commonwealth.ClientPatch] in TgEngine.ini; the DLL reads it at game start.
 */
export const CLIENT_DLL_PATCH_SETTING_KEYS = {
  'render-command-signal': 'RenderCommandSignal',
  'foot-placement-off': 'FootPlacementOff',
  'combat-text-shadows-off': 'CombatTextShadowsOff',
  'physx-multithread': 'PhysXWorkerThreads'
} as const satisfies Partial<Record<ClientPatchId, string>>;

export type ClientDllPatchId = keyof typeof CLIENT_DLL_PATCH_SETTING_KEYS;

/**
 * What the DLL does when a patch's line is missing or invalid. Must match the DLL's defaults.
 * Damage-number shadows are opt-in because the outline keeps numbers readable.
 */
export const CLIENT_DLL_PATCH_DEFAULTS: Record<ClientDllPatchId, boolean> = {
  'render-command-signal': true,
  'foot-placement-off': true,
  'combat-text-shadows-off': false,
  'physx-multithread': true
};

/**
 * Lines that hold a count instead of 1/0. Any positive count is on (the DLL caps it), 0 or less is
 * off. Turning one on writes `onValue` only when no positive count is set, so a hand-tuned count
 * survives the launcher's writes.
 */
export const CLIENT_DLL_PATCH_COUNTS: Partial<Record<ClientDllPatchId, { onValue: string }>> = {
  'physx-multithread': { onValue: '4' }
};

export const CLIENT_DLL_PATCH_SECTION = 'Commonwealth.ClientPatch';

/** Mirrors the DLL's parsing: true or false for a valid value, null when it falls back to the default. */
export function clientDllPatchValueState(id: ClientDllPatchId, value: string | undefined): boolean | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (CLIENT_DLL_PATCH_COUNTS[id]) {
    if (!/^[+-]?\d+$/.test(trimmed)) return null;
    return Number.parseInt(trimmed, 10) > 0;
  }
  if (trimmed === '1') return true;
  if (trimmed === '0') return false;
  return null;
}

/** The value the launcher writes for a choice. */
export function clientDllPatchValue(id: ClientDllPatchId, enabled: boolean): string {
  if (!enabled) return '0';
  return CLIENT_DLL_PATCH_COUNTS[id]?.onValue ?? '1';
}

export function isClientPatchId(value: unknown): value is ClientPatchId {
  return typeof value === 'string' && (CLIENT_PATCH_IDS as readonly string[]).includes(value);
}

export function isClientDllPatchId(id: ClientPatchId): id is ClientDllPatchId {
  return Object.prototype.hasOwnProperty.call(CLIENT_DLL_PATCH_SETTING_KEYS, id);
}
