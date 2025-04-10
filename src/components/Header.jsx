import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import Icon from "./Icon.jsx";
import styles from './Header.module.scss';

export default function Header() {
	const user = useSelector((state) => state.user.user),
		menuRef = useRef(),
		[ expanded, setExpanded ] = useState(false),
		activeClassName = ({isActive}) => isActive ? styles.active : undefined;

	function toggleMenu() {
		setExpanded(!expanded);
	}

	useEffect(() => {
		let interval;
		const menuStyles = menuRef.current.style,
			menuClasses = menuRef.current.classList;
		if ( expanded ) {
			menuStyles.visibility = 'visible';
			interval = setInterval(() => { menuClasses.add(styles.expanded); });
		} else {
			menuClasses.remove(styles.expanded);
			menuClasses.add(styles.hiding);
			interval = setInterval(() => {
				menuClasses.remove(styles.hiding);
				menuStyles.visibility = 'hidden';
			}, 250 );
		}
		return () => clearInterval(interval);
	}, [expanded]);

	return (
	<nav className={styles.Header}>
		<div className={styles.wide}>
			<NavLink to="/" className={styles.title}><Icon icon="logo"/> Quiz Master</NavLink>
			<NavLink to="/quizzes" className={activeClassName}>Quizzes</NavLink>
			{ user && (
				<NavLink to="/quiz" end>Create Quiz</NavLink>
			) }
		</div>
		<div className={styles.narrow}>
			<a onClick={toggleMenu} className={styles.title}><Icon icon="menu"/> Quiz Master</a>
		</div>
		{ user ?
		(<div className={styles.user}>
			<NavLink to="/user" className={activeClassName} title={user.username}><Icon icon="user" mode="small"/></NavLink>
			<Link to="/user/logout" >Log Out</Link>
		</div>) :
		(<div className={styles.user}>
			<NavLink to="/user/login" className={activeClassName}>Log In</NavLink>
			<NavLink to="/user/new" className={`${activeClassName} ${styles.wide}`}>New User</NavLink>
		</div>)}

		<menu ref={menuRef} className={styles.menu} onClick={toggleMenu}>
			<ul>
				<li className={styles.title}><Icon icon="menu"/> Quiz Master</li>
				<li><Link to="/quizzes">Quizzes</Link></li>
				{ user ? (<>
					<li><Link to="/quiz">Create Quiz</Link></li>
					<li><Link to="/user">Your Profile</Link></li>
					<li><Link to="/user/logout" >Log Out</Link></li>
					</>) : (<>
						<li><Link to="/user/login">Log In</Link></li>
						<li><Link to="/user/new">New User</Link></li>
					</>) }
			</ul>
		</menu>

	</nav>);
}