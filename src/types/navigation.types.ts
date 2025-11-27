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
    itemId: number;
    friendUserId?: number | null;
    storeId?: number | null;
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
  InboxOutbox: {
    title?: string;
    isInbox?: boolean;
  };
  FAQ: undefined;
  Settings: undefined;
  GiftMessage: {
    product: {
      id?: string | number;
      title: string;
      subtitle: string;
      image: any; // Can be require() or { uri: string }
      price: number;
      discountedPrice?: number;
      storeId?: number;
      storeBranchId?: number;
      itemId?: number;
      categoryId?: number;
      categoryName?: string;
    };
    storeBranchId?: number | null;
    friendUserId?: number | null;
    addToCartPayload?: {
      FriendId?: number | null;
      StoreBranchId?: number | null;
      ItemId: number;
      ItemVariantId?: number;
      Quantity: number;
    };
  };
  ContactUs: undefined;
  Favorites: {
    redirectionType: 'home' | 'profile';
  };
  StoreProducts: {
    store?: {
      id?: string | number;
      storeId?: number;
      title: string;
      subtitle: string;
      backgroundImage?: any;
      overlayImage?: any;
      imageLogo?: string | null;
      imageCover?: string | null;
    };
    friendUserId?: number | null;
    storeId?: number | null;
  };
  SelectStore: {
    friendUserId?: number | null;
    storeId?: number | null;
  };
  CatchScreen: {
    storeID?: number;
    storeBranchID?: number;
    type?: 'favorite' | 'catch';
  };
  ScanQr: {
    OrderId?: number | null;
  };
  Occasions: undefined;
  CheckOut:
    | {
        product?: {
          id?: string | number;
          title?: string;
          subtitle?: string;
          image?: any; // Can be require() or { uri: string }
          price?: number;
          discountedPrice?: number;
          storeId?: number;
          storeBranchId?: number;
          itemId?: number;
          categoryId?: number;
          categoryName?: string;
        };
        friendUserId?: number | null;
        storeBranchId?: number | null;
        addToCartPayload?: {
          FriendId?: number | null;
          ItemId: number;
          ItemVariantId?: number;
          Quantity: number;
          storeBranchId?: number | null;
        };
      }
    | undefined;
  AddCard: undefined;
  Notifications: undefined;
  Profile: undefined;
  Orders: undefined;
  LocationSelection: undefined;
  GiftOneGetOne: undefined;
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
