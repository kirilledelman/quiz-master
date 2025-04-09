import { JSONFilePreset } from 'lowdb/node'
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

/*
200 OK – Successful requests that return data.
201 Created – When a resource is successfully created (e.g., user registration).
400 Bad Request – When the request is malformed (e.g., missing required fields).
401 Unauthorized – When authentication is required but not provided or incorrect.
403 Forbidden – When the user does not have permission to perform the action.
404 Not Found – When requesting a resource that doesn’t exist (e.g., invalid ID).
409 Conflict – When there's a conflict, such as trying to create a user with a taken username.
422 Unprocessable Entity – When validation fails (e.g., invalid email format).
500 Internal Server Error – For unexpected server-side errors.
*/

const AUTH_KEY = "82ndS3insD032x8l";
let db = null;
let loginDurationHours = 24;

// User is
const usersDb = {
	init: async () => {
		db = await JSONFilePreset('./store/users-data.json',
			{ index: 0, entries: { /* "id" : { id, username, password, created, active, extra } */ } });
	},

	// returns true if given username exists in the DB
	exists: ( username ) => {
		return Object.values(db.data.entries).find(( user ) => user.username === username) !== undefined;
	},

	// creates new User, returns record
	add: async ( username, password ) => {
		password = await bcrypt.hash(password, 10);
		const now = new Date().getTime();
		let user = {
			id: ++db.data.index,
			created: now,
			active: now,
			username,
			password,
			extra: {}
		};
		await db.update(data => data.entries[user.id.toString()] = user);
		return usersDb.signUser(user, true);
	},

	// returns user record without password
	get: async ( userId ) => {
		const user = db.data.entries[userId.toString()];
		if (!user) return 404;
		return usersDb.signUser(user, false);
	},

	// returns usernames for a list of user ids
	getUsernames: async ( userIds ) => {
		const usernames = { 0: "Anonymous" };
		for( let id of userIds ) {
			const u = db.data.entries[id.toString()];
			usernames[id] = u ? u.username : "Unknown";
		}
		return usernames;
	},

	// returns User record if username/pass match, or directly by userId from auth token
	// includes auth token and
	login: async (username, password, userId=0) => {
		let user;

		// log in with userId
		if ( userId ) {
			user = db.data.entries[userId.toString()];
			if ( !user ) return false;
		// log in with username and password
		} else {
			user = Object.values(db.data.entries).find((user) => user.username === username);
			if (!user) return false;
			const passMatch = await bcrypt.compare(password, user.password);
			if (!passMatch) return false;
		}
		// update active date
		user.active = new Date().getTime();
		await db.write();
		return usersDb.signUser(user, true);
	},

	// nothing for now
	logout: async (username) => {
		return true;
	},

	// returns updated user on success, error message on failure
	update: async (userId, username, password, extra ) => {
		let user = db.data.entries[userId.toString()];
		// invalid ID
		if ( !user ) return 404;
		// check if new username is taken
		if ( user.username !== username && usersDb.exists( username ) ) return 409;
		// update username and optionally password
		user.username = username;
		password = password ? await bcrypt.hash(password, 10) : user.password;
		user.password = password;
		user.extra = { ...user.extra, ...extra };
		// save and return
		await db.write();
		return usersDb.signUser(user, false);
	},

	// middleware auth token check - fail with 401 if invalid
	// token IS REQUIRED
	requireAuth: (req, res, next) => {
		const token = req.header('Authorization');
		if (!token) return res.status(401).json({ error: 'Access denied' });
		try {
			const decoded = jwt.verify(token.split(' ')[1], AUTH_KEY); // Bearer TOKEN
			req.userId = decoded.id;
			next();
		} catch (error) {
			res.status(401).json({ error: 'Invalid token' });
		}
	},

	// middleware auth token read - pass forward request.userId
	// if token is there and is invalid, sends back 401
	// token IS OPTIONAL
	optionalAuth: async (req, res, next) => {
		const token = req.header('Authorization');
		if (token) {
			req.authTokenValid = false;
			try {
				const decoded = jwt.verify(token.split(' ')[1], AUTH_KEY); // Bearer TOKEN
				req.userId = parseInt(decoded.id);
				req.authTokenValid = true;
			} catch (err) {
				// if token was invalid
				res.status(401).json({ error: 'Invalid token' });
				return;
			}
		}
		next();
	},

	// returns copy of user record ready to be sent back
	// deletes password field, optionally creates auth token
	signUser: (u, needToken=false) => {
		let user = { ...u };
		delete user.password; // strip password field
		if ( needToken ) {
			const expDate = new Date();
			expDate.setTime(expDate.getTime() + 3600000 * loginDurationHours);
			user.auth = jwt.sign({ id: user.id, cr: user.created }, AUTH_KEY, { expiresIn: `${loginDurationHours}h` }),
			user.authExpires = expDate.getTime();
		}
		return user;
	}
}

usersDb.init();

export default usersDb;