/**
 * Common emoji / pictograph ranges (same coverage as signup username checks).
 */
export const EMOJI_CHAR_REGEX =
  /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

export const stripEmojis = (text: string): string =>
  text.replace(EMOJI_CHAR_REGEX, '');

export const containsEmoji = (text: string): boolean => {
  const re = new RegExp(EMOJI_CHAR_REGEX.source, EMOJI_CHAR_REGEX.flags);
  return re.test(text);
};
