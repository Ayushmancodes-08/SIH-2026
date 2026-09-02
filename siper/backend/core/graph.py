"""
SIPER Network Graph Analytics Engine
Powered by NetworkX for graph traversal, centrality analysis, community detection, and shortest path finding.
"""
import networkx as nx
import json
import sqlite3
from typing import Dict, Any, List, Optional, Tuple
from .config import ENTITY_COLORS
from .database import get_db

def build_networkx_graph() -> nx.Graph:
    """Load all entities and relationships from SQLite into a NetworkX Graph."""
    G = nx.Graph()
    conn = get_db()
    try:
        # Load nodes
        entity_rows = conn.execute("SELECT * FROM entities").fetchall()
        for row in entity_rows:
            aliases = json.loads(row["aliases"] or "[]")
            identifiers = json.loads(row["identifiers"] or "{}")
            G.add_node(
                row["id"],
                id=row["id"],
                label=row["canonical_name"],
                type=row["type"],
                risk_level=row["risk_level"],
                risk_score=row["risk_score"],
                confidence=row["confidence"],
                color=ENTITY_COLORS.get(row["type"], "#9CA3AF"),
                aliases=aliases,
                identifiers=identifiers,
                primary_photo=row["primary_photo"],
                degree_centrality=row["degree_centrality"],
                betweenness_centrality=row["betweenness_centrality"],
                pagerank=row["pagerank"],
                community_id=row["community_id"]
            )

        # Load edges
        rel_rows = conn.execute("SELECT * FROM relationships").fetchall()
        for row in rel_rows:
            provenance_ids = json.loads(row["provenance_ids"] or "[]")
            G.add_edge(
                row["source_id"],
                row["target_id"],
                id=row["id"],
                source=row["source_id"],
                target=row["target_id"],
                type=row["type"],
                confidence=row["confidence"],
                source_count=row["source_count"],
                first_seen=row["first_seen"],
                last_seen=row["last_seen"],
                verified=bool(row["verified"]),
                provenance_ids=provenance_ids,
                explanation=row["explanation"]
            )
        return G
    finally:
        conn.close()

def compute_graph_metrics() -> Dict[str, Any]:
    """Compute degree, betweenness, PageRank, and Louvain communities, and persist back to database."""
    G = build_networkx_graph()
    if len(G.nodes) == 0:
        return {"nodes_count": 0, "edges_count": 0}

    # Degree Centrality
    deg_centrality = nx.degree_centrality(G)
    
    # Betweenness Centrality
    bet_centrality = nx.betweenness_centrality(G)
    
    # Pure-Python PageRank calculation (independent of numpy/scipy)
    N = len(G.nodes)
    nodes_list = list(G.nodes)
    pagerank_scores = {n: 1.0 / N for n in nodes_list}
    dangling_nodes = [n for n in nodes_list if G.degree(n) == 0]
    alpha = 0.85

    for _ in range(100):
        prev_pr = pagerank_scores.copy()
        dangling_sum = alpha * sum(prev_pr[n] for n in dangling_nodes)
        dangling_contrib = dangling_sum / N
        base = (1.0 - alpha) / N + dangling_contrib
        
        diff = 0.0
        for n in nodes_list:
            incoming = sum(prev_pr[nbr] / max(1, G.degree(nbr)) for nbr in G.neighbors(n))
            pagerank_scores[n] = base + alpha * incoming
            diff += abs(pagerank_scores[n] - prev_pr[n])
        
        if diff < 1e-5:
            break
    
    # Community detection via greedy modularity or Louvain
    try:
        communities = nx.community.greedy_modularity_communities(G)
        node_communities = {}
        for comm_id, comm_nodes in enumerate(communities):
            for node in comm_nodes:
                node_communities[node] = comm_id
    except Exception:
        node_communities = {node: 0 for node in G.nodes}

    # Update database
    conn = get_db()
    try:
        with conn:
            for node_id in G.nodes:
                deg = round(deg_centrality.get(node_id, 0.0), 4)
                bet = round(bet_centrality.get(node_id, 0.0), 4)
                pr = round(pagerank_scores.get(node_id, 0.0), 4)
                comm = node_communities.get(node_id, 0)
                conn.execute(
                    """
                    UPDATE entities
                    SET degree_centrality = ?, betweenness_centrality = ?, pagerank = ?, community_id = ?
                    WHERE id = ?
                    """,
                    (deg, bet, pr, comm, node_id)
                )
    finally:
        conn.close()

    return {
        "nodes_count": len(G.nodes),
        "edges_count": len(G.edges),
        "communities_count": len(set(node_communities.values())) if node_communities else 0
    }

