import { StyleSheet } from 'react-native';
import { useColors } from '../../../styles/colors';

export const createStyles = () => {
  const colors = useColors();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      padding: 20,
      justifyContent: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logo: {
      width: 100,
      height: 100,
    },
    headerContainer: {
      marginBottom: 0,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.PRIMARY_TEXT,
      marginTop: 20,
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
      marginVertical: 20,
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
    // Progress Bar Styles
    progressContainer: {
      marginTop: 10,
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressSubtitle: {
      fontSize: 14,
      color: colors.BLACK,
      fontWeight: '400',
    },
    progressBar: {
      width: '100%',
      height: 10,
      backgroundColor: colors.SECONDARY_GRAY,
      borderRadius: 9,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.PRIMARY,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 14,
      color: colors.SECONDARY_TEXT,
      fontWeight: '500',
    },
    // Button Container
    buttonContainer: {
      gap: 12,
      marginTop: 20,
    },
    backButton: {
      marginBottom: 10,
    },
  });
};
