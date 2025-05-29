// src/components/AdminOrderStatistics/AdminOrderStatistics.jsx
import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { useGetAdminOrderStatisticsQuery } from '../../redux/ordersByAdminAuthApi/ordersByAdminAuthApi';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { useSelector } from 'react-redux';

const AdminOrderStatistics = () => {
  const darkMode = useSelector(s => s.theme.darkMode);
  const { data: stats, isLoading, isError } = useGetAdminOrderStatisticsQuery();

  // Responsive pie sizing
  const [sw, setSw] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setSw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const getPieSize = () => {
    if (sw <= 480) return { inner: 16, outer: 28, w: 64, h: 64 };
    if (sw <= 768) return { inner: 20, outer: 32, w: 80, h: 80 };
    return { inner: 24, outer: 36, w: 96, h: 96 };
  };
  const { inner, outer, w, h } = getPieSize();

  if (isLoading) return <Loader />;
  if (isError) return <p className='text-red-500 text-center'>Unauthorized! Chief Admin only.</p>;//<Error message={error?.data?.message || 'Failed to fetch order statistics'>;

  // Prepare status breakdown
  const statusData = Object.entries(stats.orders.statusBreakdown || {})
    .map(([name, value]) => ({ name, value }));
  const COLORS = ['#4F46E5','#22C55E','#FACC15','#EF4444','#06B6D4','#A855F7','#EC4899','#10B981'];

  return (
    <div className={`rounded-lg p-6 mx-4 mt-6 shadow-lg transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
    }`}>
      <h2 className="text-2xl font-bold text-center mb-6">My Order Statistics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
        <div>
          <p className="font-medium">Total Orders</p>
          <p className="text-xl font-semibold">{stats.orders.total}</p>
        </div>
        <div>
          <p className="font-medium">State-wide Orders</p>
          <p className="text-xl font-semibold">{stats.stateOrders.total}</p>
        </div>
        <div>
          <p className="font-medium">Total Books Ordered</p>
          <p className="text-xl font-semibold">{stats.orders.totalBooks}</p>
        </div>
        <div>
          <p className="font-medium">Avg Qty / Order</p>
          <p className="text-xl font-semibold">{stats.orders.averageQuantity}</p>
        </div>
      </div>

      {/* Pie chart */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center" style={{ minWidth: w + 40, minHeight: h + 60 }}>
          <h4 className="mb-2 font-semibold">Status Breakdown</h4>
          <PieChart width={w * 2} height={h * 2}>
            <Pie
              data={statusData}
              cx="50%" cy="50%"
              innerRadius={inner} outerRadius={outer}
              dataKey="value" nameKey="name"
              startAngle={90} endAngle={-270}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                const RAD = Math.PI / 180;
                const r = innerRadius + (outerRadius - innerRadius) * 2.5;
                const x = cx + r * Math.cos(-midAngle * RAD);
                const y = cy + r * Math.sin(-midAngle * RAD);
                return (
                  <text
                    x={x} y={y}
                    fill={darkMode ? '#E5E7EB' : '#333'}
                    textAnchor={x > cx ? 'end' : 'start'}
                    dominantBaseline="central"
                    fontSize={12}
                  >
                    {value}
                  </text>
                );
              }}
            >
              {statusData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <ReTooltip
              formatter={(v, n) => [v, n]}
              contentStyle={{
                backgroundColor: darkMode ? '#1F2937' : '#fff',
                borderColor:    darkMode ? '#4B5563' : '#E5E7EB',
                color:          darkMode ? '#E5E7EB' : '#111827'
              }}
            />
          </PieChart>
        </div>
      </div>

      {/* Bar chart */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-center mb-2">Status Breakdown (Bar)</h4>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4B5563' : '#D1D5DB'} />
              <XAxis dataKey="name" stroke={darkMode ? '#E5E7EB' : '#111827'} />
              <YAxis stroke={darkMode ? '#E5E7EB' : '#111827'} />
              <ReTooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#fff',
                  borderColor: darkMode ? '#4B5563' : '#E5E7EB',
                  color: darkMode ? '#E5E7EB' : '#111827'
                }}
              />
              <Bar dataKey="value" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders list */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-4 text-center">Recent Orders</h4>
        <ul className="space-y-3 max-h-64 overflow-y-auto">
          {stats.orders.recent.map(o => (
            <li
              key={o._id}
              className={`flex flex-col sm:flex-row justify-between p-3 rounded-md shadow-md ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            >
              <div>
                <p className="font-medium">ID: {o._id}</p>
                <p className="text-sm">On: {new Date(o.createdAt).toLocaleDateString()}</p>
                <p className="text-sm">State: {o.adminState}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <p className="font-semibold">Qty Ordered:</p>
                <p className="text-lg">{o.orderItems.reduce((sum, i) => sum + i.quantity, 0)} books</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminOrderStatistics;
