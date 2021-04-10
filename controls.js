// Get chart controls
const chartControls = data => {
	let callbackFn; // callback function
	const controls = {}; // initial controls state

	// Get array of checkboxes elements
	const checkboxes = data.columns.map(col => {
		const item = col[0]; // name of chart item

		// Working only with line
		if (data.types[item] === 'line') {
			controls[item] = true; // set initial state as true

			return (`<label class="checkbox" style="color: ${data.colors[item]};">
				<input class="checkbox__input" type="checkbox" name="${item}" checked="checked"/>
				<div class="checkbox__box">
					<div class="checkbox__box-mark"></div>
				</div>
				<p class="checkbox__text">${data.names[item]}</p>
			</label>`);
		}
	}).join('');

	// Handler checkbox click
	const checkboxClickHandler = e => {
		// Prevent all checkboxes of being unchecked
		if (document.querySelectorAll('[type="checkbox"]:checked').length === 1 && e.currentTarget.querySelector('input').checked) {
			e.preventDefault();
			return false;
		}

		callbackFn(e.target.name); // executing callback with clicked checkbox name
	};

	// Display checkboxes on page
	document.querySelector('.controls').insertAdjacentHTML('afterbegin', checkboxes);

	// Apply handlers to checkboxes
	Array.from(document.querySelectorAll('.checkbox')).map(checkbox => checkbox.addEventListener('click', checkboxClickHandler));

	return {
		// Initial controls state
		initialState: controls,
		// Subscribing to controls changes
		subscribe(callback) {
			// Assign callback function to inner variable
			callbackFn = callback;
		}
	};
};