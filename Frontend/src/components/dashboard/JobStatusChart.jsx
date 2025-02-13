import React from 'react';
import { PieChart, Pie, Tooltip } from 'recharts';

const JobStatusChart = ({ jobs }) => {
  const statusData = jobs.reduce((acc, job) => {
    if (!acc[job.Status]) acc[job.Status] = 0;
    acc[job.Status]++;
    return acc;
  }, {});

  const pieData = Object.keys(statusData).map(status => ({
    name: status,
    value: statusData[status],
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

export default JobStatusChart;