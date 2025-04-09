import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';
import fs from "fs";
import users from './users.mjs';
import quizzes from './quizzes.mjs';
import results from "./results.mjs";

const app = express();
const PORT = 10000;

app.use(cors()); // enable CORS
app.use(express.json()); // parse JSON encoded payloads
app.use(express.urlencoded({ extended: true })); // parse URL encoded payloads
app.use(function(req, res, next) {
	res.setHeader('pid', process.pid);
	next();
});


/*
Response codes:

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

// POST quizId, score => { success, resultId }
app.post('/results/add/:quizId', users.optionalAuth, async (req, res) => {
	const userId = req.authTokenValid ? req.userId : 0,
		quizId = parseInt(req.params.quizId);
	if ( !quizId || !req.body ) return res.status(400).json({ success: false });
	const score = req.body.score;
	// add result
	const result = await results.add(userId, quizId, score);
	// increment take counter
	quizzes.incrementTaken( quizId );
	res.json({ success: true, resultId: result.id });
});

// GET quizId => { success, stats: [], title, updated, rated, rating }
app.get('/results/:quizId', users.optionalAuth, async (req, res) => {
	const userId = req.authTokenValid ? req.userId : 0,
		quizId = parseInt(req.params.quizId);
	if (!quizId || !userId) return res.status(403).json({success: false});
	// first check if user owns the quiz
	const quiz = await quizzes.get(quizId, userId);
	if (!quiz || quiz.ownerId !== userId) return res.status(403).json({ success: false });
	// get stats and extract username ids
	const stats = await results.getStats(quizId);
	const userIds = stats.map(r => r.userId);
	const userNames = await users.getUsernames(userIds);
	for( let q of stats ) {
		q.username = userNames[q.userId];
	}
	res.json({ success: true, stats, title: quiz.title, updated: quiz.updated, rated: quiz.rated, rating: quiz.rating });
});

/* ==================================================================================================== */

// POST data => { success, quizId }
app.post('/quiz', users.requireAuth, async (req, res) => {
	const quizData = req.body;
	const result = await quizzes.add(req.userId, quizData);
	if ( typeof result === 'number' ) {
		res.status(result).json({ success: false });
	} else {
		res.status(201).json({ success: true, quizId: result.id});
	}
});

// UPDATE data => { success }
app.patch('/quiz/:quizId', users.requireAuth, async (req, res) => {
	const quizData = req.body;
	const result = await quizzes.update(parseInt(req.params.quizId), parseInt(req.userId), quizData);
	if ( typeof result === 'number' ) {
		res.status(result).json({ success: false });
	} else {
		res.json({ success: true });
	}
});

// DELETE quizId => { success }
app.delete('/quiz/:quizId', users.requireAuth, async (req, res) => {
	const quizId = parseInt(req.params.quizId),
		result = await quizzes.delete(quizId, parseInt(req.userId));
	if ( typeof result === 'number' ) {
		res.status(result).json({ success: false });
	} else {
		// delete results as well
		const resultsDeleted = await results.deleteFor(quizId);
		res.json({ success: true, resultsDeleted });
	}
});

// POST resultId, rating => { success }
app.post('/quiz/rate/:quizId', users.optionalAuth, async (req, res) => {
	const rating = parseInt(req.body.rating),
		resultId = parseInt(req.body.resultId),
		quizId = parseInt(req.params.quizId),
		userId = req.userId || 0;

	// set rating on result
	const rateObject = await results.setRating(resultId, userId, rating);
	if ( typeof rateObject === 'number' ) return res.status(rateObject).json({ success: false });

	// add or update cumulative rating to quiz
	const success = await quizzes.setRating(quizId, userId, rateObject);
	if ( typeof success === 'number' ) return res.status(success).json({ success: false });

	// done
	res.json({ success: true });
});

// GET quizId => { success, data, published }
app.get("/quiz/:quizId", users.optionalAuth, async (req, res) => {
	// get data or error
	const result = await quizzes.get( parseInt(req.params.quizId), parseInt(req.userId) );
	if ( typeof result == 'number' ) {
		res.status(result).json({ success: false });
	} else {
		res.json(result);
	}
});

// GET perPage (optional) -> [ { username, ...quiz }, { username, ...quiz } ... ]
app.get("/quizzes/:opts/:page", users.optionalAuth, async (req, res) => {
	const perPage = parseInt(req.query.perPage) || 10;
	const page = parseInt(req.params.page) || 0;
	const filter = req.headers['filter'] || "";
	const reply = await quizzes.list(req.params.opts, perPage, page, req.userId, filter);
	const ownerIds = reply.map(r => r.ownerId);
	const userNames = await users.getUsernames(ownerIds);
	for( let q of reply ) {
		q.username = userNames[q.ownerId];
	}
	res.json(reply);
});

