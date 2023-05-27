import React from 'react'
import AboutCard from './AboutCard'
import { Coach } from '../types'
import { Flex, Heading } from '@chakra-ui/react'
import useMobileCheck from '../hooks/useMobileCheck'

const AboutPageContainer = () => {
  const isMobile = useMobileCheck()
  const aboutPageHeroImg = '/aboutPageHero.png'
  const coaches: Coach[] = [
    {
      name: 'Scott Alan Moffitt',
      title: 'Actor, Dialect Coach',
      bio: 'I’m Scott Alan Moffitt, a Los Angeles based actor and dialect coach, originally from Texas. After earning a BFA in Acting from TCU in Fort Worth, TX, I made the move to Los Angeles where I have been pursuing a career in film and television.',
      longBio:
        'I’ve done funny voices all my life. In college, I figured out I might be able to put that to some good use when a new professor in my theater department introduced me to the International Phonetic Alphabet (IPA). It was shocking to me that I was able to put the silly voices in my head into text -- it was even more shocking when I moved to LA and realized this approach is not something most film actors are familiar with. I aim to change that. As an actor living and auditioning in Los Angeles, I know how stressful the industry can be. I’ve met so many actors who tell me about the anxiety they get when they have an audition requiring a dialect, or even in the decision to add a dialect to their resume. My goal is to give actors the tools to analyze, criticize, and most importantly self-learn dialects and accents. Ultimately, I want to give actors their confidence back!',
      photoSrc: '/scott.jpeg',
      website: 'https://www.actorsdialectcoach.com/',
    },
    {
      name: 'Krista Scott',
      title: 'Professor',
      bio: 'I’m Krista Scott, a Professor of Voice and Acting at Texas Christian University, a Certified Instructor of Fitzmaurice Voicework™ and an Associate Editor of the International Dialects of English Archive (IDEA) website.',
      longBio:
        'I’ve coached voices and dialects at numerous theaters across the country, including The Shakespeare Theatre in Washington, D.C., Shakespeare Dallas, Trinity Shakespeare Festival, Illinois Shakespeare Festival, Connecticut Repertory, Dallas Theater Center, Theatre Three, Uptown Players, Circle Theatre and Kitchen Theatre, among others. Besides private voice coaching, I worked in the De-Cruit program which utilizes Shakespeare’s texts and actor training techniques to help military veterans who have experienced trauma. I’ve directed and taught dialects, voice and performance courses at Ithaca College, University of Connecticut, Syracuse University, University of Mississippi, and The American University in Cairo. I’ve also been  a frequent actor and director at numerous theaters in the DFW Metroplex, and am a member of the Society of Stage Directors and Choreographers. I believe a solid foundation in a phonetic-kinesthetic study of speech is necessary to train "multi-phonological" actors fluent in IPA usage for clarity in classic and contemporary performances and for authenticity in all dialects and accents in all media platforms. The athletic event of acting demands a command of language beyond worldly expectations; my aim is to help actors endeavor toward this mastery.',
      photoSrc: '/krista.jpeg',
      website: 'https://finearts.tcu.edu/faculty_staff/krista-scott/',
    },
  ]

  return (
    <>
      <Heading fontSize="5xl">Meet Your Coaches! Test Test</Heading>
      <Flex
        h="900px"
        justify="space-between"
        alignItems="center"
        style={
          isMobile
            ? undefined
            : {
                backgroundImage: `url(${aboutPageHeroImg})`,
                backgroundSize: 'cover',
              }
        }
      >
        {coaches.map((coach, index) => (
          <AboutCard key={index} {...coach} />
        ))}
      </Flex>
    </>
  )
}

export default AboutPageContainer
