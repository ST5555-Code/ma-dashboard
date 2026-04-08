import { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, LineStyle, LineSeries } from 'lightweight-charts';

const THEME = {
  background: '#141E35',
  text: '#A0AEC0',
  grid: '#1E2846',
  crosshair: '#DCB96E',
};

export default function LWChart({ data, color = '#DCB96E', unit = '', referenceLine }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  // Convert data to lightweight-charts format: { time: 'YYYY-MM-DD', value: number }
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data.map(d => ({
      time: d.date,
      value: d.value,
    }));
  }, [data]);

  // Create chart once
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: THEME.background },
        textColor: THEME.text,
        fontSize: 10,
      },
      grid: {
        vertLines: { color: THEME.grid },
        horzLines: { color: THEME.grid },
      },
      crosshair: {
        vertLine: { color: THEME.crosshair, width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#1E2846' },
        horzLine: { color: THEME.crosshair, width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#1E2846' },
      },
      rightPriceScale: {
        borderColor: THEME.grid,
      },
      timeScale: {
        borderColor: THEME.grid,
        timeVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
      width: containerRef.current.clientWidth,
      height: 160,
    });

    const series = chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#1E2846',
      crosshairMarkerBackgroundColor: color,
      priceFormat: {
        type: 'custom',
        formatter: (price) => unit === ' bps' ? `${Math.round(price)} bps` : price.toFixed(2) + unit,
      },
    });

    // Add reference line if provided
    if (referenceLine != null) {
      series.createPriceLine({
        price: referenceLine,
        color: '#A0AEC0',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
      });
    }

    chartRef.current = chart;
    seriesRef.current = series;

    // Resize observer
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [color, unit, referenceLine]);

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !chartData.length) return;
    seriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [chartData]);

  return <div ref={containerRef} className="w-full" />;
}
