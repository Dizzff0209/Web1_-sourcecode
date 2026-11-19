/**
 * RAINBUSHOP - Data Layer & LocalStorage Management
 * Manages Categories, Products, Users, Orders, Cart, and Current Session
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    PRODUCTS: 'rainbu_products',
    CATEGORIES: 'rainbu_categories',
    USERS: 'rainbu_users',
    ORDERS: 'rainbu_orders',
    CART: 'rainbu_cart',
    CURRENT_USER: 'rainbu_current_user'
  };

  // Seed Categories
  const DEFAULT_CATEGORIES = [
    { id: 'cat1', name: 'Giày Bóng Rổ', slug: 'giay-bong-ro' },
    { id: 'cat2', name: 'Giày Sneaker', slug: 'giay-sneaker' },
    { id: 'cat3', name: 'Quần Áo Bóng Rổ', slug: 'quan-ao-bong-ro' },
    { id: 'cat4', name: 'Banh Bóng Rổ', slug: 'banh-bong-ro' },
    { id: 'cat5', name: 'Phụ Kiện & Vớ', slug: 'phu-kien-vo' }
  ];

  // Seed Products
  const DEFAULT_PRODUCTS = [
    // --- cat1: Giày Bóng Rổ ---
    {
      id: 'prod_01',
      sku: 'KB6-RG-01',
      name: "Nike Kobe 6 Protro 'Reverse Grinch'",
      categoryId: 'cat1',
      price: 4850000,
      originalPrice: 5500000,
      description: "Huyền thoại trở lại với phối màu đỏ rực rỡ 'Reverse Grinch'. Bộ đệm Zoom Turbo linh hoạt ở mũi chân cùng đế ngoài có độ bám sân đỉnh cao, tối ưu cho những pha chuyển hướng tốc độ của các sát thủ trên sân bóng.",
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      sizes: ['40', '41', '42', '42.5', '43', '44', '45'],
      isHidden: false
    },
    {
      id: 'prod_02',
      sku: 'LB21-AK-02',
      name: "Nike LeBron 21 'Akoya'",
      categoryId: 'cat1',
      price: 3950000,
      originalPrice: 4500000,
      description: "Lấy cảm hứng từ ngọc trai Akoya quý hiếm, LeBron 21 sở hữu hệ thống dây cáp cáp đa hướng 360 độ và bộ đệm Zoom Air kết hợp bọt Cushlon 2.0, bảo vệ tối đa những pha va chạm mạnh.",
      image: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=800&q=80',
      sizes: ['41', '42', '42.5', '43', '44'],
      isHidden: false
    },
    {
      id: 'prod_03',
      sku: 'KD16-AP-03',
      name: "Nike KD 16 'Aunt Pearl'",
      categoryId: 'cat1',
      price: 3650000,
      originalPrice: 4200000,
      description: "Phối màu tri ân người dì Pearl của Kevin Durant. Thiết kế tông hồng tinh tế, kết hợp bộ đệm Nike Air ở gót và Zoom Air ở mũi giúp hoàn trả năng lượng mượt mà trên từng bước chạy.",
      image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80',
      sizes: ['40', '41', '42', '43', '44'],
      isHidden: false
    },
    {
      id: 'prod_04',
      sku: 'CR11-FC-04',
      name: "Under Armour Curry 11 'Future Curry'",
      categoryId: 'cat1',
      price: 3450000,
      originalPrice: 3900000,
      description: "Trang bị công nghệ đệm kép UA Flow nhẹ tênh và siêu bám sàn không cần cao su. Trải nghiệm cảm giác dừng giật bắn 3 điểm chuẩn xác như tay ném vĩ đại Stephen Curry.",
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      sizes: ['41', '42', '43', '44', '45'],
      isHidden: false
    },
    {
      id: 'prod_05',
      sku: 'GTC3-SW-05',
      name: "Nike G.T. Cut 3 'Summit White'",
      categoryId: 'cat1',
      price: 4200000,
      originalPrice: 4800000,
      description: "Mẫu giày đầu tiên của Nike Basketball được trang bị lớp đệm bọt ZoomX đỉnh cao, mang lại độ nảy tối đa và phản hồi lực tức thì cho các hậu vệ kiến thiết.",
      image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80',
      sizes: ['40', '41', '42', '42.5', '43', '44'],
      isHidden: false
    },
    {
      id: 'prod_06',
      sku: 'LK2-SH-06',
      name: "Jordan Luka 2 'Space Hunter'",
      categoryId: 'cat1',
      price: 2950000,
      originalPrice: 3400000,
      description: "Được thiết kế riêng cho lối chơi step-back trứ danh của Luka Dončić. Cấu trúc khung nâng đỡ Formula 23 kết hợp đệm bọt bảo vệ mắt cá chân toàn diện.",
      image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      sizes: ['40', '41', '42', '43', '44'],
      isHidden: false
    },
    {
      id: 'prod_07',
      sku: 'HD8-FL-07',
      name: "Adidas Harden Vol 8 'Flamingo'",
      categoryId: 'cat1',
      price: 3250000,
      originalPrice: 3800000,
      description: "Thiết kế tương lai ấn tượng từ James Harden. Lớp vỏ foam bảo vệ bao bọc lấy bộ đệm BOOST êm ái, hỗ trợ chuyển đổi trạng thái tấn công chớp nhoáng.",
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      sizes: ['41', '42', '43', '44'],
      isHidden: false
    },
    {
      id: 'prod_08',
      sku: 'JA1-SC-08',
      name: "Nike Ja 1 'Scratch'",
      categoryId: 'cat1',
      price: 2850000,
      originalPrice: 3200000,
      description: "Dành cho những cú nhảy úp rổ bùng nổ của Ja Morant. Zoom Air ở mũi chân cùng hệ thống khóa chân chắc chắn cho bạn tự tin bật cao thống trị bảng rổ.",
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      sizes: ['40', '41', '42', '42.5', '43', '44'],
      isHidden: false
    },

    // --- cat2: Giày Sneaker ---
    {
      id: 'prod_09',
      sku: 'AJ1-LF-09',
      name: "Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
      categoryId: 'cat2',
      price: 5200000,
      originalPrice: 6000000,
      description: "Kiệt tác sneaker sống mãi với thời gian. Thiết kế da nứt vintage tái hiện nguyên bản đôi giày năm 1985 huyền thoại của Michael Jordan.",
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80',
      sizes: ['40', '41', '42', '42.5', '43', '44'],
      isHidden: false
    },
    {
      id: 'prod_10',
      sku: 'DUNK-PD-10',
      name: "Nike Dunk Low Retro 'Panda' Black White",
      categoryId: 'cat2',
      price: 2350000,
      originalPrice: 2800000,
      description: "Đôi giày quốc dân không thể thiếu trong tủ đồ streetwear. Tông màu đen trắng tương phản cổ điển, phối đồ cực chuẩn với mọi trang phục.",
      image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=800&q=80',
      sizes: ['39', '40', '41', '42', '43', '44'],
      isHidden: false
    },
    {
      id: 'prod_11',
      sku: 'AJ4-MB-11',
      name: "Air Jordan 4 Retro 'Military Black'",
      categoryId: 'cat2',
      price: 6800000,
      originalPrice: 7500000,
      description: "Một trong những phối màu Jordan 4 được săn đón nhiều nhất thế giới. Chất liệu da cao cấp kết hợp các chi tiết lưới và cánh nhựa đặc trưng.",
      image: 'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?auto=format&fit=crop&w=800&q=80',
      sizes: ['40', '41', '42', '43', '44'],
      isHidden: false
    },
    {
      id: 'prod_12',
      sku: 'NB550-WG-12',
      name: "New Balance 550 'White Green'",
      categoryId: 'cat2',
      price: 2750000,
      originalPrice: 3100000,
      description: "Thiết kế giày bóng rổ cổ điển phong cách retro thập niên 80. Da trơn bền bỉ phối viền xanh lá vintage, tôn lên gu thời trang đường phố trẻ trung.",
      image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
      sizes: ['40', '41', '42', '43'],
      isHidden: false
    },

    // --- cat3: Quần Áo Bóng Rổ ---
    {
      id: 'prod_13',
      sku: 'MN-LAL24-13',
      name: "Áo Đấu Mitchell & Ness Lakers Kobe Bryant #24",
      categoryId: 'cat3',
      price: 1450000,
      originalPrice: 1800000,
      description: "Áo đấu Swingman chính hãng Mitchell & Ness. Thêu sắc nét tên và số 24 của Black Mamba, chất liệu lưới thoáng khí chuẩn thi đấu NBA.",
      image: 'https://images.unsplash.com/photo-1577212017184-80cc0da11082?auto=format&fit=crop&w=800&q=80',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      isHidden: false
    },
    {
      id: 'prod_14',
      sku: 'SW-GSW30-14',
      name: "Áo Đấu Golden State Warriors Stephen Curry #30",
      categoryId: 'cat3',
      price: 1350000,
      originalPrice: 1650000,
      description: "Áo đấu Nike NBA Golden State Warriors bản Association Edition. Công nghệ Dri-FIT thấm hút mồ hôi tối ưu, đem lại sự mát mẻ suốt buổi tập.",
      image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80',
      sizes: ['M', 'L', 'XL', 'XXL'],
      isHidden: false
    },
    {
      id: 'prod_15',
      sku: 'NK-DFSH-15',
      name: "Quần Đấu Bóng Rổ Nike Dri-FIT Elite Hoops",
      categoryId: 'cat3',
      price: 650000,
      originalPrice: 850000,
      description: "Quần bóng rổ form rộng rãi thoải mái chuẩn bóng rổ Mỹ. Vải dệt kim nhẹ với công nghệ thoát nhiệt, cạp chun co giãn kèm dây rút bản lớn tiện lợi.",
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
      sizes: ['S', 'M', 'L', 'XL'],
      isHidden: false
    },
    {
      id: 'prod_16',
      sku: 'NK-HOOD-16',
      name: "Áo Hoodie Nike Basketball Standard Issue Cao Cấp",
      categoryId: 'cat3',
      price: 1250000,
      originalPrice: 1500000,
      description: "Áo hoodie nỉ bông cao cấp giữ ấm trước và sau trận đấu. Túi khóa kéo tiện ích an toàn đựng điện thoại, ví khi di chuyển tới sân bóng.",
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      sizes: ['M', 'L', 'XL'],
      isHidden: false
    },

    // --- cat4: Banh Bóng Rổ ---
    {
      id: 'prod_17',
      sku: 'MLT-BG45-17',
      name: "Banh Bóng Rổ Molten BG4500 Da PU Tiêu Chuẩn FIBA",
      categoryId: 'cat4',
      price: 1450000,
      originalPrice: 1700000,
      description: "Bóng thi đấu chính thức tại các giải đấu đỉnh cao FIBA và VBA. Da tổng hợp PU cao cấp vân sần bám tay tuyệt đối, độ nảy cực kỳ chuẩn xác và ổn định.",
      image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80',
      sizes: ['Size 7'],
      isHidden: false
    },
    {
      id: 'prod_18',
      sku: 'SPD-TF10-18',
      name: "Banh Bóng Rổ Spalding TF-1000 Legacy Da Vi Sợi",
      categoryId: 'cat4',
      price: 1650000,
      originalPrice: 1950000,
      description: "Dòng bóng trong nhà danh tiếng từ Spalding. Lớp da vi sợi độc quyền hút ẩm mồ hôi tay, duy trì độ ma sát tối đa trong các trận cầu căng thẳng.",
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
      sizes: ['Size 7'],
      isHidden: false
    },
    {
      id: 'prod_19',
      sku: 'WLS-EVO-19',
      name: "Banh Bóng Rổ Wilson Evolution Indoor Basketball",
      categoryId: 'cat4',
      price: 1850000,
      originalPrice: 2200000,
      description: "Quả bóng rổ số 1 tại các giải đấu học sinh, sinh viên Hoa Kỳ. Cảm giác bóng siêu mềm với các rãnh cao su gia cố cho đường chuyền chính xác đến từng milimet.",
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      sizes: ['Size 7'],
      isHidden: false
    },
    {
      id: 'prod_20',
      sku: 'MLT-BG38-20',
      name: "Banh Bóng Rổ Molten BG3800 Outdoor & Indoor",
      categoryId: 'cat4',
      price: 950000,
      originalPrice: 1150000,
      description: "Lựa chọn hoàn hảo cho cả sân bê tông ngoài trời lẫn sân gỗ trong nhà. Độ bền bỉ vượt trội, chống mài mòn cao trong điều kiện thời tiết nhiệt đới.",
      image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80',
      sizes: ['Size 7'],
      isHidden: false
    },

    // --- cat5: Phụ Kiện & Vớ ---
    {
      id: 'prod_21',
      sku: 'NK-ELT-21',
      name: "Vớ Bóng Rổ Nike Elite Crew Cổ Cao Chính Hãng",
      categoryId: 'cat5',
      price: 280000,
      originalPrice: 350000,
      description: "Vớ bóng rổ quốc dân được các baller tin dùng. Đệm êm ở gót và mũi chân giảm chấn thương, dải vòm ôm sát lòng bàn chân chống trơn trượt.",
      image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80',
      sizes: ['M (38-42)', 'L (42-46)'],
      isHidden: false
    },
    {
      id: 'prod_22',
      sku: 'MCD-HEX-22',
      name: "Bó Gối Bóng Rổ McDavid Hex 6446 Chống Va Đập",
      categoryId: 'cat5',
      price: 650000,
      originalPrice: 790000,
      description: "Công nghệ đệm lục giác Hex 9mm ôm trọn đầu gối, phân tán lực va chạm tức thì. Vải nén co giãn 4 chiều hỗ trợ cơ bắp và lưu thông máu hiệu quả.",
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      sizes: ['M', 'L', 'XL'],
      isHidden: false
    },
    {
      id: 'prod_23',
      sku: 'NK-WRIST-23',
      name: "Băng Đeo Cổ Tay Nike Swoosh Wristbands (Bộ 2 cái)",
      categoryId: 'cat5',
      price: 190000,
      originalPrice: 250000,
      description: "Băng cổ tay thấm mồ hôi bằng sợi dệt cotton pha co giãn. Giúp bạn luôn khô ráo và tự tin xử lý bóng trong suốt trận đấu.",
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      sizes: ['Freesize'],
      isHidden: false
    },
    {
      id: 'prod_24',
      sku: 'NK-BAG-24',
      name: "Balo Bóng Rổ Chuyên Dụng Nike Hoops Elite Pro 32L",
      categoryId: 'cat5',
      price: 1550000,
      originalPrice: 1900000,
      description: "Thiết kế ngăn chứa riêng biệt cho giày bóng rổ lên tới size 47 và bóng rổ size 7. Đệm quai Pro Adapt êm ái chống đau vai khi mang đồ tập nặng.",
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      sizes: ['Freesize (32L)'],
      isHidden: false
    }
  ];

  // Seed Users (1 Admin + 7 Khách hàng tương ứng 10 đơn hàng)
  const DEFAULT_USERS = [
    {
      id: 'usr_admin',
      fullName: 'Quản Trị Viên RainbuShop',
      username: 'admin',
      password: '123456',
      phone: '0901234567',
      address: '1283 Phạm Thế Hiển, Phường 5, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      role: 'admin',
      isLocked: false
    },
    {
      id: 'u1',
      fullName: 'Nguyễn Văn An',
      username: 'nguyenvanan',
      password: '123456',
      phone: '0912345001',
      address: '123 Nguyễn Huệ, Phường Bến Nghé, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      role: 'user',
      isLocked: false
    },
    {
      id: 'u2',
      fullName: 'Trần Thị Bích',
      username: 'tranbich',
      password: '123456',
      phone: '0912345002',
      address: '456 Lê Văn Sỹ, Phường 12, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      role: 'user',
      isLocked: false
    },
    {
      id: 'u3',
      fullName: 'Lê Hoàng Cường',
      username: 'lecuong',
      password: '123456',
      phone: '0912345003',
      address: '789 Cách Mạng Tháng 8, Phường 6, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      role: 'user',
      isLocked: false
    },
    {
      id: 'u4',
      fullName: 'Phạm Minh Đức',
      username: 'phamduc',
      password: '123456',
      phone: '0912345004',
      address: '321 Trần Hưng Đạo, Phường Cô Giang, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      role: 'user',
      isLocked: false
    },
    {
      id: 'u5',
      fullName: 'Võ Thanh Em',
      username: 'vothanh',
      password: '123456',
      phone: '0912345005',
      address: '654 Hai Bà Trưng, Phường Tân Định, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      role: 'user',
      isLocked: false
    },
    {
      id: 'u6',
      fullName: 'Huỳnh Ngọc Phú',
      username: 'huynhphu',
      password: '123456',
      phone: '0912345006',
      address: '987 Tạ Quang Bửu, Phường 4, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      role: 'user',
      isLocked: true
    },
    {
      id: 'usr_customer_01',
      fullName: 'Nguyễn Văn Hùng',
      username: 'customer',
      password: '123',
      phone: '0987654321',
      address: '123 Nguyễn Thị Minh Khai, Phường Phạm Ngũ Lão, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      role: 'user',
      isLocked: false
    }
  ];

  // Seed Orders (Đúng 10 đơn hàng mẫu tương ứng các khách hàng, địa chỉ theo phường)
  const DEFAULT_ORDERS = [
    {
      id: 'ord_sample_01',
      orderId: 'ORD-20260815-001',
      userId: 'usr_customer_01',
      customerName: 'Nguyễn Văn Hùng',
      phone: '0987654321',
      address: '123 Nguyễn Thị Minh Khai, Phường Phạm Ngũ Lão',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_01',
          productName: "Nike Kobe 6 Protro 'Reverse Grinch'",
          price: 4850000,
          size: '42.5',
          quantity: 1
        }
      ],
      totalAmount: 4850000,
      paymentMethod: 'COD',
      status: 'Đã giao thành công',
      orderDate: '2026-08-15 09:30:00'
    },
    {
      id: 'ord_sample_02',
      orderId: 'ORD-20260828-002',
      userId: 'u1',
      customerName: 'Nguyễn Văn An',
      phone: '0912345001',
      address: '123 Nguyễn Huệ, Phường Bến Nghé',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_02',
          productName: "Nike LeBron 21 'Akoya'",
          price: 3950000,
          size: '42',
          quantity: 1
        },
        {
          productId: 'prod_21',
          productName: 'Vớ Bóng Rổ Nike Elite Crew Cổ Cao Chính Hãng',
          price: 280000,
          size: 'L (42-46)',
          quantity: 1
        }
      ],
      totalAmount: 4230000,
      paymentMethod: 'Banking',
      status: 'Đã giao thành công',
      orderDate: '2026-08-28 14:15:00'
    },
    {
      id: 'ord_sample_03',
      orderId: 'ORD-20260905-003',
      userId: 'u2',
      customerName: 'Trần Thị Bích',
      phone: '0912345002',
      address: '456 Lê Văn Sỹ, Phường 12',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_09',
          productName: "Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
          price: 5200000,
          size: '41',
          quantity: 1
        }
      ],
      totalAmount: 5200000,
      paymentMethod: 'Banking',
      status: 'Đã giao thành công',
      orderDate: '2026-09-05 11:20:00'
    },
    {
      id: 'ord_sample_04',
      orderId: 'ORD-20260912-004',
      userId: 'u3',
      customerName: 'Lê Hoàng Cường',
      phone: '0912345003',
      address: '789 Cách Mạng Tháng 8, Phường 6',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_17',
          productName: 'Banh Bóng Rổ Molten BG4500 Da PU Tiêu Chuẩn FIBA',
          price: 1450000,
          size: 'Size 7',
          quantity: 1
        },
        {
          productId: 'prod_15',
          productName: 'Quần Đấu Bóng Rổ Nike Dri-FIT Elite Hoops',
          price: 650000,
          size: 'L',
          quantity: 1
        }
      ],
      totalAmount: 2100000,
      paymentMethod: 'COD',
      status: 'Đã giao thành công',
      orderDate: '2026-09-12 16:45:00'
    },
    {
      id: 'ord_sample_05',
      orderId: 'ORD-20260920-005',
      userId: 'u4',
      customerName: 'Phạm Minh Đức',
      phone: '0912345004',
      address: '321 Trần Hưng Đạo, Phường Cô Giang',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_05',
          productName: "Nike G.T. Cut 3 'Summit White'",
          price: 4200000,
          size: '42.5',
          quantity: 1
        },
        {
          productId: 'prod_13',
          productName: 'Áo Đấu Mitchell & Ness Lakers Kobe Bryant #24',
          price: 1450000,
          size: 'XL',
          quantity: 1
        }
      ],
      totalAmount: 5650000,
      paymentMethod: 'Banking',
      status: 'Đã giao thành công',
      orderDate: '2026-09-20 10:10:00'
    },
    {
      id: 'ord_sample_06',
      orderId: 'ORD-20260928-006',
      userId: 'u1',
      customerName: 'Nguyễn Văn An',
      phone: '0912345001',
      address: '123 Nguyễn Huệ, Phường Bến Nghé',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_10',
          productName: "Nike Dunk Low Retro 'Panda' Black White",
          price: 2350000,
          size: '42',
          quantity: 1
        }
      ],
      totalAmount: 2350000,
      paymentMethod: 'COD',
      status: 'Đã xác nhận',
      orderDate: '2026-09-28 17:30:00'
    },
    {
      id: 'ord_sample_07',
      orderId: 'ORD-20261005-007',
      userId: 'u5',
      customerName: 'Võ Thanh Em',
      phone: '0912345005',
      address: '654 Hai Bà Trưng, Phường Tân Định',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_04',
          productName: "Under Armour Curry 11 'Future Curry'",
          price: 3450000,
          size: '43',
          quantity: 1
        },
        {
          productId: 'prod_22',
          productName: 'Bó Gối Bóng Rổ McDavid Hex 6446 Chống Va Đập',
          price: 650000,
          size: 'L',
          quantity: 1
        }
      ],
      totalAmount: 4100000,
      paymentMethod: 'COD',
      status: 'Đã xác nhận',
      orderDate: '2026-10-05 13:00:00'
    },
    {
      id: 'ord_sample_08',
      orderId: 'ORD-20261010-008',
      userId: 'u2',
      customerName: 'Trần Thị Bích',
      phone: '0912345002',
      address: '456 Lê Văn Sỹ, Phường 12',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_06',
          productName: "Jordan Luka 2 'Space Hunter'",
          price: 2950000,
          size: '42',
          quantity: 1
        }
      ],
      totalAmount: 2950000,
      paymentMethod: 'Banking',
      status: 'Chưa xác nhận',
      orderDate: '2026-10-10 08:45:00'
    },
    {
      id: 'ord_sample_09',
      orderId: 'ORD-20261012-009',
      userId: 'u3',
      customerName: 'Lê Hoàng Cường',
      phone: '0912345003',
      address: '789 Cách Mạng Tháng 8, Phường 6',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_24',
          productName: 'Balo Bóng Rổ Chuyên Dụng Nike Hoops Elite Pro 32L',
          price: 1550000,
          size: 'Freesize (32L)',
          quantity: 1
        },
        {
          productId: 'prod_14',
          productName: 'Áo Đấu Golden State Warriors Stephen Curry #30',
          price: 1350000,
          size: 'L',
          quantity: 1
        }
      ],
      totalAmount: 2900000,
      paymentMethod: 'COD',
      status: 'Chưa xác nhận',
      orderDate: '2026-10-12 15:20:00'
    },
    {
      id: 'ord_sample_10',
      orderId: 'ORD-20261013-010',
      userId: 'u4',
      customerName: 'Phạm Minh Đức',
      phone: '0912345004',
      address: '321 Trần Hưng Đạo, Phường Cô Giang',
      city: 'TP. Hồ Chí Minh',
      items: [
        {
          productId: 'prod_07',
          productName: "Adidas Harden Vol 8 'Flamingo'",
          price: 3250000,
          size: '42',
          quantity: 1
        }
      ],
      totalAmount: 3250000,
      paymentMethod: 'COD',
      status: 'Huỷ đơn',
      orderDate: '2026-10-13 18:30:00'
    }
  ];

  // Enhanced Storage Initialization with auto-reseeding if sparse
  function initStorage(forceReset) {
    try {
      // Categories
      if (forceReset || !localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        localStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
        localStorage.setItem('rainbushop_categories', JSON.stringify(DEFAULT_CATEGORIES));
      }
      // Products
      if (forceReset || !localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
        localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
        localStorage.setItem('rainbushop_products', JSON.stringify(DEFAULT_PRODUCTS));
      }
      // Users (Reseed if empty or less than 7 customer accounts)
      var curUsers = null;
      try { curUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || localStorage.getItem('users') || localStorage.getItem('rainbushop_users')); } catch(e){}
      var validCustomers = (curUsers && Array.isArray(curUsers)) ? curUsers.filter(function(u){ return u.role !== 'admin'; }) : [];
      if (forceReset || !curUsers || !Array.isArray(curUsers) || validCustomers.length < 7) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
        localStorage.setItem('rainbushop_users', JSON.stringify(DEFAULT_USERS));
      }
      // Orders (Reseed if empty or not exactly 10 orders matching the 7 customers)
      var curOrders = null;
      try { curOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || localStorage.getItem('orders') || localStorage.getItem('rainbushop_orders')); } catch(e){}
      if (forceReset || !curOrders || !Array.isArray(curOrders) || curOrders.length !== 10) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(DEFAULT_ORDERS));
        localStorage.setItem('orders', JSON.stringify(DEFAULT_ORDERS));
        localStorage.setItem('rainbushop_orders', JSON.stringify(DEFAULT_ORDERS));
      }
      // Cart (Có sẵn 2 sản phẩm mẫu tượng trưng để test giao diện mua hàng)
      var sampleCart = [
        {
          productId: 'prod_01',
          productName: "Nike Kobe 6 Protro 'Reverse Grinch'",
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          price: 4850000,
          size: '42.5',
          quantity: 1
        },
        {
          productId: 'prod_08',
          productName: "Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
          image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
          price: 5200000,
          size: '42',
          quantity: 1
        }
      ];

      var curCart = null;
      try { curCart = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || localStorage.getItem('cart') || localStorage.getItem('rainbushop_cart')); } catch(e){}
      if (forceReset || !curCart || !Array.isArray(curCart) || curCart.length === 0) {
        var strCart = JSON.stringify(sampleCart);
        localStorage.setItem(STORAGE_KEYS.CART, strCart);
        localStorage.setItem('cart', strCart);
        localStorage.setItem('rainbushop_cart', strCart);
      }
    } catch (e) {
      console.warn('initStorage error:', e);
    }
  }

  initStorage(false);

  // Global helper functions
  window.getCategories = function () {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES) || localStorage.getItem('categories') || localStorage.getItem('rainbushop_categories');
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  };

  window.saveCategories = function (categoriesArr) {
    var str = JSON.stringify(categoriesArr);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, str);
    localStorage.setItem('categories', str);
    localStorage.setItem('rainbushop_categories', str);
  };

  window.getProducts = function () {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS) || localStorage.getItem('products') || localStorage.getItem('rainbushop_products');
      return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
    } catch (e) {
      return DEFAULT_PRODUCTS;
    }
  };

  window.saveProducts = function (productsArr) {
    try {
      var str = JSON.stringify(productsArr);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, str);
      localStorage.setItem('products', str);
      localStorage.setItem('rainbushop_products', str);
    } catch (e) {
      console.warn('Lỗi lưu products vào localStorage (có thể vượt quota):', e);
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsArr));
      } catch (e2) {
        alert('Bộ nhớ lưu trữ trình duyệt đã đầy! Hãy chọn hình ảnh có kích thước nhỏ hơn.');
      }
    }
  };

  window.getUsers = function () {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS) || localStorage.getItem('users') || localStorage.getItem('rainbushop_users');
      var users = data ? JSON.parse(data) : DEFAULT_USERS;
      if (!Array.isArray(users)) users = DEFAULT_USERS.slice();

      // Chuẩn hóa role khách hàng
      var changed = false;
      users.forEach(function(u) {
        if (u.role === 'customer') {
          u.role = 'user';
          changed = true;
        }
      });

      // Kiểm tra số lượng khách hàng (role !== 'admin')
      // Nếu không có khách hàng nào (người dùng = 0) hoặc < 7 thì tự động khôi phục đầy đủ 7 khách hàng tương ứng 10 đơn hàng
      var customerUsers = users.filter(function(u) { return u.role !== 'admin'; });
      if (customerUsers.length < 7) {
        // Giữ lại admin hiện tại nếu có
        var currentAdmins = users.filter(function(u) { return u.role === 'admin'; });
        users = DEFAULT_USERS.slice();
        if (currentAdmins.length > 0) {
          // Đảm bảo không trùng admin
          users = users.filter(function(u) { return u.role !== 'admin'; });
          currentAdmins.forEach(function(adm) { users.unshift(adm); });
        }
        changed = true;
      }

      // Đảm bảo luôn có ít nhất 1 tài khoản admin
      var hasAdmin = users.some(function(u) { return u.role === 'admin'; });
      if (!hasAdmin) {
        users.unshift(DEFAULT_USERS[0]);
        changed = true;
      }

      if (changed) {
        try {
          var str = JSON.stringify(users);
          localStorage.setItem(STORAGE_KEYS.USERS, str);
          localStorage.setItem('users', str);
          localStorage.setItem('rainbushop_users', str);
        } catch(e){}
      }
      return users;
    } catch (e) {
      return DEFAULT_USERS;
    }
  };

  window.saveUsers = function (usersArr) {
    try {
      var str = JSON.stringify(usersArr);
      localStorage.setItem(STORAGE_KEYS.USERS, str);
      localStorage.setItem('users', str);
      localStorage.setItem('rainbushop_users', str);
    } catch (e) {
      console.warn('Lỗi lưu users:', e);
    }
  };

  window.getOrders = function () {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS) || localStorage.getItem('orders') || localStorage.getItem('rainbushop_orders');
      return data ? JSON.parse(data) : DEFAULT_ORDERS;
    } catch (e) {
      return DEFAULT_ORDERS;
    }
  };

  window.saveOrders = function (ordersArr) {
    var str = JSON.stringify(ordersArr);
    localStorage.setItem(STORAGE_KEYS.ORDERS, str);
    localStorage.setItem('orders', str);
    localStorage.setItem('rainbushop_orders', str);
  };

  window.getCart = function () {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART) || localStorage.getItem('cart') || localStorage.getItem('rainbushop_cart');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  window.saveCart = function (cartArr) {
    var str = JSON.stringify(cartArr);
    localStorage.setItem(STORAGE_KEYS.CART, str);
    localStorage.setItem('cart', str);
    localStorage.setItem('rainbushop_cart', str);
  };

  window.getCurrentUser = function () {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem('currentUser') || localStorage.getItem('rainbu_current_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  };

  window.setCurrentUser = function (userObj) {
    if (!userObj) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('rainbu_current_user');
    } else {
      var str = JSON.stringify(userObj);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, str);
      localStorage.setItem('currentUser', str);
      localStorage.setItem('rainbu_current_user', str);
    }
  };

  window.getCurrentAdmin = function () {
    try {
      const data = localStorage.getItem('rainbushop_currentAdmin') || localStorage.getItem('currentAdmin') || localStorage.getItem('rainbu_current_admin');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  };

  window.setCurrentAdmin = function (adminObj) {
    if (!adminObj) {
      localStorage.removeItem('rainbushop_currentAdmin');
      localStorage.removeItem('currentAdmin');
      localStorage.removeItem('rainbu_current_admin');
    } else {
      var str = JSON.stringify(adminObj);
      localStorage.setItem('rainbushop_currentAdmin', str);
      localStorage.setItem('currentAdmin', str);
      localStorage.setItem('rainbu_current_admin', str);
    }
  };

  window.logout = function () {
    window.setCurrentUser(null);
  };

  window.adminLogout = function () {
    window.setCurrentAdmin(null);
  };

  window.formatPrice = function (number, unit) {
    unit = (unit !== undefined) ? unit : '₫';
    if (number === undefined || number === null || number === '') {
      return '0' + (unit ? (unit.startsWith(' ') || unit === '₫' || unit === 'đ' ? unit : ' ' + unit) : '');
    }
    var raw = (typeof number === 'number') ? number : parseFloat(String(number).replace(/[^0-9.-]/g, ''));
    if (isNaN(raw)) {
      return '0' + (unit ? (unit.startsWith(' ') || unit === '₫' || unit === 'đ' ? unit : ' ' + unit) : '');
    }
    var isNegative = raw < 0;
    var absVal = Math.round(Math.abs(raw));
    var formattedNumber = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    var sign = isNegative ? '-' : '';
    var suffix = unit ? (unit.startsWith(' ') || unit === '₫' || unit === 'đ' ? unit : ' ' + unit) : '';
    return sign + formattedNumber + suffix;
  };

  window.parsePrice = function (value) {
    if (value === undefined || value === null || value === '') return 0;
    if (typeof value === 'number') return isNaN(value) ? 0 : Math.round(value);
    var cleanStr = String(value).replace(/[^0-9.-]/g, '');
    var num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.round(num);
  };

  window.readMoneyInVietnamese = function (number) {
    var n = window.parsePrice(number);
    if (n === 0) return 'Không đồng';
    if (n < 0) n = Math.abs(n);

    var digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    var units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

    function readGroup(g, showZeroHundred) {
      var h = Math.floor(g / 100);
      var t = Math.floor((g % 100) / 10);
      var u = g % 10;
      var str = '';

      if (h > 0 || showZeroHundred) {
        str += digits[h] + ' trăm ';
      }

      if (t === 0) {
        if (u > 0 && (h > 0 || showZeroHundred)) {
          str += 'lẻ ';
        }
      } else if (t === 1) {
        str += 'mười ';
      } else {
        str += digits[t] + ' mươi ';
      }

      if (t > 0 && u === 1 && t !== 1) {
        str += 'mốt';
      } else if (t > 0 && u === 5) {
        str += 'lăm';
      } else if (u > 0) {
        str += digits[u];
      }

      return str.trim();
    }

    var numStr = n.toString();
    var groups = [];
    while (numStr.length > 0) {
      groups.push(parseInt(numStr.slice(-3), 10));
      numStr = numStr.slice(0, -3);
    }

    var words = [];
    for (var i = groups.length - 1; i >= 0; i--) {
      var val = groups[i];
      if (val > 0) {
        var isHighest = (i === groups.length - 1);
        var readG = readGroup(val, !isHighest);
        if (readG) {
          words.push(readG + (units[i] ? ' ' + units[i] : ''));
        }
      }
    }

    var text = words.join(' ').replace(/\s+/g, ' ').trim() + ' đồng';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  window.attachPriceInputFormatter = function (inputElement, hintElement) {
    if (!inputElement) return;

    function formatNumberDots(str) {
      if (!str) return '';
      var clean = String(str).replace(/[^0-9]/g, '');
      if (!clean) return '';
      return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function update() {
      var rawVal = inputElement.value;
      if (!rawVal) {
        if (hintElement) {
          hintElement.innerHTML = '';
          hintElement.style.display = 'none';
        }
        return;
      }

      var cursorPosition = inputElement.selectionStart || rawVal.length;
      var digitsBeforeCursor = rawVal.slice(0, cursorPosition).replace(/[^0-9]/g, '').length;

      var formatted = formatNumberDots(rawVal);
      inputElement.value = formatted;

      var newCursorPos = 0;
      var digitCount = 0;
      for (var i = 0; i < formatted.length; i++) {
        if (/[0-9]/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }
      if (digitsBeforeCursor === 0) newCursorPos = 0;
      if (newCursorPos > formatted.length) newCursorPos = formatted.length;

      try {
        inputElement.setSelectionRange(newCursorPos, newCursorPos);
      } catch (e) {}

      if (hintElement) {
        hintElement.innerHTML = '';
        hintElement.style.display = 'none';
      }
    }

    inputElement.addEventListener('input', update);
    inputElement.addEventListener('focus', function () {
      if (inputElement.value) update();
    });
    inputElement.addEventListener('blur', function () {
      if (!inputElement.value && hintElement) {
        hintElement.innerHTML = '';
        hintElement.style.display = 'none';
      }
    });

    inputElement._updatePriceFormat = update;
  };

  /**
   * Nén ảnh qua Canvas để kích thước chỉ còn 30KB - 80KB, không lo tràn localStorage
   */
  window.compressImage = function (file, maxWidth, maxHeight, quality, callback) {
    if (!file) return;
    maxWidth = maxWidth || 800;
    maxHeight = maxHeight || 800;
    quality = (quality !== undefined) ? quality : 0.75;

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var w = img.width;
        var h = img.height;

        if (w > h) {
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
        } else {
          if (h > maxHeight) {
            w = Math.round((w * maxHeight) / h);
            h = maxHeight;
          }
        }

        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        var compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        callback(compressedBase64);
      };
      img.onerror = function () {
        // Fallback đọc thẳng nếu lỗi vẽ ảnh
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = function () {
      alert('Không thể đọc file ảnh đã chọn!');
    };
    reader.readAsDataURL(file);
  };

  window.generateId = function (prefix) {
    prefix = prefix || 'id';
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  };

  window.resetData = function () {
    initStorage(true);
    console.log('RainbuShop database reset successfully!');
  };

})();
