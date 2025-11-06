<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1GtR1k-Ylk-iGQcgNHJgSBR6w1QNAPYYB

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`



1.)  Install Prerequisites

This script requires Python 3, pip, and a few Python packages. Open your terminal and run the following command to install the necessary libraries:  

pip install --upgrade pip selenium loguru


2.) Launch a Debuggable Browser

Close all instances of Chrome or Chromium. Then, launch a new one from your terminal with the remote debugging port enabled. This allows the script to connect to it.

RUN:  
chromium-browser --remote-debugging-port=9222 --user-data-dir=~/.config/chromium/RDP_Profile
*In a separete window from where the python script is about to be ran*

3.)  RUN THE PYTHON SCRIPT



#!/usr/bin/env python3
"""
YT Ad-Skip Script - RDP Attachment Mode (Fixed for Chromium/Chrome)

This script ATTACHES to a running browser instance opened with the
--remote-debugging-port=9222 flag. It does NOT launch a new browser.

Instructions:
1. Close all existing Chromium/Chrome windows.
2. Launch browser from terminal (see app instructions).
3. Open a YouTube video in that browser.
4. Run this script: python3 yt_ad_skipper.py
"""
import time
import sys
from loguru import logger
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    ElementClickInterceptedException,
    StaleElementReferenceException,
    NoSuchWindowException,
    WebDriverException,
)

# --- Configuration ---
RDP_ADDRESS = "127.0.0.1:9222"
WAIT_TIMEOUT = 0.25  # How long to wait for a button to appear (seconds)
POLL_DELAY = 0.5     # How long to poll between checks (seconds)

# --- Locators (Highly robust list for 2025) ---
SKIP_BUTTON_LOCATORS = [
    (By.CLASS_NAME, "ytp-ad-skip-button-modern"),
    (By.CLASS_NAME, "ytp-ad-skip-button-renderer"),
    (By.CLASS_NAME, "ytp-ad-skip-button"),
    (By.XPATH, "//*[contains(text(), 'Skip Ad') or contains(text(), 'Skip ad')]"),
]

CLOSE_BUTTON_LOCATORS = [
    (By.CLASS_NAME, "ytp-ad-overlay-close-button"),
    (By.CSS_SELECTOR, ".ytp-ad-text-overlay .close-button"),
]

AD_PLAYER_LOCATOR = (By.CSS_SELECTOR, ".ytp-ad-player-overlay, .ytp-ad-text")

# --- Functions ---

def setup_logging():
    """Configures the logger for console and file output."""
    logger.remove()
    logger.add(
        sys.stderr,
        level="INFO",
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>",
    )
    logger.add(
        "yt_skipper_rdp.log",
        level="DEBUG",
        rotation="10 MB",
        format="{time} {level} {message}",
    )
    logger.info("Logging configured.")

def attach_driver(address: str):
    """Attempts to attach the Selenium session to a browser running with RDP."""
    logger.info(f"Attempting to attach to running Chromium/Chrome on RDP address: {address}")
    try:
        options = ChromeOptions()
        options.add_experimental_option("debuggerAddress", address)
        service = ChromeService()
        driver = webdriver.Chrome(service=service, options=options)

        if not driver.window_handles:
            raise Exception("No active browser windows found. Did you open Chromium first?")

        driver.switch_to.window(driver.window_handles[0])
        logger.success("Successfully attached to running browser session!")
        logger.info(f"Current URL: {driver.current_url}")
        return driver
    except WebDriverException as e:
        logger.error(f"Failed to attach to the RDP port {address}.")
        logger.error("Is your Chromium instance running with the --remote-debugging-port=9222 flag?")
        logger.error(f"Error details: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"An unexpected error occurred during attachment: {e}")
        sys.exit(1)

def try_close_overlay(driver) -> bool:
    """Tries to find and click the close button on an ad banner/overlay."""
    for strategy, locator in CLOSE_BUTTON_LOCATORS:
        try:
            btn = WebDriverWait(driver, WAIT_TIMEOUT).until(
                EC.element_to_be_clickable((strategy, locator))
            )
            if btn and btn.is_displayed() and btn.is_enabled():
                logger.info(f"Overlay close button found: {locator}")
                driver.execute_script("arguments[0].click();", btn)
                logger.info("Ad overlay dismissed!")
                return True
        except TimeoutException:
            continue
        except Exception as exc:
            logger.warning(f"Failed to close overlay with {locator}: {exc}")
    return False

def try_skip_ad(driver) -> bool:
    """Tries to find and click a skip button."""
    for strategy, locator in SKIP_BUTTON_LOCATORS:
        try:
            btn = WebDriverWait(driver, WAIT_TIMEOUT).until(
                EC.element_to_be_clickable((strategy, locator))
            )
            if btn and btn.is_displayed() and btn.is_enabled():
                logger.success(f"Skip button found: {locator}")
                try:
                    btn.click()
                except (ElementClickInterceptedException, StaleElementReferenceException):
                    logger.warning("Click intercepted! Falling back to JavaScript click.")
                    driver.execute_script("arguments[0].click();", btn)
                logger.info("Ad skipped!")
                return True
        except TimeoutException:
            continue
        except Exception as exc:
            logger.error(f"Unexpected error for {strategy}/{locator}: {exc}")
    return False

def check_for_ad_presence(driver):
    """Checks for the presence of the main ad indicator element."""
    try:
        WebDriverWait(driver, 0.1).until(
            EC.presence_of_element_located(AD_PLAYER_LOCATOR)
        )
        return True
    except TimeoutException:
        return False
    except Exception as e:
        logger.error(f"Error checking ad presence: {e}")
        return False

def main_loop(driver):
    """The main polling loop to check for and handle ads."""
    logger.info(f"Starting main loop. Polling active tab for ads every {POLL_DELAY}s...")
    logger.info("Press Ctrl-C in this terminal to stop the script.")
    try:
        while True:
            try:
                _ = driver.title  # Check if browser window is still open
            except NoSuchWindowException:
                logger.warning("Browser window was closed by user. Shutting down.")
                break

            if try_skip_ad(driver):
                time.sleep(1)
            elif try_close_overlay(driver):
                time.sleep(0.5)
            elif check_for_ad_presence(driver):
                logger.debug("Unskippable or regular ad detected. Waiting for it to pass...")
                time.sleep(POLL_DELAY)
            else:
                time.sleep(POLL_DELAY)

    except KeyboardInterrupt:
        logger.info("User stopped script (Ctrl-C).")
    except Exception as e:
        logger.error(f"Main loop crashed: {e}")
    finally:
        logger.info("Detaching from browser (browser will remain open)...")
        sys.exit(0)

if __name__ == "__main__":
    setup_logging()
    driver = attach_driver(RDP_ADDRESS)
    main_loop(driver)


