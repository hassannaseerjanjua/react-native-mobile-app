import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export interface LocaleState {
  localeData: {
    langId: number;
    langCode: string;
    isRtl: boolean;
    strings: Record<LocaleString, string> | null;
  };
}

// init states
const initState: LocaleState = {
  localeData: {
    langId: 1,
    langCode: 'en',
    isRtl: false,
    strings: null,
  },
};

// reducer
const locale = createSlice({
  name: 'locale',
  initialState: initState,
  reducers: {
    setLocale(
      state,
      action: PayloadAction<Partial<LocaleState['localeData']>>,
    ) {
      console.log(
        '[Locale] Data Loaded:',
        Object.keys(action?.payload?.strings || {}).length,
        'Keys Loaded',
      );
      state.localeData = { ...state.localeData, ...action.payload };
    },
  },
});

export const { setLocale } = locale.actions;
export default locale.reducer;

export const useLocaleStore = () => {
  const locale = useSelector((state: RootState) => state.locale).localeData;
  return {
    ...locale,
    getString: (key: LocaleString) => {
      return locale?.strings?.[key] || key;
    },
  };
};

export type GetStringFunctionType = (key: LocaleString) => string;

type LocaleString =
  | 'API_CITY_NOT_FOUND'
  | 'API_EITHER_EMAIL_OR_PN_IS_REQUIRED'
  | 'API_EMAIL_ALREADY_EXISTS'
  | 'API_EMAIL_NOT_EXIST'
  | 'API_FULLNAME_REQUIRED'
  | 'API_GENERIC_FAILED'
  | 'API_INVALID_OR_EXPIRED_OTP'
  | 'API_OTP_HAS_EXPIRED'
  | 'API_OTP_SENT_SUCCESSFULLY'
  | 'API_PHONE_ALREADY_EXISTS'
  | 'API_PLEASE_WAIT'
  | 'API_RESOURCE_NOT_FOUND'
  | 'API_THIS_USERNAME_ALREADY_EXISTS'
  | 'API_USER_LOGGED_IN_SUCCESSFULLY'
  | 'API_USER_NOT_FOUND'
  | 'API_USER_REGISTERED_SUCCESSFULLY'
  | 'API_USERNAME_IS_REQUIRED'
  | 'API_USERNAME_IS_REQUIRED_FOR_SIGNUP'
  | 'AU_BUTTON_VERIFY'
  | 'AU_DONT_HAVE_AN_ACCOUNT'
  | 'AU_EMAIL'
  | 'AU_ENTER_SIX_DIGIT_CODE'
  | 'AU_HAVENT_RECEIVED_CODE'
  | 'AU_IS_THIS_YOUR_CORRECT_EMAIL'
  | 'AU_IS_THIS_YOUR_CORRECT_PN'
  | 'AU_LABEL_CITY'
  | 'AU_LETS_START'
  | 'AU_NEXT_BUTTON'
  | 'AU_NO_I_WANT_TO_CHANGE'
  | 'AU_OF'
  | 'AU_PERSONAL_INFO'
  | 'AU_PERSONAL_INFO_STEP_3'
  | 'AU_PHONE'
  | 'AU_PHONE_NUMBER'
  | 'AU_PL_CITY'
  | 'AU_PL_EMAIL'
  | 'AU_PL_FULL_NAME'
  | 'AU_PL_USERNAME'
  | 'AU_SELECT_CITY'
  | 'AU_SEND_CODE_BY_EMAIL'
  | 'AU_SEND_CODE_BY_SMS'
  | 'AU_SI_EMAIL_REQUIRED'
  | 'AU_SI_INVALID_EMAIL_ADDRESS'
  | 'AU_SI_PN_MUST_CONTAIN'
  | 'AU_SI_PN_MUST_DIGIT'
  | 'AU_SI_PN_MUST_START'
  | 'AU_SI_PN_REQUIRED'
  | 'AU_SIGN_IN'
  | 'AU_SIGN_IN_BUTTON'
  | 'AU_SIGN_IN_HEADING'
  | 'AU_SIGN_UP'
  | 'AU_SIGN_UP_BUTTON'
  | 'AU_SIGN_UP_FOOTER'
  | 'AU_STEP'
  | 'AU_SU_CITY_REQUIRED'
  | 'AU_SU_EMAIL_REQUIRED'
  | 'AU_SU_FULLNAME_ATLEAST'
  | 'AU_SU_FULLNAME_LESS_THAN'
  | 'AU_SU_FULLNAME_REQUIRE'
  | 'AU_SU_INVALID_EMAIL_ADDRESS'
  | 'AU_SU_PN_MUST_CONTAIN'
  | 'AU_SU_PN_MUST_DIGIT'
  | 'AU_SU_PN_MUST_START'
  | 'AU_SU_PN_REQUIRED'
  | 'AU_SU_USERNAME_ATLEAST'
  | 'AU_SU_USERNAME_IS_REQUIRED'
  | 'AU_SU_USERNAME_LESS_THAN'
  | 'AU_WELCOME_BACK'
  | 'HOME_WELCOME'
  | 'HOME_WHAT_ARE_YOU'
  | 'HOME_GIFT_ONE_GET_ONE'
  | 'HOME_GIFT_ONE_GET_ONE_DESC'
  | 'HOME_SEND_A_GIFT'
  | 'HOME_SEND_A_GIFT_DESC'
  | 'HOME_CATCH_INSTANT_GIFT'
  | 'HOME_CATCH_INSTANT_GIFT_DESC'
  | 'HOME_INBOX'
  | 'HOME_INBOX_DESC'
  | 'HOME_OUTBOX'
  | 'HOME_OUTBOX_DESC'
  | 'HOME_SEARCH'
  | 'FOOTER_HOME'
  | 'FOOTER_FAVORITES'
  | 'FOOTER_OCCASIONS'
  | 'FOOTER_NOTIFICATIONS'
  | 'SEARCH_ADD'
  | 'SEARCH_ADDED';
