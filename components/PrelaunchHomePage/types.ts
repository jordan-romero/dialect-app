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
  longBio: any
  photoSrc: string
  website: string
  websiteSecondary?: string
  icons: IconType[]
}
