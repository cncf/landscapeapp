import ItemDialogContent from '../../components/ItemDialogContent';
import { LandscapeProvider } from '../../contexts/LandscapeContext'
const PrerenderedPage = ({ itemId, item }) => {
  return <LandscapeProvider entries={[]} pageParams = {{ mainContentMode: 'card-mode' }}>
      <style jsx global> {`
        .product-logo { width: 300px !important; zoom: 0.7; }
        .product-tags { width: 300px !important; zoom: 0.7; }
        .product-scroll { left: 380px !important; width: 550px !important; zoom: 0.7; }
      `}
      </style>
      <ItemDialogContent loading={false} itemInfo={item}/>
    </LandscapeProvider>
}

export async function getStaticProps(context) {
  const itemId = context.params.id;
  const items = JSON.parse(require('fs').readFileSync('public/data/items.json', 'utf-8'));
  const item = items.filter( (x) => x.name === itemId)[0];
  return { props: { itemId: itemId, item: item} }
}

export async function getStaticPaths() {
  const items = JSON.parse(require('fs').readFileSync('public/data/items.json', 'utf-8'));
  const paths = items.map( (item) =>  ({ params: { id: item.name }}));
  return { paths, fallback: false }
}

export default PrerenderedPage
