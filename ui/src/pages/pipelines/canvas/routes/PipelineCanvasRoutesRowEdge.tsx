import { styled } from "@linaria/react";
import { FunctionIcon } from "@phosphor-icons/react";

import Chip, { ChipSize, ChipVariant } from "@galaxy-io/dls/chips/Chip";
import { TooltipPosition } from "@galaxy-io/dls/tooltip/Tooltip";

import {
  PIPELINE_CANVAS_ROUTES_EDGE_CONTROL_GAP,
  PIPELINE_CANVAS_ROUTES_EDGE_CONTROL_INSET,
  PIPELINE_CANVAS_ROUTES_EDGE_MIN_WIDTH,
} from "@/pages/pipelines/canvas/routes/constants";
import PipelineCanvasRoutesEdgeSvg from "@/pages/pipelines/canvas/routes/PipelineCanvasRoutesEdgeSvg";
import PipelineCanvasRoutesRowControls from "@/pages/pipelines/canvas/routes/PipelineCanvasRoutesRowControls";
import type { PipelineCanvasRoute } from "@/pages/pipelines/canvas/routes/types";
import { getPipelineCanvasRouteTransformLabel } from "@/pages/pipelines/canvas/routes/utils";
import PipelineTransformFieldsIssuesChip from "@/pages/pipelines/components/transform/PipelineTransformFieldsIssuesChip";

const EdgeArea = styled.div`
  position: relative;
  flex: 1;
  min-width: ${PIPELINE_CANVAS_ROUTES_EDGE_MIN_WIDTH}px;
  height: 100%;
  padding: 0 ${PIPELINE_CANVAS_ROUTES_EDGE_CONTROL_INSET}px;

  display: flex;
  align-items: center;
  gap: ${PIPELINE_CANVAS_ROUTES_EDGE_CONTROL_GAP}px;
`;

interface PipelineCanvasRoutesRowEdgeProps {
  route: PipelineCanvasRoute;
  isSelected: boolean;
  isRunning: boolean;
}

const PipelineCanvasRoutesRowEdge = ({
  route,
  isSelected,
  isRunning,
}: PipelineCanvasRoutesRowEdgeProps) => (
  <EdgeArea>
    <PipelineCanvasRoutesEdgeSvg
      groupIndex={route.groupIndex}
      isSelected={isSelected}
      isRunning={isRunning}
    />
    <PipelineCanvasRoutesRowControls route={route}>
      {route.transformStepCount > 0 && (
        <Chip
          label={getPipelineCanvasRouteTransformLabel(route.transformStepCount)}
          icon={FunctionIcon}
          variant={ChipVariant.BLUE}
          size={ChipSize.MEDIUM}
          isPill
        />
      )}
      <PipelineTransformFieldsIssuesChip issues={route.issues} position={TooltipPosition.TOP} />
    </PipelineCanvasRoutesRowControls>
  </EdgeArea>
);

export default PipelineCanvasRoutesRowEdge;
