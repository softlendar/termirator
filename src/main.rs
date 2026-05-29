/**
 * TERMIRATOR BACKEND — v2.0
 * Cyberdyne Systems Neural Net Processor
 * Multi-shell: one isolated shell process per WebSocket connection
 */
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::{Json, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command;
use tokio::sync::Mutex;
use tower_http::services::ServeDir;

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

#[derive(Deserialize)]
struct ShellRequest {
    #[serde(rename = "type")]
    req_type: String,
    data: String,
    #[serde(default)]
    interrupt: bool,
}

#[derive(Serialize)]
struct ShellResponse {
    #[serde(rename = "type")]
    resp_type: String,
    data: String,
}

#[derive(Deserialize)]
struct AiChatRequest {
    provider: String,
    model: String,
    prompt: String,
    #[serde(default)]
    system: Option<String>,
    #[serde(default)]
    api_key: Option<String>,
    #[serde(default)]
    endpoint: Option<String>,
}

#[derive(Serialize)]
struct AiChatResponse {
    #[serde(rename = "type")]
    resp_type: String,
    content: String,
    model: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

type SessionMap = Arc<Mutex<HashMap<String, SessionHandle>>>;

struct SessionHandle {
    tx: tokio::sync::mpsc::UnboundedSender<String>,
}

/* ------------------------------------------------------------------ */
/*  Entry point                                                         */
/* ------------------------------------------------------------------ */

#[tokio::main]
async fn main() {
    let http_client = Arc::new(reqwest::Client::new());
    let sessions: SessionMap = Arc::new(Mutex::new(HashMap::new()));

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .route("/api/ai/chat", post(ai_chat_handler))
        .with_state((http_client.clone(), sessions.clone()))
        .fallback_service(ServeDir::new("."));

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!(
        r#"
    ========================================
    CYBERDYNE SYSTEMS // TERMIRATOR SHELL
    Model 101 Neural Net Processor v2.0
    Multi-shell mode: ACTIVE
    Listening on port {}
    ========================================
    "#,
        addr.port()
    );

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

/* ------------------------------------------------------------------ */
/*  AI Chat Handler                                                     */
/* ------------------------------------------------------------------ */

async fn ai_chat_handler(
    State((client, _sessions)): State<(Arc<reqwest::Client>, SessionMap)>,
    Json(req): Json<AiChatRequest>,
) -> impl IntoResponse {
    let result = match req.provider.as_str() {
        "ollama" => call_ollama(&client, &req.model, &req.prompt).await,
        _ => Err(format!(
            "Only Ollama is supported. Provider '{}' disabled.",
            req.provider
        )),
    };

    match result {
        Ok(content) => {
            let resp = AiChatResponse {
                resp_type: "ai_response".to_string(),
                content,
                model: req.model,
                error: None,
            };
            (StatusCode::OK, Json(resp))
        }
        Err(e) => {
            let resp = AiChatResponse {
                resp_type: "ai_error".to_string(),
                content: String::new(),
                model: req.model,
                error: Some(e),
            };
            (StatusCode::INTERNAL_SERVER_ERROR, Json(resp))
        }
    }
}

async fn call_ollama(
    client: &reqwest::Client,
    model: &str,
    prompt: &str,
) -> Result<String, String> {
    #[derive(Serialize)]
    struct Body {
        model: String,
        prompt: String,
        stream: bool,
    }
    #[derive(Deserialize)]
    struct Resp {
        response: String,
        done: bool,
    }

    let body = Body {
        model: model.to_string(),
        prompt: prompt.to_string(),
        stream: false,
    };

    let resp = client
        .post("http://localhost:11434/api/generate")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Ollama request failed: {}", e))?;

    if !resp.status().is_success() {
        let txt = resp.text().await.unwrap_or_default();
        return Err(format!("Ollama error: {}", txt));
    }

    let data: Resp = resp
        .json()
        .await
        .map_err(|e| format!("Ollama parse error: {}", e))?;
    Ok(data.response)
}

/* ------------------------------------------------------------------ */
/*  WebSocket — one shell per connection                                */
/* ------------------------------------------------------------------ */

async fn ws_handler(
    ws: WebSocketUpgrade,
    State((_client, sessions)): State<(Arc<reqwest::Client>, SessionMap)>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, sessions))
}

async fn handle_socket(socket: WebSocket, sessions: SessionMap) {
    let (mut sender, mut receiver) = socket.split();

    let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<String>();
    let session_id = uuid::Uuid::new_v4().to_string();

    // Register session
    {
        let mut map = sessions.lock().await;
        map.insert(session_id.clone(), SessionHandle { tx: tx.clone() });
    }

    // Forward task: route messages to this WebSocket
    let forward_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    // Spawn isolated shell for this connection
    let is_win = cfg!(windows);
    let mut shell_cmd = if is_win {
        Command::new("cmd.exe")
    } else {
        let sh = std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string());
        Command::new(&sh)
    };

    if is_win {
        shell_cmd.arg("/Q");
    }

    let home_dir = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .unwrap_or_else(|_| "/".to_string());

    let mut child = match shell_cmd
        .current_dir(&home_dir)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
    {
        Ok(c) => c,
        Err(e) => {
            let resp = ShellResponse {
                resp_type: "error".to_string(),
                data: format!("Failed to spawn shell: {}", e),
            };
            let _ = tx.send(serde_json::to_string(&resp).unwrap());
            // Cleanup on failure
            let mut map = sessions.lock().await;
            map.remove(&session_id);
            return;
        }
    };

    let hostname = get_hostname();
    let platform = std::env::consts::OS;
    let arch = std::env::consts::ARCH;
    let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".to_string());

    let welcome = ShellResponse {
        resp_type: "system".to_string(),
        data: format!(
            "CONNECTED [{}] | {} {} | Shell: {}",
            &session_id[..8],
            platform,
            arch,
            shell
        ),
    };
    let _ = tx.send(serde_json::to_string(&welcome).unwrap());

    let stdin = child.stdin.take().expect("stdin piped");
    let stdout = child.stdout.take().expect("stdout piped");
    let stderr = child.stderr.take().expect("stderr piped");

    let stdin_arc: Arc<Mutex<tokio::process::ChildStdin>> = Arc::new(Mutex::new(stdin));

    let tx_stdout = tx.clone();
    let tx_stderr = tx.clone();
    let tx_exit = tx.clone();
    let session_id_stdout = session_id.clone();
    let session_id_stderr = session_id.clone();

    // Forward stdout
    tokio::spawn(async move {
        let reader = BufReader::new(stdout);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            if line.trim().is_empty() {
                continue;
            }
            let msg = ShellResponse {
                resp_type: "stdout".to_string(),
                data: line,
            };
            if tx_stdout
                .send(serde_json::to_string(&msg).unwrap())
                .is_err()
            {
                break;
            }
        }
    });

    // Forward stderr
    tokio::spawn(async move {
        let reader = BufReader::new(stderr);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            if line.trim().is_empty() {
                continue;
            }
            let msg = ShellResponse {
                resp_type: "stderr".to_string(),
                data: line,
            };
            if tx_stderr
                .send(serde_json::to_string(&msg).unwrap())
                .is_err()
            {
                break;
            }
        }
    });

    // Monitor child exit
    tokio::spawn(async move {
        let status = child.wait().await;
        let msg = match status {
            Ok(s) => {
                if let Some(c) = s.code() {
                    format!("Shell exited with code: {}", c)
                } else {
                    "Shell terminated by signal".to_string()
                }
            }
            Err(e) => format!("Shell wait error: {}", e),
        };
        let resp = ShellResponse {
            resp_type: "exit".to_string(),
            data: msg,
        };
        let _ = tx_exit.send(serde_json::to_string(&resp).unwrap());
    });

    // Read incoming WebSocket messages and write to this connection's shell
    while let Some(Ok(msg)) = receiver.next().await {
        if let Message::Text(text) = msg {
            let req: ShellRequest = match serde_json::from_str(&text) {
                Ok(r) => r,
                Err(_) => continue,
            };

            if req.req_type != "command" {
                continue;
            }

            if req.interrupt {
                let mut guard = stdin_arc.lock().await;
                let _ = guard.write_all(b"\x03").await;
                let _ = guard.flush().await;
                drop(guard);

                let resp = ShellResponse {
                    resp_type: "info".to_string(),
                    data: "^C".to_string(),
                };
                let _ = tx.send(serde_json::to_string(&resp).unwrap());
                continue;
            }

            let cmd_str = req.data;
            if cmd_str.is_empty() {
                continue;
            }

            let mut guard = stdin_arc.lock().await;
            let bytes = format!("{}\n", cmd_str).into_bytes();
            if let Err(e) = guard.write_all(&bytes).await {
                let resp = ShellResponse {
                    resp_type: "error".to_string(),
                    data: format!("Write error: {}", e),
                };
                let _ = tx.send(serde_json::to_string(&resp).unwrap());
                break;
            }
            if let Err(e) = guard.flush().await {
                let resp = ShellResponse {
                    resp_type: "error".to_string(),
                    data: format!("Flush error: {}", e),
                };
                let _ = tx.send(serde_json::to_string(&resp).unwrap());
                break;
            }
            drop(guard);
        }
    }

    // Cleanup
    forward_task.abort();
    let mut map = sessions.lock().await;
    map.remove(&session_id);
}

fn get_hostname() -> String {
    if let Ok(h) = std::env::var("HOSTNAME") {
        return h;
    }
    if let Ok(h) = std::env::var("COMPUTERNAME") {
        return h;
    }
    if let Ok(h) = std::fs::read_to_string("/etc/hostname") {
        return h.trim().to_string();
    }
    if let Ok(h) = std::fs::read_to_string("/proc/sys/kernel/hostname") {
        return h.trim().to_string();
    }
    "unknown".to_string()
}
