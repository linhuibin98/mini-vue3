import { camelize, toHandlerKey } from '../shared'

export function emit(instance, eventType, ...args) {
  // instance.props -> event
  const { props } = instance
  // TPP 开发，先写一个特定的例子，最后再抽象通用的方法
  // add -> Add
  // add-foo -> addFoo
  // AddFoo -> onAddFoo
  const handleName = toHandlerKey(camelize(eventType))
  const handle = props[handleName]
  handle && handle(...args)
}
