import React from 'react';
import AboutCard from './AboutCard';
import { Coach } from '../types';
import { Flex } from '@chakra-ui/react';

const AboutPageContainer = () => {
  const coaches: Coach[] = [
    {
      name: 'Scott Alan Moffitt',
      title: 'Actor, Dialect Coach',
      bio: 'I’m Scott Alan Moffitt, a Los Angeles based actor and dialect coach, originally from Texas. After earning a BFA in Acting from TCU in Fort Worth, TX, I made the move to Los Angeles where I have been pursuing a career in film and television.',
      photoSrc: '/scott.jpeg',
      website: 'https://www.actorsdialectcoach.com/',
    },
    {
      name: 'Krista Scott',
      title: 'Professor',
      bio: 'I’m Krista Scott, a Professor of Voice and Acting at Texas Christian University, a Certified Instructor of Fitzmaurice Voicework™ and an Associate Editor of the International Dialects of English Archive (IDEA) website.',
      photoSrc: '/krista.jpeg',
      website: 'https://finearts.tcu.edu/faculty_staff/krista-scott/',
    },
  ];

  return (
    <Flex justify="space-between">
      {coaches.map((coach, index) => (
        <AboutCard key={index} {...coach} />
      ))}
    </Flex>
  );
};

export default AboutPageContainer;

