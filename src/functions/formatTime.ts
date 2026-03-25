import dayjs from './../utils/lib/dayjs';

export const formatTime = (seconds: number): string => {
  const time = dayjs.duration(seconds);

  const mins = String(time.minutes()).padStart(1, '0');
  const secs = String(time.seconds()).padStart(2, '0');

  return `${mins}:${secs}`;
};
