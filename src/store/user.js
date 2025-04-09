import {createSlice} from "@reduxjs/toolkit";

// manages user authentication state
const userSlice = createSlice({
	name: "user",
	initialState: {
		user: null,
	},
	reducers: {
		// save user object and auth token
		loggedIn: (state, { payload } ) => {
			state.user = payload.user;
			localStorage.setItem("auth", payload.user.auth);
			localStorage.setItem("authExpires", payload.user.authExpires );
		},

		// clear user and auth token
		loggedOut: (state) => {
			localStorage.removeItem("auth");
			localStorage.removeItem("authExpires");
			state.user = null;
		},

		// updates supplied fields in user object
		updateUser: (state, { payload }) => {
			for (let key in payload) state.user[key] = payload[key];
		}
	}
});

export const userActions = userSlice.actions;
export default userSlice.reducer;