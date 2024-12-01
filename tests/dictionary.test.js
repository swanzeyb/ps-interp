import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from './PostScriptInterpreter'

describe('Dictionary Operations', () => {
  test('dict: should create a new dictionary with a specified size', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [5]
    interpreter.execute('dict')
    expect(interpreter.stack).toEqual([{}])
  })

  test('length: should push the number of entries in the dictionary', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [{}]
    interpreter.execute('/key value def')
    interpreter.execute('/anotherKey anotherValue def')
    interpreter.execute('length')
    expect(interpreter.stack).toEqual([2])
  })

  test('begin: should push a dictionary to the execution context', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [{}]
    interpreter.execute('begin')
    expect(interpreter.currentScope()).toBe(interpreter.stack[0])
  })

  test('end: should remove the top dictionary from the execution context', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('5 dict begin')
    expect(interpreter.currentScope()).toBeInstanceOf(Object)
    interpreter.execute('end')
    expect(interpreter.currentScope()).not.toBeInstanceOf(Object)
  })

  test('def: should define a new key-value pair in the current dictionary', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('/key 42 def')
    expect(interpreter.currentScope()['key']).toEqual(42)
  })
})
