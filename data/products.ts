import { Product } from '../types';

interface ProductTranslations {
  [key: string]: Product[];
}

export const productsData: ProductTranslations = {
  en: [
    // FIX: Added missing 'supplierName' property.
    {
      id: 1,
      name: 'Organic Compost',
      description: 'Rich, dark compost to improve soil structure and fertility. Perfect for all types of plants.',
      price: 1330,
      image: '/images/compost.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 2,
      name: 'Vermicompost (Worm Castings)',
      description: 'Nutrient-dense worm castings that boost plant growth and health. Excellent for seedlings.',
      price: 1870,
      image: '/images/vermicompost.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 3,
      name: 'Neem Cake Fertilizer',
      description: 'An organic fertilizer that also acts as a natural pesticide, protecting plants from soil-borne pests.',
      price: 1560,
      image: '/images/neem-cake.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 4,
      name: 'Cow Dung Manure',
      description: 'Aged and composted cow manure, a traditional and effective all-purpose fertilizer.',
      price: 1000,
      image: '/images/cow-dung.jpg',
      supplierName: 'Agri Supplies'
    }
  ],
  hi: [
    // FIX: Added missing 'supplierName' property.
    {
      id: 1,
      name: 'जैविक खाद',
      description: 'मिट्टी की संरचना और उर्वरता में सुधार के लिए समृद्ध, गहरी खाद। सभी प्रकार के पौधों के लिए उत्तम।',
      price: 1330,
      image: '/images/compost.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 2,
      name: 'वर्मीकम्पोस्ट (केंचुआ खाद)',
      description: 'पोषक तत्वों से भरपूर केंचुआ खाद जो पौधों की वृद्धि और स्वास्थ्य को बढ़ावा देती है। अंकुर के लिए उत्कृष्ट।',
      price: 1870,
      image: '/images/vermicompost.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 3,
      name: 'नीम खली उर्वरक',
      description: 'एक जैविक उर्वरक जो प्राकृतिक कीटनाशक के रूप में भी काम करता है, पौधों को मिट्टी जनित कीटों से बचाता है।',
      price: 1560,
      image: '/images/neem-cake.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 4,
      name: 'गोबर की खाद',
      description: 'पुरानी और कंपोस्ट की हुई गोबर की खाद, एक पारंपरिक और प्रभावी सर्व-उद्देश्यीय उर्वरक।',
      price: 1000,
      image: '/images/cow-dung.jpg',
      supplierName: 'Agri Supplies'
    }
  ],
  mr: [
    // FIX: Added missing 'supplierName' property.
    {
      id: 1,
      name: 'सेंद्रिय कंपोस्ट',
      description: 'मातीची रचना आणि सुपीकता सुधारण्यासाठी समृद्ध, गडद कंपोस्ट. सर्व प्रकारच्या वनस्पतींसाठी योग्य.',
      price: 1330,
      image: '/images/compost.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 2,
      name: 'वर्मीकंपोस्ट (गांडूळ खत)',
      description: 'पौष्टिक गांडूळ खत जे वनस्पतींची वाढ आणि आरोग्य वाढवते. रोपांसाठी उत्कृष्ट.',
      price: 1870,
      image: '/images/vermicompost.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 3,
      name: 'निंबोळी पेंड खत',
      description: 'एक सेंद्रिय खत जे नैसर्गिक कीटकनाशक म्हणून देखील कार्य करते, वनस्पतींना मातीजन्य कीटकांपासून वाचवते.',
      price: 1560,
      image: '/images/neem-cake.jpg',
      supplierName: 'Agri Supplies'
    },
    // FIX: Added missing 'supplierName' property.
    {
      id: 4,
      name: 'शेणखत',
      description: 'जुने आणि कंपोस्ट केलेले शेणखत, एक पारंपारिक आणि प्रभावी सर्व-उद्देशीय खत.',
      price: 1000,
      image: '/images/cow-dung.jpg',
      supplierName: 'Agri Supplies'
    }
  ]
};