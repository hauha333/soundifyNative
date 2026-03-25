import { ComponentType } from 'react';

type TServerError = {
  message: {
    code: string;
    description: string;
  };
  status: number;
};

export type TServerResponse<T> = T & {
  status: boolean;
  error?: TServerError;
};

export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

export interface IRoute {
  path?: string;
  component: ComponentType;
  index?: false | true;
  children?: IRoute[];
}

export type AuthenticationTypes = 'default';
export type AuthenticationAction = 'loggin';

export type Tokens = {
  refreshToken: string;
  accessToken: string;
};

export type AuthenticationParams = {
  params: {
    type: AuthenticationTypes;
    action: AuthenticationAction;
  };
  body: {
    data: {
      username: string;
      password: string;
    };
  };
};

type AuthenticationResponseData = {
  tokens: Tokens;
};

export type AuthenticationResponse = TServerResponse<AuthenticationResponseData>;
