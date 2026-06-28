// LillyLooks product catalogue
// Each product links out to the TikTok Shop — this site is a showcase layer.
const TIKTOK_SHOP_URL = "https://vt.tiktok.com/ZNRLDK9Qo/?page=TikTokShop&is_from_webapp=1";

const PRODUCTS = [
  { name: "Multicoloured Rhinestone Face Gem Stickers", desc: "Create stunning looks with dazzling, reusable face gems.", img: "images/Multicoloured Rhinestone Face Gem Stickers.jpeg", category: "face", badge: "bestseller" },
  { name: "Vegan 8PCS Mini Travel Makeup Brush Set", desc: "Complete, compact brush set for flawless application on the go.", img: "images/Vegan 8PCS Mini Travel Makeup Brush Set.jpeg", category: "tools", badge: "new" },
  { name: "Nail Gem Stones & Face Gems", desc: "Double-duty gem kit for nails and face. Sparkle everywhere.", img: "images/Nail Gem Stones & Face Gems.jpeg", category: "face", badge: "bestseller" },
  { name: "Mini Travel Makeup Brush Set", desc: "Essential mini brushes perfect for your handbag or travel kit.", img: "images/Mini Travel Makeup Brush Set.jpeg", category: "tools", badge: "" },
  { name: "Luxury Satin Bonnet for Sleeping", desc: "Protect hairstyles overnight with this luxurious satin bonnet.", img: "images/Luxury Satin Bonnet for Sleeping.jpeg", category: "skin", badge: "bestseller" },
  { name: "Multicoloured Crystal", desc: "A statement crystal piece for decoration or spiritual vibes.", img: "images/Multicoloured Crystal.jpeg", category: "skin", badge: "" },
  { name: "Premium Beauty Blender in a Cup", desc: "Professional-grade blender with a hygienic storage cup.", img: "images/Premium Beauty Blender in a Cup.jpeg", category: "tools", badge: "" },
  { name: "Neck & Chin Tightening Cream With Roller", desc: "Skincare duo to firm and contour the neck and chin area.", img: "images/Neck & Chin Tightening Cream With Roller.jpeg", category: "skin", badge: "new" },
  { name: "Soft Makeup Powder Puff Set", desc: "Ultra-soft puffs for seamless powder and foundation application.", img: "images/Soft Makeup Powder Puff Set.jpeg", category: "tools", badge: "" },
  { name: "Shimmer Spray", desc: "Body spray for a gorgeous, all-over shimmer and glow.", img: "images/Shimmer Spray.jpeg", category: "skin", badge: "trending" },
  { name: "Mini Finger Puff for Foundation", desc: "Tiny precision puff for flawless foundation blending.", img: "images/Mini Finger Puff for Foundation.jpeg", category: "tools", badge: "" },
  { name: "Dual-Sided Exfoliating Gloves for Body", desc: "Two-texture gloves for invigorating exfoliation and smooth skin.", img: "images/Dual-Sided Exfoliating Gloves for Body.jpeg", category: "skin", badge: "" },
  { name: "Portable Mini Handheld Fan", desc: "Cute & powerful fan to stay cool and set makeup on the go.", img: "images/Portable Mini Handheld Fan.jpeg", category: "tools", badge: "" },
  { name: "Teeth Whitening Strips - 14 Strips", desc: "Professional-grade whitening strips for a brighter smile.", img: "images/Teeth Whitening Strips - 14 Strips.jpeg", category: "skin", badge: "trending" },
  { name: "Waterproof Brow Gel", desc: "Smudge-proof gel to set and define brows all day long.", img: "images/Waterproof Brow Gel.jpeg", category: "face", badge: "" },
  { name: "Waterproof Matte Lip Liner", desc: "Long-lasting liner to define lips and prevent feathering.", img: "images/Waterproof Mate Lip Liner.jpeg", category: "lips", badge: "" },
  { name: "Peel-Off Liquid Lipstick", desc: "Viral lipstick that peels off cleanly, no stains left behind.", img: "images/Peel-Off Liquid Lipstick.jpeg", category: "lips", badge: "bestseller" },
  { name: "Viral 18-Color Eyeshadow Palette", desc: "Versatile palette with 18 highly-pigmented, trendy shades.", img: "images/Viral 18-Color Eyeshadow Palette.jpeg", category: "face", badge: "trending" },
  { name: "Romantic Bear Peel-Off Lip Tattoo", desc: "Adorable bear-shaped lip tint that leaves a natural stain.", img: "images/Romantic Bear Peel-Off Lip Tattoo.jpeg", category: "lips", badge: "new" },
  { name: "Color Changing Jelly Lipstick", desc: "Magic lipstick that adjusts to your pH for a custom pink shade.", img: "images/Color Changing Jelly Lipstick.jpeg", category: "lips", badge: "bestseller" }
];

const REVIEWS = [
  { name: "Chloe M.", location: "Manchester", text: "The eyeshadow palette is unreal for the price. Pigment payoff is salon-level.", rating: 5 },
  { name: "Aisha R.", location: "Birmingham", text: "Ordered the lip tattoo on a whim from TikTok and now it's a daily staple.", rating: 5 },
  { name: "Megan T.", location: "Leeds", text: "Satin bonnet actually keeps my curls intact overnight. Wish I'd found this sooner.", rating: 5 },
  { name: "Priya K.", location: "London", text: "Face gems arrived fast and look exactly like the videos. Already reordered.", rating: 4 },
  { name: "Ellie S.", location: "Bristol", text: "The brush set travels so well, perfect size for my handbag.", rating: 5 },
  { name: "Zara H.", location: "Glasgow", text: "Whitening strips noticeably brighter after one week. Great value.", rating: 4 }
];
