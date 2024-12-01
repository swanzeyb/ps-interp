export default class PostScriptInterpreter {
  private scoping: 'dynamic' | 'static'

  constructor({ scoping }: { scoping: 'dynamic' | 'static' }) {
    this.scoping = scoping
  }

  // execute
  execute() {
    if (this.scoping === 'dynamic') {
      // dynamic scoping
    } else {
      // static scoping
    }
  }

  set stack(stack: any[]) {}

  // setScoping
  setScoping(scoping: 'dynamic' | 'static') {
    this.scoping = scoping
  }
}
