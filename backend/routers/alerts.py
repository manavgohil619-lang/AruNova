from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from schemas import AlertItem
from database import get_db

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.get("", response_model=List[AlertItem])
def get_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = 50
):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM alerts"
    conditions = []
    params = []
    
    if status and status.upper() != "ALL":
        conditions.append("status = ?")
        params.append(status.upper())
    if severity and severity.upper() != "ALL":
        conditions.append("severity = ?")
        params.append(severity.upper())
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY rowid DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [
        AlertItem(
            id=r["id"],
            timestamp=r["timestamp"],
            type=r["type"],
            severity=r["severity"],
            parameter=r["parameter"],
            currentValue=r["current_value"],
            threshold=r["threshold"],
            status=r["status"],
            message=r["message"]
        )
        for r in rows
    ]

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET status = 'ACKNOWLEDGED' WHERE id = ?", (alert_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Alert not found")
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Alert {alert_id} acknowledged"}

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET status = 'RESOLVED' WHERE id = ?", (alert_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Alert not found")
    conn.commit()
    conn.close()
    return {"status": "success", "message": f"Alert {alert_id} resolved"}
