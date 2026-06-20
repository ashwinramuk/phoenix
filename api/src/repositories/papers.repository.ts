import { pool } from "../db/pool.ts";
import { Paper, PaperSummary } from "../types/paper.ts";

// Papers are stored as JSONB rows; the summary view simply strips the questions.
export async function listPaperSummaries(): Promise<PaperSummary[]> {
  const { rows } = await pool.query("SELECT data FROM papers ORDER BY id");
  return rows.map((r: { data: Paper }) => {
    const { questions, ...summary } = r.data;
    return summary;
  });
}

export async function getPaperById(id: string): Promise<Paper | null> {
  const { rows } = await pool.query("SELECT data FROM papers WHERE id = $1", [id]);
  return rows.length ? (rows[0].data as Paper) : null;
}
