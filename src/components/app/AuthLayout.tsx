import { View, ScrollView, StatusBar, StyleSheet, Image, Dimensions, ImageBackground } from 'react-native';
import React, { useMemo } from 'react';
import useTheme from '../../styles/theme';
import ParentView from './ParentView';
import { Text } from '../../utils/elements';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AuthLayoutProps {
  onBackPress?: () => void;
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  backButton?: boolean;
}

const AuthLayout = ({
  title,
  children,
  subtitle,
}: AuthLayoutProps) => {
  const { styles, theme } = useStyles();
  
  return (
    <ParentView
      style={styles.container}
      edges={['bottom']}
      stableLayout={false}
    >
      <StatusBar backgroundColor={theme.colors.PRIMARY} barStyle="light-content" />
      
      <ImageBackground 
        source={require('../../assets/icons/frame.png')}
        style={styles.topSection}
      >
        <Image 
          source={require('../../assets/icons/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </ImageBackground>

      <View style={styles.cardContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {children}
          </View>
        </ScrollView>
      </View>
    </ParentView>
  );
};

export default AuthLayout;

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        backgroundColor: colors.BACKGROUND,
        flex: 1,
      },
      topSection: {
        backgroundColor: colors.PRIMARY,
        height: SCREEN_HEIGHT * 0.38,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: sizes.PADDING,
      },
      logo: {
        width: 100,
        height: 100,
        marginBottom: 5,
        tintColor: colors.WHITE,
      },
      title: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: 28,
        color: colors.WHITE,
        textTransform: 'uppercase',
        marginTop: 5,
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: 14,
        color: colors.WHITE,
        marginTop: 5,
        opacity: 0.9,
      },
      cardContainer: {
        flex: 1,
        marginTop: -50, 
      },
      scrollContainer: {
        flex: 1,
      },
      contentContainer: {
        flexGrow: 1,
        paddingHorizontal: sizes.PADDING,
        paddingBottom: sizes.PADDING,
      },
      card: {
        backgroundColor: colors.WHITE,
        borderRadius: 20,
        padding: sizes.PADDING,
        shadowColor: colors.BLACK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        minHeight: 300,
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
