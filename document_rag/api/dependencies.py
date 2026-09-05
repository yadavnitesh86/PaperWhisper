from fastapi import Request


async def get_checkpointer(request: Request):
    return request.app.state.checkpointer