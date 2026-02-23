import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import React, { useMemo } from 'react';
import useTheme from '../../styles/theme';
import { Text } from '../../utils/elements';
import { scaleWithMax } from '../../utils';

interface TabItem {
  id: string;
  title: string;
}

interface GroupTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  tabStyle?: ViewStyle;
}

const GroupTabs = ({
  tabs,
  activeTab,
  onTabPress,
  tabStyle,
}: GroupTabsProps) => {
  const { styles, theme } = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.scrollContainer, tabStyle]}
    >
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <Text
            style={[
              styles.tabHeading,
              activeTab === tab.id && styles.activeTabHeading,
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      scrollContainer: {
        flexDirection: 'row',
        gap: 10,
        paddingVertical: theme.sizes.HEIGHT * 0.016,
      },
      tab: {
        backgroundColor: colors.LIGHT_GRAY,
        borderRadius: 10,
        paddingHorizontal: sizes.WIDTH * 0.04,
        alignItems: 'center',
        justifyContent: 'center',
        height: scaleWithMax(40, 42),
      },
      activeTab: {
        backgroundColor: colors.SECONDARY,
      },
      tabHeading: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
      },
      activeTabHeading: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        color: colors.PRIMARY,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default GroupTabs;
