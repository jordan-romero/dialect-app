import { IconType } from 'react-icons'
import {
  MdMovieFilter,
  MdTheaterComedy,
  MdPsychology,
  MdFlag,
  MdMilitaryTech,
  MdTrendingUp,
  MdBolt,
  MdSchool,
  MdWorkspacePremium,
} from 'react-icons/md'

export interface BadgeVisual {
  icon: IconType
  grad: string
}

// Each badge's icon + gradient. Shared by the Dashboard grid and the
// badge-earned celebration so they always match.
export const BADGE_VISUALS: Record<string, BadgeVisual> = {
  first: { icon: MdMovieFilter, grad: 'linear(to-br, #5F53CF, #8B5CF6)' },
  breakaleg: { icon: MdTheaterComedy, grad: 'linear(to-br, #EC4899, #8B5CF6)' },
  quiz10: { icon: MdPsychology, grad: 'linear(to-br, #7EACE2, #60A5FA)' },
  checkpoint: { icon: MdFlag, grad: 'linear(to-br, #14B8A6, #0EA5E9)' },
  phase1: { icon: MdMilitaryTech, grad: 'linear(to-br, #F59E0B, #FBBF24)' },
  phase2: { icon: MdMilitaryTech, grad: 'linear(to-br, #9CA3AF, #D1D5DB)' },
  phase3: { icon: MdMilitaryTech, grad: 'linear(to-br, #B45309, #D97706)' },
  // On a Roll — momentum (not the flame; the streak card already uses flame).
  streak3: { icon: MdTrendingUp, grad: 'linear(to-br, #10B981, #14B8A6)' },
  streak7: { icon: MdBolt, grad: 'linear(to-br, #FBBF24, #F97316)' },
  complete: { icon: MdSchool, grad: 'linear(to-br, #5F53CF, #7EACE2)' },
}

export const FALLBACK_VISUAL: BadgeVisual = {
  icon: MdWorkspacePremium,
  grad: 'linear(to-br, #5F53CF, #7EACE2)',
}

export const visualFor = (id: string): BadgeVisual =>
  BADGE_VISUALS[id] || FALLBACK_VISUAL
