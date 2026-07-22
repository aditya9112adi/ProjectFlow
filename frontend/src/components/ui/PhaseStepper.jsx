import { CheckCircle2, Clock, XCircle, Lock, FileText, Presentation, FileBarChart, Cpu } from 'lucide-react';

const phases = [
  { key: 'proposal', label: 'Proposal', icon: FileText, shortLabel: '1' },
  { key: 'ppt', label: 'PPT', icon: Presentation, shortLabel: '2' },
  { key: 'report', label: 'Report', icon: FileBarChart, shortLabel: '3' },
  { key: 'prototype', label: 'Prototype', icon: Cpu, shortLabel: '4' },
];

const statusConfig = {
  not_started: { color: 'border-dark-700 bg-dark-900 text-dark-600', badge: null, icon: Lock },
  submitted: { color: 'border-amber-500 bg-amber-500/10 text-amber-400', badge: 'badge-warning', icon: Clock },
  under_review: { color: 'border-blue-500 bg-blue-500/10 text-blue-400', badge: 'badge-info', icon: Clock },
  approved: { color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400', badge: 'badge-success', icon: CheckCircle2 },
  rejected: { color: 'border-red-500 bg-red-500/10 text-red-400', badge: 'badge-error', icon: XCircle },
};

const PhaseStepper = ({ phases: phaseStatuses = {}, currentPhase, onPhaseClick }) => {
  return (
    <div className="w-full">
      {/* Desktop stepper */}
      <div className="hidden md:flex items-center">
        {phases.map((phase, index) => {
          const status = phaseStatuses[phase.key]?.status || 'not_started';
          const config = statusConfig[status] || statusConfig.not_started;
          const Icon = config.icon;
          const isActive = currentPhase === phase.key;
          const isLast = index === phases.length - 1;

          return (
            <div key={phase.key} className="flex items-center flex-1">
              <button
                onClick={() => onPhaseClick && onPhaseClick(phase.key)}
                className={`relative flex flex-col items-center group cursor-default ${
                  onPhaseClick ? 'cursor-pointer' : ''
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                    config.color
                  } ${isActive ? 'ring-2 ring-primary-500/50 ring-offset-2 ring-offset-dark-900 scale-110' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p
                  className={`mt-2 text-xs font-bold whitespace-nowrap ${
                    isActive ? 'text-dark-100' : 'text-dark-500'
                  }`}
                >
                  {phase.label}
                </p>
                {config.badge && (
                  <span className={`${config.badge} mt-1 text-[10px]`}>
                    {status.replace('_', ' ')}
                  </span>
                )}
              </button>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                    phaseStatuses[phase.key]?.status === 'approved' ? 'bg-emerald-500' : 'bg-dark-800'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile stepper */}
      <div className="md:hidden grid grid-cols-4 gap-2">
        {phases.map((phase) => {
          const status = phaseStatuses[phase.key]?.status || 'not_started';
          const config = statusConfig[status] || statusConfig.not_started;
          const Icon = config.icon;
          const isActive = currentPhase === phase.key;

          return (
            <div key={phase.key} className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center ${
                  config.color
                } ${isActive ? 'ring-2 ring-primary-500/40 scale-110' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-semibold text-dark-500 text-center leading-tight">
                {phase.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PhaseStepper;
