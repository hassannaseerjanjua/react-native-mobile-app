import {
  StyleSheet,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';
import { rtlFlexDirection, scaleWithMax } from '../../../utils';
// import { useNavigation, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import api from '../../../utils/api';
import apiEndpoints from '../../../constants/api-endpoints';
import notify from '../../../utils/notify';
import {
  VisaIcon,
  SvgSelectedCheck,
  SvgDeleteIcon,
  MasterCardIcon,
  NoonIcon,
} from '../../../assets/icons';
import CheckBox from '../../../components/global/CheckBox';
import CustomButton from '../../../components/global/Custombutton';
import CustomFooter from '../../../components/global/CustomFooter';
import ConfirmationPopup from '../../../components/global/ConfirmationPopup';
import SkeletonLoader from '../../../components/SkeletonLoader';
import { UserCard, AppStackScreen } from '../../../types/navigation.types';
import PlaceholderLogoText from '../../../components/global/PlaceholderLogoText';
// import { UserCard, AppStackScreen } from '../../../types/navigation.types';

const AddCart: React.FC<AppStackScreen<'AddCard'>> = ({ route }) => {
  const { styles, theme } = useStyles();
  const { getString, isRtl, langCode } = useLocaleStore();
  const navigation = useNavigation();
  // const route = useRoute();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const fromProfile = (route.params as any)?.fromProfile || false;

  useEffect(() => {
    fetchUserCards();
  }, []);

  const fetchUserCards = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ Data: UserCard[] }>(
        apiEndpoints.GET_CARDS,
      );

      if (response.success && response.data?.Data) {
        setCards(response.data.Data);
      } else {
        notify.error(response.error || getString('AU_ERROR_OCCURRED'));
      }
    } catch (error: any) {
      console.error('Error fetching cards:', error);
      notify.error(error?.message || getString('AU_ERROR_OCCURRED'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardToken: string) => {
    try {
      setDeletingCard(cardToken);
      const response = await api.put(apiEndpoints.DELETE_CARD, {
        userCardTokenID: cardToken,
      });

      if (response.success) {
        notify.success(getString('P_CARD_DELETED_SUCCESS'));
        // Remove card from local state
        setCards(prevCards =>
          prevCards.filter(card => card.Token !== cardToken),
        );
      } else {
        notify.error(response.error || getString('P_CARD_DELETE_FAILED'));
      }
    } catch (error: any) {
      console.error('Error deleting card:', error);
      notify.error(error?.message || getString('P_CARD_DELETE_FAILED'));
    } finally {
      setDeletingCard(null);
    }
  };

  const handleSelectCard = () => {
    if (!selectedCard) {
      notify.error(getString('P_SELECT_CARD'));
      return;
    }

    const selectedCardData = cards.find(card => card.Token === selectedCard);
    if (selectedCardData) {
      // (navigation as any).navigate('CheckOut', {
      //   selectedCard: selectedCardData,
      navigation.reset({
        index: 1,
        routes: [
          {
            name: 'BottomTabs' as never,
          },
          {
            name: 'CheckOut' as never,
            params: { selectedCard: selectedCardData } as never,
          },
        ],
      });
    }
  };

  const renderCardItem = ({ item }: { item: UserCard }) => (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        {
          ...(langCode === 'ar'
            ? { flexDirection: rtlFlexDirection(!isRtl) }
            : { flexDirection: rtlFlexDirection(isRtl) }),
          marginBottom: theme.sizes.HEIGHT * 0.005,
        },
      ]}
      activeOpacity={0.7}
      onPress={() =>
        !fromProfile &&
        setSelectedCard(selectedCard === item.Token ? null : item.Token)
      }
      disabled={fromProfile}
    >
      <View
        style={{
          ...styles.row,
          flex: 1,
          gap: theme.sizes.WIDTH * 0.03,
          ...(langCode === 'ar'
            ? { flexDirection: rtlFlexDirection(!isRtl) }
            : { flexDirection: rtlFlexDirection(isRtl) }),
        }}
      >
        {!fromProfile && (
          <CheckBox
            Selected={selectedCard === item.Token}
            onSelectionPress={() =>
              setSelectedCard(selectedCard === item.Token ? null : item.Token)
            }
          />
        )}
        {item.Brand?.toLowerCase().includes('master') ? (
          <MasterCardIcon
            height={scaleWithMax(32, 35)}
            width={scaleWithMax(32, 35)}
          />
        ) : item.Brand?.toLowerCase().includes('noon') ? (
          <NoonIcon
            height={scaleWithMax(32, 35)}
            width={scaleWithMax(32, 35)}
          />
        ) : (
          <VisaIcon
            height={scaleWithMax(32, 35)}
            width={scaleWithMax(32, 35)}
          />
        )}
        <View>
          <Text style={styles.cardNumber}>{item.CardNumber}</Text>
          <Text style={styles.cardBrand}>{item.Brand}</Text>
        </View>
      </View>

      {fromProfile ? (
        <TouchableOpacity
          onPress={() => setCardToDelete(item.Token)}
          disabled={deletingCard === item.Token}
          style={{ padding: theme.sizes.PADDING * 0.2 }}
        >
          {deletingCard === item.Token ? (
            <ActivityIndicator size="small" color={theme.colors.PRIMARY} />
          ) : (
            <SvgDeleteIcon
              width={scaleWithMax(20, 22)}
              height={scaleWithMax(20, 22)}
            />
          )}
        </TouchableOpacity>
      ) : (
        <SvgSelectedCheck
          width={scaleWithMax(16, 18)}
          height={scaleWithMax(16, 18)}
          style={{ opacity: selectedCard === item.Token ? 1 : 0 }}
        />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <PlaceholderLogoText text={getString('NO_CARDS_FOUND')} />
    </View>
  );

  return (
    <ParentView>
      <HomeHeader
        title={
          fromProfile
            ? getString('P_MANAGE_CARDS')
            : getString('CHECKOUT_CHANGE_CARD')
        }
        showBackButton
      />
      <View style={{ flex: 1 }}>
        {loading ? (
          <SkeletonLoader screenType="cards" />
        ) : (
          <FlatList
            data={cards}
            renderItem={renderCardItem}
            keyExtractor={item => item.Token}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      {!loading && cards.length > 0 && !fromProfile && (
        <CustomFooter>
          <CustomButton
            title={getString('P_SELECT_CARD_BUTTON')}
            onPress={handleSelectCard}
            disabled={!selectedCard}
          />
        </CustomFooter>
      )}

      <ConfirmationPopup
        visible={cardToDelete !== null}
        title={getString('P_DELETE_CARD')}
        message={getString('P_DELETE_CARD_MESSAGE')}
        confirmText={getString('P_DELETE_CARD_CONFIRM')}
        cancelText={getString('NG_CANCEL') || 'Cancel'}
        onConfirm={async () => {
          if (cardToDelete) {
            await handleDeleteCard(cardToDelete);
            setCardToDelete(null);
          }
        }}
        onCancel={() => setCardToDelete(null)}
      />
    </ParentView>
  );
};

export default AddCart;

const styles = StyleSheet.create({});
