// Constants
const SIZES = {
  WIDTH: 600,
  HEIGHT: 200
};
const DPI_SIZES = {
  WIDTH: SIZES.WIDTH * 2,
  HEIGHT: SIZES.HEIGHT * 2
};
const GRID_LINES = 5;
const PADDING = 40;
const VIEW_HEIGHT = DPI_SIZES.HEIGHT - PADDING * 2;
const THEME = {
  GRID_LINES: {
    WIDTH: 2,
    COLOR: '#CCCCCC'
  },
  TICKS: {
    FONT: 'normal 20px Helvetica, sans-serif',
    FILL: '#96A2AA'
  },
  LINE_PRIMARY: {
    WIDTH: 4,
    COLOR: '#2FBD2F'
  }
};

// Get min and max values
const getMinMax = data => {
  let min;
  let max;

  for (const [, Y] of data) {
    if (typeof min !== 'number') min = Y;
    if (typeof max !== 'number') max = Y;

    if (min > Y) min = Y;
    if (max < Y) max = Y;
  }

  return {
    MIN: min,
    MAX: max
  };
};

// Draw Y axis lines
const drawGrid = (ctx, data) => {
  const { MIN, MAX } = getMinMax(data);
  const STEP = VIEW_HEIGHT / GRID_LINES; // step between grid lines 
  const LABEL_STEP = (MAX - MIN) / GRID_LINES; // step between labels values

  ctx.beginPath();
  ctx.font = THEME.TICKS.FONT;
  ctx.fillStyle = THEME.TICKS.FILL;
  ctx.lineWidth = THEME.GRID_LINES.WIDTH;
  ctx.strokeStyle = THEME.GRID_LINES.COLOR;

  for (let i = 1; i <= GRID_LINES; i++) {
    const Y = STEP * i;
    const Y_CHART = Y + PADDING;
    const LABEL = MAX - LABEL_STEP * i;

    // Display grid labels
    ctx.fillText(LABEL, 5, Y_CHART - 10);
    // Draw frid line
    ctx.moveTo(0, Y_CHART);
    ctx.lineTo(DPI_SIZES.WIDTH, Y_CHART);
  }

  ctx.stroke();
  ctx.closePath();
}

// Initialize canvas
const chart = (canvas, data) => {
  const ctx = canvas.getContext('2d');
  const { MIN, MAX } = getMinMax(data);
  const RATIO = VIEW_HEIGHT / (MAX - MIN); // chart scale ratio
  
  // Set canvas element size
  canvas.style.width = SIZES.WIDTH + 'px';
  canvas.style.height = SIZES.HEIGHT + 'px';
  
  // Set canvas size
  canvas.width = DPI_SIZES.WIDTH;
  canvas.height = DPI_SIZES.HEIGHT;

  drawGrid(ctx, data);
  
  // Draw chart line
  ctx.beginPath();
  ctx.lineWidth = THEME.LINE_PRIMARY.WIDTH;
  ctx.strokeStyle = THEME.LINE_PRIMARY.COLOR;

  data.map(([x, y]) => {
    ctx.lineTo(x, DPI_SIZES.HEIGHT - y * RATIO - PADDING);
  });

  ctx.stroke();
  ctx.closePath();
};

chart(document.querySelector('#chart'), [
  [0, 0],
  [200, 250],
  [400, 320],
  [600, 270],
  [800, 300],
  [1000, 380],
  [1200, 350],
]);