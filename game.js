//TODO: fix render issue causing infinite loop hang softlock

// Game constants
const MAP_WIDTH = 24;
const MAP_HEIGHT = 24;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

// Game state
let game = {
    verbosity: 0,
    additiveCollapse: true,
    found: false,
    running: false,
    map: null,
    furthestCoordX: 4,
    furthestCoordY: 4,
    escapeX: 4,
    escapeY: 4,
    sanity: 1200, // 60 * 20
    maxSanity: 1200,
    health: 100,
    ticker: 0
};

// Camera
let camera = {
    xPos: 4.5,
    yPos: 4.5,
    xDir: 1,
    yDir: 0,
    xPlane: 0,
    yPlane: -0.66,
    left: false,
    right: false,
    forward: false,
    back: false,
    MOVE_SPEED: 0.08,
    ROTATION_SPEED: 0.045
};

// Textures
let textures = [];
let texturesLoaded = 0;

// Canvas context
let canvas;
let ctx;
let imageData;
let pixels;

// Console output
let consoleElement;

function log(message) {
    if (!consoleElement) return;
    const line = document.createElement('div');
    line.className = 'console-line';
    line.textContent = message;
    consoleElement.appendChild(line);
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

function loadTextures(callback) {
    const textureNames = ['nobooty', 'fewbooty', 'somebooty', 'muchbooty', 'booty', 'exit'];
    const totalTextures = textureNames.length;
    
    textureNames.forEach((name, index) => {
        const img = new Image();
        img.onload = function() {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 64;
            tempCanvas.height = 64;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            const imgData = tempCtx.getImageData(0, 0, 64, 64);
            const pixels = new Int32Array(imgData.data.buffer);
            textures[index] = { pixels: pixels, SIZE: 64 };
            
            texturesLoaded++;
            if (texturesLoaded === totalTextures) {
                callback();
            }
        };
        img.onerror = function() {
            console.error('Failed to load texture: ' + name);
            // Create a fallback texture with solid color
            const pixels = new Int32Array(64 * 64);
            const colors = [0x808080, 0x404040, 0x606060, 0x202020, 0xFFFF00, 0x00FF00];
            pixels.fill(colors[index] || 0x808080);
            textures[index] = { pixels: pixels, SIZE: 64 };
            
            texturesLoaded++;
            if (texturesLoaded === totalTextures) {
                callback();
            }
        };
        img.src = 'textures/' + name + '.png';
    });
}

function mapGenerator(ensureX, ensureY) {
    let currX = ensureX;
    let currY = ensureY;
    
    const mtrt = Array(MAP_HEIGHT + 1).fill(null).map(() => Array(MAP_WIDTH + 1).fill(1));
    
    let badBooty = false;
    
    for (let i = 1; i < Math.random() * 200 + 300; i++) {
        if (currY > MAP_HEIGHT - 1) currY = 4;
        if (currY < 1) currY = 4;
        if (currX > MAP_WIDTH - 1) currX = 4;
        if (currX < 1) currX = 4;
        
        if ((currY - 4) + (currX - 4) > (game.furthestCoordX - 4) + (game.furthestCoordY - 4)) {
            game.furthestCoordX = currX;
            game.furthestCoordY = currY;
        }
        
        mtrt[currY][currX] = 0;
        
        const rng = Math.random();
        if (rng < 0.25) {
            currY++;
            mtrt[currY][currX] = 0;
            currY++;
        } else if (rng < 0.5) {
            currY--;
            mtrt[currY][currX] = 0;
            currY--;
        } else if (rng < 0.75) {
            currX++;
            mtrt[currY][currX] = 0;
            currX++;
        } else {
            currX--;
            mtrt[currY][currX] = 0;
            currX--;
        }
        
        try {
            if (!badBooty) {
                if (Math.random() < 0.02) {
                    badBooty = true;
                    if (currX < MAP_WIDTH / 2) {
                        if (game.verbosity <= 1) log("ACCEPT");
                        for (let z = currX; z >= 0; z--) {
                            mtrt[currY][z] = 0;
                        }
                    } else if (currX >= MAP_WIDTH / 2) {
                        if (game.verbosity <= 1) log("REPENT");
                        for (let z = currX; z <= MAP_WIDTH + 1; z++) {
                            mtrt[currY][z] = 0;
                        }
                    } else if (currY < MAP_HEIGHT / 2) {
                        if (game.verbosity <= 1) log("LIKEWISE");
                        for (let z = currY; z >= 0; z--) {
                            mtrt[z][currX] = 0;
                        }
                    } else {
                        if (game.verbosity <= 1) log("PERISH");
                        for (let z = currY; z <= MAP_HEIGHT; z++) {
                            mtrt[z][currX] = 0;
                        }
                    }
                }
            }
        } catch (e) {
            return mapGenerator(ensureX, ensureY);
        }
    }
    
    mtrt[5][5] = 0;
    mtrt[5][4] = 0;
    mtrt[3][4] = 0;
    mtrt[4][3] = 0;
    mtrt[3][3] = 0;
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (Math.random() < 0.15) {
                mtrt[y][x] = 0;
            }
            if (mtrt[y][x] === 0) continue;
            
            const dist = Math.sqrt(Math.pow(Math.abs(x - game.furthestCoordX), 2) + 
                                  Math.pow(Math.abs(y - game.furthestCoordY), 2));
            if (dist < 2) {
                mtrt[y][x] = 3;
            } else if (dist < 4) {
                mtrt[y][x] = 2;
            }
        }
    }
    
    // Set yellow checkered pattern around target
    const checks = [
        [0, 1], [1, 1], [1, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1], [1, -1]
    ];
    checks.forEach(([dy, dx]) => {
        const ny = game.furthestCoordY + dy;
        const nx = game.furthestCoordX + dx;
        if (mtrt[ny] && mtrt[ny][nx] !== 0) {
            mtrt[ny][nx] = 4;
        }
    });
    
    mtrt[game.furthestCoordY][game.furthestCoordX] = 5;
    mtrt[4][5] = 6;
    
    if (game.verbosity <= 0) {
        for (let row of mtrt) {
            log(row.join(', '));
        }
    }
    
    return mtrt;
}

