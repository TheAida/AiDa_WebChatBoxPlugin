function parseMarkdown(text) {
    if (!text) return text;
    
    // Convert **text** to <b>text</b>
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    
    // Convert [text]*url* to <a href="url" target="_blank">text</a>
    text = text.replace(/\[([^\]]+)\]([^*]+)/g, '<a href="$2" target="_blank">$1</a>');
    
    return text;
}

const l = document.querySelector('p');

l.innerHTML = parseMarkdown("test [من من و چرا هستم]https://www.google.com");

l.innerHTML = parseMarkdown(
    "کتاب کاریز فروش\nآنچه فروشندگان حرفه‌ای به شما نمی‌گویند\n\n📚 ترجمه: حمید محمودزاده\nمدیرعامل و بنیانگذار CRM دیدار\n\n📖 در این کتاب خواهید آموخت که چگونه فروش خود را متحول کنید و فراتر از آن، از این تکنیک‌ها چطور برای زندگی بهتر استفاده کنید!\n\nاز طریق لینک زیر، کتاب کاریز فروش را دانلود و مطالعه کنید:\n\n[فروش خود را متحول کنید](https://didar.me/download-ebook/sales-pipeline-pdf/?utm_source=Didar&utm_medium=instagram&utm_campaign=kariz-highlight)"
);
