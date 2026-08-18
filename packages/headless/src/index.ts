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

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

import { WebSocketServer } from 'ws';
import { RPCHandler } from '@orpc/server/websocket';
import { onError } from '@orpc/server';

import { RpcHandler } from '/@/plugin/routers/rpc-handler.js';
import { Emitter } from '/@/plugin/events/emitter.js';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { HeadlessPluginSystem } from './headless-plugin-system.js';
import { WebSocketApiSender } from './ws-api-sender.js';

const STATIC_DIR = process.env.STATIC_DIR ?? join(process.cwd(), 'static');
const PORT = Number(process.env.PORT) || 9000;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function serveStatic(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  let filePath = join(STATIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(STATIC_DIR, 'index.html');
  }

  const ext = extname(filePath);
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(res);
}

async function main(): Promise<void> {
  console.log('Starting Podman Desktop in headless mode...');

  const wsApiSender = new WebSocketApiSender();

  const pluginSystem = new HeadlessPluginSystem(wsApiSender.asSender());
  const configurationRegistryEmitter = new Emitter<ConfigurationRegistry>();
  console.log('Initializing extensions...');
  await pluginSystem.initExtensions(configurationRegistryEmitter);
  console.log('Extensions initialized.');

  const container = pluginSystem._container;
  if (!container) {
    throw new Error('DI container not available after initialization');
  }

  const rpcHandler = container.get(RpcHandler);
  const wsRpcHandler = new RPCHandler(rpcHandler.composedRouter, {
    interceptors: [
      onError(error => {
        console.error('[oRPC error]', error);
        throw error;
      }),
    ],
  });

  const server = createServer(serveStatic);

  const rpcWss = new WebSocketServer({ noServer: true });
  const eventsWss = new WebSocketServer({ noServer: true });

  rpcWss.on('connection', ws => {
    wsRpcHandler.upgrade(ws, {
      context: () => ({ container }),
    });
  });

  eventsWss.on('connection', ws => {
    wsApiSender.addClient(ws);
    console.log('Events client connected');
  });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    if (url.pathname === '/ws/rpc') {
      rpcWss.handleUpgrade(req, socket, head, ws => rpcWss.emit('connection', ws));
    } else if (url.pathname === '/ws/events') {
      eventsWss.handleUpgrade(req, socket, head, ws => eventsWss.emit('connection', ws));
    } else {
      socket.destroy();
    }
  });

  server.listen(PORT, () => {
    console.log(`Podman Desktop web UI available at http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('Failed to start headless server:', err);
  setTimeout(() => process.exit(1), 100);
});
