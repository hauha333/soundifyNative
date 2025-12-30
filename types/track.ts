export interface TrackGaphics {
  cover: string;
  hash: string;
  id_tracks_graphic: number;
}

export interface Track {
  track: any;
  owned: any;
  extraSearch: any;
  id_track: number;
  id_youtube: string;
  id_user: number | null;
  path: string;
  artist_name: string;
  genre: string;
  title: string;
  name: string;
  description: string | null;
  duration: string;
  liked: boolean;
  tracks_graphics: TrackGaphics[];
}
