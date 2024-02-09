import React from 'react';
import { Select, FormControl, MenuItem, Box } from '@mui/material';

function SortGifs({ setSortCriteria, sortCriteria }) {
  return (
    <Box className="sort-selection">
      <FormControl>
        <Select
          labelId="sort-by-label"
          id="sort-by-select"
          value={sortCriteria}
          label="Sort By"
          onChange={(e) => setSortCriteria(e.target.value)}
        >
          <MenuItem value="alphabetical">Alphabetical</MenuItem>
          <MenuItem value="clickCount">Click Count</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default SortGifs;
