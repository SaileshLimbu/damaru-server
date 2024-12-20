export interface JwtToken {
  sub: number;
  email: string;
  role: string;
  subRole?: string;
  accountName?: string;
  accountId?: number;
}
