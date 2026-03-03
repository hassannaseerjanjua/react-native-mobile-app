const fonts = {
  Quicksand: {
    regular: 'Quicksand-Regular',
    medium: 'Quicksand-Medium',
    bold: 'Quicksand-Bold',
    semibold: 'Quicksand-SemiBold',
    light: 'Quicksand-Light',
  },
  Tajawal: {
    regular: 'Tajawal-Regular',
    medium: 'Tajawal-Medium',
    bold: 'Tajawal-Bold',
    light: 'Tajawal-Light',
    black: 'Tajawal-Black',
    extraBold: 'Tajawal-ExtraBold',
    extraLight: 'Tajawal-ExtraLight',
  },
};

/** Language-aware font set: use Tajawal for Arabic, Quicksand otherwise */
export const getFontsForLanguage = (isArabic: boolean) =>
  isArabic
    ? {
        regular: fonts.Tajawal.regular,
        medium: fonts.Tajawal.medium,
        semibold: fonts.Tajawal.bold,
        bold: fonts.Tajawal.extraBold,
        light: fonts.Tajawal.light,
      }
    : fonts.Quicksand;

export default fonts;
