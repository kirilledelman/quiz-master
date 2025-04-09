import { JSONFilePreset } from 'lowdb/node'

let db = null;
const quizzesDb = {
	init: async () => {
		db = await JSONFilePreset('./store/quizzes-data.json', {
			index: 0, entries: { /* "id" : { id, ownerId, title, published, size, created, updated, taken, rated, rating, data } */ }
		});
	},

	// updates quiz if owner matches
	update: async ( quizId, ownerId, obj ) => {
		// find and validate
		if ( !obj.data ) return 400;
		let quiz = db.data.entries[quizId.toString()];
		if ( !quiz ) return 404;
		if ( quiz.ownerId !== ownerId ) return 403;
		// update quiz
		quiz.title = obj.title;
		quiz.published = obj.published;
		quiz.updated = new Date().getTime();
		quiz.data = obj.data;
		quiz.size = obj.size;
		// save
		await db.write();
		return quiz;
	},

	// increments number of times the quiz was taken
	incrementTaken: async ( quizId ) => {
		let quiz = db.data.entries[quizId.toString()];
		if ( !quiz ) return 404;
		quiz.taken++;
		// save
		await db.write();
	},

	// adds cumulative rating and number of times it was rated
	// rateObject is { prevRating, rating }
	setRating: async ( quizId, userId, rateObject ) => {
		let quiz = db.data.entries[quizId.toString()];
		if ( !quiz ) return 404;
		if ( quiz.userId === userId ) return 403;
		if ( rateObject.prevRating ) { // if had previous rating, subtract it
			quiz.rating += rateObject.rating - rateObject.prevRating;
		} else {
			quiz.rating += rateObject.rating;
			quiz.rated++;
		}
		// save
		await db.write();
		return true;
	},

	// adds new quiz for ownerId
	// obj is { published, data }
	add: async ( ownerId, obj ) => {
		if ( !obj.data ) return 400;
		const quiz = {
			id: ++db.data.index,
			published: obj.published,
			title: obj.title,
			created: new Date().getTime(),
			updated: new Date().getTime(),
			size: 0,
			ownerId,
			taken: 0, rated: 0, rating: 0,
			data: obj.data,
		};
		await db.update((db)=> db.entries[quiz.id.toString()] = quiz );
		return quiz;
	},

	// returns quiz object if owner matches, or if quiz is published
	get: async ( quizId, userId ) => {
		let quiz = db.data.entries[quizId.toString()];
		if ( !quiz ) return 404;
		if ( quiz.published || quiz.ownerId === userId ) return quiz;
		return 403;
	},

	// returns array of { id, ownerId, title, published, created, updated } matching ownerId
	getForOwner: async ( userId, publishedOnly ) => {
		const quizList = [];
		for (let itemId in db.data.entries) {
			const item = db.data.entries[itemId];
			// matches owner and published flag
			if (item.ownerId === userId && (!publishedOnly || item.published) ) {
				// omit data field
				const { ['data']:_, ...sansData } = item;
				quizList.push(sansData);
			}
		}
		return quizList;
	},

	// deletes quiz if owner matches
	delete: async ( quizId, userId ) => {
		let quiz = db.data.entries[quizId.toString()];
		if ( !quiz ) return 404;
		if ( quiz.ownerId !== userId ) return 403;
		await db.update((db)=> delete db.entries[quiz.id.toString()]);
		return true;
	},

	// returns array of quizzes (later added first),
	// using pagination
	list: async (opts, perPage, page, userId, filter=null) => {
		let result = [], start = page * perPage, end = start + perPage, cur = 0;
		const entries = Object.values(db.data.entries);
		const filterRegexp = filter.length ? new RegExp(filter.replace(/\s+/, '|'), 'gi') : null;

		for ( let i = entries.length - 1; i >= 0; i--) {
			const quiz = entries[ i ];

			// filter finds keywords in title, and intro
			if ( filterRegexp ) {
				if ( !quiz.title.match(filterRegexp) &&
					!quiz.data.questions[0].title.match(filterRegexp) &&
					!quiz.data.questions[0].text.match(filterRegexp) ) continue;
			}

			// user only - include all
			if ( opts === 'user') {
				if ( quiz.ownerId !== userId ) continue;
			}
			// owner only - include only published
			else if ( opts === 'owner') {
				if ( quiz.ownerId !== userId || !quiz.published ) continue;
			}
			// popular - score >= 4, taken > 10
			else if ( opts === 'popular') {
				const score = quiz.rated > 0 ? quiz.rating / quiz.rated : quiz.rated;
				if ( !quiz.published || score < 4 || quiz.taken < 10) continue;
			}
			// public - include only published
			else if ( !quiz.published ) continue;

			// include in result (omit data field)
			if ( cur >= start ) {
				const { ['data']:_, ...sansData } = quiz;
				result.push(sansData);
			}
			if ( ++cur >= end ) break;
		}
		return result;
	}
}

quizzesDb.init();

export default quizzesDb;