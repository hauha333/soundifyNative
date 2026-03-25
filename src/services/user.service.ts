import { API_METHODS, AUTHENTICATION_API } from '@/utils/constants/api';

import { api } from './api';
import { AuthenticationResponse, AuthenticationParams } from '@/types/auth';

export const authenticationApi = api.injectEndpoints({
  endpoints: (build) => ({
    authentication: build.mutation<AuthenticationResponse, AuthenticationParams>({
      query: ({ params: { type, ...paramsRest }, body }) => ({
        url: AUTHENTICATION_API.AUTHENTICATION.replace('{type}', type),
        method: API_METHODS.POST,
        params: paramsRest,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body
      })
    })
  })
});

export const { useAuthenticationMutation } = authenticationApi;
