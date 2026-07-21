import type { RoomStatus } from '@mrms/types';
import { CheckCircle, Clock, DotOutline, Users, Wrench, type Icon } from '@phosphor-icons/react';


import { cn } from '../lib/cn';

/**
 * Room status pill: conveys state with color + icon + label (never color alone),
 * per the design system and WCAG. Colors map to status tokens (light/dark aware).
 */
const config: Record<RoomStatus, { label: string; icon: Icon; className: string }> = {
  AVAILABLE: { label: 'Available', icon: CheckCircle, className: 'text-status-available' },
  OCCUPIED: { label: 'Occupied', icon: Users, className: 'text-status-occupied' },
  STARTING_SOON: { label: 'Starting Soon', icon: Clock, className: 'text-status-starting-soon' },
  MAINTENANCE: { label: 'Maintenance', icon: Wrench, className: 'text-status-maintenance' },
  RESERVED: { label: 'Reserved', icon: DotOutline, className: 'text-status-reserved' },
};

export interface StatusPillProps {
  status: RoomStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps): JSX.Element {
  const { label, icon: IconComponent, className: color } = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-current/20 bg-current/10 px-3 py-1 text-sm font-medium',
        color,
        className,
      )}
      role="status"
    >
      <IconComponent weight="fill" className="h-4 w-4" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
