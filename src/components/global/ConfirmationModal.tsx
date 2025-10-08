import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';

interface ConfirmationModalProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
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
  loading = false,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

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
              onPress={onCancel}
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

const createStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.colors.WHITE,
      borderRadius: 16,
      padding: 24,
      width: '85%',
      maxWidth: 400,
    },
    title: {
      fontFamily: fonts.Quicksand.bold,
      fontSize: 20,
      color: theme.colors.PRIMARY_TEXT,
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      fontFamily: fonts.Quicksand.regular,
      fontSize: 16,
      color: theme.colors.PRIMARY_TEXT,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    cancelButton: {
      backgroundColor: theme.colors.LIGHT_GRAY,
    },
    confirmButton: {
      backgroundColor: theme.colors.PRIMARY,
    },
    cancelText: {
      fontFamily: fonts.Quicksand.semibold,
      fontSize: 16,
      color: theme.colors.PRIMARY_TEXT,
    },
    confirmText: {
      fontFamily: fonts.Quicksand.semibold,
      fontSize: 16,
      color: theme.colors.WHITE,
    },
  });

export default ConfirmationModal;
