import { Keyboard, StyleSheet, View } from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';

import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import {
  DummyLocationSvg,
  GiftPlacedSvg,
  LocationArrowSvg,
} from '../../../assets/icons';
import InputField from '../../../components/global/InputField';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../../components/global/Custombutton';
import SuccessMessage from '../../../components/global/SuccessComponent';
import { StackActions, useNavigation } from '@react-navigation/native';
import { scaleWithMax } from '../../../utils';
import { Text } from '../../../utils/elements';
import { useLocaleStore } from '../../../store/reducer/locale';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const LocationSelection: React.FC = () => {
  const { styles, theme } = useStyles();
  const { getString } = useLocaleStore();
  const initialValues = {
    address: '',
  };
  const [giftPlaced, setGiftPlaced] = useState(false);
  const navigation = useNavigation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        address: Yup.string().required(getString('LOCATION_ADDRESS_REQUIRED')),
      }),
    [getString],
  );

  const snapPoints = useMemo(() => ['15%', '50%', '75%'], []);

  // Handle keyboard events to expand bottom sheet
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', () => {
      bottomSheetRef.current?.snapToIndex(2); // Expand to 75%
    });
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      bottomSheetRef.current?.snapToIndex(1); // Return to 50%
    });

    // For Android, use different event names
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      bottomSheetRef.current?.snapToIndex(2); // Expand to 75%
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      bottomSheetRef.current?.snapToIndex(1); // Return to 50%
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  // Handle bottom sheet changes to dismiss keyboard on swipe down
  const handleSheetChanges = (index: number) => {
    if (index < 2) {
      // If sheet is collapsed or at middle position, dismiss keyboard
      Keyboard.dismiss();
    }
  };

  return !giftPlaced ? (
    <ParentView>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <HomeHeader title={getString('LOCATION_SELECT_LOCATION')} showBackButton />
          <View style={{ flex: 1, position: 'relative' }}>
            <DummyLocationSvg
              width={theme.sizes.WIDTH}
              height={theme.sizes.HEIGHT}
              style={{ position: 'absolute', zIndex: 0 }}
            />
          </View>

          <BottomSheet
            ref={bottomSheetRef}
            index={1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            keyboardBehavior="extend"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            onChange={handleSheetChanges}
            handleIndicatorStyle={{
              backgroundColor: theme.colors?.SECONDARY_GRAY,
              width: scaleWithMax(30, 35),
              height: scaleWithMax(4, 6),
            }}
            handleStyle={{
              borderTopLeftRadius: scaleWithMax(24, 30),
              borderTopRightRadius: scaleWithMax(24, 30),
              backgroundColor: theme.colors?.BACKGROUND || '#FFFFFF',
            }}
            backgroundStyle={{
              backgroundColor: theme.colors?.BACKGROUND || '#FFFFFF',
            }}
          >
            <BottomSheetScrollView
              style={{ flex: 1, paddingHorizontal: theme.sizes.PADDING }}
              contentContainerStyle={{ paddingBottom: theme.sizes.PADDING * 2 }}
            >
              <View style={styles.bottomSheetContainer}>
                <View style={{ position: 'absolute', top: -80, zIndex: 5000 }}>
                  <View style={styles.locationCircle}>
                    <LocationArrowSvg />
                  </View>
                </View>
                <Text style={styles.bottomSheetHeading}>{getString('LOCATION_DELIVERY_LOCATION')}</Text>
                <Text style={styles.bottomSheetDescription}>
                  1107.5 KM. Gulshan - e - Maymar 1107.5 KM. Gulshan - e -
                  Maymar
                </Text>
                <View
                  style={{
                    ...theme.globalStyles.BORDER_BOTTOM_NORMAL,
                    marginVertical: theme.sizes.PADDING * 0.6,
                  }}
                />

                <Text style={styles.bottomSheetHeading}>{getString('LOCATION_ADDRESS_DETAILS')}</Text>
                <Text style={styles.bottomSheetDescription}>
                  {getString('LOCATION_ADDRESS_DETAILS_MESSAGE')}
                </Text>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={() => setGiftPlaced(true)}
                  enableReinitialize={true}
                >
                  {formik => (
                    <View
                      style={{
                        position: 'relative',
                        marginTop: theme.sizes.HEIGHT * 0.01,
                      }}
                    >
                      <InputField
                        error={
                          formik.touched.address && formik.errors.address
                            ? formik.errors.address
                            : undefined
                        }
                        style={{
                          marginTop: theme.sizes.PADDING * 0.7,
                          marginBottom: theme.sizes.PADDING,
                          backgroundColor: theme.colors.WHITE,
                        }}
                        fieldProps={{
                          placeholder: getString('LOCATION_ADDRESS_PLACEHOLDER'),
                          value: formik.values.address,
                          onChangeText: (value: string) => {
                            formik.setFieldValue('address', value);
                          },
                          autoCapitalize: 'words',
                        }}
                      />
                      <CustomButton
                        title={getString('LOCATION_DONE')}
                        onPress={() => formik.submitForm()}
                      />
                    </View>
                  )}
                </Formik>
              </View>
            </BottomSheetScrollView>
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    </ParentView>
  ) : (
    <SuccessMessage
      SuccessLogo={<GiftPlacedSvg />}
      SuccessSubMessage={getString('LOCATION_STORE_CONTACT_SHORTLY')}
      SuccessMessage={getString('LOCATION_ORDER_PLACED')}
      primaryButtonTitle={getString('CHECKOUT_HOME')}
      onPrimaryPress={() => navigation.dispatch(StackActions.popToTop())}
    />
  );
};

export default LocationSelection;

const styles = StyleSheet.create({});
