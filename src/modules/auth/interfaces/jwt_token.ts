export interface JwtToken {
  sub: number;
  email: string;
  role: string;
  subRole?: string;
  account?: string;
}
