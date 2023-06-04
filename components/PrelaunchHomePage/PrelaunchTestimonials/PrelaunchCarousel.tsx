import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Box, Heading, Text, Flex, Image, Center } from '@chakra-ui/react'
import PrelaunchCard from './PrelaunchCard'

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
  return (
    <Box height="300px" width="100%" position="relative">
      <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop
        autoPlay
        interval={3000}
        renderIndicator={() => null} // Hide the default indicators
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
          <PrelaunchCard key={card.id} {...card} />
        ))}
      </Carousel>
    </Box>
  )
}

export default CardCarousel
