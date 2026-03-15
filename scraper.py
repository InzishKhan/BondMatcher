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
            browser = p.chromium.launch(
                headless=False,
                args=["--no-sandbox", "--disable-dev-shm-usage"]
            )
            logger.info("Playwright browser launched successfully")
            page = browser.new_page()
            logger.info("New page created")

            #page.goto("https://savings.gov.pk", wait_until="domcontentloaded")
            #logger.info("Navigated to savings.gov.pk")

            #page.get_by_role("link", name="Download Draws").click()
            #logger.info("Clicked 'Download Draws---'")
            #page.goto(page.url, wait_until="domcontentloaded")

            # Click correct bond category
            #page.get_by_role("link", name=f"Rs. {bond_type} Prize Bond Draw List").click()
            
            #page.goto(page.url, wait_until="domcontentloaded")
            #logger.info(f"Before clicking the 'a' element, current URL: {page.url}")
            # Trying the FASTER APPROACH 
            page.goto(f"https://savings.gov.pk/rs-{bond_type}-prize-bond-draw/", wait_until="domcontentloaded")
            logger.info("Navigated to Direct URL for bond type")

            date_elements = page.locator("a").all()
            logger.info(f"Found {len(date_elements)} elements")

            # Collect all valid draw dates we can find on the page
            all_datetimes = []
            for element in date_elements:
                text = element.inner_text().strip()
                if "-" in text and len(text) == 10:
                    dt = parse_draw_date(text)
                    if dt:
                        all_datetimes.append(dt)

            if not all_datetimes:
                raise RuntimeError("No valid draw dates found on Savings site")

            logger.info(f"Extracted {len(all_datetimes)} possible draw dates")

            # Prefer the latest draw from the *current* year, but if there isn't one yet,
            # automatically fall back to the latest draw from previous years.
            now = datetime.now()
            current_year = now.year

            current_year_datetimes = [dt for dt in all_datetimes if dt.year == current_year]

            if current_year_datetimes:
                chosen_dt = max(current_year_datetimes)
                is_fallback = False
                logger.info(f"Using latest draw in current year {current_year}: {chosen_dt}")
            else:
                chosen_dt = max(all_datetimes)
                is_fallback = True
                logger.info(
                    f"No draws found for current year {current_year}. "
                    f"Falling back to latest available draw: {chosen_dt}"
                )

            chosen_label = chosen_dt.strftime("%d-%m-%Y")

            page.get_by_role("link", name=chosen_label).click()
            logger.info(f"Clicked latest date link: {chosen_label}")
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

        logger.info(
            f"Extracted prizes - First: {len(data['first_prize'])}, "
            f"Second: {len(data['second_prize'])}, Third: {len(data['third_prize'])}"
        )

        meta = {
            "draw_date": chosen_label,
            "draw_year": chosen_dt.year,
            "is_fallback": is_fallback,
        }
        logger.info(f"Draw meta: {meta}")

        # Return both prize data and metadata about which draw was used
        return data, meta
    
    except Exception as e:
        logger.exception(f"Error in get_latest_draw_results: {str(e)}")
        raise
