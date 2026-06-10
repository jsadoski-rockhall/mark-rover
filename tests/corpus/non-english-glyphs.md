# Non-English character and glyph coverage

This Corpus document exercises script coverage, font fallback, and glyph shaping.

## Latin extended and diacritics

Œuvre, cœur, naïve, façade, smörgåsbord, jalapeño, Dvořák, Łódź, İstanbul, Ærø, ångström, garçon, señorita, crème brûlée.

Vietnamese stacking diacritics: Tiếng Việt rất đẹp — phở, bún chả, Hồ Chí Minh.

## Greek and Cyrillic

Ελληνικά: Η γρήγορη καφέ αλεπού πηδάει πάνω από τον τεμπέλη σκύλο.

Русский: Съешь же ещё этих мягких французских булок, да выпей чаю.

Українська: Чуєш їх, доцю, га? Кумедна ж ти, прощайся без ґольфів!

## CJK

日本語: いろはにほへと ちりぬるを 我が世誰ぞ 常ならむ。漢字、ひらがな、カタカナ。

中文: 視野無限廣，窗外有藍天。微風迎客，軟語伴茶。

한국어: 다람쥐 헌 쳇바퀴에 타고파. 키스의 고유조건은 입술끼리 만나야 하고.

## RTL scripts

العربية: نص حكيم له سر قاطع وذو شأن عظيم مكتوب على ثوب أخضر.

עברית: דג סקרן שט בים מאוכזב ולפתע מצא חברה.

## Indic

देवनागरी: ऋषियों को सताने वाले दुष्ट राक्षसों के राजा रावण का सर्वनाश।

தமிழ்: நிலத்தில் வாழும் உயிர்களுக்கு நீரின்றி அமையாது உலகு.

## Emoji and symbols

Emoji: 🎸 🤘 🎶 🏛️ 🌈 👩‍💻 🇺🇸 ☕ ✨

Math and arrows: ∑ ∏ √ ∞ ≠ ≤ ≥ → ← ↔ ⇒ ∈ ∅ ∂ ∇

Punctuation and marks: © ® ™ § ¶ † ‡ • … « » „ " ' – —

Currency: € £ ¥ ₹ ₽ ₪ ₿ ¢

## Ligatures and shaping

Typographic ligatures: ffi ffl fi fl — office, waffle, fjord.

Arabic shaping (joined forms): سلام، مكتبة، الجميل.

## Glyphs in code

```python
def grüße(name: str) -> str:
    # Comments with 日本語 and العربية and emoji 🎉
    return f"Héllo, {name} → ∞"
```

Inline code with glyphs: `λ = α + β × Δ` and `naïve_façade.py`.

| Script     | Sample |
| ---------- | ------ |
| Greek      | αβγδε  |
| Hangul     | 한글   |
| Devanagari | नमस्ते |
| Emoji      | 🎷🪕   |
