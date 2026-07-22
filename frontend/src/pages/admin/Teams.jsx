import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { StatusTab } from '../../components/teams/StatusTab.jsx';
import { teamMarksService } from '../../services/teamMarks.service.js';
import toast from 'react-hot-toast';

const Teams = () => {
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      const res = await teamMarksService.getTeamsProgress();
      setProgressData(res.data.data);
    } catch (error) {
      toast.error('Failed to load teams progress');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Manage project progress and evaluate teams efficiently.</p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <StatusTab progressData={progressData} fetchProgress={fetchProgress} isLoading={isLoading} />
      </div>

    </div>
  );
};

export default Teams;
