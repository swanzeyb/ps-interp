import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Boolean Operations', () => {
  test('eq: should push true if the top two elements are equal, false otherwise', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [5, 5]
    interpreter.execute('eq')
    expect(interpreter.operand_stack.stack).toEqual([true])

    interpreter.operand_stack.stack = [5, 3]
    interpreter.execute('eq')
    expect(interpreter.operand_stack.stack).toEqual([false])
  })

  test('ne: should push true if the top two elements are not equal, false otherwise', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [5, 3]
    interpreter.execute('ne')
    expect(interpreter.operand_stack.stack).toEqual([true])

    interpreter.operand_stack.stack = [5, 5]
    interpreter.execute('ne')
    expect(interpreter.operand_stack.stack).toEqual([false])
  })

  test('gt: should push true if the second-to-top element is greater than the top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [5, 3]
    interpreter.execute('gt')
    expect(interpreter.operand_stack.stack).toEqual([true])

    interpreter.operand_stack.stack = [3, 5]
    interpreter.execute('gt')
    expect(interpreter.operand_stack.stack).toEqual([false])
  })

  test('lt: should push true if the second-to-top element is less than the top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [3, 5]
    interpreter.execute('lt')
    expect(interpreter.operand_stack.stack).toEqual([true])

    interpreter.operand_stack.stack = [5, 3]
    interpreter.execute('lt')
    expect(interpreter.operand_stack.stack).toEqual([false])
  })

  test('and: should push the logical AND of the top two elements', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [true, true]
    interpreter.execute('and')
    expect(interpreter.operand_stack.stack).toEqual([true])

    interpreter.operand_stack.stack = [true, false]
    interpreter.execute('and')
    expect(interpreter.operand_stack.stack).toEqual([false])
  })

  test('or: should push the logical OR of the top two elements', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [true, false]
    interpreter.execute('or')
    expect(interpreter.operand_stack.stack).toEqual([true])

    interpreter.operand_stack.stack = [false, false]
    interpreter.execute('or')
    expect(interpreter.operand_stack.stack).toEqual([false])
  })

  test('not: should push the logical NOT of the top element', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [true]
    interpreter.execute('not')
    expect(interpreter.operand_stack.stack).toEqual([false])

    interpreter.operand_stack.stack = [false]
    interpreter.execute('not')
    expect(interpreter.operand_stack.stack).toEqual([true])
  })
})
