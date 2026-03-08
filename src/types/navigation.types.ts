import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageSourcePropType } from 'react-native';

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
  isVerified: boolean;
};

export interface UserCard {
  Brand: string;
  CardNumber: string;
  Token: string;
  ExpiryMonth: string;
  ExpiryYear: string;
}

export type AppStackParamList = {
  BottomTabs: undefined;
  ProductDetails: {
    itemId: number;
    friendUserId?: number | null;
    FriendIds?: number[];
    storeId?: number | null;
    type?: 'GiftOneGetOne' | 'catch';
    campaignId?: number;
    sendType?: number | null;
    addToFavorites?: boolean;
  };
  Search: {
    title?: string;
    showFriendsOnly?: boolean;
    showConnectOnly?: boolean;
    showEmployeesOnly?: boolean;
  };
  StaticContent: {
    title?: string;
    code: string;
  };
  ProfileImageViewer: {
    imageUri?: string | null;
    placeholderImage?: ImageSourcePropType;
    title?: string;
    occasionId?: number | null;
    occasionName?: string;
    occasionDate?: string;
    isLocalOnly?: boolean;
    onImageUpdate?: (result: { type: 'update'; asset: { uri: string; type?: string; name?: string } } | { type: 'delete' }) => void;
  };
  SendAGift: {
    routeTo: 'GiftOneGetOne' | 'SelectStore';
  };
  SendToGroup: {
    routeTo?: 'GiftOneGetOne' | 'SelectStore';
  };
  Wallet: undefined;
  InboxOutbox: {
    title?: string;
    isInbox?: boolean;
  };
  FAQ: undefined;
  Settings: undefined;
  GiftMessage: {
    storeBranchId?: number | null;
    friendUserId?: number | null;
    orderId?: number;
    sendType?: number | null;
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
      businessTypeId?: number | null;
      isVerified?: boolean;
    };
    sendType?: number | null;
    friendUserId?: number | null;
    FriendIds?: number[];
    friendName?: string | null;
    storeId?: number | null;
    businessTypeId?: number | null;
    addToFavorites?: boolean;
  };
  SelectStore: {
    friendUserId?: number | null;
    FriendIds?: number[];
    friendName?: string | null;
    storeId?: number | null;
    CityId?: number | null;
    sendType?: number | null;
    addToFavorites?: boolean;
  };
  CatchScreen: {
    storeID?: number;
    friendUserId?: number | null;
    FriendIds?: number[];
    businessTypeId?: string | null;
    storeBranchID?: number;
    type?: 'favorite' | 'catch' | 'GiftOneGetOne';
    cityId?: number | null;
  };
  ScanQr: {
    OrderId?: number | null;
    UniqueCode?: string | null;
    productImage?: any;
    storeName?: string;
    quantity?: number;
    productName?: string;
    selectedItems?: Array<{
      OrderItemId: number;
      ItemName: string;
      ItemImage: any;
      Quantity: number;
    }>;
    GiftLink?: string | null;
  };
  Occasions: undefined;
  SelectCity: {
    sendType: number;
  };
  CheckOut:
  | {
    product?: {
      id?: string | number;
      title?: string;
      subtitle?: string;
      image?: any;
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
    videoUploadPayload?: {
      ImageFilterId: number | null;
      Message: string;
      VideoFile: any;
    };
    isVideoUploading?: boolean;
    selectedCard?: UserCard;
  }
  | undefined;
  AddCard: { fromProfile?: boolean } | undefined;
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
