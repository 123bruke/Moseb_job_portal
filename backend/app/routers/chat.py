from fastapi import APIRouter, Depends

from app.agents import chat_agent
from app.core.deps import CurrentUser, current_user, owned_job, rate_limit
from app.core.errors import bad_request
from app.schemas.models import ChatIn

router = APIRouter(tags=["chat"])


@router.post("/chat", dependencies=[Depends(rate_limit("chat", 20))])
def chat(body: ChatIn, user: CurrentUser = Depends(current_user)):
    if user.role == "company":
        if not body.job_id:
            raise bad_request("job_id is required for company chat")
        job = owned_job(body.job_id, user)
        return {"reply": chat_agent.company_chat(job, body.message, body.history)}
    return {"reply": chat_agent.candidate_chat(user.id, body.message, body.history)}
