# 🏛️ Collaborative Canvas: Architectural Decisions

This document details the technical choices and strategies used to meet the real-time and state synchronization requirements.

## 1. Data Flow Diagram

The architecture follows a centralized server-authoritative model to ensure a consistent **Global State**.

```mermaid
graph TD
    A[Client A: Draw/Action] --> B{WebSocket: Socket.io};
    B --> C[Server: server.js];
    C --> D[DrawingState: History Management];
    D --> |Stroke Object/Undo Event| C;
    C --> |Broadcast: drawing:point/canvas:undo| B;
    B --> E[Client B: CanvasManager];
    E --> F[Client B: Render];
    C --> |Broadcast: drawing:cursor| B;
    B --> G[Client B: Cursor Layer];

    subgraph Client-Side Prediction
        A_Local[Client A: Render Local Stroke]
        A --> A_Local
    end