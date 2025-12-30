import { AuthenticationTypes } from './auth';

interface UserConnect {
  idAuthenticationType: number;
  data: null;
  email: string;
  type: AuthenticationTypes;
}

export interface User {
  idUser: number;
  login: string;
  name: string;
  rank: string;
  userConnect: UserConnect[];
  userGraphic: null;
}
