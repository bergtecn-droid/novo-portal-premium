export interface RadioStation {
  name: string;
  url: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    name: "Nova FM (demo)",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
  },
  {
    name: "Rádio Pop (demo)",
    url: "https://ice1.somafm.com/indiepop-128-mp3",
  },
  {
    name: "Rádio Beat (demo)",
    url: "https://ice1.somafm.com/sonicuniverse-128-mp3",
  },
];

export function radioStations(): RadioStation[] {
  const custom =
    process.env.NEXT_PUBLIC_RADIO_URL && process.env.NEXT_PUBLIC_RADIO_NAME
      ? [
          {
            name: process.env.NEXT_PUBLIC_RADIO_NAME,
            url: process.env.NEXT_PUBLIC_RADIO_URL,
          },
          ...RADIO_STATIONS,
        ]
      : RADIO_STATIONS;
  return custom;
}
