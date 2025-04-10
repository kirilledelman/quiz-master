import styles from "./LoadingSpinner.module.scss"

/*
	Basic three moving dots loading spinner
	https://github.com/n3r4zzurr0/svg-spinners?tab=readme-ov-file
*/

export default function LoadingSpinner() {
	return (<svg className={styles.loadingSpinner} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<circle className={styles.spinner_nOfF} cx="4" cy="12" r="3" fill="currentColor" />
			<circle className={styles.spinner_nOfF + ' ' + styles.spinner_fVhf} cx="4" cy="12" r="3" fill="currentColor"/>
			<circle className={styles.spinner_nOfF + ' ' + styles.spinner_piVe} cx="4" cy="12" r="3" fill="currentColor"/>
			<circle className={styles.spinner_nOfF + ' ' + styles.spinner_MSNs} cx="4" cy="12" r="3" fill="currentColor"/>
		</svg>);
}
