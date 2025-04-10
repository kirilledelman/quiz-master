import styles from './QuizItem.module.scss'
import { Link, useNavigate } from "react-router-dom"
import { formatTimestamp } from "../util/common.js"

/*
	Quiz item shown in a list of quizzes, along with some quiz stats and optional edit buttons for owner.
*/

export default function QuizItem({item, onDelete }) {
	const navigate = useNavigate(),
		rating = item.rated > 0 ? (item.rating / item.rated).toFixed(1).replace(/\.?0*$/,'') : 0;

	return (
	<li className={styles.QuizItem} >
		<div className={styles.leftSide}>
			<Link className={styles.link} to={`/quiz/${item.id}`}>
				{item.title}
			</Link>
			<div className={styles.info}>
				<div><strong>{item.size}</strong> question{item.size !== 1 && 's'} by <Link to={`/user/${item.ownerId}`}><strong>{item.username}</strong></Link></div>
				<div><em>updated {formatTimestamp(item.updated)}</em></div>
			</div>
			<div className={`${styles.info} ${styles.right}`}>
				<div className={item.taken ? '' : styles.empty}>{item.taken ? `Taken ${item.taken} time${item.taken>1 ? 's':''}` : "No takers"}</div>
				<div className={styles.rating + (item.rated ? '' : ` ${styles.empty}`)}>
					{item.rated > 0 ? (<span><strong>{rating}</strong>/5 ({item.rated} rating{item.rated > 1 && 's'})</span>) : 'No ratings'}
				</div>
			</div>
		</div>

		{ onDelete && (<div className={styles.rightSide}>
			<button className="small" onClick={()=>onDelete(item)}>Delete</button>
			<button className="small" onClick={()=>navigate(`/quiz/${item.id}/edit`)}>Edit</button>
			<button className="small" onClick={()=>navigate(`/quiz/${item.id}/stats`)}>Stats</button>
		</div>) }
	</li>);
}