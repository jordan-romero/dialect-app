import React from 'react'
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Box, Flex, Icon } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import PrelaunchCard from './PrelaunchCard'

interface Card {
  id: number
  testimonial: string
  name: string
  subtitle: string
  image: string
  altText: string
}

interface CardCarouselProps {
  cards: Card[]
}

const navButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 2,
  width: '48px',
  height: '48px',
  borderRadius: '9999px',
  background: 'white',
  boxShadow: '0 8px 24px -8px rgba(17,24,39,0.25)',
  border: '1px solid rgba(17,24,39,0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#723FC5',
  cursor: 'pointer',
}

const CardCarousel: React.FC<CardCarouselProps> = ({ cards }) => {
  return (
    <Flex align="center" justify="center" width="100%">
      <Box maxWidth="1100px" width="100%">
        <Carousel
          showThumbs={false}
          showStatus={false}
          infiniteLoop
          autoPlay
          interval={6000}
          swipeable
          emulateTouch
          showIndicators
          renderIndicator={(onClickHandler, isSelected, index) => (
            <li
              onClick={onClickHandler}
              onKeyDown={onClickHandler}
              role="button"
              tabIndex={0}
              aria-label={`Slide ${index + 1}`}
              style={{
                display: 'inline-block',
                width: isSelected ? '24px' : '8px',
                height: '8px',
                borderRadius: '9999px',
                background: isSelected ? '#723FC5' : 'rgba(17,24,39,0.18)',
                margin: '0 4px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            />
          )}
          renderArrowPrev={(onClickHandler, hasPrev) =>
            hasPrev && (
              <button
                type="button"
                onClick={onClickHandler}
                aria-label="Previous testimonial"
                style={{ ...navButtonStyle, left: '12px' }}
              >
                <Icon as={ChevronLeftIcon} boxSize={6} />
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext) =>
            hasNext && (
              <button
                type="button"
                onClick={onClickHandler}
                aria-label="Next testimonial"
                style={{ ...navButtonStyle, right: '12px' }}
              >
                <Icon as={ChevronRightIcon} boxSize={6} />
              </button>
            )
          }
        >
          {cards.map((card) => (
            <Box key={card.id} px={{ base: 2, md: 10 }} pb={10}>
              <PrelaunchCard {...card} />
            </Box>
          ))}
        </Carousel>
      </Box>
    </Flex>
  )
}

export default CardCarousel
