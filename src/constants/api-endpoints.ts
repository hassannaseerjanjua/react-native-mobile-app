const version = `v1`;
const apiEndpoints = {
  // Base URL
  BASE_URL: `https://giftee-api-dev.hostinger.bitscollision.net`,

  // App
  LOCALE: (langId: number) =>
    `/${version}/Home/GetResources?appType=1&langID=${langId}`,

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
    friends: boolean = false,
    searchTerm?: string,
  ) =>
    `/${version}/Friends/GetActiveUsers?userId=${userId}&friends=${friends}&PageIndex=${pageIndex}&PageSize=${pageSize}${
      searchTerm ? `&searchTerm=${searchTerm}` : ''
    }`,
  SEARCH_FRIENDS: (searchQuery: string, userId?: number) =>
    `/${version}/Friends/SearchFriends?fullname=${searchQuery}&userId=${userId}`,
  ADD_FRIEND: (userId?: number) =>
    `/${version}/Friends/AddFriend?userId=${userId}`,
  UNFRIEND_USER: (userId?: number, friendUserId?: number) =>
    `/${version}/Friends/UnfriendAUser?userId=${userId}&friendUserId=${friendUserId}`,
  CREATE_GROUP: `/${version}/Friends/CreateGroupWithMembers`,
  GET_GROUPS: (searchTerm: string = '') =>
    `/${version}/Friends/GroupList${
      searchTerm ? `?SearchTerm=${searchTerm}` : ''
    }`,
  EDIT_GROUP_MEMBERS: `/${version}/Friends/EditGroup`,
  DELETE_GROUP: `/${version}/Friends/DeleteGroup`,
  CHECK_USER_LINKED_WITH_GROUP: (friendUserId?: number) =>
    `/${version}/Friends/CheckFriendInGroups?friendUserId=${friendUserId}`,

  //occasions
  CREATE_OCCASION: `/${version}/User/CreateNewOccasion`,
  UPDATE_OCCASION: (id: any) => `/${version}/User/UpdateOccasion?id=${id}`,
  GET_OCCASION_DETAIL: (id: any) => `/${version}/User/GetOccasionById?id=${id}`,
  GET_OCCASIONS: `/${version}/User/GetAllOccasions`,
  DELETE_OCCASION: (id: any) => `/${version}/User/DeleteOccasion?id=${id}`,

  //store
  GET_FAV_STORE: `/${version}/User/GetFavStores`,
  GET_FAV_STORE_ITEMS: (storeId?: any) =>
    storeId
      ? `/${version}/User/GetFavItems?StoreId=${storeId}`
      : `/${version}/User/GetFavItems`,
  HANDLE_FAVORITE_ITEM: `/${version}/User/FavoriteUnFavoriteItem`,
  GET_STORE_LIST: `/${version}/Panel/GetAllActiveStores`,
  GET_STORE_DETAIL: (storeId?: any, storeBranchId?: any) =>
    `/${version}/Panel/GetAllItems?StoreId=${storeId}`,
  GET_STORE_ITEM_BY_ID: (itemId?: any) =>
    `/${version}/Panel/GetItemById?itemId=${itemId}`,
  GET_BUSINESS_TYPE: `/${version}/Panel/GetBusinessTypesForPanel`,
  GET_CATEGORIES: `/${version}/Panel/GetCategoriesForPanel`,

  // Cart APIS
  ADD_TO_CART: `/${version}/User/AddToGiftCart`,
  GET_CART_ITEMS: `/${version}/User/GetGiftCart`,
  UPDATE_CART_ITEM_QUANTITY: `/${version}/User/UpdateCart`,
  INITIATE_CHECKOUT: `/${version}/User/InitOrder`,
  REMOVE_CART_BY_ID: `/${version}/User/RemoveItemFromCart`,
  GET_CART_COUNT: `/${version}/Home/GetCartItemCount`,

  // Settings
  GET_WALLET_BALANCE: `/${version}/Home/GetWallet`,
  CONTACT_US_SUBMIT: `/${version}/Home/ContactUsRequest`,
  GET_STATIC_CONTENT: (code: string) =>
    `/${version}/Home/GetStaticContent?code=${code}`,
  UPDATE_PROFILE: `/${version}/Home/UpdateProfile`,
  GET_FAQS: `/${version}/Home/GetAllFAQ`,
  UPDATE_PROFILE_IMAGE: `/${version}/Home/UpdateProfilePhoto`,
  GET_ORDER_HISTORY: `/${version}/User/GetOrders`,
};

export default apiEndpoints;
