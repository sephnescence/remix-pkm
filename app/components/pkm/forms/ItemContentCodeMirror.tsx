'use client'

import { Dispatch, SetStateAction, useEffect, useRef } from 'react'
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  ViewUpdate,
} from '@codemirror/view'
import { closeBrackets, autocompletion } from '@codemirror/autocomplete'
import { highlightSelectionMatches } from '@codemirror/search'
import { history, indentWithTab } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import {
  indentOnInput,
  foldGutter,
  bracketMatching,
  syntaxHighlighting,
  defaultHighlightStyle,
} from '@codemirror/language'
import { html } from '@codemirror/lang-html'

const ItemContentCodeMirror = ({
  content,
  setContent,
}: {
  content: string
  setContent: Dispatch<SetStateAction<string>>
}) => {
  const codeMirrorRef = useRef<EditorView>()

  useEffect(() => {
    if (codeMirrorRef.current) {
      return
    }

    const updateListener = EditorView.updateListener.of(
      (update: ViewUpdate) => {
        if (update.docChanged) {
          // The document has changed, update your application's state
          const newContent = update.state.doc.toString()
          // Call your state update function here
          setContent(newContent)
        }
      },
    )

    codeMirrorRef.current = new EditorView({
      parent: document.getElementById('editor')!,
      extensions: [
        autocompletion(), // Adds autocompletion
        bracketMatching(), // Highlights matching brackets
        closeBrackets(), // Automatically closes brackets
        drawSelection(), // Adds "cm-selectionBackground" class to the selected text
        EditorState.allowMultipleSelections.of(true), // Allows multiple selections
        foldGutter(), // Adds folding gutter
        highlightActiveLine(), // Highlights the active line
        highlightActiveLineGutter(), // Highlights the active line gutter
        highlightSelectionMatches(),
        highlightSpecialChars(),
        history(),
        html(), // Adds HTML syntax highlighting
        indentOnInput(), // Automatically indents on input
        lineNumbers(), // Adds line numbers
        syntaxHighlighting(defaultHighlightStyle), // Adds syntax highlighting
        updateListener,
        keymap.of([indentWithTab]), // Adds tab key functionality
        EditorView.lineWrapping,
      ],
      doc: content,
    })
  })

  return (
    <label>
      <div className="mb-4">Content</div>
      <div
        id="editor"
        className="min-w-full min-h-96 bg-zinc-200 text-black"
      ></div>
      <textarea hidden readOnly name="content" value={content} />
    </label>
  )
}

export default ItemContentCodeMirror
