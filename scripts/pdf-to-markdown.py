#!/usr/bin/env python3
"""
PDF to Markdown Converter for Academic Papers
Handles LaTeX-compiled PDFs with math content and images.
"""

import fitz  # PyMuPDF
import os
import re
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import json
from dataclasses import dataclass

@dataclass
class ExtractionConfig:
    """Configuration for PDF extraction"""
    extract_images: bool = True
    preserve_math: bool = True
    use_ocr: bool = False
    output_format: str = "markdown"  # markdown, text, json
    image_folder: str = "images"
    min_font_size: float = 8.0
    max_font_size: float = 72.0

class MathProcessor:
    """Handles mathematical notation preservation"""
    
    # Common LaTeX symbols to Unicode mapping
    SYMBOL_MAP = {
        '∈': '∈',  # element of
        '∉': '∉',  # not element of
        '⊂': '⊂',  # subset
        '⊆': '⊆',  # subset or equal
        '∪': '∪',  # union
        '∩': '∩',  # intersection
        '∞': '∞',  # infinity
        '≤': '≤',  # less than or equal
        '≥': '≥',  # greater than or equal
        '≠': '≠',  # not equal
        '≈': '≈',  # approximately equal
        '±': '±',  # plus minus
        '∓': '∓',  # minus plus
        '×': '×',  # multiplication
        '÷': '÷',  # division
        '√': '√',  # square root
        '∂': '∂',  # partial derivative
        '∇': '∇',  # nabla
        '∫': '∫',  # integral
        '∑': '∑',  # sum
        '∏': '∏',  # product
        'α': 'α', 'β': 'β', 'γ': 'γ', 'δ': 'δ', 'ε': 'ε',
        'ζ': 'ζ', 'η': 'η', 'θ': 'θ', 'ι': 'ι', 'κ': 'κ',
        'λ': 'λ', 'μ': 'μ', 'ν': 'ν', 'ξ': 'ξ', 'ο': 'ο',
        'π': 'π', 'ρ': 'ρ', 'σ': 'σ', 'τ': 'τ', 'υ': 'υ',
        'φ': 'φ', 'χ': 'χ', 'ψ': 'ψ', 'ω': 'ω',
        'Α': 'Α', 'Β': 'Β', 'Γ': 'Γ', 'Δ': 'Δ', 'Ε': 'Ε',
        'Ζ': 'Ζ', 'Η': 'Η', 'Θ': 'Θ', 'Ι': 'Ι', 'Κ': 'Κ',
        'Λ': 'Λ', 'Μ': 'Μ', 'Ν': 'Ν', 'Ξ': 'Ξ', 'Ο': 'Ο',
        'Π': 'Π', 'Ρ': 'Ρ', 'Σ': 'Σ', 'Τ': 'Τ', 'Υ': 'Υ',
        'Φ': 'Φ', 'Χ': 'Χ', 'Ψ': 'Ψ', 'Ω': 'Ω'
    }
    
    @staticmethod
    def detect_math_regions(text: str) -> List[Tuple[int, int]]:
        """Detect regions that likely contain mathematical content"""
        math_patterns = [
            r'\b[a-zA-Z]\s*[=<>≤≥≠≈]\s*[a-zA-Z0-9]',  # equations
            r'[∫∑∏∇∂]\s*[a-zA-Z]',  # calculus operators
            r'[α-ωΑ-Ω]\s*[+\-*/=]',  # Greek letters in equations
            r'\b(?:theorem|lemma|proposition|corollary|proof)\b',  # math keywords
            r'\([0-9]+\)',  # equation numbers
        ]
        
        regions = []
        for pattern in math_patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                regions.append((match.start(), match.end()))
        
        return regions
    
    @staticmethod
    def preserve_math_formatting(text: str) -> str:
        """Preserve mathematical formatting in text"""
        # Replace common symbol sequences
        for symbol, unicode_char in MathProcessor.SYMBOL_MAP.items():
            text = text.replace(symbol, unicode_char)
        
        # Preserve equation-like structures
        text = re.sub(r'(\b[a-zA-Z]\s*[=<>≤≥≠≈]\s*[^.!?]*)', r'`\1`', text)
        
        # Preserve Greek letters in mathematical context
        text = re.sub(r'([α-ωΑ-Ω]\s*[+\-*/=]\s*[a-zA-Z0-9α-ωΑ-Ω]*)', r'`\1`', text)
        
        return text

