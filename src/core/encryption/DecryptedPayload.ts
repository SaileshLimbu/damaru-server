import { Json } from '../../common/interfaces/json';

export interface DecryptedPayload {
  payload: Json;
  aesKey: string;
}
