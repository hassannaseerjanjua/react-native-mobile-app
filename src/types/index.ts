export interface City {
  CityID: number;
  CityNameEn: string | null;
  CityNameAr: string | null;
  CityName: string;
  Status: number;
}

export interface Slider {
  SliderId: number;
  NameEn: string | null;
  NameAr: string | null;
  DescEn: string | null;
  DescAr: string | null;
  ImageUrl: string;
  DisplayOrder: number;
  Status: number;
  StartDate: string | null;
  EndDate: string | null;
  CreatedOn: string;
  CreatedBy: number;
  ModifiedOn: string | null;
  ModifiedBy: number | null;
}

export interface SliderApiResponse {
  Data: Slider[];
}

export interface User {
  UserId: number;
  FullNameEn: string | null;
  FullNameAr: string | null;
  UserName: string;
  Email: string;
  Password: string | null;
  DateOfBirth: string | null;
  GenderId: number | null;
  ProfileUrl: string | null;
  Status: number;
  PhoneNo: string;
  CreatedOn: string;
  CreatedBy: number;
  ModifiedOn: string | null;
  ModifiedBy: number | null;
  CityId: number;
  City: string | null;
  IsBirthdayUpdated: boolean;
  IsVerified: boolean;
  isMerchant: number;
}

export interface LoginApiResponse {
  Data: {
    User: User;
    JwtToken: string;
  };
}

export interface ActiveUser {
  UserId: number;
  FullName: string;
  Email?: string;
  PhoneNo?: string;
  ProfileUrl: string | null;
  CityId?: number;
  RelationStatus: number;
  IsVerified: boolean;
  OrdersCount?: number | null;
}

export interface ActiveUsersApiResponse {
  Data: {
    Items: ActiveUser[];
    TotalCount: number;
  };
}

export interface getGroupsDataApiResponse {
  Data: {
    Items: GroupData[];
    TotalCount: number;
  };
}

export interface GroupMember {
  UserGroupMemberId: number;
  UserId: number;
  FullName: string;
  ProfileUrl: string;
  RelationStatus: number;
}

export interface GroupData {
  UserGroupId: number;
  GroupName: string;
  Type: string | null;
  ImageUrl: string;
  CreatedBy: number;
  Status: number;
  UserGroupMembersList: GroupMember[];
}

export interface SearchFriendsApiResponse {
  Data: ActiveUser[];
}

export interface StaticContentType {
  StaticPageId: number;
  Code: string;
  ContentEn: string;
  ContentAr: string;
  Status: number;
  CreatedOn: string;
  ModifiedOn: string | null;
  CreatedBy: number;
  ModifiedBy: number | null;
}

export interface FAQ {
  FaqId: number;
  QuestionEn: string;
  QuestionAr: string;
  AnswerEn: string;
  AnswerAr: string;
  Status: number;
}

