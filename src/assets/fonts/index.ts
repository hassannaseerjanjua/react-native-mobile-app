const fonts = {
  Gilroy: {
    regular: 'Gilroy-Regular',
    medium: 'Gilroy-Medium',
    bold: 'Gilroy-Bold',
    semibold: 'Gilroy-SemiBold',
    light: 'Gilroy-Light',
    black: 'Gilroy-Black',
    extraBold: 'Gilroy-ExtraBold',
  },
  // Quicksand: {
  //   regular: 'Quicksand-Regular',
  //   medium: 'Quicksand-Medium',
  //   bold: 'Quicksand-Bold',
  //   semibold: 'Quicksand-SemiBold',
  //   light: 'Quicksand-Light',
  // },
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

/** Language-aware font set: use Tajawal for Arabic, Gilroy otherwise */
export const getFontsForLanguage = (isArabic: boolean) =>
  isArabic
    ? {
        regular: fonts.Tajawal.regular,
        medium: fonts.Tajawal.medium,
        semibold: fonts.Tajawal.bold,
        bold: fonts.Tajawal.extraBold,
        light: fonts.Tajawal.light,
      }
    : fonts.Gilroy;

export default fonts;