/* ==================================================================================================== */

// GET userId -> { user: { id, username, extra }, quizzes: [ { id, ownerId, username, title, created, updated } ],
//                 results: [ { quizId, count, highestTimestamp, highestResult, quiz: { ownerId, title, username } } ]
// returns info for the UserPage, including user info, user's quizzes, and collated results (quizzes user taken)
app.get( "/user/:userId", users.optionalAuth, async (req, res) => {
	const userId = parseInt(req.params.userId) || req.userId;
	const user = await users.get( userId );
	if ( typeof user === 'number' ) {
		res.status(user).json({ success: false });
		return;
	}
	// get user quizzes
	const quizList = await quizzes.getForOwner( user.id, req.userId !== userId );
	quizList.forEach((quiz) => quiz.username = user.username );

	const quizResults = {}; // quizId -> {...}

	// check if user is allowed to see results
	if (user.extra.showTaken || req.userId === userId) {
		// list of results matching user
		let items = await results.getForUser(userId);
		if (typeof items === 'number') return res.status(items).json({success: false});

		// collate results
		// fill in quiz and owner name field for each item
		const ownerIds = [];
		for (const item of items) {
			const quiz = await quizzes.get(item.quizId, userId);
			if (typeof quiz === 'number') continue;
			let res = quizResults[quiz.id];
			if (!res) {
				res = {
					count: 1,
					quizId: item.quizId,
					highestTimestamp: item.timestamp,
					highestResult: item.result,
					quiz: {ownerId: quiz.ownerId, title: quiz.title, username: ''}
				};
				quizResults[quiz.id] = res;
				ownerIds.push(quiz.ownerId);
			} else {
				res.highestResult = Math.max(res.highestResult, item.result);
				res.highestTimestamp = Math.max(res.highestTimestamp, item.timestamp);
				res.count++;
			}
		}
		// add quiz owners' usernames
		const userNames = await users.getUsernames(ownerIds);
		for (const quizId in quizResults ) {
			const res = quizResults[quizId];
			res.quiz.username = userNames[res.quiz.ownerId];
		}
	}
	// results are sorted by recency
	res.json({ user, quizzes: quizList, results: Object.values(quizResults).sort((a, b) => a.highestTimestamp - b.highestTimestamp) });
});

// PATCH username, password -> { success, user }
app.patch('/user', users.requireAuth, async (req, res) => {
	const { username, password, extra } = req.body;
	const result = await users.update(req.userId, username, password, extra );
	if ( typeof result === 'number' ) {
		res.status(result).json({ success: false });
	} else {
		res.json({ success: true, user: result });
	}
});

// POST username, password -> { success, user, message }
app.post('/user/new', async (req, res) => {
	const { username, password } = req.body;

	// validate
	if ( !username || username.length < 3 || username.length > 24 || username.match(/[^a-zA-Z0-9_]/) ) res.status(422).json({ message: "Invalid username", success: false });
	else if ( !password || password.length < 5 || password.length > 64 ) res.status(422).json({ message: "Invalid password", success: false });
	else if (await users.exists( username )) res.status(409).json({ message: "User already exists", success: false });
	else {
		// add and return user
		res.json({ user: await users.add( username, password ), success: true });
	}
});

// POST username, password -> { success, user }
// or if auth header is set, use that
app.post('/user/login', users.optionalAuth, async (req, res) => {
	const { username, password } = req.body;

	// login using credentials or token from optionalAuth
	const user = await users.login( username, password, req.userId );
	if ( user !== false ) res.json({ success: true, user });
	else res.status(401).json({ success: false });
});

// GET -> { success }
app.post('/user/logout', async (req, res) => {
	await users.logout();
	res.json({ success: true });
});

/* ==================================================================================================== */

// on dev environment we're running on http
if ( process.env.NODE_ENV === 'dev' ) {
	http.createServer(app).listen(PORT, ()=>{
		console.log(`Server running on http://localhost:${PORT}`);
	});
// in production - use https
} else {
	const options = {
		key: fs.readFileSync('/etc/pki/tls/private/gogoat.key'),
		cert: fs.readFileSync('/etc/pki/tls/certs/gogoat.crt')
	};
	https.createServer(options, app).listen(PORT, ()=>{
		console.log(`Server running on https://localhost:${PORT}`);
	});
}
process.title = "NodeJS Server";
console.log(`To terminate, call \x1b[1;31mkill -9 ${process.pid}\x1b[0m`);
