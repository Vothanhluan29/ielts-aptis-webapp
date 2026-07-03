from typing import Dict, Any, List
from fastapi import WebSocket
from uuid import UUID
import json
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps student_id to their active websocket connections
        # A single user might have multiple tabs open, so store a list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, student_id: str):
        await websocket.accept()
        if student_id not in self.active_connections:
            self.active_connections[student_id] = []
        self.active_connections[student_id].append(websocket)
        logger.info(f"Student {student_id} connected. Total tabs: {len(self.active_connections[student_id])}")

    def disconnect(self, websocket: WebSocket, student_id: str):
        if student_id in self.active_connections:
            if websocket in self.active_connections[student_id]:
                self.active_connections[student_id].remove(websocket)
            if len(self.active_connections[student_id]) == 0:
                del self.active_connections[student_id]
        logger.info(f"Student {student_id} disconnected.")

    async def send_personal_message(self, message: dict, student_id: str):
        """Send a JSON message to all active tabs of a specific student"""
        student_id_str = str(student_id)
        if student_id_str in self.active_connections:
            for connection in self.active_connections[student_id_str]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send message to {student_id_str}: {e}")

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients"""
        for student_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    pass

    def send_personal_message_sync(self, message: dict, student_id: str):
        """Helper to send message from synchronous code"""
        import asyncio
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.send_personal_message(message, student_id))
        except RuntimeError:
            asyncio.run(self.send_personal_message(message, student_id))

manager = ConnectionManager()
