import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import styles from './App.module.css'
import { Note } from './type'

function App() {
  const [notes, setNotes] = useState({})
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hellow world!</p>',
    editorProps: {
      attributes: {
        class: styles.textEditor,
      },
    },
  })

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run()
  }

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run()
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
              className={styles.sidebarItem}
              onClick={() => handleChangeActiveNote(note.id)}
            >
              {note.title}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.editorContainer}>
        <div className={styles.toolbar}>
          <button
            className={
              editor?.isActive('bold')
                ? styles.toolbarButtonActive
                : styles.toolbarButton
            }
            onClick={toggleBold}
          >
            bold
          </button>
          <button
            className={
              editor?.isActive('italic')
                ? styles.toolbarButtonActive
                : styles.toolbarButton
            }
            onClick={toggleItalic}
          >
            italic
          </button>
        </div>
        <EditorContent
          editor={editor}
          className={styles.textEditorContent}
        ></EditorContent>
      </div>
    </div>
  )
}

export default App
