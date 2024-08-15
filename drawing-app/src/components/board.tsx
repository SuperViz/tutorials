import Konva from 'konva'
import {
  Arrow,
  Circle,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer,
} from "react-konva";
import { useRef, useState } from "react";
import { v4 as generateId } from "uuid";
import { ACTIONS, RectangleElement, CircleElement, ArrowElement, ScribbleElement, BoardState } from "../types/global.types";
import { BoardControl } from "./board-control";

type Props = {
  width: number;
  height: number;
  fillColor: string;
  state: BoardState
  setState: (state: BoardState) => void;
}

export function Board({ width, height, fillColor, state, setState }: Props) {
  const stage = useRef<Konva.Stage | null>(null);
  const [action, setAction] = useState(ACTIONS.SELECT);

  const strokeColor = fillColor;
  const isPaining = useRef<boolean | null>(false);
  const currentShapeId = useRef<string | null>(null);
  const transformer = useRef<Konva.Transformer | null>(null);
  const layer = useRef<Konva.Layer | null>(null);


  const isDraggable = action === ACTIONS.SELECT;

  const onPointerDown = () => {
    if (action === ACTIONS.SELECT) return;

    const { x, y } = stage.current?.getPointerPosition() as Konva.Vector2d;
    const id = generateId();

    currentShapeId.current = id;
    isPaining.current = true;

    const actions = {
      [ACTIONS.RECTANGLE]: () => {
        const newRectangles = [...state.rectangles, {
          id,
          x,
          y,
          height: 20,
          width: 20,
          fillColor,
          strokeColor,
        }];

        setState({
          ...state,
          rectangles: newRectangles,
        });
      },
      [ACTIONS.CIRCLE]: () => {
        const newCircles = [...state.circles, {
          id,
          x,
          y,
          radius: 20,
          fillColor,
          strokeColor,
        }];

        setState({
          ...state,
          circles: newCircles,
        });
      },
      [ACTIONS.ARROW]: () => {
        const newArrows = [...state.arrows, {
          id,
          x,
          y,
          points: [x, y, x + 20, y + 20],
          strokeColor,
          fillColor,
        }];

        setState({
          ...state,
          arrows: newArrows,
        });
      },
      [ACTIONS.SCRIBBLE]: () => {
        const newScribbles = [
          ...state.scribbles,
          {
            id,
            x,
            y,
            points: [x, y],
            strokeColor,
            fillColor,
          }
        ]

        setState({
          ...state,
          scribbles: newScribbles,
        });
      }
    }
    
    actions[action]();
  };
  
 const onPointerMove = () => {
    if (action === ACTIONS.SELECT || !isPaining.current) return;

    const { x, y } = stage.current?.getPointerPosition() as Konva.Vector2d;

    const actions = {
      [ACTIONS.RECTANGLE]: () => {
        const newRectangles = state.rectangles.map((rectangle) => {
          if (rectangle.id === currentShapeId.current) {
            return {
              ...rectangle,
              width: x - rectangle.x,
              height: y - rectangle.y,
            };
          }
          return rectangle;
        });

        setState({
          ...state,
          rectangles: newRectangles,
        });
      },
      [ACTIONS.CIRCLE]: () => {
        const circles = state.circles.map((circle) => {
          if (circle.id === currentShapeId.current) {
            return {
              ...circle,
              radius: ((y - circle.y) ** 2 + (x - circle.x) ** 2) ** 0.5,
            };
          }
          return circle;
        });

        setState({
          ...state,
          circles,
        });
      },
      [ACTIONS.ARROW]: () => {
        const newArrows = state.arrows.map((arrow) => {
          if (arrow.id === currentShapeId.current) {
            return {
              ...arrow,
              points: [arrow.points[0], arrow.points[1], x, y],
            };
          }
          return arrow;
        });

        setState({
          ...state,
          arrows: newArrows,
        });
      },
      [ACTIONS.SCRIBBLE]: () => {
        const scribbles = state.scribbles.map((scribble) => {
          if (scribble.id === currentShapeId.current) {
            return {
              ...scribble,
              points: [...scribble.points, x, y],
            };
          }
          return scribble;
        });


        setState({
          ...state,
          scribbles,
        });
      },
    };

    actions[action]();
  }

  function onPointerUp() {
    isPaining.current = false;
  }

  function handleExport() {
    const uri = stage.current?.toDataURL();

    if(!uri) return;

    const link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function onClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (action !== ACTIONS.SELECT) return;
    const target = e.currentTarget;
    transformer.current?.nodes([target]);
  }

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>, shapeType: string) {
    const id = e.target.id();
    const { x, y } = e.target.position();
    
    type ShapeListState = RectangleElement[] | CircleElement[] | ArrowElement[] | ScribbleElement[];
    const currentShapeListState = state[shapeType as keyof BoardState] as ShapeListState;

    setState({
      ...state,
      [shapeType]: currentShapeListState.map((shape) =>
        shape.id === id ? { ...shape, x, y } : shape
      ),
    });
  }

  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        <BoardControl 
          action={action} 
          setAction={setAction} 
          handleExport={handleExport} 
        />
        <Stage
          ref={stage}
          width={width}
          height={height}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <Layer ref={layer}>
            <Rect
              x={0}
              y={0}
              height={height}
              width={width}
              fill="#ffffff"
              id="bg"
              onClick={() => {
                transformer.current?.nodes([]);
              }}
            />

            {state.rectangles.map((rectangle) => (
              <Rect
                key={rectangle.id}
                id={rectangle.id}
                x={rectangle.x}
                y={rectangle.y}
                stroke={rectangle.strokeColor}
                strokeWidth={2}
                fill={rectangle.fillColor}
                height={rectangle.height}
                width={rectangle.width}
                draggable={isDraggable}
                onClick={onClick}
                onDragMove={(e) => handleDragMove(e, 'rectangles')}
              />
            ))}

            {state.circles.map((circle) => (
              <Circle
                key={circle.id}
                id={circle.id}
                radius={circle.radius}
                x={circle.x}
                y={circle.y}
                stroke={circle.strokeColor}
                strokeWidth={2}
                fill={circle.fillColor}
                draggable={isDraggable}
                onClick={onClick}
                onDragMove={(e) => handleDragMove(e, 'circles')}
              />
            ))}
            {state.arrows.map((arrow) => (
              <Arrow
                key={arrow.id}
                id={arrow.id}
                points={arrow.points}
                stroke={arrow.strokeColor}
                strokeWidth={2}
                fill={arrow.fillColor}
                draggable={isDraggable}
                onClick={onClick}
                onDragMove={(e) => handleDragMove(e, 'arrows')}
              />
            ))}

            {state.scribbles.map((scribble) => (
              <Line
                key={scribble.id}
                id={scribble.id}
                lineCap="round"
                lineJoin="round"
                points={scribble.points}
                stroke={scribble.strokeColor}
                strokeWidth={2}
                fill={scribble.fillColor}
                draggable={isDraggable}
                onClick={onClick}
                onDragMove={(e) => handleDragMove(e, 'scribbles')}
              />
            ))}

            <Transformer ref={transformer} />
          </Layer>
        </Stage>
      </div>
    </>
  );
}