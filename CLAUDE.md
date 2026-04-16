# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lms** is a React Native mobile application for iOS and Android that enables users to send gifts, manage gift occasions, and connect with friends. The app features authentication, social networking capabilities, wallet management, and multi-language support (English/Arabic with RTL).

## Development Commands

### Running the App

```bash
# Start Metro bundler
yarn start

# Run on Android
yarn android

# Run on Android release build
yarn android-release

# Run on iOS
yarn ios
```

### iOS Setup (First time or after native dependency updates)

```bash
# Install Ruby bundler (first time only)
bundle install

# Install CocoaPods dependencies
bundle exec pod install
```

### Build Uploads

```bash
# Upload Android build
yarn upload-android

# Upload iOS build
yarn upload-ios
```

## Architecture Overview

### Navigation Structure

The app uses React Navigation with a hierarchical structure:

1. **Root Navigator** (src/navigators/stack.navigator.tsx)
   - Conditionally renders either AuthStackNavigator or AppStackNavigator based on `state.auth.isAuthenticated`

2. **Auth Flow** (src/navigators/auth.navigator.tsx)
   - Landing → SignIn/SignUp → OtpVerification

3. **App Flow** (src/navigators/stack.navigator.tsx)
   - Main screen: BottomTabs (Home, Favorites, Occasions, Notifications)
   - Stack screens: Search, SendAGift, SendToGroup, Wallet, Profile, Settings, Orders, FAQ, ContactUs, StaticContent

4. **Deep Linking** (src/navigators/deep-linking.ts)
   - URL scheme: `lms://`
   - Currently configured for home deep link

### State Management

**Redux Toolkit** with **Redux Persist** (persists to AsyncStorage):

- **auth** (src/store/reducer/auth.ts): User authentication state and user data
- **locale** (src/store/reducer/locale.ts): Language settings, translation strings, RTL configuration
- **settings** (src/store/reducer/settings.ts): App settings

Key patterns:

- Store configuration in src/store/store.ts
- Persisted slices: `['settings', 'auth', 'locale']`
- `serializableCheck: false` in middleware for React Native compatibility

### Internationalization (i18n)

The app implements a custom i18n system:

1. **Locale fetching**: `useFetchLocale` hook (src/hooks/useFetchLocale.tsx) fetches translation strings from the API on app start
2. **Locale storage**: Redux slice with langId (1=English, 2=Arabic), langCode, isRtl flag, and strings dictionary
3. **Usage**: `useLocaleStore()` hook provides `getString(key)` function
4. **Language switching**: `useLanguageShifter()` hook switches language and **restarts the app** using `react-native-restart`
5. **RTL handling**: App forces RTL layout via `I18nManager.forceRTL()` when language is Arabic

**Important**: All locale string keys are strictly typed in LocaleState (src/store/reducer/locale.ts). When adding new strings, add the key to the LocaleString type union.

### API Integration

**Centralized API client** (src/utils/api.ts):

- Base URL: Configured in src/constants/api-endpoints.ts
- Axios instance with interceptors
- Auto-injects headers: `LangID` (from locale state) and `UserId` (from auth state)
- Standard response format: `{ success, failed, data, error }`
- All endpoints defined in src/constants/api-endpoints.ts

**API Hooks**:

- `useGetApi` (src/hooks/useGetApi.ts): For single GET requests
- `useListingApi` (src/hooks/useListingApi.ts): For paginated listings
- `useDebouncedSearch` (src/hooks/useDebouncedSearch.ts): For search functionality

### Styling System

Centralized theming system (src/styles/theme.ts):

- **colors.ts**: Color palette
- **sizes.ts**: Device dimensions and responsive utilities
- **global-styles.ts**: Reusable style objects
- `useTheme()` hook provides access to theme, colors, sizes, and globalStyles
- Responsive scaling: `scaleWithMax(min, max)` utility
- Platform-specific helpers: `isAndroidThen()`, `isIOSThen()`
- **RTL utilities** (src/utils/rtl.ts): Functions for RTL-aware positioning

