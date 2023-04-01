import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import styles from './App.module.css'
import { Note } from './type'
import NoteEditor from './NoteEditor'
import { JSONContent } from '@tiptap/react'
import storage from './storage'

const STORAGE_KEY = 'notes'

const loadNotes = () => {
  const noteIds = storage.get<string[]>(STORAGE_KEY, [])
  const notes: Record<string, Note> = {}
  noteIds.forEach((id) => {
    const note = storage.get<Note>(`${STORAGE_KEY}:${id}`)
    notes[note.id] = {
      ...note,
      updatedAt: new Date(note.updatedAt),
    }
  })
  return notes
}

const saveNote = (note: Note) => {
  const noteIds = storage.get<string[]>(STORAGE_KEY, [])
  const noteIdsWithoutNote = noteIds.filter((id) => id !== note.id)
  storage.set(STORAGE_KEY, [...noteIdsWithoutNote, note.id])
  storage.set(`${STORAGE_KEY}:${note.id}`, note)
}

function App() {
  const [notes, setNotes] = useState<Record<string, Note>>(() => loadNotes())
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

  const activeNote = activeNoteId ? notes[activeNoteId] : null

  const handleChangeNoteContent = (
    noteId: string,
    content: JSONContent,
    title = 'New note'
  ) => {
    setNotes((prev) => ({
      ...prev,
      [noteId]: {
        ...notes[noteId],
        updatedAt: new Date(),
        content,
        title,
      },
    }))
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
    saveNote(newNote)
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

export default App
