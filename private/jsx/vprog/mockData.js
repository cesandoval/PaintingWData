


export const Nodes = {
	/*
	[$nodeKey]: {
		type: [nodeType], // e.g. 'layer', 'add', 'sub', 'log'
		// source: [datasetKey], // TBD. optional, if type of node is 'layer'
		options: {
			// related to types
		},
		position: { // ('transform', `translate(${x},${y})`)
			x: String,
			y: String,
		},
		color: String, // #RRGGBB
		opacity: Number, // 0.0 ~ 1.0
		visibility: Boolean,
		// linked: [$linkKey], // TBD.
		// output: [$linkKey], // TBD.
	},
	*/

	'$nodeA': {
		type: 'LOG',
		options: {},
		position: {
			x: 300,
			y: 100,
		},
		color: '#282912',
		opacity: 0.5,
		visibility: true,
	},
	'$nodeB': {
		type: 'MULT',
		options: {},
		position: {
			x: 300,
			y: 300,
		},
		color: '#282912',
		opacity: 0.5,
		visibility: true,
	},
	'$nodeC': {
		type: 'SUB',
		options: {},
		position: {
			x: 550,
			y: 140,
		},
		color: '#282912',
		opacity: 0.5,
		visibility: true,
	},
	'$nodeD': {
		type: 'DIV',
		options: {},
		position: {
			x: 550,
			y: 300,
		},
		color: '#282912',
		opacity: 0.5,
		visibility: true,
	},
}

export const Links = {
	inputs: { // for arithmetic iterate
		// [$nodeKey]:{ // the node key of input 
		// 	[inputKey]: [$nodeKey],
		// },
		'$nodeC':{
	    'Minuend': '$nodeA',
	    'Subtrahend': '$nodeB',
		},
		'$nodeD':{
	    'Numerator': '$nodeB',
	    'Denominator': '',
		},
		
	},
	outputs: { // for checking the limitation of links
		// [$nodeKey]: { // the node key of output
		// 	[$nodeKey]: [inputKey],
		// },
		'$nodeA':{
			'$nodeC': 'Minuend',
		},
		'$nodeB':{
			'$nodeC': 'Subtrahend',
			'$nodeD': 'Numerator',
		},
	},
}

/* links example


  ┏━━━┓        ┏━━━━━┓
  ┃ A O ⇒⇒⇒⇒⇒⇒ I     ┃
  ┗━━━┛        ┃  C  O
           ┏⇒⇒ I SUB ┃
  ┏━━━┓    ┃   ┗━━━━━┛
  ┃ B O ⇒⇒⇒┫
	┗━━━┛    ┃   ┏━━━━━┓
	         ┗⇒⇒ I     ┃
	             ┃  D  O
               I DIV ┃
               ┗━━━━━┛

*/



