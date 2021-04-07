// Initialize canvas slider for chart
const chartSlider = (canvas, data) => {
	const ctx = canvas.getContext('2d');
	const { MIN, MAX } = getMinMax(data);
	const LINES_DATA = data.columns.filter(col => data.types[col[0]] === 'line'); // data to draw chart lines
	const RATIO_Y = SLIDER.DPI_HEIGHT / (MAX - MIN); // chart scale ratio by y axis
	const RATIO_X = DPI_SIZES.WIDTH / (data.columns[0].length - 2); // chart scale ratio by x axis
	const defaultWidth = SIZES.WIDTH * 0.3; // default window width
	const leftSpace = document.querySelector('[data-left]') // slider left space
	const rightSpace = document.querySelector('[data-right]') // slider right space
	const sliderWindow = document.querySelector('[data-el="window"]') // slider window
	const minWidth = SIZES.WIDTH * 0.05; // minimum slider window width

	// Draw chart line
	const drawChartLine = (coords, {color}) => {
		ctx.beginPath();
		ctx.lineWidth = THEME.LINE_WIDTH;
		ctx.strokeStyle = color;

		coords.map(([x, y]) => {
			ctx.lineTo(x, y);
		});

		ctx.stroke();
		ctx.closePath();
	};

	// Set positioning for slider window
	const setPosition = ({ left, right }) => {
		const width = SIZES.WIDTH - right - left; // window width

		// Set min width for window
		if (width < minWidth) {
			sliderWindow.style.width = minWidth + 'px';
			return;
		}

		// Set left limit for window
		if (left < 0) {
			sliderWindow.style.left = 0;
			leftSpace.style.width = 0;
			return;
		}
		
		// Set right limit for window
		if (right < 0) {
			sliderWindow.style.right = 0;
			rightSpace.style.width = 0;
			return;
		}

		// Set window position and width
		sliderWindow.style.cssText = `
			width: ${width}px;
			left: ${left}px;
			right: ${right}px;`;

		// Set left and right space off the window width
		leftSpace.style.width = left + 'px';
		rightSpace.style.width = right + 'px';
	};

	// Handling mouse down event on slider
	const mousedownHandler = e => {
		const type = e.target.dataset.el; // event element type
		const startX = e.pageX; // x coordinate from event start
		const properties = {
			left: parseInt(sliderWindow.style.left),
			right: parseInt(sliderWindow.style.right),
			width: parseInt(sliderWindow.style.width)
		}; // current window properties

		// Handling mouse move on slider
		document.onmousemove = e => {
			const delta = startX - e.pageX; // difference between start and current cursor position
			if (delta === 0) return; // do nothing if cursor x coordinate was not changed
			let left, right; // left and right window position relatively to slider

			// Set left and right position depending on event element type
			switch (type) {
				case 'window': {
					left = properties.left - delta;
					right = properties.right + delta;
					document.body.style.cursor = 'grabbing';
					break;
				}
				case 'left':
				case 'right': {
					if (type === 'left') {
						document.body.style.cursor = 'w-resize';
						left = SIZES.WIDTH - (properties.width + delta) - properties.right;
						right = properties.right;
					} else {
						document.body.style.cursor = 'e-resize';
						right = SIZES.WIDTH - (properties.width - delta) - properties.left;
						left = properties.left;
					}
					break;
				}
				default:
					break;
			};

			// Set new window position
			setPosition({left, right});
		}
	};

	// Handling mouse up event on slider
	const mouseupHandler = () => {
		document.body.style = '';
		document.onmousemove = null;
	};

	// Set canvas element size
	canvas.style.width = SIZES.WIDTH + 'px';
	canvas.style.height = SLIDER.HEIGHT + 'px';

	// Set canvas size
	canvas.width = DPI_SIZES.WIDTH;
	canvas.height = SLIDER.DPI_HEIGHT;

	// Draw chart lines by coordinates
	LINES_DATA.map(getCoordinates(RATIO_X, RATIO_Y, SLIDER.DPI_HEIGHT, -5)).map((coords, i) => {
		const COLOR = data.colors[LINES_DATA[i][0]]; // current chart line and point color

		drawChartLine(coords, {
			color: COLOR
		});
	});

	// Set default position
	setPosition({left: SIZES.WIDTH - defaultWidth, right: 0});

	// Add handlers to mouse events
	document.querySelector('.slider').addEventListener('mousedown', mousedownHandler);
	document.addEventListener('mouseup', mouseupHandler);
};