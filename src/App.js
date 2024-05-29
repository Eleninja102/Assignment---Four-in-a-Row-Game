import { useState } from "react";
import { renderToReadableStream } from "react-dom/server";


export default function Board(){

	const [board, setBoard] = useState(Array.from({length: 6},()=> Array.from({length: 7}, () => null)))
	
	//console.log(rows)
	const [redsTurn, setRedsTurn] = useState(true);

	function handleClick(rowI, colI){
		if(board[rowI][colI] || calculateWinner(board)){
			return;
		}

		const nextSquares = board.slice();

		var col0 = nextSquares.map(d => d[colI]);
		for(let i = board.length-1; i >= 0; i-=1){
			if(!col0[i]){
				nextSquares[i][colI] = redsTurn? "Red": "Yellow"
				break;
			}
			
		}		
		setRedsTurn(!redsTurn)
		setBoard(nextSquares)
	}

	function loadTie(){
		const newBoard = 
		[
			[null, null, null, "Red", "Yellow", "Red", "Yellow"],
			["Red", "Red", "Yellow", "Red", "Yellow", "Yellow", "Yellow"],
			["Red", "Yellow", "Red", "Yellow", "Red", "Red", "Red"],
			["Red", "Yellow", "Red", "Yellow", "Yellow", "Red", "Red"],
			["Yellow", "Red", "Yellow", "Red", "Yellow", "Red", "Yellow"],
			["Red", "Yellow", "Red", "Red", "Yellow", "Yellow", "Red"]			
		]
		setRedsTurn(false)
		setBoard(newBoard)
	}
	function loadUpDiagonal(){
		const newBoard = 
		[
			[null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null],
			["Yellow", null, "Red", "Yellow", "Red", "Red", "Yellow"],
			["Yellow", "Red", "Red", "Yellow", "Yellow", "Yellow", "Red"],
			["Red", "Yellow", "Red", "Red", "Yellow", "Yellow", "Red"],		
		]
		setRedsTurn(true)
		setBoard(newBoard)
	}
	function loadAcross(){
		const newBoard = 
		[
			[null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null],
			["Yellow", "Yellow", null, "Yellow", "Yellow", "Yellow", "Red"],		
			["Red", "Red", null, "Red", "Red", "Red", "Yellow"],			
		]
		setRedsTurn(true)
		setBoard(newBoard)
	}


	function clear(){
		const newBoard = Array.from({length: 6},()=> Array.from({length: 7}, () => null))
		setRedsTurn(true)
		setBoard(newBoard)
	}
	
	
	
	const winner = calculateWinner(board)
	//console.log(board.some(row => (row.map(item =>(item == null)))));
	//const isNull = (element) => (element.some(element => element == null));
	//console.log(board.some(isNull))

	let status;
	if(winner){
		let flatBoard = board.flat()
		status = "Winner: " + flatBoard[winner[0]];
		console.log(board)
	}else if(!board.some(row => row.some(item => item == null))){
		console.log(board)
		status = "Game Over No One Won"
	}
	else{
		status = "Next Player: " + (redsTurn ? "Red": "Yellow")
	}



	return(
	<>
		<button onClick={loadUpDiagonal}>Load Up Diagonal GameBoard</button>
		<button onClick={loadTie}>Load Tie GameBoard</button>
		<button onClick={loadAcross}>Across GameBoard</button>



		<button onClick={clear}>Clear GameBoard</button>
		<div className="status">{status}</div>
		<div>
			{
				board.map((row, rowIdx) =>(			
					<div className="board-row">
					{
						row.map((item, colIdx)=>(
							<Square winningTile = {winner ? winner.includes(colIdx + rowIdx * 7): false} value = {item} onSquareClick={() => handleClick(rowIdx, colIdx)}/>
						))
					}
					</div>
				))
			}
		</div>
	</>
	)
}



