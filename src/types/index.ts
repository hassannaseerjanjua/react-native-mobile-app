export interface User {
  UserId: number;
  FullName: string | null;
  UserName: string;
  Email: string;
  Password: string | null;
  DateOfBirth: string | null;
  ProfileUrl: string | null;
  Status: number;
  PhoneNo: string;
  CityId: number;
  City: string | null;
}
