// Hand-curated starter RELATED_TO edges (weight 0..1). The full set is
// generated from data/knowledge by `python -m scripts.seed_knowledge`.
UNWIND [
 ['FastAPI','Flask',0.8],['FastAPI','Django',0.6],['Flask','Django',0.6],
 ['React','Vue',0.6],['React','Next.js',0.8],['JavaScript','TypeScript',0.85],
 ['PostgreSQL','MySQL',0.8],['Docker','Kubernetes',0.6],['PyTorch','TensorFlow',0.8],
 ['LangChain','LangGraph',0.8],['AWS','Azure',0.6],['AWS','GCP',0.6]
] AS row
MERGE (a:Skill {name: row[0]}) MERGE (b:Skill {name: row[1]})
MERGE (a)-[r:RELATED_TO]-(b) SET r.weight = row[2];
