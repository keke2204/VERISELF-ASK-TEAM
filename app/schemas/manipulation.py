from pydantic import BaseModel, Field


class ManipulationAnalysisResponse(BaseModel):
    media_type: str
    manipulation_score: float
    manipulation_percentage: float
    risk_level: str
    classification: str
    signals: dict[str, float]
    artifacts: list[str] = Field(
        default_factory=list
    )
    model: str
    model_type: str
    message: str


class VideoManipulationAnalysisResponse(BaseModel):
    media_type: str
    frame_count: int
    sampled_frames: int
    fps: float
    duration_seconds: float
    manipulation_score: float
    manipulation_percentage: float
    risk_level: str
    classification: str
    signals: dict[str, float]
    model: str
    model_type: str
    message: str