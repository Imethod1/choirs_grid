/**
 * Offline Queue
 * 
 * Stores pending actions in localStorage when offline.
 * When the app comes back online, queued actions are replayed in order.
 * 
 * Supported actions:
 * - attendance marks
 * - RSVP responses
 * 
 * Finance actions are NEVER queued — they require a live connection.
 */

export interface QueuedAction {
  id: string;
  type: 'attendance' | 'rsvp';
  payload: Record<string, unknown>;
  timestamp: string;
  retries: number;
}

const QUEUE_KEY = 'choir-app-offline-queue';

export function getQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): void {
  const queue = getQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    retries: 0,
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function dequeue(actionId: string): void {
  const queue = getQueue().filter((a) => a.id !== actionId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export function getQueueSize(): number {
  return getQueue().length;
}

/**
 * Replay all queued actions.
 * Called when the app detects it's back online.
 * Returns the count of successfully synced actions.
 */
export async function replayQueue(
  handler: (action: QueuedAction) => Promise<boolean>
): Promise<number> {
  const queue = getQueue();
  let synced = 0;

  for (const action of queue) {
    try {
      const success = await handler(action);
      if (success) {
        dequeue(action.id);
        synced++;
      } else {
        // Increment retry count
        action.retries++;
        if (action.retries >= 3) {
          // Give up after 3 retries
          dequeue(action.id);
        }
      }
    } catch {
      action.retries++;
      if (action.retries >= 3) {
        dequeue(action.id);
      }
    }
  }

  // Save updated retry counts
  const remaining = getQueue();
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));

  return synced;
}
