import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from './PostScriptInterpreter'

describe('String Operations', () => {
  test('length: should push the length of a string onto the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = ['hello']
    interpreter.execute('length')
    expect(interpreter.stack).toEqual(['hello', 5])
  })

  test('get: should push the character at the specified index onto the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = ['hello', 1]
    interpreter.execute('get')
    expect(interpreter.stack).toEqual(['e'.charCodeAt(0)]) // PostScript uses char codes
  })

  test('getinterval: should push a substring onto the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = ['hello', 1, 3]
    interpreter.execute('getinterval')
    expect(interpreter.stack).toEqual(['ell'])
  })

  test('putinterval: should replace a substring in the original string', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = ['hello', 1, 'abc']
    interpreter.execute('putinterval')
    expect(interpreter.stack).toEqual(['habco'])
  })
})
