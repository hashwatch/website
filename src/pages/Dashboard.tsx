import React, { useEffect, useState } from "react";
import { getDevices, getMinerMetrics } from "../api";
import { useNavigate } from "react-router-dom";

const POLL_INTERVAL = 1000;

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [metricsMap, setMetricsMap] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  useEffect(() => {
    getDevices().then(setDevices);
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    devices.forEach(d => {
      const f = async () => {
        const m = await getMinerMetrics(d.tag);
        setMetricsMap(prev => ({ ...prev, [d.tag]: m }));
      };
      f();
      timers.push(window.setInterval(f, POLL_INTERVAL));
    });
    return () => timers.forEach(clearInterval);
  }, [devices]);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Name</th>
            <th>Model</th>
            <th>Hashrate</th>
            <th>Power</th>
            <th>Voltage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {devices.map(d => {
            const m = metricsMap[d.tag] ?? {};
            const active = m.active ?? d.is_active ?? false;
            return (
              <tr key={d.tag} onClick={() => navigate(`/dashboard/${d.tag}`)} style={{ cursor: "pointer" }}>
                <td>{d.tag}</td>
                <td>{d.name}</td>
                <td>{d.model}</td>
                <td>{m.hashrate ?? "-"}</td>
                <td>{m.power ?? "-"}</td>
                <td>{m.voltage ?? "-"}</td>
                <td className={active ? "status-on" : "status-off"}>{active ? "ON" : "OFF"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
