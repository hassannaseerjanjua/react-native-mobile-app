import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';

import useStyles from './style';
import ParentView from '../../../components/app/ParentView';
import HomeHeader from '../../../components/global/HomeHeader';
import {
  DummyLocationSvg,
  GiftPlacedSvg,
  LocationArrowSvg,
} from '../../../assets/icons';
import AppBottomSheet from '../../../components/global/AppBottomSheet';
import InputField from '../../../components/global/InputField';
import { Formik } from 'formik';
import * as Yup from 'yup';
import CustomButton from '../../../components/global/Custombutton';
import SuccessMessage from '../../../components/global/SuccessComponent';
import { useNavigation } from '@react-navigation/native';
import { scaleWithMax } from '../../../utils';
import { Text } from '../../../utils/elements';

const LocationSelection: React.FC = () => {
  const { styles, theme } = useStyles();
  // const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(true);
  const initialValues = {
    address: '',
  };
  const [giftPlaced, setGiftPlaced] = useState(false);
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    address: Yup.string().required('Address is required'),
  });
  return !giftPlaced ? (
    <ParentView>
      <HomeHeader title="Select Location" showBackButton />
      <DummyLocationSvg
        width={theme.sizes.WIDTH}
        height={theme.sizes.HEIGHT}
        style={{ zIndex: -1 }}
      />

      <AppBottomSheet
        blurAmount={0}
        blurType="light"
        height={theme.sizes.HEIGHT * 0.37}
        isOpen={!giftPlaced}
        pressBehavior="none"
        hasBackDrop={false}
        enablePanDownToClose={false}
        onClose={() => {}}
      >
        <View style={styles.bottomSheetContainer}>
          {/* Need To work in this becuase the icon is not rendering due to the bottomsheet modal being in the top of the dom */}

          <View style={{ position: 'absolute', top: -80, zIndex: 5000 }}>
            <View style={styles.locationCircle}>
              <LocationArrowSvg />
            </View>
          </View>
          {/* Need To work in this becuase the icon is not rendering due to the bottomsheet modal being in the top of the dom */}
          <Text style={styles.bottomSheetHeading}>Delivery Location</Text>
          <Text style={styles.bottomSheetDescription}>
            1107.5 KM. Gulshan - e - Maymar 1107.5 KM. Gulshan - e - Maymar
          </Text>
          <View
            style={{
              ...theme.globalStyles.BORDER_BOTTOM_NORMAL,
              marginVertical: theme.sizes.PADDING * 0.6,
            }}
          />

          <Text style={styles.bottomSheetHeading}>Address Details</Text>
          <Text style={styles.bottomSheetDescription}>
            Your Address details will be given to rider.
          </Text>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={() => setGiftPlaced(true)}
            enableReinitialize={true}
          >
            {formik => (
              <View style={{ position: 'relative' }}>
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
                    placeholder: 'Ex: villa - appartment number',
                    value: formik.values.address,
                    onChangeText: (value: string) => {
                      formik.setFieldValue('address', value);
                    },
                    autoCapitalize: 'words',
                  }}
                />
                <CustomButton
                  title="Done"
                  onPress={() => formik.submitForm()}
                />
              </View>
            )}
          </Formik>
        </View>
      </AppBottomSheet>
    </ParentView>
  ) : (
    <SuccessMessage
      SuccessLogo={<GiftPlacedSvg />}
      SuccessSubMessage="Store will contact you shortly"
      SuccessMessage="Your order has been placed"
      BtnTitle="Home"
      onPress={() => navigation.navigate('BottomTabs' as never)}
    />
  );
};

export default LocationSelection;

const styles = StyleSheet.create({});
