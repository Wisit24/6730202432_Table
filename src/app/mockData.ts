export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  sku?: string;
  brand?: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: '[BY ORDER] GAMING DESK (โต๊ะเกมมิ่ง) NEOLUTION E-SPORT MANTLE II BLACK TOP RED FRAME (120 x 60 x 76) (1Y)',
    price: 1790,
    stock: 5,
    category: 'โต๊ะเกมมิ่ง',
    imageUrl: 'https://via.placeholder.com/400',
    sku: 'SKU-260647831',
    brand: 'NEOLUTION',
  },
];