import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import {
  GiftIcon,
  RoundedBackIcon,
  SmsTrackingIcon,
} from '../../../assets/icons';
import { LinearGradient } from 'react-native-linear-gradient';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import CustomButton from '../../../components/global/Custombutton';
import { InboxOrder } from '../../../types/index';
import SkeletonLoader from '../../../components/SkeletonLoader';
import {
  useInboxOutboxActions,
  formatRelativeTime,
  getProfileImage,
  getUserName,
  getStoreName,
  getMainImage,
  getItemCount,
  getItemName,
} from './actions';
import { scaleWithMax } from '../../../utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocaleStore } from '../../../store/reducer/locale';
const InboxOutbox: React.FC = () => {
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const { getString } = useLocaleStore();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as
    | {
        title?: string;
        isInbox?: boolean;
      }
    | undefined;
  const isInbox = params?.isInbox ?? true;
  const title = params?.title ?? (isInbox ? 'Inbox' : 'Outbox');
  const { styles, theme } = useStyles();
  const { orders, isLoading, isRtl } = useInboxOutboxActions(isInbox);

  const handleItemPress = () => {
    setOpenBottomSheet(true);
  };

  const handleCloseBottomSheet = () => {
    setOpenBottomSheet(false);
  };

  const handlePickUpPress = () => {
    navigation.navigate('ScanQr' as never);
    setOpenBottomSheet(false);
  };

  const handleDeliveryPress = () => {
    navigation.navigate('LocationSelection' as never);
    setOpenBottomSheet(false);
  };

  return (
    <ParentView>
      {isInbox && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: theme.sizes.HEIGHT * 0.35,
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={['#FEECDC', '#FFFFFF']}
            locations={[0.0005, 0.8847]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              flex: 1,
              width: '100%',
            }}
          />
        </View>
      )}
      <View style={{ zIndex: 1, backgroundColor: 'transparent' }}>
        <HomeHeader
          showBackButton
          title={title}
          showSearchBar
          customContainerStyle={
            isInbox ? { backgroundColor: 'transparent' } : undefined
          }
        />
      </View>
      {isLoading ? (
        <SkeletonLoader screenType="inbox" />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={orders}
          renderItem={({ item, index }) => (
            <InboxItem
              isLast={index === orders.length - 1}
              isInbox={isInbox}
              order={item}
              isRtl={isRtl}
              onClick={isInbox ? handleItemPress : undefined}
            />
          )}
          keyExtractor={item => item.OrderId.toString()}
          ListEmptyComponent={() => (
            <View style={{ padding: theme.sizes.PADDING }}>
              <Text
                style={{
                  textAlign: 'center',
                  paddingVertical: theme.sizes.HEIGHT * 0.35,
                  color: theme.colors.SECONDARY_TEXT,
                }}
              >
                {getString('O_NO_ORDER_FOUND')}
              </Text>
            </View>
          )}
          contentContainerStyle={orders.length === 0 ? { flex: 1 } : undefined}
        />
      )}
      <AppBottomSheet
        blurAmount={100}
        isOpen={openBottomSheet}
        // fullHeight
        height={theme.sizes.HEIGHT * 0.3}
        snapPoints={['20%']}
        onClose={handleCloseBottomSheet}
      >
        <View style={styles.bottomSheet}>
          <CustomButton title="Pick Up" onPress={handlePickUpPress} />
          <CustomButton
            title="Delivery"
            type="secondary"
            onPress={handleDeliveryPress}
            buttonStyle={{ backgroundColor: theme.colors.WHITE }}
          />
        </View>
      </AppBottomSheet>
    </ParentView>
    // </LinearGradient>
  );
};

interface InboxItemProps {
  order: InboxOrder;
  isLast: boolean;
  isRtl: boolean;
  isInbox: boolean;
  onClick?: () => void;
}

const InboxItem: React.FC<InboxItemProps> = ({
  order,
  isLast,
  isRtl,
  onClick,
  isInbox,
}) => {
  const { styles, theme } = useStyles();

  const profileImage = getProfileImage(order);
  const userName = getUserName(order);
  const storeName = getStoreName(order, isRtl);
  const mainImage = getMainImage(order);
  const itemCount = getItemCount(order);
  const itemName = getItemName(order);
  const timeAgo = formatRelativeTime(order.OrderTime);

  return (
    <TouchableOpacity onPress={onClick} activeOpacity={isInbox ? 0.8 : 1}>
      <View
        style={{
          ...styles.inboxTop,
          borderBottomWidth: isLast ? 0 : 0.7,
          borderBottomColor: theme.colors.BORDER_COLOR,
        }}
      >
        <View
          style={{
            ...styles.row,
            alignItems: 'flex-start',
          }}
        >
          <Image style={styles.inboxProfile} source={profileImage} />
          <View style={{ flex: 1 }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingVertical: theme.sizes.PADDING * 0.26,
                rowGap: theme.sizes.PADDING * 0.26,
              }}
            >
              <View
                style={{
                  flex: 1,
                  ...styles.row,
                  justifyContent: 'space-between',
                }}
              >
                <Text style={styles.userNameText}>{userName}</Text>
                <Text style={styles.timeText}>{timeAgo}</Text>
              </View>
              <View
                style={{
                  flex: 1,
                  ...styles.row,
                  justifyContent: 'space-between',
                }}
              >
                <View style={styles.storeNameRow}>
                  <View style={styles.giftIconWrapper}>
                    <GiftIcon
                      height={theme.sizes.FONTSIZE}
                      width={theme.sizes.FONTSIZE}
                    />
                  </View>
                  <Text style={styles.storeNameText}>{storeName}</Text>
                  <View style={styles.backIconContainer}>
                    <RoundedBackIcon
                      height={scaleWithMax(8, 8)}
                      width={scaleWithMax(8, 8)}
                    />
                  </View>
                </View>
                <SmsTrackingIcon
                  height={scaleWithMax(18, 18)}
                  width={scaleWithMax(18, 18)}
                />
              </View>
            </View>
            <View
              style={{
                paddingVertical: theme.sizes.PADDING * 0.6,
              }}
            >
              <View style={styles.imageContainer}>
                <Image source={mainImage} style={styles.inboxImage} />
                <View style={styles.inboxImageBottom}>
                  <Text style={styles.itemNameText}>{itemName}</Text>
                  {itemCount > 0 && (
                    <View style={styles.numCircle}>
                      <Text style={styles.numText}>{itemCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default InboxOutbox;
