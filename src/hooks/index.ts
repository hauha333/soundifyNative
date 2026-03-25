import { AppDispatch } from '@/utils/store';
import { useDispatch } from 'react-redux';

export { default as useColorScheme } from './useColorScheme';
export * from './useDataPersist';
export * from './useKeyboard';

export const useAppDispatch = () => useDispatch<AppDispatch>();
