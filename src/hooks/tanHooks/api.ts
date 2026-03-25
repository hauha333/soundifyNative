import { userApi } from '@/services/userTanApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetLikedTracks = () => {
  return useQuery({
    queryKey: ['likedTracks'],
    queryFn: userApi.getLikedTracks
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: userApi.getMe
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: userApi.logout
  });
};


export const useDeleteLikedTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteLikedTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likedTracks'] });
    }
  });
};
