import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
  PieChart, Pie,
  AreaChart, Area,
} from 'recharts';
import '../css/Dashboard.css';

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
        } else if (response.status === 429) {
          setErrors({ general: 'Too many requests. Please try again later.' });
        } else {
          console.error('Failed to fetch jobs');
        }

        const historyResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/jobs/statushistory`, {
          credentials: 'include'
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setJobStatusHistory(historyData);
        } else {
          console.error('Failed to fetch status history');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div id="dashboard-container">
      <div className="graph-container">
        <h3>Average Time to Interview/Offer</h3>
        <div className="component-container">
          <TimeToMetric jobStatusHistory={jobStatusHistory} />
        </div>
      </div>
      <div className="graph-container">
        <h3>Industry Distribution</h3>
        <div className="component-container">
          <IndustryChart jobs={jobs} />
        </div>
      </div>
      <div className="graph-container">
        <h3>Applications Timeline Overview</h3>
        <div className="component-container">
          <AppTimelineChart jobs={jobs} />
        </div>
      </div>
      <div className="graph-container">
        <h3>Job Status Breakdown</h3>
        <div className="component-container">
          <JobStatusChart jobs={jobs} />
        </div>
      </div>
      <div className="graph-container">
        <h3>Geographical Location</h3>
        <div className="component-container">
          <LocationChart jobs={jobs} />
        </div>
      </div>
      <div className="graph-container">
        <h3>Top Performing Industries</h3>
        <div className="component-container">
          <TopPerformingIndustriesChart jobStatusHistory={jobStatusHistory} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;