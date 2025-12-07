export const ENDPOINTS = {
  DRIVERS: {
    POST_DRIVER: '/drivers',
    GET_DRIVER: '/drivers',
    GET_DRIVER_ID: (id: number) => `/drivers/${id}`,
    PATCH_DRIVER: (id: number) => `/drivers/${id}`,
    DELETE_DRIVER: (id: number) => `/drivers/${id}`,
  },
  CONTROLLERS: {
    POST_CONTROLLER: '/controllers',
    GET_CONTROLLER: '/controllers',
    GET_CONTROLLER_ID: (id: number) => `/controllers/${id}`,
    PATCH_CONTROLLER: (id: number) => `/controllers/${id}`,
    DELETE_CONTROLLER: (id: number) => `/controllers/${id}`,
  },
};
export type EndpointKey = keyof typeof ENDPOINTS;
