from .database import db
from .models import UserNode, ActionNode, CampaignNode
from datetime import datetime

class GraphService:
    def upsert_user(self, user: UserNode):
        query = """
        MERGE (u:User {id: $id})
        ON CREATE SET u.created_at = datetime(), u.email = $email, u.name = $name
        ON MATCH SET u.last_seen = datetime(), u.email = $email, u.name = $name
        RETURN u
        """
        with db.get_session() as session:
            session.run(query, id=user.id, email=user.email, name=user.name)

    def track_action(self, user_id: str, action: ActionNode):
        query = """
        MATCH (u:User {id: $user_id})
        MERGE (a:Action {id: $action_id})
        SET a.type = $type, a.created_at = datetime($timestamp), a += $metadata
        MERGE (u)-[:PERFORMED]->(a)
        """
        with db.get_session() as session:
            session.run(
                query, 
                user_id=user_id,
                action_id=action.id,
                type=action.type,
                timestamp=action.created_at.isoformat(),
                metadata=action.metadata
            )

    def upsert_campaign(self, campaign: CampaignNode):
        query = """
        MERGE (c:Campaign {id: $id})
        SET c.name = $name, c.platform = $platform, c.status = $status, c.budget = $budget, c.updated_at = datetime()
        """
        with db.get_session() as session:
            session.run(query, **campaign.model_dump())

    def get_dashboard_stats(self, user_id: str):
        """
        Returns high-level stats for the User's dashboard.
        In a real app, this would filter by the user's Organization/Team.
        """
        query = """
        MATCH (u:User)
        OPTIONAL MATCH (a:Action)
        OPTIONAL MATCH (c:Campaign)
        RETURN 
            count(DISTINCT u) as total_users,
            count(DISTINCT a) as total_actions,
            count(DISTINCT c) as active_campaigns
        """
        with db.get_session() as session:
            result = session.run(query)
            record = result.single()
            return {
                "total_users": record["total_users"],
                "total_actions": record["total_actions"],
                "active_campaigns": record["active_campaigns"]
            }

graph_service = GraphService()
