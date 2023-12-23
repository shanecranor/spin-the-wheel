import { EntryCard } from "../entry-card/entry-card"

const placeHolderEntries = [
  {
    text: "cry",
    author: "sleepy_joe"
  },
  {
    text: "place some valo",
    author: "thatdawg"
  }
]

export const EntryManager = () => {
  return (
    <div className="c-entry-manager">
      {placeHolderEntries.map((entry) => {
        // create the functions required for each card here :pog:

        return (<EntryCard text={entry.text} author={entry.author} />)
      })}
      {/* Add item form */}
      {/* Moderator approved items */}
      {/* Unapproved items */}
    </div>
  )
}