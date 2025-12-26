from .database import db

def create_constraints():
    """
    Sets up necessary uniqueness constraints and indices for the graph.
    """
    constraints = [
        "CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE",
        "CREATE CONSTRAINT campaign_id_unique IF NOT EXISTS FOR (c:Campaign) REQUIRE c.id IS UNIQUE",
        "CREATE CONSTRAINT adgroup_id_unique IF NOT EXISTS FOR (ag:AdGroup) REQUIRE ag.id IS UNIQUE",
        "CREATE CONSTRAINT creative_id_unique IF NOT EXISTS FOR (cr:Creative) REQUIRE cr.id IS UNIQUE",
        "CREATE CONSTRAINT action_id_unique IF NOT EXISTS FOR (a:Action) REQUIRE a.id IS UNIQUE",
        "CREATE CONSTRAINT order_id_unique IF NOT EXISTS FOR (o:Order) REQUIRE o.id IS UNIQUE",
        "CREATE INDEX user_email_index IF NOT EXISTS FOR (u:User) ON (u.email)",
    ]
    
    with db.get_session() as session:
        for c in constraints:
            print(f"Running: {c}")
            session.run(c)
    print("Schema constraints applied.")

if __name__ == "__main__":
    db.connect()
    create_constraints()
    db.close()
