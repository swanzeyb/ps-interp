import PostScriptInterpreter from './PostScriptInterpreter'

const interpreter = new PostScriptInterpreter({ scoping: 'dynamic' })
interpreter.repl()
