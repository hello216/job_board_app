import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AppTimelineChart = ({ jobs }) => {
  const applicationTimeline = jobs.map(job => ({
    month: new Date(job.CreatedAt).getMonth(),
    count: 1,
  }));

  const groupedTimeline = applicationTimeline.reduce((acc, item) => {
    if (!acc[item.month]) acc[item.month] = 0;
    acc[item.month]++;
    return acc;
  }, {});

  const lineData = Object.keys(groupedTimeline).map(month => ({
    month,
    count: groupedTimeline[month],
  }));

  return (
    <div>
      <LineChart width={500} height={300} data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis dataKey="count" />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
};

export default AppTimelineChart;