import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useMemo } from 'react';
import useTheme from '../../styles/theme';
import { Text } from '../../utils/elements';

interface TabItem {
  id: string;
  title: string;
}

interface GroupTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

const GroupTabs = ({ tabs, activeTab, onTabPress }: GroupTabsProps) => {
  const { styles, theme } = useStyles();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
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
        paddingLeft: theme.sizes.PADDING,
      },
      tab: {
        backgroundColor: colors.LIGHT_GRAY,
        borderRadius: 10,
        paddingHorizontal: sizes.WIDTH * 0.04,
        alignItems: 'center',
        justifyContent: 'center',
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
