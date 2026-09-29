import pluralize from "pluralize";

import {
  PIPELINE_CANVAS_ROUTES_EDGE_FAN_CONTROL_X,
  PIPELINE_CANVAS_ROUTES_EDGE_FAN_END_X,
  PIPELINE_CANVAS_ROUTES_ROW_HEIGHT,
} from "@/pages/pipelines/canvas/routes/constants";
import type { PipelineCanvasRoute } from "@/pages/pipelines/canvas/routes/types";

export interface PipelineCanvasRouteEdgeGeometry {
  cy: number;
  lineStartX: number;
  fanPath: string | undefined;
}

export const getPipelineCanvasRouteEdgeGeometry = (
  groupIndex: PipelineCanvasRoute["groupIndex"],
): PipelineCanvasRouteEdgeGeometry => {
  const cy = PIPELINE_CANVAS_ROUTES_ROW_HEIGHT / 2;
  if (groupIndex === 0) return { cy, lineStartX: 0, fanPath: undefined };
  const yc = cy - groupIndex * PIPELINE_CANVAS_ROUTES_ROW_HEIGHT;
  const controlX = PIPELINE_CANVAS_ROUTES_EDGE_FAN_CONTROL_X;
  const endX = PIPELINE_CANVAS_ROUTES_EDGE_FAN_END_X;
  return {
    cy,
    lineStartX: endX,
    fanPath: `M0 ${yc} C ${controlX} ${yc}, ${controlX} ${cy}, ${endX} ${cy}`,
  };
};

export const getPipelineCanvasRouteTransformLabel = (
  count: PipelineCanvasRoute["transformStepCount"],
): string => pluralize("transformation", count, true);

export const getPipelineCanvasRouteGroupKey = (
  source: PipelineCanvasRoute["edge"]["source"],
  resource: PipelineCanvasRoute["resource"],
): PipelineCanvasRoute["groupKey"] => `${source}|${resource}`;
