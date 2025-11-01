import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text } from '../../utils/elements';
import { FAQ } from '../../types';
import { SvgNextIcon } from '../../assets/icons';
import useTheme from '../../styles/theme';
import { scaleWithMax, rtlTransform } from '../../utils';
import { useLocaleStore } from '../../store/reducer/locale';

interface FAQItemProps {
  item: FAQ;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const FAQItem: React.FC<FAQItemProps> = ({
  item,
  onPress,
  style,
  textStyle,
}) => {
  const { styles, theme } = useStyles();
  const { isRtl } = useLocaleStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    setIsExpanded(!isExpanded);
    onPress?.();
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.questionContainer}
      >
        <View style={styles.contentContainer}>
          <Text
            style={[styles.titleText, textStyle]}
            numberOfLines={isExpanded ? undefined : 1}
            ellipsizeMode="tail"
          >
            {item.Question}
          </Text>
        </View>
        <SvgNextIcon
          style={[
            styles.arrowIcon,
            {
              transform: [
                ...rtlTransform(isRtl),
                ...(isExpanded ? [{ rotate: isRtl ? '-90deg' : '90deg' }] : []),
              ],
            },
          ]}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{item.Answer}</Text>
        </View>
      )}
    </View>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        backgroundColor: colors.WHITE,
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
        borderRadius: 8,
      },
      questionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.sizes.PADDING,
        gap: 10,
      },
      contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        minWidth: 0,
      },
      titleText: {
        fontFamily: 'Quicksand-Medium',
        fontSize: theme.sizes.FONTSIZE_LESS_HIGH,
        color: colors.PRIMARY_TEXT,
        flex: 1,
        flexShrink: 1,
      },
      arrowIcon: {
        // Base arrow icon - RTL and rotation handled inline
      },
      answerContainer: {
        marginHorizontal: theme.sizes.PADDING,
        paddingBottom: theme.sizes.HEIGHT * 0.017,
        paddingTop: theme.sizes.HEIGHT * 0.005,
        borderTopWidth: 1,
        borderTopColor: colors.SECONDARY_GRAY,
        marginTop: scaleWithMax(8, 12),
      },
      answerText: {
        fontFamily: 'Quicksand-Regular',
        fontSize: theme.sizes.FONTSIZE,
        color: colors.PRIMARY_TEXT,
      },
    });
  }, [theme]);

  return { theme, styles };
};

export default FAQItem;
