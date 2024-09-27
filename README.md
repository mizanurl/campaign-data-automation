# Campaign Data Automation

## Setup Instructions

1. Unzip the attached zip file and open the folder in your terminal.
2. Install dependencies
   ```sh
   npm install
   ```
3. Start the server
   ```sh
   npm start
   ```
4. We need to create our app's endpoint so that we can capture events from the Facebook Ads. Download ngrok (https://ngrok.com/docs/getting-started/?os=windows) and run the following command:
   ```sh
   ngrok http 3000
   ```
   This will generate an endpoint, something like "https://1eb2-181-80-12-3.ngrok.app".
5. Open a browser and open http://127.0.0.1:4040. Ngrok's dashboard will be displayed, where you can see the endpoint in action.
6. Go to the Facebook App's Webhooks settings page (https://developers.facebook.com/apps/843028491312469/webhooks/?business_id=993892001993094) and add the endpoint to the Callback URL field. Verify this with the VERIFY_TOKEN available in the config.env file. If the configuration saved successfully, you will 200 Status Code (success) at http://127.0.0.1:4040; otherwise 403 status (forbidden).
7. Now, you can test the webhook by clicking the 'Send Message' button from the app's Facebook Page, like https://web.facebook.com/story.php?story_fbid=pfbid0bZ76Qv1tpDSuqRYCNGTAkDbG5aj2a9LrwNQqggQaRg15ScqAw5UxWNRdGgbEW4yEl&id=61561752017953&_rdc=3&_rdr. Check both the ngrok's endpoint and the console message where the node server is running. If the event data captured by the app's webhook sent to the GHL Webhook, then you'll see the message 'Data sent to the webhook: Accepted'.

## Configurations

Open the 'config.env' file to check the following:

- VERIFY_TOKEN - A simple string to verify the server's webhook setup from Facebook App's Webhooks settings page.
- PAGE_ACCESS_TOKEN - Generated long-lived page access token based on selectd access permissions
- WEBHOOK_URL - GHL Webhook

## Required Permissions

- `ads_management`: Required for fetch Ads account information.
- `ads_read`: Web events to put Ad Campaign, Ad Set, and Ad name.
- `pages_messaging`: In order to access Page conversations in Messenger.
- `instagram_basic`: To read user's Instagram account profile's info
- `leads_retrieval`: For capturing lead information to reach out to the user.
- `pages_manage_metadata`: To subscribe and receive webhooks about activity on the Page.
- `instagram_manage_events`: This is rerquired to get events on behalf of Instagram accounts administered by the app’s users.
- `public_profile`: To get the public profile of the user, like first name, last name, etc.

## Webhook Subscriptions:

- `bio`
- `birthday`
- `description`
- `general_info`
- `hometown`
- `location`
- `messages`
- `messaging_customer_information`
- `messaging_postbacks`
- `name`
- `personal_info`
- `messaging_postbacks`

## Limitations:

- Not all the required information, specially regarding ad data could not be retrieved as the app is in Development mode. To get some sample data, an example Ad Id is used in line# 32 of index.js file. When the app is live, it is suggested to remove the if block from line# 31 to 33.
- Attribution Channel (e.g., Instagram DM, Facebook Messenger, WhatsApp) could not be retrieved, as the documentaion to fetch such data is not available in the Facebook Graph API doc page.
