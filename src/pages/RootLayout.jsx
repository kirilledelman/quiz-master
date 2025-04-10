import "./RootLayout.scss"
import Header from "../components/Header"
import Notification from "../components/Notification"
import {Outlet} from "react-router-dom"

/*
	Layout root for React Router
	pages go into <Outlet>
*/

export default function RootLayout() {
	return (
	<main>
		<Header/>
		<Outlet/>
		<Notification/>
	</main>);
}