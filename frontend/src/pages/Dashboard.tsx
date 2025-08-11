import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  useMonthlyOverview,
  useYearlyTrends,
  useCategoryBreakdown,
  useRecentTransactions,
} from "../hooks/useAnalytics";
import "../styles/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyOverview();
  const { data: yearlyData, isLoading: yearlyLoading } = useYearlyTrends();
  const { data: categoryData, isLoading: categoryLoading } =
    useCategoryBreakdown("expense");
  const { data: recentTransactions, isLoading: recentLoading } =
    useRecentTransactions(5);

  const fmt = (n?: number) => (n ?? 0).toFixed(2);
  const balance = monthlyData?.overview?.balance ?? 0; // <- safe number
  const totalIncome = monthlyData?.overview?.totalIncome ?? 0;
  const totalExpense = monthlyData?.overview?.totalExpense ?? 0;
  const incomeCount = monthlyData?.overview?.incomeCount ?? 0;
  const expenseCount = monthlyData?.overview?.expenseCount ?? 0;

  const lineChartData = useMemo(() => {
    if (!monthlyData?.dailyData) return null;

    return {
      labels: monthlyData.dailyData.map((d) =>
        new Date(d.date).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        })
      ),
      datasets: [
        {
          label: "Income",
          data: monthlyData.dailyData.map((d) => d.income),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
        },
        {
          label: "Expense",
          data: monthlyData.dailyData.map((d) => d.expense),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          tension: 0.4,
        },
      ],
    };
  }, [monthlyData]);

  const pieChartData = useMemo(() => {
    if (!categoryData) return null;

    return {
      labels: categoryData.slice(0, 5).map((c) => c.name),
      datasets: [
        {
          data: categoryData.slice(0, 5).map((c) => c.total),
          backgroundColor: categoryData
            .slice(0, 5)
            .map((c) => c.color || "#808080"),
          borderWidth: 1,
        },
      ],
    };
  }, [categoryData]);

  const barChartData = useMemo(() => {
    if (!yearlyData?.monthlyData) return null;

    return {
      labels: yearlyData.monthlyData.map((m) => m.month),
      datasets: [
        {
          label: "Income",
          data: yearlyData.monthlyData.map((m) => m.income),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Expense",
          data: yearlyData.monthlyData.map((m) => m.expense),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    };
  }, [yearlyData]);

  if (monthlyLoading || yearlyLoading || categoryLoading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>Total Income</h3>
            <p className="stat-value">${fmt(totalIncome)}</p>
            <span className="stat-change positive">
              <ArrowUpRight size={16} />
              {monthlyData?.overview.incomeCount || 0} transactions
            </span>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDown />
          </div>
          <div className="stat-content">
            <h3>Total Expense</h3>
            <p className="stat-value">${fmt(totalExpense)}</p>
            <span className="stat-change negative">
              <ArrowDownRight size={16} />
              {monthlyData?.overview.expenseCount || 0} transactions
            </span>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-icon">
            <DollarSign />
          </div>
          <div className="stat-content">
            <h3>Net Balance</h3>
            <p className="stat-value">${fmt(balance)}</p>
            <span
              className={`stat-change ${
                balance >= 0 ? "positive" : "negative"
              }`}
            >
              <Activity size={16} />
              {balance >= 0 ? "Profit" : "Loss"}
            </span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Trend</h3>
          {lineChartData && (
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" as const },
                },
              }}
            />
          )}
        </div>

        <div className="chart-card">
          <h3>Expense Categories</h3>
          {pieChartData && (
            <Pie
              data={pieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "right" as const },
                },
              }}
            />
          )}
        </div>

        <div className="chart-card full-width">
          <h3>Yearly Overview</h3>
          {barChartData && (
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" as const },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          )}
        </div>
      </div>

      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <div className="transaction-list">
          {recentTransactions?.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <span className="transaction-category">
                  {transaction.category_name}
                </span>
                <span className="transaction-description">
                  {transaction.description}
                </span>
                <span className="transaction-date">
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </span>
              </div>
              <span className={`transaction-amount ${transaction.type}`}>
                {transaction.type === "income" ? "+" : "-"}${transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
