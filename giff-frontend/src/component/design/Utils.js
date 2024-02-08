export const colorSelection = [
  { color: '#FEC901' },
  { color: '#B9F140' },
  { color: '#FD95A7' },
  { color: '#F4149B' },
  { color: '#FD3333' },
  { color: '#0157FE' },
  { color: '#52DE68' },
  { color: '#773329' },
  { color: '#83CEF8' },
  { color: '#5BFDAF' },
  { color: '#0E0B80' },
  { color: '#110946' },
  { color: '#626262' },
  { color: '#1B1A19' },
  { color: '#F5F5F5' },
  { color: '#FA6CC1' },
];

export function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colorSelection?.length);
  return colorSelection[randomIndex].color;
}
