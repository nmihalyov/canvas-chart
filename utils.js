// Get formatted date
const getDate = date => new Intl.DateTimeFormat('en-US', {day: 'numeric', month: 'short'}).format(date);

// Check whether is mouse over coordinate
const isOver = (mouse, x, length) => {
	if (mouse) {
		const STEP = DPI_SIZES.WIDTH / length; // step between two X axis values

		// Return true if mouse is closer to x than to sibling value
		return Math.abs(x - mouse.x) < STEP / 2;
	}
};

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

// Get coordinates from data for drawing lines
const getCoordinates = (RATIO_X, RATIO_Y) => col => col.map((y, i) => [
  Math.round((i - 1) * RATIO_X),
  Math.round(DPI_SIZES.HEIGHT - y * RATIO_Y - PADDING)
]).filter((_, i) => i !== 0);