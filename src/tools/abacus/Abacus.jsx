import React, {useState, useEffect} from 'react';
import {Button} from './components/ui/button';
import {
	Plus,
	Minus,
	ChevronsRight,
	ChevronsLeft,
	RotateCcw,
} from 'lucide-react';

const SUPERSCRIPT_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

const toSuperscript = (num) => {
	return num.toString().split('').map(d => SUPERSCRIPT_DIGITS[parseInt(d)]).join('');
};

const formatPlaceValue = (base, rowIndex) => {
	if (base !== 2 && rowIndex >= 3) {
		return `${base}${toSuperscript(rowIndex)}`;
	}
	return Math.pow(base, rowIndex).toLocaleString();
};

const ROW_COLORS = [
	'bg-red-500',
	'bg-orange-500',
	'bg-amber-500',
	'bg-yellow-500',
	'bg-lime-500',
	'bg-emerald-500',
	'bg-cyan-500',
	'bg-blue-500',
	'bg-indigo-500',
	'bg-violet-500',
	'bg-purple-500',
	'bg-fuchsia-500',
	'bg-pink-500',
	'bg-rose-500',
	'bg-teal-500',
	'bg-sky-500',
];

const Abacus = () => {
	const [base, setBase] = useState(10);
	const [rows, setRows] = useState(8);
	const [beadStates, setBeadStates] = useState([]);
	const [value, setValue] = useState(0);

	// Initialize beads only on mount
	useEffect(() => {
		const initialBeads = Array(rows)
			.fill()
			.map(() => ({
				rightSide: 0,
				leftSide: base - 1,
			}));
		setBeadStates(initialBeads);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (['ArrowUp', 'ArrowRight'].includes(e.key)) {
				changeValue(1);
			} else if (['ArrowDown', 'ArrowLeft'].includes(e.key)) {
				changeValue(-1);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [value, base, rows]);

	const updateBeadsFromValue = (newValue, newBase = base, newRows = rows) => {
		let remainingValue = newValue;
		const newBeads = Array(newRows)
			.fill()
			.map(() => ({
				rightSide: 0,
				leftSide: newBase - 1,
			}));

		for (let i = newBeads.length - 1; i >= 0; i--) {
			const placeValue = Math.pow(newBase, i);
			const digit = Math.floor(remainingValue / placeValue);
			if (digit > 0) {
				newBeads[i].rightSide = Math.min(digit, newBase - 1);
				newBeads[i].leftSide = newBase - 1 - newBeads[i].rightSide;
				remainingValue -= digit * placeValue;
			}
		}

		setBeadStates(newBeads);
	};

	const changeValue = (increment) => {
		const maxValue = Math.pow(base, rows) - 1;
		const newValue = Math.max(0, Math.min(value + increment, maxValue));
		setValue(newValue);
		updateBeadsFromValue(newValue);
	};

	const reset = () => {
		setValue(0);
		updateBeadsFromValue(0);
	};

	useEffect(() => {
		let newValue = 0;
		beadStates.forEach((row, rowIndex) => {
			newValue += row.rightSide * Math.pow(base, rowIndex);
		});
		setValue(newValue);
	}, [beadStates, base]);

	const moveBead = (rowIndex, direction, moveAll = false) => {
		const newBeads = [...beadStates];
		const row = newBeads[rowIndex];

		if (direction === 'right') {
			const moveCount = moveAll ? row.leftSide : 1;
			if (row.leftSide >= moveCount) {
				row.rightSide += moveCount;
				row.leftSide -= moveCount;
			}
		} else if (direction === 'left') {
			const moveCount = moveAll ? row.rightSide : 1;
			if (row.rightSide >= moveCount) {
				row.rightSide -= moveCount;
				row.leftSide += moveCount;
			}
		}

		setBeadStates(newBeads);
	};

	const incrementBase = () => {
		const newBase = Math.min(base + 1, 16);
		if (newBase === base) return;
		setBase(newBase);
		updateBeadsFromValue(value, newBase);
	};

	const decrementBase = () => {
		const newBase = Math.max(base - 1, 2);
		if (newBase === base) return;
		// Clamp value to max representable in new base
		const maxValue = Math.pow(newBase, rows) - 1;
		const clampedValue = Math.min(value, maxValue);
		setBase(newBase);
		setValue(clampedValue);
		updateBeadsFromValue(clampedValue, newBase);
	};

	return (
		<div className='p-4 max-w-4xl mx-auto m-8'>
			{/* Controls */}
			<div className='mb-6 flex items-center gap-6 p-4'>
				<div className='flex items-center gap-2'>
					<Button
						onClick={decrementBase}
						disabled={base <= 2}
						variant='outline'
						className='bg-slate-200 hover:bg-slate-300'
					>
						-
					</Button>
					<div className='flex flex-col items-center'>
						<span className='text-sm text-slate-500'>Base</span>
						<span className='text-2xl font-bold text-slate-700'>{base}</span>
					</div>
					<Button
						onClick={incrementBase}
						disabled={base >= 16}
						variant='outline'
						className='bg-slate-200 hover:bg-slate-300'
					>
						+
					</Button>
				</div>

				<div className='flex-1 flex items-center gap-4'>
					<div className='flex gap-2 items-center flex-1'>
						<Button
							variant='outline'
							className='bg-slate-200 hover:bg-slate-100'
							onClick={() => changeValue(-1)}
							disabled={value <= 0}
						>
							<Minus className='h-4 w-4' />
						</Button>
						<div className='flex flex-col items-center'>
							<span className='text-sm text-slate-500'>Value</span>
							<span className='text-2xl font-bold text-slate-800 w-40 text-center'>
								{value.toLocaleString()}
							</span>
						</div>
						<Button
							variant='outline'
							className='bg-slate-200 hover:bg-slate-300'
							onClick={() => changeValue(1)}
							disabled={value >= Math.pow(base, rows) - 1}
						>
							<Plus className='h-4 w-4' />
						</Button>
					</div>
				</div>

				<Button
					variant='outline'
					onClick={reset}
					className='flex gap-2 items-center bg-slate-200 hover:bg-slate-300'
				>
					<RotateCcw className='h-4 w-4' />
					Reset
				</Button>
			</div>

			{/* Abacus Frame */}
			<div className='flex'>
				{/* Left buttons column */}
				<div className='flex flex-col justify-around pr-4'>
					{beadStates.map((row, rowIndex) => (
						<div key={rowIndex} className='flex gap-1 h-14 items-center'>
							<Button
								size='sm'
								variant='outline'
								className='bg-slate-200 hover:bg-slate-300'
								onClick={() => moveBead(rowIndex, 'left', true)}
								disabled={row.rightSide === 0}
							>
								<ChevronsLeft className='h-4 w-4' />
							</Button>
							<Button
								size='sm'
								variant='outline'
								className='bg-slate-200 hover:bg-slate-300'
								onClick={() => moveBead(rowIndex, 'left')}
								disabled={row.rightSide === 0}
							>
								<Minus className='h-4 w-4' />
							</Button>
						</div>
					))}
				</div>

				{/* Wooden frame with beads */}
				<div className='w-[600px] flex'>
					{/* Left wooden bar */}
					<div className='w-4 bg-amber-800 rounded-l-lg shadow-inner' />

					{/* Bead area */}
					<div className='flex-1 py-4'>
						{beadStates.map((row, rowIndex) => (
							<div
								key={rowIndex}
								className='flex items-center mb-2 last:mb-0'
							>
								<div className='h-14 flex-1 relative flex items-center'>
									{/* String/rod */}
									<div className='absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-amber-900' />

									{/* All beads with animated positions */}
									{Array(base - 1)
										.fill()
										.map((_, beadIndex) => {
											// Beads are indexed 0 to base-2 from left to right
											// Inactive (gray) beads: indices 0 to leftSide-1, positioned on left
											// Active (colored) beads: indices leftSide to base-2, positioned on right
											const isActive = beadIndex >= row.leftSide;
											const beadWidth = 32; // w-8 = 32px
											const beadGap = 2; // gap-0.5 = 2px
											const padding = 4;

											// Calculate left position for smooth transitions
											let leftPosition;
											if (isActive) {
												// Active beads positioned from right
												// k = position from right (0 = rightmost)
												const k = base - 2 - beadIndex;
												leftPosition = `calc(100% - ${padding + beadWidth + k * (beadWidth + beadGap)}px)`;
											} else {
												// Inactive beads positioned from left
												leftPosition = `${padding + beadIndex * (beadWidth + beadGap)}px`;
											}

											return (
												<div
													key={beadIndex}
													className={`absolute w-8 h-10 rounded-xl shadow-md hover:scale-110 z-10 transition-all duration-200 ease-out ${
														isActive
															? ROW_COLORS[rowIndex % ROW_COLORS.length]
															: 'bg-stone-300'
													}`}
													style={{
														left: leftPosition,
													}}
												/>
											);
										})}
								</div>
							</div>
						))}
					</div>

					{/* Right wooden bar */}
					<div className='w-4 bg-amber-800 rounded-r-lg shadow-inner' />
				</div>

				{/* Right buttons column */}
				<div className='flex flex-col justify-around pl-4'>
					{beadStates.map((row, rowIndex) => {
						const placeValue = Math.pow(base, rowIndex);
						const rowValue = row.rightSide * placeValue;
						return (
							<div key={rowIndex} className='flex gap-1 h-14 items-center'>
								<Button
									size='sm'
									variant='outline'
									className='bg-slate-200 hover:bg-slate-300'
									onClick={() => moveBead(rowIndex, 'right')}
									disabled={row.leftSide === 0}
								>
									<Plus className='h-4 w-4' />
								</Button>
								<Button
									size='sm'
									variant='outline'
									className='bg-slate-200 hover:bg-slate-300'
									onClick={() => moveBead(rowIndex, 'right', true)}
									disabled={row.leftSide === 0}
								>
									<ChevronsRight className='h-4 w-4' />
								</Button>
								<div className='grid grid-cols-[1rem_0.75rem_3rem_0.75rem_5rem] text-sm text-slate-600 font-mono ml-2 items-center'>
									<span className='text-right'>{row.rightSide}</span>
									<span className='text-center'>×</span>
									<span className='text-right'>{formatPlaceValue(base, rowIndex)}</span>
									<span className='text-center'>=</span>
									<span className='text-right'>{rowValue.toLocaleString()}</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>

		</div>
	);
};

export default Abacus;
