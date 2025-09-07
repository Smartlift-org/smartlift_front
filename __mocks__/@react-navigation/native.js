export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  replace: jest.fn(),
  reset: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn()
});

export const useRoute = () => ({
  key: 'test-route-key',
  name: 'TestScreen',
  params: {},
  path: undefined
});

export const NavigationContainer = ({ children }) => children;

export const useFocusEffect = jest.fn();
export const useIsFocused = jest.fn(() => true);

export const CommonActions = {
  navigate: jest.fn((name, params) => ({ type: 'NAVIGATE', payload: { name, params } })),
  reset: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
};

export const StackActions = {
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  replace: jest.fn(),
};
