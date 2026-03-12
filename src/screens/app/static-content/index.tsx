import React from 'react';
import { View, StatusBar } from 'react-native';
import useStyles from './style';
import HomeHeader from '../../../components/global/HomeHeader';
import ParentView from '../../../components/app/ParentView';
import SkeletonLoader from '../../../components/SkeletonLoader';
import apiEndpoints from '../../../constants/api-endpoints';
import useGetApi from '../../../hooks/useGetApi';
import { AppStackScreen } from '../../../types/navigation.types';
import { StaticContentType } from '../../../types';
import { useLocaleStore } from '../../../store/reducer/locale';
import WebView from 'react-native-webview';

interface StaticProps extends AppStackScreen<'StaticContent'> {}

const StaticContent: React.FC<StaticProps> = ({ navigation, route }) => {
  const { styles, theme } = useStyles();
  const { langId, isRtl } = useLocaleStore();
  const { code, title } = route.params;

  const getStaticContent = useGetApi<StaticContentType>(
    apiEndpoints.GET_STATIC_CONTENT(code),
    {
      transformData: data => data.Data,
    },
  );

  const hasData = !!getStaticContent.data;
  const rawHtmlContent =
    langId === 1
      ? getStaticContent?.data?.ContentEn || '<p>No content</p>'
      : getStaticContent?.data?.ContentAr || '<p>No content</p>';

  const htmlContent = rawHtmlContent.replace(
    /(\d+(?:-\d+)+:)/g,
    '<span class="nowrap">$1</span>',
  );

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <style>
          html, body { -webkit-overflow-scrolling: touch; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0px 16px;
            width: 100%;
            overflow-wrap: break-word;
            word-break: break-word;
            font-family: '${theme.fonts.regular}',
            font-size: 14px;
            line-height: 20px;
            color: ${theme.colors.BLACK};
            direction: ${isRtl ? 'rtl' : 'ltr'};
            text-align: ${isRtl ? 'right' : 'left'};
            background-color: ${theme.colors.BACKGROUND};
            width: 100%;
            max-width: 100%;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 12px 0 8px;
            text-align: inherit;
          }
          h2 {
            font-size: 18px;
            font-weight: 700;
            margin: 14px 0 8px;
            text-align: inherit;
          }
          p, li, div, span {
            margin: 0 0 12px 0;
            text-align: inherit;
            unicode-bidi: ${isRtl ? 'isolate-override' : 'normal'};
            overflow-wrap: break-word;
            word-break: break-word;
          }
          a { overflow-wrap: break-word; word-break: break-word; }
          img { max-width: 100%; height: auto; }
          table { width: 100%; table-layout: fixed; }
          pre, code { overflow-wrap: break-word; word-break: break-word; max-width: 100%; }
          .nowrap { white-space: nowrap; }
          li {
            margin-bottom: 8px;
          }
          ol, ul {
            margin: 0 0 12px 0;
            padding: 0;
            list-style-position: inside;
          }
          strong { font-weight: 700; }
          a { color: ${theme.colors.PRIMARY}; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

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

      <View style={[styles.scrollView, styles.contentWrapper]}>
        {!hasData ? (
          <View style={styles.skeletonWrapper}>
            <SkeletonLoader screenType="staticContent" />
          </View>
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            style={styles.webView}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={[styles.skeletonWrapper, styles.loadingOverlay]}>
                <SkeletonLoader screenType="staticContent" />
              </View>
            )}
          />
        )}
      </View>
    </ParentView>
  );
};

export default StaticContent;
