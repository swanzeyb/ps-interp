import PostScriptInterpreter from './PostScriptInterpreter'

const use_static = process.argv.includes('--static')

console.log(`Using ${use_static ? 'static' : 'dynamic'} scoping`)

const interpreter = new PostScriptInterpreter({
  scoping: use_static ? 'static' : 'dynamic',
})

interpreter.repl()
