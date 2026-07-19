import React from 'react'
import { VStack, SimpleGrid, Skeleton, SkeletonText } from '@chakra-ui/react'

// Shown while an exercise's data is loading, so there's no blank flash.
const QuizSkeleton: React.FC = () => (
  <VStack align="stretch" spacing={5} w="100%" py={2}>
    <Skeleton height="26px" width="55%" borderRadius="md" />
    <SkeletonText noOfLines={2} spacing={3} skeletonHeight="3" />
    <SimpleGrid columns={2} spacing={3} mt={1}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height="46px" borderRadius="md" />
      ))}
    </SimpleGrid>
  </VStack>
)

export default QuizSkeleton
