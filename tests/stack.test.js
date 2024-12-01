import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from './PostScriptInterpreter'

describe('Stack Manipulation Commands', () => {
  test('exch: should swap the top two elements of the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [1, 2]
    interpreter.execute('exch')
    expect(interpreter.stack).toEqual([2, 1])
  })

  test('pop: should remove the top element from the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [1, 2]
    interpreter.execute('pop')
    expect(interpreter.stack).toEqual([1])
  })

  test('copy: should duplicate the top n elements of the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [1, 2, 3, 2]
    interpreter.execute('copy')
    expect(interpreter.stack).toEqual([1, 2, 3, 1, 2])
  })

  test('dup: should duplicate the top element of the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [1]
    interpreter.execute('dup')
    expect(interpreter.stack).toEqual([1, 1])
  })

  test('clear: should clear all elements from the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [1, 2, 3]
    interpreter.execute('clear')
    expect(interpreter.stack).toEqual([])
  })

  test('count: should push the number of elements in the stack', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [1, 2, 3]
    interpreter.execute('count')
    expect(interpreter.stack).toEqual([1, 2, 3, 3])
  })
})
