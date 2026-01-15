export interface Playlist {
  id_users_playlists: number;
  id_user: number;
  cover_url: string | null;
  name: string;
  public: number;
  date_add: string;
  last_update: string;
  hash: string;
  type: string;
  tracks_count: number;
  owner: {
    name: string;
  };
}

export interface FollowedPlaylist {
  id_users_playlists_follows: number;
  id_users_playlists: number;
  id_user: number;
  date_add: string;
  type: string;
  playlist: {
    id_users_playlists: number;
    id_user: number;
    cover_url: string | null;
    name: string;
    public: number;
    date_add: string;
    last_update: string;
    hash: string;
    owner: {
      name: string;
      graphics: {
        id_users_graphics: number;
        id_user: number;
        avatar: string;
        banner: string | null;
      };
    };
  };
  tracks_count: number;
}
