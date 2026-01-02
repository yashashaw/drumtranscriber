from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Note(BaseModel):
    id: str
    types: List[str]
    duration: str
    isRest: bool

notes = []

@app.post("/api/notes")
async def create_note(note: Note):
    print(f"Received note: {note}")
    notes.append(note.model_dump())
    print(f"Total notes: {len(notes)}")
    return {"message": "Note saved", "note": note}

@app.get("/api/notes")
async def get_notes():
    return notes