import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getMinerMetrics, getMinerHistory } from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const METRICS_POLL_INTERVAL = 1000;  // 1 секунда
const HISTORY_POLL_INTERVAL = 10000; // 10 секунд

type MetricName = "hashrate" | "power" | "voltage";

const MINER_METRICS: MetricName[] = ["hashrate", "power", "voltage"];

const MemoizedChart = React.memo(
  ({
    data,
    xTicks,
    metric,
  }: {
    data: { time: string; value: number }[];
    xTicks: string[];
    metric: MetricName;
  }) => (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" ticks={xTicks} />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8884d8"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
);

const MinerDashboard: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const [metrics, setMetrics] = useState<any>(null);

  // Данные графиков
  const [history, setHistory] = useState<Record<MetricName, { time: string; value: number }[]>>({
    hashrate: [],
    power: [],
    voltage: [],
  });

  // Периоды в часах для селектора
  const [periods, setPeriods] = useState<Record<MetricName, number>>({
    hashrate: 24,
    power: 24,
    voltage: 24,
  });

  // Метки оси X для каждого графика
  const [xTicks, setXTicks] = useState<Record<MetricName, string[]>>({
    hashrate: [],
    power: [],
    voltage: [],
  });

  const generateXTicks = (hours: number) => {
    const count = 12;
    const stepMinutes = (hours * 60) / count;
    const now = new Date();
    const ticks: string[] = [];
    for (let i = count; i > 0; i--) {
      const d = new Date(now.getTime() - i * stepMinutes * 60 * 1000);
      const label = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes()
        .toString()
        .padStart(2, "0")}`;
      ticks.push(label);
    }
    return ticks;
  };

  const fetchMetrics = useCallback(async () => {
    if (!tag) return;
    const m = await getMinerMetrics(tag);
    setMetrics(m);
  }, [tag]);

  const fetchHistory = useCallback(
    async (metric: MetricName) => {
      if (!tag) return;
      const data = await getMinerHistory(tag, metric, periods[metric], 500);
      const formatted = data?.data?.map((d: any) => ({
        time: d.time,
        value: d.value,
      })) ?? [];
      setHistory((prev) => ({ ...prev, [metric]: formatted }));
    },
    [tag, periods]
  );

  useEffect(() => {
    if (!tag) return;

    // Базовые метрики каждую секунду
    fetchMetrics();
    const metricsTimer = setInterval(fetchMetrics, METRICS_POLL_INTERVAL);

    // История каждые 10 секунд
    MINER_METRICS.forEach(fetchHistory);
    const historyTimer = setInterval(() => {
      MINER_METRICS.forEach(fetchHistory);
    }, HISTORY_POLL_INTERVAL);

    return () => {
      clearInterval(metricsTimer);
      clearInterval(historyTimer);
    };
  }, [tag, fetchMetrics, fetchHistory]);

  // Пересчёт меток оси X при смене периода
  useEffect(() => {
    const newTicks: Record<MetricName, string[]> = {
      hashrate: generateXTicks(periods.hashrate),
      power: generateXTicks(periods.power),
      voltage: generateXTicks(periods.voltage),
    };
    setXTicks(newTicks);
  }, [periods]);

  if (!metrics) return <div className="container">Loading...</div>;

  const handlePeriodChange = (metric: MetricName, hours: number) => {
    setPeriods((prev) => ({ ...prev, [metric]: hours }));
  };

  return (
    <div className="container">
      <h1>Miner {tag}</h1>
      <div className="flex mb-4">
        <div className="panel flex-1">
          <div>Tag: {tag}</div>
          <div>Name: {metrics.name ?? "-"}</div>
          <div>Model: {metrics.model ?? "-"}</div>
        </div>
        <div className={`panel flex-1 ${metrics.active ? "" : "disabled"}`}>
          {metrics.active ? (
            <>
              <div>Hashrate: {metrics.hashrate ?? "-"}</div>
              <div>Power: {metrics.power ?? "-"}</div>
              <div>Voltage: {metrics.voltage ?? "-"}</div>
            </>
          ) : (
            <div>Device is off</div>
          )}
        </div>
      </div>

      {MINER_METRICS.map((metric) => (
        <div key={metric} className="panel mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3>{metric.toUpperCase()}</h3>
            <select
              value={periods[metric]}
              onChange={(e) => handlePeriodChange(metric, Number(e.target.value))}
            >
              <option value={1}>1h</option>
              <option value={24}>24h</option>
            </select>
          </div>
          <MemoizedChart data={history[metric]} xTicks={xTicks[metric]} metric={metric} />
        </div>
      ))}
    </div>
  );
};

export default MinerDashboard;
