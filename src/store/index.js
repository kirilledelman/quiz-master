import { configureStore } from "@reduxjs/toolkit"
import userReducers from "./user";
import uiReducers from "./ui";

// redux store with user, quiz, and notification reducers
// wrapped around main App component
export const store = configureStore({
	reducer: {
		user: userReducers,
		ui: uiReducers
	},
});