function updateCamera() {
    if (camera.forward) {
        const newX = Math.floor(camera.xPos + camera.xDir * camera.MOVE_SPEED);
        const newY = Math.floor(camera.yPos);
        if (game.map[newX] && game.map[newX][newY] === 0) {
            camera.xPos += camera.xDir * camera.MOVE_SPEED;
        }
        
        const newX2 = Math.floor(camera.xPos);
        const newY2 = Math.floor(camera.yPos + camera.yDir * camera.MOVE_SPEED);
        if (game.map[newX2] && game.map[newX2][newY2] === 0) {
            camera.yPos += camera.yDir * camera.MOVE_SPEED;
        }
    }
    
    if (camera.back) {
        const newX = Math.floor(camera.xPos - camera.xDir * camera.MOVE_SPEED);
        const newY = Math.floor(camera.yPos);
        if (game.map[newX] && game.map[newX][newY] === 0) {
            camera.xPos -= camera.xDir * camera.MOVE_SPEED;
        }
        
        const newX2 = Math.floor(camera.xPos);
        const newY2 = Math.floor(camera.yPos - camera.yDir * camera.MOVE_SPEED);
        if (game.map[newX2] && game.map[newX2][newY2] === 0) {
            camera.yPos -= camera.yDir * camera.MOVE_SPEED;
        }
    }
    
    if (camera.right) {
        const oldxDir = camera.xDir;
        camera.xDir = camera.xDir * Math.cos(-camera.ROTATION_SPEED) - camera.yDir * Math.sin(-camera.ROTATION_SPEED);
        camera.yDir = oldxDir * Math.sin(-camera.ROTATION_SPEED) + camera.yDir * Math.cos(-camera.ROTATION_SPEED);
        const oldxPlane = camera.xPlane;
        camera.xPlane = camera.xPlane * Math.cos(-camera.ROTATION_SPEED) - camera.yPlane * Math.sin(-camera.ROTATION_SPEED);
        camera.yPlane = oldxPlane * Math.sin(-camera.ROTATION_SPEED) + camera.yPlane * Math.cos(-camera.ROTATION_SPEED);
    }
    
    if (camera.left) {
        const oldxDir = camera.xDir;
        camera.xDir = camera.xDir * Math.cos(camera.ROTATION_SPEED) - camera.yDir * Math.sin(camera.ROTATION_SPEED);
        camera.yDir = oldxDir * Math.sin(camera.ROTATION_SPEED) + camera.yDir * Math.cos(camera.ROTATION_SPEED);
        const oldxPlane = camera.xPlane;
        camera.xPlane = camera.xPlane * Math.cos(camera.ROTATION_SPEED) - camera.yPlane * Math.sin(camera.ROTATION_SPEED);
        camera.yPlane = oldxPlane * Math.sin(camera.ROTATION_SPEED) + camera.yPlane * Math.cos(camera.ROTATION_SPEED);
    }
    
    return [camera.xPos, camera.yPos];
}

