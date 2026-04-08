import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {pool} from '../../config/db.js';

export const  authResolver = {
    Mutation: {
        register: async (_,{email,password}) => {
            const salt = bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password,salt);

            const res = await pool.query(
                'INSERT INTO users(email,password) VALUES ($1,$2) RETURNING id,email',
                [email,hashed]
            );

            const token =jwt.sign({userId:res.rows[0].id},
                'SECRET'
            );

            return {token};
        },

        login: async (_,{email,password}) => {
            const res = await pool.query('SELECT * FROM users WHERE email=$1',[email]);
            const user = res.rows[0];

            if(!user) {
                throw new Error ('User not found');
            }

            const validate = await bcrypt.compare(password,user.password);
            if(!validate) throw new Error('Invalid password');

            const token = jwt.sign({userId:user.id},'SECRET');
            return {token};
        }
    }
};

