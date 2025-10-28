// components/SkeletonLoader.tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { SvgNextIcon } from '../../assets/icons';

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
    | 'orderListing';
};

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ screenType }) => {
  const renderContent = () => {
    switch (screenType) {
      case 'home':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              {/* Hero Image Slider */}
              <SkeletonPlaceholder.Item
                width={screenWidth * 0.92}
                height={screenHeight * 0.34}
                borderRadius={12}
                marginTop={15}
              />
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
              backgroundColor="#fff"
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
                    <SvgNextIcon width={16} height={16} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        );

      case 'productListing':
        return (
          <SkeletonPlaceholder>
            <SkeletonPlaceholder.Item>
              <View style={{ marginVertical: screenHeight * 0.006 }} />

              {[...Array(5)].map((_, index) => (
                <>
                  <SkeletonPlaceholder.Item
                    alignSelf="center"
                    flexDirection="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    gap={screenWidth * 0.035}
                  >
                    {/* Left Product Card */}
                    <SkeletonPlaceholder.Item width={screenWidth * 0.43}>
                      {/* Product Image */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.43}
                        height={screenHeight * 0.2}
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
                    <SkeletonPlaceholder.Item width={screenWidth * 0.43}>
                      {/* Product Image */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.43}
                        height={screenHeight * 0.2}
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
            {[...Array(4)].map((_, index) => (
              <View key={index}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: screenHeight * 0.025,
                    paddingHorizontal: screenWidth * 0.025,
                    backgroundColor: '#fff',
                    borderRadius: 8,
                  }}
                >
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item
                      flexDirection="row"
                      alignItems="center"
                      flex={1}
                    >
                      {/* Group Icon - Circle (52x52) - Bigger */}
                      <SkeletonPlaceholder.Item
                        width={52}
                        height={52}
                        borderRadius={999}
                        marginRight={12}
                      />

                      {/* Group Name - Single line only - Bigger text */}
                      <SkeletonPlaceholder.Item
                        width={screenWidth * 0.55}
                        height={18}
                        borderRadius={4}
                      />
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder>

                  {/* Real Arrow Icon with opacity */}
                  <View style={{ opacity: 0.2 }}>
                    <SvgNextIcon />
                  </View>
                </View>
                {index < 3 && <View style={{ height: 14 }} />}
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
                <SvgNextIcon width={16} height={16} />
              </View>
            ))}
          </>
        );

      default:
        return null;
    }
  };

  return <View>{renderContent()}</View>;
};

export default SkeletonLoader;
