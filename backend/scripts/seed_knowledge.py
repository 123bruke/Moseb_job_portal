"""Seed knowledge: Chroma `knowledge` collection, Postgres `skills`, Neo4j RELATED_TO + constraints.
Run:  python -m scripts.seed_knowledge   (idempotent)"""
from pathlib import Path

from app.core.config import get_settings
from app.repositories import chroma_repo, neo4j_repo, pg
from app.services import knowledge
from app.utils.skills_seed import SEED


def main() -> None:
    root = Path(get_settings().knowledge_dir)
    records = knowledge.load_dir(root)
    print(f"{len(records)} role/skill records from {root}")

    # constraints + curated edges
    seed_dir = Path(__file__).resolve().parents[2] / "infra" / "neo4j" / "seed"
    for f in ("constraints.cypher", "related_skills.cypher"):
        p = seed_dir / f
        if p.exists():
            for stmt in [s.strip() for s in p.read_text().split(";\n") if s.strip() and not s.strip().startswith("//")]:
                neo4j_repo.run(stmt)

    # skills table (starter vocabulary + data-driven)
    for name, (cat, aliases) in SEED.items():
        pg.run("insert into skills (name, aliases, category) values (%s,%s,%s) on conflict (name) do update set aliases=excluded.aliases",
               (name, aliases, cat))
    vocab = knowledge.skill_vocabulary(records)
    for name, domain in vocab.items():
        pg.run("insert into skills (name, category) values (%s,%s) on conflict (name) do nothing", (name, domain))
    print(f"{len(vocab)} data-driven skills")

    pairs = knowledge.related_pairs(records, set(vocab))
    neo4j_repo.run("UNWIND $rows AS r MERGE (a:Skill {name:r[0]}) MERGE (b:Skill {name:r[1]}) "
                   "MERGE (a)-[e:RELATED_TO]-(b) ON CREATE SET e.weight = r[2]", rows=[list(p) for p in pairs])
    print(f"{len(pairs)} RELATED_TO edges")

    chunks = knowledge.build_chunks(records)
    for i in range(0, len(chunks), 100):
        part = chunks[i:i + 100]
        chroma_repo.add_chunks(chroma_repo.KNOWLEDGE, [f"k{i+j}" for j in range(len(part))], [c["text"] for c in part],
                               [{"domain": c["domain"], "role": c["role"]} for c in part])
    print(f"{len(chunks)} knowledge chunks embedded")


if __name__ == "__main__":
    main()
