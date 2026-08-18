/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

export function initWebEvents(): void {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  function connectEventSocket(): void {
    const ws = new WebSocket(`${proto}//${location.host}/ws/events`);

    ws.onmessage = (event: MessageEvent): void => {
      try {
        const { channel, data } = JSON.parse(event.data as string) as { channel: string; data: unknown };
        const fns = listeners.get(channel);
        if (fns) {
          for (const fn of fns) {
            fn(data);
          }
        }
      } catch (err) {
        console.warn('[web-events] Failed to parse event:', err);
      }
    };

    ws.onclose = (): void => {
      setTimeout(connectEventSocket, 2000);
    };

    ws.onerror = (): void => {
      ws.close();
    };
  }

  (window as Record<string, unknown>).events = {
    send(channel: string, data?: unknown): void {
      const fns = listeners.get(channel);
      if (fns) {
        for (const fn of fns) {
          fn(data);
        }
      }
    },
    receive(channel: string, func: (...args: unknown[]) => void): { dispose: () => void } {
      if (!listeners.has(channel)) {
        listeners.set(channel, new Set());
      }
      listeners.get(channel)!.add(func);
      return {
        dispose: (): void => {
          listeners.get(channel)?.delete(func);
        },
      };
    },
  };

  connectEventSocket();
}
