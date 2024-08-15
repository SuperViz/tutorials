export enum ACTIONS {
  SELECT = "SELECT",
  RECTANGLE = "RECTANGLE",
  CIRCLE = "CIRCLE",
  SCRIBBLE = "SCRIBBLE",
  ARROW = "ARROW",
}

export type RectangleElement = {
  id: string;
  x: number;
  y: number;
  height: number;
  width: number;
  fillColor: string;
  strokeColor: string;
};

export type CircleElement = {
  id: string;
  x: number;
  y: number;
  radius: number;
  fillColor: string;
  strokeColor: string;
};

export type ScribbleElement = {
  id: string;
  x: number;
  y: number;
  points: number[];
  strokeColor: string;
  fillColor: string;
};

export type ArrowElement = {
  id: string;
  x: number;
  y: number;
  points: number[];
  strokeColor: string;
  fillColor: string;
};

export type BoardState = {
  rectangles: RectangleElement[];
  circles: CircleElement[];
  arrows: ArrowElement[];
  scribbles: ScribbleElement[];
}