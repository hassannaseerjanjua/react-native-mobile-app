const version = `v1`;
const apiEndpoints = {
  // ============================================
  // BASE CONFIGURATION
  // ============================================

  BASE_URL: `https://api.prod.lms.global`,

  // ============================================
  // AUTHENTICATION FLOW
  // ============================================

  SIGNUP: `/${version}/Auth/RegisterUser`,
  SIGNIN: `/${version}/Auth/SignIn`,
  LOGOUT: `/${version}/Auth/LogOut`,

  FAKEEND: `/${version}/Auth/fake`,
};

export default apiEndpoints;
