// Initialize canvas chart
const chart = (canvas, data) => {
	let requestId;
  const ctx = canvas.getContext('2d');
  const { MIN, MAX } = getMinMax(data);
  const RATIO_Y = VIEW.HEIGHT / (MAX - MIN); // chart scale ratio by y axis
  const RATIO_X = VIEW.WIDTH / (data.columns[0].length - 2); // chart scale ratio by x axis
  const LINES_DATA = data.columns.filter(col => data.types[col[0]] === 'line'); // data to draw chart lines
  const X_DATA = data.columns.filter(col => data.types[col[0]] === 'x')[0]; // data to draw x ticks
	const proxy = new Proxy({}, {
		set(...args) {
			// Redraw whole chart
			requestId = requestAnimationFrame(draw, canvas);

			// Write values to object and return true if property was changed
			return Reflect.set(...args);
		}
	}); // proxying changes over mouse object

	// Draw position over chart elements
	const mouseMoveHandler = ({ clientX }) => {
		const { left } = canvas.getBoundingClientRect(); // canvas position relatively to the window

		// Set mouse X position relatively to canvas
		proxy.mouse = {
			x: (clientX - left) * 2
		};
	};

	// Remove position over chart elements (remove mouse X position)
	const mouseLeaveHandler = () => {
		proxy.mouse = null;
	};

	// Draw Y axis lines
	const drawGrid = () => {
		const STEP = VIEW.HEIGHT / GRID_LINES_AMOUNT; // step between grid lines 
		const LABEL_STEP = (MAX - MIN) / GRID_LINES_AMOUNT; // step between labels values

		ctx.beginPath();
		ctx.font = THEME.TICKS.FONT;
		ctx.fillStyle = THEME.TICKS.FILL;
		ctx.lineWidth = THEME.GRID_LINES.WIDTH;
		ctx.strokeStyle = THEME.GRID_LINES.COLOR;

		for (let i = 1; i <= GRID_LINES_AMOUNT; i++) {
			const Y = STEP * i + PADDING; // y coordinate for grid line
			const LABEL = Math.round(MAX - LABEL_STEP * i); // label text

			// Display grid labels
			ctx.fillText(LABEL, 5, Y - 10);
			// Draw grid line
			ctx.moveTo(0, Y);
			ctx.lineTo(DPI_SIZES.WIDTH, Y);
		}

		ctx.stroke();
		ctx.closePath();
	};

	// Draw elements for X axis (labels and position line)
	const drawXElements = (data) => {
		const STEP = Math.round(data.length / TICKS_AMOUNT); // step between labels

		ctx.beginPath();
		ctx.lineWidth = THEME.POINT_LINE.WIDTH;
		ctx.strokeStyle = THEME.POINT_LINE.COLOR;
		
		for (let i = 1; i < data.length; i++) {
			const X = i * RATIO_X; // scaled X axis coordinate

			// Draw labels
			if ((i - 1) % STEP === 0) {
				const LABEL = getDate(new Date(data[i])); // label text
			
				ctx.fillText(LABEL, X, DPI_SIZES.HEIGHT - 10);
			}

			// Draw position line
			if (isOver(proxy.mouse, X, data.length)) {
				// Save context state
				ctx.save();
				ctx.moveTo(X, PADDING / 2);
				ctx.lineTo(X, DPI_SIZES.HEIGHT - PADDING);
				// Load context state
				ctx.restore();
			}
		}

		ctx.stroke();
		ctx.closePath();
	};

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

	// Draw position point
	const drawChartPoint = (color, { x, y }) => {
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.fillStyle = '#FFFFFF';
		ctx.arc(x, y, THEME.POINT.RADIUS, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	};

	// Draw whole chart
	const draw = () => {
		erase();

		drawGrid();
		drawXElements(X_DATA.filter((_, i) => i !== 0));
	
		// Draw chart lines by coordinates
		LINES_DATA.map(getCoordinates(RATIO_X, RATIO_Y)).map((coords, i) => {
			const COLOR = data.colors[LINES_DATA[i][0]]; // current chart line and point color

			drawChartLine(coords, {
				color: COLOR
			});

			// Draw chart point if mouse is over coordinate
			coords.map(([x, y]) => {
				if (isOver(proxy.mouse, x, coords.length)) {
					drawChartPoint(COLOR, {x, y});
				}
			});
		});
	};

	// Clear whole canvas
	const erase = () => {
		ctx.clearRect(0, 0, DPI_SIZES.WIDTH, DPI_SIZES.HEIGHT);
	};
  
  // Set canvas element size
  canvas.style.width = SIZES.WIDTH + 'px';
  canvas.style.height = SIZES.HEIGHT + 'px';
  
  // Set canvas size
  canvas.width = DPI_SIZES.WIDTH;
  canvas.height = DPI_SIZES.HEIGHT;

	// Add handlers to mouse events
	canvas.addEventListener('mousemove', mouseMoveHandler);
	canvas.addEventListener('mouseleave', mouseLeaveHandler);

	return {
		// Initialize chart method
		init() {
			draw();
		},
		// Destroy chart method
		destroy() {
			// Cancel request for animation frame
			cancelAnimationFrame(requestId);
			// Remove handlers of mouse events
			canvas.removeEventListener('mousemove', mouseMoveHandler);
			canvas.removeEventListener('mouseleave', mouseLeaveHandler);
		}
	};
};