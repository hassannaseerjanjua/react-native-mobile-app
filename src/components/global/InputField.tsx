import { StyleSheet, TextInputProps, View, Platform } from 'react-native';
import React, { useMemo } from 'react';
import useTheme from '../../styles/theme';
import { scaleWithMax, rtlTextAlign, rtlPadding } from '../../utils';
import { SvgGalleryUploadIcon, SvgPhone } from '../../assets/icons';
import { Text, TextInput } from '../../utils/elements';
import { useLocaleStore } from '../../store/reducer/locale';
import ShadowView from './ShadowView';

type Props = {
  error?: any;
  icon?: any;
  style?: any;
  iconColor?: string;
  fieldProps: TextInputProps;
  isOccasion?: boolean;
  isPhone?: boolean;
  /** Skip ShadowView wrapper (e.g. when parent has shadow or shadow breaks multiline layout) */
  noShadow?: boolean;
};

const InputField = ({
  icon = null,
  error,
  iconColor,
  style,
  fieldProps,
  isPhone,
  isOccasion,
  noShadow = false,
}: Props) => {
  const { theme, styles } = useStyles();
  const { isRtl, getString } = useLocaleStore();
  const isMultiline = fieldProps.multiline;

  const content = (
    <View
      style={[
        isMultiline ? styles.textareaContainer : styles.container,
        isPhone && styles.phoneFieldLtr,
        {
          borderWidth: error ? 1 : 0,
          borderColor: error ? theme.colors.RED : theme.colors.LIGHT_GRAY,
        },
        style,
      ]}
    >
      {isPhone ? (
        <SvgPhone width={scaleWithMax(20, 25)} height={scaleWithMax(20, 25)} />
      ) : (
        icon
      )}
      {isPhone && <Text style={styles.prefixText}>{'+966'}</Text>}
      <TextInput
        {...fieldProps}
        style={[
          isMultiline ? styles.textarea : styles.input,
          {
            paddingStart: isPhone || icon ? theme.sizes.WIDTH * 0.025 : 0,
            textAlign: isPhone ? 'left' : rtlTextAlign(isRtl),
            writingDirection: isPhone ? 'ltr' : undefined,
            // includeFontPadding: isRtl && isPhone,
            ...(Platform.OS === 'ios' &&
            isRtl &&
            isPhone &&
            fieldProps.value?.length === 0
              ? { lineHeight: 23 }
              : {}),
          },
          fieldProps.style,
        ]}
        allowFontScaling={false}
        placeholderTextColor={theme.colors.SECONDARY_TEXT}
        selectionColor={theme.colors.PRIMARY}
        underlineColorAndroid="transparent"
      />
    </View>
  );

  return (
    <>
      {noShadow ? content : <ShadowView preset="input">{content}</ShadowView>}
      {isOccasion && (
        <View style={styles.galleryUploadContainer}>
          <SvgGalleryUploadIcon
            width={scaleWithMax(15, 18)}
            height={scaleWithMax(15, 18)}
          />
          <Text style={styles.galleryUploadText}>
            {getString('COMP_UPLOAD')}
          </Text>
        </View>
      )}
      {!!error && (
        <Text
          style={[
            styles.error,
            {
              textAlign: 'left',
            },
          ]}
        >
          {error}
        </Text>
      )}
    </>
  );
};

export default InputField;

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes, globalStyles, fonts } = theme;
    return StyleSheet.create({
      container: {
        ...globalStyles.BUTTON_TAB_TFIELD_HEIGHT,
        width: '100%',
        borderRadius: sizes.BORDER_RADIUS,
        flexDirection: 'row',
        paddingHorizontal: sizes.PADDING * 0.8,
        alignItems: 'center',
        backgroundColor: colors.WHITE,
      },
      phoneFieldLtr: {
        direction: 'ltr',
      },
      textareaContainer: {
        width: '100%',
        minHeight: scaleWithMax(120, 140),
        borderRadius: sizes.BORDER_RADIUS,
        flexDirection: 'row',
        paddingHorizontal: sizes.PADDING,
        paddingVertical: sizes.PADDING,
        alignItems: 'flex-start',
        backgroundColor: colors.WHITE,
      },
      input: {
        ...globalStyles.TEXT_STYLE,
        fontFamily: fonts.regular,
        flex: 1,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        paddingVertical: 0,
        paddingHorizontal: 0,
        ...(Platform.OS === 'android' ? { height: '100%' } : {}),
      },
      textarea: {
        ...globalStyles.TEXT_STYLE,
        fontFamily: fonts.regular,
        flex: 1,
        minHeight: scaleWithMax(100, 120),
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        paddingVertical: 0,
        paddingHorizontal: 0,
        textAlignVertical: 'top',
      },
      image: {
        width: sizes.ICON * 0.5,
        height: sizes.ICON * 0.5,
        marginRight: sizes.PADDING,
      },
      error: {
        color: theme.colors.RED,
        fontSize: 12,
        fontFamily: theme.globalStyles.TEXT_STYLE.fontFamily,
        position: 'absolute',
        top: -8,
        end: 6,
        backgroundColor: theme.colors.LIGHT_GRAY,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: theme.colors.RED,
      },
      prefixText: {
        ...globalStyles.TEXT_STYLE,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        marginStart: 8,
        writingDirection: 'ltr',
        ...(Platform.OS === 'ios' ? { marginTop: -2.5 } : {}),
      },
      galleryUploadContainer: {
        position: 'absolute',
        top: sizes.HEIGHT * 0.014,
        end: sizes.WIDTH * 0.02,
        backgroundColor: theme.colors.WHITE,
        padding: sizes.PADDING * 0.2,
        paddingHorizontal: sizes.PADDING * 0.4,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      galleryUploadText: {
        ...theme.globalStyles.TEXT_STYLE,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: theme.colors.PRIMARY,
        marginStart: 4,
      },
    });
  }, [theme]);

  return {
    styles,
    theme,
  };
};
