import {Outlet} from "react-router-dom";
import Header from "../components/Header";
import Notification from "../components/Notification";
import "./RootLayout.scss";

export default function RootLayout() {
	return (
	<main>
		<Header/>
		<Outlet/>
		<Notification/>
	</main>);
}