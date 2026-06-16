import { useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/ui.store';
import { useToast } from '@/components/ui/Toast';
import { replayQueue, getQueueSize } from '@/lib/offline-queue';
import { attendanceService } from '@/services';
import type { QueuedAction } from '@/lib/offline-queue';

/**
 * Hook that listens for online/offline events
 * and replays queued actions when connection restores.
 */
export function useOfflineSync() {
  const { isOffline, setOffline } = useUIStore();
  const toast = useToast();

  const handleAction = useCallback(async (action: QueuedAction): Promise<boolean> => {
    switch (action.type) {
      case 'attendance': {
        const { eventId, marks } = action.payload as {
          eventId: string;
          marks: Array<{ memberId: string; status: string }>;
        };
        await attendanceService.saveAttendance(eventId, marks as any);
        return true;
      }
      case 'rsvp':
        // TODO: implement RSVP sync
        console.log('[SYNC] RSVP action not yet implemented');
        return true;
      default:
        return false;
    }
  }, []);

  const syncQueue = useCallback(async () => {
    const queueSize = getQueueSize();
    if (queueSize === 0) return;

    try {
      const synced = await replayQueue(handleAction);
      if (synced > 0) {
        toast.success(`${synced} pending action${synced > 1 ? 's' : ''} synced`);
      }
    } catch {
      toast.error('Failed to sync some offline actions');
    }
  }, [handleAction, toast]);

  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      // Attempt to replay queue when we come back online
      syncQueue();
    };

    const handleOffline = () => {
      setOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial state
    if (!navigator.onLine) {
      setOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline, syncQueue]);

  return { isOffline };
}
