import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AppStackParamList = {
  Settings: undefined;
};

export type AppStackScreen<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;

export type AuthStackScreen<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type RootStackScreen<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
