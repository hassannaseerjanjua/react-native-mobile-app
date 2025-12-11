import React, { useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';
import { Text } from '../../utils/elements';

interface ConfirmationModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onbtn2Press?: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title = 'Confirm',
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onbtn2Press,
  loading = false,
}) => {
  const { styles, theme } = useStyles();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onbtn2Press || onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.WHITE} size="small" />
              ) : (
                <Text style={styles.confirmText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      container: {
        backgroundColor: colors.WHITE,
        borderRadius: 16,
        padding: sizes.PADDING,
        width: '85%',
        maxWidth: 400,
      },
      title: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: 20,
        color: colors.PRIMARY_TEXT,
        marginBottom: sizes.HEIGHT * 0.015,
        textAlign: 'center',
      },
      message: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
        marginBottom: sizes.HEIGHT * 0.03,
        textAlign: 'center',
        lineHeight: 22,
      },
      buttonContainer: {
        flexDirection: 'row',
        gap: sizes.PADDING * 0.75,
      },
      button: {
        flex: 1,
        paddingVertical: sizes.HEIGHT * 0.015,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
      },
      cancelButton: {
        backgroundColor: colors.LIGHT_GRAY,
      },
      confirmButton: {
        backgroundColor: colors.PRIMARY,
      },
      cancelText: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: 16,
        color: colors.PRIMARY_TEXT,
      },
      confirmText: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: 16,
        color: colors.WHITE,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default ConfirmationModal;
