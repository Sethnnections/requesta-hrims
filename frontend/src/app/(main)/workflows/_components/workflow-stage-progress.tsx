import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface WorkflowStageProgressProps {
  currentStage: number;
  totalStages: number;
  status: string;
}

export function WorkflowStageProgress({ currentStage, totalStages, status }: WorkflowStageProgressProps) {
  const percentage = totalStages > 0 ? (currentStage / totalStages) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Stage {currentStage + 1} of {totalStages}
        </span>
        <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          {currentStage > 0 ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <Circle className="h-3 w-3" />
          )}
          <span>Stage 1</span>
        </div>
        {totalStages > 1 && (
          <div className="flex items-center gap-1">
            {currentStage >= 1 ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : currentStage === 0 ? (
              <Clock className="h-3 w-3 text-yellow-500" />
            ) : (
              <Circle className="h-3 w-3" />
            )}
            <span>Stage 2</span>
          </div>
        )}
        {totalStages > 2 && (
          <div className="flex items-center gap-1">
            {currentStage >= 2 ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : currentStage === 1 ? (
              <Clock className="h-3 w-3 text-yellow-500" />
            ) : (
              <Circle className="h-3 w-3" />
            )}
            <span>Stage 3</span>
          </div>
        )}
        {totalStages > 3 && (
          <div className="text-gray-400">...</div>
        )}
      </div>
    </div>
  );
}