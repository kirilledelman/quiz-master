import { JSONFilePreset } from 'lowdb/node'

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
let db = null;

const resultsDb = {
	init: async () => {
		db = await JSONFilePreset('./store/results-data.json', {
			index: 0, entries: [ /* { id, userId, quizId, timestamp, result, rating } */ ]
		});
	},

	// adds new result
	add: async ( userId, quizId, result ) => {
		const item = {
			id: ++db.data.index,
			userId,
			quizId,
			result,
			rating: 0,
			timestamp: Date.now()
		};
		await db.update((db)=> db.entries.push(item));
		return item;
	},

	getStats: async ( quizId ) => {
		return db.data.entries.filter( item => item.quizId === quizId );
	},

	// returns by id
	get: async ( id ) => {
		const item = db.data.entries.find(item => item.id === id);
		if ( !item ) return 404;
		return item;
	},

	// updates rating on this result
	// returns { prevRating, rating } for use with setRating on quiz object
	setRating: async ( id, userId, rating ) => {
		const item = db.data.entries.find(item => item.id === id);
		if ( !item ) return 404;
		if ( item.userId !== userId ) return 403;
		const quizId = item.quizId, response = { prevRating: item.rating, rating };

		// if prevRating is 0 (this result is first rating for this quiz by this user)
		if ( userId !== 0 && response.prevRating === 0) {
			// try to find most recent result with the same userId / quizId, that was rated
			let lastRated = null;
			db.data.entries.forEach( (item) => {
				if (item.id === id || item.userId !== userId || item.quizId !== quizId || item.rating === 0) return;
				if ( !lastRated || item.timestamp > lastRated.timestamp) lastRated = item;
			} );
			// this previous rating is used to update cum
			response.prevRating = lastRated ? lastRated.rating : 0;
		}

		// update rating
		item.rating = rating;
		await db.write();
		return response;
	},

	// returns array of results for user
	getForUser: async ( userId ) => {
		return db.data.entries.filter(item => item.userId === userId);
	},

	// returns array of results for user
	getForQuiz: async ( quizId ) => {
		return db.data.entries.filter(item => item.quizId === quizId);
	},

	// deletes results for quizId
	deleteFor: async ( quizId ) => {
		let num = 0;
		db.update((db)=> {
			let prevLen = db.entries.length;
			db.entries = db.entries.filter(item => item.quizId !== quizId);
			num = prevLen - db.entries.length;
		});
		return num;
	}
}

resultsDb.init();

export default resultsDb;