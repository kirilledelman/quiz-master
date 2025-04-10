import { useState } from "react"
import { useBeforeUnload, useBlocker } from "react-router-dom"

/*
	Custom hook for preventing navigating away from current location if dirty flag is set.
*/

export default function useUnsavedChanges(prompt) {
	const [isDirty, setIsDirty] = useState(false);

	const handleBeforeUnload = (event) => {
		if (isDirty) {
			if ( event.preventDefault) { // beforeUnload event
				event.preventDefault();
				event.returnValue = prompt;
				return prompt;
			} else return !confirm(prompt); // blocker call
		}
		return false;
	};

	// set blockers for reload and navigating
	useBeforeUnload(handleBeforeUnload);
	useBlocker(handleBeforeUnload);
	return [ isDirty, ()=>{setIsDirty(true)}, ()=>{setIsDirty(false)} ];
}