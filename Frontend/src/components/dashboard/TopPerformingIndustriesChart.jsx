import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const TopPerformingIndustriesChart = ({ jobStatusHistory }) => {
  if (jobStatusHistory.length === 0) {
    return <p>No industry performance data available.</p>;
  }

  const successRates = jobStatusHistory
    .filter(h => h.status === "Interviewing" || h.status === "Offered")
    .reduce((acc, h) => {
      if (!h.industry) {
        console.log(`Skipping job with undefined industry: ${h.title}`);
        return acc;
      }
      if (!acc[h.industry]) acc[h.industry] = 0;
      acc[h.industry]++;
      return acc;
    }, {});

  const barData = Object.keys(successRates).map(industry => ({
    name: industry,
    count: successRates[industry],
  }));

  if (barData.length === 0) {
    return <p>No successful industries to display.</p>;
  }

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