import type { EdgeValidation } from "@/gen/ingestion/v1/capabilities_pb";
import type { Connection } from "@/gen/ingestion/v1/connections_pb";
import type { PipelineEdge } from "@/gen/ingestion/v1/pipelines_pb";

import type { CanvasEdge } from "@/pages/pipelines/canvas/types";

export interface PipelineCanvasRoute {
  edge: CanvasEdge;
  resource: PipelineEdge["resource"];
  resourceLabel: string;
  isNamedResource: boolean;
  sourceConnection: Connection | undefined;
  sinkConnection: Connection | undefined;
  groupKey: string;
  groupIndex: number;
  groupSize: number;
  hasReadLevers: boolean;
  transformStepCount: number;
  issues: string[];
  verdict: EdgeValidation | undefined;
}
