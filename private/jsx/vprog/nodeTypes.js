/*
const NodeType = {
  [name]: { // e.g. 'layer', 'add', 'sub', 'log'
    fullname: '', // e.g. 'Subraction', 'Multiplication', 'Division', 'Logarithm'
    inputs: {
      // e.g. 'Input', 'Input2', 'Numerator', 'Denominator'.
      [name]: 'N', // 'N' is one letter abbreviation to uppercase.
      // 'input1': 'I',
      // 'input2': 'I',
    },
    arithmetic: (inputs, options) => {},
    output: String, // output name, default 'Output'.
    options: { // option label name and default value.
      [name]: value,
    },
  },
}
*/


export const DATASET = {
  fullName: 'Dataset',
  inputs: {
  },
  output: 'Output',
  options: {
  },
  arithmetic(...input) {
  },
}

export const LOG = {
  fullName: 'Logarithm',
	inputs: {
    'Input': 'I',
	},
	output: 'Output',
	options: {
		valDiff: 10,
	},
	arithmetic: (inputs, options = {}) => {
    const {valDiff = 10} = options
    console.log('log inputs', inputs)

    let min = math.min(Array.from(inputs[0]))
    let max = math.max(Array.from(inputs[0]))

    const remap = (x) => {
        if (x != 0) {
            return (valDiff)*((x-min)/(max-min))+min
        } else {
            return 0
        }
    }

    let newSizeArray = math.log(inputs[0].map(remap))
    let newMin = math.min(newSizeArray.filter(item => item !== Number.NEGATIVE_INFINITY))
    const notInfinity = (x) => {
        if (x == Number.NEGATIVE_INFINITY) {
            return newMin
        } else {
            return x
        }
    }
    return newSizeArray.map(notInfinity)
	},
}

export const SUB = {
  fullName: 'Subraction',
  inputs: {
    'Minuend': 'M',
    'Subtrahend': 'S',
  },
  output: 'Output',
  options: {
  },
  arithmetic: (inputs, options = {}) => {
    return math.subtract(...inputs)
  },
}

export const DIV = {
  fullName: 'Division',
  inputs: {
    'Numerator': 'N',
    'Denominator': 'D',
  },
  output: 'Output',
  options: {
  },
  arithmetic: (inputs, options = {}) => {
    return math.dotDivide(...inputs)
  },
}

export const MULT = {
  fullName: 'Multiplication',
  inputs: {
    'Mulitplicand': 'M',
    'Multiplier': 'M',
  },
  output: 'Output',
  options: {
  },
  arithmetic: (inputs, options = {}) => {
    return math.dotMultiply(...inputs)
  },
}

export const AND = {
  fullName: 'And',
  inputs: {
    'Input1': 'I',
    'Input2': 'I',
    'Input3': 'I',
    'Input4': 'I',
  },
  output: 'Output',
  options: {
  },
  arithmetic(...input) {
    // TODO
    return input[0]
  },
}

