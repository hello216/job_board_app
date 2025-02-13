import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const TopPerformingIndustriesChart = ({ jobStatusHistory }) => {
  const successRates = jobStatusHistory
    .filter(h => h.Status === "Interviewing" || h.Status === "Offered")
    .reduce((acc, h) => {
      if (!acc[h.Industry]) acc[h.Industry] = 0;
      acc[h.Industry]++;
      return acc;
    }, {});

  const barData = Object.keys(successRates).map(industry => ({
    name: industry,
    count: successRates[industry],
  }));

  return (
    <div>
      <BarChart width={500} height={300} data={barData}>
        <XAxis dataKey="name" />
        <YAxis dataKey="count" />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default TopPerformingIndustriesChart;