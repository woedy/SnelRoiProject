import { Activity } from "@/services/activityService";
import { 
  User, DollarSign, FileText, CreditCard, Shield, 
  TrendingUp, MessageSquare, Bitcoin, CheckCircle, XCircle,
  Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react";

interface ActivityTimelineProps {
  activities: Activity[];
  showUser?: boolean;
}

const getActivityIcon = (activityType: string) => {
  if (activityType.includes('user_registered') || activityType.includes('profile')) return User;
  if (activityType.includes('transaction') || activityType.includes('transfer')) return DollarSign;
  if (activityType.includes('kyc')) return Shield;
  if (activityType.includes('loan')) return TrendingUp;
  if (activityType.includes('virtual_card')) return CreditCard;
  if (activityType.includes('tax_refund') || activityType.includes('grant')) return FileText;
  if (activityType.includes('support')) return MessageSquare;
  if (activityType.includes('crypto')) return Bitcoin;
  return Clock;
};

const getActivityColor = (activityType: string, status: string) => {
  if (status === 'APPROVED' || status === 'POSTED' || status === 'VERIFIED' || status === 'ACTIVE') {
    return 'text-green-500 bg-green-500/10 ring-green-500/20';
  }
  if (status === 'REJECTED' || status === 'DECLINED' || status === 'CANCELLED') {
    return 'text-red-500 bg-red-500/10 ring-red-500/20';
  }
  if (status === 'PENDING' || status === 'UNDER_REVIEW') {
    return 'text-yellow-500 bg-yellow-500/10 ring-yellow-500/20';
  }
  if (activityType.includes('registered') || activityType.includes('created')) {
    return 'text-blue-500 bg-blue-500/10 ring-blue-500/20';
  }
  return 'text-gray-500 bg-gray-500/10 ring-gray-500/20';
};

const formatActivityType = (activityType: string) => {
  return activityType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ActivityTimeline({ activities, showUser = true }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No activities found</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, activityIdx) => {
          const Icon = getActivityIcon(activity.activity_type);
          const colorClass = getActivityColor(activity.activity_type, activity.status);
          
          return (
            <li key={activityIdx}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-2 ring-inset ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">
                        {activity.description}
                        {activity.amount && (
                          <span className="ml-2 font-mono font-semibold text-emerald-600">
                            ${activity.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {showUser && activity.user_email && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {activity.user_name || activity.user_email}
                          </span>
                        )}
                        {activity.reference && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {activity.reference}
                          </span>
                        )}
                        {activity.status && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClass}`}>
                            {activity.status}
                          </span>
                        )}
                        {activity.actor_email && (
                          <span className="text-xs text-muted-foreground">
                            by {activity.actor_email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-muted-foreground">
                      <time dateTime={activity.timestamp}>
                        {formatTimestamp(activity.timestamp)}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