### Component Architecture

**Reusable Global Components** (src/components/global/):

- InputField, Custombutton, DropdownField
- Header, AuthHeader, HomeHeader
- AppBottomSheet, CenterModal, ConfirmationModal, AlertComponent
- FullScreenLoader (via `useScreenLoader` hook)
- ImageSlider, TabItem, HomeScreenTabs

**App-Specific Components** (src/components/app/):

- ParentView, AuthLayout
- FavoriteProductCard, WalletCard, FAQItem, NotificationItem
- SearchUserItem, BottomSheetHeader

**Custom Elements** (src/utils/elements.tsx):

- Custom Text component with RTL awareness

### Key Features & Modules

1. **Authentication**
   - Email/Phone + OTP verification flow
   - Username availability check
   - City selection during signup
   - JWT token management (use `getAuthHeader()` utility)

2. **Social Features**
   - Friend connections
   - Group creation and management
   - User search with debouncing
   - Unfriend with group validation

3. **Gift Management**
   - Send gifts to individuals or groups
   - Gift link sharing
   - Favorites system
   - Order history with WhatsApp integration

4. **Wallet & Payments**
   - Wallet balance display
   - Transaction history

5. **User Profile**
   - Profile editing (name, birthday, gender, city)
   - Profile photo upload
   - Gift link generation

## Important Technical Details

### Metro Configuration

- **SVG Support**: Configured via react-native-svg-transformer
- SVG files are imported as React components
- Asset and source extensions are modified to support .svg files

### Babel Configuration

- Uses `react-native-worklets/plugin` for react-native-reanimated and gesture handler support

### Native Dependencies

Key native modules:

- Firebase (`@react-native-firebase/app`)
- Bootsplash for custom splash screens
- Gesture Handler & Reanimated for animations
- Bottom Sheet (`@gorhom/bottom-sheet`)
- Image Picker, Date Picker
- AsyncStorage for persistence

### Boot Process

1. App.tsx renders with Provider + PersistGate
2. DataWrapper fetches locale strings via `useFetchLocale`
3. RTL is forced if language is Arabic
4. BootSplash hides when locale strings are loaded
5. NavigationContainer with deep linking config renders
6. RootNavigator determines Auth vs App flow

## Common Patterns

### Type-Safe Navigation

Navigation types defined in src/types/navigation.types.ts:

- AuthStackParamList
- AppStackParamList
- Use typed navigation hooks from React Navigation

### Form Validation

Formik + Yup validation schemas defined in src/utils/validationSchemas.ts

### Notifications & Alerts

- `useAlert()` hook (src/hooks/useAlert.tsx) for alerts
- `notify()` utility (src/utils/notify.ts) for toasts

### Loading States

- `useScreenLoader()` hook for full-screen loading overlays
- Component-level loading states

## File Organization

```
src/
├── assets/           # Images, fonts, icons (SVG)
├── components/       # Reusable UI components
│   ├── global/       # App-wide components
│   ├── app/          # Feature-specific components
│   └── send-a-gift/  # Gift-sending feature components
├── constants/        # API endpoints, constants
├── hooks/            # Custom React hooks
├── navigators/       # Navigation configuration
├── screens/          # Screen components
│   ├── auth/         # Authentication screens
│   └── app/          # Authenticated app screens
├── store/            # Redux store and slices
│   └── reducer/      # Redux reducers
├── styles/           # Theme, colors, sizes, global styles
├── types/            # TypeScript type definitions
└── utils/            # Utility functions, API client, validation
```

## Development Notes

- **Node version**: Requires Node >= 20
- **TypeScript**: Fully typed codebase with strict types for navigation and locale strings
- **Console logging**: API calls are logged in development (see src/utils/api.ts:73)
- **Code quality**: ESLint configured, Prettier for formatting
