export interface Json {
  [key: string]: string | boolean | object | number | Json;
}
