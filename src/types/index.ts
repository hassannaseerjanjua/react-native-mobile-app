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
}

export interface LoginApiResponse {
  Data: {
    Message: string;
    User: User;
  };
}

export interface ActiveUser {
  UserId: number;
  FullName: string;
  Email?: string;
  PhoneNo?: string;
  ProfileUrl: string | null;
  RelationStatus: number;
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

export interface StaticContent {
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
}
export interface FaveItems {
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
  Price: number;
  IsFavorite: boolean;
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
  NameEn: string;
  NameAr: string;
  ItemVariantId: number;
  Status: number;
  Price: number;
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

export interface StoreDocument {
  DocumentType: string;
  FileUrl: string;
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
  Documents: StoreDocument[];
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
  IsFavorite: boolean;
  CategoryNameEn: string;
  CategoryNameAr: string;
  ItemId: number;
  NameEn: string;
  NameAr: string;
  DescEn: string;
  DescAr: string;
  Status: number;
  Price: number;
  Thumbnail: string | null;
  CreatedOn: string;
  CreatedBy: number;
  StoreId: number;
  StoreBranchId: number;
  CategoryId: number;
  Categories: any | null;
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
