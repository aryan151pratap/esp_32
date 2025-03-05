import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from 'axios';

const StorageAndRamInfo = ({serverUrl}) => {
  const [storage, setStorage] = useState({ total: 4, used: 1, free: 2 });
  const [ram, setRam] = useState({ total: 1, used: 2, free: 5 });
  // const [serverUrl, setServerUrl] = useState("https://esp-32-igyl.onrender.com/storage");


  const fetchStorage = () => {
    axios
      .get(`${serverUrl}/storage`, {
        headers: {
          "ngrok-skip-browser-warning": "true", // Bypasses the warning page
        },
      })
      .then((response) => {
        let data = response.data;
        setStorage({
          total: data.storage.total,
          used: data.storage.used,
          free: data.storage.free,
        });

        setRam({
          total: data.ram.total,
          used: data.ram.used,
          free: data.ram.free,
        });
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  };

  useEffect(() => {
    fetchStorage();
    const interval = setInterval(fetchStorage, 5000);
    return () => clearInterval(interval);
  }, [serverUrl]);


  const formatBytes = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const storageData = [
    { name: "Used", value: storage.used, fill: "#FF5733" },
    { name: "Free", value: storage.free, fill: "#2ECC71" },
  ];

  const ramData = [
    { name: "Used", value: ram.used, fill: "#3498DB" },
    { name: "Free", value: ram.free, fill: "#F1C40F" },
  ];

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center p-6 bg-zinc-900 text-white w-full">
      <h2 className="text-2xl font-bold mb-6">System Resource Dashboard</h2>

      <div className="w-full max-w-4xl">
        {/* Storage Usage */}
        <h3 className="text-xl font-semibold mb-2">Storage Usage</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart layout="vertical" data={storageData} margin={{ left: 50, right: 30 }}>
            <XAxis type="number" tickFormatter={formatBytes} />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip formatter={(value) => formatBytes(value)} />
            <Legend />
            <Bar dataKey="value" fill="#FF5733" name="Used Storage" />
            <Bar dataKey="value" fill="#2ECC71" name="Free Storage" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-center">Total: {formatBytes(storage.total)}</p>

        {/* RAM Usage */}
        <h3 className="text-xl font-semibold mt-6 mb-2">RAM Usage</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart layout="vertical" data={ramData} margin={{ left: 50, right: 30 }}>
            <XAxis type="number" tickFormatter={formatBytes} />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip formatter={(value) => formatBytes(value)} />
            <Legend />
            <Bar dataKey="value" fill="#3498DB" name="Used RAM" />
            <Bar dataKey="value" fill="#F1C40F" name="Free RAM" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-center">Total: {formatBytes(ram.total)}</p>
      </div>
    </div>
  );
};

export default StorageAndRamInfo;
