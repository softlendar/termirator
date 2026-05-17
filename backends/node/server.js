/**
 * TERMIRATOR BACKEND
 * Cyberdyne Systems Remote Shell Interface
 * Executes real shell commands via WebSocket
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static frontend
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ONLINE', model: 'T-800', version: '2.4' });
});

wss.on('connection', (ws) => {
    console.log('[SKYNET] Terminal connection established.');

    // Send welcome metadata
    ws.send(JSON.stringify({
        type: 'system',
        data: `CONNECTED: ${os.hostname()} | ${os.platform()} ${os.arch()} | Shell: ${process.env.SHELL || '/bin/sh'}`
    }));

    let activeProcess = null;

    ws.on('message', (message) => {
        try {
            const msg = JSON.parse(message);

            if (msg.type === 'command') {
                const cmdStr = msg.data;

                // If there's an active process and user sends interrupt
                if (msg.interrupt && activeProcess) {
                    activeProcess.kill('SIGINT');
                    ws.send(JSON.stringify({ type: 'info', data: '^C' }));
                    return;
                }

                executeCommand(cmdStr, ws, (proc) => {
                    activeProcess = proc;
                });
            }
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', data: 'Malformed transmission.' }));
        }
    });

    ws.on('close', () => {
        console.log('[SKYNET] Terminal disconnected.');
        if (activeProcess) {
            activeProcess.kill();
        }
    });

    ws.on('error', (err) => {
        console.error('[SKYNET] WebSocket error:', err.message);
    });
});

function executeCommand(cmdStr, ws, onSpawn) {
    // Determine shell based on OS
    const isWin = process.platform === 'win32';
    const shell = isWin ? 'cmd.exe' : (process.env.SHELL || '/bin/sh');
    const shellFlag = isWin ? '/c' : '-c';

    const child = spawn(shell, [shellFlag, cmdStr], {
        cwd: process.cwd(),
        env: process.env,
        detached: false
    });

    onSpawn(child);

    ws.send(JSON.stringify({ type: 'pid', data: child.pid }));

    child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line || lines.length === 1) {
                ws.send(JSON.stringify({ type: 'stdout', data: line }));
            }
        });
    });

    child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line || lines.length === 1) {
                ws.send(JSON.stringify({ type: 'stderr', data: line }));
            }
        });
    });

    child.on('error', (err) => {
        ws.send(JSON.stringify({ type: 'error', data: `Execution error: ${err.message}` }));
    });

    child.on('close', (code, signal) => {
        let msg = '';
        if (signal) {
            msg = `Terminated by signal: ${signal}`;
        } else if (code !== 0) {
            msg = `Exit code: ${code}`;
        } else {
            msg = 'done';
        }
        ws.send(JSON.stringify({ type: 'exit', data: msg, code }));
        onSpawn(null);
    });
}

server.listen(PORT, () => {
    console.log(`
    ========================================
    CYBERDYNE SYSTEMS // TERMIRATOR SHELL
    Model 101 Neural Net Processor Online
    Listening on port ${PORT}
    ========================================
    `);
});
