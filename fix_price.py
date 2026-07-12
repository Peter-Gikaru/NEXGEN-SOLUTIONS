import re

filepath = r'c:\Users\njoki\.gemini\antigravity\scratch\laptop-ecommerce-frontend\src\pages\ProductDetailPage.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace addToCart price
target1 = """    const productItem: Product = {
      id: product.id,
      slug: product.slug,
      title: product.name,
      price: product.price,"""
replacement1 = """    const currentPrice = product.price + (selectedVariant?.priceOffset || 0);
    const productItem: Product = {
      id: product.id,
      slug: product.slug,
      title: product.name,
      price: currentPrice,"""

content = content.replace(target1, replacement1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed ProductDetailPage price bugs!")
