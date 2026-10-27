export function toUpdate(fields: Record<string, unknown>) {
  const $set: Record<string, unknown> = {};
  const $unset: Record<string, ''> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) $unset[key] = '';
    else $set[key] = value;
  }
  return Object.keys($unset).length ? { $set, $unset } : { $set };
}
