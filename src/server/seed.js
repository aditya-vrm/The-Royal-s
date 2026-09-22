require('dotenv').config();
const mongoose = require('mongoose');
const Venue = require('../models/Venue');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const Staff = require('../models/Staff');
const connectDB = require('../lib/db');

const SEED_VENUES = [
  {
    key: 'cafe',
    name: "The Royal's Cafe",
    tagline: 'Coffee, Momos, Pizza, Pasta & Cafe Bites',
    description: 'Speciality coffees, hot momos & dimsums, pizzas, pastas, burgers, and refreshing beverages.',
    heroImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    theme: {
      accentColor: '#D4AF37',
      secondaryBg: '#18120E',
      badgeColor: '#2A1810',
    },
  },
  {
    key: 'restaurant',
    name: "The Royal's Restaurant",
    tagline: 'Authentic Indian, Mughlai, Kebabs & Biryani Dining',
    description: 'Delicious Indian curries, Dum Biryanis, charcoal tandoori kebabs, breads, and Indo-Chinese food.',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    theme: {
      accentColor: '#F5D67D',
      secondaryBg: '#1E0A0A',
      badgeColor: '#3D0C0C',
    },
  },
];

const SEED_STAFF = [
  { name: 'Vikram Singh', role: 'waiter', pin: '1234' },
  { name: 'Pooja Sharma', role: 'waiter', pin: '1111' },
  { name: 'Rahul Roy (Captain)', role: 'captain', pin: '5678' },
  { name: 'Chef Sanjeev', role: 'chef', pin: '9999' },
  { name: 'Manager / Admin', role: 'admin', pin: '7777' },
];

const CAFE_CATEGORIES = [
  { name: 'Momos & Dimsums', icon: 'Sparkles', sortOrder: 1 },
  { name: 'Sushi & Bao', icon: 'Fish', sortOrder: 2 },
  { name: 'Coffee, Tea & Beverages', icon: 'Coffee', sortOrder: 3 },
  { name: 'Starters & Quick Bites', icon: 'Utensils', sortOrder: 4 },
  { name: 'Crispy Indo-Asian', icon: 'Flame', sortOrder: 5 },
  { name: 'Pizza & Pasta', icon: 'Pizza', sortOrder: 6 },
  { name: 'Noodles & Burgers', icon: 'Sandwich', sortOrder: 7 },
  { name: 'Sandwiches & Toasts', icon: 'Sandwich', sortOrder: 8 },
  { name: 'Fresh Salads', icon: 'Salad', sortOrder: 9 },
  { name: 'Cakes & Desserts', icon: 'Cake', sortOrder: 10 },
];

