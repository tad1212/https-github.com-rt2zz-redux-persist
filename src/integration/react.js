// @flow
import React, { PureComponent } from 'react' // eslint-disable-line import/no-unresolved
import type { Node } from 'react' // eslint-disable-line import/no-unresolved
import type { Persistor } from '../types'

type Props = {
  onBeforeLift?: Function,
  children?: Node | Function,
  loading?: Node,
  persistor: Persistor,
}

type State = {
  bootstrapped: boolean,
}

export class PersistGate extends PureComponent<Props, State> {
  static defaultProps = {
    loading: null,
  }

  state = {
    bootstrapped: false,
  }
  _unsubscribe: ?Function

  componentDidMount() {
    this._unsubscribe = this.props.persistor.subscribe(
      this.handlePersistorState
    )
    this.handlePersistorState()
  }

  handlePersistorState = () => {
    const { persistor } = this.props
    let { bootstrapped } = persistor.getState()
    if (bootstrapped) {
      if (this.props.onBeforeLift) {
        Promise.resolve(this.props.onBeforeLift())
          .then(() => this.setState({ bootstrapped: true }))
          .catch(() => this.setState({ bootstrapped: true }))
      } else {
        this.setState({ bootstrapped: true })
      }
      this._unsubscribe && this._unsubscribe()
    }
  }

  componentWillUnmount() {
    this._unsubscribe && this._unsubscribe()
  }

  render() {
    const { children, loading } = this.props

    if (process.env.NODE_ENV !== 'production') {
      if (typeof children === 'function' && loading)
        console.error(
          'redux-persist: PersistGate expects either a function child or loading prop, but not both. The loading prop will be ignored.'
        )
    }
    if (typeof children === 'function') {
      return children(this.state.bootstrapped)
    }

    if (this.state.bootstrapped) {
      if (children) {
        return children
      }
      return null
    } else if (loading) {
      return loading
    } else {
      return null
    }
  }
}
