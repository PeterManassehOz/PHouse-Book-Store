import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllSubscribersQuery } from '../../redux/subscribersAuthApi/subscribersAuthApi';
import Loader from '../Loader/Loader';



const Subscribers = () => {
  const { data, error, isLoading } = useGetAllSubscribersQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const darkMode = useSelector((s) => s.theme.darkMode);

  const filteredSubscribers =Array.isArray(data)
  ? data.filter((subscriber) =>
      (subscriber.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];


  if (isLoading)  return <Loader />

  if (error) {
    return (
      <p className="text-center text-red-500 text-lg mt-8">
        No subscribers yet!
      </p>
    );
  }

  return (
    <div
      className={`max-w-4xl mx-auto p-6 shadow-md rounded-xl mt-10 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'
      }`}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">
        Your State's Subscribers
      </h2>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:ring-amber-600'
              : 'bg-white border-gray-300 text-black focus:ring-amber-400'
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Scrollable List */}
      <div className="h-96 overflow-y-auto pr-2">
        <ul className="space-y-4">
          {filteredSubscribers?.length > 0 ? (
            filteredSubscribers.map((subscriber, index) => (
              <li
                key={index}
                className={`border rounded-lg p-4 shadow-sm transition ${
                  darkMode
                    ? 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <span className="font-semibold">Email:</span>{' '}
                  {subscriber.email}
                </p>
                <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>
                  <span className="font-semibold">Subscribed At:</span>{' '}
                  {new Date(subscriber.createdAt || subscriber.subscribedAt).toLocaleString()}
                </p>
              </li>
            ))
          ) : (
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              No subscribers found.
            </p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Subscribers;
