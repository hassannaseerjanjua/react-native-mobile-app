import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import useTheme from '../../styles/theme';
import fonts from '../../assets/fonts';
import { isAndroid, scaleWithMax } from '../../utils';
import { Text } from '../../utils/elements';
import { SvgRiyalIcon, SvgWalletGifteeIcon } from '../../assets/icons';

interface WalletCardProps {
  balance: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ balance }) => {
  const theme = useTheme();

  const styles = useMemo(() => {
    const { colors, sizes } = theme;

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
        fontFamily: fonts.Quicksand.semibold,
        fontSize: scaleWithMax(20, 24),
      },
      walletName: {
        fontFamily: fonts.Quicksand.semibold,
        fontSize: sizes.FONTSIZE_LESS_HIGH,
        color: colors.BLACK,
        marginLeft: scaleWithMax(10, 12),
        flex: 1,
      },
      balanceSection: {
        alignItems: 'flex-end',
      },
      balanceLabel: {
        fontFamily: fonts.Quicksand.regular,
        fontSize: sizes.FONTSIZE_MEDIUM,
        color: colors.BLACK,
      },
      balanceAmount: {
        fontFamily: fonts.Quicksand.bold,
        fontSize: scaleWithMax(22, 24),
        color: colors.BLACK,
        marginTop: isAndroid ? sizes.HEIGHT * -0.005 : 0,
      },
      riyalIconContainer: {
        flexDirection: 'row',
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
        <Text style={styles.walletName}>Giftee Wallet</Text>
      </View>

      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Wallet balance</Text>
        <View style={styles.riyalIconContainer}>
          <SvgRiyalIcon style={styles.riyalIcon} />
          <Text style={styles.balanceAmount}>{balance}</Text>
        </View>
      </View>
    </View>
  );
};

export default WalletCard;
