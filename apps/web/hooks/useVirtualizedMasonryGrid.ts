import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";

type GridBreakpoint = {
  minWidth: number;
  columns: number;
};

type UseVirtualizedMasonryGridOptions<T> = {
  items: T[];
  isLoading?: boolean;
  minItemsToVirtualize?: number;
  estimateRowHeight?: number;
  overscan?: number;
  rowGap?: number;
  breakpoints?: GridBreakpoint[];
};

type VirtualizedMasonryRow<T> = {
  virtualItem: VirtualItem;
  items: T[];
  style: CSSProperties;
  measureElement: (node: Element | null) => void;
};

type UseVirtualizedMasonryGridResult<T> = {
  containerRef: RefObject<HTMLDivElement | null>;
  columnCount: number;
  gridTemplateColumnsStyle: CSSProperties;
  shouldVirtualize: boolean;
  virtualRows: VirtualizedMasonryRow<T>[];
  totalHeight: number;
};

const DEFAULT_BREAKPOINTS: GridBreakpoint[] = [
  { minWidth: 1280, columns: 3 },
  { minWidth: 768, columns: 2 },
  { minWidth: 0, columns: 1 },
];
const DEFAULT_MIN_ITEMS = 20;
const DEFAULT_ESTIMATE_ROW_HEIGHT = 96;
const DEFAULT_ROW_GAP = 24;
const DEFAULT_OVERSCAN = 6;

// 根据容器宽度与断点数组，决定当前使用几列
const getColumnsForWidth = (width: number, breakpoints: GridBreakpoint[]) => {
  const match = breakpoints.find((bp) => width >= bp.minWidth);
  return match?.columns ?? 1;
};

// 创建一个可响应式的、支持虚拟化的瀑布流布局
export function useVirtualizedMasonryGrid<T>(
  options: UseVirtualizedMasonryGridOptions<T>,
): UseVirtualizedMasonryGridResult<T> {
  const {
    items,
    isLoading = false,
    minItemsToVirtualize = DEFAULT_MIN_ITEMS,
    estimateRowHeight = DEFAULT_ESTIMATE_ROW_HEIGHT,
    overscan = DEFAULT_OVERSCAN,
    rowGap = DEFAULT_ROW_GAP,
    breakpoints,
  } = options;

  // 外层滚动容器
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 当前使用的列数
  const [columnCount, setColumnCount] = useState(1);
  // 断点排序（从大到小），每次 breakpoints 变化都重新排序，可以复用默认断点
  const normalizedBreakpoints = useMemo(
    () => [...(breakpoints ?? DEFAULT_BREAKPOINTS)].sort((a, b) => b.minWidth - a.minWidth),
    [breakpoints],
  );
  // 监听容器宽度变化，动态调整列数
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateColumnCount = () => {
      const width = container.clientWidth || window.innerWidth;
      setColumnCount(getColumnsForWidth(width, normalizedBreakpoints));
    };

    updateColumnCount();
    const resizeObserver = new ResizeObserver(updateColumnCount);
    resizeObserver.observe(container);
    window.addEventListener("resize", updateColumnCount);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateColumnCount);
    };
  }, [normalizedBreakpoints]);
  // 是否启用虚拟列表
  const shouldVirtualize = !isLoading && items.length > minItemsToVirtualize;
  // 总行数 = 向上取整( 总item数 / 列数 )
  const rowCount = Math.ceil(items.length / columnCount);
  // 创建一个虚拟列表，用于管理行数和滚动位置
  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? rowCount : 0,
    getScrollElement: () => containerRef.current,
    // 每行的预估高度（px），在 translateY 处可以固定为estimateRowHeight + rowGap(px)，这样每次步进都是estimateRowHeight + rowGap(px)
    estimateSize: () => estimateRowHeight + rowGap,
    // 预渲染行数，多渲染前后 overscan 行，避免快速滚动时出现空白
    overscan,
    // 为每个虚拟项添加 data-index 属性，用于标识其在原始数据中的位置
    indexAttribute: "data-index",
  });

  // 列数变化后，需要让虚拟器重新测量高度
  useEffect(() => {
    if (!shouldVirtualize) return;
    rowVirtualizer.measure();
  }, [columnCount, items.length, rowVirtualizer, shouldVirtualize]);

  // 生成 CSS 样式，用于设置网格布局的列数
  const gridTemplateColumnsStyle = useMemo(
    () => ({ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }),
    [columnCount],
  );
  // 生成虚拟行数据，用于渲染虚拟列表
  const virtualRows: VirtualizedMasonryRow<T>[] = shouldVirtualize
    ? rowVirtualizer.getVirtualItems().map((virtualItem) => {
      const rowItems = items.slice(
        virtualItem.index * columnCount,
        virtualItem.index * columnCount + columnCount,
      );
      return {
        virtualItem,
        items: rowItems,
        style: {
          transform: `translateY(${virtualItem.start}px)`,
          paddingBottom: virtualItem.index === rowCount - 1 ? 0 : rowGap,
        },
        measureElement: rowVirtualizer.measureElement,
      };
    })
    : [];

  return {
    containerRef,
    columnCount,
    gridTemplateColumnsStyle,
    shouldVirtualize,
    virtualRows,
    totalHeight: shouldVirtualize ? rowVirtualizer.getTotalSize() : 0,
  };
}
