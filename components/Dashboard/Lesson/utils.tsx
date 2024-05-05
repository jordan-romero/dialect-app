// src/utils/lessonUtils.tsx

import React from 'react'
import { Box } from '@chakra-ui/react'
import { Lesson } from '../Course/courseTypes'
import SymbolQuiz from '../Quiz/SymbolQuiz'
import VowelQuadrilateral from '../Quiz/VowelQuadrilateral'

export const lessonTypeComponentMap = {
  video: (lesson: Lesson) => (
    <Box mb={10} mr="auto" ml="auto" mt={10}>
      <iframe
        width="95%"
        height="530"
        src={lesson.videoUrl}
        title={lesson.title}
        allowFullScreen
      ></iframe>
    </Box>
  ),
  resource: (lesson: Lesson) => (
    <Box
      mb={10}
      mr="auto"
      ml="auto"
      mt={10}
      maxHeight="539px"
      overflowY="scroll"
    >
      <iframe
        width="95%"
        height="500px"
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(
          lesson.resources[0].url,
        )}&embedded=true`}
        title={lesson.resources[0].name}
        allowFullScreen
      ></iframe>
    </Box>
  ),
  symbolQuiz: (lesson: Lesson) => <SymbolQuiz lessonTitle={lesson.title} />,
  vowelQuadrilateral: (lesson: Lesson) => <VowelQuadrilateral />,
}
