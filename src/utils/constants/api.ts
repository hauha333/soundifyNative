export const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Accept-Encoding': 'gzip, deflate, br, brotli, identity',
  'content-type': 'application/json'
};

export const enum API_METHODS {
  POST = 'POST',
  GET = 'GET',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  PUT = 'PUT'
}

export const enum USER_API {
  LOGOUT = '/user/logout',
  ME = '/user/me',
  LIKED_TRACKS = '/user/me/tracks/likes',
  LIKE_TRACK = '/user/me/track/:idTrack/likes'
}

export const enum PLAYER_API {
  MEDIAINITIALIZE = '/media/initialize',
  SEARCH = '/search'
}
export const enum PLAYLIST_API {
  PLAYLISTS = '/user/me/playlists',
  TRACKS = '/user/me/playlists/:idPlaylist/tracks',
  DELETE = '/user/me/playlists/:playlist_id'
}

export const enum AUTHENTICATION_API {
  AUTHENTICATION = '/user/authentication/{type}'
}
export const enum REFRESH_API {
  REFRESH = '/user/refresh'
}
