try:
    from app.database import Base, engine
    from app.main import app
    print("Verification Success: Database schemas and FastAPI routers loaded cleanly.")
except Exception as e:
    print(f"Verification Failed: {e}")
    import traceback
    traceback.print_exc()
