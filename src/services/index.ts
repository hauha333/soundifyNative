import { User } from '@/types/user';

export * from './user.service';

// Fake function to simulate async user fetch
export const getUserAsync = async (): Promise<User> => {
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({});
    }, 1000);
  });
};
