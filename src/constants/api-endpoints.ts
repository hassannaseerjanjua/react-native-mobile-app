const version = `v1`;
const apiEndpoints = {
  BASE_URL: `https://giftee-api-dev.hostinger.bitscollision.net`,
  VERIFY_USERNAME: `/${version}/Home/VerifyUserName`,
  GET_CITY_LISTING: `/${version}/Home/GetCityListing`,
  SIGNUP: `/${version}/Home/RegisterUserAndSendOTP`,
  VERIFY_OTP: `/${version}/Home/VerifyOTP`,
  SIGNIN: `/${version}/Home/SignIn`,
  VERIFY_OTP_SIGNIN: `/${version}/Home/VerifyOTP-SignIn`,
};

export default apiEndpoints;
