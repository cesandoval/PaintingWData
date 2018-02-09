/*
const NodeType = {
  [name]: { // e.g. 'layer', 'add', 'sub', 'log'
    fullname: '', // e.g. 'Subraction', 'Multiplication', 'Division', 'Logarithm'
    desc: `', // some 
        descripti
    `n
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
    desc: `
        Contains a voxel layer inherited from the voxel project. The voxel values can be passed to other nodes. 
    `,
    inputs: {
        // no input
    },
    output: 'Output',
    options: {},
    arithmetic() {},
}

export const LOG = {
    fullName: 'Logarithm',
    desc: `
        Computes the Logarithm value of a dataset. Options: Maximum Interval, Base of Logarithm.
    `,
    inputs: {
        Input: 'I',
    },
    output: 'Output',
    options: {
        maximumInterval: 10, // 'valDiff'
        base: Math.E,
    },
    arithmetic: (inputs, options = {}) => {
        const { maximumInterval, base } = options
        // console.log('log.arithmetic()', {inputs, options})

        let min = math.min(Array.from(inputs[0]))
        let max = math.max(Array.from(inputs[0]))

        const remap = x => {
            if (x != 0) {
                return Number(maximumInterval) * ((x - min) / (max - min)) + min
            } else {
                return 0
            }
        }

        // let newSizeArray = math.log(inputs[0].map(remap))
        let newSizeArray = inputs[0].map(remap).map(n => math.log(n, base))

        let newMin = math.min(
            newSizeArray.filter(item => item !== Number.NEGATIVE_INFINITY)
        )
        const notInfinity = x => {
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
    desc: `
        Computes the arithmetic Subtraction of two datasets, the minuend and subtrahend.
    `,
    inputs: {
        Minuend: 'M',
        Subtrahend: 'S',
    },
    output: 'Output',
    options: {},
    arithmetic: inputs => {
        return math.subtract(...inputs)
    },
}

export const DIV = {
    fullName: 'Division',
    desc: `
        Computes the arithmetic Division of two datasets, the numerator and denominator. Returns 0 if dividing by 0.
    `,
    inputs: {
        Numerator: 'N',
        Denominator: 'D',
    },
    output: 'Output',
    options: {},
    arithmetic: inputs => {
        return math.dotDivide(...inputs)
    },
}

export const MULT = {
    fullName: 'Multiplication',
    desc: `
        Computes the arithmetic Multiplication of two datasets, the multiplicand and multiplier.

    `,
    inputs: {
        Mulitplicand: 'M',
        Multiplier: 'M',
    },
    output: 'Output',
    options: {},
    arithmetic: inputs => {
        return math.dotMultiply(...inputs)
    },
}

export const ADD = {
    fullName: 'Addition',
    desc: `
        Computes the arithmetic Addition of two datasets.
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: inputs => {
        return math.add(...inputs)
    },
}

export const MIN = {
    fullName: 'MIN',
    desc: `
        MIN
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic(inputs) {
        return _.zipWith(...inputs, (...voxel) => _.min(voxel))
    },
}

export const MAX = {
    fullName: 'MAX',
    desc: `
        MAX
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic(inputs) {
        return _.zipWith(...inputs, (...voxel) => _.max(voxel))
    },
}

export const AND = {
    fullName: 'AND',
    desc: `
        Returns the voxels that contain a visible voxel in both datasets. Algebraic Function: F=A*B.
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
        Input3: 'I',
        Input4: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic(...input) {
        // TODO
        return input[0]
    },
}

export const OR = {
    fullName: 'OR',
    desc: `
        Returns the voxels that contain a visible voxel in either dataset. Algebraic Function: F=A+B.
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: inputs => {
        return math.or(...inputs).map(m => (m ? 1 : 0))
    },
}

export const XOR = {
    fullName: 'XOR',
    desc: `
        Returns the voxels that contain a visible voxel in one, and only one of the input datasets. 
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: inputs => {
        return math.xor(...inputs).map(m => (m ? 1 : 0))
    },
}

export const NOT = {
    fullName: 'NOT',
    desc: `
        Returns the voxels that contain an invisible voxel in a dataset (logical negation). Algebraic Function: F=A'.
    `,
    inputs: {
        Input: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: inputs => {
        return inputs[0].map(m => !m)
    },
}
