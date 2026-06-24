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
const MAX_RETRIES = 3;

export function getQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): void {
  const queue = getQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    retries: 0,
  });
  saveQueue(queue);
}

export function dequeue(actionId: string): void {
  const queue = getQueue().filter((a) => a.id !== actionId);
  saveQueue(queue);
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
  if (queue.length === 0) return 0;

  let synced = 0;
  const remaining: QueuedAction[] = [];

  for (const action of queue) {
    try {
      const success = await handler(action);
      if (success) {
        synced++;
        // Action succeeded — do NOT keep it in the queue
      } else {
        action.retries++;
        if (action.retries < MAX_RETRIES) {
          remaining.push(action);
        }
        // If retries exhausted, drop the action
      }
    } catch {
      action.retries++;
      if (action.retries < MAX_RETRIES) {
        remaining.push(action);
      }
    }
  }

  // Save only the remaining (failed but retriable) actions
  saveQueue(remaining);

  return synced;
}
