import styles from './HomePage.module.scss'
import Icon from "../components/Icon.jsx"
import {Link} from "react-router-dom"
import {useSelector} from "react-redux"

/*
	Landing page
*/

export default function HomePage() {
	const user = useSelector((state) => state.user.user);

	// if logged in
	if ( user ) {
		return (
		<article className={styles.HomePage}>
			<h1><span>Welcome, <em>{user.username}</em></span></h1>
			<div className="box">
				<p><Link to="/quizzes">Take a quiz</Link>, or <Link to="/quiz">create one</Link> for others!</p>
			</div>
		</article>);
	}

	// not logged in
	return (
	<article className={styles.HomePage}>
		<h1>Quiz Master</h1>
		<div className="box">
			<p><Icon icon="react" mode="float-left"/> The goal of this application is to demonstrate the ability to use <strong>React</strong>, <strong>React Router</strong>, and <strong>Redux store</strong>.</p>
			<p>You can browse <Link to="/quizzes">quizzes</Link> published by other users without logging in.</p>
			<p>To rate quizzes, track your results, and create your own quizzes <Link to="/user/new">create an account</Link> or <Link  to="/user/login">log in</Link>.</p>
			<p>This project source can be found at <a href="https://github.com/kirilledelman/quiz-master" target="_blank">github.com/kirilledelman/quiz-master</a></p>
		</div>
		<footer>&copy; Kirill Edelman {new Date().getFullYear()}</footer>
	</article>);
}