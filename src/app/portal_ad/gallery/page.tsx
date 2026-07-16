import { getProducts } from '../../actions/products';
import GalleryClient from './GalleryClient';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const products = await getProducts();
  
  return (
    <div style={{ background: '#050208', minHeight: '100vh', color: '#fff' }}>
      <GalleryClient initialProducts={products} />
    </div>
  );
}
