// PivotClassic.jsx
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { Line } from "react-chartjs-2";

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

// تابع کمکی برای گرفتن تاریخ روز قبل
function getPreviousDate(dateString) {
  const d = new Date(dateString);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function PivotClassic() {
  const [symbol, setSymbol] = useState("XAU/USD");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hourlyData, setHourlyData] = useState([]);

  const apiKey = "8eca64515f2a4e58a6ee1152d5fc384b";

  const fetchData = async () => {
    setLoading(true);
    try {
      const previousDate = getPreviousDate(date);

      const dailyRes = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1day&outputsize=100&timezone=UTC&apikey=${apiKey}`
      );
      const dailyData = await dailyRes.json();
      const previousDay = dailyData.values.find(v => v.datetime.startsWith(previousDate));
      if (!previousDay) throw new Error("داده‌ای برای روز قبل موجود نیست");

      const { high, low, close } = previousDay;
      const H = parseFloat(high), L = parseFloat(low), C = parseFloat(close);

      const pivot = (H + L + C) / 3;
      const classic = {
        r3: H + 2 * (pivot - L),
        r2: pivot + (H - L),
        r1: 2 * pivot - L,
        pivot: pivot,
        s1: 2 * pivot - H,
        s2: pivot - (H - L),
        s3: L - 2 * (H - pivot)
      };

      setResult({ classic });

      const hourlyRes = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(symbol)}&interval=1h&outputsize=100&timezone=UTC&apikey=${apiKey}`
      );
      const hourlyJson = await hourlyRes.json();
      const filteredHourly = hourlyJson.values.filter(v => v.datetime.startsWith(date));
      const reversed = [...filteredHourly].reverse();

      setHourlyData(reversed.map(item => ({
        time: item.datetime,
        price: parseFloat(item.close)
      })));

    } catch (error) {
      console.error("خطا در دریافت داده:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const pivotLines = result
    ? Object.entries(result.classic).map(([label, value]) => ({
        label: label.toUpperCase(),
        value: value.toFixed(1)
      }))
    : [];

  const chartData = {
    labels: hourlyData.map(d => d.time),
    datasets: [
      {
        label: "قیمت ساعتی",
        data: hourlyData.map(d => d.price),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
        pointRadius: 0
      },
      ...pivotLines.map(pivot => ({
        label: pivot.label,
        data: hourlyData.map(() => pivot.value),
        borderColor:
          pivot.label === "PIVOT" ? "#0ea5e9" :
          pivot.label.startsWith("R") ? "#10b981" : "#ef4444",
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0
      }))
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false, // خیلی مهم برای ارتفاع دلخواه
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `نمودار ساعتی + پیوت پوینت‌ها برای ${date}` }
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
          tooltipFormat: "HH:mm"
        },
        title: { display: true, text: "ساعت (UTC)" }
      },
      y: {
        title: { display: true, text: "قیمت" }
      }
    }
  };

  const supports = ["s1", "s2", "s3"];
  const resistances = ["r1", "r2", "r3"];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-4">محاسبه پیوت پوینت کلاسیک</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input type="text" placeholder="نماد (مثل XAU/USD)" value={symbol} onChange={e => setSymbol(e.target.value)} />
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Button onClick={fetchData} disabled={loading}>
          {loading ? "در حال دریافت داده..." : "محاسبه و نمایش نمودار"}
        </Button>
      </div>

      {result && (
        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <h2 className="font-bold mb-4">پیوت پوینت کلاسیک</h2>
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
                    <td>{result.classic[r].toFixed(2)}</td>
                    {i === 0 && (
                      <td rowSpan={3} className="font-bold align-middle">
                        {result.classic.pivot.toFixed(2)}
                      </td>
                    )}
                    <td>{result.classic[supports[i]].toFixed(2)}</td>
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
