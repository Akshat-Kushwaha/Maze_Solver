document.addEventListener('DOMContentLoaded', function() {
    let mazeSize = 15;
    const mazeContainer = document.getElementById('maze');
    let currentTool = 'wall';
    let startPos = { x: 0, y: 1 };
    let endPos = { x: mazeSize - 1, y: mazeSize - 2 };
    let isSolving = false;
    
    
    const wallBtn = document.getElementById('wall-btn');
    const pathBtn = document.getElementById('path-btn');
    const startBtn = document.getElementById('start-btn');
    const endBtn = document.getElementById('end-btn');
    const clearBtn = document.getElementById('clear-btn');
    const solveBtn = document.getElementById('solve-btn');
    const resetBotBtn = document.getElementById('reset-bot-btn');
    const currentToolSpan = document.getElementById('current-tool');
    const mazeStatusSpan = document.getElementById('maze-status');
    const mazeSizeSelect = document.getElementById('maze-size');
    const applySizeBtn = document.getElementById('apply-size-btn');
    
    // Function to create maze grid
    function createMazeGrid(size) {
        mazeContainer.innerHTML = '';
        let maze = [];
        
        for (let y = 0; y < size; y++) {
            maze[y] = [];
            const row = document.createElement('div');
            row.className = 'row';
            
            for (let x = 0; x < size; x++) {
                maze[y][x] = 'wall';
                
                const cell = document.createElement('div');
                cell.className = 'cell wall';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                cell.addEventListener('click', function() {
                    handleCellClick(x, y);
                });
                
                row.appendChild(cell);
            }
            mazeContainer.appendChild(row);
        }
        
        return maze;
    }
    
    // Initialize maze
    let maze = createMazeGrid(mazeSize);
    
    // Set initial start and end positions
    updateCell(startPos.x, startPos.y, 'start');
    updateCell(endPos.x, endPos.y, 'end');
    
    // Create a simple path from start to end for initial demo
    createInitialPath();
    
    // Handle maze size change
    applySizeBtn.addEventListener('click', function() {
        if (isSolving) {
            alert('Please wait for the current solution to complete.');
            return;
        }
        
        if (confirm('Changing maze size will clear the current maze. Continue?')) {
            const newSize = parseInt(mazeSizeSelect.value);
            mazeSize = newSize;
            startPos = { x: 0, y: 1 };
            endPos = { x: mazeSize - 1, y: mazeSize - 2 };
            
            // Reset bot
            resetBot();
            
            // Create new maze
            maze = createMazeGrid(mazeSize);
            
            // Set new start and end positions
            updateCell(startPos.x, startPos.y, 'start');
            updateCell(endPos.x, endPos.y, 'end');
            
            // Create initial path
            createInitialPath();
            
            updateStatus('Maze size changed to ' + mazeSize + 'x' + mazeSize);
        }
    });
    
    // Update status bar
    function updateStatus(message) {
        mazeStatusSpan.textContent = `Status: ${message}`;
    }
    
    // Update current tool display
    function updateToolDisplay() {
        currentToolSpan.textContent = `Current Tool: ${currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}`;
    }
    
    // Button event listeners
    wallBtn.addEventListener('click', function() {
        setCurrentTool('wall');
    });
    
    pathBtn.addEventListener('click', function() {
        setCurrentTool('path');
    });
    
    startBtn.addEventListener('click', function() {
        setCurrentTool('start');
    });
    
    endBtn.addEventListener('click', function() {
        setCurrentTool('end');
    });
    
    function setCurrentTool(tool) {
        currentTool = tool;
        wallBtn.classList.remove('active');
        pathBtn.classList.remove('active');
        startBtn.classList.remove('active');
        endBtn.classList.remove('active');
        
        switch(tool) {
            case 'wall':
                wallBtn.classList.add('active');
                break;
            case 'path':
                pathBtn.classList.add('active');
                break;
            case 'start':
                startBtn.classList.add('active');
                break;
            case 'end':
                endBtn.classList.add('active');
                break;
        }
        updateToolDisplay();
    }
    
    clearBtn.addEventListener('click', function() {
        if (confirm('Clear the entire maze?')) {
            for (let y = 0; y < mazeSize; y++) {
                for (let x = 0; x < mazeSize; x++) {
                    updateCell(x, y, 'wall');
                }
            }
            updateCell(startPos.x, startPos.y, 'start');
            updateCell(endPos.x, endPos.y, 'end');
            resetBot();
            updateStatus('Maze cleared');
        }
    });
    
    solveBtn.addEventListener('click', function() {
        if (!isSolving) {
            solveMaze();
        }
    });
    
    resetBotBtn.addEventListener('click', resetBot);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (isSolving) return;
        
        switch(e.key.toLowerCase()) {
            case 'w':
                setCurrentTool('wall');
                break;
            case 'p':
                setCurrentTool('path');
                break;
            case 's':
                setCurrentTool('start');
                break;
            case 'e':
                setCurrentTool('end');
                break;
            case ' ':
                if (!isSolving) solveMaze();
                break;
            case 'r':
                resetBot();
                break;
            case 'c':
                clearBtn.click();
                break;
        }
    });
    
    function handleCellClick(x, y) {
        if (isSolving) return;
        
        if (currentTool === 'wall') {
            if (!isStartOrEnd(x, y)) {
                updateCell(x, y, 'wall');
            }
        } else if (currentTool === 'path') {
            if (!isStartOrEnd(x, y)) {
                updateCell(x, y, 'path');
            }
        } else if (currentTool === 'start') {
            if (maze[y][x] === 'path') {
                updateCell(startPos.x, startPos.y, 'path');
                startPos = { x, y };
                updateCell(x, y, 'start');
                resetBot();
            }
        } else if (currentTool === 'end') {
            if (maze[y][x] === 'path') {
                updateCell(endPos.x, endPos.y, 'path');
                endPos = { x, y };
                updateCell(x, y, 'end');
            }
        }
    }
    
    function updateCell(x, y, type) {
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        cell.className = 'cell ' + type;
        maze[y][x] = type;
    }
    
    function isStartOrEnd(x, y) {
        return (x === startPos.x && y === startPos.y) || 
                (x === endPos.x && y === endPos.y);
    }
    
    function createInitialPath() {
        // Horizontal path from start
        for (let x = 0; x < 5; x++) {
            updateCell(x, 1, 'path');
        }
        
        // Vertical path down
        for (let y = 1; y < mazeSize - 1; y++) {
            updateCell(4, y, 'path');
        }
        
        // Horizontal path to end
        for (let x = 4; x < mazeSize; x++) {
            updateCell(x, mazeSize - 2, 'path');
        }
    }
    
    function resetBot() {
        const bot = document.getElementById('maze-bot');
        const cellSize = 30;
        bot.style.display = 'none';
        bot.style.setProperty('--x', `${startPos.x * cellSize + 2}px`);
        bot.style.setProperty('--y', `${startPos.y * cellSize + 2}px`);
        bot.classList.remove('facing-right', 'facing-left', 'facing-up', 'facing-down');
        resetBotBtn.disabled = true;
        isSolving = false;
        updateStatus('Ready');
    }
    
    function solveMaze() {
        isSolving = true;
        updateStatus('Solving...');
        resetBotBtn.disabled = false;
        
        // Reset all cells to their original state
        for (let y = 0; y < mazeSize; y++) {
            for (let x = 0; x < mazeSize; x++) {
                const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                if (maze[y][x] === 'solution') {
                    cell.className = 'cell path';
                    maze[y][x] = 'path';
                }
            }
        }
        
        // Get bot element and make it visible
        const bot = document.getElementById('maze-bot');
        bot.style.display = 'block';
        
        // Simple pathfinding algorithm (Breadth-First Search)
        const visited = Array(mazeSize).fill().map(() => Array(mazeSize).fill(false));
        const queue = [];
        const parent = Array(mazeSize).fill().map(() => Array(mazeSize).fill(null));
        
        queue.push({ x: startPos.x, y: startPos.y });
        visited[startPos.y][startPos.x] = true;
        
        const directions = [
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },   // down
            { dx: -1, dy: 0 },  // left
            { dx: 0, dy: -1 }   // up
        ];
        
        let found = false;
        
        while (queue.length > 0 && !found) {
            const current = queue.shift();
            
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                
                if (nx >= 0 && nx < mazeSize && ny >= 0 && ny < mazeSize && 
                    !visited[ny][nx] && (maze[ny][nx] === 'path' || (nx === endPos.x && ny === endPos.y))) {
                    visited[ny][nx] = true;
                    parent[ny][nx] = current;
                    queue.push({ x: nx, y: ny });
                    
                    if (nx === endPos.x && ny === endPos.y) {
                        found = true;
                        break;
                    }
                }
            }
        }
        
        if (found) {
            // Reconstruct path and store it
            const path = [];
            let current = { x: endPos.x, y: endPos.y };
            
            while (parent[current.y][current.x] !== null) {
                path.unshift({...current});
                current = parent[current.y][current.x];
            }
            path.unshift({...current});
            
            // Highlight the path (excluding start and end)
            for (let i = 1; i < path.length - 1; i++) {
                updateCell(path[i].x, path[i].y, 'solution');
                maze[path[i].y][path[i].x] = 'solution';
            }
            
            // Set initial bot position
            const cellSize = 30;
            bot.style.setProperty('--x', `${startPos.x * cellSize + 2}px`);
            bot.style.setProperty('--y', `${startPos.y * cellSize + 2}px`);
            let step = 0;
            
            // Function to animate bot movement
            function moveBot() {
                if (step >= path.length - 1) {
                    updateStatus('Solution found! Bot reached the end.');
                    return;
                }
                
                const currentPos = path[step];
                const nextPos = path[step + 1];
                
                // Calculate direction for facing
                const dy = nextPos.x - currentPos.x;
                const dx = nextPos.y - currentPos.y;
                
                // Remove previous direction classes
                bot.classList.remove('facing-right', 'facing-left', 'facing-up', 'facing-down');
                
                // Add appropriate direction class
                if (dx === -1) {
                    bot.classList.add('facing-right');
                } else if (dx === 1) {
                    bot.classList.add('facing-left');
                } else if (dy === 1) {
                    bot.classList.add('facing-down');
                } else if (dy === -1) {
                    bot.classList.add('facing-up');
                }
                
                // Update position using CSS variables
                bot.style.setProperty('--x', `${nextPos.x * cellSize + 2}px`);
                bot.style.setProperty('--y', `${nextPos.y * cellSize + 2}px`);
                
                step++;
                setTimeout(moveBot, 300);
            }
            
            // Start bot movement
            moveBot();
        } else {
            updateStatus('No solution found!');
            isSolving = false;
            resetBotBtn.disabled = true;
        }
    }
});
