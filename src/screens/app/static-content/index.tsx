import React from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStyles from './style';
import { Text } from '../../../utils/elements';
import HomeHeader from '../../../components/global/HomeHeader';
import WalletCard from '../../../components/app/WalletCard';
import ParentView from '../../../components/app/ParentView';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { AppStackScreen } from '../../../types/navigation.types';
import { StaticContent } from '../../../types';
import RenderHTML from 'react-native-render-html';
import { useSizes } from '../../../styles/sizes';

interface StaticProps extends AppStackScreen<'StaticContent'> {}

const StaticConent: React.FC<StaticProps> = ({ navigation, route }) => {
  const { styles, theme } = useStyles();

  const { code, title } = route.params;

  const getStaticContent = useGetApi<StaticContent>(
    apiEndpoints.GET_STATIC_CONTENT(code),
    {
      transformData: data => data.Data,
    },
  );

  console.log('StaticContentResponse', getStaticContent?.data?.ContentEn);

  const source = {
    html: getStaticContent?.data?.ContentEn || '<p>No content</p>',
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
        {/* <Text>{getStaticContent?.data?.ContentEn}</Text>
         */}
        <RenderHTML source={source} contentWidth={sizes.WIDTH} />
      </ScrollView>
    </ParentView>
  );
};

export default StaticConent;
