from neo4j import GraphDatabase
from .config import settings

class Neo4jDriver:
    def __init__(self):
        self._driver = None

    def connect(self):
        if not self._driver:
            self._driver = GraphDatabase.driver(
                settings.NEO4J_URI, 
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            print("Connected to Neo4j")

    def close(self):
        if self._driver:
            self._driver.close()
            print("Closed Neo4j Connection")

    def get_session(self):
        if not self._driver:
            self.connect()
        return self._driver.session()

db = Neo4jDriver()
