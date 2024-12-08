import { Json } from '../../common/interfaces/json';

export interface DecryptedPayload {
  data: Json;
  aesKey: string;
  rsaKey: string;
}
