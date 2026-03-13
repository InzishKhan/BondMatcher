from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import asyncio
from functools import partial
from scraper import scrape_latest_bond_draws

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size


def process_bond_file(file_content, bond_type):
    """
    Match user bonds against latest draw results.
    
    Args:
        file_content: Content of uploaded file with bond numbers
        bond_type: Selected bond type
    
    Returns:
        List of matching bonds with prize info
    """
    logger.info(f"📋 Processing bond file for bond_type: {bond_type}")

    # Get latest draw results from scraper
    logger.info(f"🔍 Scraping latest draw results...")
    data = scrape_latest_bond_draws(bond_type)
    logger.info(f"✓ Got latest draw results")

    # Extract user bonds from file
    user_bonds = {line.strip() for line in file_content.splitlines() if line.strip()}
    logger.info(f"📊 Extracted {len(user_bonds)} unique bonds from file")

    # Create sets for fast lookup
    first_prize_set = set(data["first_prize"])
    second_prize_set = set(data["second_prize"])
    third_prize_set = set(data["third_prize"])
    logger.info(f"🎰 Prize sets:")
    logger.info(f"  First Prize: {len(first_prize_set)}")
    logger.info(f"  Second Prize: {len(second_prize_set)}")
    logger.info(f"  Third Prize: {len(third_prize_set)}")

    # Match bonds against prizes
    matches = []
    for bond in user_bonds:
        if bond in first_prize_set:
            matches.append({"bond_number": bond, "prize": "First Prize"})
            logger.info(f"🎉 MATCH: {bond} - First Prize!")
        elif bond in second_prize_set:
            matches.append({"bond_number": bond, "prize": "Second Prize"})
            logger.info(f"🎉 MATCH: {bond} - Second Prize!")
        elif bond in third_prize_set:
            matches.append({"bond_number": bond, "prize": "Third Prize"})
            logger.info(f"🎉 MATCH: {bond} - Third Prize!")

    logger.info(f"✅ Matching complete. Found {len(matches)} winning bonds!")
    return matches


@app.post('/api/upload')
async def upload_file(file: UploadFile = File(...), bondType: str = Form(...)):
    """Handle file upload and process with Playwright"""
    try:
        # Validate bond type
        if not bondType:
            logger.error("bondType not provided")
            return {'error': 'bondType not provided'}, 400
        logger.info(f"🔸 Received bondType from frontend: {bondType}")
        
        if not file.filename.endswith('.txt'):
            logger.error(f"Invalid file type: {file.filename}")
            return {'error': 'Only .txt files are allowed'}, 400
        
        # Save the uploaded file
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        logger.info(f"Saving file to: {filepath}")
        with open(filepath, 'wb') as f:
            content = await file.read()
            f.write(content)
        logger.info(f"File saved. Size: {len(content)} bytes")
        
        # Read the file content
        with open(filepath, 'r') as f:
            file_content = f.read()
        logger.info(f"File content read. Lines: {len(file_content.splitlines())}")
        
        # Process the file with Playwright script (runs in thread pool)
        logger.info(f"Starting bond matching process for bondType: {bondType}")
        matched_bonds = await asyncio.get_event_loop().run_in_executor(None, partial(process_bond_file, file_content, bondType))
        logger.info(f"Bond matching complete. Matches found: {len(matched_bonds)}")
        
        # Clean up the uploaded file
        os.remove(filepath)
        logger.info("Uploaded file deleted")
        
        return {
            'success': True,
            'bondType': bondType,
            'bondCategory': bondType,
            'matches': matched_bonds,
            'totalMatches': len(matched_bonds),
            'message': f'File processed successfully for {bondType} bond category'
        }
    
    except Exception as e:
        logger.exception(f"Error processing upload: {str(e)}")
        return {'error': f'Processing failed: {str(e)}'}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)