def get_graph_data(
    case_id: Optional[str] = None,
    entity_types: Optional[List[str]] = None,
    min_confidence: float = 0.0,
    search_query: Optional[str] = None,
    max_nodes: int = 250
) -> Dict[str, Any]:
    """Retrieve filtered nodes and links formatted for the Force-Directed Canvas."""
    conn = get_db()
    try:
        # Load entities
        where_clauses = ["1=1"]
        params = []

        if case_id:
            ce_rows = conn.execute("SELECT entity_id FROM case_entities WHERE case_id = ?", (case_id,)).fetchall()
            if ce_rows:
                eids = [r["entity_id"] for r in ce_rows]
                placeholders = ",".join(["?"] * len(eids))
                where_clauses.append(f"id IN ({placeholders})")
                params.extend(eids)

        if entity_types:
            placeholders = ",".join(["?"] * len(entity_types))
            where_clauses.append(f"type IN ({placeholders})")
            params.extend(entity_types)

        if search_query:
            where_clauses.append("(canonical_name LIKE ? OR aliases LIKE ? OR identifiers LIKE ?)")
            q = f"%{search_query}%"
            params.extend([q, q, q])

        query = f"SELECT * FROM entities WHERE {' AND '.join(where_clauses)} LIMIT {max_nodes}"
        rows = conn.execute(query, params).fetchall()
        
        nodes_dict = {}
        for r in rows:
            aliases = json.loads(r["aliases"] or "[]")
            identifiers = json.loads(r["identifiers"] or "{}")
            nodes_dict[r["id"]] = {
                "id": r["id"],
                "label": r["canonical_name"],
                "name": r["canonical_name"],
                "type": r["type"],
                "risk_level": r["risk_level"],
                "risk_score": r["risk_score"],
                "confidence": r["confidence"],
                "color": ENTITY_COLORS.get(r["type"], "#9CA3AF"),
                "aliases": aliases,
                "identifiers": identifiers,
                "primary_photo": r["primary_photo"],
                "degree_centrality": r["degree_centrality"],
                "betweenness_centrality": r["betweenness_centrality"],
                "pagerank": r["pagerank"],
                "community_id": r["community_id"],
                "status": r["status"]
            }

        node_ids = set(nodes_dict.keys())
        if not node_ids:
            return {"nodes": [], "links": []}

        # Load links
        rel_rows = conn.execute("SELECT * FROM relationships WHERE confidence >= ?", (min_confidence,)).fetchall()
        links = []
        for r in rel_rows:
            if r["source_id"] in node_ids and r["target_id"] in node_ids:
                provenance_ids = json.loads(r["provenance_ids"] or "[]")
                links.append({
                    "id": r["id"],
                    "source": r["source_id"],
                    "target": r["target_id"],
                    "type": r["type"],
                    "confidence": r["confidence"],
                    "source_count": r["source_count"],
                    "first_seen": r["first_seen"],
                    "last_seen": r["last_seen"],
                    "verified": bool(r["verified"]),
                    "provenance_ids": provenance_ids,
                    "explanation": r["explanation"]
                })

        return {
            "nodes": list(nodes_dict.values()),
            "links": links
        }
    finally:
        conn.close()

