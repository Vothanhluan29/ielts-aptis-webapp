from pydantic import BaseModel

class UserUsageResponse(BaseModel):
    user_id: int
    speaking_used: int
    speaking_limit: int
    writing_used: int
    writing_limit: int
    exam_used:int
    exam_limit:int
    
    class Config:
        from_attributes = True