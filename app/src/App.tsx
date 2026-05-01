import { GraphProvider } from './state/GraphContext';
import { FormList } from './components/FormList/FormList';

function App() {
  return (
    <GraphProvider>
      <FormList />
    </GraphProvider>
  );
}

export default App;
