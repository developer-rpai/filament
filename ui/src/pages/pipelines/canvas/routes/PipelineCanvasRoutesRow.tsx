import { memo } from "react";

import { styled } from "@linaria/react";

import { withTheme } from "@galaxy-io/dls/theme/GalaxyTheme";
import type { PropsWithTheme } from "@galaxy-io/dls/theme/types";

import {
  PIPELINE_CANVAS_ROUTES_LIST_PADDING_X,
  PIPELINE_CANVAS_ROUTES_ROW_HEIGHT,
  PIPELINE_CANVAS_ROUTES_SOURCE_ISLAND_WIDTH,
} from "@/pages/pipelines/canvas/routes/constants";
import PipelineCanvasRoutesRowEdge from "@/pages/pipelines/canvas/routes/PipelineCanvasRoutesRowEdge";
import PipelineCanvasRoutesSinkIsland from "@/pages/pipelines/canvas/routes/PipelineCanvasRoutesSinkIsland";
import PipelineCanvasRoutesSourceIsland from "@/pages/pipelines/canvas/routes/PipelineCanvasRoutesSourceIsland";
import type { PipelineCanvasRoute } from "@/pages/pipelines/canvas/routes/types";
import type { CanvasEdge } from "@/pages/pipelines/canvas/types";

const RowWrapper = withTheme(styled.div<PropsWithTheme>`
  height: ${PIPELINE_CANVAS_ROUTES_ROW_HEIGHT}px;
  padding: 0 ${PIPELINE_CANVAS_ROUTES_LIST_PADDING_X}px;

  display: flex;
  align-items: center;

  cursor: pointer;
  outline: none;

  &:hover [data-island]:not([data-selected="true"]) {
    border-color: ${({ theme }) => theme.color.border.tertiary};
  }

  &:hover [data-edge]:not([data-selected="true"]) line,
  &:hover [data-edge]:not([data-selected="true"]) path {
    stroke: ${({ theme }) => theme.color.text.tertiary};
  }
`);

const SourceSlot = styled.div`
  width: ${PIPELINE_CANVAS_ROUTES_SOURCE_ISLAND_WIDTH}px;
  flex-shrink: 0;
`;

interface PipelineCanvasRoutesRowProps {
  route: PipelineCanvasRoute;
  isSelected: boolean;
  isGroupSelected: boolean;
  isRunning: boolean;
  onSelect: (edgeId: CanvasEdge["id"]) => void;
}

const PipelineCanvasRoutesRow = memo(
  ({ route, isSelected, isGroupSelected, isRunning, onSelect }: PipelineCanvasRoutesRowProps) => {
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      onSelect(route.edge.id);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      onSelect(route.edge.id);
    };

    return (
      <RowWrapper role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown}>
        <SourceSlot>
          {route.groupIndex === 0 && (
            <PipelineCanvasRoutesSourceIsland route={route} isSelected={isGroupSelected} />
          )}
        </SourceSlot>
        <PipelineCanvasRoutesRowEdge route={route} isSelected={isSelected} isRunning={isRunning} />
        <PipelineCanvasRoutesSinkIsland route={route} isSelected={isSelected} />
      </RowWrapper>
    );
  },
);

PipelineCanvasRoutesRow.displayName = "PipelineCanvasRoutesRow";

export default PipelineCanvasRoutesRow;
