import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Dictionary Operations', () => {
  test('dict: should create a new dictionary with a specified size', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.stack = [5]
    interpreter.execute('dict')
    expect(typeof interpreter.stack.at(0)).toEqual('object')
    expect(interpreter.stack.at(0)['__global__']).toEqual(false)
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
    const new_dict = {}
    interpreter.stack = [new_dict]
    interpreter.execute('begin')
    expect(interpreter.current_scope()).toBe(new_dict)
  })

  test('end: should remove the top dictionary from the execution context', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('5 dict begin')
    expect(interpreter.current_scope()['__global__']).toBe(false)
    interpreter.execute('end')
    expect(interpreter.current_scope()['__global__']).toBe(true)
  })

  test('def: should define a new key-value pair in the current dictionary', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('/key 42 def')
    expect(interpreter.current_scope()['key']).toEqual(42)
  })
})
