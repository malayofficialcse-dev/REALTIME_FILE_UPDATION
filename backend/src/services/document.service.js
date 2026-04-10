import {pool} from "../config/db.js";

export const updateDocService = async (id,content, config) => {
    if (content !== undefined && content !== null) {
      await pool.query('INSERT INTO document_versions(document_id,content) VALUES($1,$2)',[id,content]);
    }

    let query = 'UPDATE documents SET updated_at = NOW()';
    let params = [];
    let idx = 1;

    if (content !== undefined && content !== null) {
      query += `, content = $${idx++}`;
      params.push(content);
    }
    if (config !== undefined && config !== null) {
      query += `, config = $${idx++}`;
      params.push(config);
    }

    query += ` WHERE id = $${idx} RETURNING *`;
    params.push(id);

    const res = await pool.query(query, params);
    return res.rows[0];
};