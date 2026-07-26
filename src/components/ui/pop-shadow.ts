/**
 * Builds the design system's signature flat "pop" shadow: a hard offset with
 * zero blur, like a sticker cut from paper. RN 0.76+ supports `boxShadow` as
 * a real (non-web-only) style prop, so this is a plain style value rather
 * than a layered-view hack.
 *
 * Uses the CSS-string form rather than the object-array form: `TextStyle`
 * (used by `TextInput`, via react-native-web's typings) only accepts a
 * string for `boxShadow`, while `ViewStyle` accepts either — the string form
 * is the one that works everywhere.
 */
export function popShadow(offset: number, color: string): { boxShadow: string } {
  return { boxShadow: `${offset}px ${offset}px 0px 0px ${color}` };
}