class StructureDetector:
    """Detects document structure (headers, sections, etc.)"""
    
    @staticmethod
    def detect_headers(blocks: List[Dict]) -> List[Dict]:
        """Detect headers based on font size and formatting"""
        headers = []
        font_sizes = [block.get('size', 0) for block in blocks if block.get('size')]
        
        if not font_sizes:
            return headers
        
        avg_font_size = sum(font_sizes) / len(font_sizes)
        large_font_threshold = avg_font_size * 1.2
        
        for i, block in enumerate(blocks):
            text = block.get('text', '').strip()
            font_size = block.get('size', 0)
            flags = block.get('flags', 0)
            
            # Check if it's likely a header
            is_bold = flags & 2**4  # Bold flag
            is_large = font_size > large_font_threshold
            is_short = len(text.split()) < 10
            is_caps = text.isupper() and len(text) > 2
            
            # Common academic paper sections
            academic_sections = [
                'abstract', 'introduction', 'methods', 'methodology', 'results',
                'discussion', 'conclusion', 'references', 'bibliography',
                'acknowledgments', 'appendix', 'related work', 'background',
                'experimental setup', 'evaluation', 'analysis'
            ]
            
            is_academic_section = any(section in text.lower() for section in academic_sections)
            
            if (is_bold or is_large or is_caps or is_academic_section) and is_short:
                level = 1
                if font_size > avg_font_size * 1.5:
                    level = 1
                elif font_size > avg_font_size * 1.3:
                    level = 2
                elif font_size > avg_font_size * 1.1:
                    level = 3
                else:
                    level = 4
                
                headers.append({
                    'text': text,
                    'level': level,
                    'index': i,
                    'font_size': font_size
                })
        
        return headers

