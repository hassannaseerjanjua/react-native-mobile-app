import { View, ScrollView, StatusBar, StyleSheet } from 'react-native';
import React, { useMemo } from 'react';
import { SvgLogoBlue } from '../../assets/icons';
import AuthHeader from '../global/AuthHeader';
import { isAndroidThen, scaleWithMax } from '../../utils';
import useTheme from '../../styles/theme';
import ParentView from './ParentView';
import { Text } from '../../utils/elements';

interface AuthLayoutProps {
  onBackPress: () => void;
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  backButton?: boolean;
}

const AuthLayout = ({
  onBackPress,
  title,
  children,
  subtitle,
  backButton = true,
}: AuthLayoutProps) => {
  const { styles, theme } = useStyles();
  return (
    <ParentView
      style={styles.container}
      edges={['bottom', 'left', 'right', 'top']}
      stableLayout={false}
    >
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <AuthHeader
        onBackPress={onBackPress}
        showBackButton={backButton}
        spaceTaken={!backButton}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.logoContainer}>
          <SvgLogoBlue width={theme.sizes.APP_LOGO} />
        </View>

        <View style={styles.mainContent}>
          <View>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {children}
        </View>
      </ScrollView>
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
        padding: sizes.PADDING,
        paddingVertical: isAndroidThen(sizes.PADDING, 0),
        flex: 1,
      },
      scrollContainer: {
        flex: 1,
        overflow: 'visible',
      },
      contentContainer: {
        flexGrow: 1,
        // overflow: 'visible',
      },
      logoContainer: {
        alignItems: 'center',
        marginBottom: scaleWithMax(50, 55),
      },

      mainContent: {
        flex: 1,
      },

      title: {
        ...theme.globalStyles.TEXT_STYLE_BOLD,
        fontSize: sizes.FONTSIZE_HEADING,
        color: colors.PRIMARY_TEXT,
      },
      subtitle: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: theme.sizes.FONTSIZE_HIGH,
        marginTop: scaleWithMax(10, 15),
        marginBottom: scaleWithMax(10, 15),
      },
    });
  }, [theme]);

  return {
    theme,
    styles,
  };
};
