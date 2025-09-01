#!/usr/bin/env python3
"""
Test script for PDF to Markdown converter
"""

import sys
from pathlib import Path
import tempfile
import os

# Add the scripts directory to the path so we can import our converter
sys.path.insert(0, str(Path(__file__).parent))

try:
    from pdf_to_markdown import PDFToMarkdownConverter, ExtractionConfig
    print("✓ Successfully imported PDF converter")
except ImportError as e:
    print(f"✗ Failed to import PDF converter: {e}")
    print("Make sure to install dependencies: pip install -r requirements-pdf-converter.txt")
    sys.exit(1)

def test_converter_basic():
    """Test basic converter functionality"""
    print("\n=== Testing PDF Converter ===")
    
    # Check if we have a test PDF
    test_pdfs = []
    
    # Look for PDFs in the public directory
    public_dir = Path(__file__).parent.parent / "public"
    if public_dir.exists():
        test_pdfs.extend(public_dir.glob("*.pdf"))
    
    # Look for PDFs in CV files
    cv_dir = public_dir / "CV Files"
    if cv_dir.exists():
        test_pdfs.extend(cv_dir.glob("*.pdf"))
    
    if not test_pdfs:
        print("No test PDFs found. Please add a PDF file to test with.")
        return False
    
    # Use the first PDF found
    test_pdf = test_pdfs[0]
    print(f"Testing with: {test_pdf.name}")
    
    # Create a temporary output directory
    with tempfile.TemporaryDirectory() as temp_dir:
        output_path = Path(temp_dir) / "test_output"
        
        # Configure converter
        config = ExtractionConfig(
            extract_images=True,
            preserve_math=True,
            image_folder="test_images"
        )
        
        converter = PDFToMarkdownConverter(config)
        
        try:
            print("Converting PDF...")
            metadata = converter.convert_pdf(test_pdf, output_path)
            
            # Check outputs
            markdown_file = Path(metadata['output_files']['markdown'])
            if markdown_file.exists():
                print(f"✓ Markdown file created: {markdown_file.name}")
                
                # Read a sample of the content
                with open(markdown_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    print(f"✓ Content length: {len(content)} characters")
                    print(f"✓ Number of lines: {len(content.splitlines())}")
                    
                    # Show first few lines
                    lines = content.splitlines()[:5]
                    print("✓ First few lines:")
                    for line in lines:
                        print(f"   {line[:80]}...")
            else:
                print("✗ Markdown file not created")
                return False
            
            # Check metadata
            metadata_file = output_path / f"{test_pdf.stem}_metadata.json"
            if metadata_file.exists():
                print(f"✓ Metadata file created")
                print(f"✓ Images extracted: {metadata['extracted_images']}")
                print(f"✓ Text blocks: {metadata['text_blocks']}")
            else:
                print("✗ Metadata file not created")
            
            print("✓ Test completed successfully!")
            return True
            
        except Exception as e:
            print(f"✗ Test failed: {e}")
            return False

def test_math_processing():
    """Test math processing functionality"""
    print("\n=== Testing Math Processing ===")
    
    try:
        from pdf_to_markdown import MathProcessor
        
        test_cases = [
            "α + β = γ",
            "∫₀^∞ f(x)dx = 1",
            "∇²φ = ∂²φ/∂x²",
            "E = mc²",
            "x ≤ y ≥ z",
            "A ∈ B ∪ C"
        ]
        
        processor = MathProcessor()
        
        for test_case in test_cases:
            result = processor.preserve_math_formatting(test_case)
            print(f"✓ '{test_case}' → '{result}'")
        
        print("✓ Math processing test completed!")
        return True
        
    except Exception as e:
        print(f"✗ Math processing test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("PDF to Markdown Converter - Test Suite")
    print("=" * 50)
    
    # Test imports and basic functionality
    success = True
    
    # Test math processing
    if not test_math_processing():
        success = False
    
    # Test converter if we have PDFs
    if not test_converter_basic():
        success = False
    
    print("\n" + "=" * 50)
    if success:
        print("✓ All tests passed! The converter is ready to use.")
        print("\nUsage example:")
        print("python pdf-to-markdown.py your_paper.pdf")
    else:
        print("✗ Some tests failed. Check the output above for details.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