class PDFToMarkdownConverter:
    """Main converter class"""
    
    def __init__(self, config: ExtractionConfig = None):
        self.config = config or ExtractionConfig()
        self.math_processor = MathProcessor()
        self.structure_detector = StructureDetector()
        
    def extract_images(self, doc: fitz.Document, output_dir: Path) -> List[Dict]:
        """Extract images from PDF and save to output directory"""
        images = []
        image_dir = output_dir / self.config.image_folder
        image_dir.mkdir(exist_ok=True)
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images()
            
            for img_index, img in enumerate(image_list):
                try:
                    xref = img[0]
                    pix = fitz.Pixmap(doc, xref)
                    
                    if pix.n - pix.alpha < 4:  # GRAY or RGB
                        img_filename = f"page_{page_num + 1}_img_{img_index + 1}.png"
                        img_path = image_dir / img_filename
                        pix.save(str(img_path))
                        
                        images.append({
                            'filename': img_filename,
                            'path': str(img_path),
                            'page': page_num + 1,
                            'relative_path': f"{self.config.image_folder}/{img_filename}"
                        })
                    
                    pix = None
                except Exception as e:
                    print(f"Warning: Could not extract image {img_index} from page {page_num + 1}: {e}")
        
        return images
    
    def extract_text_blocks(self, doc: fitz.Document) -> List[Dict]:
        """Extract text blocks with formatting information"""
        blocks = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_dict = page.get_text("dict")
            
            for block in text_dict["blocks"]:
                if "lines" in block:  # Text block
                    block_text = ""
                    font_sizes = []
                    flags_list = []
                    
                    for line in block["lines"]:
                        line_text = ""
                        for span in line["spans"]:
                            line_text += span["text"]
                            font_sizes.append(span["size"])
                            flags_list.append(span["flags"])
                        block_text += line_text + "\n"
                    
                    if block_text.strip():
                        avg_font_size = sum(font_sizes) / len(font_sizes) if font_sizes else 12
                        common_flags = max(set(flags_list), key=flags_list.count) if flags_list else 0
                        
                        blocks.append({
                            'text': block_text.strip(),
                            'page': page_num + 1,
                            'size': avg_font_size,
                            'flags': common_flags,
                            'bbox': block.get("bbox", [0, 0, 0, 0])
                        })
        
        return blocks
    
    def process_text(self, blocks: List[Dict], images: List[Dict]) -> str:
        """Process text blocks into markdown format"""
        headers = self.structure_detector.detect_headers(blocks)
        header_indices = {h['index'] for h in headers}
        
        markdown_lines = []
        current_page = 0
        images_on_page = {}
        
        # Group images by page
        for img in images:
            page = img['page']
            if page not in images_on_page:
                images_on_page[page] = []
            images_on_page[page].append(img)
        
        for i, block in enumerate(blocks):
            text = block['text']
            
            # Add page break indicator when page changes
            if block['page'] != current_page:
                current_page = block['page']
                if current_page > 1:
                    markdown_lines.append(f"\n---\n*Page {current_page}*\n")
                
                # Add images for this page
                if current_page in images_on_page:
                    for img in images_on_page[current_page]:
                        markdown_lines.append(f"![Image]({img['relative_path']})\n")
            
            # Check if this block is a header
            if i in header_indices:
                header_info = next(h for h in headers if h['index'] == i)
                level = header_info['level']
                markdown_lines.append(f"{'#' * level} {text}\n")
            else:
                # Process regular text
                if self.config.preserve_math:
                    text = self.math_processor.preserve_math_formatting(text)
                
                # Clean up text
                text = re.sub(r'\n+', '\n', text)  # Remove excessive newlines
                text = re.sub(r' +', ' ', text)    # Remove excessive spaces
                
                # Add paragraph breaks for long text
                if len(text) > 100:
                    text = text.replace('. ', '. \n\n')
                
                markdown_lines.append(text + "\n\n")
        
        return ''.join(markdown_lines)
    
    def convert_pdf(self, pdf_path: Path, output_path: Path = None) -> Dict:
        """Convert PDF to markdown"""
        try:
            doc = fitz.open(str(pdf_path))
            
            if output_path is None:
                output_path = pdf_path.parent / f"{pdf_path.stem}_converted"
            
            output_path = Path(output_path)
            output_path.mkdir(exist_ok=True)
            
            # Extract images if configured
            images = []
            if self.config.extract_images:
                print("Extracting images...")
                images = self.extract_images(doc, output_path)
                print(f"Extracted {len(images)} images")
            
            # Extract text blocks
            print("Extracting text...")
            blocks = self.extract_text_blocks(doc)
            print(f"Extracted {len(blocks)} text blocks")
            
            # Process to markdown
            print("Converting to markdown...")
            markdown_content = self.process_text(blocks, images)
            
            # Save markdown file
            markdown_file = output_path / f"{pdf_path.stem}.md"
            with open(markdown_file, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            # Save metadata
            metadata = {
                'source_pdf': str(pdf_path),
                'conversion_config': {
                    'extract_images': self.config.extract_images,
                    'preserve_math': self.config.preserve_math,
                    'output_format': self.config.output_format
                },
                'extracted_images': len(images),
                'text_blocks': len(blocks),
                'output_files': {
                    'markdown': str(markdown_file),
                    'images': [img['path'] for img in images]
                }
            }
            
            metadata_file = output_path / f"{pdf_path.stem}_metadata.json"
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2)
            
            doc.close()
            
            print(f"Conversion complete!")
            print(f"Markdown file: {markdown_file}")
            print(f"Metadata: {metadata_file}")
            if images:
                print(f"Images folder: {output_path / self.config.image_folder}")
            
            return metadata
            
        except Exception as e:
            print(f"Error converting PDF: {e}")
            raise

def main():
    parser = argparse.ArgumentParser(description="Convert PDF to Markdown with math and image support")
    parser.add_argument("pdf_path", help="Path to input PDF file")
    parser.add_argument("-o", "--output", help="Output directory path")
    parser.add_argument("--no-images", action="store_true", help="Skip image extraction")
    parser.add_argument("--no-math", action="store_true", help="Skip math preservation")
    parser.add_argument("--image-folder", default="images", help="Name of images folder")
    
    args = parser.parse_args()
    
    # Create configuration
    config = ExtractionConfig(
        extract_images=not args.no_images,
        preserve_math=not args.no_math,
        image_folder=args.image_folder
    )
    
    # Create converter
    converter = PDFToMarkdownConverter(config)
    
    # Convert PDF
    pdf_path = Path(args.pdf_path)
    output_path = Path(args.output) if args.output else None
    
    try:
        metadata = converter.convert_pdf(pdf_path, output_path)
        print("\nConversion successful!")
        print(f"Check the output directory: {metadata['output_files']['markdown']}")
    except Exception as e:
        print(f"Conversion failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
