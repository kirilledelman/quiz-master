import userReducers from "./user"
import uiReducers from "./ui"
import { configureStore } from "@reduxjs/toolkit"

/*
	Redux store with user and ui reducers,
	wrapped around main App component
*/

export const store = configureStore({
	reducer: {
		user: userReducers,
		ui: uiReducers
	},
});