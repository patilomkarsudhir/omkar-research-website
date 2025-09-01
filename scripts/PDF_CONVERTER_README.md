# PDF to Markdown Converter

A powerful Python script designed to convert academic PDFs (especially LaTeX-compiled papers) to clean Markdown format while preserving mathematical notation and extracting images.

## Features

### ✨ Core Capabilities
- **Smart Text Extraction**: Preserves document structure and formatting
- **Math Preservation**: Maintains mathematical symbols and equations in Unicode
- **Image Extraction**: Automatically extracts and references images in output
- **Structure Detection**: Identifies headers, sections, and academic paper structure
- **Academic Paper Support**: Optimized for research papers and technical documents

### 🔬 Math Handling
- Unicode preservation for Greek letters (α, β, γ, etc.)
- Mathematical operators (∑, ∫, ∇, ∂, etc.)
- Equation detection and formatting
- Symbol mapping for common LaTeX notations

### 🖼️ Image Support
- Extracts images to separate folder
- Maintains image references in markdown
- Supports PNG, JPEG formats
- Preserves figure placement context

## Installation

```bash
pip install -r requirements-pdf-converter.txt
```

### Dependencies
- **PyMuPDF**: Core PDF processing and text extraction
- **Pillow**: Image processing and saving
- **pytesseract**: (Optional) OCR for scanned content

## Usage

### Basic Usage
```bash
python pdf-to-markdown.py path/to/your/paper.pdf
```

### Advanced Usage
```bash
# Specify output directory
python pdf-to-markdown.py paper.pdf -o converted_output

# Skip image extraction
python pdf-to-markdown.py paper.pdf --no-images

# Skip math preservation
python pdf-to-markdown.py paper.pdf --no-math

# Custom image folder name
python pdf-to-markdown.py paper.pdf --image-folder figures
```

### Programmatic Usage
```python
from pathlib import Path
from pdf_to_markdown import PDFToMarkdownConverter, ExtractionConfig

# Configure extraction
config = ExtractionConfig(
    extract_images=True,
    preserve_math=True,
    image_folder="figures"
)

# Create converter
converter = PDFToMarkdownConverter(config)

# Convert PDF
pdf_path = Path("research_paper.pdf")
metadata = converter.convert_pdf(pdf_path)

print(f"Converted to: {metadata['output_files']['markdown']}")
```

## Output Structure

When converting `paper.pdf`, the script creates:

```
paper_converted/
├── paper.md                 # Main markdown file
├── paper_metadata.json      # Conversion metadata
└── images/                  # Extracted images
    ├── page_1_img_1.png
    ├── page_2_img_1.png
    └── ...
```

## Configuration Options

### ExtractionConfig Parameters
- `extract_images`: Extract and save images (default: True)
- `preserve_math`: Preserve mathematical notation (default: True)
- `use_ocr`: Use OCR for scanned content (default: False)
- `output_format`: Output format ("markdown", "text", "json")
- `image_folder`: Name for images folder (default: "images")
- `min_font_size`: Minimum font size to process (default: 8.0)
- `max_font_size`: Maximum font size to process (default: 72.0)

## Math Handling Examples

The converter preserves common mathematical notation:

**Input (LaTeX PDF):** α + β = γ  
**Output (Markdown):** `α + β = γ`

**Input:** ∫₀^∞ f(x)dx  
**Output:** `∫₀^∞ f(x)dx`

**Input:** ∇²φ = ∂²φ/∂x² + ∂²φ/∂y²  
**Output:** `∇²φ = ∂²φ/∂x² + ∂²φ/∂y²`

## Academic Paper Structure

The converter automatically detects common academic sections:
- Abstract
- Introduction
- Methods/Methodology
- Results
- Discussion
- Conclusion
- References/Bibliography
- Acknowledgments
- Appendix

Headers are formatted with appropriate markdown levels based on font size and formatting.

## Limitations and Considerations

### Current Limitations
1. **Complex Math**: Very complex equations may need manual cleanup
2. **Tables**: Table structure might need manual formatting
3. **Multi-column**: Multi-column layouts may not preserve perfectly
4. **Scanned PDFs**: Requires OCR setup for scanned documents

### Best Practices
1. **LaTeX PDFs**: Work best with text-based PDFs (not scanned)
2. **Large Files**: May take time for papers with many images
3. **Review Output**: Always review converted markdown for accuracy
4. **Math Cleanup**: Check mathematical notation for correctness

## Troubleshooting

### Common Issues

**Images not extracting:**
```bash
# Check if PDF has images
python -c "import fitz; doc = fitz.open('paper.pdf'); print(f'Images found: {sum(len(page.get_images()) for page in doc)}')"
```

**Math symbols missing:**
- Ensure PDF has text layer (not scanned)
- Try with `--no-math` flag to see raw output

**Structure detection issues:**
- Academic papers work best
- Try manual header formatting if auto-detection fails

## Integration with AI Assistants

This script is designed to help AI assistants (like me!) read and analyze PDF content. Usage pattern:

1. Convert PDF to markdown using this script
2. Share the markdown output for analysis
3. Reference extracted images as needed
4. Use preserved math notation for technical discussions

## Future Enhancements

Potential improvements:
- Enhanced table detection and formatting
- Better multi-column support
- OCR integration for scanned PDFs
- LaTeX equation reconstruction
- Citation parsing and linking
- Bibliography extraction

## Contributing

Feel free to enhance the script with additional features or improvements for your specific use cases.
