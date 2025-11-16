import React from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import WalletCard from '../../../components/app/WalletCard';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { AppStackScreen } from '../../../types/navigation.types';
import { StaticContentType } from '../../../types';
import RenderHTML from 'react-native-render-html';
import { useSizes } from '../../../styles/sizes';
import { useLocaleStore } from '../../../store/reducer/locale';

interface StaticProps extends AppStackScreen<'StaticContent'> {}

const StaticContent: React.FC<StaticProps> = ({ navigation, route }) => {
  const { styles, theme } = useStyles();
  const { langId } = useLocaleStore();
  const { code, title } = route.params;

  const getStaticContent = useGetApi<StaticContentType>(
    apiEndpoints.GET_STATIC_CONTENT(code),
    {
      transformData: data => data.Data,
    },
  );

  // console.log('StaticContentResponse', getStaticContent?.data?.ContentEn);

  const source = {
    html:
      langId === 1
        ? getStaticContent?.data?.ContentEn || '<p>No content</p>'
        : getStaticContent?.data?.ContentAr || '<p>No content</p>',
  };

  const sizes = useSizes();

  return (
    <ParentView style={styles.container}>
      <StatusBar
        backgroundColor={theme.colors.BACKGROUND}
        barStyle="dark-content"
      />

      <HomeHeader
        title={title}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {getStaticContent.loading ? (
          <SkeletonLoader screenType="staticContent" />
        ) : (
          <RenderHTML source={source} contentWidth={sizes.WIDTH} />
        )}
      </ScrollView>
    </ParentView>
  );
};

export default StaticContent;
