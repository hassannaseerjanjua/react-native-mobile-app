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
  Email: string;
  PhoneNo: string;
  ProfileUrl: string | null;
  RelationStatus: number;
}

export interface ActiveUsersApiResponse {
  Data: {
    Items: ActiveUser[];
    TotalCount: number;
  };
}
