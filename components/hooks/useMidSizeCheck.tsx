import { useMediaQuery } from '@chakra-ui/react'

const useMidSizeCheck = (): boolean => {
  const [isMidSized] = useMediaQuery('(max-width: 1023px)')
  return isMidSized
}

export default useMidSizeCheck
