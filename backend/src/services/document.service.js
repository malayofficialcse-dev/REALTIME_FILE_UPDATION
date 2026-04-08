import {pool} from "../config/db.js";

export const updateDocService = async (id,content) => {
    await pool.query('INSERT INTO document_versions(document_id,content) VALUES($1,$2)',[id,content]);

    const res = await pool.query(
        'UPDATE documents SET content=$1 WHERE id=$2 RETURNING *',
        [content,id]
    );
    return res.rows[0];
};