import styles from './app.module.css';

const products = [
  {
    name: 'Composable Checkout',
    description: 'A remote-owned checkout slice that can ship independently.',
    status: 'Ready',
  },
  {
    name: 'Inventory Pulse',
    description: 'Live stock visibility designed to plug into the shell route.',
    status: 'Beta',
  },
  {
    name: 'Price Rules',
    description: 'Shared domain logic surfaced by a separately deployed team.',
    status: 'Draft',
  },
];

export function App() {
  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Remote module</p>
        <h2>Products</h2>
        <p>
          This UI is rendered from the federated remote and mounted inside the
          shell route at runtime.
        </p>
      </div>

      <div className={styles.list}>
        {products.map((product) => (
          <article className={styles.card} key={product.name}>
            <div className={styles.row}>
              <h3>{product.name}</h3>
              <span className={styles.badge}>{product.status}</span>
            </div>
            <p>{product.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default App;
