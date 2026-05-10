# Implementation Notes

## Coordinate System

This codebase uses an unusual coordinate system that can be confusing:

- **xPos**: Represents the ROW index in the map array (first dimension)
- **yPos**: Represents the COLUMN index in the map array (second dimension)
- **map access**: `map[xPos][yPos]` or `map[row][column]`

This is opposite to typical conventions where X usually represents columns and Y represents rows.

### Examples:
- `camera.xPos, camera.yPos` = (row, column) in the map
- `furthestCoordX, furthestCoordY` = (column, row) in the map
- When `camera.update()` returns `[xPos, yPos]`, it returns `[row, column]`

This coordinate system is preserved from the original Java implementation to maintain compatibility.
