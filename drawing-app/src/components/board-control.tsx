import { ACTIONS } from "../types/global.types";
import { TbRectangle } from "react-icons/tb";
import { IoMdDownload } from "react-icons/io";
import { FaLongArrowAltRight } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { GiArrowCursor } from "react-icons/gi";
import { FaRegCircle } from "react-icons/fa6";


type Props = {
  action: string;
  setAction: (action: ACTIONS) => void;
  handleExport: () => void;
}

export function BoardControl({ action, setAction, handleExport }: Props) {
  return (
    <div className="absolute top-0 z-10 w-full py-2 ">
      <div className="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg">
        <button
          className={
            action === ACTIONS.SELECT
              ? "bg-violet-300 p-1 rounded"
              : "p-1 hover:bg-violet-100 rounded"
          }
          onClick={() => setAction(ACTIONS.SELECT)}
        >
          <GiArrowCursor size={"2rem"} />
        </button>
        <button
          className={
            action === ACTIONS.RECTANGLE
              ? "bg-violet-300 p-1 rounded"
              : "p-1 hover:bg-violet-100 rounded"
          }
          onClick={() => setAction(ACTIONS.RECTANGLE)}
        >
          <TbRectangle size={"2rem"} />
        </button>
        <button
          className={
            action === ACTIONS.CIRCLE
              ? "bg-violet-300 p-1 rounded"
              : "p-1 hover:bg-violet-100 rounded"
          }
          onClick={() => setAction(ACTIONS.CIRCLE)}
        >
          <FaRegCircle size={"1.5rem"} />
        </button>
        <button
          className={
            action === ACTIONS.ARROW
              ? "bg-violet-300 p-1 rounded"
              : "p-1 hover:bg-violet-100 rounded"
          }
          onClick={() => setAction(ACTIONS.ARROW)}
        >
          <FaLongArrowAltRight size={"2rem"} />
        </button>
        <button
          className={
            action === ACTIONS.SCRIBBLE
              ? "bg-violet-300 p-1 rounded"
              : "p-1 hover:bg-violet-100 rounded"
          }
          onClick={() => setAction(ACTIONS.SCRIBBLE)}
        >
          <LuPencil size={"1.5rem"} />
        </button>
        <button onClick={handleExport}>
          <IoMdDownload size={"1.5rem"} />
        </button>
      </div>
    </div>
  )
}