import { TServerResponse } from '../auth';
import { FollowedPlaylist, Playlist } from '../playlist';

type GetPlaylistResponseData = {
  playlists: (Playlist | FollowedPlaylist)[];
};

export type GetPlaylistResponse = TServerResponse<GetPlaylistResponseData>;
