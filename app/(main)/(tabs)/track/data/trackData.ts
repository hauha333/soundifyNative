import { Track } from '@/types/api/track'

export const initialTrackData: Track = {
  id_youtube: '',
  owned: false,
  extraSearch: {
    type: 'video',
    name: 'Unknown',
    artist: { name: 'Unknown' },
    duration: 0,
    thumbnails: { url: '', width: 400, height: 225 }
  },
  id_track: 0,
  id_user: null,
  path: 'Unknown',
  title: 'Unknown',
  artist_name: 'Unknown',
  name: 'Unknown',
  description: 'Unknown',
  duration: '0',
  tracks_graphics: [
    {
      id_tracks_graphic: 0,
      cover: 'default_cover.jpg',
      hash: 'default_hash'
    }
  ],
  genre: 'Unnamed genre',
  liked: false
}
