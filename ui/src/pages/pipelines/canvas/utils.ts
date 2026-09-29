import type { JsonValue } from "@bufbuild/protobuf";
import type { FitViewOptions } from "@xyflow/react";

import type { Theme } from "@galaxy-io/dls/theme/types";

import type { EdgeValidation } from "@/gen/ingestion/v1/capabilities_pb";
import { ReadMode, WriteMode } from "@/gen/ingestion/v1/common_pb";
import type { PipelineEdge } from "@/gen/ingestion/v1/pipelines_pb";

import { isJsonObject } from "@/components/fields/utils";

import {
  PIPELINE_CANVAS_EDGE_Z_INDEX,
  PIPELINE_CANVAS_FIT_INSET_LEFT,
  PIPELINE_CANVAS_FIT_INSET_Y,
  PIPELINE_CANVAS_FIT_MAX_ZOOM,
} from "@/pages/pipelines/canvas/constants";
import {
  PIPELINE_CANVAS_PANEL_COLLAPSED_WIDTH,
  PIPELINE_CANVAS_PANEL_INSET,
  PIPELINE_CANVAS_PANEL_WIDTH,
} from "@/pages/pipelines/canvas/panel/constants";
import type {
  CanvasEdge,
  CanvasNode,
  PipelineCanvasEdgeTransform,
} from "@/pages/pipelines/canvas/types";

const intersectModes = (sets: ReadMode[][]): ReadMode[] => {
  if (!sets.length) return [];
  return sets
    .slice(1)
    .reduce((common, modes) => common.filter((mode) => modes.includes(mode)), sets[0] ?? []);
};

export interface PipelineCanvasEdgeModeOptions {
  readModeOptions: ReadMode[];
  writeModeOptions: WriteMode[];
  effectiveReadMode: ReadMode;
  effectiveWriteMode: WriteMode;
}

export const getEdgeModeOptions = (
  verdict: EdgeValidation | undefined,
  hasReadLevers: boolean,
): PipelineCanvasEdgeModeOptions => ({
  readModeOptions:
    verdict && hasReadLevers
      ? intersectModes(verdict.resources.map((resource) => resource.supportedReadModes))
      : [],
  writeModeOptions: verdict?.supportedWriteModes ?? [],
  effectiveReadMode: verdict?.effectiveReadMode ?? ReadMode.UNSPECIFIED,
  effectiveWriteMode: verdict?.effectiveWriteMode ?? WriteMode.UNSPECIFIED,
});

const getTransformEntryStepCount = (entry: JsonValue | undefined): number =>
  entry !== undefined && isJsonObject(entry) && Array.isArray(entry.steps) ? entry.steps.length : 0;

export const getTransformStepCount = (
  transform: PipelineCanvasEdgeTransform | undefined,
  resource: PipelineEdge["resource"],
): number => {
  const resources = transform?.resources;
  if (resources === undefined || !isJsonObject(resources)) return 0;
  if (resource !== "") return getTransformEntryStepCount(resources[resource]);
  return Object.values(resources).reduce<number>(
    (total, entry) => total + getTransformEntryStepCount(entry),
    0,
  );
};

export const getPipelineCanvasFitPadding = (
  showPanel: boolean,
): NonNullable<FitViewOptions["padding"]> => ({
  top: `${PIPELINE_CANVAS_FIT_INSET_Y}px`,
  bottom: `${PIPELINE_CANVAS_FIT_INSET_Y}px`,
  left: `${PIPELINE_CANVAS_FIT_INSET_LEFT}px`,
  right: `${
    PIPELINE_CANVAS_PANEL_INSET * 2 +
    (showPanel ? PIPELINE_CANVAS_PANEL_WIDTH : PIPELINE_CANVAS_PANEL_COLLAPSED_WIDTH)
  }px`,
});

export const getPipelineCanvasFitViewOptions = (showPanel: boolean): FitViewOptions => ({
  padding: getPipelineCanvasFitPadding(showPanel),
  maxZoom: PIPELINE_CANVAS_FIT_MAX_ZOOM,
});

export const mapElementsToSelected = <T extends { id: string; selected?: boolean }>(
  elements: T[],
  selectedId: string | undefined,
): T[] =>
  elements.map((element) => {
    const selected = element.id === selectedId;
    return element.selected === selected ? element : { ...element, selected };
  });

export const getDefaultDestinationResource = (resource: PipelineEdge["resource"]): string =>
  resource.replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "");

export const getCanvasEdgeResourceLabel = (
  resource: PipelineEdge["resource"],
  coveredCount: number,
): { label: string; isNamedResource: boolean } => {
  if (resource) return { label: resource, isNamedResource: true };
  return {
    label: coveredCount ? `${coveredCount} resources` : "All resources",
    isNamedResource: false,
  };
};

export const mapEdgesToStyledEdges = (
  edges: CanvasEdge[],
  nodes: CanvasNode[],
  theme: Theme,
  isRunning: boolean,
  invalidEdgeIds: Set<CanvasEdge["id"]>,
): CanvasEdge[] => {
  const selectedNodeIds = new Set(nodes.filter((node) => node.selected).map((node) => node.id));

  return edges.map((edge) => {
    const isConnectedToSelected =
      selectedNodeIds.has(edge.source) || selectedNodeIds.has(edge.target);
    const isHighlighted = edge.selected || isConnectedToSelected;
    const isInvalid = invalidEdgeIds.has(edge.id);
    const stroke = isInvalid
      ? theme.color.text.error
      : isRunning || isHighlighted
        ? theme.color.background.galaxy
        : theme.color.border.primary;

    return {
      ...edge,
      zIndex: edge.selected
        ? PIPELINE_CANVAS_EDGE_Z_INDEX + 2
        : isInvalid || isHighlighted
          ? PIPELINE_CANVAS_EDGE_Z_INDEX + 1
          : PIPELINE_CANVAS_EDGE_Z_INDEX,
      animated: isRunning,
      style: {
        stroke,
        strokeWidth: edge.selected ? 3 : 2,
        ...(isRunning && { strokeDasharray: "5 5" }),
      },
    };
  });
};
