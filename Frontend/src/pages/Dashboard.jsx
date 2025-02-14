import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
  PieChart, Pie,
  AreaChart, Area,
} from 'recharts';

import TimeToMetric from '../components/dashboard/TimeToMetric';
import IndustryChart from '../components/dashboard/IndustryChart';
import AppTimelineChart from '../components/dashboard/AppTimelineChart';
import JobStatusChart from '../components/dashboard/JobStatusChart';
import LocationChart from '../components/dashboard/LocationChart';
import TopPerformingIndustriesChart from '../components/dashboard/TopPerformingIndustriesChart';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [jobStatusHistory, setJobStatusHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/getuserjobs`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setJobs(data);

          const historyResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/statushistory`, {
            credentials: 'include'
          });

          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            setJobStatusHistory(historyData);
          } else {
            console.error('Failed to fetch status history');
          }
        } else {
          console.error('Failed to fetch jobs');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  console.log('jobs');
  console.log(jobs);

  return (
    <div>
      <h3>Time to metric</h3>
      <TimeToMetric jobStatusHistory={jobStatusHistory} />
      <h3>Industry</h3>
      <IndustryChart jobs={jobs} />
{/*      <h3>Applications Timeline</h3>
      <AppTimelineChart jobs={jobs} />
      <h3>Job status</h3>
      <JobStatusChart jobs={jobs} />
      <h3>Location</h3>
      <LocationChart jobs={jobs} />
      <h3>Top performers</h3>
      <TopPerformingIndustriesChart jobStatusHistory={jobStatusHistory} />*/}
    </div>
  );
};

export default Dashboard;