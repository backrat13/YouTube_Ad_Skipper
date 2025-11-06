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

