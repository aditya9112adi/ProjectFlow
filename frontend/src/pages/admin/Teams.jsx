import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Award } from 'lucide-react';
import { StatusTab } from '../../components/teams/StatusTab.jsx';
import { MarksTab } from '../../components/teams/MarksTab.jsx';
import { teamMarksService } from '../../services/teamMarks.service.js';
import toast from 'react-hot-toast';

const Teams = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [progressData, setProgressData] = useState(null);
  const [marksData, setMarksData] = useState(null);
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

  const fetchMarks = async () => {
    try {
      setIsLoading(true);
      const res = await teamMarksService.getTeamsMarks();
      setMarksData(res.data.data);
    } catch (error) {
      toast.error('Failed to load teams marks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'status') {
      fetchProgress();
    } else {
      fetchMarks();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Teams Dashboard</h1>
          <p className="text-dark-400 text-sm mt-1">Manage project progress and evaluate teams efficiently.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-800">
        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'status' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Status
        </button>
        <button
          onClick={() => setActiveTab('marks')}
          className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'marks' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dark-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Marks
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'status' ? (
          <StatusTab progressData={progressData} fetchProgress={fetchProgress} isLoading={isLoading} />
        ) : (
          <MarksTab marksData={marksData} fetchMarks={fetchMarks} isLoading={isLoading} />
        )}
      </div>

    </div>
  );
};

export default Teams;
