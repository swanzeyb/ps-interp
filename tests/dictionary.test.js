import { describe, test, expect } from 'bun:test'
import PostScriptInterpreter from '../PostScriptInterpreter'

describe('Dictionary Operations', () => {
  test('dict: should create a new dictionary with a specified size', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [5]
    interpreter.execute('dict')
    expect(typeof interpreter.operand_stack.stack.at(0)).toEqual('object')
    expect(interpreter.operand_stack.stack.at(0)['__global__']).toEqual(false)
  })

  test('length: should push the number of entries in the dictionary', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.operand_stack.stack = [{ __global__: false, x: 42, y: 43 }]
    interpreter.execute('length')
    expect(interpreter.operand_stack.stack).toEqual([2])
  })

  test('begin: should push a dictionary to the execution context', () => {
    const interpreter = new PostScriptInterpreter()
    const new_dict = {}
    interpreter.operand_stack.stack = [new_dict]
    interpreter.execute('begin')
    expect(interpreter.current_dictionary).toBe(new_dict)
  })

  test('end: should remove the top dictionary from the execution context', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('5 dict begin')
    expect(interpreter.current_dictionary['__global__']).toBe(false)
    interpreter.execute('end')
    expect(interpreter.current_dictionary['__global__']).toBe(true)
  })

  test('def: should define a new key-value pair in the current dictionary', () => {
    const interpreter = new PostScriptInterpreter()
    interpreter.execute('/key 42 def')
    interpreter.execute('/key 42 def')
    expect(interpreter.current_dictionary['key']).toEqual(42)
  })
})
