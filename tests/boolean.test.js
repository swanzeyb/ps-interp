import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Boolean Operations', () => {
  test('eq: should push true if the top two elements are equal, false otherwise', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [5, 5]
    interpreter.execute('eq')
    expect(interpreter.stack).toEqual([true])

    interpreter.stack = [5, 3]
    interpreter.execute('eq')
    expect(interpreter.stack).toEqual([false])
  })

  test('ne: should push true if the top two elements are not equal, false otherwise', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [5, 3]
    interpreter.execute('ne')
    expect(interpreter.stack).toEqual([true])

    interpreter.stack = [5, 5]
    interpreter.execute('ne')
    expect(interpreter.stack).toEqual([false])
  })

  test('gt: should push true if the second-to-top element is greater than the top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [5, 3]
    interpreter.execute('gt')
    expect(interpreter.stack).toEqual([true])

    interpreter.stack = [3, 5]
    interpreter.execute('gt')
    expect(interpreter.stack).toEqual([false])
  })

  test('lt: should push true if the second-to-top element is less than the top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [3, 5]
    interpreter.execute('lt')
    expect(interpreter.stack).toEqual([true])

    interpreter.stack = [5, 3]
    interpreter.execute('lt')
    expect(interpreter.stack).toEqual([false])
  })

  test('and: should push the logical AND of the top two elements', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [true, true]
    interpreter.execute('and')
    expect(interpreter.stack).toEqual([true])

    interpreter.stack = [true, false]
    interpreter.execute('and')
    expect(interpreter.stack).toEqual([false])
  })

  test('or: should push the logical OR of the top two elements', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [true, false]
    interpreter.execute('or')
    expect(interpreter.stack).toEqual([true])

    interpreter.stack = [false, false]
    interpreter.execute('or')
    expect(interpreter.stack).toEqual([false])
  })

  test('not: should push the logical NOT of the top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [true]
    interpreter.execute('not')
    expect(interpreter.stack).toEqual([false])

    interpreter.stack = [false]
    interpreter.execute('not')
    expect(interpreter.stack).toEqual([true])
  })
})