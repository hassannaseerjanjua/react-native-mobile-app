import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppStackParamList = {
  BottomTabs: undefined;
  Search: undefined;
  SendAGift: undefined;
  SendToGroup: {
    groupName: string;
    selectedUserIds: number[];
  };
  Favorites: undefined;
  Occasions: undefined;
  Notifications: undefined;
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
