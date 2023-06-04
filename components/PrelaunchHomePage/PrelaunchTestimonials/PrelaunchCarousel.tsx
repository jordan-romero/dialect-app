import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Box, useBreakpointValue, Flex, Center } from '@chakra-ui/react'
import PrelaunchCard from './PrelaunchCard'
import useMidSizeCheck from '../../hooks/useMidSizeCheck'

interface Card {
  id: number
  testimonial: string
  name: string
  subtitle: string
  image: string
}

interface CardCarouselProps {
  cards: Card[]
}

const CardCarousel: React.FC<CardCarouselProps> = ({ cards }) => {
  const isMidSized = useMidSizeCheck()
  const carouselHeight = useBreakpointValue({
    base: 'auto',
    md: '300px',
    lg: '285px',
  })

  return (
    <Flex align="center" justify="center" height={carouselHeight} width="100%">
      <Box maxWidth="1500px" width="100%" h={isMidSized ? undefined : '100%'}>
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={3000}
          renderIndicator={() => null}
          renderArrowPrev={(onClickHandler, hasPrev) =>
            hasPrev && (
              <button
                type="button"
                onClick={onClickHandler}
                aria-label="Previous"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '20px',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
              >
                &lt;
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext) =>
            hasNext && (
              <button
                type="button"
                onClick={onClickHandler}
                aria-label="Next"
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '20px',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
              >
                &gt;
              </button>
            )
          }
        >
          {cards.map((card) => (
            <Center key={card.id}>
              <PrelaunchCard {...card} />
            </Center>
          ))}
        </Carousel>
      </Box>
    </Flex>
  )
}

export default CardCarousel
