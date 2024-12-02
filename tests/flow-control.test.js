import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Flow Control Operations', () => {
  test('if: should execute the block if the condition is true', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('true { 2 3 add } if')
    expect(interpreter.stack).toEqual([5])
  })

  test('if: should not execute the block if the condition is false', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [false, '{2 3 add}']
    interpreter.execute('if')
    expect(interpreter.stack).toEqual([])
  })

  test('ifelse: should execute the first block if the condition is true', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [true, '{2 3 add}', '{4 5 mul}']
    interpreter.execute('ifelse')
    expect(interpreter.stack).toEqual([5])
  })

  test('ifelse: should execute the second block if the condition is false', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [false, '{2 3 add}', '{4 5 mul}']
    interpreter.execute('ifelse')
    expect(interpreter.stack).toEqual([20])
  })

  test('for: should iterate over the range and execute the block', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [1, 1, 3, '{dup}']
    interpreter.execute('for')
    expect(interpreter.stack).toEqual([1, 2, 3])
  })

  test('repeat: should execute the block a specified number of times', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [3, '{2 3 add}']
    interpreter.execute('repeat')
    expect(interpreter.stack).toEqual([5, 5, 5])
  })

  test('quit: should terminate execution', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [1, 2, '{quit}', 3]
    const result = interpreter.execute('quit')
    expect(result).toBe('TERMINATED') // Update with your implementation’s quit behavior
  })
})
