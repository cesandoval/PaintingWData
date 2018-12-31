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

import _ from 'lodash'
import * as tf from '@tensorflow/tfjs'
import kmeans from 'ml-kmeans'
import {
    SimpleLinearRegression,
    MultivariateLinearRegression,
} from 'ml-regression'

export const DATASET = {
    fullName: 'Dataset',
    class: 'dataset',
    desc: `
        Contains a voxel layer inherited from the voxel project. The voxel values can be passed to other nodes.
    `,
    inputs: {
        // no input
    },
    output: 'Output',
    options: {},
    arithmetic: async () => {},
}

export const LOG = {
    fullName: 'Logarithm',
    class: 'math',
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
    arithmetic: async (inputs, options = {}) => {
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
    class: 'math',
    desc: `
        Computes the arithmetic Subtraction of two datasets, the minuend and subtrahend.
    `,
    inputs: {
        Minuend: 'M',
        Subtrahend: 'S',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        return inputs
            .slice(1)
            .reduce((accum, input) => math.subtract(accum, input), inputs[0])
    },
}

export const DIFF = {
    fullName: 'Difference',
    class: 'math',
    desc: `
        Computes the arithmetic absolute difference between datasets
    `,
    inputs: {
        Minuend: 'M',
        Subtrahend: 'S',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        return inputs
            .slice(1)
            .reduce((accum, input) => math.subtract(accum, input), inputs[0])
            .map(val => Math.abs(val))
    },
}

export const DIV = {
    fullName: 'Division',
    class: 'math',
    desc: `
        Computes the arithmetic Division of two datasets, the numerator and denominator. Returns 0 if dividing by 0.
    `,
    inputs: {
        Numerator: 'N',
        Denominator: 'D',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        return inputs
            .slice(1)
            .reduce((accum, input) => math.dotDivide(accum, input), inputs[0])
    },
}

export const MULT = {
    fullName: 'Multiplication',
    class: 'math',
    desc: `
        Computes the arithmetic Multiplication of two datasets, the multiplicand and multiplier.

    `,
    inputs: {
        Mulitplicand: 'M',
        Multiplier: 'M',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        return inputs.reduce(
            (accum, input) => math.dotMultiply(accum, input),
            1
        )
        // return math.dotMultiply(...inputs)
    },
}

export const ADD = {
    fullName: 'Addition',
    class: 'math',
    desc: `
        Computes the arithmetic Addition of two datasets.
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        return inputs.reduce((accum, input) => math.add(accum, input), 0)
    },
}

export const MIN = {
    fullName: 'MIN',
    class: 'set',
    desc: `
        MIN
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        return _.zipWith(...inputs, (...voxel) => _.min(voxel))
    },
}

export const MAX = {
    fullName: 'MAX',
    class: 'set',
    desc: `
        MAX
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        return _.zipWith(...inputs, (...voxel) => _.max(voxel))
    },
}

export const AND = {
    fullName: 'AND',
    class: 'logic',
    desc: `
        Returns the voxels that contain a visible voxel in both datasets. Algebraic Function: F=A*B.
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        let result = math.and(inputs[0], inputs[1])
        for (let i = 2; i < inputs.length; i++) {
            result = math.and(result, inputs[i])
        }
        return result.map(m => (m ? 1 : 0))
    },
}

