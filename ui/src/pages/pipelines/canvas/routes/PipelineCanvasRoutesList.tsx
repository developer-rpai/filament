import { useMemo, useRef } from "react";

import { styled } from "@linaria/react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { usePipelineCanvasIsRunning } from "@/pages/pipelines/canvas/hooks/usePipelineCanvasIsRunning";
import { usePipelineCanvasSelection } from "@/pages/pipelines/canvas/hooks/usePipelineCanvasSelection";
import {
  PIPELINE_CANVAS_ROUTES_LIST_PADDING_Y,
  PIPELINE_CANVAS_ROUTES_OVERSCAN,
  PIPELINE_CANVAS_ROUTES_ROW_HEIGHT,
} from "@/pages/pipelines/canvas/routes/constants";
import PipelineCanvasRoutesEmpty from "@/pages/pipelines/canvas/routes/PipelineCanvasRoutesEmpty";
import PipelineCanvasRoutesRow from "@/pages/pipelines/canvas/routes/PipelineCanvasRoutesRow";
import type { PipelineCanvasRoute } from "@/pages/pipelines/canvas/routes/types";

const ListScroller = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  overflow: auto;
`;

const ListInner = styled.div`
  position: relative;
  width: 100%;
`;

const ListRowSlot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${PIPELINE_CANVAS_ROUTES_ROW_HEIGHT}px;
`;

interface PipelineCanvasRoutesListProps {
  routes: PipelineCanvasRoute[];
  hasRoutes: boolean;
}

const PipelineCanvasRoutesList = ({ routes, hasRoutes }: PipelineCanvasRoutesListProps) => {
  const { selectedNodeId, selectedResourceId, selectResource, clearSelection } =
    usePipelineCanvasSelection();
  const isRunning = usePipelineCanvasIsRunning();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: routes.length,
    getScrollElement: () => scrollerRef.current,
    estimateSize: () => PIPELINE_CANVAS_ROUTES_ROW_HEIGHT,
    getItemKey: (index) => routes[index].edge.id,
    overscan: PIPELINE_CANVAS_ROUTES_OVERSCAN,
    paddingStart: PIPELINE_CANVAS_ROUTES_LIST_PADDING_Y,
    paddingEnd: PIPELINE_CANVAS_ROUTES_LIST_PADDING_Y,
  });

  const selectedGroupKey = useMemo(
    () => routes.find((route) => route.edge.id === selectedResourceId)?.groupKey,
    [routes, selectedResourceId],
  );

  const handleBackgroundClick = () => {
    if (selectedNodeId !== undefined || selectedResourceId !== undefined) clearSelection();
  };

  if (routes.length === 0) {
    return (
      <ListScroller onClick={handleBackgroundClick}>
        <PipelineCanvasRoutesEmpty hasRoutes={hasRoutes} />
      </ListScroller>
    );
  }

  return (
    <ListScroller ref={scrollerRef} onClick={handleBackgroundClick}>
      <ListInner style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => {
          const route = routes[item.index];
          return (
            <ListRowSlot key={item.key} style={{ transform: `translateY(${item.start}px)` }}>
              <PipelineCanvasRoutesRow
                route={route}
                isSelected={route.edge.id === selectedResourceId}
                isGroupSelected={route.groupKey === selectedGroupKey}
                isRunning={isRunning}
                onSelect={selectResource}
              />
            </ListRowSlot>
          );
        })}
      </ListInner>
    </ListScroller>
  );
};

export default PipelineCanvasRoutesList;
