// Initialize canvas slider for chart
const chartSlider = (canvas, data) => {
	const ctx = canvas.getContext('2d');
	const { MIN, MAX } = getMinMax(data);
	const LINES_DATA = data.columns.filter(col => data.types[col[0]] === 'line'); // data to draw chart lines
	const RATIO_Y = SLIDER.DPI_HEIGHT / (MAX - MIN); // chart scale ratio by y axis
	const RATIO_X = DPI_SIZES.WIDTH / (data.columns[0].length - 2); // chart scale ratio by x axis

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
};