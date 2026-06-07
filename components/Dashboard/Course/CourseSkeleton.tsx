import React from 'react'
import { Box, Skeleton, SkeletonText, Stack } from '@chakra-ui/react'

// Skeleton placeholders shown while the dashboard's course/lesson data loads,
// so the layout appears instantly instead of a blank gap + spinner.

export const SidebarSkeleton: React.FC = () => (
  <Box p={4}>
    {[0, 1].map((group) => (
      <Box key={group} mb={6}>
        <Skeleton height="22px" width="60%" mb={4} borderRadius="md" />
        <Stack spacing={3}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="38px" borderRadius="md" />
          ))}
        </Stack>
      </Box>
    ))}
  </Box>
)

export const LessonSkeleton: React.FC = () => (
  <Box w="100%" h="100vh" p={10} pl={0}>
    {/* Title bar (mirrors the gradient header) */}
    <Skeleton
      height="100px"
      borderTopEndRadius="full"
      borderBottomEndRadius="full"
      mb={8}
    />
    <Box w="96%" mr="auto" ml="auto">
      <SkeletonText noOfLines={3} spacing={4} skeletonHeight="4" mb={8} />
      <Skeleton height="360px" borderRadius="lg" mb={6} />
      <SkeletonText noOfLines={2} spacing={4} skeletonHeight="4" />
    </Box>
  </Box>
)

export default LessonSkeleton