function Square({value, onSquareClick, winningTile}){
	// //const [value, setValue] = useState(null)
	// // let squareValue = "X";
	// function handleClick(){
	// 	// console.log("clicked")
	// 	setValue("X");
	// }
	if(value == "Red"){
		if(winningTile){
			return (<button className="square red-token winning" onClick={onSquareClick}>🔴</button>);

		}
		return (<button className="square red-token" onClick={onSquareClick}>🔴</button>);
	}
	if(value == "Yellow"){
		if(winningTile){
			return (<button className="square yellow-token winning" onClick={onSquareClick}>🟡</button>);
		}
		return (<button className="square yellow-token" onClick={onSquareClick}>🟡</button>);
	}


	return (<button className="square" onClick={onSquareClick}>{}</button>);
}



function calculateWinner(gameBoard) {
	let numColumns =  gameBoard[0].length
	let numRows = gameBoard.length
	console.log("col", numColumns)
	console.log("rows", numRows)

	const flatGameBoard = gameBoard.flat();

	let downDiagonals = []
	let upDiagonals = []
	let vertical = []
	let across = []

	let amountNeeded = 4
	let largestDimension = Math.max(numColumns,  numRows) + 1

	console.log("largest", largestDimension)
	for(let i = 0; i < largestDimension; i+=1){
		for(let j = 0; j < largestDimension; j+=1){
			
			//horizontal win
			const row = i*numColumns + j
			if(flatGameBoard[row]){
				if(row % numColumns == 0){
					if(across.length >= amountNeeded){
						console.log("Partyyyy", across)
						return across;
					}	
					across = []
				}
				if(flatGameBoard[across[0]] == flatGameBoard[row]){
					across.push(row)
				}
				else{
					if(across.length >= amountNeeded){
						console.log("Partyyyy", across)
						return across;
					}	
					across = [row]
				}

			}else{
				if(across.length >= amountNeeded){
					console.log("Partyyyy", across)
					return across;
				}	
				across = []
			}


			//vertical win
			const column = i + numColumns*j
			if(flatGameBoard[column]){
				if(flatGameBoard[vertical[0]] == flatGameBoard[column]){
					vertical.push(column)
				}
				else{
					if(vertical.length >= amountNeeded){
						console.log("Partyyyy", vertical)
						return vertical;
					}
					vertical = [column]
				}
			}else{
				if(vertical.length >= amountNeeded){
					console.log("Partyyyy", vertical)
					return vertical;
				}
				vertical = []
			}


			//down diagonal
			const dDiag = i + (numColumns+1)*j
			if(flatGameBoard[dDiag]){
				if(dDiag % numColumns == 0){
					if(downDiagonals.length >= amountNeeded){
						console.log("Partyyyy", downDiagonals)
						return downDiagonals;
					} 
					downDiagonals = [];			
				}

				if(flatGameBoard[downDiagonals[0]] == flatGameBoard[dDiag]){
					downDiagonals.push(dDiag)
				}else{
					if(downDiagonals.length >= amountNeeded){
						console.log("Partyyyy", downDiagonals)
						return downDiagonals;
					} 
					downDiagonals = [dDiag]
				}
			}else{
				if(downDiagonals.length >= amountNeeded){
					console.log("Partyyyy", downDiagonals)
					return downDiagonals;
				} 
				downDiagonals = []
			}


			//up diagonal
			const uDiag = i + (numColumns-1)*j
			if(flatGameBoard[uDiag]){
				if(uDiag % numColumns == numColumns-1){
					if(upDiagonals.length >= amountNeeded){
						console.log("Partyyyy", upDiagonals)
						return upDiagonals;
					}
					upDiagonals = [];
				}

				if(flatGameBoard[upDiagonals[0]] == flatGameBoard[uDiag]){
					upDiagonals.push(uDiag)
				}else{
					if(upDiagonals.length >= amountNeeded){
						console.log("Partyyyy", upDiagonals)
						return upDiagonals;
					}
					upDiagonals = [uDiag]
				}
				
			}else{
				if(upDiagonals.length >= amountNeeded){
					console.log("Partyyyy", upDiagonals)
					return upDiagonals;
				}
				upDiagonals = []
			}

		}

			
		upDiagonals = []
		downDiagonals = []
		vertical = []
		across = []
	}

}
