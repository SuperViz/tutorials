import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { Note } from "../common/types";
import React from "react";

type Props = {
  onChange: (note: Note) => void,
  note: Note,
}

export function NoteNode({
  onChange,
  note,
}: Props) {

  const handleChanges = (newNote: Note) => {
    onChange(newNote)
  }

  const onDrag = (_: DraggableEvent, data: DraggableData) => {
    const x = data.x
    const y = data.y

    handleChanges({ ...note, x, y })
  }
  const nodeRef = React.useRef(null);

  return (
    <Draggable
    nodeRef={nodeRef}
      onDrag={onDrag}
      position={{
        x: note.x,
        y: note.y,
      }}
    >
      <div ref={nodeRef} className="w-60 h-36 bg-violet-200 rounded shadow-sm flex flex-col rotate-6">
        <div className="w-full p-2 bg-violet-300 rounded-t">
          <input
            type="text"
            className="w-full bg-violet-300"
            placeholder="Title"
            value={note.title}
            onChange={(e) => handleChanges({ ...note, title: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <textarea
            className="w-full h-full p-2 bg-violet-200"
            value={note.content}
            onChange={(e) => handleChanges({ ...note, content: e.target.value })}
          />
        </div>
      </div>
    </Draggable>
  )
}