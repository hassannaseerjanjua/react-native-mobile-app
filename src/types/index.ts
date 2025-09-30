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
