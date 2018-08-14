import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-15'
import { PCoords } from '../../../private/jsx/pcoords/pcoords'
// import * as Act from '../../../private/jsx/store/actions'
// import * as t from '../../../private/jsx/store/types'

Enzyme.configure({ adapter: new Adapter() })

describe('style()', () => {
    it('style() returns a certain value', () => {
        let wrapper = shallow(<PCoords />)
        const expected = {
            backgroundColor: 'white',
            width: 'calc(100vw - 280px)',
            height: '300px',
            position: 'fixed',
            overflow: 'hidden',
            bottom: '0px',
            right: '0',
            zIndex: '10',
            opacity: 0.5,
        }
        expect(wrapper.instance().style()).toEqual(expected)
    })
})
