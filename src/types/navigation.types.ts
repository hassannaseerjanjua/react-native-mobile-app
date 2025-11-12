import { NativeStackScreenProps } from '@react-navigation/native-stack';

type ProductCategory = 'all' | 'bouquet' | 'flowers' | 'roses' | 'cake';

type Product = {
  id: string;
  title: string;
  subtitle: string;
  coverImage: any;
  price: number;
  isFavorite: boolean;
  description?: string;
  category: ProductCategory;
};

type Store = {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage: any;
  overlayImage: any;
};

export type AppStackParamList = {
  BottomTabs: undefined;
  ProductDetails: {
    product: Product;
  };
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
  OutBox: undefined;
  Inbox: undefined;
  FAQ: undefined;
  Settings: undefined;
  GiftMessage: undefined;
  ContactUs: undefined;
  Favorites: {
    redirectionType: 'home' | 'profile';
  };
  StoreProducts: undefined;
  SelectStore: undefined;
  CatchScreen: undefined;
  ScanQr: undefined;
  Occasions: undefined;
  CheckOut: undefined;
  AddCard: undefined;
  Notifications: undefined;
  Profile: undefined;
  Orders: undefined;
  LocationSelection: undefined;
  GiftOneGetOne: undefined;
  StoreDetails: {
    store: Store;
  };
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
