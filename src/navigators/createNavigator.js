import React from 'react';
import { polyfill } from 'react-lifecycles-compat';

import getChildEventSubscriber from '../getChildEventSubscriber';

function createNavigator(NavigatorView, router, navigationConfig) {
  class Navigator extends React.Component {
    static router = router;
    static navigationOptions = null;

    state = {
      descriptors: {},
      screenProps: undefined,
    };

    static getDerivedStateFromProps(nextProps, prevState) {
      const prevDescriptors = prevState.descriptors;
      const { navigation, screenProps } = nextProps;
      const { dispatch, state, addListener } = navigation;
      const { routes } = state;
      const descriptors = {};

      routes.forEach(route => {
        if (
          prevDescriptors &&
          prevDescriptors[route.key] &&
          route === prevDescriptors[route.key].state &&
          screenProps === prevState.screenProps
        ) {
          descriptors[route.key] = prevDescriptors[route.key];
          return;
        }
        const getComponent = () =>
          router.getComponentForRouteName(route.routeName);
        const childNavigation = navigation.getChildNavigation(route.key);
        const options = router.getScreenOptions(childNavigation, screenProps);
        descriptors[route.key] = {
          key: route.key,
          getComponent,
          options,
          state: route,
          navigation: childNavigation,
        };
      });

      return { descriptors, screenProps };
    }

    render() {
      return (
        <NavigatorView
          {...this.props}
          screenProps={this.state.screenProps}
          navigation={this.props.navigation}
          navigationConfig={navigationConfig}
          descriptors={this.state.descriptors}
        />
      );
    }
  }

  return polyfill(Navigator);
}

export default createNavigator;
