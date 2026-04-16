const version = `v1`;
const apiEndpoints = {
  // ============================================
  // BASE CONFIGURATION
  // ============================================

  // BASE_URL: `https://lms-api-dev.hostinger.bitscollision.net`, // langId: number - Language ID (e.g., 1 for English, 2 for Arabic)
  BASE_URL: `https://api.prod.lms.global`, // langId: number - Language ID (e.g., 1 for English, 2 for Arabic)
  LOCALE: (langId: number) =>
    `/${version}/Home/GetResources?appType=1&langID=${langId}`,

  // ============================================
  // AUTHENTICATION FLOW
  // ============================================

  SIGNUP: `/${version}/Auth/RegisterUserAndSendOTP`,
  SIGNIN: `/${version}/Auth/SignIn`,
  LOGOUT: `/${version}/Auth/LogOut`,
};

export default apiEndpoints;
