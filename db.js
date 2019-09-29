"use strict";
/* use strict is a javascript literal specifies javascript engine to run in strict mode */
/* any sort of unsafe  code or action causes error */
/* it allows developer to develop more secure app */
const sqlite3 = require('sqlite3').verbose();
class Db {

	constructor(file){
		this.db = new sqlite3.Database(file);
		this.createTable();
	}
	/* create table user */
	createTable(){
		const sql = `CREATE TABLE IF NOT EXISTS user (
			id integer PRIMARY KEY,
			email text UNIQUE,
			username text,
			user_pass text,
			is_admin integer 
		) `;
		return this.db.run(sql);
	}
	/* insert table */
	insertUser(user,callback){
		return this.db.run(
			`INSERT INTO user (email,username,user_pass,is_admin) VALUES(?,?,?,?)`,
			user, ( err) => { 
			callback(err);
		});
	}
	/* get user by email */
	selectByemail(email,callback){
		return this.db.get(`select * from user where email=?`,[email], (err, row) => { 
			callback(err,row);
		});
	}
	/* get all user */
	selectAll(callback){
		return this.db.all(`select * from user`, (err, rows) => { 
			callback(err,rows);
		})

	}

}

module.exports = Db;