export interface FAQApiResponse {
  Data: {
    Items: FAQ[];
    TotalCount: number;
  };
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export interface UpdateProfileApiResponse {
  Data: User;
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export interface fetchApiResponse<T> {
  Success: boolean;
  ResponseMessage?: string;
  Data?: T;
  ResponseCode?: number;
}
export interface FavStoreItems {
  FavItemId: number;
  ItemId: number;
  ItemNameEn: string;
  ItemNameAr: string;
  ItemImage: string;
  StoreId: number;
  StoreBranchId: number;
  CategoryId: number;
  CategoryNameEn: string;
  CategoryNameAr: string;
}
export interface FavStores {
  FavStoreId: number;
  StoreId: number;
  StoreBranchID: number;
  StoreNameEn: string;
  StoreNameAr: string;
  ImageLogo: string | null;
  ImageCover: string | null;
  BusinessTypeId: string;
  BusinessTypeNameEn: string;
  BusinessTypeNameAr: string;
  isVerified: boolean;
  SpecialPriceMenuApplied: boolean;
}
export interface FaveItems {
  Campaign: {
    CampaignId: number;
    Type: number;
    Percentage: number;
    StartDate: string | null;
    EndDate: string | null;
    IsLifeTime: boolean;
    IsAllItems: boolean;
    IsCustomUsers: boolean;
    IsVerifiedUsers: boolean;
  };
  FavItemId: number;
  ItemId: number;
  ItemNameEn: string;
  ItemNameAr: string;
  ItemImage: string;
  StoreId: number;
  FinalPrice: number;
  StoreBranchId: number;
  CategoryId: number;
  CategoryNameEn: string;
  CategoryNameAr: string;
  Price: number;
  isFavourite: boolean;
}

export interface OccasionsApiResponse {
  Data: {
    Items: Occasion[];
    TotalCount: number;
  };
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export interface Occasion {
  OccassionId: number;
  NameEn: string;
  NameAr: string;
  OccasionDate: string | null;
  Type: string | null;
  ImageUrl: string;
  Status: number;
  CreatedOn: string;
  CreatedBy: number;
  ModifiedOn?: string | null;
  ModifiedBy?: number | null;
}

export interface OrderItemVariant {
  CountInCart: number;
  FeelingFee: number;
  FinalPrice: number;
  IsAddedToCart: boolean;
  IsDefault: boolean;
  ItemId: number | null;
  ItemVariantId: number;
  NameAr: string;
  NameEn: string;
  Price: number;
  Status: number;
  DiscountedPrice: number;
}

export interface OrderItem {
  OrderItemId: number;
  ItemId: number;
  ItemName: string;
  UnitPrice: number;
  Quantity: number;
  OrderAmount: number;
  DiscountAmount: number;
  VatAmount: number;
  FeelingFees: number;
  DeliveryCharges: number;
  TotalAmount: number;
  Status: number;
  Variant: OrderItemVariant | null;
  Images: string[];
  ThumbnailUrl: string | null;
}

export interface Order {
  OrderId: number;
  FriendId: number;
  FriendName: string | null;
  StoreId: number;
  StoreBranchId: number;
  Status: number;
  OrderAmount: number;
  TotalDiscount: number;
  TotalVat: number;
  DeliveryCharges: number;
  TotalAmount: number;
  Items: OrderItem[];
  CreatedOn?: string;
  OrderDate?: string;
  OrderTime?: any;
  stores?: {
    StoreId: number;
    NameEn: string;
    NameAr: string;
    Email: string;
    PhoneNo: string;
    NationalAddress: string | null;
  };
}

export interface OrdersApiResponse {
  Data: {
    Items: Order[];
    TotalCount: number;
  };
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export interface InboxOrderImage {
  OrderImageId: number;
  FilterId: number;
  Status: number;
  OrderId: number;
  CreatedOn: string;
  CreatedBy: number;
  ImageUrl: string;
}

export interface InboxOrderItemImage {
  ItemImageId: number;
  DisplaySeqNo: number | null;
  isDefault: boolean | null;
  ImageUrl: string | null;
  ImageUrls: string;
  ItemVariantId: number | null;
}

export interface InboxOrderItemVariant {
  NameEn: string;
  NameAr: string;
  ItemVariantId: number;
  Status: number;
  Price: number;
}

export interface InboxOrderItem {
  OrderItemId: number;
  ItemId: number;
  ItemName: string;
  ThumbnailUrl: string | null;
  UnitPrice: number;
  Quantity: number;
  OrderAmount: number;
  DiscountAmount: number;
  VatAmount: number;
  FeelingFees: number;
  DeliveryCharges: number;
  TotalAmount: number;
  Status: number;
  Variant: InboxOrderItemVariant | null;
  Images: InboxOrderItemImage[];
  UsedQuantity: number;
  EhsaanAmount: number;
}

export interface InboxOrderUser {
  UserId: number;
  FullName: string;
  GenderID: number | null;
  DOB: string | null;
  PhoneNo: string;
  CityId: number | null;
  ProfileUrl: string | null;
  isVerified: boolean;
}

export interface InboxOrderStore {
  StoreId: number;
  NameEn: string;
  NameAr: string;
  Email: string;
  PhoneNo: string;
  NationalAddress: string | null;
  IsDeliveryEnabled: boolean;
  ImageLogo: string;
  Lat: number;
  Long: number;
}

export interface InboxOrder {
  OrderId: number;
  FriendId: number;
  UserId: number;
  FriendName: string | null;
  FriendImageUrl: string | null;
  StoreId: number;
  StoreBranchId: number;
  Status: number;
  SendType: number;
  OrderAmount: number;
  TotalDiscount: number;
  TotalVat: number;
  DeliveryCharges: number;
  TotalAmount: number;
  OrderTime: string;
  OrderFilterId: number;
  Items: InboxOrderItem[];
  orderImages: InboxOrderImage[];
  users: InboxOrderUser;
  stores: InboxOrderStore;
  catchId: number;
  OrderMessage: string | null;
  CampaginType: number;
  EhsaanAmount: number;
  MultiUsers?: MultiUser[];
}

export interface InboxApiResponseData {
  Data: {
    Items: InboxOrder[];
    TotalCount: number;
  };
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export interface InboxApiResponse {
  success: boolean;
  failed: boolean;
  data: InboxApiResponseData;
  error: string;
}

export interface StoreDocument {
  DocumentType: string;
  FileUrl: string;
}

export interface BusinessType {
  BusinessTypeId: number;
  NameEn: string;
  NameAr: string;
  IsActive: boolean;
  Status: number;
}

export interface Category {
  CategoryId: number;
  NameEn: string;
  NameAr: string;
  CategoryImage: string;
  IsActive: boolean;
  Status: number;
}

export interface CampaignCategoriesApiResponse {
  Data: CampaignCategory[];
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export interface CampaignCategoryItem {
  CategoryId: number;
  CategoryNameEn: string;
  CategoryNameAr: string;
}

export interface CampaignCategory {
  CampaignId: number;
  Categories: CampaignCategoryItem[];
}

export interface Store {
  StoreId: number;
  UserId: number;
  NameEn: string;
  NameAr: string;
  BrandNameEn: string;
  BrandNameAr: string;
  DescriptionEn: string | null;
  DescriptionAr: string | null;
  BankName: string;
  IBAN: string;
  CityId: number;
  CityNameEn: string;
  CityNameAr: string;
  Email: string;
  PhoneNo: string;
  CompanyRegistrationNo: string;
  VATNumber: string;
  IsDeliveryEnabled: boolean;
  NationalAddress: string;
  CreatedOn: string;
  BusinessTypeID: number;
  BusinessTypeName: string;
  isFavourite: boolean;
  ImageLogo: string | null;
  ImageCover: string | null;
  Documents: StoreDocument[];
  isVerified: boolean;
  SpecialPriceMenuApplied: boolean;
}

export interface StoreListApiResponse {
  Data: {
    Items: Store[];
    TotalCount: number;
  };
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export interface StoreProduct {
  Campaign: {
    CampaignId: number;
    Type: number;
    Percentage: number;
    StartDate: string;
    EndDate: string;
    IsLifeTime: boolean;
    IsAllItems: boolean;
    IsCustomUsers: boolean;
    IsVerifiedUsers: boolean;
  };
  isFavourite: boolean;
  CategoryNameEn: string;
  CategoryNameAr: string;
  ItemId: number;
  NameEn: string;
  NameAr: string;
  DescEn: string;
  DescAr: string;
  Variants: OrderItemVariant[];
  Status: number;
  Price: number;
  Thumbnail: string | null;
  CreatedOn: string;
  CreatedBy: number;
  StoreId: number;
  StoreBranchId: number;
  CategoryId: number;
  FinalPrice: number;
  DiscountedPrice?: number;
  Categories: any | null;
}

export interface CartItemImage {
  ItemImageId: number;
  DisplaySeqNo: number | null;
  isDefault: boolean | null;
  ImageUrl: string | null;
  ImageUrls: string;
  ItemVariantId: number | null;
}

export interface CartItemVariant {
  NameEn: string;
  NameAr: string;
  ItemVariantId: number;
  Status: number;
  Price: number;
}

export interface CartItem {
  OrderItemId: number;
  ItemId: number;
  ItemName: string;
  ThumbnailUrl: string | null;
  UnitPrice: number;
  Quantity: number;
  OrderAmount: number;
  DiscountAmount: number;
  VatAmount: number;
  FeelingFees: number;
  DeliveryCharges: number;
  TotalAmount: number;
  Status: number;
  Variant: CartItemVariant;
  Images: CartItemImage[];
}

export interface MultiUser {
  UserId: number;
  FullName: string;
  FullNameAr: string | null;
  GenderID: number | null;
  DOB: string | null;
  PhoneNo: string;
  CityId: number | null;
  ProfileUrl: string | null;
  isEmployee: boolean | null;
  isVerified: boolean | null;
}
export interface CartResponse {
  OrderId: number;
  FriendId: number | null;
  FriendIds?: number[] | null;
  FriendName: string | null;
  FriendImageUrl: string | null;
  StoreId: number;
  StoreBranchId: number;
  Status: number;
  OrderAmount: number;
  TotalDiscount: number;
  TotalVat: number;
  DeliveryCharges: number;
  TotalAmount: number;
  Items: CartItem[];
  SendType: number;
  CampaginType: number;
  EhsaanAmount?: number;
  users: MultiUser;
  MultiUsers: MultiUser[];
}

export interface StoreProductApiResponse {
  Data: {
    Items: StoreProduct[];
    TotalCount: number;
  };
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export interface GiftFilter {
  FilterId: number;
  TextColor: string;
  BgColor: string;
  File: string | null;
  ImageUrl: string;
  Status: number;
}

export interface CatchItem {
  CampaignId: number;
  ItemId: number;
  ItemNameEn: string;
  ItemNameAr: string;
  ItemImage: string;
  ItemVariantId: number | null;
  ItemPrice: number;
  DiscountedPrice: number;
  StartDate: string;
  EndDate: string;
  ItemQuantity: number;
  Type: number;
  Percentage: number;
  Status: number;
  StoreId: number;
  StoreNameEn: string;
  StoreNameAr: string;
  StoreBranchId: number;
  StoreBranchNameEn: string;
  StoreBranchNameAr: string;
  CategoryId: number;
  CategoryNameEn: string;
  CategoryNameAr: string;
  FinalPrice: number;
}

export interface QrCodeData {
  OrderId: number;
  QrCodeBase64: string;
  UniqueCode: string;
  ExpiresAt: string;
}

export interface QrCodeApiResponse {
  Data: {
    Data: QrCodeData;
    ResponseCode: number;
    Success: boolean;
    ResponseMessage: string;
  };
}

export interface CatchItemsApiResponse {
  Data: {
    Items: CatchItem[];
    TotalCount: number;
  };
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}

export const mockCatchItems = [
  {
    id: '1',
    title: 'Pink Charm Bouquet',
    subtitle: 'Bouquet',
    coverImage: require('../assets/images/img-placeholder.png'),
    category: 'bouquet',
    description:
      'Hand-tied bouquet of blush roses and lilies designed for heartfelt celebrations, finished with silk ribbon twists and fragrant eucalyptus sprigs. Each stem is selected at peak bloom to create a lasting impression that feels both romantic and refined.',
    price: 100,
    discountedPrice: 50,
    isGift: true,
    subTitle2: 'Flowers',
  },
  {
    id: '2',
    title: 'Pink Charm Bouquet',
    subtitle: 'Bouquet',
    coverImage: require('../assets/images/img-placeholder.png'),
    category: 'bouquet',
    description:
      "Soft pink blooms paired with baby's breath to complement romantic gifting moments, offering a modern take on classic floral storytelling. The bouquet rests in a reusable glass vase, inviting the recipient to refresh it season after season.",
    price: 100,
    discountedPrice: 50,
    isGift: false,
    subTitle2: 'Flowers',
  },
  {
    id: '3',
    title: 'Pink Charm Cake',
    subtitle: 'Cake',
    coverImage: require('../assets/images/img-placeholder.png'),
    category: 'cake',
    discountedPrice: 0,
    isGift: true,
    subTitle2: 'Cake',

    description:
      'Vanilla sponge layered with rose-infused frosting for a lightly floral dessert that melts at the first bite and finishes with a whisper of citrus. Finished with hand-piped rosettes, it transforms any gathering into an elegant celebration.',
    price: 100,
  },
  {
    id: '4',
    title: 'Pink Charm Cake',
    subtitle: 'Cake',
    coverImage: require('../assets/images/img-placeholder.png'),
    category: 'cake',
    discountedPrice: 12,
    subTitle2: 'Cake',
    isGift: false,
    description:
      'Signature pink charm cake topped with sugared petals and a satin ribbon finish, offering layers of airy sponge, silky mousse, and a hidden berry compote center. Designed for milestone moments, it photographs beautifully and tastes even better.',
    price: 14,
  },
];

export interface Notification {
  NotificationId: number;
  UserId: number;
  StoreId: number | null;
  TitleEn: string;
  TitleAr: string;
  DescriptionEn: string;
  DescriptionAr: string;
  Image: string | null;
  JsonData: string;
  NotificationType: number;
  CreatedOn: string;
}

export interface NotificationsApiResponse {
  Data: {
    Items: Notification[];
    TotalCount: number;
  };
  ResponseCode: number;
  Success: boolean;
  ResponseMessage: string;
}
