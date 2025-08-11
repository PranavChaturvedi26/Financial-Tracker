import React, { useState, useMemo } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useYearlyTrends, useCategoryBreakdown, useMonthlyOverview } from '../hooks/useAnalytics';
import { Calendar, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import '../styles/Analytics.css';

const Analytics: React.FC = () => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');

  const { data: yearlyData, isLoading: yearlyLoading } = useYearlyTrends(selectedYear);
  const { data: categoryData, isLoading: categoryLoading } = useCategoryBreakdown(categoryType);
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyOverview(selectedYear, selectedMonth);

  const yearlyChartData = useMemo(() => {
    if (!yearlyData?.monthlyData) return null;

    return {
      labels: yearlyData.monthlyData.map(m => m.month),
      datasets: [
        {
          label: 'Income',
          data: yearlyData.monthlyData.map(m => m.income),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Expense',
          data: yearlyData.monthlyData.map(m => m.expense),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Balance',
          data: yearlyData.monthlyData.map(m => m.balance),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
        },
      ],
    };
  }, [yearlyData]);

  const categoryChartData = useMemo(() => {
    if (!categoryData || categoryData.length === 0) return null;

    return {
      labels: categoryData.map(c => c.name),
      datasets: [
        {
          data: categoryData.map(c => c.total),
          backgroundColor: categoryData.map(c => c.color || '#808080'),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  }, [categoryData]);

  const dailyChartData = useMemo(() => {
    if (!monthlyData?.dailyData) return null;

    return {
      labels: monthlyData.dailyData.map(d => 
        new Date(d.date).toLocaleDateString('en-US', { day: '2-digit' })
      ),
      datasets: [
        {
          label: 'Daily Income',
          data: monthlyData.dailyData.map(d => d.income),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Daily Expense',
          data: monthlyData.dailyData.map(d => d.expense),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
      ],
    };
  }, [monthlyData]);

  if (yearlyLoading || categoryLoading || monthlyLoading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <div className="filters">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-selector"
          >
            {[2022, 2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon income">
            <TrendingUp />
          </div>
          <div className="summary-content">
            <h3>Total Income</h3>
            <p className="summary-value">${yearlyData?.totalIncome.toFixed(2) || '0.00'}</p>
            <span className="summary-label">This Year</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon expense">
            <TrendingUp />
          </div>
          <div className="summary-content">
            <h3>Total Expense</h3>
            <p className="summary-value">${yearlyData?.totalExpense.toFixed(2) || '0.00'}</p>
            <span className="summary-label">This Year</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon balance">
            <BarChart3 />
          </div>
          <div className="summary-content">
            <h3>Net Balance</h3>
            <p className="summary-value">${yearlyData?.totalBalance.toFixed(2) || '0.00'}</p>
            <span className="summary-label">This Year</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon average">
            <Calendar />
          </div>
          <div className="summary-content">
            <h3>Monthly Average</h3>
            <p className="summary-value">${yearlyData?.averageMonthlyExpense.toFixed(2) || '0.00'}</p>
            <span className="summary-label">Expense</span>
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-container">
          <h3>Yearly Trends</h3>
          {yearlyChartData && (
            <Line 
              data={yearlyChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' as const },
                  title: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }} 
            />
          )}
        </div>

        <div className="chart-container">
          <h3>Category Distribution</h3>
          <div className="chart-controls">
            <button 
              className={`tab-btn ${categoryType === 'expense' ? 'active' : ''}`}
              onClick={() => setCategoryType('expense')}
            >
              Expenses
            </button>
            <button 
              className={`tab-btn ${categoryType === 'income' ? 'active' : ''}`}
              onClick={() => setCategoryType('income')}
            >
              Income
            </button>
          </div>
          {categoryChartData ? (
            <Doughnut 
              data={categoryChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right' as const },
                },
              }} 
            />
          ) : (
            <div className="no-data">No data available</div>
          )}
        </div>

        <div className="chart-container full-width">
          <h3>Daily Activity - {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <div className="month-selector">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(selectedYear, month - 1).toLocaleDateString('en-US', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          {dailyChartData && (
            <Bar 
              data={dailyChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' as const },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }} 
            />
          )}
        </div>
      </div>

      {categoryData && categoryData.length > 0 && (
        <div className="category-table">
          <h3>Category Breakdown - {categoryType === 'expense' ? 'Expenses' : 'Income'}</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Amount</th>
                <th>Transactions</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((category) => (
                <tr key={category.id}>
                  <td>
                    <span className="category-name" style={{ color: category.color }}>
                      {category.name}
                    </span>
                  </td>
                  <td>${category.total.toFixed(2)}</td>
                  <td>{category.count}</td>
                  <td>
                    <div className="percentage-bar">
                      <div 
                        className="percentage-fill"
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: category.color 
                        }}
                      />
                      <span>{category.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analytics;