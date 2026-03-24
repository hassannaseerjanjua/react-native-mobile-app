import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import { isAndroid, isRTL, scaleWithMax } from '../../utils';
import { Text } from '../../utils/elements';
import { SvgWalletGifteeIcon } from '../../assets/icons';
import PriceWithIcon from '../global/Price';
import { useLocaleStore } from '../../store/reducer/locale';

interface WalletCardProps {
  balance: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance }) => {
  const theme = useTheme();
  const { getString } = useLocaleStore();

  const styles = useMemo(() => {
    const { colors, sizes, fonts } = theme;
    const { isRtl } = useLocaleStore();
    return StyleSheet.create({
      container: {
        backgroundColor: colors.SECONDARY,
        borderRadius: sizes.BORDER_RADIUS_MID,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: sizes.PADDING * 0.9,
        paddingVertical: sizes.PADDING,
      },
      leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,

      },
      logoContainer: {
        backgroundColor: colors.PRIMARY,
        width: scaleWithMax(50, 60),
        height: scaleWithMax(50, 60),
        borderRadius: sizes.BORDER_RADIUS_HIGH,
        justifyContent: 'center',
        alignItems: 'center',
      },
      logoText: {
        color: colors.WHITE,
        fontFamily: fonts.semibold,
        fontSize: scaleWithMax(20, 24),
      },
      walletName: {
        fontFamily: fonts.semibold,
        fontSize: sizes.FONTSIZE_LESS_HIGH,
        color: colors.BLACK,
        marginLeft: scaleWithMax(10, 12),
        flex: 1,
      },
      balanceSection: {
        alignItems: 'flex-end',
      },
      balanceLabel: {
        fontFamily: fonts.regular,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.BLACK,
      },
      balanceAmount: {
        fontFamily: fonts.bold,
        fontSize: scaleWithMax(22, 24),
        color: colors.BLACK,
        marginTop: isAndroid ? sizes.HEIGHT * -0.005 : 0,
      },
      riyalIconContainer: {
        flexDirection: isRtl ? 'row-reverse' : 'row',
        alignItems: 'center',
      },
      riyalIcon: {
        marginTop: sizes.HEIGHT * 0.005,
        marginRight: sizes.WIDTH * 0.005,
      },
    });
  }, [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.logoContainer}>
          <SvgWalletGifteeIcon />
        </View>
        <Text style={styles.walletName}>{getString('W_GIFTEE_WALLET')}</Text>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>{getString('W_WALLET_BALANCE')}</Text>
        <PriceWithIcon
          amount={balance}
          textStyle={styles.balanceAmount}
          containerStyle={styles.riyalIconContainer}
        />
      </View>
    </View>
  );
};

export default WalletCard;
