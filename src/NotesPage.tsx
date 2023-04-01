import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import styles from './NotesPage.module.css'
import { Note, UserData } from './type'
import NoteEditor from './NoteEditor'
import { JSONContent } from '@tiptap/react'
import storage from './storage'
import debounce from './debounce'
import { AES, enc } from 'crypto-js'

const STORAGE_KEY = 'notes'

const loadNotes = ({ username, passphrase }: UserData) => {
  const noteIds = storage.get<string[]>(`${username}:${STORAGE_KEY}`, [])
  const notes: Record<string, Note> = {}
  noteIds.forEach((id) => {
    const encryptedNote = storage.get<string>(
      `${`${username}:${STORAGE_KEY}`}:${id}`
    )
    const note: Note = JSON.parse(
      AES.decrypt(encryptedNote, passphrase).toString(enc.Utf8)
    )
    notes[note.id] = {
      ...note,
      updatedAt: new Date(note.updatedAt),
    }
  })
  return notes
}

const saveNote = debounce((note: Note, { username, passphrase }: UserData) => {
  const noteIds = storage.get<string[]>(`${username}:${STORAGE_KEY}`, [])
  const noteIdsWithoutNote = noteIds.filter((id) => id !== note.id)
  storage.set(`${username}:${STORAGE_KEY}`, [...noteIdsWithoutNote, note.id])

  const encryptedNote = AES.encrypt(JSON.stringify(note), passphrase).toString()

  storage.set(`${username}:${STORAGE_KEY}:${note.id}`, encryptedNote)
}, 1000)

type Props = {
  userData: UserData
}

function NotesPage({ userData }: Props) {
  const [notes, setNotes] = useState<Record<string, Note>>(() =>
    loadNotes(userData)
  )
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

  const activeNote = activeNoteId ? notes[activeNoteId] : null

  const handleChangeNoteContent = (
    noteId: string,
    content: JSONContent,
    title = 'New note'
  ) => {
    const updatedNote = {
      ...notes[noteId],
      updatedAt: new Date(),
      content,
      title,
    }
    setNotes((prev) => ({
      ...prev,
      [noteId]: updatedNote,
    }))
    saveNote(updatedNote, userData)
  }

  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: uuid(),
      title: 'New note',
      content: '<h1>New note</h1>',
      updatedAt: new Date(),
    }

    setNotes((prev) => ({
      ...prev,
      [newNote.id]: newNote,
    }))

    setActiveNoteId(newNote.id)
    saveNote(newNote, userData)
  }

  const noteList = Object.values(notes).sort(
    (a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )

  const handleChangeActiveNote = (id: string) => {
    setActiveNoteId(id)
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.sidebar}>
        <button className={styles.sidebarButton} onClick={handleCreateNewNote}>
          New Note
        </button>
        <div className={styles.sidebarList}>
          {noteList.map((note: any) => (
            <div
              key={note.id}
              role='button'
              tabIndex={0}
              className={
                note.id === activeNoteId
                  ? styles.sidebarItemActive
                  : styles.sidebarItem
              }
              onClick={() => handleChangeActiveNote(note.id)}
            >
              {note.title}
            </div>
          ))}
        </div>
      </div>
      {activeNote ? (
        <NoteEditor
          note={activeNote}
          onChange={(content, title) =>
            handleChangeNoteContent(activeNote.id, content, title)
          }
        />
      ) : (
        <div>Create a new note or select an existing one.</div>
      )}
    </div>
  )
}

export default NotesPage
