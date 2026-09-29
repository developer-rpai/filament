import { create } from "@bufbuild/protobuf";

import type { SelectInputOption } from "@galaxy-io/dls/inputs/SelectInput";

import { ReadMode, WriteMode } from "@/gen/ingestion/v1/common_pb";
import type { Resource, ResourceColumn } from "@/gen/ingestion/v1/connectors_pb";
import { ResourceCursorConfigSchema } from "@/gen/ingestion/v1/pipelines_pb";

import {
  usePipelineCanvasActions,
  usePipelineCanvasState,
} from "@/pages/pipelines/canvas/providers/canvas/PipelineCanvasProvider";
import type { CanvasEdge } from "@/pages/pipelines/canvas/types";
import type { PipelineCanvasEdgeModeOptions } from "@/pages/pipelines/canvas/utils";
import {
  READ_MODE_TO_LABEL_MAP,
  WRITE_MODE_TO_LABEL_MAP,
} from "@/pages/pipelines/components/create/constants";

interface PipelineCanvasEdgeConfigOptions extends PipelineCanvasEdgeModeOptions {
  coveredResources: Resource["name"][];
  recommendedCursorByResource: Record<Resource["name"], ResourceColumn["name"]>;
}

export const usePipelineCanvasEdgeConfig = (
  edge: CanvasEdge,
  {
    readModeOptions,
    writeModeOptions,
    effectiveReadMode,
    effectiveWriteMode,
    coveredResources,
    recommendedCursorByResource,
  }: PipelineCanvasEdgeConfigOptions,
) => {
  const { edges } = usePipelineCanvasState();
  const { setEdgeConfig, setRouteWriteMode } = usePipelineCanvasActions();

  const configuredReadMode = edge.data?.readMode ?? ReadMode.UNSPECIFIED;
  const configuredWriteMode = edge.data?.writeMode ?? WriteMode.UNSPECIFIED;
  const readMode =
    configuredReadMode === ReadMode.UNSPECIFIED ? effectiveReadMode : configuredReadMode;
  const writeMode =
    configuredWriteMode === WriteMode.UNSPECIFIED ? effectiveWriteMode : configuredWriteMode;
  const cursors = edge.data?.cursors ?? [];
  const cursorsByResource = new Map(cursors.map((cursor) => [cursor.resource, cursor.field]));

  const buildRecommendedCursors = () =>
    coveredResources
      .filter((resourceName) => (recommendedCursorByResource[resourceName] ?? "") !== "")
      .map((resourceName) =>
        create(ResourceCursorConfigSchema, {
          resource: resourceName,
          field: recommendedCursorByResource[resourceName],
          lookbackSeconds: 0n,
        }),
      );

  const routeHasIncremental = edges.some(
    (candidate) =>
      candidate.source === edge.source &&
      candidate.target === edge.target &&
      (candidate.id === edge.id ? readMode : candidate.data?.readMode) === ReadMode.INCREMENTAL,
  );
  const compatibleWriteModes = writeModeOptions.filter(
    (mode) => !routeHasIncremental || mode !== WriteMode.REPLACE,
  );

  const handleReadModeChange = (mode: ReadMode) => {
    const nextWriteMode =
      mode === ReadMode.INCREMENTAL && writeMode === WriteMode.REPLACE
        ? (writeModeOptions.find((candidate) => candidate !== WriteMode.REPLACE) ?? writeMode)
        : writeMode;
    setEdgeConfig(edge.id, {
      readMode: mode,
      writeMode: nextWriteMode,
      cursors: mode === ReadMode.INCREMENTAL ? buildRecommendedCursors() : [],
      transform: edge.data?.transform,
    });
    if (nextWriteMode !== writeMode) setRouteWriteMode(edge.source, edge.target, nextWriteMode);
  };

  const handleWriteModeChange = (mode: WriteMode) =>
    setRouteWriteMode(edge.source, edge.target, mode);

  const handleCursorChange = (resourceName: Resource["name"], field: ResourceColumn["name"]) =>
    setEdgeConfig(edge.id, {
      readMode,
      writeMode,
      transform: edge.data?.transform,
      cursors: [
        ...cursors.filter((cursor) => cursor.resource !== resourceName),
        create(ResourceCursorConfigSchema, {
          resource: resourceName,
          field,
          lookbackSeconds: 0n,
        }),
      ],
    });

  const readModeSelectOptions: SelectInputOption[] = readModeOptions.map((mode) => ({
    id: String(mode),
    label: READ_MODE_TO_LABEL_MAP[mode],
    value: mode,
  }));
  const writeModeSelectOptions: SelectInputOption[] = compatibleWriteModes.map((mode) => ({
    id: String(mode),
    label: WRITE_MODE_TO_LABEL_MAP[mode],
    value: mode,
  }));

  return {
    configuredReadMode,
    configuredWriteMode,
    readMode,
    writeMode,
    cursors,
    cursorsByResource,
    readModeSelectOptions,
    writeModeSelectOptions,
    handleReadModeChange,
    handleWriteModeChange,
    handleCursorChange,
  };
};
