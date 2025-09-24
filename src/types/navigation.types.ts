import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppStackParamList = {
  Home: undefined;
};

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  OtpVerification: {
    email?: string;
    phone?: string;
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
