import { ImageSourcePropType } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface ProductDetailsParam {
  product: {
    id: string;
    title: string;
    subtitle: string;
    coverImage: ImageSourcePropType;
    price: number;
    isFavorite: boolean;
    description?: string;
  };
}

export type AppStackParamList = {
  BottomTabs: undefined;
  ProductDetails: ProductDetailsParam;
  Search: {
    title?: string;
    showFriendsOnly?: boolean;
    showConnectOnly?: boolean;
  };
  StaticContent: {
    title?: string;
    code: string;
  };
  SendAGift: undefined;
  SendToGroup: undefined;
  Wallet: undefined;
  FAQ: undefined;
  Settings: undefined;
  GiftMessage: undefined;
  ContactUs: undefined;
  Favorites: {
    redirectionType: 'home' | 'profile';
  };
  Occasions: undefined;
  CheckOut: undefined;
  AddCard: undefined;
  Notifications: undefined;
  Profile: undefined;
  Orders: undefined;
  LocationSelection: undefined;
  ScanQr: undefined;
  OutBox: undefined;
  Inbox: undefined;
  Catch: undefined;
};

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  OtpVerification: {
    email?: string;
    phone?: string;
    fullName?: string;
    username?: string;
    city?: string;
    signIn?: boolean;
  };
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AppStackScreen<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

export type AuthStackScreen<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type RootStackScreen<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