export const OR = {
    fullName: 'OR',
    class: 'logic',
    desc: `
        Returns the voxels that contain a visible voxel in either dataset. Algebraic Function: F=A+B.
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        let result = math.or(inputs[0], inputs[1])
        for (let i = 2; i < inputs.length; i++) {
            result = math.or(result, inputs[i])
        }
        return result.map(m => (m ? 1 : 0))
        // return math.or(...inputs).map(m => (m ? 1 : 0))
    },
}

export const XOR = {
    fullName: 'XOR',
    class: 'logic',
    desc: `
        Returns the voxels that contain a visible voxel in one, and only one of the input datasets.
    `,
    inputs: {
        Input1: 'I',
        Input2: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        let result = math.xor(inputs[0], inputs[1])
        for (let i = 2; i < inputs.length; i++) {
            result = math.xor(result, inputs[i])
        }
        return result.map(m => (m ? 1 : 0))
        // return math.xor(...inputs).map(m => (m ? 1 : 0))
    },
}

export const NOT = {
    fullName: 'NOT',
    class: 'logic',
    desc: `
        Returns the voxels that contain an invisible voxel in a dataset (logical negation). Algebraic Function: F=A'.
    `,
    inputs: {
        Input: 'I',
    },
    output: 'Output',
    options: {},
    arithmetic: async inputs => {
        return inputs[0].map(m => !m)
    },
}

export const K_CLUSTER = {
    fullName: 'K Clustering',
    class: 'statistics',
    desc: `
        Clusters data into K clusters and averages among cluster
    `,
    inputs: {
        Input1: 'Y',
        Input2: 'X',
    },
    output: 'Output',
    options: {
        k: 100,
    },
    arithmetic: async (inputs, options = {}) => {
        const { k } = options
        const data = []
        for (let i = 0; i < inputs[0].length; i++) {
            const point = []
            for (let j = 1; j < inputs.length; j++) {
                point.push(inputs[j][i])
            }
            data.push(point)
        }
        const { centroids, clusters } = kmeans(data, Number(k))
        const results = {}
        console.log(centroids, clusters)
        for (let i = 0; i < inputs[0].length; i++) {
            const cluster = clusters[i]
            results[cluster] =
                _.get(results, `[${cluster}]`, 0) +
                inputs[0][i] / centroids[cluster].size
        }
        console.log(results)
        return Promise.resolve(clusters.map(cluster => results[cluster]))
    },
}

export const LIN_REG = {
    fullName: 'Linear Regression',
    class: 'statistics',
    desc: `
            Return the voxels for the linear regression for dependent variable Y on observed variable X.
        `,
    inputs: {
        Input1: 'Y',
        Input2: 'X',
    },
    output: 'Output',
    options: {
        trainingSplit: 0.6,
    },
    arithmetic: async (inputs, options = {}, savedData = {}) => {
        let trainingSplit = Number(options.trainingSplit)
        trainingSplit =
            trainingSplit < 0 ? 0 : trainingSplit > 1 ? 1 : trainingSplit
        const sample = (x, y, split = trainingSplit) => {
            const sampleSize = Math.floor(inputs[0].length * split)
            const sampleIndices = _.sampleSize(
                [...Array(inputs[0].length).keys()],
                sampleSize
            )
            const trainingX = []
            const trainingY = []
            for (let i = 0; i < sampleIndices.length; i++) {
                trainingX.push(x[sampleIndices[i]])
                trainingY.push(y[sampleIndices[i]])
            }
            return { trainingX, trainingY }
        }

        let regression
        let results
        let y
        const yMax = Math.max(...inputs[0])
        let x
        if (inputs.length < 3) {
            const xMax = Math.max(...inputs[1])
            x = inputs[1].map(val => val / xMax)
            y = inputs[0].map(val => val / yMax)
            const { trainingX, trainingY } = sample(x, y)
            regression = new SimpleLinearRegression(trainingX, trainingY)
            results = regression.predict(x).map(val => val * yMax)

            // Draws line
            const linePoints = []
            for (let i = 0; i <= 10; i++) {
                linePoints.push(i / 10.0)
            }
            savedData['line'] = regression
                .predict(linePoints)
                .map((currentValue, index) => [linePoints[index], currentValue])
            const sampledData = sample(x, y, Math.min(200 / x.length, 1))
            savedData['samples'] = sampledData.trainingX.map((value, index) => [
                value,
                sampledData.trainingY[index],
            ])
        } else {
            x = []
            const maxes = []
            // Gets max values for all inputs
            for (let j = 1; j < inputs.length; j++) {
                maxes.push(Math.max(...inputs[j]))
            }
            // Converts max inputs to an input matrix
            for (let i = 0; i < inputs[1].length; i++) {
                const data_entry = []
                for (let j = 1; j < inputs.length; j++) {
                    data_entry.push(inputs[j][i] / maxes[j - 1])
                }
                x.push(data_entry)
            }

            y = inputs[0].map(value => [value / yMax])
            const { trainingX, trainingY } = sample(x, y)
            regression = new MultivariateLinearRegression(trainingX, trainingY)
            results = regression.predict(x).map(val => val[0] * yMax)
        }
        return results
    },
}

export const LIN_REG2 = {
    fullName: 'Linear Regression 2',
    class: 'statistics',
    desc: `
        Return the voxels for the linear regression for dependent variable Y on observed variable X.
    `,
    inputs: {
        Input1: 'Y',
        Input2: 'X',
    },
    output: 'Output',
    options: {
        training_epochs: 5,
    },
    arithmetic: async (inputs, options = {}, savedData = {}) => {
        const { training_epochs } = options

        let model
        if (_.get(savedData, 'model')) {
            model = _.get(savedData, 'model')
        } else {
            // Define a model for linear regression.
            model = tf.sequential()
            model.add(
                tf.layers.dense({ units: 1, inputShape: [inputs.length - 1] })
            )

            // Prepare the model for training: Specify the loss and the optimizer.
            model.compile({
                loss: 'meanSquaredError',
                optimizer: 'sgd',
            })
        }

        // Converts independent input arrays into feature column format
        const data = []
        const maxes = []
        for (let j = 1; j < inputs.length; j++) {
            maxes.push(Math.max(...inputs[j]))
        }
        for (let i = 0; i < inputs[1].length; i++) {
            const data_entry = []
            for (let j = 1; j < inputs.length; j++) {
                data_entry.push(inputs[j][i] / maxes[j - 1])
            }
            data.push(data_entry)
        }

        const y_range = Math.max(...inputs[0])
        const xs = tf.tensor2d(data, [inputs[1].length, inputs.length - 1])
        const ys = tf.tensor2d(inputs[0].map(y => y / y_range), [
            inputs[0].length,
            1,
        ])

        return model
            .fit(xs, ys, {
                validationSplit: 0.8,
                epochs: Number(training_epochs),
            })
            .then(() => {
                // Saves the model for future training
                savedData['model'] = model
                return model.predict(xs).data()
            })
            .then(data => {
                const dataArray = Array.from(data).map(x => x * y_range)

                model.evaluate(xs, ys).print()
                // Creates the best fit line if there is only 1 input
                if (maxes.length === 1) {
                    const linePoints = []
                    for (let i = 0; i <= 10; i++) {
                        linePoints.push(i / 10.0)
                    }
                    const lineTensor = tf.tensor2d(linePoints, [
                        linePoints.length,
                        1,
                    ])
                    model
                        .predict(lineTensor)
                        .data()
                        .then(results => {
                            const dataArray = Array.from(results).map(
                                x => x * y_range
                            )
                            savedData['line'] = dataArray.map(
                                (currentValue, index) => [
                                    linePoints[index] * maxes[0],
                                    currentValue,
                                ]
                            )

                            const indices = new Set()
                            while (indices.size < 200) {
                                const index = Math.floor(
                                    Math.random() * inputs[0].length
                                )
                                indices.add(index)
                            }
                            savedData['samples'] = [...indices].map(index => [
                                inputs[1][index],
                                inputs[0][index],
                            ])
                        })
                }
                return dataArray
            })
    },
}
