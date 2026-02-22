import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import AppBottomSheet from './AppBottomSheet';
import CustomButton from './Custombutton';
import { useLocaleStore } from '../../store/reducer/locale';

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
  title = '',
  message,
  confirmText = '',
  cancelText = '',
  onConfirm,
  onCancel,
  onbtn2Press,
  loading = false,
}) => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();

  const handleCancel = () => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <AppBottomSheet
      isOpen={visible}
      onClose={handleCancel}
      height={theme.sizes.HEIGHT * 0.22}
      enablePanDownToClose={!loading}
    >
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <CustomButton
            title={confirmText || getString('COMP_YES')}
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            buttonStyle={{ marginBottom: theme.sizes.HEIGHT * 0.01 }}
          />
          <CustomButton
            title={cancelText || getString('COMP_CANCEL')}
            type="secondary"
            onPress={onbtn2Press || handleCancel}
            disabled={loading}
          />
        </View>
      </View>
    </AppBottomSheet>
  );
};

const useStyles = () => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

    return StyleSheet.create({
      container: {
        width: sizes.PADDED_WIDTH,
        alignSelf: 'center',
        paddingVertical: sizes.PADDING,
      },
      buttonContainer: {
        gap: sizes.HEIGHT * 0.01,
      },
    });
  }, [theme]);

  return { styles, theme };
};

export default ConfirmationModal;
