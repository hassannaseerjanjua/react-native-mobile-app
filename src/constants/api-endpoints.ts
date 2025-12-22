const version = `v1`;
const apiEndpoints = {
  BASE_URL: `https://giftee-api-dev.hostinger.bitscollision.net`,

  LOCALE: (langId: number) =>
    `/${version}/Home/GetResources?appType=1&langID=${langId}`,

  VERIFY_USERNAME: `/${version}/Auth/VerifyUserName`,
  SIGNUP: `/${version}/Auth/RegisterUserAndSendOTP`,
  VERIFY_OTP: `/${version}/Auth/VerifyOTP`,
  SIGNIN: `/${version}/Auth/SignIn`,
  VERIFY_OTP_SIGNIN: `/${version}/Auth/VerifyOTP-SignIn`,
  GET_CITY_LISTING: `/${version}/Home/GetCityListing`,

  GET_HOME_SLIDER: `/${version}/Home/GetSliders`,
  GET_INBOX_OUTBOX_DETAILS: (isInbox: boolean) =>
    `/${version}/User/GetOrdersForInboxOutbox?inbox=${isInbox}`,

  GET_ACTIVE_USERS: `/${version}/Friends/GetActiveUsers`,
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

  CREATE_OCCASION: `/${version}/User/CreateNewOccasion`,
  UPDATE_OCCASION: (id: any) => `/${version}/User/UpdateOccasion?id=${id}`,
  GET_OCCASION_DETAIL: (id: any) => `/${version}/User/GetOccasionById?id=${id}`,
  GET_OCCASIONS: `/${version}/User/GetAllOccasions`,
  DELETE_OCCASION: (id: any) => `/${version}/User/DeleteOccasion?id=${id}`,

  GET_FAV_STORE: `/${version}/User/GetFavStores`,
  GET_FAV_STORE_ITEMS: (storeId?: any) =>
    storeId
      ? `/${version}/User/GetFavItems?StoreId=${storeId}`
      : `/${version}/User/GetFavItems`,
  HANDLE_FAVORITE_ITEM: `/${version}/User/FavoriteUnFavoriteItem`,
  HANDLE_FAVORITE_STORE: `/${version}/User/FavoriteUnFavoriteStore`,
  GET_STORE_LIST: `/${version}/Panel/GetAllActiveStores`,
  GET_STORE_DETAIL: `/${version}/Panel/GetAllItems`,
  GET_STORE_ITEM_BY_ID: (itemId?: any, isCampaign?: boolean) =>
    `/${version}/Panel/GetItemById?itemId=${itemId}&isCampaign=${isCampaign}`,
  GET_BUSINESS_TYPE: `/${version}/Panel/GetBusinessTypesForPanel`,
  GET_CATEGORIES: `/${version}/Panel/GetCategoriesForPanel?isApp=true`,
  SEND_GIFT_FILTER: `/${version}/User/AddGiftMessageToOrder`,
  GET_ALL_FILTERS: `/${version}/Panel/GetAllFilters`,
  GENERATE_QR_CODE: (orderId: any) =>
    `/${version}/User/generate-qr?orderId=${orderId}`,

  GET_CATCH_ITEMS: `/${version}/User/GetCampaignsForUsers`,

  ADD_TO_CART: `/${version}/User/AddToGiftCart`, // send a gift

  GET_CART_ITEMS: `/${version}/User/GetGiftCart`,
  UPDATE_CART_ITEM_QUANTITY: `/${version}/User/UpdateCart`,
  INITIATE_CHECKOUT: `/${version}/User/InitOrderV2`,
  REMOVE_CART_BY_ID: `/${version}/User/RemoveItemFromCart`,
  GET_CART_COUNT: `/${version}/Home/GetCartItemCount`,
  CLEAR_CART: `/${version}/User/ClearCart`,

  INIT_ORDER_v2: `/${version}/User/InitOrderV2`,
  GET_GIFT_DETAILS: (giftToken: string) =>
    `/${version}/User/gift-info?gifttoken=${giftToken}`,

  // catch
  ADD_CAMPAIGN_TO_CART: `/${version}/User/AddCampaignToCart`,

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
