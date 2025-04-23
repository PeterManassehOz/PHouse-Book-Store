import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { useState, useEffect } from 'react';
import { useGetStatisticsDataQuery } from '../../redux/adminBookAuthApi/adminBookAuthApi';
import { useGetAllTransactionsForStateAdminQuery } from '../../redux/flutterwaveAdminAuthApi/flutterwaveAdminAuthApi';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { useSelector } from 'react-redux';

const Aggregator = () => {
  const { data: stats, error: statsErr, isLoading: statsLoading } = useGetStatisticsDataQuery();

  const {
    data: txns = [],
    error: txnsErr,
    isLoading: txnsLoading
  } = useGetAllTransactionsForStateAdminQuery();

  const [showError, setShowError] = useState(false);
  const darkMode = useSelector((s) => s.theme.darkMode);

  
  useEffect(() => {
    if (statsErr || txnsErr) setShowError(true);
  }, [statsErr, txnsErr]);

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

  if (statsLoading || txnsLoading) return <Loader />;
  if (showError) return <Error onClose={() => setShowError(false)} />;

  if (
    !stats?.books ||
    !stats?.orders ||
    !stats?.users ||
    !stats?.newsletter
  ) {
    return (
      <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Incomplete statistics data.
      </p>
    );
  }

  const colors = ['#4F46E5','#22C55E','#FACC15','#EF4444','#06B6D4','#A855F7','#EC4899','#10B981'];

   // Compute transaction count & sum from raw txns
   const transactionCount = txns.length;
   const transactionAmount = txns
     .reduce((sum, t) => sum + parseFloat(t.amount), 0)
     .toFixed(2);

  // For two‐slice pies: [ realValue, 0 ]

    // Chart helpers
    const slice = (val, total) => [
      { name: 'Yes', value: val },
      { name: 'No',  value: Math.max(total - val, 0) }
    ];
    const singleSlice = (val) => [
      { name: 'Value', value: val },
      { name: '',      value: 0 }
    ];

     // BOOK pies
  const popularData = slice(stats.books.popular, stats.books.total);
  const recData     = slice(stats.books.recommended, stats.books.total);
  const yearData    = slice(stats.books.yearBooks, stats.books.total);

  // USER pies
  const adminData = slice(stats.users.admins, stats.users.total);
  const usersData = singleSlice(stats.users.total);

  // TRANSACTION pies (from raw)
  const txnCountData  = singleSlice(transactionCount);
  const txnAmountData = singleSlice(parseFloat(transactionAmount));

  // REVENUE & NEWSLETTER
  const revenueData = singleSlice(parseFloat(stats.orders.revenue));
  const newsData    = singleSlice(stats.newsletter.totalSubscribers);


  // Combine all
  const pies = [
    { title: `Popular Books (${stats.books.popular}/${stats.books.total})`, data: popularData },
    { title: `Recommended Books (${stats.books.recommended}/${stats.books.total})`, data: recData },
    { title: `Year Books (${stats.books.yearBooks}/${stats.books.total})`, data: yearData },
    { title: `Admins`, data: adminData },
    { title: `Total Users`, data: usersData },
    { title: `Transaction Count`, data: txnCountData },
    { title: `Transaction Amount (₦)`, data: txnAmountData },
    { title: `Revenue (₦)`, data: revenueData },
    { title: `Newsletter Subs`, data: newsData },
    { title: `Average Rating`, data: singleSlice(parseFloat(stats.books.averageRating)) },
  ];

  // ORDER STATUS BAR
  const orderStatus = Object.entries(stats.orders.statusBreakdown || {})
    .map(([name, count]) => ({ name, count }));

  return (
    <div className={`rounded-lg p-6 mx-4 mt-6 shadow-lg transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'
    }`}>
      <h2 className="text-2xl font-bold text-center mb-4">Platform Aggregated Statistics</h2>

      {/* PIE CHARTS */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        {pies.map((pie) => (
          <div key={pie.title}
          className="flex flex-col items-center p-4"
          style={{ minWidth: w + 40, minHeight: h + 60 }}>
            <h4 className={`mb-2 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {pie.title}
            </h4>
            <PieChart width={250} height={150}>
              <Pie
                data={pie.data}
                cx="50%" cy="50%"
                innerRadius={inner} outerRadius={outer}
                dataKey="value"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 3.2;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={darkMode ? '#E5E7EB' : '#333'}
                      textAnchor={x > cx ? 'end' : 'start'}
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {value}
                    </text>
                  );
                }}
                startAngle={90} endAngle={-270}
              >
                {pie.data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [val, name]}
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#fff',
                  borderColor: darkMode ? '#4B5563' : '#E5E7EB',
                  color: darkMode ? '#E5E7EB' : '#111827',
                }}
              />
            </PieChart>
          </div>
        ))}
      </div>


{/*
      // ORDER SUMMARY
      <div className="flex flex-col items-center mb-8">
        <h3 className={`text-lg font-semibold mb-2 text-center ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>Order Summary</h3>
        <div className={`flex flex-col items-center p-4 rounded-md shadow-md ${
          darkMode ? 'bg-gray-800' : 'bg-green-600'
        }`}>
          <p className="text-white text-lg font-semibold">Total Orders: {stats.orders.total}</p>
          <p className="text-white text-lg font-semibold">Total Revenue: ₦{stats.orders.revenue}</p>
          <p className="text-white text-lg font-semibold">Total Completed Orders: {stats.orders.completed}</p>
          <p className="text-white text-lg font-semibold">Total Pending Orders: {stats.orders.pending}</p>
          <p className="text-white text-lg font-semibold">Total Cancelled Orders: {stats.orders.cancelled}</p>
          <p className="text-white text-lg font-semibold">Total Refunded Orders: {stats.orders.refunded}</p>
        </div>
      </div>

      //ORDER STATUS
      <div className="flex flex-col items-center mb-8">
        <h3 className={`text-lg font-semibold mb-2 text-center ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>Order Status</h3>
        <div className={`flex flex-col items-center p-4 rounded-md shadow-md ${
          darkMode ? 'bg-gray-800' : 'bg-green-600'
        }`}>
          {orderStatus.map((status) => (
            <p key={status.name} className="text-white text-lg font-semibold">
              {status.name}: {status.count}
            </p>
          ))}
          {orderStatus.length === 0 && (
            <p className="text-white text-lg font-semibold">No order status data available</p>
          )}
        </div>
      </div>
*/}

      
  

      {/* TOTAL BOOK STATS SUMMARY */}
      <div className="mb-8">
        <h3 className={`text-lg font-semibold text-center mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Books Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center text-sm">
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📚 Total: <strong>{stats.books.total}</strong></div>
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>🔥 Popular: <strong>{stats.books.popular}</strong></div>
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>⭐ Recommended: <strong>{stats.books.recommended}</strong></div>
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>📅 Year Books: <strong>{stats.books.yearBooks}</strong></div>
          <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>💯 Avg Rating: <strong>{stats.books.averageRating}</strong></div>
        </div>
      </div>


      
      {/* NEWSLETTER EMAIL LIST */}
      <div className="mt-8 mb-5">
        <h3 className={`text-lg font-semibold mb-4 text-center ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>Newsletter Subscribers ({stats.newsletter.totalSubscribers})</h3>

        <ul className={`max-h-60 overflow-y-auto px-4 py-2 rounded-md ${
          darkMode ? ' text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-800'
        }`}>
          {stats.newsletter.emails && stats.newsletter.emails.length > 0 ? (
            stats.newsletter.emails.map((email, idx) => (
              <li key={idx} className="py-1 border-b last:border-b-0 border-dashed border-gray-400">
                {email}
              </li>
            ))
          ) : (
            <li>No email addresses available</li>
          )}
        </ul>
      </div>




      {/* ORDER STATUS BAR */}
      {orderStatus.length > 0 && (
        <div className="w-full h-80 mb-10">
          <h3 className={`text-lg font-semibold mb-2 text-center ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orderStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4B5563' : '#D1D5DB'} />
              <XAxis dataKey="name" stroke={darkMode ? '#E5E7EB' : '#111827'} />
              <YAxis stroke={darkMode ? '#E5E7EB' : '#111827'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#fff',
                  borderColor: darkMode ? '#4B5563' : '#E5E7EB',
                  color: darkMode ? '#E5E7EB' : '#111827',
                }}
              />
              <Bar dataKey="count" fill="#22C55E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* RECENT TRANSACTIONS & ORDERS */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
      {/* Recent Transactions */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Recent Transactions
          </h3>
          <ul className="space-y-3">
            {txns.slice(0, 4).map((txn) => (
              <li key={txn._id} className={`flex items-center gap-4 p-3 rounded-md shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-blue-700'
              }`}
              >
                <img
                  src={txn.userId?.image}
                  alt={txn.userId?.username || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-white">{txn.userId?.username || 'Unknown User'}</p>
                  <p className="text-sm text-white">
                    ₦{txn.amount} — {new Date(txn.paymentDate).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Orders */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Recent Orders
          </h3>
          <ul className="space-y-3">
            {stats.orders.recentOrders.slice(0, 4).map((order) => (
              <li key={order._id} className={`flex items-center gap-4 p-3 rounded-md shadow-md ${
                darkMode ? 'bg-gray-800' : 'bg-green-600'
              }`}
              >
                <img
                  src={order.userId?.image}
                  alt={order.userId?.username || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-white">{order.userId?.username || 'Unknown User'}</p>
                  <p className="text-sm text-white">
                    ₦{order.totalPrice} — {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default Aggregator;