function render() {
    const data = imageData.data;
    
    // Draw ceiling (dark gray)
    for (let i = 0; i < data.length / 2; i += 4) {
        data[i] = 64;     // R
        data[i + 1] = 64; // G
        data[i + 2] = 64; // B
        data[i + 3] = 255; // A
    }
    
    // Draw floor (gray)
    for (let i = data.length / 2; i < data.length; i += 4) {
        data[i] = 128;     // R
        data[i + 1] = 128; // G
        data[i + 2] = 128; // B
        data[i + 3] = 255; // A
    }
    
    // Raycasting
    for (let x = 0; x < CANVAS_WIDTH; x++) {
        const cameraX = 2 * x / CANVAS_WIDTH - 1;
        const rayDirX = camera.xDir + camera.xPlane * cameraX;
        const rayDirY = camera.yDir + camera.yPlane * cameraX;
        
        let mapX = Math.floor(camera.xPos);
        let mapY = Math.floor(camera.yPos);
        
        const deltaDistX = Math.sqrt(1 + (rayDirY * rayDirY) / (rayDirX * rayDirX));
        const deltaDistY = Math.sqrt(1 + (rayDirX * rayDirX) / (rayDirY * rayDirY));
        
        let sideDistX, sideDistY, stepX, stepY;
        
        if (rayDirX < 0) {
            stepX = -1;
            sideDistX = (camera.xPos - mapX) * deltaDistX;
        } else {
            stepX = 1;
            sideDistX = (mapX + 1.0 - camera.xPos) * deltaDistX;
        }
        
        if (rayDirY < 0) {
            stepY = -1;
            sideDistY = (camera.yPos - mapY) * deltaDistY;
        } else {
            stepY = 1;
            sideDistY = (mapY + 1.0 - camera.yPos) * deltaDistY;
        }
        
        let hit = false;
        let side = 0;
        
        for (let i=0;i<3;i++) {
            if (hit) {break;}
            if (sideDistX < sideDistY) {
                sideDistX += deltaDistX;
                mapX += stepX;
                side = 0;
            } else {
                sideDistY += deltaDistY;
                mapY += stepY;
                side = 1;
            }
            if (game.map[mapX] && game.map[mapX][mapY] > 0) {
                hit = true;
            }
        }
        
        let perpWallDist;
        if (side === 0) {
            perpWallDist = Math.abs((mapX - camera.xPos + (1 - stepX) / 2) / rayDirX);
        } else {
            perpWallDist = Math.abs((mapY - camera.yPos + (1 - stepY) / 2) / rayDirY);
        }
        
        let lineHeight = Math.abs(Math.floor(CANVAS_HEIGHT / perpWallDist));
        
        let drawStart = -lineHeight / 2 + CANVAS_HEIGHT / 2;
        if (drawStart < 0) drawStart = 0;
        let drawEnd = lineHeight / 2 + CANVAS_HEIGHT / 2;
        if (drawEnd >= CANVAS_HEIGHT) drawEnd = CANVAS_HEIGHT - 1;
        
        const texNum = game.map[mapX][mapY] - 1 || 0;
        
        let wallX;
        if (side === 1) {
            wallX = camera.xPos + ((mapY - camera.yPos + (1 - stepY) / 2) / rayDirY) * rayDirX;
        } else {
            wallX = camera.yPos + ((mapX - camera.xPos + (1 - stepX) / 2) / rayDirX) * rayDirY;
        }
        wallX -= Math.floor(wallX);
        
        let texX = Math.floor(wallX * textures[texNum].SIZE);
        if (side === 0 && rayDirX > 0) texX = textures[texNum].SIZE - texX - 1;
        if (side === 1 && rayDirY < 0) texX = textures[texNum].SIZE - texX - 1;
        
        for (let y = Math.floor(drawStart); y < Math.floor(drawEnd); y++) {
            const texY = Math.floor((((y * 2 - CANVAS_HEIGHT + lineHeight) << 6) / lineHeight) / 2);
            const texIndex = texX + (texY * textures[texNum].SIZE);
            let color = textures[texNum].pixels[texIndex];
            
            if (side === 1) {
                // Make y-sides darker
                const r = (color >> 16) & 0xFF;
                const g = (color >> 8) & 0xFF;
                const b = color & 0xFF;
                color = ((r >> 1) << 16) | ((g >> 1) << 8) | (b >> 1);
            }
            
            const pixelIndex = (x + y * CANVAS_WIDTH) * 4;
            data[pixelIndex] = (color >> 16) & 0xFF;     // R
            data[pixelIndex + 1] = (color >> 8) & 0xFF;  // G
            data[pixelIndex + 2] = color & 0xFF;         // B
            data[pixelIndex + 3] = 255;                  // A
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

function gameLoop() {
    if (!game.running) return;
    
    try {
        // Handle sanity
        if (game.sanity === 0) {
            if (game.found) {
                game.health -= 7;
                if (game.health < 0) {
                    for (let i = 0; i < 100; i++) {
                        log("WRATH");
                    }
                    alert("WRATH - You died!");
                    location.reload();
                    return;
                }
            } else {
                if (game.verbosity <= 2) log("RECLAMATION");
                const cpos = updateCamera();
                game.map = mapGenerator(Math.floor(cpos[0]), Math.floor(cpos[1]));
                game.sanity = game.maxSanity;
            }
        }
        render();
        const cpos = updateCamera();
        
        // Check if found Djibouti
        if (!game.found) {
            const dist = Math.sqrt(
                Math.pow(Math.abs(cpos[1] - game.furthestCoordX), 2) +
                Math.pow(Math.abs(cpos[0] - game.furthestCoordY), 2)
            );
            if (dist < 2) {
                if (game.verbosity <= 2) log("SHEPHERD");
                game.map[game.furthestCoordY][game.furthestCoordX] = 0;
                game.found = true;
            }
        } else {
            // Check if escaped
            const dist = Math.sqrt(
                Math.pow(Math.abs(cpos[1] - game.escapeX), 2) +
                Math.pow(Math.abs(cpos[0] - game.escapeY), 2)
            );
            if (dist < 2) {
                log("ESCAPE");
                alert("ESCAPE - You won!");
                location.reload();
                return;
            }
        }
        
        // Handle map collapse after finding Djibouti
        if (game.found) {
            if (game.ticker >= 30) {
                game.ticker = 0;
                let ytr = Math.floor(Math.random() * MAP_HEIGHT);
                let xtr = Math.floor(Math.random() * MAP_WIDTH);
                while (ytr === Math.floor(cpos[1])) {
                    ytr = Math.floor(Math.random() * MAP_HEIGHT);
                }
                while (xtr === Math.floor(cpos[0])) {
                    xtr = Math.floor(Math.random() * MAP_WIDTH);
                }
                game.map[ytr][xtr] = game.additiveCollapse ? 1 : 0;
                if (game.verbosity <= 1) {
                    log("COLLAPSE: " + xtr + ", " + ytr);
                }
            } else {
                game.ticker++;
            }
        }
    } catch (e) {
        game.sanity -= 30;
        if (game.sanity < 0) game.sanity = 0;
        if (game.verbosity <= 2) {
            log("SEENOEVIL" + game.sanity);
            log(e);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function startGame() {
    // Get settings
    const verbosityInput = document.querySelector('input[name="verbosity"]:checked');
    const collapseInput = document.querySelector('input[name="collapse"]:checked');
    
    game.verbosity = parseInt(verbosityInput.value);
    game.additiveCollapse = collapseInput.value === 'true';
    
    if (game.verbosity >= 3) {
        log("\nTHE ONE EYED MAN IS KING\n");
    }
    
    log("\n\n\n\n\nAND SO IT BEGINS");
    
    // Hide setup, show game
    document.getElementById('setupScreen').classList.add('hidden');
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('console').style.display = game.verbosity < 3 ? 'block' : 'none';
    document.getElementById('controls').style.display = 'block';
    
    // Initialize canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Initialize console
    consoleElement = document.getElementById('console');
    
    // Load textures and start game
    loadTextures(() => {
        game.map = mapGenerator(4, 4);
        game.running = true;
        gameLoop();
    });
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!game.running) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            camera.left = true;
            e.preventDefault();
            break;
        case 'ArrowRight':
            camera.right = true;
            e.preventDefault();
            break;
        case 'ArrowUp':
            camera.forward = true;
            e.preventDefault();
            break;
        case 'ArrowDown':
            camera.back = true;
            e.preventDefault();
            break;
        case 'Escape':
            if (confirm('Restart game?')) {
                location.reload();
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (!game.running) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            camera.left = false;
            break;
        case 'ArrowRight':
            camera.right = false;
            break;
        case 'ArrowUp':
            camera.forward = false;
            break;
        case 'ArrowDown':
            camera.back = false;
            break;
    }
});
