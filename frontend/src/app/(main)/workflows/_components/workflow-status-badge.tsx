import { Badge } from '@/components/ui/badge';
import { WorkflowStatus } from '@/types/workflow';

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

export function WorkflowStatusBadge({ status, className = '' }: WorkflowStatusBadgeProps) {
  const getStatusConfig = (status: WorkflowStatus) => {
    switch (status) {
      case 'DRAFT':
        return { color: 'bg-gray-100 text-gray-800', label: 'Draft' };
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'IN_PROGRESS':
        return { color: 'bg-blue-100 text-blue-800', label: 'In Progress' };
      case 'APPROVED':
        return { color: 'bg-green-100 text-green-800', label: 'Approved' };
      case 'REJECTED':
        return { color: 'bg-red-100 text-red-800', label: 'Rejected' };
      case 'CANCELLED':
        return { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' };
      case 'COMPLETED':
        return { color: 'bg-purple-100 text-purple-800', label: 'Completed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`${config.color} ${className}`}>
      {config.label}
    </Badge>
  );
}