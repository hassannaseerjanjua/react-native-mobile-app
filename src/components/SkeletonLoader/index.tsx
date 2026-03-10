import React from 'react';
import { View, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { SvgNextIcon } from '../../assets/icons';
import { useLocaleStore } from '../../store/reducer/locale';
import { rtlTransform, isAndroid, isIOS, scaleWithMax } from '../../utils';
import useTheme from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type SkeletonLoaderProps = {
  screenType:
  | 'home'
  | 'wallet'
  | 'search'
  | 'sendAGift'
  | 'sendToGroup'
  | 'staticContent'
  | 'faq'
  | 'storeCard'
  | 'productListing'
  | 'orderListing'
  | 'settings'
  | 'landing'
  | 'productDetails'
  | 'tabItem'
  | 'checkout'
  | 'occasionView'
  | 'occasionList'
  | 'inbox'
  | 'giftFilters'
  | 'tabItem'
  | 'tabItemCity'
  | 'groupTabs'
  | 'cards'
  | 'notifications'
  | 'searchBar';
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ screenType }) => {
  const { isRtl } = useLocaleStore();
  const theme = useTheme();

  const getSliderHeight = () => {
    if (screenType === 'home') {
      return theme.sizes.HEIGHT * (theme.sizes.HEIGHT > 850 ? 0.29 : 0.29);
    }
    return screenHeight * 0.34;
  };

  const getTabHeight = (row: 1 | 2 | 3) => {
    if (screenType === 'home') {
      const isProMax = theme.sizes.WIDTH >= 430 && isIOS;
      const isLargeAndroid = isAndroid && theme.sizes.HEIGHT > 800;

      if (row === 1) {
        // First row: Gift One Get one
        return isProMax
          ? scaleWithMax(95, 110)
          : isLargeAndroid
            ? scaleWithMax(95, 103)
            : scaleWithMax(95, 95);
      } else if (row === 2) {
        // Second row: Catch, Send a Gift
        return isProMax
          ? scaleWithMax(85, 100)
          : isLargeAndroid
            ? scaleWithMax(85, 93)
            : scaleWithMax(85, 85);
      } else {
        // Third row: Inbox, Outbox
        return isProMax
          ? scaleWithMax(75, 90)
          : isLargeAndroid
            ? scaleWithMax(75, 83)
            : scaleWithMax(78, 80);
      }
    }
    return screenHeight * 0.1;
  };

  const renderContent = () => {
    switch (screenType) {
      case 'home':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item paddingHorizontal={theme.sizes.PADDING}>
              {/* Welcome Text with User Name */}
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.7}
                height={screenHeight * 0.025}
                borderRadius={screenWidth * 0.01}
                marginTop={screenHeight * 0.01}
              />

              {/* Hero Image Slider */}
              <SkeletonPlaceholder.Item
                width={screenWidth - theme.sizes.PADDING * 2}
                height={getSliderHeight()}
                borderRadius={12}
                marginTop={screenHeight * 0.01}
              />

              {/* Section Title */}
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.7}
                height={screenHeight * 0.025}
                borderRadius={screenWidth * 0.01}
                marginTop={screenHeight * 0.015}
                marginBottom={screenHeight * 0.01}
              />

              {/* Tabs Layout - First Row (1 tab: Gift One Get one) */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                marginBottom={scaleWithMax(10, 12)}
              >
                <SkeletonPlaceholder.Item
                  width={screenWidth - theme.sizes.PADDING * 2}
                  height={getTabHeight(1)}
                  borderRadius={20}
                />
              </SkeletonPlaceholder.Item>

              {/* Tabs Layout - Second Row (2 tabs: Catch, Send a Gift) */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                justifyContent="space-between"
                marginBottom={scaleWithMax(10, 12)}
              >
                <SkeletonPlaceholder.Item
                  width={
                    (screenWidth -
                      theme.sizes.PADDING * 2 -
                      scaleWithMax(10, 12)) /
                    2
                  }
                  height={getTabHeight(2)}
                  borderRadius={20}
                />
                <SkeletonPlaceholder.Item
                  width={
                    (screenWidth -
                      theme.sizes.PADDING * 2 -
                      scaleWithMax(10, 12)) /
                    2
                  }
                  height={getTabHeight(2)}
                  borderRadius={20}
                />
              </SkeletonPlaceholder.Item>

              {/* Inner Section Title */}
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.6}
                height={screenHeight * 0.025}
                borderRadius={screenWidth * 0.01}
                // marginTop={screenHeight * 0.015}
                marginBottom={screenHeight * 0.01}
              />

              {/* Tabs Layout - Third Row (2 tabs: Inbox, Outbox) */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                justifyContent="space-between"
              >
                <SkeletonPlaceholder.Item
                  width={
                    (screenWidth -
                      theme.sizes.PADDING * 2 -
                      scaleWithMax(10, 12)) /
                    2
                  }
                  height={getTabHeight(3)}
                  borderRadius={20}
                />
                <SkeletonPlaceholder.Item
                  width={
                    (screenWidth -
                      theme.sizes.PADDING * 2 -
                      scaleWithMax(10, 12)) /
                    2
                  }
                  height={getTabHeight(3)}
                  borderRadius={20}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

      case 'search':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {[...Array(6)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  paddingVertical={screenHeight * 0.01}
                  paddingHorizontal={screenWidth * 0.035}
                  marginBottom={screenHeight * 0.001}
                >
                  {/* Profile Picture - Match actual size (36x36) */}
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.09}
                    height={screenWidth * 0.09}
                    borderRadius={screenWidth * 0.045}
                    marginRight={screenWidth * 0.03}
                  />

                  {/* User Info - Only name, no subtitle */}
                  <SkeletonPlaceholder.Item flex={1} justifyContent="center">
                    <SkeletonPlaceholder.Item
                      width={screenWidth * 0.4}
                      height={screenHeight * 0.018}
                      borderRadius={screenWidth * 0.01}
                    />
                  </SkeletonPlaceholder.Item>

                  {/* Action Button - Match actual size (68 minWidth, padding 8x4) */}
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.17}
                    height={screenHeight * 0.032}
                    borderRadius={screenWidth * 0.02}
                  />
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

      case 'sendAGift':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {/* Frequently Gifted Section */}

              {/* Main Friends List */}
              {[...Array(6)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  paddingVertical={screenHeight * 0.01}
                  paddingHorizontal={screenWidth * 0.035}
                  marginBottom={screenHeight * 0.001}
                >
                  {/* Profile Picture - Match actual size (36x36) */}
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.09}
                    height={screenWidth * 0.09}
                    borderRadius={screenWidth * 0.045}
                    marginRight={screenWidth * 0.03}
                  />

                  {/* User Info - Only name, no button */}
                  <SkeletonPlaceholder.Item flex={1} justifyContent="center">
                    <SkeletonPlaceholder.Item
                      width={screenWidth * 0.5}
                      height={screenHeight * 0.018}
                      borderRadius={screenWidth * 0.01}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

      case 'wallet':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal={screenWidth * 0.055}
              borderRadius={screenWidth * 0.03}
              marginTop={screenHeight * 0.015}
            >
              {/* Left Section: Logo + Wallet Name */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                alignItems="center"
                flex={1}
              >
                {/* Logo Circle - Bigger */}
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.18}
                  height={screenWidth * 0.18}
                  borderRadius={screenWidth * 0.04}
                  marginRight={screenWidth * 0.035}
                />

                {/* Wallet Name */}
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.3}
                  height={screenHeight * 0.022}
                  borderRadius={screenWidth * 0.01}
                />
              </SkeletonPlaceholder.Item>

              {/* Right Section: Balance Info */}
              <SkeletonPlaceholder.Item alignItems="flex-end">
                {/* Balance Label */}
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.25}
                  height={screenHeight * 0.018}
                  borderRadius={screenWidth * 0.01}
                  marginBottom={screenHeight * 0.008}
                />

                {/* Balance Amount */}
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.2}
                  height={screenHeight * 0.028}
                  borderRadius={screenWidth * 0.01}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

      case 'storeCard':
        return (
          <View>
            {/* <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item
                flexDirection="row"
                marginVertical={screenHeight * 0.016}
                gap={10}
              >
                {[...Array(4)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    width={screenWidth * 0.2}
                    height={scaleWithMax(40, 42)}
                    borderRadius={10}
                  />
                ))}
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder> */}
            {[...Array(3)].map((_, index) => (
              <View
                key={index}
                style={{
                  width: screenWidth * 0.92,
                  marginBottom: screenHeight * 0.02,
                  borderRadius: screenWidth * 0.03,
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                }}
              >
                {/* Background Image - Lighter color */}
                <SkeletonPlaceholder
                  backgroundColor="#E8E8E8"
                  highlightColor="#F5F5F5"
                >
                  <SkeletonPlaceholder.Item
                    width="100%"
                    height={screenHeight * 0.14}
                    borderRadius={0}
                  />
                </SkeletonPlaceholder>

                {/* Content Overlay */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: screenWidth * 0.04,
                    height: screenHeight * 0.08,
                    position: 'relative',
                  }}
                >
                  {/* Circular Overlay Image - Darker color */}
                  <View
                    style={{
                      position: 'absolute',
                      top: -screenHeight * 0.056,
                      left: screenWidth * 0.04,
                      zIndex: 1,
                    }}
                  >
                    <SkeletonPlaceholder
                      backgroundColor="#DDDDDD"
                      highlightColor="#D8D8D8"
                    >
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.145}
                        height={screenWidth * 0.145}
                        borderRadius={screenWidth * 0.0725}
                      />
                    </SkeletonPlaceholder>
                  </View>

                  {/* Text Content */}
                  <View style={{ flex: 1 }}>
                    <SkeletonPlaceholder>
                      <SkeletonPlaceholder.Item>
                        {/* Title */}
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.4}
                          height={screenHeight * 0.02}
                          borderRadius={screenWidth * 0.01}
                          marginBottom={screenHeight * 0.004}
                        />
                        {/* Subtitle */}
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.3}
                          height={screenHeight * 0.017}
                          borderRadius={screenWidth * 0.01}
                        />
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder>
                  </View>

                  {/* Right Arrow Icon - Faded */}
                  <View style={{ opacity: 0.2 }}>
                    <SvgNextIcon
                      width={16}
                      height={16}
                      style={{ transform: rtlTransform(isRtl) }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      case 'productListing':
        return (
          <SkeletonPlaceholder>
            {/* <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item
                flexDirection="row"
                marginTop={screenHeight * 0.016}
                marginBottom={screenHeight * 0.006}
                gap={10}
              >
                {[...Array(4)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    width={screenWidth * 0.2}
                    height={scaleWithMax(40, 42)}
                    borderRadius={10}
                  />
                ))}
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder> */}
            <SkeletonPlaceholder.Item>
              <View />

              {[...Array(5)].map((_, index) => (
                <>
                  <SkeletonPlaceholder.Item
                    alignSelf="center"
                    flexDirection="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    gap={screenWidth * 0.045}
                  >
                    {/* Left Product Card */}
                    <SkeletonPlaceholder.Item width={screenWidth * 0.44}>
                      {/* Product Image */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.44}
                        height={screenHeight * 0.21}
                        borderRadius={screenWidth * 0.0375}
                      />

                      {/* Title */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.35}
                        height={screenHeight * 0.018}
                        borderRadius={screenWidth * 0.01}
                        marginTop={screenHeight * 0.008}
                      />

                      {/* Subtitle */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.2}
                        height={screenHeight * 0.015}
                        borderRadius={screenWidth * 0.01}
                        marginTop={screenHeight * 0.005}
                      />

                      {/* Price */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.12}
                        height={screenHeight * 0.02}
                        borderRadius={screenWidth * 0.01}
                        marginTop={screenHeight * 0.006}
                      />
                    </SkeletonPlaceholder.Item>

                    {/* Right Product Card */}
                    <SkeletonPlaceholder.Item width={screenWidth * 0.44}>
                      {/* Product Image */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.44}
                        height={screenHeight * 0.21}
                        borderRadius={screenWidth * 0.0375}
                      />

                      {/* Title */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.35}
                        height={screenHeight * 0.018}
                        borderRadius={screenWidth * 0.01}
                        marginTop={screenHeight * 0.008}
                      />

                      {/* Subtitle */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.2}
                        height={screenHeight * 0.015}
                        borderRadius={screenWidth * 0.01}
                        marginTop={screenHeight * 0.005}
                      />

                      {/* Price */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.12}
                        height={screenHeight * 0.02}
                        borderRadius={screenWidth * 0.01}
                        marginTop={screenHeight * 0.006}
                      />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>
                  <View style={{ marginVertical: screenHeight * 0.012 }} />
                </>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

      case 'orderListing':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {[...Array(1)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  marginTop={
                    index === 0 ? screenHeight * 0 : screenHeight * 0.018
                  }
                  backgroundColor="#fff"
                  borderRadius={screenWidth * 0.025}
                  padding={screenWidth * 0.032}
                >
                  {/* Top Row: Image, Product Info, Status */}
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    justifyContent="space-between"
                    marginBottom={screenHeight * 0.004}
                  >
                    {/* Image and Product Info */}
                    <SkeletonPlaceholder.Item flexDirection="row" flex={1}>
                      {/* Product Image */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.2}
                        height={screenWidth * 0.2}
                        borderRadius={screenWidth * 0.02}
                        marginRight={screenWidth * 0.025}
                      />

                      {/* Product Info */}
                      <SkeletonPlaceholder.Item>
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.3}
                          height={screenHeight * 0.02}
                          borderRadius={screenWidth * 0.01}
                          marginTop={screenHeight * 0.005}
                        />
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.2}
                          height={screenHeight * 0.015}
                          borderRadius={screenWidth * 0.01}
                          marginTop={screenHeight * 0.01}
                        />
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>

                    {/* Status and Order Number */}
                    <SkeletonPlaceholder.Item alignItems="flex-end">
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.175}
                        height={screenHeight * 0.025}
                        borderRadius={screenWidth * 0.015}
                        marginBottom={screenHeight * 0.008}
                      />
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.2}
                        height={screenHeight * 0.02}
                        borderRadius={screenWidth * 0.01}
                      />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>

                  {/* Order Details Section */}
                  <SkeletonPlaceholder.Item marginTop={screenHeight * 0.01}>
                    {/* Phone Number Row */}
                    <SkeletonPlaceholder.Item
                      flexDirection="row"
                      justifyContent="space-between"
                      paddingVertical={screenHeight * 0.009}
                    >
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.25}
                        height={screenHeight * 0.017}
                        borderRadius={screenWidth * 0.01}
                      />
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.3}
                        height={screenHeight * 0.017}
                        borderRadius={screenWidth * 0.01}
                      />
                    </SkeletonPlaceholder.Item>

                    {/* Order Time Row */}
                    <SkeletonPlaceholder.Item
                      flexDirection="row"
                      justifyContent="space-between"
                      paddingVertical={screenHeight * 0.0025}
                      paddingBottom={screenHeight * 0.008}
                    >
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.2}
                        height={screenHeight * 0.017}
                        borderRadius={screenWidth * 0.01}
                      />
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.35}
                        height={screenHeight * 0.017}
                        borderRadius={screenWidth * 0.01}
                      />
                    </SkeletonPlaceholder.Item>

                    {/* Item Row */}
                    <SkeletonPlaceholder.Item
                      flexDirection="row"
                      justifyContent="space-between"
                      paddingVertical={screenHeight * 0.014}
                      marginVertical={screenHeight * 0.005}
                      borderTopWidth={1}
                      borderBottomWidth={1}
                      borderColor="#EDEDED"
                    >
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.225}
                        height={screenHeight * 0.017}
                        borderRadius={screenWidth * 0.01}
                      />
                      <SkeletonPlaceholder.Item flexDirection="row">
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.125}
                          height={screenHeight * 0.017}
                          borderRadius={screenWidth * 0.01}
                          marginRight={screenWidth * 0.15}
                        />
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.1}
                          height={screenHeight * 0.017}
                          borderRadius={screenWidth * 0.01}
                        />
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>

                    {/* Total Row */}
                    <SkeletonPlaceholder.Item
                      flexDirection="row"
                      justifyContent="space-between"
                      paddingVertical={screenHeight * 0.01}
                    >
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.25}
                        height={screenHeight * 0.02}
                        borderRadius={screenWidth * 0.01}
                      />
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.15}
                        height={screenHeight * 0.02}
                        borderRadius={screenWidth * 0.01}
                      />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

      case 'sendToGroup':
        return (
          <>
            {[...Array(3)].map((_, index) => (
              <View key={index}>
                <View
                  style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: theme.sizes.BORDER_RADIUS_MID,
                    paddingHorizontal: theme.sizes.PADDING,
                    paddingVertical: theme.sizes.HEIGHT * 0.017,
                    marginBottom: theme.sizes.HEIGHT * 0.016,
                    height: theme.sizes.HEIGHT * 0.075,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    width: '100%',
                  }}
                >
                  <SkeletonPlaceholder
                    borderRadius={8}
                    highlightColor="#f2f2f2"
                    backgroundColor="#e0e0e0"
                  >
                    <SkeletonPlaceholder.Item
                      flexDirection="row"
                      alignItems="center"
                      flex={1}
                      gap={10}
                      minWidth={0}
                    >
                      <SkeletonPlaceholder.Item
                        width={40}
                        height={40}
                        borderRadius={999}
                      />
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.5}
                        height={theme.sizes.FONTSIZE_LESS_HIGH}
                        borderRadius={4}
                      />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder>
                  <View style={{ opacity: 0.2 }}>
                    <SvgNextIcon style={{ transform: rtlTransform(isRtl) }} />
                  </View>
                </View>
              </View>
            ))}
          </>
        );

      case 'staticContent':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item paddingTop={screenHeight * 0.02}>
              {/* Main Heading */}
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.6}
                height={screenHeight * 0.028}
                borderRadius={screenWidth * 0.01}
                marginBottom={screenHeight * 0.025}
              />

              {/* Map through content sections */}
              {[...Array(8)].map((_, index) => (
                <View key={index}>
                  {/* Content lines - 4 lines per section */}
                  <SkeletonPlaceholder.Item
                    width="100%"
                    height={screenHeight * 0.018}
                    borderRadius={screenWidth * 0.01}
                    marginBottom={screenHeight * 0.01}
                  />
                  <SkeletonPlaceholder.Item
                    width="100%"
                    height={screenHeight * 0.018}
                    borderRadius={screenWidth * 0.01}
                    marginBottom={screenHeight * 0.01}
                  />
                  <SkeletonPlaceholder.Item
                    width="100%"
                    height={screenHeight * 0.018}
                    borderRadius={screenWidth * 0.01}
                    marginBottom={screenHeight * 0.01}
                  />
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.7}
                    height={screenHeight * 0.018}
                    borderRadius={screenWidth * 0.01}
                    marginBottom={screenHeight * 0.025}
                  />
                </View>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

      case 'faq':
        return (
          <>
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item>
                {[...Array(8)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    width="100%"
                    height={screenHeight * 0.055}
                    borderRadius={screenWidth * 0.02}
                    marginBottom={screenHeight * 0.018}
                  />
                ))}
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>

            {[...Array(8)].map((_, index) => (
              <View
                key={`arrow-${index}`}
                style={{
                  position: 'absolute',
                  right: screenWidth * 0.04,
                  top:
                    (screenHeight * 0.055 + screenHeight * 0.018) * index +
                    screenHeight * 0.0275 -
                    8,
                  opacity: 0.15,
                }}
              >
                <SvgNextIcon
                  width={16}
                  height={16}
                  style={{ transform: rtlTransform(isRtl) }}
                />
              </View>
            ))}
          </>
        );

      case 'settings':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              // paddingHorizontal={theme.sizes.PADDING}
              paddingTop={screenHeight * 0.0}
              paddingBottom={screenHeight * 0.02}
            >
              {/* Language Selection Title */}
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.35}
                height={screenHeight * 0.024}
                borderRadius={screenWidth * 0.01}
                marginTop={screenHeight * 0.006}
                marginBottom={screenHeight * 0.016}
              />

              {/* Language Options - Stacked Vertically */}
              <SkeletonPlaceholder.Item marginBottom={screenHeight * 0.0}>
                {[...Array(2)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    flexDirection="row"
                    alignItems="center"
                    marginBottom={screenHeight * 0.012}
                    paddingHorizontal={screenWidth * 0.02}
                  >
                    {/* Radio Button */}
                    <SkeletonPlaceholder.Item
                      width={screenWidth * 0.06}
                      height={screenWidth * 0.06}
                      borderRadius={99999}
                      marginRight={screenWidth * 0.02}
                    />
                    {/* Language Text */}
                    <SkeletonPlaceholder.Item
                      width={screenWidth * 0.15}
                      height={screenHeight * 0.018}
                      borderRadius={screenWidth * 0.01}
                    />
                  </SkeletonPlaceholder.Item>
                ))}
              </SkeletonPlaceholder.Item>

              {/* Form Fields */}
              {[...Array(6)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  marginBottom={screenHeight * 0.02}
                  position="relative"
                >
                  {/* Input Field - Same style as button loader */}
                  <SkeletonPlaceholder.Item
                    width="100%"
                    height={screenHeight * 0.06}
                    borderRadius={screenWidth * 0.02}
                  />
                  {/* Icon Overlay on Left Side */}
                  <SkeletonPlaceholder.Item
                    position="absolute"
                    left={screenWidth * 0.04}
                    top={screenHeight * 0.0175}
                    width={screenWidth * 0.06}
                    height={screenWidth * 0.06}
                    borderRadius={screenWidth * 0.01}
                  />
                </SkeletonPlaceholder.Item>
              ))}

              {/* Gender Selection Container */}
              <SkeletonPlaceholder.Item
                marginBottom={screenHeight * 0.029}
                position="relative"
              >
                {/* Gender Field - Same style as other field loaders */}
                <SkeletonPlaceholder.Item
                  width="100%"
                  height={screenHeight * 0.06}
                  borderRadius={screenWidth * 0.02}
                />
                {/* Radio Button Overlays */}
                {[...Array(2)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    position="absolute"
                    left={index === 0 ? screenWidth * 0.04 : screenWidth * 0.5}
                    top={screenHeight * 0.0175}
                    width={screenWidth * 0.06}
                    height={screenWidth * 0.06}
                    borderRadius={99999}
                  />
                ))}
              </SkeletonPlaceholder.Item>

              {/* Update Button */}
              <SkeletonPlaceholder.Item
                width="100%"
                height={screenHeight * 0.064}
                borderRadius={screenWidth * 0.02}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

      case 'landing':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              <SkeletonPlaceholder.Item
                gap={16}
                alignItems="center"
                marginBottom={screenHeight * 0.016}
              >
                <SkeletonPlaceholder.Item
                  width="100%"
                  height={screenHeight * 0.062}
                  borderRadius={screenWidth * 0.02}
                />
                <SkeletonPlaceholder.Item
                  width="100%"
                  height={screenHeight * 0.062}
                  borderRadius={screenWidth * 0.02}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'productDetails':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {/* Product Title and Price Row */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                justifyContent="space-between"
                alignItems="flex-start"
                marginTop={screenHeight * 0.02}
                marginBottom={screenHeight * 0.01}
              >
                {/* Product Title */}
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.55}
                  height={screenHeight * 0.028}
                  borderRadius={screenWidth * 0.01}
                />
                {/* Price Container */}
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  alignItems="center"
                  gap={screenWidth * 0.01}
                >
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.15}
                    height={screenHeight * 0.024}
                    borderRadius={screenWidth * 0.01}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* Tax Include Text */}
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.5}
                height={screenHeight * 0.018}
                borderRadius={screenWidth * 0.01}
                marginBottom={screenHeight * 0.025}
              />

              {/* Description Section */}
              <SkeletonPlaceholder.Item marginBottom={screenHeight * 0.02}>
                {/* Description Heading */}
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.35}
                  height={screenHeight * 0.022}
                  borderRadius={screenWidth * 0.01}
                  marginBottom={screenHeight * 0.012}
                />
                {/* Description Lines */}
                {[...Array(4)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    width={index === 3 ? screenWidth * 0.7 : screenWidth * 0.95}
                    height={screenHeight * 0.018}
                    borderRadius={screenWidth * 0.01}
                    marginBottom={screenHeight * 0.008}
                  />
                ))}
              </SkeletonPlaceholder.Item>

              {/* Variants Heading */}
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.3}
                height={screenHeight * 0.022}
                borderRadius={screenWidth * 0.01}
                marginBottom={screenHeight * 0.015}
              />

              {/* Variant Tabs */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                gap={screenWidth * 0.02}
                marginBottom={screenHeight * 0.02}
              >
                {[...Array(3)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    width={screenWidth * 0.25}
                    height={screenHeight * 0.04}
                    borderRadius={screenWidth * 0.02}
                  />
                ))}
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );

        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {/* Product Title and Price Row */}
              <SkeletonPlaceholder.Item
                flexDirection="row"
                justifyContent="space-between"
                alignItems="flex-start"
                marginTop={screenHeight * 0.02}
                marginBottom={screenHeight * 0.01}
              >
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.55}
                  height={screenHeight * 0.028}
                  borderRadius={screenWidth * 0.01}
                />
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  alignItems="center"
                  gap={screenWidth * 0.01}
                >
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.15}
                    height={screenHeight * 0.024}
                    borderRadius={screenWidth * 0.01}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.5}
                height={screenHeight * 0.018}
                borderRadius={screenWidth * 0.01}
                marginBottom={screenHeight * 0.025}
              />
              <SkeletonPlaceholder.Item marginBottom={screenHeight * 0.02}>
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.35}
                  height={screenHeight * 0.022}
                  borderRadius={screenWidth * 0.01}
                  marginBottom={screenHeight * 0.012}
                />
                {[...Array(4)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    width={index === 3 ? screenWidth * 0.7 : screenWidth * 0.95}
                    height={screenHeight * 0.018}
                    borderRadius={screenWidth * 0.01}
                    marginBottom={screenHeight * 0.008}
                  />
                ))}
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'tabItem':
        return (
          <SkeletonPlaceholder
            borderRadius={8}
            highlightColor="#f2f2f2"
            backgroundColor="#e0e0e0"
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 10,
                    width: '70%',
                  }}
                />
              </View>
            </View>
          </SkeletonPlaceholder>
        );
      case 'checkout':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item paddingHorizontal={theme.sizes.PADDING}>
              {/* Section: Order Details */}
              <SkeletonPlaceholder.Item marginTop={screenHeight * 0.015}>
                {/* Section Heading */}
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.4}
                  height={screenHeight * 0.022}
                  borderRadius={screenWidth * 0.01}
                />

                {/* Cart Items */}
                {[...Array(2)].map((_, index) => (
                  <SkeletonPlaceholder.Item
                    key={index}
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor="#fff"
                    borderRadius={theme.sizes.BORDER_RADIUS}
                    marginTop={
                      index === 0 ? screenHeight * 0.006 : screenHeight * 0.01
                    }
                    paddingVertical={theme.sizes.PADDING * 0.55}
                    paddingHorizontal={theme.sizes.PADDING * 0.75}
                    gap={theme.sizes.WIDTH * 0.03}
                  >
                    {/* Product Image */}
                    <SkeletonPlaceholder.Item
                      width={scaleWithMax(80, 85)}
                      height={scaleWithMax(80, 85)}
                      borderRadius={theme.sizes.BORDER_RADIUS}
                    />

                    {/* Product Info */}
                    <SkeletonPlaceholder.Item
                      flex={1}
                      gap={theme.sizes.HEIGHT * 0.006}
                    >
                      {/* Item Name */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.4}
                        height={screenHeight * 0.02}
                        borderRadius={screenWidth * 0.01}
                      />
                      {/* Variant Name */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.3}
                        height={screenHeight * 0.017}
                        borderRadius={screenWidth * 0.01}
                      />

                      {/* Price and Quantity Row */}
                      <SkeletonPlaceholder.Item
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginTop={screenHeight * 0.01}
                      >
                        {/* Price */}
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.15}
                          height={screenHeight * 0.022}
                          borderRadius={screenWidth * 0.01}
                        />
                        {/* Quantity Controls */}
                        <SkeletonPlaceholder.Item
                          flexDirection="row"
                          alignItems="center"
                          gap={theme.sizes.WIDTH * 0.01}
                        >
                          <SkeletonPlaceholder.Item
                            width={scaleWithMax(16, 17)}
                            height={scaleWithMax(16, 17)}
                            borderRadius={999}
                          />
                          <SkeletonPlaceholder.Item
                            width={scaleWithMax(16, 18)}
                            height={scaleWithMax(14, 15)}
                            borderRadius={screenWidth * 0.01}
                            marginHorizontal={theme.sizes.WIDTH * 0.01}
                          />
                          <SkeletonPlaceholder.Item
                            width={scaleWithMax(16, 17)}
                            height={scaleWithMax(16, 17)}
                            borderRadius={999}
                          />
                        </SkeletonPlaceholder.Item>
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>
                ))}
              </SkeletonPlaceholder.Item>

              {/* Section: Send a Gift */}
              <SkeletonPlaceholder.Item marginTop={screenHeight * 0.02}>
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.35}
                  height={screenHeight * 0.022}
                  borderRadius={screenWidth * 0.01}
                  marginBottom={screenHeight * 0.006}
                />
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  backgroundColor="#fff"
                  borderRadius={theme.sizes.BORDER_RADIUS}
                  paddingVertical={theme.sizes.PADDING * 0.5}
                  paddingHorizontal={theme.sizes.PADDING * 0.75}
                  gap={theme.sizes.WIDTH * 0.03}
                >
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    flex={1}
                    gap={theme.sizes.WIDTH * 0.025}
                    alignItems="center"
                  >
                    <SkeletonPlaceholder.Item
                      width={scaleWithMax(30, 35)}
                      height={scaleWithMax(30, 35)}
                      borderRadius={999}
                    />
                    <SkeletonPlaceholder.Item
                      width={screenWidth * 0.25}
                      height={screenHeight * 0.017}
                      borderRadius={screenWidth * 0.01}
                    />
                  </SkeletonPlaceholder.Item>
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    gap={theme.sizes.WIDTH * 0.025}
                  >
                    <SkeletonPlaceholder.Item
                      width={20}
                      height={20}
                      borderRadius={screenWidth * 0.01}
                    />
                    <SkeletonPlaceholder.Item
                      width={20}
                      height={20}
                      borderRadius={screenWidth * 0.01}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* Section: Payment Management */}
              <SkeletonPlaceholder.Item marginTop={screenHeight * 0.02}>
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom={screenHeight * 0.006}
                >
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.4}
                    height={screenHeight * 0.022}
                    borderRadius={screenWidth * 0.01}
                  />
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    gap={theme.sizes.WIDTH * 0.013}
                    alignItems="center"
                  >
                    <SkeletonPlaceholder.Item
                      width={15}
                      height={15}
                      borderRadius={screenWidth * 0.01}
                    />
                    <SkeletonPlaceholder.Item
                      width={screenWidth * 0.2}
                      height={screenHeight * 0.017}
                      borderRadius={screenWidth * 0.01}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  backgroundColor="#fff"
                  borderRadius={theme.sizes.BORDER_RADIUS}
                  paddingVertical={theme.sizes.PADDING * 0.5}
                  paddingHorizontal={theme.sizes.PADDING * 0.75}
                  gap={theme.sizes.WIDTH * 0.03}
                >
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    flex={1}
                    gap={theme.sizes.WIDTH * 0.03}
                    alignItems="center"
                  >
                    <SkeletonPlaceholder.Item
                      width={20}
                      height={20}
                      borderRadius={999}
                    />
                    <SkeletonPlaceholder.Item
                      width={scaleWithMax(32, 35)}
                      height={scaleWithMax(32, 35)}
                      borderRadius={screenWidth * 0.01}
                    />
                    <SkeletonPlaceholder.Item gap={screenHeight * 0.004}>
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.25}
                        height={screenHeight * 0.017}
                        borderRadius={screenWidth * 0.01}
                      />
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.15}
                        height={screenHeight * 0.017}
                        borderRadius={screenWidth * 0.01}
                      />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>
                  <SkeletonPlaceholder.Item
                    width={scaleWithMax(16, 18)}
                    height={scaleWithMax(16, 18)}
                    borderRadius={screenWidth * 0.01}
                  />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>

              {/* Section: Order Details Totals */}
              <SkeletonPlaceholder.Item marginTop={screenHeight * 0.02}>
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.4}
                  height={screenHeight * 0.022}
                  borderRadius={screenWidth * 0.01}
                  marginBottom={screenHeight * 0.006}
                />
                {/* Total Amount Row */}
                <SkeletonPlaceholder.Item
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  paddingVertical={theme.sizes.PADDING * 0.36}
                  borderBottomWidth={0.6}
                  borderBottomColor="#EDEDED"
                >
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.3}
                    height={screenHeight * 0.017}
                    borderRadius={screenWidth * 0.01}
                  />
                  <SkeletonPlaceholder.Item
                    width={screenWidth * 0.15}
                    height={screenHeight * 0.017}
                    borderRadius={screenWidth * 0.01}
                  />
                </SkeletonPlaceholder.Item>
                {/* VAT Note */}
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.6}
                  height={screenHeight * 0.017}
                  borderRadius={screenWidth * 0.01}
                  alignSelf="center"
                  marginTop={theme.sizes.PADDING * 0.6}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'occasionView':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {/* First Input Field - Event Name */}
              <SkeletonPlaceholder.Item
                marginTop={screenHeight * 0.01}
                marginBottom={screenHeight * 0.02}
                position="relative"
              >
                {/* Input Field Container */}
                <SkeletonPlaceholder.Item
                  width="100%"
                  height={scaleWithMax(45, 50)}
                  borderRadius={theme.sizes.BORDER_RADIUS}
                />
                {/* Icon on Left Side */}
                <SkeletonPlaceholder.Item
                  position="absolute"
                  left={theme.sizes.PADDING}
                  top={scaleWithMax(12.5, 15)}
                  width={scaleWithMax(20, 25)}
                  height={scaleWithMax(20, 25)}
                  borderRadius={screenWidth * 0.01}
                />
              </SkeletonPlaceholder.Item>

              {/* Second Input Field - Date */}
              <SkeletonPlaceholder.Item
                marginBottom={screenHeight * 0.02}
                position="relative"
              >
                {/* Input Field Container */}
                <SkeletonPlaceholder.Item
                  width="100%"
                  height={scaleWithMax(45, 50)}
                  borderRadius={theme.sizes.BORDER_RADIUS}
                />
                {/* Icon on Left Side */}
                <SkeletonPlaceholder.Item
                  position="absolute"
                  left={theme.sizes.PADDING}
                  top={scaleWithMax(12.5, 15)}
                  width={scaleWithMax(20, 25)}
                  height={scaleWithMax(20, 25)}
                  borderRadius={screenWidth * 0.01}
                />
              </SkeletonPlaceholder.Item>

              {/* Third Input Field - Image */}
              <SkeletonPlaceholder.Item
                marginBottom={screenHeight * 0.02}
                position="relative"
              >
                {/* Input Field Container */}
                <SkeletonPlaceholder.Item
                  width="100%"
                  height={scaleWithMax(45, 50)}
                  borderRadius={theme.sizes.BORDER_RADIUS}
                />
                {/* Icon on Left Side */}
                <SkeletonPlaceholder.Item
                  position="absolute"
                  left={theme.sizes.PADDING}
                  top={scaleWithMax(12.5, 15)}
                  width={scaleWithMax(20, 25)}
                  height={scaleWithMax(20, 25)}
                  borderRadius={screenWidth * 0.01}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'occasionList':
        return (
          <>
            {[...Array(2)].map((_, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#f5f5f5',
                  borderRadius: theme.sizes.BORDER_RADIUS_MID,
                  paddingHorizontal: theme.sizes.PADDING,
                  paddingVertical: theme.sizes.HEIGHT * 0.017,
                  marginBottom: theme.sizes.HEIGHT * 0.016,
                  height: theme.sizes.HEIGHT * 0.075,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  width: '100%',
                }}
              >
                <SkeletonPlaceholder
                  borderRadius={8}
                  highlightColor="#f2f2f2"
                  backgroundColor="#e0e0e0"
                >
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    alignItems="center"
                    flex={1}
                    gap={10}
                    minWidth={0}
                  >
                    <SkeletonPlaceholder.Item
                      width={40}
                      height={40}
                      borderRadius={999}
                    />
                    <SkeletonPlaceholder.Item
                      width={screenWidth * 0.5}
                      height={theme.sizes.FONTSIZE_LESS_HIGH}
                      borderRadius={4}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
                <View style={{ opacity: 0.2 }}>
                  <SvgNextIcon style={{ transform: rtlTransform(isRtl) }} />
                </View>
              </View>
            ))}
          </>
        );
      case 'inbox':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {[...Array(3)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  marginTop={screenHeight * 0.01}
                  marginHorizontal={theme.sizes.PADDING}
                  paddingTop={theme.sizes.PADDING}
                  marginBottom={index === 2 ? 0 : screenHeight * 0.01}
                >
                  <SkeletonPlaceholder.Item
                    flexDirection="row"
                    alignItems="flex-start"
                  >
                    {/* Profile Image */}
                    <SkeletonPlaceholder.Item
                      width={scaleWithMax(50, 55)}
                      height={scaleWithMax(50, 55)}
                      borderRadius={999}
                      marginRight={screenWidth * 0.012}
                    />
                    {/* Content Section */}
                    <SkeletonPlaceholder.Item flex={1}>
                      {/* Top Row: User Name and Time */}
                      <SkeletonPlaceholder.Item
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom={screenHeight * 0.01}
                      >
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.3}
                          height={screenHeight * 0.02}
                          borderRadius={screenWidth * 0.01}
                        />
                        <SkeletonPlaceholder.Item
                          width={screenWidth * 0.15}
                          height={screenHeight * 0.017}
                          borderRadius={screenWidth * 0.01}
                        />
                      </SkeletonPlaceholder.Item>
                      {/* Second Row: Store Info and Icon */}
                      <SkeletonPlaceholder.Item
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                        marginBottom={screenHeight * 0.015}
                      >
                        <SkeletonPlaceholder.Item
                          flexDirection="row"
                          alignItems="center"
                          gap={screenWidth * 0.013}
                        >
                          <SkeletonPlaceholder.Item
                            width={theme.sizes.FONTSIZE}
                            height={theme.sizes.FONTSIZE}
                            borderRadius={screenWidth * 0.01}
                          />
                          <SkeletonPlaceholder.Item
                            width={screenWidth * 0.25}
                            height={screenHeight * 0.017}
                            borderRadius={screenWidth * 0.01}
                          />
                          <SkeletonPlaceholder.Item
                            width={scaleWithMax(16, 16)}
                            height={scaleWithMax(16, 16)}
                            borderRadius={999}
                          />
                        </SkeletonPlaceholder.Item>
                        <SkeletonPlaceholder.Item
                          width={scaleWithMax(18, 18)}
                          height={scaleWithMax(18, 18)}
                          borderRadius={screenWidth * 0.01}
                        />
                      </SkeletonPlaceholder.Item>
                      {/* Image Container */}
                      <SkeletonPlaceholder.Item
                        borderRadius={12}
                        overflow="hidden"
                        marginTop={screenHeight * 0.01}
                      >
                        <SkeletonPlaceholder.Item
                          width="100%"
                          height={theme.sizes.WIDTH * 0.5}
                          borderRadius={12}
                        />
                        {/* Bottom Section with Item Name */}
                        <SkeletonPlaceholder.Item
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          paddingVertical={theme.sizes.PADDING * 0.5}
                          paddingHorizontal={theme.sizes.PADDING}
                          backgroundColor="#fff"
                        >
                          <SkeletonPlaceholder.Item
                            width={screenWidth * 0.3}
                            height={screenHeight * 0.02}
                            borderRadius={screenWidth * 0.01}
                          />
                          <SkeletonPlaceholder.Item
                            width={scaleWithMax(24, 25)}
                            height={scaleWithMax(24, 25)}
                            borderRadius={999}
                          />
                        </SkeletonPlaceholder.Item>
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'tabItemCity':
        return (
          <SkeletonPlaceholder>
            {[...Array(7)].map((_, index) => (
              <SkeletonPlaceholder.Item
                key={index}
                width="100%"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingHorizontal={theme.sizes.PADDING}
                paddingVertical={theme.sizes.HEIGHT * 0.01}
                borderRadius={theme.sizes.BORDER_RADIUS}
              >
                {/* Left section */}

                {/* Title */}
                <SkeletonPlaceholder.Item
                  paddingHorizontal={theme.sizes.PADDING}
                  // width={theme.sizes.WIDTH * 0.88}
                  flex={1}
                  height={scaleWithMax(40, 45)}
                  borderRadius={6}
                />
              </SkeletonPlaceholder.Item>
            ))}
          </SkeletonPlaceholder>
        );

      case 'giftFilters':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              marginHorizontal={theme.sizes.PADDING}
            >
              {[...Array(3)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  width={screenWidth * 0.5}
                  height={screenHeight * 0.21}
                  borderRadius={12}
                  marginRight={index < 2 ? scaleWithMax(15, 18) : 0}
                />
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'groupTabs':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              flexDirection="row"
              // paddingHorizontal={theme.sizes.PADDING}
              paddingVertical={theme.sizes.HEIGHT * 0.016}
              gap={10}
            >
              {[...Array(4)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  width={screenWidth * 0.2}
                  height={scaleWithMax(40, 42)}
                  borderRadius={10}
                />
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'notifications':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item paddingHorizontal={theme.sizes.PADDING}>
              {[...Array(8)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  width="100%"
                  paddingVertical={theme.sizes.HEIGHT * 0.014}
                  borderRadius={theme.sizes.BORDER_RADIUS_MID}
                  marginBottom={screenHeight * 0.012}
                >
                  <SkeletonPlaceholder.Item
                    width={scaleWithMax(50, 55)}
                    height={scaleWithMax(50, 55)}
                    borderRadius={999}
                    marginRight={12}
                  />
                  <SkeletonPlaceholder.Item
                    flex={1}
                    justifyContent="center"
                    gap={6}
                  >
                    <SkeletonPlaceholder.Item
                      width="75%"
                      height={14}
                      borderRadius={4}
                    />
                    <SkeletonPlaceholder.Item
                      width="25%"
                      height={10}
                      borderRadius={4}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'cards':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item paddingHorizontal={theme.sizes.PADDING}>
              {[...Array(6)].map((_, index) => (
                <SkeletonPlaceholder.Item
                  key={index}
                  flexDirection="row"
                  alignItems="center"
                  width="100%"
                  paddingVertical={theme.sizes.PADDING * 0.6}
                  paddingHorizontal={theme.sizes.PADDING * 0.75}
                  borderRadius={theme.sizes.BORDER_RADIUS}
                  marginBottom={screenHeight * 0.008}
                >
                  <SkeletonPlaceholder.Item
                    width={scaleWithMax(20, 22)}
                    height={scaleWithMax(20, 22)}
                    borderRadius={999}
                    marginRight={theme.sizes.WIDTH * 0.03}
                  />
                  <SkeletonPlaceholder.Item
                    width={scaleWithMax(32, 35)}
                    height={scaleWithMax(32, 35)}
                    borderRadius={8}
                    marginRight={theme.sizes.WIDTH * 0.03}
                  />
                  <SkeletonPlaceholder.Item flex={1} gap={6}>
                    <SkeletonPlaceholder.Item
                      width="65%"
                      height={12}
                      borderRadius={4}
                    />
                    <SkeletonPlaceholder.Item
                      width="40%"
                      height={10}
                      borderRadius={4}
                    />
                  </SkeletonPlaceholder.Item>
                  {/* <SkeletonPlaceholder.Item
                    width={scaleWithMax(18, 20)}
                    height={scaleWithMax(18, 20)}
                    borderRadius={4}
                    marginLeft={theme.sizes.WIDTH * 0.03}
                  /> */}
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder>
        );
      case 'searchBar':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item
              width="100%"
              height={scaleWithMax(46, 51)}
              borderRadius={scaleWithMax(12, 14)}
            />
          </SkeletonPlaceholder>
        );
      default:
        return null;
    }
  };

  return <View>{renderContent()}</View>;
};

export default SkeletonLoader;
