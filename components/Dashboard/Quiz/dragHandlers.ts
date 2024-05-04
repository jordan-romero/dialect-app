import { DropResult } from 'react-beautiful-dnd'
import { AnswerOption } from './QuizTypes'

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export const handleDragEndRhymingPairs = (
  result: DropResult,
  rhymingWords: AnswerOption[],
  setRhymingWords: SetState<AnswerOption[]>,
  answeredWords: AnswerOption[],
  setAnsweredWords: SetState<AnswerOption[]>,
): void => {
  const { source, destination } = result
  if (!destination) return // No drop target

  const sourceItems =
    source.droppableId === 'wordBank' ? answeredWords : rhymingWords
  const destinationItems =
    destination.droppableId === 'rhymingBox' ? rhymingWords : answeredWords
  const movedItem = sourceItems[source.index]
  sourceItems.splice(source.index, 1)
  destinationItems.splice(destination.index, 0, movedItem)

  if (
    destination.droppableId === 'rhymingBox' &&
    destinationItems.length === 2
  ) {
    const match =
      destinationItems[0].rhymingWordId === destinationItems[1].id ||
      destinationItems[1].rhymingWordId === destinationItems[0].id
    setTimeout(() => {
      if (match) {
        setRhymingWords([])
      } else {
        setRhymingWords([])
        setAnsweredWords([...answeredWords, ...destinationItems])
      }
    }, 1000)
  } else {
    setRhymingWords([...rhymingWords])
    setAnsweredWords([...answeredWords])
  }
}

// export const handleDragEndRhymingCategories = (
//   result: DropResult,
//   categories: { [category: string]: AnswerOption[] },
//   setCategories: SetState<{ [category: string]: AnswerOption[] }>,
//   wordBank: AnswerOption[],
//   setWordBank: SetState<AnswerOption[]>,
// ): void => {
//   const { source, destination } = result
//   if (!destination) return

//   const start =
//     source.droppableId === 'wordBank'
//       ? wordBank
//       : categories[source.droppableId] || []
//   const finish =
//     destination.droppableId === 'wordBank'
//       ? wordBank
//       : categories[destination.droppableId] || []

//   if (start === finish) {
//     return
//   }

//   const movedItem = start[source.index]
//   if (movedItem) {
//     start.splice(source.index, 1)
//     finish.splice(destination.index, 0, movedItem)

//     if (destination.droppableId !== 'wordBank') {
//       const correct = movedItem.rhymeCategory === destination.droppableId
//       setTimeout(() => {
//         if (correct) {
//           setCategories({
//             ...categories,
//             [destination.droppableId]: [
//               ...finish.filter((item) => item.id !== movedItem.id),
//             ],
//           })
//         } else {
//           setWordBank([...wordBank, movedItem])
//           setCategories({
//             ...categories,
//             [destination.droppableId]: finish.filter(
//               (item) => item.id !== movedItem.id,
//             ),
//           })
//         }
//       }, 1000)
//     } else {
//       setWordBank([...finish])
//       setCategories({
//         ...categories,
//         [source.droppableId]: [...start],
//       })
//     }
//   }
// }

export const handleDragEndRhymingCategories = (
  result: DropResult,
  categories: { [category: string]: AnswerOption[] },
  setCategories: SetState<{ [category: string]: AnswerOption[] }>,
  wordBank: AnswerOption[],
  setWordBank: SetState<AnswerOption[]>,
): void => {
  const { source, destination } = result
  if (!destination) return

  const start =
    source.droppableId === 'wordBank'
      ? wordBank
      : categories[source.droppableId] || []
  const finish =
    destination.droppableId === 'wordBank'
      ? wordBank
      : categories[destination.droppableId] || []

  if (start === finish) {
    return
  }

  const movedItem = start[source.index]
  if (movedItem) {
    start.splice(source.index, 1)
    finish.splice(destination.index, 0, movedItem)

    if (destination.droppableId !== 'wordBank') {
      const correct = movedItem.rhymeCategory === destination.droppableId
      setTimeout(() => {
        if (correct) {
          setCategories({
            ...categories,
            [destination.droppableId]: [...finish],
          })
        } else {
          setWordBank([...wordBank, movedItem])
          setCategories({
            ...categories,
            [destination.droppableId]: finish.filter(
              (item) => item.id !== movedItem.id,
            ),
          })
        }
      }, 1000)
    } else {
      setWordBank([...finish])
      setCategories({
        ...categories,
        [source.droppableId]: start.filter((item) => item.id !== movedItem.id),
      })
    }
  }
}
