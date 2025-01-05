export interface JwtToken {
  sub: string;
  email: string;
  role: string;
  subRole?: string;
  accountName?: string;
  accountId?: string;
}