def expand_entity_neighborhood(entity_id: str, hops: int = 1) -> Dict[str, Any]:
    """Expand graph around an entity up to specified hops."""
    G = build_networkx_graph()
    if entity_id not in G:
        return {"nodes": [], "links": []}

    subgraph_nodes = set([entity_id])
    frontier = set([entity_id])
    for _ in range(hops):
        next_frontier = set()
        for node in frontier:
            neighbors = set(G.neighbors(node))
            next_frontier.update(neighbors)
        subgraph_nodes.update(next_frontier)
        frontier = next_frontier

    subgraph = G.subgraph(subgraph_nodes)
    
    nodes = []
    for n in subgraph.nodes:
        data = G.nodes[n]
        nodes.append(data)

    links = []
    for u, v, d in subgraph.edges(data=True):
        links.append(d)

    return {
        "nodes": nodes,
        "links": links,
        "expanded_entity_id": entity_id,
        "total_nodes": len(nodes),
        "total_links": len(links)
    }

def find_shortest_path(source_id: str, target_id: str) -> Dict[str, Any]:
    """Calculate the shortest investigative path between two entities."""
    G = build_networkx_graph()
    if source_id not in G or target_id not in G:
        return {"found": False, "message": "Source or target entity not found in network."}

    try:
        path = nx.shortest_path(G, source=source_id, target=target_id)
        path_edges = []
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            edge_data = G.get_edge_data(u, v)
            path_edges.append(edge_data)

        path_nodes = [G.nodes[node_id] for node_id in path]
        return {
            "found": True,
            "path_length": len(path) - 1,
            "nodes": path_nodes,
            "edges": path_edges
        }
    except nx.NetworkXNoPath:
        return {
            "found": False,
            "message": "No connecting path discovered between the two entities in current intelligence scope."
        }

def export_cytoscape_json() -> Dict[str, Any]:
    """Export network graph into Cytoscape.js standard JSON format."""
    G = build_networkx_graph()
    elements = {"nodes": [], "edges": []}
    for n_id, data in G.nodes(data=True):
        elements["nodes"].append({
            "data": {
                "id": n_id,
                "label": data.get("label", n_id),
                "type": data.get("type", "Entity"),
                "risk_level": data.get("risk_level", "LOW"),
                "risk_score": data.get("risk_score", 0),
                "betweenness": data.get("betweenness_centrality", 0.0),
                "pagerank": data.get("pagerank", 0.0),
                "community": data.get("community_id", 0)
            }
        })
    for u, v, data in G.edges(data=True):
        elements["edges"].append({
            "data": {
                "id": f"e_{u}_{v}",
                "source": u,
                "target": v,
                "type": data.get("type", "ASSOCIATED_WITH"),
                "confidence": data.get("confidence", 0.8)
            }
        })
    return elements

def export_graphml_xml() -> str:
    """Export network graph in standard GraphML format for Gephi and forensic analysis tools."""
    G = build_networkx_graph()
    # Create clean GraphML representation
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">',
        '  <key id="d0" for="node" attr.name="label" attr.type="string"/>',
        '  <key id="d1" for="node" attr.name="type" attr.type="string"/>',
        '  <key id="d2" for="node" attr.name="risk" attr.type="string"/>',
        '  <key id="d3" for="edge" attr.name="relation" attr.type="string"/>',
        '  <key id="d4" for="edge" attr.name="confidence" attr.type="double"/>',
        '  <graph id="SIPER_PS26189_Network" edgedefault="undirected">'
    ]
    for n_id, data in G.nodes(data=True):
        label = data.get("label", n_id).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        ntype = data.get("type", "Entity")
        risk = data.get("risk_level", "LOW")
        lines.append(f'    <node id="{n_id}">')
        lines.append(f'      <data key="d0">{label}</data>')
        lines.append(f'      <data key="d1">{ntype}</data>')
        lines.append(f'      <data key="d2">{risk}</data>')
        lines.append('    </node>')
    
    for u, v, data in G.edges(data=True):
        rel = data.get("type", "ASSOCIATED_WITH")
        conf = data.get("confidence", 0.8)
        lines.append(f'    <edge source="{u}" target="{v}">')
        lines.append(f'      <data key="d3">{rel}</data>')
        lines.append(f'      <data key="d4">{conf}</data>')
        lines.append('    </edge>')
    lines.append('  </graph>')
    lines.append('</graphml>')
    return '\n'.join(lines)
