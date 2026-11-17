// One line of the video's subtitles
export type Subtitle = {
  id: string;
  start: number; // Seconds from the beginning of the video
  end: number;
  text: string;
};
