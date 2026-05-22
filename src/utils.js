export const generateId = () => Math.random().toString(36).substr(2, 9);

export const indexToTime = (index) => {
  const hour = Math.floor(index / 6);
  const min = (index % 6) * 10;
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

export const getPalette = () => [
  { id: 'slateBlue', bg: '#708090', border: '#5C6C7C', text: '#FFFFFF' },
  { id: 'mutedSky', bg: '#94A6B8', border: '#7C90A3', text: '#FFFFFF' },
  { id: 'dustyGrey', bg: '#A9A9A9', border: '#8F8F8F', text: '#FFFFFF' },
  { id: 'pearlCream', bg: '#EADDD0', border: '#D4C4B5', text: '#4A4A4A' },
  { id: 'softNavy', bg: '#4A5D70', border: '#3A4B5D', text: '#FFFFFF' },
  { id: 'sandBeige', bg: '#CFC0A7', border: '#BCA88B', text: '#4A4A4A' },
  { id: 'coolAsh', bg: '#B0B5B9', border: '#969B9F', text: '#FFFFFF' },
];
