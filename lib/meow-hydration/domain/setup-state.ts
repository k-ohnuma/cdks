export const SETUP_STATES = ["TARING", "WAITING_FOR_BOWL", "MONITORING"] as const;

export type SetupState = (typeof SETUP_STATES)[number];

const setupStateMessages: Record<SetupState, string> = {
  TARING: "ゼロ点合わせするため台に何も置かないでください。",
  WAITING_FOR_BOWL: "ゼロ点取得が完了しました。水皿を置いてください",
  MONITORING: "水皿の重量が安定しました。監視を開始します",
};

export const getSetupStateMessage = (state: SetupState): string => setupStateMessages[state];
