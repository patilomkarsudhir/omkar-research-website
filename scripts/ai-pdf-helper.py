#!/usr/bin/env python3
"""
AI Assistant Helper for PDF Analysis
Converts PDFs to markdown for AI analysis
"""

import sys
import tempfile
from pathlib import Path
from pdf_to_markdown import PDFToMarkdownConverter, ExtractionConfig

def convert_pdf_for_ai(pdf_path: str, preserve_images: bool = True, output_dir: str = None) -> dict:
    """
    Convert a PDF for AI analysis
    
    Args:
        pdf_path: Path to the PDF file
        preserve_images: Whether to extract images
        output_dir: Optional output directory (uses temp if not specified)
    
    Returns:
        dict: Conversion results with paths to markdown and metadata
    """
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    # Use temp directory if no output specified
    if output_dir is None:
        temp_dir = tempfile.mkdtemp(prefix="pdf_conversion_")
        output_path = Path(temp_dir)
    else:
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
    
    # Configure for AI analysis
    config = ExtractionConfig(
        extract_images=preserve_images,
        preserve_math=True,
        image_folder="figures"
    )
    
    converter = PDFToMarkdownConverter(config)
    metadata = converter.convert_pdf(pdf_path, output_path)
    
    # Read the markdown content
    markdown_file = Path(metadata['output_files']['markdown'])
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return {
        'markdown_content': content,
        'markdown_file': str(markdown_file),
        'metadata': metadata,
        'images': metadata['output_files']['images'],
        'temp_dir': str(output_path) if output_dir is None else None
    }

def main():
    """Command line interface"""
    if len(sys.argv) < 2:
        print("Usage: python ai-pdf-helper.py <pdf_path> [output_dir]")
        print("Example: python ai-pdf-helper.py paper.pdf")
        print("Example: python ai-pdf-helper.py paper.pdf converted/")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        result = convert_pdf_for_ai(pdf_path, output_dir=output_dir)
        
        print(f"✓ PDF converted successfully!")
        print(f"Markdown file: {result['markdown_file']}")
        print(f"Content length: {len(result['markdown_content'])} characters")
        print(f"Images extracted: {len(result['images'])}")
        
        if result['temp_dir']:
            print(f"Files in temporary directory: {result['temp_dir']}")
            print("Note: Temporary files will be cleaned up automatically")
        
        # Print first few lines as preview
        lines = result['markdown_content'].splitlines()[:10]
        print("\nPreview:")
        print("-" * 40)
        for line in lines:
            print(line[:100] + ("..." if len(line) > 100 else ""))
        print("-" * 40)
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
