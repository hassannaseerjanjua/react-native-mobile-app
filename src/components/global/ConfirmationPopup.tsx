import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import useTheme from '../../styles/theme';
import CustomButton from './Custombutton';
import { Text } from '../../utils/elements';
import ShadowView from './ShadowView';

interface ConfirmationPopupProps {
  visible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  visible,
  title,
  message,
  confirmText = '',
  cancelText = '',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const { styles, theme } = useStyles();

  const handleCancel = () => {
    if (!loading) {
      onCancel();
    }
  };

  const handleBackdropPress = () => {
    if (!loading) {
      handleCancel();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => { }}>
            <ShadowView preset="default">
              <View style={styles.modalContainer}>
              {title && <Text style={styles.title}>{title}</Text>}
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttonContainer}>
                <CustomButton
                  title={cancelText || getString('COMP_CANCEL')}
                  type="secondary"'Cancel'}
                  type="secondary"
                  onPress={handleCancel}
                  disabled={loading}
                  buttonStyle={styles.cancelButton}
                />
                <CustomButton
                  title={confirmText || 'Confirm'
                  loading={loading}
                  disabled={loading}
                  buttonStyle={styles.confirmButton}
                />
              </View>
            </View>
            </ShadowView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContainer: {
        width: sizes.WIDTH * 0.85,
        backgroundColor: colors.WHITE,
        borderRadius: sizes.BORDER_RADIUS * 1.5,
        paddingVertical: sizes.PADDING * 1.2,
        paddingHorizontal: sizes.PADDING * 1.2,
        alignItems: 'center',
      },
      title: {
        ...theme.globalStyles.TEXT_STYLE_SEMIBOLD,
        fontSize: sizes.FONTSIZE_LESS_HIGH,
        color: colors.BLACK,
        marginBottom: sizes.HEIGHT * 0.015,
        textAlign: 'center',
      },
      message: {
        ...theme.globalStyles.TEXT_STYLE_MEDIUM,
        fontSize: sizes.FONTSIZE,
        color: colors.SECONDARY_TEXT,
        marginBottom: sizes.HEIGHT * 0.025,
        textAlign: 'center',
        lineHeight: sizes.FONTSIZE * 1.4,
      },
      buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        gap: sizes.WIDTH * 0.03,
      },
      confirmButton: {
        flex: 1,
        marginBottom: 0,
      },
      cancelButton: {
        flex: 1,
        marginTop: 0,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default ConfirmationPopup;
