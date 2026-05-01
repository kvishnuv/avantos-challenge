import { GraphProvider, useGraphState } from './state/GraphContext';
import { PrefillProvider } from './state/PrefillContext';
import { FormList } from './components/FormList/FormList';
import { FormDetail } from './components/FormDetail/FormDetail';
import styles from './App.module.css';

function App() {
  return (
    <GraphProvider>
      <PrefillProvider>
        <Shell />
      </PrefillProvider>
    </GraphProvider>
  );
}

function Shell() {
  const state = useGraphState();
  const title = state.status === 'ready' ? state.graph.name : 'Avantos';
  return (
    <div className={styles.layout}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.left}>
        <FormList />
      </div>
      <div className={styles.right}>
        <FormDetail />
      </div>
    </div>
  );
}

export default App;
