// Constants
const SIZES = {
  WIDTH: 800,
  HEIGHT: 200
};
const DPI_SIZES = {
  WIDTH: SIZES.WIDTH * 2,
  HEIGHT: SIZES.HEIGHT * 2
};
const GRID_LINES_AMOUNT = 5;
const TICKS_AMOUNT = 6;
const PADDING = 40;
const VIEW = {
  WIDTH: DPI_SIZES.WIDTH,
  HEIGHT: DPI_SIZES.HEIGHT - PADDING * 2
};
const THEME = {
  GRID_LINES: {
    WIDTH: 1,
    COLOR: '#CCCCCC'
  },
	POINT_LINE: {
		WIDTH: 2,
		COLOR: '#DDDDDD'	
	},
  TICKS: {
    FONT: 'normal 20px Helvetica, sans-serif',
    FILL: '#96A2AA'
  },
  LINE_WIDTH: 4,
	POINT: {
		RADIUS: 6
	}
};

// Fetch data from JSON file
const getData = async url => {
  const res = await fetch(url);
  return await res.json();
};

// Get formatted date
const getDate = date => new Intl.DateTimeFormat('en-US', {day: 'numeric', month: 'short'}).format(date);

// Get min and max values
const getMinMax = ({ columns, types }) => {
  let min;
  let max;

  columns.map(col => {
    // Get values only from lines
    if (types[col[0]] === 'line') {
      if (typeof min !== 'number') min = col[1];
      if (typeof max !== 'number') max = col[1];

      if (min > col[1]) min = col[1];
      if (max < col[1]) max = col[1];
      
      for (let i = 2; i < col.length; i++) {
        if (min > col[i]) min = col[i];
        if (max < col[i]) max = col[i];
      }
    }
  });

  return {
    MIN: min,
    MAX: max
  };
};

// Draw Y axis lines
const drawGrid = (ctx, { MIN, MAX }) => {
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
}

// Draw elements for X axis (labels and position line)
const drawXElements = (ctx, data, RATIO_X, { mouse }) => {
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
		if (isOver(mouse, X, data.length)) {
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
const drawChartLine = (ctx, coords, {color}) => {
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
const drawChartPoint = (ctx, color, { x, y }) => {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.fillStyle = '#FFFFFF';
	ctx.arc(x, y, THEME.POINT.RADIUS, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

// Get coordinates from data for drawing lines
const getCoordinates = (RATIO_X, RATIO_Y) => col => col.map((y, i) => [
  Math.round((i - 1) * RATIO_X),
  Math.round(DPI_SIZES.HEIGHT - y * RATIO_Y - PADDING)
]).filter((_, i) => i !== 0);

// Check whether is mouse over coordinate
const isOver = (mouse, x, length) => {
	if (mouse) {
		const STEP = DPI_SIZES.WIDTH / length; // step between two X axis values

		// Return true if mouse is closer to x than to sibling value
		return Math.abs(x - mouse.x) < STEP / 2;
	}
};

// Initialize canvas chart
const chart = (canvas, data) => {
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

	// Draw whole chart
	const draw = () => {
		erase();

		drawGrid(ctx, {MIN, MAX});
		drawXElements(ctx, X_DATA.filter((_, i) => i !== 0), RATIO_X, proxy);
	
		// Draw chart lines by coordinates
		LINES_DATA.map(getCoordinates(RATIO_X, RATIO_Y)).map((coords, i) => {
			const COLOR = data.colors[LINES_DATA[i][0]]; // current chart line and point color

			drawChartLine(ctx, coords, {
				color: COLOR
			});

			// Draw chart point if mouse is over coordinate
			coords.map(([x, y]) => {
				if (isOver(proxy.mouse, x, coords.length)) {
					drawChartPoint(ctx, COLOR, {x, y});
				}
			});
		});
	};

	// Clear whole canvas
	const erase = () => {
		ctx.clearRect(0, 0, DPI_SIZES.WIDTH, DPI_SIZES.HEIGHT);
	};

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

// Execute drawing chart
getData('data.json').then(data => {
  const chartElement = chart(document.querySelector('#chart'), data);

	chartElement.init();
});