export type AlarmSound = {
  id: string;
  name: string;
  url: string;
  cover: string;
};

export type AmbientSound = {
  id: string;
  name: string;
  url: string;
  cover: string;
};

export type SoundsApiResponse = {
  alarm: AlarmSound;
  sounds: AmbientSound[];
};
