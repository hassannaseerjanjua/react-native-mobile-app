const version = `v1`;
const apiEndpoints = {
  // ============================================
  // BASE CONFIGURATION
  // ============================================

  BASE_URL: `https://giftee-api-dev.hostinger.bitscollision.net`, // langId: number - Language ID (e.g., 1 for English, 2 for Arabic)
  LOCALE: (langId: number) =>
    `/${version}/Home/GetResources?appType=1&langID=${langId}`,

  // ============================================
  // AUTHENTICATION FLOW
  // ============================================

  VERIFY_USERNAME: `/${version}/Auth/VerifyUserName`,
  SIGNUP: `/${version}/Auth/RegisterUserAndSendOTP`,
  VERIFY_OTP: `/${version}/Auth/VerifyOTP`,
  SIGNIN: `/${version}/Auth/SignIn`,
  VERIFY_OTP_SIGNIN: `/${version}/Auth/VerifyOTP-SignIn`,
  SAVE_TOKEN: `/${version}/User/save-token`,
  VERIFY_EMAIL_PHONE: `/${version}/User/VerifyEmailAndPhoneNo`,

  // ============================================
  // HOME & GENERAL
  // ============================================

  GET_CITY_LISTING: `/${version}/Home/GetCityListing`,
  GET_HOME_SLIDER: `/${version}/Home/GetSliders`, // code: string - Static content code (e.g., 'terms', 'privacy')
  GET_STATIC_CONTENT: (code: string) =>
    `/${version}/Home/GetStaticContent?code=${code}`,
  GET_FAQS: `/${version}/Home/GetAllFAQ`,
  CONTACT_US_SUBMIT: `/${version}/Home/ContactUsRequest`,
  VERIFY_USER: `/${version}/User/check-app-users`,

  // ============================================
  // PROFILE & USER MANAGEMENT
  // ============================================

  UPDATE_PROFILE: `/${version}/Home/UpdateProfile`,
  UPDATE_PROFILE_IMAGE: `/${version}/Home/UpdateProfilePhoto`,
  GET_WALLET_BALANCE: `/${version}/Home/GetWallet`,

  // ============================================
  // FRIENDS & GROUPS
  // ============================================

  GET_ACTIVE_USERS: `/${version}/Friends/GetActiveUsers`, // userId?: number - User ID to add as friend (optional)
  ADD_FRIEND: (userId?: number) =>
    `/${version}/Friends/AddFriend?userId=${userId}`, // userId?: number, friendUserId?: number - Current user ID and friend user ID to unfriend (both optional)
  UNFRIEND_USER: (userId?: number, friendUserId?: number) =>
    `/${version}/Friends/UnfriendAUser?userId=${userId}&friendUserId=${friendUserId}`,
  CREATE_GROUP: `/${version}/Friends/CreateGroupWithMembers`, // searchTerm: string (default: '') - Group name search term
  GET_GROUPS: `/${version}/Friends/GroupList`,
  EDIT_GROUP_MEMBERS: `/${version}/Friends/EditGroup`,
  DELETE_GROUP: `/${version}/Friends/DeleteGroup`, // friendUserId?: number - Friend user ID to check if linked with group (optional)
  CHECK_USER_LINKED_WITH_GROUP: (friendUserId?: number) =>
    `/${version}/Friends/CheckFriendInGroups?friendUserId=${friendUserId}`,
  GET_EMPLOYEES: `/${version}/Panel/GetStoreEmployees`,

  // ============================================
  // OCCASIONS
  // ============================================

  CREATE_OCCASION: `/${version}/User/CreateNewOccasion`, // id: number - Occasion ID
  UPDATE_OCCASION: (id: number) => `/${version}/User/UpdateOccasion?id=${id}`, // id: number - Occasion ID
  GET_OCCASION_DETAIL: (id: number) =>
    `/${version}/User/GetOccasionById?id=${id}`,
  GET_OCCASIONS: `/${version}/User/GetAllOccasions`, // id: number - Occasion ID
  DELETE_OCCASION: (id: number) => `/${version}/User/DeleteOccasion?id=${id}`,

  // ============================================
  // STORES & PRODUCTS
  // ============================================

  GET_STORE_LIST: `/${version}/Panel/GetAllActiveStores`,
  GET_STORE_DETAIL: `/${version}/Panel/GetAllItems`,
  GET_SEND_A_GIFT_ITEMS: `/${version}/User/GetAllItemsListingForApp`, // itemId?: number, isCampaign?: boolean - Item ID and campaign flag (both optional)
  GET_STORE_ITEM_BY_ID: (itemId?: number, isCampaign?: boolean) =>
    `/${version}/Panel/GetItemById?itemId=${itemId}&isCampaign=${isCampaign}`,
  GET_SEND_A_GIFT_ITEM_BY_ID: (itemId?: number, isCampaign?: boolean) =>
    `/${version}/User/GetItemByIdV2?itemId=${itemId}&isCampaign=${isCampaign}`,
  GET_BUSINESS_TYPE: `/${version}/User/GetBusinessTypesForUserApp`,
  GET_CATEGORIES: (businessTypeId?: any, storeId?: any) =>
    `/${version}/Panel/GetCategoriesForPanel?isApp=true&businessTypeId=${businessTypeId}&storeId=${storeId}`,
  GET_ALL_FILTERS: `/${version}/Panel/GetAllFilters`,

  // ============================================
  // FAVORITES
  // ============================================

  GET_FAV_STORE: `/${version}/User/GetFavStores`,
  GET_FAV_STORE_ITEMS: `/${version}/User/GetFavItems`,
  HANDLE_FAVORITE_ITEM: `/${version}/User/FavoriteUnFavoriteItem`,
  HANDLE_FAVORITE_STORE: `/${version}/User/FavoriteUnFavoriteStore`,

  // ============================================
  // CART & CHECKOUT
  // ============================================

  ADD_TO_CART: `/${version}/User/AddToGiftCart`,
  GET_CART_ITEMS: `/${version}/User/GetGiftCart`,
  UPDATE_CART_ITEM_QUANTITY: `/${version}/User/UpdateCart`,
  REMOVE_CART_BY_ID: `/${version}/User/RemoveItemFromCart`,
  GET_CART_COUNT: `/${version}/Home/GetCartItemCount`,
  CLEAR_CART: `/${version}/User/ClearCart`,
  INITIATE_CHECKOUT: `/${version}/User/InitOrderV2`,

  // ============================================
  // CATCH & CAMPAIGNS
  // ============================================

  GET_CATCH_ITEMS: `/${version}/User/GetCampaignsForUsers`,
  ADD_CAMPAIGN_TO_CART: `/${version}/User/AddCampaignToCart`,
  GET_CAMPAIGN_CATEGORIES: (campaignType: number, cityId?: number | null) =>
    `/${version}/User/GetCampaignCategories?campaignTypes=${campaignType}&cityId=${cityId}`,

  // ============================================
  // ORDERS & GIFTS
  // ============================================

  GET_INBOX_OUTBOX_DETAILS: `/${version}/User/GetOrdersForInboxOutbox`,
  GET_ORDER_HISTORY: `/${version}/User/GetOrders`,
  INIT_ORDER_v2: `/${version}/User/InitOrderV2`, // giftToken: string - Gift token string
  GET_GIFT_DETAILS: (giftToken: string) =>
    `/${version}/User/gift-info?gifttoken=${giftToken}`, // giftId: number - Gift/Order ID
  GET_SHARE_GIFT_LINK: (giftId: number) =>
    `/${version}/User/GetGiftLink/${giftId}`, // orderId: number - Order ID
  GENERATE_QR_CODE: (orderId: number) =>
    `/${version}/User/generate-qr?orderId=${orderId}`,
  SEND_GIFT_FILTER: `/${version}/User/AddGiftMessageToOrder`,
};

export default apiEndpoints;
