import { StyleSheet } from 'react-native';
import { useColors } from '../../../styles/colors';
import useTheme from '../../../styles/theme';

export const createStyles = () => {
  const colors = useColors();
  const theme = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: colors.RED,
    },
    contentContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingVertical: 10,
      justifyContent: 'space-between', // ✅ let content flow naturally
    },
    logoContainer: {
      alignItems: 'center',
      // backgroundColor: colors.RED,
      paddingTop: 40,
      // marginBottom: 40, // ✅ adds spacing between logo and fields
    },
    logo: {
      width: 150,
      height: 150,
      resizeMode: 'contain', // ✅ keep proportions
    },
    headerContainer: {
      marginBottom: 30,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.PRIMARY_TEXT,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      color: colors.PRIMARY_TEXT,
      // textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      // backgroundColor: colors.RED,
      marginBottom: 25,
      padding: 4,
      gap: 5,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: colors.GRAY,
    },
    activeTab: {
      backgroundColor: colors.SECONDARY,
      shadowColor: colors.BLACK,
    },
    tabText: {
      fontSize: 14,
      color: colors.SECONDARY_TEXT,
      fontWeight: '500',
    },
    activeTabText: {
      color: colors.PRIMARY_TEXT,
      fontWeight: '500',
    },
    formContainer: {
      flex: 1,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.PRIMARY_TEXT,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.GRAY,
      borderRadius: 8,
      padding: 15,
      fontSize: 16,
      backgroundColor: colors.GRAY,
    },
    linkContainer: {
      textAlign: 'center',
      color: colors.SECONDARY_TEXT,
    },
    link: {
      color: colors.PRIMARY,
      textDecorationLine: 'underline',
      fontSize: 15,
      fontWeight: '600',
    },
  });
};