const CAFE_MENU_ITEMS = [
  // Momos & Dimsums
  {
    cat: 'Momos & Dimsums',
    name: 'Steamed Veg Momos / Dimsums (6 pcs)',
    price: 180,
    discountPrice: 150,
    type: 'veg',
    description: 'Fresh steamed vegetable momos filled with finely chopped cabbage, carrots, onions, served with spicy red chili chutney.',
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Momos & Dimsums',
    name: 'Crispy Fried Veg Momos (6 pcs)',
    price: 200,
    discountPrice: 170,
    type: 'veg',
    description: 'Golden fried crispy vegetable momos served with creamy mayo and spicy schezwan dip.',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Momos & Dimsums',
    name: 'Paneer & Cheese Momos (6 pcs)',
    price: 220,
    discountPrice: 190,
    type: 'veg',
    description: 'Steamed momos stuffed with spiced grated paneer, sweet corn, and melted mozzarella cheese.',
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Momos & Dimsums',
    name: 'Steamed Chicken Momos / Dimsums (6 pcs)',
    price: 240,
    discountPrice: 210,
    type: 'non-veg',
    description: 'Juicy minced chicken steamed momos seasoned with herbs, ginger, garlic, and served with spicy chutney.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Momos & Dimsums',
    name: 'Crispy Fried Chicken Momos (6 pcs)',
    price: 260,
    discountPrice: 230,
    type: 'non-veg',
    description: 'Deep fried crunchy chicken momos served with fiery momo chutney and mayonnaise.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Momos & Dimsums',
    name: 'Kurkure Chicken Momos (6 pcs)',
    price: 280,
    discountPrice: 250,
    type: 'non-veg',
    description: 'Crispy crunchy crumb-coated fried chicken momos tossed in chaat masala and served with dips.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Momos & Dimsums',
    name: 'Paneer Bao (2 pcs)',
    price: 260,
    discountPrice: 220,
    type: 'veg',
    description: 'Soft steamed Asian bao buns stuffed with crispy paneer, spicy mayo, and crunchy salad.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Momos & Dimsums',
    name: 'BBQ Chicken Bao (2 pcs)',
    price: 290,
    discountPrice: 250,
    type: 'non-veg',
    description: 'Warm fluffy steamed bao filled with sweet and spicy BBQ chicken and fresh scallions.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  },

  // Sushi
  {
    cat: 'Sushi & Bao',
    name: 'Veg Avocado Sushi Roll (8 pcs)',
    price: 360,
    discountPrice: 310,
    type: 'veg',
    description: 'Fresh avocado, cucumber, and cream cheese rolled in seasoned sushi rice with wasabi & soy.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Sushi & Bao',
    name: 'Crispy Veg Tempura Sushi (8 pcs)',
    price: 340,
    discountPrice: 290,
    type: 'veg',
    description: 'Crispy fried asparagus and carrots wrapped in sushi nori sheet with spicy mayo.',
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Sushi & Bao',
    name: 'Crispy Chicken Sushi Roll (8 pcs)',
    price: 420,
    discountPrice: 360,
    type: 'non-veg',
    description: 'Crunchy chicken tempura with spicy Japanese mayo, rolled in seasoned sushi rice.',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80',
  },

  // Coffee & Tea
  {
    cat: 'Coffee, Tea & Beverages',
    name: 'The Royal Special Hot Coffee / Latte',
    price: 180,
    discountPrice: 150,
    type: 'veg',
    description: 'Freshly brewed rich espresso with hot frothy steamed milk.',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Coffee, Tea & Beverages',
    name: 'Thick Cold Coffee with Ice Cream',
    price: 190,
    discountPrice: 160,
    type: 'veg',
    description: 'Chilled blended thick cold coffee topped with a rich scoop of vanilla ice cream.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Coffee, Tea & Beverages',
    name: 'Caramel Iced Macchiato',
    price: 210,
    discountPrice: 180,
    type: 'veg',
    description: 'Iced coffee layered with cold milk, espresso, and sweet caramel drizzle.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Coffee, Tea & Beverages',
    name: 'Royal Masala Chai Kettle',
    price: 130,
    discountPrice: 100,
    type: 'veg',
    description: 'Freshly brewed hot Assam milk tea with crushed ginger, cardamom, and clove. Serves 2.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Coffee, Tea & Beverages',
    name: 'Kashmiri Kahwa Green Tea',
    price: 160,
    discountPrice: 130,
    type: 'veg',
    description: 'Traditional green tea infused with whole saffron strands, cardamom, cinnamon, and almonds.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  },

  // Starters
  {
    cat: 'Starters & Quick Bites',
    name: 'French Fries (Salted / Peri Peri)',
    price: 160,
    discountPrice: 130,
    type: 'veg',
    description: 'Hot, crispy golden potato fries tossed with your choice of salt or spicy peri peri.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Starters & Quick Bites',
    name: 'Cheese Garlic Bread (4 pcs)',
    price: 220,
    discountPrice: 180,
    type: 'veg',
    description: 'Toasted baguette slices with garlic herb butter and melted mozzarella cheese.',
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Starters & Quick Bites',
    name: 'Crispy Chicken Tenders',
    price: 290,
    discountPrice: 240,
    type: 'non-veg',
    description: 'Golden fried boneless chicken strips served with garlic mayonnaise and tomato dip.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
  },

  // Crispy Indo-Asian
  {
    cat: 'Crispy Indo-Asian',
    name: 'Crispy Corn Salt & Pepper',
    price: 220,
    discountPrice: 180,
    type: 'veg',
    description: 'Golden fried sweet corn tossed with chopped green chilies, onions, and black pepper.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Crispy Indo-Asian',
    name: 'Honey Chili Potato / Lotus Stem',
    price: 240,
    discountPrice: 200,
    type: 'veg',
    description: 'Crispy potato fingers tossed in wok with sweet honey chili sauce and white sesame.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Crispy Indo-Asian',
    name: 'Crispy Dragon Chicken',
    price: 320,
    discountPrice: 270,
    type: 'non-veg',
    description: 'Crispy fried chicken strips tossed in spicy red chili garlic sauce with roasted cashews.',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
  },

  // Pizza & Pasta
  {
    cat: 'Pizza & Pasta',
    name: 'Cheese Margherita Pizza (10" Thin Crust)',
    price: 340,
    discountPrice: 290,
    type: 'veg',
    description: 'Classic pizza base with rich tomato marinara, fresh basil, and loads of mozzarella cheese.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Pizza & Pasta',
    name: 'Farmhouse Veggie Pizza (10" Thin Crust)',
    price: 380,
    discountPrice: 330,
    type: 'veg',
    description: 'Loaded with paneer, mushrooms, sweet corn, bell peppers, onions, and cheese.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Pizza & Pasta',
    name: 'Chicken Tikka Pizza (10" Thin Crust)',
    price: 430,
    discountPrice: 370,
    type: 'non-veg',
    description: 'Topped with tandoori spiced chicken tikka, onions, capsicum, and mozzarella.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Pizza & Pasta',
    name: 'Red Sauce Penne Pasta (Arrabbiata)',
    price: 280,
    discountPrice: 240,
    type: 'veg',
    description: 'Penne pasta tossed in tangy tomato sauce with garlic, chili flakes, and cheese.',
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Pizza & Pasta',
    name: 'White Sauce Pasta (Creamy Alfredo)',
    price: 310,
    discountPrice: 270,
    type: 'veg',
    description: 'Creamy cheese and butter sauce pasta tossed with sauteed mushrooms and oregano.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  },

  // Noodles & Burgers
  {
    cat: 'Noodles & Burgers',
    name: 'Veg Hakka Noodles',
    price: 210,
    discountPrice: 180,
    type: 'veg',
    description: 'Wok tossed noodles with crunchy cabbage, carrots, capsicum, and light soy sauce.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Noodles & Burgers',
    name: 'Chicken Hakka Noodles',
    price: 260,
    discountPrice: 220,
    type: 'non-veg',
    description: 'Noodles wok-tossed with boneless chicken pieces, egg, and fresh vegetables.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Noodles & Burgers',
    name: 'Crispy Veg Cheese Burger',
    price: 180,
    discountPrice: 150,
    type: 'veg',
    description: 'Toasted bun with crispy vegetable patty, cheese slice, lettuce, and secret sauce with fries.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Noodles & Burgers',
    name: 'Grilled Chicken Cheese Burger',
    price: 230,
    discountPrice: 190,
    type: 'non-veg',
    description: 'Juicy grilled chicken patty with melted cheese, tomato, onion relish, and french fries.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  },

  // Sandwiches & Desserts
  {
    cat: 'Sandwiches & Toasts',
    name: 'Grilled Veg Cheese Sandwich',
    price: 190,
    discountPrice: 160,
    type: 'veg',
    description: 'Grilled jumbo bread sandwich filled with cucumber, tomato, capsicum, and melted cheese.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Fresh Salads',
    name: 'Fresh Garden Green Salad',
    price: 140,
    discountPrice: 110,
    type: 'veg',
    description: 'Crisp cucumber, tomatoes, carrots, onion rings, green chilies, and fresh lemon slices.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Cakes & Desserts',
    name: 'Hot Chocolate Brownie with Ice Cream',
    price: 220,
    discountPrice: 180,
    type: 'veg',
    description: 'Warm walnut chocolate brownie served with cold vanilla ice cream and chocolate sauce.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
];

const RESTAURANT_CATEGORIES = [
  { name: 'Soups & Shorba', icon: 'Soup', sortOrder: 1 },
  { name: 'Veg Starters & Kebabs', icon: 'Sparkles', sortOrder: 2 },
  { name: 'Chicken & Non-Veg Starters', icon: 'Flame', sortOrder: 3 },
  { name: 'Tandoori Roti & Naan', icon: 'Utensils', sortOrder: 4 },
  { name: 'Veg Main Course', icon: 'Utensils', sortOrder: 5 },
  { name: 'Chicken & Mutton Main Course', icon: 'Utensils', sortOrder: 6 },
  { name: 'Biryani & Rice', icon: 'Bowl', sortOrder: 7 },
  { name: 'Indo-Chinese Dishes', icon: 'Flame', sortOrder: 8 },
  { name: 'Raita & Accompaniments', icon: 'Salad', sortOrder: 9 },
  { name: 'Pizzas & Fries', icon: 'Pizza', sortOrder: 10 },
  { name: 'Indian Sweets & Desserts', icon: 'Cake', sortOrder: 11 },
  { name: 'Lassi & Cold Drinks', icon: 'Wine', sortOrder: 12 },
];

const RESTAURANT_MENU_ITEMS = [
  // Soups
  {
    cat: 'Soups & Shorba',
    name: 'Tomato Soup',
    price: 160,
    discountPrice: 130,
    type: 'veg',
    description: 'Classic rich tomato soup served with crispy fried bread croutons.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Soups & Shorba',
    name: 'Veg Sweet Corn Soup',
    price: 170,
    discountPrice: 140,
    type: 'veg',
    description: 'Creamy corn soup with finely chopped carrots, beans, and spring onion.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Soups & Shorba',
    name: 'Veg Manchow Soup',
    price: 180,
    discountPrice: 150,
    type: 'veg',
    description: 'Spicy and tangy thick vegetable soup topped with crispy fried noodles.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Soups & Shorba',
    name: 'Hot & Sour Veg Soup',
    price: 180,
    discountPrice: 150,
    type: 'veg',
    description: 'Tangy and spicy dark broth with mixed vegetables and mushrooms.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Soups & Shorba',
    name: 'Chicken Clear Soup',
    price: 210,
    discountPrice: 180,
    type: 'non-veg',
    description: 'Light chicken broth seasoned with black pepper, celery, and shredded chicken.',
    image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Soups & Shorba',
    name: 'Chicken Manchow Soup',
    price: 220,
    discountPrice: 190,
    type: 'non-veg',
    description: 'Fiery chicken soup with minced chicken, garlic, egg drops, and fried noodles.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
  },

  // Veg Starters
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Paneer Tikka (Tandoori)',
    price: 320,
    discountPrice: 270,
    type: 'veg',
    description: 'Fresh paneer cubes marinated in spiced yogurt and grilled in tandoor with onions and capsicum.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Malai Paneer Tikka',
    price: 340,
    discountPrice: 290,
    type: 'veg',
    description: 'Creamy soft paneer cubes marinated in cashew cream and mild spices, roasted in clay oven.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Hara Bhara Kabab (6 pcs)',
    price: 260,
    discountPrice: 220,
    type: 'veg',
    description: 'Crispy spinach, green peas, and potato patties with aromatic spices and cashews.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Veg Seekh Kabab',
    price: 280,
    discountPrice: 240,
    type: 'veg',
    description: 'Minced fresh vegetables and paneer roasted on skewers over charcoal fire.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Crispy Veg Spring Rolls (6 pcs)',
    price: 240,
    discountPrice: 200,
    type: 'veg',
    description: 'Golden fried crispy rolls stuffed with seasoned vegetables and served with sweet chili sauce.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Chilli Paneer Dry',
    price: 290,
    discountPrice: 250,
    type: 'veg',
    description: 'Paneer cubes tossed with onions, capsicum, green chilies, and soy sauce.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Paneer 65',
    price: 290,
    discountPrice: 250,
    type: 'veg',
    description: 'Crispy fried paneer tossed with curry leaves, mustard seeds, and spicy red masala.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Veg Manchurian Dry',
    price: 260,
    discountPrice: 220,
    type: 'veg',
    description: 'Crisp vegetable balls tossed in wok with garlic, ginger, green chilies, and soy sauce.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Starters & Kebabs',
    name: 'Tandoori Mushroom Tikka',
    price: 290,
    discountPrice: 250,
    type: 'veg',
    description: 'Fresh button mushrooms marinated in spicy tandoori masala and roasted in clay oven.',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
  },

  // Non-Veg Starters
  {
    cat: 'Chicken & Non-Veg Starters',
    name: 'Chicken Tikka (Tandoori)',
    price: 360,
    discountPrice: 310,
    type: 'non-veg',
    description: 'Boneless chicken chunks marinated in tandoori spices and char-grilled in tandoor.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Chicken & Non-Veg Starters',
    name: 'Murgh Malai Tikka',
    price: 380,
    discountPrice: 330,
    type: 'non-veg',
    description: 'Tender chicken marinated in cashew cream, cheese, and cardamom, roasted to perfection.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Non-Veg Starters',
    name: 'Tandoori Chicken (Half / Full)',
    price: 390,
    discountPrice: 340,
    type: 'non-veg',
    description: 'Whole bone-in chicken marinated in yogurt and spices, slow roasted in clay oven.',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Chicken & Non-Veg Starters',
    name: 'Chicken Seekh Kabab',
    price: 360,
    discountPrice: 310,
    type: 'non-veg',
    description: 'Spiced minced chicken skewers roasted on charcoal embers, served with mint chutney.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Non-Veg Starters',
    name: 'Chicken 65',
    price: 340,
    discountPrice: 290,
    type: 'non-veg',
    description: 'Crispy fried boneless chicken tossed with tempered curry leaves, garlic, and red chili sauce.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Non-Veg Starters',
    name: 'Chilli Chicken Dry',
    price: 340,
    discountPrice: 290,
    type: 'non-veg',
    description: 'Crispy fried boneless chicken tossed with capsicum, onion, and spicy soy chili sauce.',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Non-Veg Starters',
    name: 'Mutton Seekh Kabab',
    price: 440,
    discountPrice: 390,
    type: 'non-veg',
    description: 'Minced juicy mutton skewers seasoned with royal spices and grilled on charcoal.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Chicken & Non-Veg Starters',
    name: 'Amritsari Fish Fry',
    price: 420,
    discountPrice: 370,
    type: 'non-veg',
    description: 'Fish fillets dipped in spiced gram flour batter and golden fried with ajwain flavor.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  },

  // Breads
  {
    cat: 'Tandoori Roti & Naan',
    name: 'Tandoori Butter Roti',
    price: 35,
    discountPrice: 25,
    type: 'veg',
    description: 'Crisp whole wheat roti baked in clay oven and brushed with butter.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Tandoori Roti & Naan',
    name: 'Plain / Butter Naan',
    price: 60,
    discountPrice: 50,
    type: 'veg',
    description: 'Soft and fluffy refined flour tandoor bread brushed with butter.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Tandoori Roti & Naan',
    name: 'Garlic Butter Naan',
    price: 80,
    discountPrice: 65,
    type: 'veg',
    description: 'Fluffy tandoori naan topped with chopped roasted garlic and cilantro.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Tandoori Roti & Naan',
    name: 'Cheese & Chili Naan',
    price: 110,
    discountPrice: 90,
    type: 'veg',
    description: 'Stuffed with melted cheese and chopped green chilies.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Tandoori Roti & Naan',
    name: 'Laccha Paratha',
    price: 65,
    discountPrice: 55,
    type: 'veg',
    description: 'Crisp layered whole wheat bread cooked in tandoor.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Tandoori Roti & Naan',
    name: 'Paneer Stuffed Kulcha',
    price: 100,
    discountPrice: 85,
    type: 'veg',
    description: 'Crisp kulcha stuffed with spiced mashed paneer and coriander.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  },

  // Veg Main Course
  {
    cat: 'Veg Main Course',
    name: 'Paneer Butter Masala',
    price: 340,
    discountPrice: 290,
    type: 'veg',
    description: 'Fresh soft paneer cubes in rich and creamy tomato, butter, and cashew gravy.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Veg Main Course',
    name: 'Kadai Paneer',
    price: 330,
    discountPrice: 280,
    type: 'veg',
    description: 'Paneer cubes cooked with capsicum, onions, and freshly ground kadai spices.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Main Course',
    name: 'Palak Paneer',
    price: 320,
    discountPrice: 270,
    type: 'veg',
    description: 'Cottage cheese cubes simmered in fresh garlic-flavored spinach gravy with cream.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Main Course',
    name: 'Shahi Paneer',
    price: 350,
    discountPrice: 300,
    type: 'veg',
    description: 'Paneer cooked in rich white gravy of cashews, cream, and aromatic spices.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Main Course',
    name: 'Dal Makhani',
    price: 290,
    discountPrice: 240,
    type: 'veg',
    description: 'Black lentils and rajma slow-cooked with butter, cream, and mild spices.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Veg Main Course',
    name: 'Yellow Dal Tadka',
    price: 220,
    discountPrice: 180,
    type: 'veg',
    description: 'Yellow arhar dal tempered with desi ghee, cumin, garlic, and red chilies.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Main Course',
    name: 'Malai Kofta',
    price: 340,
    discountPrice: 290,
    type: 'veg',
    description: 'Melt-in-mouth paneer and potato dumplings in sweet and creamy cashew gravy.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Main Course',
    name: 'Mix Veg Curry',
    price: 270,
    discountPrice: 230,
    type: 'veg',
    description: 'Seasonal vegetables cooked in traditional spiced onion-tomato curry.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Main Course',
    name: 'Aloo Gobi',
    price: 230,
    discountPrice: 190,
    type: 'veg',
    description: 'Potatoes and cauliflower florets cooked with ginger, cumin, and spices.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Veg Main Course',
    name: 'Pindi Chana Masala',
    price: 260,
    discountPrice: 220,
    type: 'veg',
    description: 'Chickpeas cooked with roasted spices, ginger, and green chilies.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  },

  // Non-Veg Main Course
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Butter Chicken (Murgh Makhani)',
    price: 390,
    discountPrice: 340,
    type: 'non-veg',
    description: 'Boneless grilled chicken in rich, creamy tomato, butter, and cashew gravy.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Chicken Tikka Masala',
    price: 380,
    discountPrice: 330,
    type: 'non-veg',
    description: 'Tandoori chicken tikka pieces cooked in spicy onion-tomato gravy with capsicum.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Kadai Chicken',
    price: 370,
    discountPrice: 320,
    type: 'non-veg',
    description: 'Chicken cooked with bell peppers, onions, and freshly crushed spices in a wok.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Home Style Chicken Curry',
    price: 350,
    discountPrice: 300,
    type: 'non-veg',
    description: 'Traditional home style chicken curry with flavorful thin gravy and spices.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Chicken Rara (Mince Gravy)',
    price: 410,
    discountPrice: 360,
    type: 'non-veg',
    description: 'Chicken pieces cooked in rich and spicy minced chicken gravy.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Mutton Rogan Josh',
    price: 480,
    discountPrice: 420,
    type: 'non-veg',
    description: 'Tender pieces of mutton slow cooked with Kashmiri spices, fennel, and ginger.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Mutton Bhuna Gosht',
    price: 490,
    discountPrice: 430,
    type: 'non-veg',
    description: 'Mutton roasted with browned onions, ginger, garlic, and thick spicy gravy.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Egg Curry (2 Eggs)',
    price: 240,
    discountPrice: 200,
    type: 'non-veg',
    description: 'Fried boiled eggs simmered in spiced onion and tomato gravy.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Chicken & Mutton Main Course',
    name: 'Fish Curry',
    price: 440,
    discountPrice: 380,
    type: 'non-veg',
    description: 'Fresh fish fillets cooked in flavorful spiced curry with mustard and curry leaves.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
  },

  // Biryani & Rice
  {
    cat: 'Biryani & Rice',
    name: 'Chicken Dum Biryani',
    price: 360,
    discountPrice: 310,
    type: 'non-veg',
    description: 'Long grain basmati rice layered with spiced chicken, saffron, mint, and slow-cooked on dum.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Biryani & Rice',
    name: 'Mutton Dum Biryani',
    price: 460,
    discountPrice: 410,
    type: 'non-veg',
    description: 'Fragrant basmati rice layered with tender baby mutton pieces and aromatic spices.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Biryani & Rice',
    name: 'Veg Dum Biryani',
    price: 290,
    discountPrice: 240,
    type: 'veg',
    description: 'Basmati rice layered with seasonal vegetables, paneer, fried onions, and mint.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Biryani & Rice',
    name: 'Egg Biryani',
    price: 280,
    discountPrice: 240,
    type: 'non-veg',
    description: 'Spiced boiled eggs layered with fragrant saffron rice.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Biryani & Rice',
    name: 'Jeera Rice / Ghee Rice',
    price: 170,
    discountPrice: 140,
    type: 'veg',
    description: 'Fluffy basmati rice tempered with roasted cumin seeds and desi ghee.',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Biryani & Rice',
    name: 'Plain Steamed Basmati Rice',
    price: 140,
    discountPrice: 110,
    type: 'veg',
    description: 'Steamed long grain fragrant basmati rice.',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
  },

  // Indo-Chinese
  {
    cat: 'Indo-Chinese Dishes',
    name: 'Veg Fried Rice',
    price: 220,
    discountPrice: 180,
    type: 'veg',
    description: 'Wok tossed rice with finely chopped vegetables and mild seasonings.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Indo-Chinese Dishes',
    name: 'Chicken Fried Rice',
    price: 270,
    discountPrice: 230,
    type: 'non-veg',
    description: 'Fried rice with scrambled egg, boneless chicken cubes, and scallions.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Indo-Chinese Dishes',
    name: 'Veg Manchurian Gravy',
    price: 260,
    discountPrice: 220,
    type: 'veg',
    description: 'Crisp vegetable balls in savory garlic, ginger, and soy sauce gravy.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Indo-Chinese Dishes',
    name: 'Chilli Chicken Gravy',
    price: 340,
    discountPrice: 290,
    type: 'non-veg',
    description: 'Battered chicken pieces simmered in spicy soy chili gravy with capsicum and onions.',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
  },

  // Raita
  {
    cat: 'Raita & Accompaniments',
    name: 'Boondi Raita',
    price: 120,
    discountPrice: 90,
    type: 'veg',
    description: 'Chilled spiced fresh curd with crispy gram flour pearls and roasted cumin.',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Raita & Accompaniments',
    name: 'Fresh Onion Salad / Green Salad',
    price: 100,
    discountPrice: 80,
    type: 'veg',
    description: 'Fresh sliced onions, cucumbers, tomatoes, and lemon wedges with chaat masala.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
  },

  // Pizzas
  {
    cat: 'Pizzas & Fries',
    name: 'Classic Margherita Pizza (10")',
    price: 340,
    discountPrice: 290,
    type: 'veg',
    description: 'Stone baked pizza topped with rich tomato sauce and mozzarella cheese.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Pizzas & Fries',
    name: 'Peri Peri French Fries',
    price: 160,
    discountPrice: 130,
    type: 'veg',
    description: 'Crispy salted fries dusted with spicy African peri peri seasoning.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
  },

  // Sweets
  {
    cat: 'Indian Sweets & Desserts',
    name: 'Hot Gulab Jamun (2 pcs)',
    price: 120,
    discountPrice: 90,
    type: 'veg',
    description: 'Soft hot khoya dumplings soaked in rose cardamom sugar syrup.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Indian Sweets & Desserts',
    name: 'Rasmalai (2 pcs)',
    price: 140,
    discountPrice: 110,
    type: 'veg',
    description: 'Soft spongy paneer discs soaked in chilled thickened saffron milk with pistachios.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Indian Sweets & Desserts',
    name: 'Kesar Matka Phirni',
    price: 150,
    discountPrice: 120,
    type: 'veg',
    description: 'Traditional slow cooked ground rice pudding served in earthen matka.',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
  },

  // Drinks
  {
    cat: 'Lassi & Cold Drinks',
    name: 'Sweet Malai Lassi',
    price: 130,
    discountPrice: 100,
    type: 'veg',
    description: 'Thick, creamy sweet churned curd topped with fresh malai.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    isChefSpecial: true,
  },
  {
    cat: 'Lassi & Cold Drinks',
    name: 'Mango Lassi',
    price: 150,
    discountPrice: 120,
    type: 'veg',
    description: 'Creamy yogurt blended with sweet mango pulp and cardamom.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Lassi & Cold Drinks',
    name: 'Masala Chaas (Spiced Buttermilk)',
    price: 100,
    discountPrice: 80,
    type: 'veg',
    description: 'Refreshing churned buttermilk with roasted cumin, black salt, and mint.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
  },
  {
    cat: 'Lassi & Cold Drinks',
    name: 'Virgin Mojito / Fresh Lime Soda',
    price: 130,
    discountPrice: 100,
    type: 'veg',
    description: 'Fresh mint, lime juice, sugar, and sparkling soda on ice.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 [Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('🧹 [Seed] Clearing existing collections...');
    await Promise.all([
      Venue.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
      Staff.deleteMany({}),
    ]);

    console.log('👑 [Seed] Inserting Venues...');
    await Venue.insertMany(SEED_VENUES);

    console.log('👨‍🍳 [Seed] Inserting Staff...');
    await Staff.insertMany(SEED_STAFF);

    console.log('🪑 [Seed] Inserting Tables 1–20...');
    const tables = [];
    for (let i = 1; i <= 20; i++) {
      const padNum = String(i).padStart(2, '0');
      tables.push({
        number: i,
        qrToken: `tbl_${padNum}`,
        venue: i <= 8 ? 'cafe' : i <= 16 ? 'restaurant' : 'both',
        section: i <= 8 ? 'Cafe Lounge' : 'Main Dining Hall',
        isActive: true,
      });
    }
    await Table.insertMany(tables);

    console.log('☕ [Seed] Inserting Cafe categories & menu items...');
    const cafeCatMap = {};
    for (const cat of CAFE_CATEGORIES) {
      const created = await Category.create({
        venue: 'cafe',
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      });
      cafeCatMap[cat.name] = created._id;
    }

    const cafeItems = CAFE_MENU_ITEMS.map((item, idx) => ({
      venue: 'cafe',
      category: cafeCatMap[item.cat],
      name: item.name,
      price: item.price,
      discountPrice: item.discountPrice,
      type: item.type,
      description: item.description,
      image: item.image,
      isChefSpecial: !!item.isChefSpecial,
      available: true,
      sortOrder: idx + 1,
    }));
    await MenuItem.insertMany(cafeItems);

    console.log('🍽️ [Seed] Inserting Restaurant categories & menu items...');
    const restCatMap = {};
    for (const cat of RESTAURANT_CATEGORIES) {
      const created = await Category.create({
        venue: 'restaurant',
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      });
      restCatMap[cat.name] = created._id;
    }

    const restItems = RESTAURANT_MENU_ITEMS.map((item, idx) => ({
      venue: 'restaurant',
      category: restCatMap[item.cat],
      name: item.name,
      price: item.price,
      discountPrice: item.discountPrice,
      type: item.type,
      description: item.description,
      image: item.image,
      isChefSpecial: !!item.isChefSpecial,
      available: true,
      sortOrder: idx + 1,
    }));
    await MenuItem.insertMany(restItems);

    console.log(`✅ [Seed] Successfully seeded with simple, clear dish names:`);
    console.log(`   - 2 Venues (Cafe & Restaurant)`);
    console.log(`   - 5 Staff Profiles (PIN 1234, 5678, 9999, 7777, 1111)`);
    console.log(`   - 20 Dining Tables with QR tokens`);
    console.log(`   - ${CAFE_CATEGORIES.length} Cafe Categories with ${CAFE_MENU_ITEMS.length} dishes`);
    console.log(`   - ${RESTAURANT_CATEGORIES.length} Restaurant Categories with ${RESTAURANT_MENU_ITEMS.length} dishes`);

    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
