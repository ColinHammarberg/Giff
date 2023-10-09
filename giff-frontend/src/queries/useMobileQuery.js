import useMediaQuery from '@mui/material/useMediaQuery';

function useMobileQuery() {
  const isMobilePortrait = useMediaQuery('(max-width:600px)');
  const isIpadPortrait = useMediaQuery('(max-width:900px) and (min-width: 600px)');
  const isMobileLandscape = useMediaQuery('(max-width: 926px) and (min-aspect-ratio: 13/9)');

  return {
    isMobile: isMobilePortrait || isMobileLandscape,
    isMobilePortrait,
    isMobileLandscape,
    isIpadPortrait
  };
}

export default useMobileQuery;
