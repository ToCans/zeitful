const getWaveFillColor = (darkMode: boolean, opacity: number): string => {
  if (darkMode) {
    return `rgba(63,63,70,${opacity})`;
  }

  return `rgba(255,255,255,${opacity})`;
};

export default getWaveFillColor;
