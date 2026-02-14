from datetime import datetime
from playwright.sync_api import sync_playwright
import requests
import re

def parse_draw_date(text: str):
    try:
        return datetime.strptime(text, "%d-%m-%Y")
    except Exception:
        return None


with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=800)
    page = browser.new_page()

    print("🔵 Opening website...")
    page.goto("https://savings.gov.pk", wait_until="domcontentloaded")

    print("✅ Loaded URL:", page.url)

    page.get_by_role("link", name="Download Draws").click()
    print("🔵 Clicked on 'Download Draws' link:", page.url)
    print("Going to the Download Draws Page..")
    page.goto(page.url, wait_until="domcontentloaded")

    print("Checking for 200 Bond List")
    page.get_by_role("link", name="Rs. 200 Prize Bond Draw List").click()
    page.goto(page.url, wait_until="domcontentloaded")
    print("200 page list:", page.url)

    # Extract anchors and collect date-like texts in dd-mm-yyyy
    date_elements = page.locator("a").all()

    dates = []
    for element in date_elements:
        text = element.inner_text().strip()
        if "-" in text and len(text) == 10:
            dt = parse_draw_date(text)
            if dt:
                dates.append(text)

    print("All Draw Dates:")
    print(dates)

    # Filter for current year only
    current_year = datetime.now().year
    #current_year= 2025
    current_year_datetimes = []
    for d in dates:
        dt = parse_draw_date(d)
        if dt and dt.year == current_year:
            current_year_datetimes.append(dt)

    # Deduplicate and sort (newest first)
    unique_sorted = sorted(set(current_year_datetimes), reverse=True)
    current_year_dates = [dt.strftime("%d-%m-%Y") for dt in unique_sorted]

    print(f"Current year ({current_year}) draw dates:")
    print(current_year_dates)
    page.get_by_role("link", name=current_year_dates[0]).click()
    page.goto(page.url, wait_until="domcontentloaded")
    print("going to the last date page:", page.url)

    # Extracting the Extact recent date draw results -FINAL STAGE


    browser.close()
print("After the page is closed:", page.url)

URL = page.url

response = requests.get(URL, timeout=10)
response.raise_for_status()

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

    # Extract numbers only if we're inside a section
    if current_section:
        numbers = number_pattern.findall(line)
        if numbers:
            data[current_section].extend(numbers)

print("First Prize:", data["first_prize"])
print("Second Prize:", data["second_prize"])
print("Third Prize (first 10 numbers):", data["third_prize"][:10])
print("Third Prize total count:", len(data["third_prize"]))