import React from 'react'
import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import { Box, Heading, Text } from '@chakra-ui/react'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import { IPAKeyboardWithRichText } from '../../components/Community/IPAKeyboardWithRichText'

const keyboard = () => {
  return (
    <DashboardLayout>
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
        <Heading size="lg" mb={1}>
          IPA Keyboard
        </Heading>
        <Text color="gray.500" mb={6}>
          Build phonetic transcriptions with formatting and T9-style shortcuts.
        </Text>
        <IPAKeyboardWithRichText />
      </Box>
    </DashboardLayout>
  )
}

export const getServerSideProps = withPageAuthRequired()

export default keyboard
