
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Income {
  id: number;
  checkinDate: string;
  amount: number;
}

export default function MonthlyIncomeChart() {
  const [incomeData, setIncomeData] = useState<Income[]>([]);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await fetch("http://localhost:8081/income");
        const data: Income[] = await res.json();
        setIncomeData(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIncome();
  }, []);

  useEffect(() => {
    if (incomeData.length === 0) return;

    // สร้าง object เพื่อรวมรายเดือน
    const monthlyTotals: { [key: string]: number } = {};

    incomeData.forEach((item) => {
      const month = item.checkinDate.slice(0, 7); // '2025-10'
      if (!monthlyTotals[month]) monthlyTotals[month] = 0;
      monthlyTotals[month] += item.amount;
    });

    // แปลงเป็น data สำหรับ chart
    const labels = Object.keys(monthlyTotals).sort();
    const data = labels.map((month) => monthlyTotals[month]);

    setChartData({
      labels,
      datasets: [
        {
          label: "รายได้ต่อเดือน (฿)",
          data,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
    });
  }, [incomeData]);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">📊 รายได้รายเดือน</h2>
      <Line data={chartData} />
    </div>
  );
}
