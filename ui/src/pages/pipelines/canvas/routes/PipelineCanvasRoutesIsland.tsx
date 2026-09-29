import type { PropsWithChildren } from "react";

import { styled } from "@linaria/react";

import { withTheme } from "@galaxy-io/dls/theme/GalaxyTheme";
import type { PropsWithTheme } from "@galaxy-io/dls/theme/types";

import { PIPELINE_CANVAS_ROUTES_ISLAND_HEIGHT } from "@/pages/pipelines/canvas/routes/constants";

const Island = withTheme(styled.div<PropsWithTheme<{ $width: number; $isSelected: boolean }>>`
  width: ${({ $width }) => $width}px;
  height: ${PIPELINE_CANVAS_ROUTES_ISLAND_HEIGHT}px;
  padding: 0 10px 0 5px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  background-color: ${({ theme }) => theme.color.background.primary};
  border: 0.5px solid
    ${({ theme, $isSelected }) =>
      $isSelected ? theme.color.background.galaxy : theme.color.border.primary};
  border-radius: 5px;
  outline: ${({ theme, $isSelected }) =>
    $isSelected ? `1px solid ${theme.color.background.galaxy}` : "none"};
  outline-offset: -1px;

  transition: border-color 100ms ease;
`);

interface PipelineCanvasRoutesIslandProps extends PropsWithChildren {
  width: number;
  isSelected: boolean;
}

const PipelineCanvasRoutesIsland = ({
  width,
  isSelected,
  children,
}: PipelineCanvasRoutesIslandProps) => (
  <Island $width={width} $isSelected={isSelected} data-island data-selected={isSelected}>
    {children}
  </Island>
);

export default PipelineCanvasRoutesIsland;
