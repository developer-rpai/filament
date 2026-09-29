import { useMemo } from "react";

import { create } from "@bufbuild/protobuf";

import { ExecutionMode, ReplicationMode } from "@/gen/ingestion/v1/common_pb";
import {
  DiscoverResourcesRequestSchema,
  GetResourceColumnsRequestSchema,
  type Resource,
  type ResourceColumn,
} from "@/gen/ingestion/v1/connectors_pb";

import { getCanvasEdgeResource } from "@/pages/pipelines/canvas/graph/serialize";
import { usePipelineCanvasConnections } from "@/pages/pipelines/canvas/hooks/usePipelineCanvasConnections";
import type { CanvasEdge } from "@/pages/pipelines/canvas/types";
import { getCursorOptions } from "@/pages/pipelines/components/create/rows";
import { usePipelineExecutionMode } from "@/pages/pipelines/hooks/usePipelineExecutionMode";

import { useDiscoverResourcesQuery, useGetResourceColumnsQuery } from "@/api/queries/connectors";
import { PROBE_QUERY_OPTIONS } from "@/api/queries/constants";

interface PipelineCanvasEdgeResourcesOptions {
  enabled?: boolean;
}

export const usePipelineCanvasEdgeResources = (
  edge: CanvasEdge,
  { enabled = true }: PipelineCanvasEdgeResourcesOptions = {},
) => {
  const executionMode = usePipelineExecutionMode();
  const isContinuous = executionMode === ExecutionMode.CONTINUOUS;
  const connectionByNodeId = usePipelineCanvasConnections();
  const sourceConnection = connectionByNodeId.get(edge.source);
  const sourceConnectionId = sourceConnection?.id ?? "";
  const isCdc = sourceConnection?.replication === ReplicationMode.CDC;
  const hasReadLevers = !isCdc && !isContinuous;
  const isTransformable = !isContinuous;
  const edgeResource = getCanvasEdgeResource(edge);

  const { data: discovered, isLoading: isLoadingResources } = useDiscoverResourcesQuery({
    input: create(DiscoverResourcesRequestSchema, { connectionId: sourceConnectionId }),
    options: {
      ...PROBE_QUERY_OPTIONS,
      enabled: enabled && sourceConnectionId !== "" && edgeResource === "",
    },
  });

  const coveredResources = useMemo<Resource["name"][]>(
    () =>
      edgeResource !== ""
        ? [edgeResource]
        : (discovered?.resources ?? [])
            .filter((resource) => resource.isSelectable)
            .map((resource) => resource.name),
    [edgeResource, discovered?.resources],
  );

  const {
    data: columns,
    isPending: isPendingColumns,
    isError: isErrorColumns,
  } = useGetResourceColumnsQuery({
    input: create(GetResourceColumnsRequestSchema, {
      connectionId: sourceConnectionId,
      resources: coveredResources,
    }),
    options: {
      ...PROBE_QUERY_OPTIONS,
      enabled: enabled && sourceConnectionId !== "" && coveredResources.length > 0,
    },
  });

  const columnsByResource = useMemo(
    () => new Map((columns?.resources ?? []).map((entry) => [entry.resource, entry.columns])),
    [columns?.resources],
  );

  const cursorOptionsByResource = useMemo<Record<Resource["name"], ResourceColumn[]>>(
    () =>
      Object.fromEntries(
        coveredResources.map((resource) => [
          resource,
          getCursorOptions(columnsByResource.get(resource) ?? []),
        ]),
      ),
    [coveredResources, columnsByResource],
  );

  const recommendedCursorByResource = useMemo<Record<Resource["name"], ResourceColumn["name"]>>(
    () =>
      Object.fromEntries(
        coveredResources.map((resource) => [
          resource,
          (columnsByResource.get(resource) ?? []).find((column) => column.isCursorRecommended)
            ?.name ?? "",
        ]),
      ),
    [coveredResources, columnsByResource],
  );

  const isLoadingColumns =
    enabled &&
    ((edgeResource === "" && isLoadingResources) ||
      (coveredResources.length > 0 && isPendingColumns && !isErrorColumns));

  return {
    isContinuous,
    hasReadLevers,
    isTransformable,
    isLoadingColumns,
    sourceConnectionId,
    edgeResource,
    coveredResources,
    columnsByResource,
    cursorOptionsByResource,
    recommendedCursorByResource,
  };
};
