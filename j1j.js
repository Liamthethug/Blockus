// j1j.js
document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const piecesContainer = document.getElementById('pieces');
    const rotateButton = document.getElementById('rotate-button');
    const boardSize = 20;
    const players = ['player1', 'player2', 'player3', 'player4'];
    let currentPlayerIndex = 0;
    let initialPlacement = true;
    let playerCount = 2;
    const playerScores = [0, 0, 0, 0];
    const playerCanPlay = [true, true, true, true];
    let selectedPiece = null;
    let selectedPieceRotation = 0;
    const usedPieces = [[], [], [], []];

    const piecesBlokusMatrices = {
        "monomino": [
            [
                [1]
            ]
        ],
        "domino": [
            [
                [1, 1]
            ]
        ],
        "tromino": [
            [
                [1, 1, 1]
            ],
            [
                [1, 0],
                [1, 1]
            ]
        ],
        "tetromino": [
            [
                [1, 1, 1, 1]
            ],
            [
                [1, 1],
                [1, 1]
            ],
            [
                [1, 0, 0],
                [1, 1, 1]
            ],
            [
                [0, 0, 1],
                [1, 1, 1]
            ],
            [
                [1, 1, 0],
                [0, 1, 1]
            ],
            [
                [0, 1, 1],
                [1, 1, 0]
            ]
        ],
        "pentomino": [
            [
                [1, 1, 1, 1, 1]
            ],
            [
                [1, 0, 0, 0],
                [1, 1, 1, 1]
            ],
            [
                [0, 0, 0, 1],
                [1, 1, 1, 1]
            ],
            [
                [1, 1, 0, 0],
                [0, 1, 1, 1]
            ],
            [
                [0, 0, 1, 1],
                [1, 1, 1, 0]
            ],
            [
                [1],
                [1],
                [1],
                [1],
                [1]
            ],
            [
                [1, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 1],
                [1, 1],
                [1, 0]
            ],
            [
                [1, 1, 1],
                [0, 1, 0]
            ],
            [
                [0, 1, 0],
                [1, 1, 1]
            ],
            [
                [1, 1, 0],
                [0, 1, 1]
            ],
            [
                [1, 1, 1],
                [1, 0, 0]
            ],
            [
                [1, 1],
                [0, 1],
                [0, 1]
            ]
        ]
    };

    // Ask for the number of players
    while (true) {
        playerCount = parseInt(prompt("Combien de joueurs (2 à 4) ?"), 10);
        if (playerCount >= 2 && playerCount <= 4) {
            break;
        }
        alert("Veuillez entrer un nombre entre 2 et 4.");
    }

    // Initialize the game board
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => handleCellClick(cell, i));
        gameBoard.appendChild(cell);
    }

    // Initialize the piece selection
    function updatePieceSelection() {
        piecesContainer.innerHTML = '';
        for (const [pieceName, shapes] of Object.entries(piecesBlokusMatrices)) {
            shapes.forEach((shape, index) => {
                if (!usedPieces[currentPlayerIndex].includes(`${pieceName}-${index}`)) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.dataset.piece = pieceName;
                    pieceElement.dataset.shapeIndex = index;
                    pieceElement.style.gridTemplateColumns = `repeat(${shape[0].length}, 30px)`;
                    pieceElement.style.gridTemplateRows = `repeat(${shape.length}, 30px)`;
                    shape.forEach((row, rowIndex) => {
                        row.forEach((cell, colIndex) => {
                            if (cell === 1) {
                                const pieceCell = document.createElement('div');
                                pieceCell.classList.add('piece-cell');
                                pieceCell.style.backgroundColor = getPlayerColor(currentPlayerIndex);
                                pieceCell.style.gridRowStart = rowIndex + 1;
                                pieceCell.style.gridColumnStart = colIndex + 1;
                                pieceElement.appendChild(pieceCell);
                            }
                        });
                    });
                    pieceElement.addEventListener('click', () => selectPiece(pieceName, index));
                    piecesContainer.appendChild(pieceElement);
                }
            });
        }
    }

    rotateButton.addEventListener('click', rotatePiece);

    function handleCellClick(cell, index) {
        if (!selectedPiece) {
            alert("Veuillez sélectionner une pièce.");
            return;
        }

        const row = Math.floor(index / boardSize);
        const col = index % boardSize;

        if (initialPlacement) {
            if (isCorner(row, col)) {
                if (placePiece(row, col)) {
                    currentPlayerIndex++;
                    if (currentPlayerIndex >= playerCount) {
                        initialPlacement = false;
                        currentPlayerIndex = 0;
                    }
                    updatePieceSelection();
                }
            }
        } else {
            if (isValidMove(row, col)) {
                if (placePiece(row, col)) {
                    currentPlayerIndex = (currentPlayerIndex + 1) % playerCount;
                    updatePlayerCanPlay();
                    if (!canAnyPlayerMove()) {
                        endGame();
                    }
                    updatePieceSelection();
                }
            }
        }
    }

    function placePiece(row, col) {
        const shape = piecesBlokusMatrices[selectedPiece][selectedPieceRotation];
        for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
            for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
                if (shape[rowIndex][colIndex] === 1) {
                    const newRow = row + rowIndex;
                    const newCol = col + colIndex;
                    if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
                        alert("Placement invalide.");
                        return false;
                    }
                    const cell = gameBoard.children[newRow * boardSize + newCol];
                    if (cell.classList.contains('blocked') || cell.classList.contains(players[0]) || cell.classList.contains(players[1]) || cell.classList.contains(players[2]) || cell.classList.contains(players[3])) {
                        alert("Placement invalide.");
                        return false;
                    }
                }
            }
        }

        for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
            for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
                if (shape[rowIndex][colIndex] === 1) {
                    const newRow = row + rowIndex;
                    const newCol = col + colIndex;
                    const cell = gameBoard.children[newRow * boardSize + newCol];
                    cell.classList.add(players[currentPlayerIndex]);
                    cell.classList.add('blocked');
                }
            }
        }

        playerScores[currentPlayerIndex] += shape.flat().filter(cell => cell === 1).length;
        usedPieces[currentPlayerIndex].push(`${selectedPiece}-${selectedPieceRotation}`);
        selectedPiece = null;
        return true;
    }

    function selectPiece(pieceName, shapeIndex) {
        selectedPiece = pieceName;
        selectedPieceRotation = shapeIndex;
    }

    function rotatePiece() {
        if (!selectedPiece) {
            alert("Veuillez sélectionner une pièce.");
            return;
        }
        selectedPieceRotation = (selectedPieceRotation + 1) % piecesBlokusMatrices[selectedPiece].length;
        updatePieceSelection();
    }

    function isCorner(row, col) {
        return (row === 0 && col === 0) || (row === 0 && col === boardSize - 1) ||
               (row === boardSize - 1 && col === 0) || (row === boardSize - 1 && col === boardSize - 1);
    }

    function isValidMove(row, col) {
        const shape = piecesBlokusMatrices[selectedPiece][selectedPieceRotation];
        for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
            for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
                if (shape[rowIndex][colIndex] === 1) {
                    const newRow = row + rowIndex;
                    const newCol = col + colIndex;
                    if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
                        return false;
                    }
                    const cell = gameBoard.children[newRow * boardSize + newCol];
                    if (cell.classList.contains('blocked') || cell.classList.contains(players[0]) || cell.classList.contains(players[1]) || cell.classList.contains(players[2]) || cell.classList.contains(players[3])) {
                        return false;
                    }
                }
            }
        }

        for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
            for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
                if (shape[rowIndex][colIndex] === 1) {
                    const newRow = row + rowIndex;
                    const newCol = col + colIndex;
                    const directions = [
                        [-1, -1], [-1, 1], [1, -1], [1, 1]
                    ];
                    for (const [ddx, ddy] of directions) {
                        const adjRow = newRow + ddx;
                        const adjCol = newCol + ddy;
                        if (adjRow >= 0 && adjRow < boardSize && adjCol >= 0 && adjCol < boardSize) {
                            const adjacentCell = gameBoard.children[adjRow * boardSize + adjCol];
                            if (adjacentCell.classList.contains(players[currentPlayerIndex])) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    function updatePlayerCanPlay() {
        for (let i = 0; i < playerCount; i++) {
            playerCanPlay[i] = false;
            for (let row = 0; row < boardSize; row++) {
                for (let col = 0; col < boardSize; col++) {
                    const index = row * boardSize + col;
                    const cell = gameBoard.children[index];
                    if (!cell.classList.contains('blocked') && isValidMoveForPlayer(row, col, players[i])) {
                        playerCanPlay[i] = true;
                        break;
                    }
                }
                if (playerCanPlay[i]) break;
            }
        }
    }

    function isValidMoveForPlayer(row, col, player) {
        const shape = piecesBlokusMatrices[selectedPiece][selectedPieceRotation];
        for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
            for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
                if (shape[rowIndex][colIndex] === 1) {
                    const newRow = row + rowIndex;
                    const newCol = col + colIndex;
                    if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
                        return false;
                    }
                    const cell = gameBoard.children[newRow * boardSize + newCol];
                    if (cell.classList.contains('blocked') || cell.classList.contains(players[0]) || cell.classList.contains(players[1]) || cell.classList.contains(players[2]) || cell.classList.contains(players[3])) {
                        return false;
                    }
                }
            }
        }

        for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
            for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
                if (shape[rowIndex][colIndex] === 1) {
                    const newRow = row + rowIndex;
                    const newCol = col + colIndex;
                    const directions = [
                        [-1, -1], [-1, 1], [1, -1], [1, 1]
                    ];
                    for (const [ddx, ddy] of directions) {
                        const adjRow = newRow + ddx;
                        const adjCol = newCol + ddy;
                        if (adjRow >= 0 && adjRow < boardSize && adjCol >= 0 && adjCol < boardSize) {
                            const adjacentCell = gameBoard.children[adjRow * boardSize + adjCol];
                            if (adjacentCell.classList.contains(player)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    function canAnyPlayerMove() {
        return playerCanPlay.some(canPlay => canPlay);
    }

    function endGame() {
        const scores = players.slice(0, playerCount).map((player, index) => ({
            player,
            score: playerScores[index]
        }));

        scores.sort((a, b) => b.score - a.score);

        let message = "Classement des joueurs :\n";
        scores.forEach((score, index) => {
            message += `${index + 1}. ${score.player} : ${score.score} points\n`;
        });

        alert(message);

        if (confirm("Voulez-vous rejouer ?")) {
            location.reload();
        }
    }

    function getPlayerColor(playerIndex) {
        switch (playerIndex) {
            case 0: return 'red';
            case 1: return 'blue';
            case 2: return 'green';
            case 3: return 'yellow';
            default: return 'grey';
        }
    }

    updatePieceSelection();
});