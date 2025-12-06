export const ENDPOINTS = {
  DRIVERS: {
    POST_DRIVER: '/drivers',
    GET_DRIVER: '/drivers',
    PATCH_DRIVER: (id: number) => `/drivers/${id}`,
    DELETE_DRIVER: (id: number) => `/drivers/${id}`,
  },
};
export type EndpointKey = keyof typeof ENDPOINTS;
