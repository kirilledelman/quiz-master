import {createSlice} from "@reduxjs/toolkit";

// manages state related to ui
const uiSlice = createSlice({
	name: "ui",
	initialState: {
		quizzesTab: 'all', // selected tab for QuizzesPage
		userTab: 'quizzes', // tab on UserPage
		notificationText: "",
		notificationCounter: 0,
	},
	reducers: {
		// set current category/filter for Quizzes
		setQuizzesTab: (state, { payload }) => {
			state.quizzesTab = payload;
		},

		// set current tab on User page
		setUserTab: (state, { payload }) => {
			state.userTab = payload;
		},

		// called when logging out to reset tabs
		resetTabs: (state) => {
			state.userTab = 'quizzes';
			state.quizzesTab = 'all';
		},

		// shows notification at the bottom of the screen
		showNotification: (state, { payload }) => {
			console.log("ℹ️", payload);
			state.notificationText = payload || '';
			state.notificationCounter++;
		},

		// clears currently shown notification
		clearNotification: (state) => {
			state.notificationText = '';
		}
	}
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;