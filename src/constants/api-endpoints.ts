const version = `v1`;
const apiEndpoints = {
  // Base URL
  BASE_URL: `https://giftee-api-dev.hostinger.bitscollision.net`,

  // Auth
  VERIFY_USERNAME: `/${version}/Home/VerifyUserName`,
  SIGNUP: `/${version}/Home/RegisterUserAndSendOTP`,
  VERIFY_OTP: `/${version}/Home/VerifyOTP`,
  SIGNIN: `/${version}/Home/SignIn`,
  VERIFY_OTP_SIGNIN: `/${version}/Home/VerifyOTP-SignIn`,
  GET_CITY_LISTING: `/${version}/Home/GetCityListing`,

  // Home
  GET_HOME_SLIDER: `/${version}/Home/GetSliders`,

  // Social
  GET_ACTIVE_USERS: (
    userId?: number,
    pageIndex: number = 1,
    pageSize: number = 20,
  ) =>
    `/${version}/Friends/GetActiveUsers?userId=${userId}&PageIndex=${pageIndex}&PageSize=${pageSize}`,
  SEARCH_FRIENDS: (searchQuery: string, userId?: number) =>
    `/${version}/Friends/SearchFriends?fullname=${searchQuery}&userId=${userId}`,
  ADD_FRIEND: (userId?: number) =>
    `/${version}/Friends/AddFriend?userId=${userId}`,
};

export default apiEndpoints;
