import React from 'react';
import { PieChart, Pie, Tooltip } from 'recharts';

const IndustryChart = ({ jobs }) => {
  const industryData = jobs.reduce((acc, job) => {
    if (!acc[job.Industry]) acc[job.Industry] = 0;
    acc[job.Industry]++;
    return acc;
  }, {});

  const pieData = Object.keys(industryData).map(industry => ({
    name: industry,
    value: industryData[industry],
  }));

  return (
    <div>
      <PieChart width={400} height={300}>
        <Pie data={pieData} dataKey="value" nameKey="name" />
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default IndustryChart;