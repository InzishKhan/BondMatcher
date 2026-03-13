"""
Bond Draw Results Scraper using Playwright
Separate file to handle all Playwright scraping logic
"""

from datetime import datetime
from playwright.sync_api import sync_playwright
import requests
import re
import logging

logger = logging.getLogger(__name__)


def scrape_latest_bond_draws(bond_type):
    logger.info(f"scrape_latest_bond_draws called with bond_type: {bond_type}")
   
    def parse_draw_date(text):
        try:
            return datetime.strptime(text, "%d-%m-%Y")
        except:
            return None

    try:
        with sync_playwright() as p:
            logger.info("Playwright browser launching...")
            browser = p.chromium.launch(headless=False)
            logger.info("Playwright browser launched successfully")
            page = browser.new_page()
            logger.info("New page created")

            page.goto("https://savings.gov.pk", wait_until="domcontentloaded")
            logger.info("Navigated to savings.gov.pk")

            page.get_by_role("link", name="Download Draws").click()
            logger.info("Clicked 'Download Draws---'")
            page.goto(page.url, wait_until="domcontentloaded")

            # Click correct bond category
            page.get_by_role("link", name=f"Rs. {bond_type} Prize Bond Draw List").click()
            
            page.goto(page.url, wait_until="domcontentloaded")
            logger.info(f"Before clicking the 'a' element, current URL: {page.url}")

            date_elements = page.locator("a").all()
            logger.info(f"Found {len(date_elements)} elements")

            dates = []
            for element in date_elements:
                text = element.inner_text().strip()
                if "-" in text and len(text) == 10:
                    dt = parse_draw_date(text)
                    if dt:
                        dates.append(text)

            logger.info(f"Extracted {len(dates)} dates")
            #just for now i want to check for 2025 since there is none for 2026
            #current_year = datetime.now().year
            current_year = 2025
            current_year_datetimes = []
            for d in dates:
                dt = parse_draw_date(d)
                if dt and dt.year == current_year:
                    current_year_datetimes.append(dt)

            unique_sorted = sorted(set(current_year_datetimes), reverse=True)
            current_year_dates = [dt.strftime("%d-%m-%Y") for dt in unique_sorted]
            logger.info(f"Current year dates: {current_year_dates[:3]}")  # Log first 3

            page.get_by_role("link", name=current_year_dates[0]).click()
            logger.info(f"Clicked latest date: {current_year_dates[0]}")
            page.goto(page.url, wait_until="domcontentloaded")

            result_url = page.url
            logger.info(f"Result URL: {result_url}")
            browser.close()
            logger.info("Browser closed")

        # Download result file
        logger.info("Downloading result file...")
        response = requests.get(result_url)
        response.raise_for_status()
        logger.info(f"Downloaded {len(response.text)} bytes")

        lines = response.text.splitlines()

        data = {
            "first_prize": [],
            "second_prize": [],
            "third_prize": []
        }

        current_section = None
        number_pattern = re.compile(r"\b\d{6}\b")

        for line in lines:

            line = line.strip()

            if not line:
                continue

            if "First Prize" in line:
                current_section = "first_prize"
                continue

            if "Second Prize" in line:
                current_section = "second_prize"
                continue

            if "3rd PRIZES" in line:
                current_section = "third_prize"
                continue

            if current_section:
                numbers = number_pattern.findall(line)
                if numbers:
                    data[current_section].extend(numbers)

        logger.info(f"Extracted prizes - First: {len(data['first_prize'])}, Second: {len(data['second_prize'])}, Third: {len(data['third_prize'])}")
        return data
    
    except Exception as e:
        logger.exception(f"Error in get_latest_draw_results: {str(e)}")
        raise
