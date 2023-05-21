import { useMediaQuery } from '@chakra-ui/react';

const useMobileCheck = (): boolean => {
  const [isMobile] = useMediaQuery('(max-width: 767px)');
  return isMobile;
};

export default useMobileCheck;
