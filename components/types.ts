import { IconType } from 'react-icons'

export type CardData = {
  icon: IconType
  header: string
  body: string
  buttonText: string
}

export type Coach = {
  name: string
  title: string
  bio: string
  longBio: string
  photoSrc: string
  website: string
  websiteSecondary?: string
}
