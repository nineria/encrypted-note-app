import { JSONContent } from '@tiptap/react'
import { Note } from './type'

type Props = {
  note: Note
  onChange: (content: JSONContent) => void
}

function NoteEditor({ note, onChange }: Props) {}

export default NoteEditor
