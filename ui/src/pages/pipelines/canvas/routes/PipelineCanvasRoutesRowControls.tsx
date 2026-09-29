import type { PropsWithChildren } from "react";

import { styled } from "@linaria/react";

import { InputSize, InputVariant } from "@galaxy-io/dls/inputs/Input";
import SelectInput, { type SelectInputOption } from "@galaxy-io/dls/inputs/SelectInput";
import { withTheme } from "@galaxy-io/dls/theme/GalaxyTheme";
import type { PropsWithTheme } from "@galaxy-io/dls/theme/types";

import { ReadMode, type WriteMode } from "@/gen/ingestion/v1/common_pb";

import { usePipelineCanvasEdgeConfig } from "@/pages/pipelines/canvas/hooks/usePipelineCanvasEdgeConfig";
import { usePipelineCanvasEdgeResources } from "@/pages/pipelines/canvas/hooks/usePipelineCanvasEdgeResources";
import { usePipelineCanvasReadOnly } from "@/pages/pipelines/canvas/providers/canvas/PipelineCanvasProvider";
import {
  PIPELINE_CANVAS_ROUTES_CURSOR_SELECT_WIDTH,
  PIPELINE_CANVAS_ROUTES_EDGE_CONTROL_GAP,
  PIPELINE_CANVAS_ROUTES_READ_MODE_SELECT_WIDTH,
  PIPELINE_CANVAS_ROUTES_WRITE_MODE_SELECT_WIDTH,
} from "@/pages/pipelines/canvas/routes/constants";
import type { PipelineCanvasRoute } from "@/pages/pipelines/canvas/routes/types";
import { getEdgeModeOptions } from "@/pages/pipelines/canvas/utils";

const ControlsGroup = withTheme(styled.div<PropsWithTheme>`
  position: relative;
  z-index: 1;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  gap: ${PIPELINE_CANVAS_ROUTES_EDGE_CONTROL_GAP}px;

  background-color: ${({ theme }) => theme.color.background.base};
  border-radius: 5px;
`);

const CenterSlot = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${PIPELINE_CANVAS_ROUTES_EDGE_CONTROL_GAP}px;
`;

const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation();

interface PipelineCanvasRoutesRowControlsProps extends PropsWithChildren {
  route: PipelineCanvasRoute;
}

const PipelineCanvasRoutesRowControls = ({
  route,
  children,
}: PipelineCanvasRoutesRowControlsProps) => {
  const isReadOnly = usePipelineCanvasReadOnly();
  const {
    coveredResources,
    cursorOptionsByResource,
    recommendedCursorByResource,
    isLoadingColumns,
  } = usePipelineCanvasEdgeResources(route.edge, { enabled: route.hasReadLevers });

  const {
    readMode,
    writeMode,
    cursorsByResource,
    readModeSelectOptions,
    writeModeSelectOptions,
    handleReadModeChange,
    handleWriteModeChange,
    handleCursorChange,
  } = usePipelineCanvasEdgeConfig(route.edge, {
    ...getEdgeModeOptions(route.verdict, route.hasReadLevers),
    coveredResources,
    recommendedCursorByResource,
  });

  const cursorSelectOptions: SelectInputOption[] = (
    cursorOptionsByResource[route.resource] ?? []
  ).map((column) => ({ id: column.name, label: column.name, value: column.name }));
  const cursorValue = cursorsByResource.get(route.resource) ?? "";
  const hasCursorSelect =
    route.hasReadLevers && route.isNamedResource && readMode === ReadMode.INCREMENTAL;

  return (
    <>
      <ControlsGroup
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onKeyDown={stopPropagation}
      >
        {route.hasReadLevers && (
          <SelectInput
            options={readModeSelectOptions}
            value={readModeSelectOptions.find((option) => option.value === readMode) ?? null}
            onChange={(option) => handleReadModeChange(option.value as ReadMode)}
            variant={InputVariant.TERTIARY}
            size={InputSize.SMALL}
            placeholder="Read mode"
            width={PIPELINE_CANVAS_ROUTES_READ_MODE_SELECT_WIDTH}
            isDisabled={isReadOnly}
          />
        )}
        {hasCursorSelect && (
          <SelectInput
            options={cursorSelectOptions}
            value={cursorSelectOptions.find((option) => option.value === cursorValue) ?? null}
            onChange={(option) => handleCursorChange(route.resource, option.value as string)}
            variant={InputVariant.TERTIARY}
            size={InputSize.SMALL}
            placeholder="Cursor"
            width={PIPELINE_CANVAS_ROUTES_CURSOR_SELECT_WIDTH}
            isDisabled={isReadOnly || isLoadingColumns}
          />
        )}
      </ControlsGroup>
      <CenterSlot>{children}</CenterSlot>
      <ControlsGroup
        onClick={stopPropagation}
        onMouseDown={stopPropagation}
        onKeyDown={stopPropagation}
      >
        <SelectInput
          options={writeModeSelectOptions}
          value={writeModeSelectOptions.find((option) => option.value === writeMode) ?? null}
          onChange={(option) => handleWriteModeChange(option.value as WriteMode)}
          variant={InputVariant.TERTIARY}
          size={InputSize.SMALL}
          placeholder="Write mode"
          width={PIPELINE_CANVAS_ROUTES_WRITE_MODE_SELECT_WIDTH}
          isDisabled={isReadOnly}
        />
      </ControlsGroup>
    </>
  );
};

export default PipelineCanvasRoutesRowControls;
