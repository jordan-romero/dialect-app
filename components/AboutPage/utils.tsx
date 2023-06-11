import { Coach } from '../PrelaunchHomePage/types'
import { FaInstagram, FaTiktok, FaTwitter, FaFacebook } from 'react-icons/fa'
import { Text, Box, Flex } from '@chakra-ui/react'

export const coaches: Coach[] = [
  {
    name: 'Scott Alan Moffitt',
    title: 'Actor & Dialect Coach',
    bio: 'I’m Scott Alan Moffitt, a Los Angeles based Dialect Coach and Actor. After graduating from TCU with a BFA in Acting, I moved to California to pursue a career in film and television. Along the way I discovered a passion for teaching my fellow actors how to effectively acquire new dialects and accents to enhance their careers.',
    longBio: (
      <Flex>
        <Box>
          <Text>
            I’ve done funny voices all my life. In college, I figured out I
            might be able to put that to some good use when a new professor in
            my theater department introduced me to the International Phonetic
            Alphabet (IPA). It was shocking to me that I was able to put the
            silly voices in my head into text -- it was even more shocking when
            I moved to LA and realized this approach is not something most film
            actors are familiar with. <strong>I aim to change that.</strong>
          </Text>
          <Text mt="3">
            As an actor living and auditioning in Los Angeles, I know how
            stressful the industry can be. I’ve met so many actors who tell me
            about the anxiety they get when they have an audition requiring a
            dialect, or even in the decision to add a dialect to their resume.
            My goal is to give actors the tools to analyze, criticize, and most
            importantly <strong>self-learn dialects and accents.</strong>
            Ultimately, I want to give actors their confidence back!
          </Text>
        </Box>
      </Flex>
    ),
    photoSrc: '/scott.jpeg',
    website: 'https://www.actorsdialectcoach.com/',
    websiteSecondary: 'https://www.scottalanmoffitt.com/',
    icons: [FaTiktok, FaInstagram, FaTwitter, FaFacebook],
  },
  {
    name: 'Krista Scott',
    title: 'Actor, Dialect Coach, Director, Professor of Theatre',
    bio: 'I’m Krista Scott, a Professor of Voice and Acting at Texas Christian University, a Certified Instructor of Fitzmaurice Voicework™ and an Associate Editor of the International Dialects of English Archive (IDEA) website. I’ve also been a frequent actor, director and dialect coach at numerous theaters in the DFW Metroplex, and I love guiding performers in techniques which help to build distinctive and dynamic character personas.',
    longBio: (
      <Flex>
        <Box>
          <Text>
            I’ve{' '}
            <strong>coached voices and dialects at numerous theaters</strong>{' '}
            across the country, including The Shakespeare Theatre in Washington,
            D.C., Shakespeare Dallas, Trinity Shakespeare Festival, Illinois
            Shakespeare Festival, Connecticut Repertory, Dallas Theater Center,
            Theatre Three, Uptown Players, Circle Theatre and Kitchen Theatre,
            among others. Besides private voice coaching, I worked in the
            De-Cruit program which utilizes Shakespeare’s texts and actor
            training techniques to help military veterans who have experienced
            trauma. I’ve directed and taught dialects, voice and performance
            courses at Ithaca College, University of Connecticut, Syracuse
            University, University of Mississippi, and The American University
            in Cairo. I’m a member of The Voice and Speech Trainers Association
            and the Society of Stage Directors and Choreographers.
          </Text>
          <Text mt="3">
            I believe a{' '}
            <strong>
              solid foundation in a phonetic-kinesthetic study of speech
            </strong>{' '}
            is necessary to train multi-phonological actors fluent in IPA usage
            for clarity and authenticity in all dialects and accents in all
            genres and media platforms. The athletic event of acting demands a
            command of language beyond worldly expectations;{' '}
            <strong>
              {' '}
              my aim is to help actors endeavor toward this mastery.
            </strong>
          </Text>
        </Box>
      </Flex>
    ),
    photoSrc: '/kristaScott.jpeg',
    website: 'https://finearts.tcu.edu/faculty_staff/krista-scott/',
  },
]

export const removeProtocol = (url: string) =>
  url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')

export const getIconLink = (icon: React.ElementType) => {
  switch (icon) {
    case FaTiktok:
      return 'https://www.tiktok.com/@scottalanmoffitt'
    case FaInstagram:
      return 'https://www.instagram.com/scottalanmoffitt/'
    case FaTwitter:
      return 'https://twitter.com/ReelScottAlan'
    case FaFacebook:
      return 'https://www.facebook.com/scottalanmoffitt'
    default:
      return ''
  }
}
