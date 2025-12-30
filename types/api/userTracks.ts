import { TServerResponse } from '../auth';
import { Track } from '../track';

type GetLikedTracksResponseData = {
  tracks: Track[];
};

export type GetLikedTracksResponse = TServerResponse<GetLikedTracksResponseData>;
