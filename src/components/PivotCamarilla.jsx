// PivotFibonacci.jsx
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

function getPreviousDate(dateString) {
  const d = new Date(dateString);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function PivotFibonacci() {
  const [symbol, setSymbol] = useState("XAU/USD");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hourlyData, setHourlyData] = useState([]);

  const apiKey = "8eca64515f2a4e58a6ee1152d5fc384b";

  async function fetchData() {
    setLoading(true);
    try {
      const previousDate = getPreviousDate(date);

      const dailyRes = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
          symbol
        )}&interval=1day&outputsize=100&timezone=UTC&apikey=${apiKey}`
      );
      const dailyData = await dailyRes.json();
      const previousDayData = dailyData.values.find((v) =>
        v.datetime.startsWith(previousDate)
      );

      if (!previousDayData)
        throw new Error("No daily data for previous day");

      const { high, low, close } = previousDayData;
      const H = parseFloat(high),
        L = parseFloat(low),
        C = parseFloat(close);

      // Fibonacci Pivot Points calculation
      const pivot = (H + L + C) / 3;
      const range = H - L;

      const fibonacci = {
        r3: pivot + range * 1.000,
        r2: pivot + range * 0.618,
        r1: pivot + range * 0.382,
        pivot: pivot,
        s1: pivot - range * 0.382,
        s2: pivot - range * 0.618,
        s3: pivot - range * 1.000,
      };

      setResult({ fibonacci });

      const hourlyRes = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
          symbol
        )}&interval=1h&outputsize=100&timezone=UTC&apikey=${apiKey}`
      );
      const hourlyJson = await hourlyRes.json();

      const filteredHourly = hourlyJson.values.filter((v) =>
        v.datetime.startsWith(date)
      );
      const reversed = [...filteredHourly].reverse();

      setHourlyData(
        reversed.map((item) => ({
          time: item.datetime,
          price: parseFloat(item.close),
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setResult(null);
      setHourlyData([]);
    } finally {
      setLoading(false);
    }
  }

  const chartData = {
    labels: hourlyData.map((d) => d.time),
    datasets: [
      {
        label: "قیمت ساعتی",
        data: hourlyData.map((d) => d.price),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
        pointRadius: 0,
      },
      ...(result
        ? Object.entries(result.fibonacci).map(([label, value]) => ({
            label: label.toUpperCase(),
            data: hourlyData.map(() => value),
            borderColor:
              label === "pivot"
                ? "#0ea5e9"
                : label.startsWith("r")
                ? "#10b981"
                : "#ef4444",
            borderWidth: 1,
            borderDash: [5, 5],
            pointRadius: 0,
          }))
        : []),
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false, // خیلی مهم برای ارتفاع دلخواه
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `نمودار ساعتی + پیوت فیبوناچی برای ${date}`,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
          tooltipFormat: "HH:mm",
        },
        title: { display: true, text: "ساعت (UTC)" },
      },
      y: {
        title: { display: true, text: "قیمت" },
      },
    },
  };

  const resistances = ["r3", "r2", "r1"];
  const supports = ["s1", "s2", "s3"];
  const pivot = result?.fibonacci?.pivot;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">
        محاسبه و نمایش پیوت پوینت فیبوناچی
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="text"
          placeholder="نماد (مثل XAU/USD)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button onClick={fetchData} disabled={loading}>
          {loading ? "در حال دریافت داده..." : "محاسبه و نمایش نمودار"}
        </Button>
      </div>

      {result && (
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold mb-4">پیوت پوینت فیبوناچی</h2>
            <table className="w-full text-center border border-gray-300 rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3">مقاومت</th>
                  <th className="py-2 px-3">پیوت</th>
                  <th className="py-2 px-3">حمایت</th>
                </tr>
              </thead>
              <tbody>
                {resistances.map((r, i) => (
                  <tr key={r} className="border-t">
                    <td>{result.fibonacci[r].toFixed(2)}</td>
                    {i === 0 && (
                      <td rowSpan={3} className="font-bold align-middle">
                        {pivot.toFixed(2)}
                      </td>
                    )}
                    <td>{result.fibonacci[supports[i]].toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {hourlyData.length > 0 && (
        <Card className="w-full h-[600px]">
        <CardContent className="p-4 h-full">
              <div className="w-full h-full p-4 space-y-4">
                  <Line options={chartOptions} data={chartData} />
                </div>
              </CardContent>
            </Card>
            // card= سایز پس زمینه نمودار
            // cardContent= ساز نمودار
      )}
    </div>
  );
}
