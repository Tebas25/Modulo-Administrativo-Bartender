export interface LoginDTO {
  email: string;
  password: string;
}

export interface ResponseLoginDTO {
  access_token: string;
  token_type: string;
}
