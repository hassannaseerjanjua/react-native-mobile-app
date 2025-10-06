import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useMemo } from 'react';
import useTheme from '../../styles/theme';

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
      },
      tab: {
        backgroundColor: colors.LIGHT_GRAY,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: sizes.HEIGHT * 0.012,
        alignItems: 'center',
        justifyContent: 'center',
      },
      activeTab: {
        backgroundColor: colors.SECONDARY,
      },
      tabHeading: {
        fontFamily: 'Quicksand-Medium',
        fontWeight: '500',
        fontSize: 16,
        textAlign: 'center',
        color: colors.PRIMARY_TEXT,
      },
      activeTabHeading: {
        color: colors.PRIMARY,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default GroupTabs;
